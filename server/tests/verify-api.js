// server/tests/verify-api.js
import { server } from '../index.js';

const PORT = 5005; // Use dedicated test port to avoid collision
const BASE_URL = `http://localhost:${PORT}/api`;

let jwtToken = '';
let createdEmergencyId = '';
let createdConsultId = '';
let createdPrescriptionId = '';

async function runTests() {
  console.log('\n🧪 =======================================================');
  console.log('   JIVANSETU BACKEND COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('=======================================================\n');

  // Start test server instance
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[TEST RUNNER] Server listening on test port ${PORT}\n`);

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
    // 1. Health Check
    await test('Health Check Endpoint (GET /api/health)', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      const data = await res.json();
      if (res.status !== 200 || data.status !== 'healthy') {
        throw new Error(`Unexpected health status: ${JSON.stringify(data)}`);
      }
    });

    // 2. Auth Service - Sign Up / Registration (POST /api/auth/signup)
    await test('Auth Service - Sign Up / User Registration (POST /api/auth/signup)', async () => {
      const uniquePhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nikhil Shinde',
          phone: uniquePhone,
          password: 'securePassword456',
          role: 'patient',
          village: 'Vikramgad Block'
        })
      });
      const data = await res.json();
      if (res.status !== 201 || !data.success || !data.user) {
        throw new Error(`Failed to sign up: ${JSON.stringify(data)}`);
      }

      // Verify login with newly registered user
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: uniquePhone, password: 'securePassword456', role: 'patient' })
      });
      const loginData = await loginRes.json();
      if (loginRes.status !== 200 || !loginData.success || !loginData.token) {
        throw new Error(`Failed to login with newly registered user: ${JSON.stringify(loginData)}`);
      }
    });

    // 3. Auth Service - Password Login & JWT Issuance with Seed User
    await test('Auth Service - Password Login & JWT Issuance (POST /api/auth/login)', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', password: 'password123', role: 'patient' })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || !data.token) {
        throw new Error(`Failed to login with password: ${JSON.stringify(data)}`);
      }
      jwtToken = data.token;
    });

    // 3b. Auth Service - Reject Wrong Password
    await test('Auth Service - Reject Incorrect Password (400 Bad Request)', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', password: 'WRONG_PASSWORD_XYZ', role: 'patient' })
      });
      const data = await res.json();
      if (res.status === 200 || data.success === true) {
        throw new Error('Expected 400 rejection for incorrect password, but got 200 OK');
      }
    });

    // 3c. Auth Service - Reject Unregistered Mobile Number
    await test('Auth Service - Reject Unregistered Mobile Number (400 Bad Request)', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9999900000', password: 'password123', role: 'patient' })
      });
      const data = await res.json();
      if (res.status === 200 || data.success === true) {
        throw new Error('Expected 400 rejection for unregistered mobile number, but got 200 OK');
      }
    });

    // 4. Auth Service - Authenticated Me Endpoint
    await test('Auth Service - Get Current User (GET /api/auth/me)', async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || data.user.phone !== '9876543210') {
        throw new Error(`Failed to fetch current user profile: ${JSON.stringify(data)}`);
      }
    });

    // 5. User Service - Get Patient by ID
    await test('User Service - Get Patient Profile (GET /api/patients/:id)', async () => {
      const res = await fetch(`${BASE_URL}/patients/pat-101`);
      const data = await res.json();
      if (res.status !== 200 || !data.success || data.patient.id !== 'pat-101') {
        throw new Error(`Failed to fetch patient: ${JSON.stringify(data)}`);
      }
    });

    // 6. User Service - Geo Query Nearest RMPs
    await test('User Service - Query Nearby RMPs (GET /api/users/rmps/nearby)', async () => {
      const res = await fetch(`${BASE_URL}/users/rmps/nearby?lat=19.6542&lng=73.1389&radius=30`);
      const data = await res.json();
      if (res.status !== 200 || !data.success || !Array.isArray(data.rmps) || data.rmps.length === 0) {
        throw new Error(`Failed to query nearby RMPs: ${JSON.stringify(data)}`);
      }
      if (data.rmps[0].distanceKm == null) {
        throw new Error('Distance in km not calculated properly.');
      }
    });

    // 7. Triage Service - Red Flag Emergency Scoring
    await test('Triage Service - Red Flag Critical Evaluation (POST /api/triage)', async () => {
      const res = await fetch(`${BASE_URL}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-101',
          symptoms: 'Severe crushing chest pain radiating to left arm and sweating (सीने में तेज दर्द और पसीना)',
          vitals: { bp: '150/95', spo2: '91', temp: '98.6' },
          painScale: 9
        })
      });
      const data = await res.json();
      if (
        res.status !== 200 ||
        !data.success ||
        !data.isAssistiveTriage ||
        data.isDiagnosis !== false ||
        !data.disclaimer ||
        data.triage.urgency !== 'EMERGENCY' ||
        data.triage.score < 80 ||
        !data.triage.requiresImmediateSos
      ) {
        throw new Error(`Triage evaluation failed emergency criteria: ${JSON.stringify(data)}`);
      }
    });

    // 7b. Triage Service - Venomous Snakebite Combination Evaluation
    await test('Triage Service - Venomous Snakebite Priority Scoring (POST /api/triage)', async () => {
      const res = await fetch(`${BASE_URL}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-103',
          symptoms: 'Patient suffered venomous snake bite on right foot with swelling and pain (सर्पदंश)',
          vitals: { bp: '130/85', spo2: '96', pulse: '110' },
          painScale: 8
        })
      });
      const data = await res.json();
      if (
        res.status !== 200 ||
        !data.success ||
        data.triage.urgency !== 'EMERGENCY' ||
        data.triage.score < 90 ||
        !data.triage.requiresImmediateSos
      ) {
        throw new Error(`Snakebite emergency scoring failed: ${JSON.stringify(data)}`);
      }
    });

    // 8. Triage Service - Moderate Flag Scoring
    await test('Triage Service - Moderate Urgent Case Evaluation (POST /api/triage)', async () => {
      const res = await fetch(`${BASE_URL}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-102',
          symptoms: 'High fever for 4 days with chills and shivering (तेज बुखार और कंपकंपी)',
          notes: 'Severe body ache and headache',
          vitals: { bp: '120/80', spo2: '97', temp: '102.5' },
          painScale: 4
        })
      });
      const data = await res.json();
      if (
        res.status !== 200 ||
        !data.success ||
        data.triage.urgency !== 'URGENT' ||
        !data.isAssistiveTriage ||
        data.isDiagnosis !== false
      ) {
        throw new Error(`Triage evaluation failed moderate criteria: ${JSON.stringify(data)}`);
      }
    });

    // 8b. Triage Service - Routine / Mild Condition Scoring
    await test('Triage Service - Routine Mild Condition Scoring (POST /api/triage)', async () => {
      const res = await fetch(`${BASE_URL}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-101',
          symptoms: 'Mild cold and runny nose since 2 days (हल्की सर्दी जुकाम)',
          vitals: { bp: '120/80', spo2: '98', temp: '98.4', pulse: '74' },
          painScale: 1
        })
      });
      const data = await res.json();
      if (
        res.status !== 200 ||
        !data.success ||
        data.triage.urgency !== 'ROUTINE' ||
        data.triage.score > 40
      ) {
        throw new Error(`Routine triage evaluation failed: ${JSON.stringify(data)}`);
      }
    });

    // 8c. Triage Service - Engine Info & Post-MVP ML Classifier Upgrade Test
    await test('Triage Service - Engine Metadata & Post-MVP Classifier Integration', async () => {
      const infoRes = await fetch(`${BASE_URL}/triage/engine/info`);
      const infoData = await infoRes.json();
      if (infoRes.status !== 200 || !infoData.success || !infoData.engine.isAssistiveTriage) {
        throw new Error(`Failed to query triage engine info: ${JSON.stringify(infoData)}`);
      }

      // Test post-MVP ML classifier pluggable execution without breaking API contract
      const mlRes = await fetch(`${BASE_URL}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-102',
          symptoms: 'Acute abdominal pain with vomiting since morning',
          engineType: 'ml_classifier'
        })
      });
      const mlData = await mlRes.json();
      if (
        mlRes.status !== 200 ||
        !mlData.success ||
        !mlData.isAssistiveTriage ||
        mlData.triage.engineMetadata.type !== 'hybrid_nlp_classifier'
      ) {
        throw new Error(`Post-MVP ML classifier evaluation failed: ${JSON.stringify(mlData)}`);
      }
    });

    // 9. Consult Service - Escalation Request
    await test('Consult Service - Escalate Patient Case (POST /api/consult/escalate)', async () => {
      const res = await fetch(`${BASE_URL}/consult/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-101',
          rmpId: 'rmp-201',
          targetSpecialty: 'Cardiology',
          symptoms: 'Exertional chest tightness, hypertensive spikes',
          vitals: { bp: '145/92', spo2: '97%' },
          urgency: 'URGENT',
          notes: 'Requesting expert cardiologist teleconsultation.'
        })
      });
      const data = await res.json();
      if (res.status !== 201 || !data.success || !data.consult.id) {
        throw new Error(`Failed to escalate case: ${JSON.stringify(data)}`);
      }
      createdConsultId = data.consult.id;
    });

    // 10. Consult Service - View Queue
    await test('Consult Service - View Queue (GET /api/consult/queue)', async () => {
      const res = await fetch(`${BASE_URL}/consult/queue?specialty=Cardiology`);
      const data = await res.json();
      if (res.status !== 200 || !data.success || !Array.isArray(data.queue)) {
        throw new Error(`Failed to get consult queue: ${JSON.stringify(data)}`);
      }
    });

    // 11. Prescription Service - Create Digital Prescription with Signature
    await test('Prescription Service - Issue Digital Rx with Hash (POST /api/consult/:id/prescribe)', async () => {
      const res = await fetch(`${BASE_URL}/consult/${createdConsultId}/prescribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-101',
          doctorId: 'doc-301',
          diagnosis: 'Hypertensive Heart Disease / Angina Pectoris',
          medications: [
            {
              name: 'Tab. Telmisartan 40mg',
              dosage: '1 Tab',
              frequency: 'Once Daily (Morning)',
              duration: '30 Days',
              instructions: 'Take after breakfast'
            },
            {
              name: 'Tab. Sorbitrate 5mg',
              dosage: '1 Tab',
              frequency: 'Sublingual SOS',
              duration: '10 Tabs',
              instructions: 'Dissolve under tongue during acute chest discomfort'
            }
          ],
          dietaryAdvice: 'Strict low salt, avoid strenuous manual labor until review.',
          followUpDate: '2026-03-30'
        })
      });
      const data = await res.json();
      if (
        res.status !== 201 ||
        !data.success ||
        !data.prescription.digitalSignature ||
        !data.prescription.digitalSignature.startsWith('SIG_SHA256_')
      ) {
        throw new Error(`Failed to generate digital prescription: ${JSON.stringify(data)}`);
      }
      createdPrescriptionId = data.prescription.id;
    });

    // 12. Prescription Service - Verify Digital Signature
    await test('Prescription Service - Verify Authenticity (GET /api/prescriptions/:id/verify)', async () => {
      const res = await fetch(`${BASE_URL}/prescriptions/${createdPrescriptionId}/verify`);
      const data = await res.json();
      if (res.status !== 200 || !data.success || data.verification.verificationStatus !== 'AUTHENTIC_VERIFIED') {
        throw new Error(`Prescription verification failed: ${JSON.stringify(data)}`);
      }
    });

    // 13. Record Service - Append-Only Patient Health Timeline
    await test('Record Service - Fetch Patient EHR Timeline (GET /api/records/:patientId)', async () => {
      const res = await fetch(`${BASE_URL}/records/pat-101`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || !Array.isArray(data.records) || data.records.length === 0) {
        throw new Error(`Failed to fetch health timeline: ${JSON.stringify(data)}`);
      }
    });

    // 14. Emergency Service - Trigger SOS Alert with Geo-matching
    await test('Emergency Service - Trigger SOS (POST /api/emergency/sos)', async () => {
      const res = await fetch(`${BASE_URL}/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'pat-101',
          triggerType: 'BUTTON',
          symptoms: 'Patient collapsed with sudden chest crushing pain',
          latitude: 19.6542,
          longitude: 73.1389,
          address: 'Wada Rural Center, Palghar'
        })
      });
      const data = await res.json();
      if (
        res.status !== 201 ||
        !data.success ||
        !data.emergency.id ||
        !data.emergency.matchedRmp ||
        data.emergency.status !== 'NOTIFIED'
      ) {
        throw new Error(`Failed to trigger emergency SOS: ${JSON.stringify(data)}`);
      }
      createdEmergencyId = data.emergency.id;
    });

    // 15. Emergency Service - Status & Acceptance Flow
    await test('Emergency Service - RMP Accept SOS (POST /api/emergency/:id/accept)', async () => {
      const res = await fetch(`${BASE_URL}/emergency/${createdEmergencyId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rmpId: 'rmp-201' })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || data.emergency.status !== 'ACCEPTED') {
        throw new Error(`Failed to accept emergency SOS: ${JSON.stringify(data)}`);
      }
    });

    // 16. Emergency Service - Escalate SOS
    await test('Emergency Service - Escalate SOS to Tier 2 (POST /api/emergency/:id/escalate)', async () => {
      const res = await fetch(`${BASE_URL}/emergency/${createdEmergencyId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Severe ECG anomaly noted by RMP - Transferring to Taluka Trauma Care',
          targetTier: 2
        })
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success || data.emergency.status !== 'ESCALATED' || data.emergency.tier !== 2) {
        throw new Error(`Failed to escalate emergency: ${JSON.stringify(data)}`);
      }
    });

    // 17. Notification Service - Send Alert
    await test('Notification Service - Send Push & SMS Alert (POST /api/notifications/send)', async () => {
      const res = await fetch(`${BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 'pat-101',
          recipientPhone: '9876543210',
          type: 'FOLLOWUP_REMINDER',
          title: 'Upcoming Teleconsultation Reminder',
          message: 'Your cardiologist teleconsultation is scheduled in 15 minutes.'
        })
      });
      const data = await res.json();
      if (res.status !== 201 || !data.success || !data.notification.id) {
        throw new Error(`Failed to dispatch notification: ${JSON.stringify(data)}`);
      }
    });

    // 18. Admin Service - Platform Stats & Emergency Audit Logs
    await test('Admin Service - Dashboard Stats & Audit Logs (GET /api/admin/stats)', async () => {
      const resStats = await fetch(`${BASE_URL}/admin/stats`);
      const dataStats = await resStats.json();
      if (resStats.status !== 200 || !dataStats.success || !dataStats.stats.counts.totalUsers) {
        throw new Error(`Failed to fetch admin stats: ${JSON.stringify(dataStats)}`);
      }

      const resLogs = await fetch(`${BASE_URL}/admin/emergency-logs`);
      const dataLogs = await resLogs.json();
      if (resLogs.status !== 200 || !dataLogs.success || !Array.isArray(dataLogs.logs)) {
        throw new Error(`Failed to fetch emergency logs: ${JSON.stringify(dataLogs)}`);
      }
    });

  } finally {
    // Close server
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n=======================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
