import { Router } from 'express';
import { EmergencyController } from './emergency.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { sosRateLimiter } from '../../middleware/rateLimiter.js';
import { validateEmergencySos } from '../../middleware/validator.js';

const router = Router();

// Enforce authentication on all emergency endpoints
router.use(authenticateToken);

// SOS Trigger: Rate limited, validated, and authenticated
router.post('/sos', sosRateLimiter, validateEmergencySos, EmergencyController.triggerSos);

// Active & all emergency queries for healthcare providers
router.get('/active', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.getActive);
router.get('/all', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.getAll);
router.get('/:id/status', EmergencyController.getStatus);

// RMP / Doctor actions
router.post('/:id/accept', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.acceptSos);
router.put('/:id/accept', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.acceptSos);
router.post('/:id/escalate', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.escalateSos);
router.put('/:id/escalate', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.escalateSos);

// Live GPS Location Updates
router.post('/location', EmergencyController.updateLocation);
router.post('/:id/location', EmergencyController.updateLocation);

// Status updates
router.put('/:id/status', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.updateStatus);
router.post('/:id/status', requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.updateStatus);

export default router;
