// server/modules/consult/consult.service.js
import { db } from '../../data/db.js';
import { CONSULT_STATUS, TRIAGE_LEVELS, ROLES } from '../../config/constants.js';

export class ConsultService {
  /**
   * Escalates a patient case from RMP to a Specialist Teleconsultation Doctor.
   */
  static escalateCase(data) {
    const {
      patientId,
      rmpId,
      targetSpecialty = 'General Medicine',
      assignedDoctorId,
      symptoms = '',
      vitals = {},
      urgency = TRIAGE_LEVELS.URGENT,
      notes = ''
    } = data;

    if (!patientId) {
      throw new Error('Patient ID is required for consultation escalation.');
    }

    const patient = db.findUserById(patientId);
    if (!patient) {
      throw new Error(`Patient with ID '${patientId}' not found.`);
    }

    let rmpName = 'Direct Request';
    if (rmpId) {
      const rmp = db.findUserById(rmpId);
      if (rmp) rmpName = rmp.name;
    }

    let doctorId = assignedDoctorId;
    if (!doctorId) {
      // Auto-match an available specialist doctor in that specialty
      const availableDoc = db.getAllUsers().find(
        u => u.role === ROLES.DOCTOR &&
             u.status === 'AVAILABLE' &&
             (!targetSpecialty || u.specialty?.toLowerCase().includes(targetSpecialty.toLowerCase()))
      );
      if (availableDoc) {
        doctorId = availableDoc.id;
      }
    }

    const newConsult = db.createConsult({
      patientId,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientAge: patient.age,
      patientGender: patient.gender,
      rmpId: rmpId || null,
      rmpName,
      targetSpecialty,
      assignedDoctorId: doctorId || null,
      urgency,
      symptoms,
      vitals,
      status: CONSULT_STATUS.QUEUED,
      notes,
      roomSessionId: `room-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    });

    // Notify doctor
    if (doctorId) {
      db.addNotification({
        type: 'CONSULT_ESCALATION',
        title: `New ${urgency} Consultation Request`,
        message: `Patient ${patient.name} escalated by ${rmpName} for ${targetSpecialty}.`,
        recipientId: doctorId,
        recipientRole: ROLES.DOCTOR,
        metadata: { consultId: newConsult.id }
      });
    }

    // Append to patient record
    db.addRecord({
      patientId,
      type: 'Teleconsultation Escalation',
      title: `Escalated to ${targetSpecialty} Specialist`,
      doctorOrRmpName: rmpName,
      facility: 'JivanSetu Telemed Bridge',
      details: {
        consultId: newConsult.id,
        targetSpecialty,
        assignedDoctorId: doctorId,
        vitals,
        urgency
      },
      notes: `Escalation Reason: ${notes || symptoms}`
    });

    return newConsult;
  }

  static getQueue(filter = {}) {
    return db.getConsultQueue(filter);
  }

  static getConsultById(id) {
    const consult = db.getConsultById(id);
    if (!consult) {
      throw new Error(`Consultation with ID '${id}' not found.`);
    }
    return consult;
  }

  static updateStatus(id, status, notes = '') {
    const valid = Object.values(CONSULT_STATUS);
    if (!valid.includes(status)) {
      throw new Error(`Invalid status '${status}'. Valid: ${valid.join(', ')}`);
    }

    const consult = db.getConsultById(id);
    if (!consult) {
      throw new Error(`Consultation with ID '${id}' not found.`);
    }

    return db.updateConsult(id, { status, statusNote: notes });
  }

  static completeConsult(id, { diagnosis, advice, doctorId }) {
    const consult = db.getConsultById(id);
    if (!consult) {
      throw new Error(`Consultation with ID '${id}' not found.`);
    }

    const doctor = doctorId ? db.findUserById(doctorId) : null;
    const docName = doctor ? doctor.name : 'Specialist Doctor';

    const updated = db.updateConsult(id, {
      status: CONSULT_STATUS.COMPLETED,
      diagnosis,
      advice,
      completedAt: new Date().toISOString()
    });

    // Record in EHR
    db.addRecord({
      patientId: consult.patientId,
      type: 'Completed Teleconsultation',
      title: `Consultation: ${consult.targetSpecialty} (${diagnosis || 'Review'})`,
      doctorOrRmpName: docName,
      facility: 'JivanSetu Telemedicine Hub',
      details: {
        consultId: consult.id,
        diagnosis,
        advice,
        vitals: consult.vitals
      },
      notes: advice || 'Consultation completed successfully.'
    });

    return updated;
  }
}
