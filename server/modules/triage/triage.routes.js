import { Router } from 'express';
import { TriageController } from './triage.controller.js';
import { optionalAuth } from '../../middleware/auth.js';
import { validateTriage } from '../../middleware/validator.js';

const router = Router();

router.post('/', optionalAuth, validateTriage, TriageController.evaluate);
router.get('/engine/info', TriageController.getEngineInfo);
router.get('/:id', optionalAuth, TriageController.getById);
router.get('/history/:patientId', optionalAuth, TriageController.getHistoryByPatient);

export default router;
