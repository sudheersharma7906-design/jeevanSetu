// server/tests/verify-security.js
import { server } from '../index.js';
import { db } from '../data/db.js';

const PORT = 5009; // dedicated security test port
const BASE_URL = `http://localhost:${PORT}/api`;

let patient1Token = '';
let patient2Token = '';
let doctorToken = '';
let rmpToken = '';
let adminToken = '';

async function runSecurityTests() {
  console.log('\n🔒 =======================================================');
  console.log('   JIVANSETU MVP SECURITY BASELINE AUTOMATED TEST SUITE');
  console.log('=======================================================\n');

  // Start test server instance
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[SECURITY RUNNER] Server listening on security test port ${PORT}\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}\n`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // 1. Security Headers & Baseline Metadata Verification
    // ----------------------------------------------------
    await test('Security Headers: HSTS, nosniff, X-Frame-Options, CSP (GET /api/health)', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      const hsts = res.headers.get('strict-transport-security');
      const nosniff = res.headers.get('x-content-type-options');
      const xframe = res.headers.get('x-frame-options');
      const csp = res.headers.get('content-security-policy');

      if (!hsts || !hsts.includes('max-age')) throw new Error(`Missing or invalid HSTS header: ${hsts}`);
      if (nosniff !== 'nosniff') throw new Error(`Missing X-Content-Type-Options: ${nosniff}`);
      if (xframe !== 'SAMEORIGIN') throw new Error(`Missing X-Frame-Options: ${xframe}`);
      if (!csp) throw new Error('Missing Content-Security-Policy header');

      const data = await res.json();
      if (!data.securityBaseline || !data.securityBaseline.jwtSessionAuth) {
        throw new Error('Security baseline metadata missing from health response.');
      }
    });

    // ----------------------------------------------------
    // 2. Password-Based Login Test Matrix & Role Validation (Section 30 of PRD)
    // ----------------------------------------------------
    await test('Password Login: Valid Patient Credentials (POST /api/auth/login)', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', password: 'DemoPass@123', role: 'patient' })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || !data.token) {
        throw new Error(`Patient password login failed: ${JSON.stringify(data)}`);
      }
      patient1Token = data.token;
    });

    await test('Password Login: Wrong Password returns 401 Unauthorized', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', password: 'wrongpassword', role: 'patient' })
      });
      const data = await res.json();
      if (res.status !== 401 || data.success !== false) {
        throw new Error(`Expected 401 for wrong password, got status ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    await test('Password Login: Patient Account + Doctor Role returns 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', password: 'DemoPass@123', role: 'doctor' })
      });
      const data = await res.json();
      if (res.status !== 403 || data.success !== false) {
        throw new Error(`Expected 403 for role mismatch, got status ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    await test('Password Login: Doctor Account + Patient Role returns 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543401', password: 'DemoPass@123', role: 'patient' })
      });
      const data = await res.json();
      if (res.status !== 403 || data.success !== false) {
        throw new Error(`Expected 403 for doctor account as patient, got status ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    // Obtain tokens for other roles via password login
    const resPat2 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543220', password: 'DemoPass@123', role: 'patient' })
    });
    patient2Token = (await resPat2.json()).token;

    const resDoc = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543401', password: 'DemoPass@123', role: 'doctor' })
    });
    doctorToken = (await resDoc.json()).token;

    const resRmp = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543301', password: 'DemoPass@123', role: 'rmp' })
    });
    rmpToken = (await resRmp.json()).token;

    const resAdm = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543999', password: 'DemoPass@123', role: 'admin' })
    });
    adminToken = (await resAdm.json()).token;

    await test('OTP Brute-Force Protection: Lockout after consecutive failed attempts', async () => {
      const attackPhone = '9876540099';
      // Request active OTP
      await fetch(`${BASE_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: attackPhone, role: 'patient' })
      });

      // Submit 5 invalid attempts
      for (let i = 0; i < 5; i++) {
        await fetch(`${BASE_URL}/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: attackPhone, otp: '999999' })
        });
      }

      // 6th attempt must be locked out
      const lockedRes = await fetch(`${BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: attackPhone, otp: '123456' })
      });
      const lockedData = await lockedRes.json();
      if (lockedRes.status !== 400 || !lockedData.error.includes('locked')) {
        throw new Error(`Account failed to lock out on brute-force attempts: ${JSON.stringify(lockedData)}`);
      }
    });

    // ----------------------------------------------------
    // 3. JWT Session Lifecycle: Refresh & Logout Revocation
    // ----------------------------------------------------
    let refreshedToken = '';
    await test('JWT Session: Refresh Short-Lived Token (POST /api/auth/refresh)', async () => {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient1Token}`
        },
        body: JSON.stringify({ token: patient1Token })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || !data.token) {
        throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
      }
      refreshedToken = data.token;
    });

    await test('JWT Session: Logout & Invalidate Session (POST /api/auth/logout)', async () => {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshedToken}`
        },
        body: JSON.stringify({ token: refreshedToken })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success) {
        throw new Error(`Logout failed: ${JSON.stringify(data)}`);
      }

      // Using revoked token on protected route must return 401
      const testRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${refreshedToken}` }
      });
      if (testRes.status !== 401) {
        throw new Error(`Revoked token was not rejected! Status: ${testRes.status}`);
      }
    });

    // Re-authenticate patient 1 for subsequent RBAC tests
    const reAuth = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', password: 'DemoPass@123', role: 'patient' })
    });
    patient1Token = (await reAuth.json()).token;

    // ----------------------------------------------------
    // 4. Role-Based Access Control (RBAC) Enforcement
    // ----------------------------------------------------
    await test('RBAC: Patient CANNOT access another patient records (403 Forbidden)', async () => {
      // Patient 1 (pat-101) attempting to access Patient 2 (pat-102) records
      const res = await fetch(`${BASE_URL}/records/pat-102`, {
        headers: { 'Authorization': `Bearer ${patient1Token}` }
      });
      const data = await res.json();
      if (res.status !== 403 || data.success !== false) {
        throw new Error(`Expected 403 Forbidden for patient cross-access, got status ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    await test('RBAC: Patient CAN access own health records (200 OK)', async () => {
      const res = await fetch(`${BASE_URL}/records/pat-101`, {
        headers: { 'Authorization': `Bearer ${patient1Token}` }
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || !Array.isArray(data.records)) {
        throw new Error(`Patient could not fetch own records: ${JSON.stringify(data)}`);
      }
    });

    await test('RBAC: Patient CANNOT browse community patient directory (403 Forbidden)', async () => {
      const res = await fetch(`${BASE_URL}/users/patients/all`, {
        headers: { 'Authorization': `Bearer ${patient1Token}` }
      });
      const data = await res.json();
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for patient directory access, got status ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    await test('RBAC: Patient CANNOT issue prescriptions (403 Forbidden)', async () => {
      const res = await fetch(`${BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient1Token}`
        },
        body: JSON.stringify({
          patientId: 'pat-101',
          diagnosis: 'Self diagnosed headache',
          medications: [{ name: 'Paracetamol 500mg', dosage: '1 tab' }]
        })
      });
      const data = await res.json();
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for patient prescription issue, got ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    await test('RBAC: Doctor CAN issue prescriptions (201 Created)', async () => {
      const res = await fetch(`${BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctorToken}`
        },
        body: JSON.stringify({
          patientId: 'pat-101',
          diagnosis: 'Essential Hypertension',
          medications: [{ name: 'Telmisartan 40mg', dosage: '1 Tab daily', duration: '30 Days' }]
        })
      });
      const data = await res.json();
      if (res.status !== 201 || !data.success || !data.prescription.id) {
        throw new Error(`Doctor could not issue prescription: ${JSON.stringify(data)}`);
      }
    });

    await test('RBAC: Non-admin CANNOT access Admin Dashboard Stats (403 Forbidden)', async () => {
      const res = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${patient1Token}` }
      });
      const data = await res.json();
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for non-admin on admin route, got ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    await test('RBAC: Admin CAN access Admin Dashboard Stats (200 OK)', async () => {
      const res = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success) {
        throw new Error(`Admin could not fetch stats: ${JSON.stringify(data)}`);
      }
    });

    // ----------------------------------------------------
    // 5. Geolocation Privacy: Explicit SOS-Trigger Only
    // ----------------------------------------------------
    await test('Location Privacy: Explicit SOS Trigger Metadata (POST /api/emergency/sos)', async () => {
      const res = await fetch(`${BASE_URL}/emergency/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient1Token}`
        },
        body: JSON.stringify({
          patientId: 'pat-101',
          latitude: 19.6542,
          longitude: 73.1389,
          symptoms: 'Sudden chest discomfort'
        })
      });
      const data = await res.json();
      if (res.status !== 201 || !data.success) {
        throw new Error(`SOS trigger failed: ${JSON.stringify(data)}`);
      }
      if (!data.privacyPolicy || !data.privacyPolicy.includes('explicit emergency SOS trigger only')) {
        throw new Error(`Explicit location privacy assurance missing in response: ${JSON.stringify(data)}`);
      }
    });

    // ----------------------------------------------------
    // 6. Universal Input Sanitization & Anti-Injection
    // ----------------------------------------------------
    await test('Input Sanitization: Strip NoSQL operators and XSS script tags', async () => {
      const maliciousPayload = {
        patientId: 'pat-101',
        symptoms: "<script>alert('xss')</script>Sudden breathless feeling",
        // NoSQL injection attempts
        '$where': 'sleep(5000)',
        'nested.$gt': 100
      };

      const res = await fetch(`${BASE_URL}/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient1Token}`
        },
        body: JSON.stringify(maliciousPayload)
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success) {
        throw new Error(`Triage with malicious payload failed: ${JSON.stringify(data)}`);
      }

      // Verify that script tag was stripped from evaluated symptoms
      if (data.triage && data.triage.symptoms && data.triage.symptoms.includes('<script>')) {
        throw new Error(`XSS script tag was not stripped by sanitizer! Result: ${data.triage.symptoms}`);
      }
    });

    await test('Schema Validator: Reject invalid phone numbers and missing required fields', async () => {
      const res = await fetch(`${BASE_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '12345', role: 'patient' }) // invalid phone (<10 digits, does not start with 6-9)
      });
      const data = await res.json();
      if (res.status !== 400 || !data.invalidFields || !data.invalidFields.includes('phone')) {
        throw new Error(`Validation failed to reject invalid phone number: ${JSON.stringify(data)}`);
      }
    });

  } finally {
    // Graceful close of test server instance
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n=======================================================');
  console.log(`  SECURITY TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityTests().catch((err) => {
  console.error('Fatal Security Test Suite error:', err);
  process.exit(1);
});
