// server/modules/consult/consult.service.js
import { db } from '../../data/db.js';
import { CONSULT_STATUS, TRIAGE_LEVELS, ROLES } from '../../config/constants.js';
import { Consult, HealthRecord, User } from '../../models/index.js';

export class ConsultService {
  /**
   * Escalates a patient case from RMP to a Specialist Teleconsultation Doctor.
   */
  static async escalateCase(data) {
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

    let patientName = 'Patient';
    let patientPhone = '';
    let patientAge = 35;
    let patientGender = 'Male';

    try {
      const pDoc = await User.findById(patientId);
      if (pDoc) {
        patientName = pDoc.name;
        patientPhone = pDoc.phone;
        patientAge = pDoc.age || 35;
        patientGender = pDoc.gender || 'Male';
      }
    } catch (e) {}

    if (patientName === 'Patient') {
      const pMem = db.findUserById(patientId);
      if (pMem) {
        patientName = pMem.name;
        patientPhone = pMem.phone;
        patientAge = pMem.age;
        patientGender = pMem.gender;
      }
    }

    let rmpName = 'Direct Request';
    if (rmpId) {
      try {
        const rmp = await User.findById(rmpId);
        if (rmp) rmpName = rmp.name;
      } catch (e) {}
      if (rmpName === 'Direct Request') {
        const rmpMem = db.findUserById(rmpId);
        if (rmpMem) rmpName = rmpMem.name;
      }
    }

    let doctorId = assignedDoctorId;
    if (!doctorId) {
      try {
        const availableDoc = await User.findOne({
          role: ROLES.DOCTOR,
          status: { $in: ['online', 'available', 'ONLINE', 'AVAILABLE'] }
        });
        if (availableDoc) doctorId = availableDoc._id.toString();
      } catch (e) {}

      if (!doctorId) {
        const availableDocMem = db.getAllUsers().find(
          u => u.role === ROLES.DOCTOR &&
               (u.status === 'AVAILABLE' || u.status === 'online') &&
               (!targetSpecialty || u.specialty?.toLowerCase().includes(targetSpecialty.toLowerCase()))
        );
        if (availableDocMem) doctorId = availableDocMem.id;
      }
    }

    const roomSessionId = `room-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    let newConsult = null;

    // 1. Try persisting to MongoDB
    try {
      const mongoConsult = await Consult.create({
        patientId,
        rmpId: rmpId || null,
        doctorId: doctorId || null,
        status: CONSULT_STATUS.QUEUED,
        targetSpecialty,
        urgency,
        symptoms,
        vitals,
        notes,
        roomSessionId
      });
      newConsult = mongoConsult.toObject();
      newConsult.id = mongoConsult._id.toString();
      newConsult.patientName = patientName;
      newConsult.patientPhone = patientPhone;
      newConsult.patientAge = patientAge;
      newConsult.patientGender = patientGender;
      newConsult.rmpName = rmpName;
      newConsult.assignedDoctorId = doctorId;

      await HealthRecord.create({
        patientId,
        type: 'Teleconsultation Escalation',
        title: `Escalated to ${targetSpecialty} Specialist`,
        doctorOrRmpName: rmpName,
        facility: 'JivanSetu Telemed Bridge',
        details: {
          consultId: mongoConsult._id.toString(),
          targetSpecialty,
          assignedDoctorId: doctorId,
          vitals,
          urgency
        },
        notes: `Escalation Reason: ${notes || symptoms}`
      });
    } catch (mongoErr) {
      console.warn('[CONSULT] MongoDB persist notice (falling back to memory):', mongoErr.message);
    }

    // 2. Fallback / Sync in memory DB
    const memoryConsult = db.createConsult({
      id: newConsult?.id || `con-${Date.now()}`,
      patientId,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      rmpId: rmpId || null,
      rmpName,
      targetSpecialty,
      assignedDoctorId: doctorId || null,
      urgency,
      symptoms,
      vitals,
      status: CONSULT_STATUS.QUEUED,
      notes,
      roomSessionId
    });

    db.addRecord({
      patientId,
      type: 'Teleconsultation Escalation',
      title: `Escalated to ${targetSpecialty} Specialist`,
      doctorOrRmpName: rmpName,
      facility: 'JivanSetu Telemed Bridge',
      details: {
        consultId: memoryConsult.id,
        targetSpecialty,
        assignedDoctorId: doctorId,
        vitals,
        urgency
      },
      notes: `Escalation Reason: ${notes || symptoms}`
    });

    return newConsult || memoryConsult;
  }

  static async getQueue(filter = {}) {
    try {
      const query = {};
      if (filter.status) query.status = filter.status.toLowerCase();
      if (filter.targetSpecialty) query.targetSpecialty = { $regex: filter.targetSpecialty, $options: 'i' };
      if (filter.doctorId) query.doctorId = filter.doctorId;
      if (filter.rmpId) query.rmpId = filter.rmpId;

      const mongoList = await Consult.find(query).sort({ createdAt: -1 });
      if (mongoList && mongoList.length > 0) {
        return mongoList.map(c => {
          const obj = c.toObject();
          return { ...obj, id: obj._id.toString() };
        });
      }
    } catch (e) {}

    return db.getConsultQueue(filter);
  }

  static async getConsultById(id) {
    try {
      const mongoConsult = await Consult.findById(id);
      if (mongoConsult) {
        const obj = mongoConsult.toObject();
        return { ...obj, id: obj._id.toString() };
      }
    } catch (e) {}

    const consult = db.getConsultById(id);
    if (!consult) {
      throw new Error(`Consultation with ID '${id}' not found.`);
    }
    return consult;
  }

  static async updateStatus(id, status, notes = '') {
    const valid = Object.values(CONSULT_STATUS);
    if (!valid.includes(status)) {
      throw new Error(`Invalid status '${status}'. Valid: ${valid.join(', ')}`);
    }

    try {
      const updated = await Consult.findByIdAndUpdate(
        id,
        { status: status.toLowerCase(), notes },
        { new: true }
      );
      if (updated) {
        db.updateConsult(id, { status, statusNote: notes });
        const obj = updated.toObject();
        return { ...obj, id: obj._id.toString() };
      }
    } catch (e) {}

    return db.updateConsult(id, { status, statusNote: notes });
  }

  static async completeConsult(id, { diagnosis, advice, doctorId }) {
    let docName = 'Specialist Doctor';

    if (doctorId) {
      try {
        const doctor = await User.findById(doctorId);
        if (doctor) docName = doctor.name;
      } catch (e) {}
    }

    try {
      const updated = await Consult.findByIdAndUpdate(
        id,
        {
          status: CONSULT_STATUS.COMPLETED.toLowerCase(),
          diagnosis,
          advice,
          closedAt: new Date()
        },
        { new: true }
      );
      if (updated) {
        await HealthRecord.create({
          patientId: updated.patientId,
          type: 'Completed Teleconsultation',
          title: `Consultation: ${updated.targetSpecialty} (${diagnosis || 'Review'})`,
          doctorOrRmpName: docName,
          facility: 'JivanSetu Telemedicine Hub',
          details: {
            consultId: updated._id.toString(),
            diagnosis,
            advice,
            vitals: updated.vitals
          },
          notes: advice || 'Consultation completed successfully.'
        });

        db.updateConsult(id, {
          status: CONSULT_STATUS.COMPLETED,
          diagnosis,
          advice,
          completedAt: new Date().toISOString()
        });

        const obj = updated.toObject();
        return { ...obj, id: obj._id.toString() };
      }
    } catch (e) {}

    const consult = db.getConsultById(id);
    if (!consult) {
      throw new Error(`Consultation with ID '${id}' not found.`);
    }

    const updated = db.updateConsult(id, {
      status: CONSULT_STATUS.COMPLETED,
      diagnosis,
      advice,
      completedAt: new Date().toISOString()
    });

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
