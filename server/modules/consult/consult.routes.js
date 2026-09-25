// server/modules/consult/consult.routes.js
import { Router } from 'express';
import { ConsultController } from './consult.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { validateConsultEscalate } from '../../middleware/validator.js';

const router = Router();

// Protect all consult endpoints with authentication
router.use(authenticateToken);

router.post('/escalate', requireRoles(['rmp', 'doctor', 'admin']), validateConsultEscalate, ConsultController.escalate);
router.get('/queue', requireRoles(['doctor', 'admin']), ConsultController.getQueue);
router.get('/:id', ConsultController.getById);
router.put('/:id/status', requireRoles(['doctor', 'admin']), ConsultController.updateStatus);
router.post('/:id/complete', requireRoles(['doctor', 'admin']), ConsultController.complete);
router.post('/:id/prescribe', requireRoles(['doctor', 'admin']), ConsultController.prescribe);

export default router;
