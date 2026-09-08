// server/modules/user/user.controller.js
import { UserService } from './user.service.js';

export class UserController {
  static async getPatientMe(req, res) {
    try {
      const patientId = req.user?.patientId || req.user?.id;
      if (!patientId) {
        return res.status(401).json({ success: false, error: 'Patient identity missing.' });
      }
      const patient = await UserService.getPatientById(patientId);
      res.status(200).json({ success: true, patient });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  static async getPatientById(req, res) {
    try {
      const patient = await UserService.getPatientById(req.params.id);
      res.status(200).json({ success: true, patient });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({ success: true, user });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const updated = await UserService.updateUserProfile(req.params.id, req.body);
      res.status(200).json({ success: true, user: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateLocation(req, res) {
    try {
      const userId = req.params.id || req.user?.id;
      const updated = await UserService.updateUserLocation(userId, req.body);
      res.status(200).json({ success: true, user: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getNearbyRmps(req, res) {
    try {
      const { lat, lng, radius } = req.query;
      const rmps = await UserService.getNearbyRmps(lat, lng, radius ? parseFloat(radius) : 30);
      res.status(200).json({ success: true, count: rmps.length, rmps });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getDoctors(req, res) {
    try {
      const { specialty } = req.query;
      const doctors = await UserService.getDoctors(specialty);
      res.status(200).json({ success: true, count: doctors.length, doctors });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async toggleRmpStatus(req, res) {
    try {
      const rmpId = req.user?.id || req.body.rmpId;
      const { status } = req.body;
      const updated = await UserService.toggleRmpStatus(rmpId, status);
      res.status(200).json({ success: true, rmp: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getAllPatients(req, res) {
    try {
      const patients = await UserService.getAllPatients();
      res.status(200).json({ success: true, count: patients.length, patients });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
