import { Router } from 'express';
import { RecordController } from './record.controller.js';
import { authenticateToken, verifyRecordAccess } from '../../middleware/auth.js';
import { validateRecord } from '../../middleware/validator.js';

const router = Router();

// GET logged-in patient's own records (Section 14 of PRD)
router.get('/my', authenticateToken, RecordController.getMyRecords);

// GET health records with RBAC enforcement
router.get('/:patientId', authenticateToken, verifyRecordAccess, RecordController.getByPatientId);

// Append new health record with schema validation
router.post('/:patientId', authenticateToken, validateRecord, RecordController.addRecord);

export default router;
