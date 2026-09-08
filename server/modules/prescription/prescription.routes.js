import { Router } from 'express';
import { PrescriptionController } from './prescription.controller.js';
import { authenticateToken, verifyPrescriptionAccess } from '../../middleware/auth.js';
import { validatePrescription } from '../../middleware/validator.js';

const router = Router();

// Create digital prescription (Restricted to Doctors & Medical Officers)
router.post('/', authenticateToken, (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    return res.status(403).json({
      success: false,
      error: 'Access denied (RBAC). Patients cannot issue prescriptions.'
    });
  }
  next();
}, validatePrescription, PrescriptionController.create);

// GET logged-in patient's own prescriptions (Section 15 of PRD)
router.get('/my', authenticateToken, PrescriptionController.getMyPrescriptions);

router.get('/:id', authenticateToken, PrescriptionController.getById);

// Get prescriptions for a patient (RBAC enforced)
router.get('/patient/:patientId', authenticateToken, verifyPrescriptionAccess, PrescriptionController.getByPatient);

// Public cryptographic verification of prescription hash
router.get('/:id/verify', PrescriptionController.verify);

export default router;
