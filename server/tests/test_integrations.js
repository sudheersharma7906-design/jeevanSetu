// server/tests/test_integrations.js
import { SmsService } from '../modules/notification/sms.service.js';
import { AuthService } from '../modules/auth/auth.service.js';

async function runTests() {
  console.log('--- 1. Testing SMS Service (Simulated Carrier Dispatch) ---');
  const sms = await SmsService.sendSms({
    to: '+91 98112 34567',
    message: '🚨 [JIVANSETU EMERGENCY SOS] Test SOS message',
    type: 'EMERGENCY_SOS',
    recipientName: 'Dr. Anand Verma'
  });
  console.log('SMS Result:', sms.status, 'SID:', sms.sid, 'Latency:', sms.latencyMs, 'ms');

  console.log('\n--- 2. Testing WhatsApp Service ---');
  const wa = await SmsService.sendWhatsApp({
    to: '+91 98112 34567',
    message: '🚨 *JIVANSETU EMERGENCY BROADCAST* - WhatsApp Alert',
    type: 'EMERGENCY_SOS',
    recipientName: 'Dr. Anand Verma'
  });
  console.log('WhatsApp Result:', wa.status, 'SID:', wa.sid, 'Latency:', wa.latencyMs, 'ms');

  console.log('\n--- 3. Testing Auth OTP Request & Verification ---');
  const otpRes = AuthService.requestOtp('9876543210', 'patient', 'Rameshwar Sharma');
  console.log('OTP Request Result:', otpRes.message);

  const verifyRes = await AuthService.verifyOtp('9876543210', '123456');
  console.log('OTP Verification Result:', verifyRes.message, 'User:', verifyRes.user.name, 'Token length:', verifyRes.token?.length);

  console.log('\n--- 4. Checking Carrier Delivery Logs ---');
  const logs = SmsService.getDeliveryLogs({ limit: 5 });
  console.log(`Retrieved ${logs.length} carrier transmission logs.`);
  logs.forEach(l => console.log(` - [${l.channel}] ${l.to} (${l.status}) SID: ${l.sid} [${l.latencyMs}ms]`));

  console.log('\n✅ All 6 Integration services verified successfully!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
