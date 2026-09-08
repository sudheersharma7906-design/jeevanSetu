// server/modules/notification/notification.controller.js
import { NotificationService } from './notification.service.js';
import { SmsService } from './sms.service.js';
import { db } from '../../data/db.js';

export class NotificationController {
  static async send(req, res) {
    try {
      const result = await NotificationService.sendAlert(req.body);
      res.status(201).json({
        success: true,
        message: 'Notification dispatched successfully.',
        notification: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getByUser(req, res) {
    try {
      const userId = req.params.userId || req.query.userId || req.user?.id;
      const role = req.query.role || req.user?.role;
      const list = NotificationService.getByUser(userId, role);
      const unreadCount = list.filter(n => !n.read).length;

      res.status(200).json({
        success: true,
        count: list.length,
        unreadCount,
        notifications: list
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getAll(req, res) {
    try {
      const list = NotificationService.getAll();
      res.status(200).json({
        success: true,
        count: list.length,
        notifications: list
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  static async markRead(req, res) {
    try {
      const updated = NotificationService.markAsRead(req.params.id);
      res.status(200).json({
        success: true,
        notification: updated
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async markAllRead(req, res) {
    try {
      const userId = req.body.userId || req.user?.id;
      const result = NotificationService.markAllAsRead(userId);
      res.status(200).json({
        success: true,
        message: `${result.count} notifications marked as read.`
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // --- SMS & WhatsApp Endpoints ---
  static async sendSms(req, res) {
    try {
      const { to, message, type, recipientName, metadata } = req.body;
      if (!to || !message) {
        return res.status(400).json({ success: false, error: 'Recipient phone (to) and message are required.' });
      }

      const receipt = await SmsService.sendSms({ to, message, type, recipientName, metadata });
      res.status(200).json({
        success: true,
        message: 'SMS queued/delivered via carrier network.',
        receipt
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async sendWhatsApp(req, res) {
    try {
      const { to, message, type, recipientName, metadata } = req.body;
      if (!to || !message) {
        return res.status(400).json({ success: false, error: 'Recipient phone (to) and message are required.' });
      }

      const receipt = await SmsService.sendWhatsApp({ to, message, type, recipientName, metadata });
      res.status(200).json({
        success: true,
        message: 'WhatsApp message transmitted successfully.',
        receipt
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getLogs(req, res) {
    try {
      const { limit, channel, type } = req.query;
      const logs = SmsService.getDeliveryLogs({
        limit: limit ? parseInt(limit, 10) : 50,
        channel,
        type
      });

      res.status(200).json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async testOfflineRmpAlert(req, res) {
    try {
      const rmp = db.users.find(u => u.role === 'RMP') || {
        name: 'Dr. Anand Verma',
        phone: '+91 98112 34567'
      };

      const mockEmergency = {
        id: `sos-${Date.now().toString().slice(-4)}`,
        patientName: req.body.patientName || 'Rameshwar Sharma (54M)',
        symptomsReported: req.body.symptoms || 'Acute Chest Pain & Severe Breathlessness',
        location: { address: 'Rampur Kalan (2.4 km away)' }
      };

      const result = await SmsService.sendEmergencyAlertToRmp({
        rmp,
        emergency: mockEmergency,
        isOffline: true
      });

      res.status(200).json({
        success: true,
        message: 'Offline RMP emergency SMS and WhatsApp alerts dispatched successfully.',
        result
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
