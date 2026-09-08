// server/modules/prescription/prescription.controller.js
import { PrescriptionService } from './prescription.service.js';

export class PrescriptionController {
  static async create(req, res) {
    try {
      const data = {
        ...req.body,
        doctorId: req.user?.id || req.body.doctorId
      };
      const rx = await PrescriptionService.createPrescription(data);
      res.status(201).json({
        success: true,
        message: 'Prescription created successfully.',
        prescription: rx
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const rx = await PrescriptionService.getPrescriptionById(req.params.id);
      res.status(200).json({
        success: true,
        prescription: rx
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getMyPrescriptions(req, res) {
    try {
      const patientId = req.user?.patientId || req.user?.id;
      if (!patientId) {
        return res.status(401).json({ success: false, error: 'Patient identity missing.' });
      }
      const list = await PrescriptionService.getPrescriptionsByPatientId(patientId);
      res.status(200).json({
        success: true,
        count: list.length,
        prescriptions: list
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getByPatient(req, res) {
    try {
      const patientId = req.params.patientId || req.user?.patientId || req.user?.id;
      const list = await PrescriptionService.getPrescriptionsByPatientId(patientId);
      res.status(200).json({
        success: true,
        count: list.length,
        prescriptions: list
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async verify(req, res) {
    try {
      const verification = await PrescriptionService.verifySignature(req.params.id);
      res.status(200).json({
        success: true,
        verification
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }
}
