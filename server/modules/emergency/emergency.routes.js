import { Router } from 'express';
import { EmergencyController } from './emergency.controller.js';
import { authenticateToken, optionalAuth, requireRoles } from '../../middleware/auth.js';
import { sosRateLimiter } from '../../middleware/rateLimiter.js';
import { validateEmergencySos } from '../../middleware/validator.js';

const router = Router();

// SOS Trigger: Rate limited, validated, and authenticated
router.post('/sos', optionalAuth, sosRateLimiter, validateEmergencySos, EmergencyController.triggerSos);

// Active & all emergency queries for healthcare providers
router.get('/active', optionalAuth, EmergencyController.getActive);
router.get('/all', authenticateToken, requireRoles(['rmp', 'doctor', 'admin']), EmergencyController.getAll);
router.get('/:id/status', optionalAuth, EmergencyController.getStatus);

// RMP / Doctor actions
router.post('/:id/accept', optionalAuth, EmergencyController.acceptSos);
router.put('/:id/accept', optionalAuth, EmergencyController.acceptSos);
router.post('/:id/escalate', optionalAuth, EmergencyController.escalateSos);
router.put('/:id/escalate', optionalAuth, EmergencyController.escalateSos);

// Live GPS Location Updates
router.post('/location', optionalAuth, EmergencyController.updateLocation);
router.post('/:id/location', optionalAuth, EmergencyController.updateLocation);

// Status updates
router.put('/:id/status', optionalAuth, EmergencyController.updateStatus);
router.post('/:id/status', optionalAuth, EmergencyController.updateStatus);

export default router;
