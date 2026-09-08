// server/modules/consult/consult.routes.js
import { Router } from 'express';
import { ConsultController } from './consult.controller.js';
import { optionalAuth } from '../../middleware/auth.js';
import { validateConsultEscalate } from '../../middleware/validator.js';

const router = Router();

router.post('/escalate', optionalAuth, validateConsultEscalate, ConsultController.escalate);
router.get('/queue', optionalAuth, ConsultController.getQueue);
router.get('/:id', optionalAuth, ConsultController.getById);
router.put('/:id/status', optionalAuth, ConsultController.updateStatus);
router.post('/:id/complete', optionalAuth, ConsultController.complete);
router.post('/:id/prescribe', optionalAuth, ConsultController.prescribe);

export default router;
