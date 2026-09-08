import { Router } from 'express';
import { TriageController } from './triage.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { validateTriage } from '../../middleware/validator.js';

const router = Router();

router.post('/', authenticateToken, validateTriage, TriageController.evaluate);
router.get('/engine/info', TriageController.getEngineInfo);
router.get('/:id', authenticateToken, TriageController.getById);
router.get('/history/:patientId', authenticateToken, TriageController.getHistoryByPatient);

export default router;
