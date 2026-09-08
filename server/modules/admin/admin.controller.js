// server/modules/admin/admin.controller.js
import { AdminService } from './admin.service.js';

export class AdminController {
  static async getStats(req, res) {
    try {
      const stats = AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        stats
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getEmergencyLogs(req, res) {
    try {
      const logs = AdminService.getEmergencyAuditLogs();
      res.status(200).json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getUsers(req, res) {
    try {
      const { role } = req.query;
      const users = AdminService.getAllUsers(role);
      res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  static async verifyUser(req, res) {
    try {
      const { verified, status } = req.body;
      const updated = AdminService.verifyUser(req.params.id, { verified, status });
      res.status(200).json({
        success: true,
        message: 'User credentials updated.',
        user: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}
