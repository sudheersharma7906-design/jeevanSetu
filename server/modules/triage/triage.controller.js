// server/modules/triage/triage.controller.js
import { TriageService } from './triage.service.js';

export class TriageController {
  /**
   * Evaluate symptoms & vitals for assistive clinical prioritization.
   * Returns assistive score, urgency rating, and explicit non-diagnosis disclaimers.
   */
  static async evaluate(req, res) {
    try {
      const patientId = req.user?.patientId || req.user?.id;
      if (!patientId) {
        return res.status(401).json({ success: false, error: 'Authentication required. Patient identity missing.' });
      }

      const triageData = {
        patientId,
        symptoms: req.body.symptoms,
        vitals: req.body.vitals || {},
        duration: req.body.duration || '',
        painScale: req.body.painScale || 0,
        notes: req.body.notes || ''
      };

      const engineType = req.body.engineType || process.env.TRIAGE_ENGINE_TYPE || 'rules';
      const result = await TriageService.evaluateTriage(triageData, engineType);

      res.status(200).json({
        success: true,
        isAssistiveTriage: true,
        isDiagnosis: false,
        disclaimer: result.disclaimer,
        disclaimerHi: result.disclaimerHi,
        triage: result
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
      const log = TriageService.getTriageById(req.params.id);
      res.status(200).json({
        success: true,
        isAssistiveTriage: true,
        isDiagnosis: false,
        disclaimer: log.disclaimer,
        triage: log
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getHistoryByPatient(req, res) {
    try {
      const patientId = req.params.patientId || req.user?.id;
      const history = TriageService.getTriageHistory(patientId);
      res.status(200).json({
        success: true,
        isAssistiveTriage: true,
        count: history.length,
        history
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getEngineInfo(req, res) {
    try {
      const metadata = TriageService.getEngineInfo();
      res.status(200).json({
        success: true,
        engine: metadata
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
}
