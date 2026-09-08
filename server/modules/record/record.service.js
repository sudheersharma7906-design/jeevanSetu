import { db } from '../../data/db.js';
import { HealthRecord, User } from '../../models/index.js';

export class RecordService {
  /**
   * Retrieves append-only health timeline for a patient.
   */
  static async getRecordsByPatientId(patientId) {
    if (!patientId) {
      throw new Error('Patient identity missing.');
    }

    let patient = null;
    let records = [];

    try {
      patient = await User.findById(patientId);
      if (patient) {
        records = await HealthRecord.find({ patientId: patient._id }).sort({ timestamp: -1 });
        return {
          patient: {
            id: patient._id.toString(),
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            abhaId: patient.abhaId,
            allergies: patient.allergies,
            chronicConditions: patient.chronicConditions
          },
          count: records.length,
          records: records.map(r => r.toObject ? r.toObject() : r)
        };
      }
    } catch (err) {
      // Mongo fallback
    }

    patient = db.findUserById(patientId);
    if (!patient) {
      throw new Error(`Patient with ID '${patientId}' not found.`);
    }

    records = db.getRecordsByPatientId(patientId);
    return {
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        abhaId: patient.abhaId,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions
      },
      count: records.length,
      records
    };
  }

  /**
   * Appends a new verified health event/record to the patient timeline.
   */
  static async addRecord(patientId, data) {
    if (!patientId) {
      throw new Error('Patient identity missing.');
    }

    const {
      type = 'General Health Note',
      title,
      doctorOrRmpName = 'Health Practitioner',
      facility = 'JivanSetu Health Center',
      details = {},
      notes = '',
      attachments = []
    } = data;

    if (!title) {
      throw new Error('Record title is required.');
    }

    try {
      const patient = await User.findById(patientId);
      if (patient) {
        const created = await HealthRecord.create({
          patientId: patient._id,
          type,
          title,
          doctorOrRmpName,
          facility,
          details,
          notes,
          timestamp: new Date()
        });
        return created.toObject();
      }
    } catch (err) {
      // Mongo fallback
    }

    const patient = db.findUserById(patientId);
    if (!patient) {
      throw new Error(`Patient with ID '${patientId}' not found.`);
    }

    const newRecord = db.addRecord({
      patientId,
      timestamp: new Date().toISOString(),
      type,
      title,
      doctorOrRmpName,
      facility,
      details,
      notes,
      attachments
    });

    return newRecord;
  }
}
