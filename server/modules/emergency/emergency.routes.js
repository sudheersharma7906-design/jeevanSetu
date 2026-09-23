import { Router } from 'express';
import { EmergencyController } from './emergency.controller.js';
import { optionalAuth } from '../../middleware/auth.js';
import { sosRateLimiter } from '../../middleware/rateLimiter.js';
import { validateEmergencySos } from '../../middleware/validator.js';

const router = Router();

// SOS Trigger: Rate limited and schema validated with explicit location privacy audit
router.post('/sos', optionalAuth, sosRateLimiter, validateEmergencySos, EmergencyController.triggerSos);

router.get('/active', optionalAuth, EmergencyController.getActive);
router.get('/all', optionalAuth, EmergencyController.getAll);
router.get('/:id/status', optionalAuth, EmergencyController.getStatus);
router.post('/:id/accept', optionalAuth, EmergencyController.acceptSos);
router.put('/:id/accept', optionalAuth, EmergencyController.acceptSos);
router.post('/:id/escalate', optionalAuth, EmergencyController.escalateSos);
router.put('/:id/escalate', optionalAuth, EmergencyController.escalateSos);
router.post('/location', optionalAuth, EmergencyController.updateLocation);
router.post('/:id/location', optionalAuth, EmergencyController.updateLocation);
router.put('/:id/status', optionalAuth, EmergencyController.updateStatus);
router.post('/:id/status', optionalAuth, EmergencyController.updateStatus);

export default router;
