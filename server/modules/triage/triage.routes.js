import { Router } from 'express';
import { TriageController } from './triage.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { validateTriage } from '../../middleware/validator.js';

const router = Router();

router.get('/engine/info', TriageController.getEngineInfo);

// Protect triage evaluation & history with authentication
router.use(authenticateToken);

router.post('/', validateTriage, TriageController.evaluate);
router.get('/:id', TriageController.getById);
router.get('/history/:patientId', TriageController.getHistoryByPatient);

export default router;
