import { Router } from 'express';
import { EmergencyController } from './emergency.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { sosRateLimiter } from '../../middleware/rateLimiter.js';
import { validateEmergencySos } from '../../middleware/validator.js';

const router = Router();

// SOS Trigger: Rate limited and schema validated with explicit location privacy audit
router.post('/sos', authenticateToken, sosRateLimiter, validateEmergencySos, EmergencyController.triggerSos);

router.get('/active', authenticateToken, EmergencyController.getActive);
router.get('/all', authenticateToken, EmergencyController.getAll);
router.get('/:id/status', authenticateToken, EmergencyController.getStatus);
router.post('/:id/accept', authenticateToken, EmergencyController.acceptSos);
router.put('/:id/accept', authenticateToken, EmergencyController.acceptSos);
router.post('/:id/escalate', authenticateToken, EmergencyController.escalateSos);
router.put('/:id/escalate', authenticateToken, EmergencyController.escalateSos);
router.put('/:id/status', authenticateToken, EmergencyController.updateStatus);
router.post('/:id/status', authenticateToken, EmergencyController.updateStatus);

export default router;
