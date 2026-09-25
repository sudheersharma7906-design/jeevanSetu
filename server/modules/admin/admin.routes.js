// server/modules/admin/admin.routes.js
import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';

const router = Router();

// RBAC Guard: Protect admin endpoints - require authentication and admin role
router.use(authenticateToken);
router.use(requireRoles(['admin']));

router.get('/stats', AdminController.getStats);
router.get('/emergency-logs', AdminController.getEmergencyLogs);
router.get('/users', AdminController.getUsers);
router.post('/users/:id/verify', AdminController.verifyUser);

export default router;
