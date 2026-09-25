// server/modules/user/user.routes.js
import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';

const router = Router();

// Public provider discovery
router.get('/rmps/nearby', UserController.getNearbyRmps);
router.get('/doctors/list', UserController.getDoctors);

// Enforce authentication on all user profile endpoints
router.use(authenticateToken);

// Self patient profile endpoint
router.get('/me', UserController.getPatientMe);
router.get('/patients/me', UserController.getPatientMe);

// RBAC Guard: Patients cannot browse master patient directory
router.get('/patients/all', requireRoles(['rmp', 'doctor', 'admin']), UserController.getAllPatients);

// Patient profile view: RBAC ensures patients can only view their own profile
router.get('/:id', (req, res, next) => {
  if (req.user.role === 'patient' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied (RBAC). Patients may only view their own profile.'
    });
  }
  next();
}, UserController.getUserById);

// Update user profile (Only self or admin)
router.put('/:id', (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only update your own user profile.'
    });
  }
  next();
}, UserController.updateUser);

// RMP operational location update (Explicit location update, not background tracking)
router.put('/:id/location', (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only update your own operational station.'
    });
  }
  next();
}, UserController.updateLocation);

router.post('/rmp/status', requireRoles(['rmp', 'admin']), UserController.toggleRmpStatus);

export default router;
