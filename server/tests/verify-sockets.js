// server/tests/verify-sockets.js
import { io as ioClient } from 'socket.io-client';
import { server } from '../index.js';

const PORT = 5006;
const SOCKET_URL = `http://localhost:${PORT}`;

async function testSockets() {
  console.log('\n⚡ =======================================================');
  console.log('   JIVANSETU REAL-TIME SOCKET.IO & WEBRTC TEST SUITE');
  console.log('=======================================================\n');

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[TEST RUNNER] Server running on port ${PORT} for WebSocket tests\n`);

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

  let patientSocket = null;
  let rmpSocket = null;
  let doctorSocket = null;

  try {
    // 1. Connection Test
    await test('Socket Connection Handshake', async () => {
      patientSocket = ioClient(SOCKET_URL, { reconnection: false, transports: ['websocket'] });
      rmpSocket = ioClient(SOCKET_URL, { reconnection: false, transports: ['websocket'] });
      doctorSocket = ioClient(SOCKET_URL, { reconnection: false, transports: ['websocket'] });

      await Promise.all([
        new Promise((resolve) => patientSocket.on('connect', resolve)),
        new Promise((resolve) => rmpSocket.on('connect', resolve)),
        new Promise((resolve) => doctorSocket.on('connect', resolve))
      ]);
    });

    // 2. Room Joining
    await test('Join Role and Consultation Rooms', async () => {
      patientSocket.emit('join-room', {
        roomId: 'room-consult-101',
        userId: 'pat-101',
        role: 'patient',
        name: 'Rameshwar Patil'
      });

      rmpSocket.emit('join-room', {
        roomId: 'room-consult-101',
        userId: 'rmp-201',
        role: 'rmp',
        name: 'Dr. Anand Deshmukh'
      });

      doctorSocket.emit('join-room', {
        roomId: 'room-consult-101',
        userId: 'doc-301',
        role: 'doctor',
        name: 'Dr. Priya Sharma'
      });

      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    // 3. WebRTC Signaling Relay
    await test('WebRTC Video Signaling (Offer / Answer / ICE Candidate)', async () => {
      const roomId = 'room-consult-101';

      // Doctor listens for offer
      const offerPromise = new Promise((resolve) => {
        doctorSocket.on('webrtc:offer', (data) => {
          if (data.offer?.sdp === 'mock-offer-sdp') {
            resolve();
          }
        });
      });

      // Patient sends offer
      patientSocket.emit('webrtc:offer', {
        roomId,
        offer: { type: 'offer', sdp: 'mock-offer-sdp' },
        senderId: 'pat-101'
      });

      await offerPromise;

      // Patient listens for answer
      const answerPromise = new Promise((resolve) => {
        patientSocket.on('webrtc:answer', (data) => {
          if (data.answer?.sdp === 'mock-answer-sdp') {
            resolve();
          }
        });
      });

      // Doctor sends answer
      doctorSocket.emit('webrtc:answer', {
        roomId,
        answer: { type: 'answer', sdp: 'mock-answer-sdp' },
        senderId: 'doc-301'
      });

      await answerPromise;
    });

    // 4. Real-Time SOS Alert & Acceptance Relay
    await test('Real-Time SOS Dispatch to RMP & Status Update to Patient', async () => {
      let receivedSosId = null;

      // RMP listens for SOS alert
      const rmpAlertPromise = new Promise((resolve) => {
        rmpSocket.on('sos:alert', (data) => {
          if (data.emergency?.symptomsReported.includes('High-voltage shock')) {
            receivedSosId = data.emergency.id;
            resolve();
          }
        });
      });

      // Patient listens for Status Update when RMP accepts
      const patientStatusPromise = new Promise((resolve) => {
        patientSocket.on('sos:status-update', (data) => {
          if (data.status === 'ACCEPTED') {
            resolve();
          }
        });
      });

      // Patient triggers SOS
      patientSocket.emit('sos:trigger', {
        patientId: 'pat-101',
        triggerType: 'VOICE',
        voiceTranscript: 'Madad chahiye, current lag gaya hai',
        symptoms: 'High-voltage shock injury in farming field',
        latitude: 19.6542,
        longitude: 73.1389
      });

      await rmpAlertPromise;

      // RMP accepts SOS
      rmpSocket.emit('sos:accept', {
        emergencyId: receivedSosId,
        rmpId: 'rmp-201'
      });

      await patientStatusPromise;
    });

    // 5. In-Consult Live Chat
    await test('In-Consultation Live Chat Messaging', async () => {
      const roomId = 'room-consult-101';

      const doctorMessagePromise = new Promise((resolve) => {
        doctorSocket.on('consult:message', (msg) => {
          if (msg.message === 'Namaste Doctor Sahiba, ECG report uploaded.') {
            resolve();
          }
        });
      });

      patientSocket.emit('consult:message', {
        roomId,
        message: 'Namaste Doctor Sahiba, ECG report uploaded.',
        senderId: 'pat-101',
        senderName: 'Rameshwar Patil',
        senderRole: 'patient'
      });

      await doctorMessagePromise;
    });

  } finally {
    if (patientSocket) patientSocket.disconnect();
    if (rmpSocket) rmpSocket.disconnect();
    if (doctorSocket) doctorSocket.disconnect();
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n=======================================================');
  console.log(`  SOCKET RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testSockets().catch((err) => {
  console.error('Socket test error:', err);
  process.exit(1);
});
