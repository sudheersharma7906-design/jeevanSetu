// server/modules/consult/consult.controller.js
import { ConsultService } from './consult.service.js';
import { PrescriptionService } from '../prescription/prescription.service.js';

export class ConsultController {
  static async escalate(req, res) {
    try {
      const data = {
        patientId: req.body.patientId,
        rmpId: req.body.rmpId || (req.user?.role === 'rmp' ? req.user.id : null),
        targetSpecialty: req.body.targetSpecialty,
        assignedDoctorId: req.body.assignedDoctorId,
        symptoms: req.body.symptoms,
        vitals: req.body.vitals,
        urgency: req.body.urgency,
        notes: req.body.notes
      };

      const result = ConsultService.escalateCase(data);
      res.status(201).json({
        success: true,
        message: 'Case escalated to specialist consult queue.',
        consult: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getQueue(req, res) {
    try {
      const { specialty, doctorId, status, rmpId } = req.query;
      const queue = ConsultService.getQueue({ specialty, doctorId, status, rmpId });
      res.status(200).json({
        success: true,
        count: queue.length,
        queue
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
      const consult = ConsultService.getConsultById(req.params.id);
      res.status(200).json({
        success: true,
        consult
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status, notes } = req.body;
      const updated = ConsultService.updateStatus(req.params.id, status, notes);
      res.status(200).json({
        success: true,
        consult: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async complete(req, res) {
    try {
      const { diagnosis, advice } = req.body;
      const doctorId = req.user?.id || req.body.doctorId;
      const updated = ConsultService.completeConsult(req.params.id, { diagnosis, advice, doctorId });
      res.status(200).json({
        success: true,
        consult: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async prescribe(req, res) {
    try {
      const consultId = req.params.id;
      const rxData = {
        consultationId: consultId,
        doctorId: req.user?.id || req.body.doctorId,
        patientId: req.body.patientId,
        diagnosis: req.body.diagnosis,
        vitals: req.body.vitals,
        medications: req.body.medications,
        dietaryAdvice: req.body.dietaryAdvice,
        followUpDate: req.body.followUpDate
      };

      const prescription = PrescriptionService.createPrescription(rxData);
      res.status(201).json({
        success: true,
        message: 'Prescription generated with digital signature hash.',
        prescription
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}
