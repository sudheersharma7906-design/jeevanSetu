// server/modules/user/user.routes.js
import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticateToken, optionalAuth } from '../../middleware/auth.js';

const router = Router();

// Self patient profile endpoint (Section 13 of PRD)
router.get('/me', authenticateToken, UserController.getPatientMe);
router.get('/patients/me', authenticateToken, UserController.getPatientMe);

// Public / Authenticated provider discovery
router.get('/rmps/nearby', UserController.getNearbyRmps);
router.get('/doctors/list', UserController.getDoctors);

// RBAC Guard: Patients cannot browse master patient directory
router.get('/patients/all', optionalAuth, (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    return res.status(403).json({
      success: false,
      error: 'Access denied (RBAC). Patients cannot browse community patient registry.'
    });
  }
  next();
}, UserController.getAllPatients);

// Patient profile view: RBAC ensures patients can only view their own profile
router.get('/:id', optionalAuth, (req, res, next) => {
  if (req.user && req.user.role === 'patient' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied (RBAC). Patients may only view their own profile.'
    });
  }
  next();
}, UserController.getUserById);

// Update user profile (Only self or admin)
router.put('/:id', optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only update your own user profile.'
    });
  }
  next();
}, UserController.updateUser);

// RMP operational location update (Explicit location update, not background tracking)
router.put('/:id/location', optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only update your own operational station.'
    });
  }
  next();
}, UserController.updateLocation);

router.post('/rmp/status', optionalAuth, UserController.toggleRmpStatus);

export default router;
