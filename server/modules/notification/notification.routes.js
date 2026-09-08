// server/modules/notification/notification.routes.js
import { Router } from 'express';
import { NotificationController } from './notification.controller.js';

const router = Router();

// In-app notifications
router.post('/send', NotificationController.send);
router.get('/', NotificationController.getByUser);
router.get('/all', NotificationController.getAll);
router.get('/:userId', NotificationController.getByUser);
router.put('/mark-all-read', NotificationController.markAllRead);
router.put('/:id/read', NotificationController.markRead);

// Multi-channel SMS & WhatsApp carrier endpoints
router.post('/sms', NotificationController.sendSms);
router.post('/sms/send', NotificationController.sendSms);
router.get('/sms/logs', NotificationController.getLogs);
router.post('/whatsapp', NotificationController.sendWhatsApp);
router.post('/whatsapp/send', NotificationController.sendWhatsApp);
router.get('/carrier/logs', NotificationController.getLogs);
router.post('/test-offline-rmp', NotificationController.testOfflineRmpAlert);
router.post('/sms/test', NotificationController.testOfflineRmpAlert);

export default router;
