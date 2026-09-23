// server/modules/triage/triage.service.js
import { db } from '../../data/db.js';
import { getTriageEngine } from './triage-engine.interface.js';
import { TriageResult, HealthRecord, User } from '../../models/index.js';

export class TriageService {
  /**
   * Evaluates patient symptoms and vitals using the in-process triage engine.
   * NOTE: This is an ASSISTIVE CLINICAL TRIAGE tool for prioritization, NOT a medical diagnosis.
   */
  static async evaluateTriage(input, engineType) {
    const engine = getTriageEngine(engineType);
    const triageResult = engine.evaluate(input);

    // Explicitly enforce assistive non-diagnosis contract
    triageResult.triageType = 'assistive_triage';
    triageResult.isAssistiveTriage = true;
    triageResult.isDiagnosis = false;

    // Structured audit logging
    console.log(`[ASSISTIVE_TRIAGE_EVALUATED] Patient: ${triageResult.patientId} | Urgency: ${triageResult.urgency} (${triageResult.score}/100) | Engine: ${triageResult.engineMetadata?.name} v${triageResult.engineMetadata?.version} | Note: Assistive triage only, not diagnosis`);

    let savedMongo = null;

    // Persist to MongoDB TriageResult collection
    try {
      savedMongo = await TriageResult.create({
        patientId: triageResult.patientId || 'anonymous',
        symptoms: Array.isArray(triageResult.symptoms) ? triageResult.symptoms : [triageResult.symptoms || 'General Checkup'],
        urgencyLevel: (triageResult.urgency || 'routine').toLowerCase(),
        guidanceText: triageResult.recommendedAction || triageResult.disclaimer || 'Assistive Triage Evaluated',
        score: triageResult.score || 0,
        vitals: triageResult.vitals || {},
        duration: triageResult.duration || '',
        painScale: triageResult.painScale || 0,
        recommendedSpecialty: triageResult.recommendedSpecialty || 'General Medicine',
        flagsDetected: triageResult.flagsDetected || {},
        requiresImmediateSos: Boolean(triageResult.requiresImmediateSos)
      });
    } catch (err) {
      console.warn('[TRIAGE] MongoDB create notice (falling back to memory):', err.message);
    }

    // Persist to Triage Log history (memory DB sync)
    const saved = db.addTriageLog(triageResult);
    if (savedMongo) {
      saved.id = savedMongo._id.toString();
    }

    // If attached to a known registered patient, append an EHR timeline record
    if (triageResult.patientId && triageResult.patientId !== 'anonymous') {
      try {
        await HealthRecord.create({
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
      } catch (e) {}

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

    return saved;
  }

  static async getTriageById(id) {
    try {
      const mongoTriage = await TriageResult.findById(id);
      if (mongoTriage) {
        const obj = mongoTriage.toObject();
        obj.id = obj._id.toString();
        return obj;
      }
    } catch (e) {}

    const log = db.getTriageById(id);
    if (!log) {
      throw new Error(`Triage evaluation with ID '${id}' not found.`);
    }
    return log;
  }

  static async getTriageHistory(patientId) {
    try {
      const mongoHistory = await TriageResult.find({ patientId }).sort({ createdAt: -1 });
      if (mongoHistory && mongoHistory.length > 0) {
        return mongoHistory.map(t => {
          const obj = t.toObject();
          return { ...obj, id: obj._id.toString() };
        });
      }
    } catch (e) {}

    return db.getTriageHistory(patientId);
  }

  static getEngineInfo() {
    const engine = getTriageEngine();
    return engine.getEngineMetadata();
  }
}
