import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';

const router = Router();

// Protect all notification endpoints with authentication
router.use(authenticateToken);

// In-app notifications
router.post('/send', requireRoles(['admin', 'doctor', 'rmp']), NotificationController.send);
router.get('/', NotificationController.getByUser);
router.get('/all', requireRoles(['admin']), NotificationController.getAll);
router.get('/:userId', NotificationController.getByUser);
router.put('/mark-all-read', NotificationController.markAllRead);
router.put('/:id/read', NotificationController.markRead);

// Multi-channel SMS & WhatsApp carrier endpoints
router.post('/sms', requireRoles(['admin']), NotificationController.sendSms);
router.post('/sms/send', requireRoles(['admin']), NotificationController.sendSms);
router.get('/sms/logs', requireRoles(['admin']), NotificationController.getLogs);
router.post('/whatsapp', requireRoles(['admin']), NotificationController.sendWhatsApp);
router.post('/whatsapp/send', requireRoles(['admin']), NotificationController.sendWhatsApp);
router.get('/carrier/logs', requireRoles(['admin']), NotificationController.getLogs);
router.post('/test-offline-rmp', requireRoles(['admin']), NotificationController.testOfflineRmpAlert);
router.post('/sms/test', requireRoles(['admin']), NotificationController.testOfflineRmpAlert);

export default router;
