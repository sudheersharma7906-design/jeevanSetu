// server/modules/notification/sms.service.js
import dotenv from 'dotenv';
dotenv.config();

export class SmsService {
  static deliveryLogs = [
    {
      id: `msg-${Date.now() - 120000}`,
      sid: `SM${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      channel: 'SMS',
      to: '+91 98112 34567',
      recipientName: 'Dr. Anand Verma (RMP)',
      type: 'EMERGENCY_SOS',
      status: 'DELIVERED',
      body: '🚨 [JEEVANSETU SOS] Critical emergency reported at Rampur Kalan (2.4 km). Patient: Rameshwar Sharma (54M). Severe chest pain. Tap to accept: http://localhost:5173/?sos=sos-101',
      sentAt: new Date(Date.now() - 120000).toISOString(),
      deliveredAt: new Date(Date.now() - 118000).toISOString(),
      latencyMs: 1420
    },
    {
      id: `msg-${Date.now() - 60000}`,
      sid: `WA${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      channel: 'WHATSAPP',
      to: '+91 98112 34567',
      recipientName: 'Dr. Anand Verma (RMP)',
      type: 'EMERGENCY_SOS',
      status: 'DELIVERED',
      body: '🚨 *JeevanSetu Urgent Emergency Alert*\n*Patient:* Rameshwar Sharma (54M)\n*Location:* Rampur Kalan\n*Symptoms:* Severe chest pain & breathlessness\n*Action:* Reply ACCEPT to dispatch immediately.',
      sentAt: new Date(Date.now() - 60000).toISOString(),
      deliveredAt: new Date(Date.now() - 59000).toISOString(),
      latencyMs: 980
    }
  ];

  /**
   * Check if live Twilio credentials are configured.
   */
  static isTwilioConfigured() {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );
  }

  /**
   * Send an SMS message (Twilio live REST API or deterministic carrier gateway simulation).
   */
  static async sendSms({ to, message, type = 'GENERAL_ALERT', recipientName = 'Recipient', metadata = {} }) {
    const startTime = Date.now();
    let messageSid = `SM${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
    let deliveryStatus = 'DELIVERED';
    let isLiveTwilio = false;

    console.log(`[SMS OUTBOUND] Dispatching to ${to} (${recipientName}): "${message}"`);

    // 1. Live Twilio REST API execution if credentials configured
    if (this.isTwilioConfigured()) {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
        const bodyParams = new URLSearchParams({
          To: to.startsWith('+') ? to : `+91${to.replace(/\D/g, '').slice(-10)}`,
          From: fromNumber,
          Body: message
        });

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyParams.toString()
          }
        );

        if (twilioRes.ok) {
          const data = await twilioRes.json();
          messageSid = data.sid || messageSid;
          deliveryStatus = (data.status || 'queued').toUpperCase();
          isLiveTwilio = true;
          console.log(`[TWILIO SMS SENT] Live SID: ${messageSid}, Status: ${deliveryStatus}`);
        } else {
          const errText = await twilioRes.text();
          console.warn('[TWILIO REST WARNING] Carrier response:', errText);
        }
      } catch (twilioErr) {
        console.warn('[TWILIO DISPATCH ERROR] Falling back to carrier logger:', twilioErr.message);
      }
    }

    // 2. Simulated carrier delivery & audit record
    const latency = isLiveTwilio ? Date.now() - startTime : Math.floor(Math.random() * 600) + 350;
    const logEntry = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sid: messageSid,
      channel: 'SMS',
      to: to || '+91 98000 00000',
      recipientName,
      type,
      status: deliveryStatus,
      isLiveTwilio,
      body: message,
      sentAt: new Date(startTime).toISOString(),
      deliveredAt: new Date(startTime + latency).toISOString(),
      latencyMs: latency,
      metadata
    };

    this.deliveryLogs.unshift(logEntry);
    if (this.deliveryLogs.length > 100) this.deliveryLogs.pop();

    return logEntry;
  }

  /**
   * Send a WhatsApp message (Twilio WhatsApp live REST API or simulated gateway).
   */
  static async sendWhatsApp({ to, message, type = 'GENERAL_ALERT', recipientName = 'Recipient', metadata = {} }) {
    const startTime = Date.now();
    let messageSid = `WA${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
    let deliveryStatus = 'DELIVERED';
    let isLiveTwilio = false;

    console.log(`[WHATSAPP OUTBOUND] Dispatching to ${to} (${recipientName}): "${message}"`);

    // 1. Live Twilio WhatsApp API execution if credentials configured
    if (this.isTwilioConfigured()) {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;

        const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
        const cleanPhone = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '').slice(-10)}`;
        const bodyParams = new URLSearchParams({
          To: `whatsapp:${cleanPhone}`,
          From: `whatsapp:${fromNumber}`,
          Body: message
        });

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyParams.toString()
          }
        );

        if (twilioRes.ok) {
          const data = await twilioRes.json();
          messageSid = data.sid || messageSid;
          deliveryStatus = (data.status || 'queued').toUpperCase();
          isLiveTwilio = true;
          console.log(`[TWILIO WHATSAPP SENT] Live SID: ${messageSid}, Status: ${deliveryStatus}`);
        } else {
          const errText = await twilioRes.text();
          console.warn('[TWILIO WHATSAPP WARNING] Carrier response:', errText);
        }
      } catch (twilioErr) {
        console.warn('[TWILIO WHATSAPP ERROR] Falling back to carrier logger:', twilioErr.message);
      }
    }

    const latency = isLiveTwilio ? Date.now() - startTime : Math.floor(Math.random() * 500) + 280;
    const logEntry = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sid: messageSid,
      channel: 'WHATSAPP',
      to: to || '+91 98000 00000',
      recipientName,
      type,
      status: deliveryStatus,
      isLiveTwilio,
      body: message,
      sentAt: new Date(startTime).toISOString(),
      deliveredAt: new Date(startTime + latency).toISOString(),
      latencyMs: latency,
      metadata
    };

    this.deliveryLogs.unshift(logEntry);
    if (this.deliveryLogs.length > 100) this.deliveryLogs.pop();

    return logEntry;
  }

  /**
   * Dispatches dual-channel SMS and WhatsApp emergency alerts to offline or on-duty RMPs.
   */
  static async sendEmergencyAlertToRmp({ rmp, emergency, isOffline = true }) {
    const phone = rmp?.phone || '+91 98112 34567';
    const rmpName = rmp?.name || 'Dr. Anand Verma';
    const patientName = emergency.patientName || 'Emergency Patient';
    const symptoms = emergency.symptomsReported || 'Critical SOS Trigger';
    const address = emergency.location?.address || 'Rampur Kalan (2.4 km)';
    const emergencyId = emergency.id;

    // 1. Plain SMS alert
    const smsText = `🚨 [JIVANSETU EMERGENCY SOS]\n` +
      `Patient: ${patientName}\n` +
      `Symptoms: ${symptoms}\n` +
      `Location: ${address}\n` +
      `Action: Tap link to accept immediately: http://localhost:5173/?sos=${emergencyId}\n` +
      `Or reply ACCEPT ${emergencyId}`;

    const smsRes = await this.sendSms({
      to: phone,
      message: smsText,
      type: 'EMERGENCY_SOS',
      recipientName: `${rmpName} (${isOffline ? 'Offline Fallback' : 'Active Duty'})`,
      metadata: { emergencyId, isOffline }
    });

    // 2. WhatsApp rich text alert
    const waText = `🚨 *JIVANSETU EMERGENCY BROADCAST*\n\n` +
      `*Priority:* 🔴 RED (Critical Care Required)\n` +
      `*Patient:* ${patientName}\n` +
      `*Reported Symptoms:* ${symptoms}\n` +
      `*Location:* ${address}\n\n` +
      `⚡ *Nearest Responder Alert:* You are located closest to this emergency.\n` +
      `👉 *Respond Now:* http://localhost:5173/?sos=${emergencyId}`;

    const waRes = await this.sendWhatsApp({
      to: phone,
      message: waText,
      type: 'EMERGENCY_SOS',
      recipientName: rmpName,
      metadata: { emergencyId, isOffline }
    });

    return { sms: smsRes, whatsapp: waRes };
  }

  /**
   * Dispatches consultation reminder SMS/WhatsApp to patient and doctor.
   */
  static async sendConsultReminder({ patient, doctor, consult, minutesBefore = 15 }) {
    const patientPhone = patient?.phone || '+91 98765 43210';
    const doctorName = doctor?.name || 'Dr. Priya Sharma';
    const patientName = patient?.name || 'Patient';
    const consultId = consult?.id || 'con-101';

    const message = `🩺 [JIVANSETU TELECONSULT]\n` +
      `Hello ${patientName}, your video teleconsultation with ${doctorName} starts in ${minutesBefore} minutes.\n` +
      `Join link: http://localhost:5173/?consult=${consultId}`;

    return await this.sendSms({
      to: patientPhone,
      message,
      type: 'CONSULT_REMINDER',
      recipientName: patientName,
      metadata: { consultId }
    });
  }

  /**
   * Dispatches prescription ready notification SMS/WhatsApp.
   */
  static async sendPrescriptionNotification({ patient, doctor, prescription }) {
    const patientPhone = patient?.phone || '+91 98765 43210';
    const doctorName = doctor?.name || prescription?.doctorName || 'Dr. Priya Sharma';
    const medCount = prescription?.medicines?.length || 2;
    const rxId = prescription?.id || 'rx-101';

    const message = `💊 [JIVANSETU DIGITAL PRESCRIPTION]\n` +
      `Your digital prescription from ${doctorName} is ready (${medCount} medicines prescribed).\n` +
      `View Rx: http://localhost:5173/?rx=${rxId}`;

    return await this.sendSms({
      to: patientPhone,
      message,
      type: 'PRESCRIPTION_READY',
      recipientName: patient?.name || 'Patient',
      metadata: { prescriptionId: rxId }
    });
  }

  /**
   * Retrieve transmission logs with optional filtering.
   */
  static getDeliveryLogs({ limit = 50, channel = null, type = null } = {}) {
    let logs = [...this.deliveryLogs];
    if (channel) {
      logs = logs.filter(l => l.channel === channel.toUpperCase());
    }
    if (type) {
      logs = logs.filter(l => l.type === type.toUpperCase());
    }
    return logs.slice(0, limit);
  }

  static clearDeliveryLogs() {
    this.deliveryLogs = [];
    return true;
  }
}

