// server/modules/record/record.controller.js
import { RecordService } from './record.service.js';

export class RecordController {
  static async getMyRecords(req, res) {
    try {
      const patientId = req.user?.patientId || req.user?.id;
      if (!patientId) {
        return res.status(401).json({ success: false, error: 'Patient identity missing.' });
      }
      const result = await RecordService.getRecordsByPatientId(patientId);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getByPatientId(req, res) {
    try {
      const patientId = req.params.patientId || req.user?.patientId || req.user?.id;
      if (!patientId) {
        return res.status(400).json({ success: false, error: 'Patient identity missing.' });
      }
      const result = await RecordService.getRecordsByPatientId(patientId);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async addRecord(req, res) {
    try {
      const patientId = req.params.patientId || req.user?.patientId || req.user?.id;
      const record = await RecordService.addRecord(patientId, req.body);
      res.status(201).json({
        success: true,
        message: 'Record appended to immutable health timeline.',
        record
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}
