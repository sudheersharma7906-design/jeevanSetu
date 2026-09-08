// server/modules/notification/notification.service.js
import { db } from '../../data/db.js';
import { SmsService } from './sms.service.js';

export class NotificationService {
  static socketEmitter = null;

  static setSocketEmitter(emitter) {
    this.socketEmitter = emitter;
  }

  /**
   * Sends multi-channel alerts (SMS, WhatsApp, Web Push, In-App Socket).
   */
  static async sendAlert(payload) {
    const {
      recipientId = null,
      recipientPhone = '',
      recipientRole = 'ALL',
      type = 'GENERAL_ALERT',
      title = 'JivanSetu Notification',
      message = '',
      channel = 'MULTI_CHANNEL', // SMS, WHATSAPP, WEB_PUSH, IN_APP, MULTI_CHANNEL
      metadata = {},
      sendSmsFallback = true
    } = payload;

    const notification = db.addNotification({
      recipientId,
      recipientPhone,
      recipientRole,
      type,
      title,
      message,
      channel,
      metadata,
      deliveredAt: new Date().toISOString()
    });

    console.log(`[NOTIFICATION DISPATCHED] [${channel}] to ${recipientPhone || recipientId || recipientRole}: "${title}" - "${message}"`);

    // 1. Emit live Socket.io event to targeted room or global channel
    if (this.socketEmitter) {
      this.socketEmitter('notification:received', {
        notification,
        recipientRole,
        recipientId,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Dispatch SMS / WhatsApp fallback if requested or if emergency/consult/prescription
    if (sendSmsFallback && recipientPhone) {
      if (type === 'EMERGENCY_SOS') {
        await SmsService.sendSms({
          to: recipientPhone,
          message: `🚨 ${title}: ${message}`,
          type: 'EMERGENCY_SOS',
          metadata
        });
      } else if (type === 'CONSULT_REMINDER' || type === 'PRESCRIPTION_READY') {
        await SmsService.sendSms({
          to: recipientPhone,
          message: `${title}: ${message}`,
          type,
          metadata
        });
      }
    }

    return notification;
  }

  /**
   * Dispatches consultation reminder (15-min or 5-min warning).
   */
  static async notifyConsultReminder({ consult, minutesBefore = 15 }) {
    const patient = db.findUserById(consult.patientId);
    const doctor = db.findUserById(consult.assignedDoctorId);

    const title = `🩺 Upcoming Video Consultation`;
    const message = `Your consultation with ${doctor?.name || 'Doctor'} starts in ${minutesBefore} minutes. Please get ready.`;

    // 1. In-App + Socket + SMS to Patient
    await this.sendAlert({
      recipientId: consult.patientId,
      recipientPhone: patient?.phone || consult.patientPhone || '',
      recipientRole: 'PATIENT',
      type: 'CONSULT_REMINDER',
      title,
      message,
      channel: 'MULTI_CHANNEL',
      metadata: { consultId: consult.id, joinUrl: `/?consult=${consult.id}` },
      sendSmsFallback: true
    });

    // 2. Dispatch dedicated SMS
    if (patient) {
      await SmsService.sendConsultReminder({ patient, doctor, consult, minutesBefore });
    }
  }

  /**
   * Dispatches Doctor Ready notice to Patient.
   */
  static async notifyDoctorReady({ consult }) {
    const patient = db.findUserById(consult.patientId);
    const doctor = db.findUserById(consult.assignedDoctorId);

    const title = `🩺 Doctor is Ready`;
    const message = `${doctor?.name || 'Dr. Priya Sharma'} has joined the teleconsultation room. Click to enter.`;

    await this.sendAlert({
      recipientId: consult.patientId,
      recipientPhone: patient?.phone || '',
      recipientRole: 'PATIENT',
      type: 'DOCTOR_READY',
      title,
      message,
      channel: 'MULTI_CHANNEL',
      metadata: { consultId: consult.id, action: 'JOIN_CALL' },
      sendSmsFallback: true
    });
  }

  /**
   * Dispatches Digital Prescription Ready notice.
   */
  static async notifyPrescriptionReady({ prescription }) {
    const patient = db.findUserById(prescription.patientId);
    const title = `💊 Digital Prescription Issued`;
    const message = `${prescription.doctorName || 'Dr. Priya Sharma'} has prescribed ${prescription.medicines?.length || 2} medicines for your treatment.`;

    await this.sendAlert({
      recipientId: prescription.patientId,
      recipientPhone: patient?.phone || '',
      recipientRole: 'PATIENT',
      type: 'PRESCRIPTION_READY',
      title,
      message,
      channel: 'MULTI_CHANNEL',
      metadata: { prescriptionId: prescription.id, diagnosis: prescription.diagnosis },
      sendSmsFallback: true
    });

    if (patient) {
      await SmsService.sendPrescriptionNotification({
        patient,
        doctor: { name: prescription.doctorName },
        prescription
      });
    }
  }

  /**
   * Dispatches real-time SOS status change to Patient & Network.
   */
  static async notifySosStatusChange({ emergency, statusMessage }) {
    const title = `🚨 Emergency Status: ${emergency.status}`;
    const message = statusMessage || `Update regarding your emergency request (${emergency.id}).`;

    await this.sendAlert({
      recipientId: emergency.patientId,
      recipientPhone: emergency.patientPhone || '',
      recipientRole: 'PATIENT',
      type: 'EMERGENCY_STATUS',
      title,
      message,
      channel: 'MULTI_CHANNEL',
      metadata: { emergencyId: emergency.id, status: emergency.status },
      sendSmsFallback: false
    });
  }

  static getByUser(userId, role = null) {
    let list = db.notifications;
    if (userId) {
      list = list.filter(n =>
        n.recipientId === userId ||
        n.recipientRole === 'ALL' ||
        (role && n.recipientRole?.toUpperCase() === role.toUpperCase())
      );
    } else if (role) {
      list = list.filter(n => n.recipientRole === 'ALL' || n.recipientRole?.toUpperCase() === role.toUpperCase());
    }
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  static getAll() {
    return [...db.notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  static markAsRead(notificationId) {
    const notif = db.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      notif.readAt = new Date().toISOString();
      return notif;
    }
    throw new Error(`Notification '${notificationId}' not found.`);
  }

  static markAllAsRead(userId) {
    let count = 0;
    db.notifications.forEach(n => {
      if (!userId || n.recipientId === userId || n.recipientRole === 'ALL') {
        if (!n.read) {
          n.read = true;
          n.readAt = new Date().toISOString();
          count++;
        }
      }
    });
    return { count };
  }
}
