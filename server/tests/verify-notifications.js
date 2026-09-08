// server/tests/verify-notifications.js
import { server } from '../index.js';
import { SmsService } from '../modules/notification/sms.service.js';
import { NotificationService } from '../modules/notification/notification.service.js';
import { db } from '../data/db.js';

const PORT = 5007;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runNotificationTests() {
  console.log('\n📡 =======================================================');
  console.log('   JIVANSETU REAL-TIME & NOTIFICATIONS TEST SUITE');
  console.log('=======================================================\n');

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[TEST RUNNER] Server running on port ${PORT} for Notification tests\n`);

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
    // 1. Direct SmsService Unit Test
    await test('SmsService: Outbound SMS Carrier Dispatch', async () => {
      const receipt = await SmsService.sendSms({
        to: '+91 98112 34567',
        message: '🚨 Test Emergency SMS alert to RMP',
        recipientName: 'Dr. Anand Verma'
      });
      if (!receipt.sid || !receipt.sid.startsWith('SM')) {
        throw new Error(`Invalid SMS SID: ${receipt.sid}`);
      }
      if (receipt.status !== 'DELIVERED') {
        throw new Error(`Expected DELIVERED status, got: ${receipt.status}`);
      }
    });

    // 2. Direct WhatsApp Carrier Test
    await test('SmsService: Outbound WhatsApp Business API Dispatch', async () => {
      const receipt = await SmsService.sendWhatsApp({
        to: '+91 98112 34567',
        message: '🚨 *Test WhatsApp Emergency Alert*',
        recipientName: 'Dr. Anand Verma'
      });
      if (!receipt.sid || !receipt.sid.startsWith('WA')) {
        throw new Error(`Invalid WhatsApp SID: ${receipt.sid}`);
      }
      if (receipt.channel !== 'WHATSAPP') {
        throw new Error(`Expected channel WHATSAPP, got: ${receipt.channel}`);
      }
    });

    // 3. Offline RMP Emergency Alert Dispatch
    await test('SmsService: Dual-Channel Offline RMP SOS Fallback', async () => {
      const mockRmp = { name: 'Dr. Anand Verma', phone: '+91 98112 34567' };
      const mockEmergency = {
        id: 'sos-test-999',
        patientName: 'Rameshwar Patil (54M)',
        symptomsReported: 'Acute chest pain',
        location: { address: 'Rampur Kalan (2.4 km away)' }
      };

      const result = await SmsService.sendEmergencyAlertToRmp({
        rmp: mockRmp,
        emergency: mockEmergency,
        isOffline: true
      });

      if (!result.sms || !result.whatsapp) {
        throw new Error('Expected both SMS and WhatsApp dispatch receipts.');
      }
      if (!result.sms.body.includes('sos-test-999')) {
        throw new Error('SMS body missing emergency ID action link.');
      }
    });

    // 4. Consult Reminder Notification
    await test('NotificationService: Consult Reminder Dispatch with SMS Fallback', async () => {
      const consult = db.consults[0] || {
        id: 'con-101',
        patientId: 'pat-101',
        patientPhone: '+91 98765 43210',
        assignedDoctorId: 'doc-301'
      };

      await NotificationService.notifyConsultReminder({ consult, minutesBefore: 15 });
      const logs = SmsService.getDeliveryLogs({ type: 'CONSULT_REMINDER' });
      if (logs.length === 0) {
        throw new Error('Expected SMS delivery log for consult reminder.');
      }
    });

    // 5. Digital Prescription Ready Notification
    await test('NotificationService: Digital Prescription Ready Dispatch', async () => {
      const rx = db.prescriptions[0] || {
        id: 'rx-101',
        patientId: 'pat-101',
        doctorName: 'Dr. Priya Sharma',
        medicines: [{ name: 'Paracetamol' }]
      };

      await NotificationService.notifyPrescriptionReady({ prescription: rx });
      const logs = SmsService.getDeliveryLogs({ type: 'PRESCRIPTION_READY' });
      if (logs.length === 0) {
        throw new Error('Expected SMS delivery log for prescription ready notice.');
      }
    });

    // 6. REST API: GET /api/notifications
    await test('REST API: GET /api/notifications (Fetch User Notification List)', async () => {
      const res = await fetch(`${BASE_URL}/notifications?userId=pat-101`);
      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got: ${res.status}`);
      }
      const data = await res.json();
      if (!data.success || !Array.isArray(data.notifications)) {
        throw new Error('Invalid response structure from GET /api/notifications');
      }
    });

    // 7. REST API: POST /api/notifications/sms
    await test('REST API: POST /api/notifications/sms (Trigger Outbound SMS)', async () => {
      const res = await fetch(`${BASE_URL}/notifications/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+91 98765 43210',
          message: 'Test REST API SMS trigger',
          recipientName: 'Test Patient'
        })
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got: ${res.status}`);
      }
      const data = await res.json();
      if (!data.success || !data.receipt?.sid) {
        throw new Error('Missing SMS receipt from REST API response');
      }
    });

    // 8. REST API: POST /api/notifications/whatsapp
    await test('REST API: POST /api/notifications/whatsapp (Trigger Outbound WhatsApp)', async () => {
      const res = await fetch(`${BASE_URL}/notifications/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+91 98765 43210',
          message: 'Test REST WhatsApp trigger',
          recipientName: 'Test Patient'
        })
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got: ${res.status}`);
      }
      const data = await res.json();
      if (!data.success || data.receipt?.channel !== 'WHATSAPP') {
        throw new Error('Invalid WhatsApp transmission receipt');
      }
    });

    // 9. REST API: GET /api/notifications/carrier/logs
    await test('REST API: GET /api/notifications/carrier/logs (Inspect Telco Logs)', async () => {
      const res = await fetch(`${BASE_URL}/notifications/carrier/logs`);
      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got: ${res.status}`);
      }
      const data = await res.json();
      if (!data.success || !Array.isArray(data.logs) || data.logs.length === 0) {
        throw new Error('Expected non-empty carrier logs array');
      }
    });

    // 10. REST API: POST /api/notifications/test-offline-rmp
    await test('REST API: POST /api/notifications/test-offline-rmp (Simulate Offline RMP SOS)', async () => {
      const res = await fetch(`${BASE_URL}/notifications/test-offline-rmp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Kavita Devi',
          symptoms: 'Emergency Labor Complications'
        })
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got: ${res.status}`);
      }
      const data = await res.json();
      if (!data.success || !data.result?.sms || !data.result?.whatsapp) {
        throw new Error('Expected SMS and WhatsApp result from test-offline-rmp');
      }
    });

    // 11. REST API: PUT /api/notifications/mark-all-read
    await test('REST API: PUT /api/notifications/mark-all-read (Batch Mark as Read)', async () => {
      const res = await fetch(`${BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'pat-101' })
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200 OK, got: ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error('Failed to batch mark notifications as read');
      }
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n=======================================================');
  console.log(`  NOTIFICATION TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runNotificationTests().catch((err) => {
  console.error('Notification test fatal error:', err);
  process.exit(1);
});
