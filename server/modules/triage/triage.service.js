// server/modules/triage/triage.service.js
import { db } from '../../data/db.js';
import { getTriageEngine } from './triage-engine.interface.js';

export class TriageService {
  /**
   * Evaluates patient symptoms and vitals using the in-process triage engine.
   * NOTE: This is an ASSISTIVE CLINICAL TRIAGE tool for prioritization, NOT a medical diagnosis.
   * @param {Object} input - { patientId, symptoms, vitals: { spo2, bp, temp, pulse }, duration, painScale, notes }
   * @param {string} [engineType] - Optional override ('rules' | 'ml_classifier')
   */
  static evaluateTriage(input, engineType) {
    const engine = getTriageEngine(engineType);
    const triageResult = engine.evaluate(input);

    // Explicitly enforce assistive non-diagnosis contract
    triageResult.triageType = 'assistive_triage';
    triageResult.isAssistiveTriage = true;
    triageResult.isDiagnosis = false;

    // Structured audit logging
    console.log(`[ASSISTIVE_TRIAGE_EVALUATED] Patient: ${triageResult.patientId} | Urgency: ${triageResult.urgency} (${triageResult.score}/100) | Engine: ${triageResult.engineMetadata?.name} v${triageResult.engineMetadata?.version} | Note: Assistive triage only, not diagnosis`);

    // Persist to Triage Log history
    const saved = db.addTriageLog(triageResult);

    // If attached to a known registered patient, append an EHR timeline record
    if (triageResult.patientId && triageResult.patientId !== 'anonymous') {
      const patient = db.findUserById(triageResult.patientId);
      if (patient) {
        db.addRecord({
          patientId: triageResult.patientId,
          type: 'ASSISTIVE_TRIAGE',
          isDiagnosis: false,
          title: `Assistive Triage: ${triageResult.urgency} (${triageResult.score}/100) - ${triageResult.recommendedSpecialty}`,
          doctorOrRmpName: 'JivanSetu Assistive Clinical Engine',
          facility: 'Digital Assistive Triage Desk',
          disclaimer: triageResult.disclaimer,
          disclaimerHi: triageResult.disclaimerHi,
          details: {
            symptoms: triageResult.symptoms,
            urgency: triageResult.urgency,
            score: triageResult.score,
            recommendedSpecialty: triageResult.recommendedSpecialty,
            vitals: triageResult.vitals,
            flags: triageResult.flagsDetected,
            matchedRuleId: triageResult.matchedRuleId
          },
          notes: `${triageResult.recommendedAction} (Assistive triage recommendation only. Formal clinical diagnosis pending doctor consult.)`
        });
      }
    }

    return saved;
  }

  static getTriageById(id) {
    const log = db.getTriageById(id);
    if (!log) {
      throw new Error(`Triage evaluation with ID '${id}' not found.`);
    }
    return log;
  }

  static getTriageHistory(patientId) {
    return db.getTriageHistory(patientId);
  }

  static getEngineInfo() {
    const engine = getTriageEngine();
    return engine.getEngineMetadata();
  }
}
