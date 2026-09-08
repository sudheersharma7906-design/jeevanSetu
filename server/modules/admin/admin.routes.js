// server/modules/admin/admin.routes.js
import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const router = Router();

// RBAC Guard: Protect admin endpoints from non-admin roles
router.use(optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: `Access denied (RBAC). Admin privileges required. Current role: '${req.user.role}'`
    });
  }
  next();
});

router.get('/stats', AdminController.getStats);
router.get('/emergency-logs', AdminController.getEmergencyLogs);
router.get('/users', AdminController.getUsers);
router.post('/users/:id/verify', AdminController.verifyUser);

export default router;
