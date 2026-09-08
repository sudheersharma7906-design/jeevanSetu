// server/middleware/validator.js
import { ROLES, TRIAGE_LEVELS } from '../config/constants.js';

/**
 * Helper to respond with standard validation failure error.
 */
function validationError(res, message, fields = []) {
  return res.status(400).json({
    success: false,
    error: `Validation Error: ${message}`,
    invalidFields: fields
  });
}

/**
 * Validates Password-based Login payload: phone (10-digit number), password (min 4 chars), and optional role.
 */
export function validateLogin(req, res, next) {
  const { phone, password, role } = req.body || {};
  const invalidFields = [];

  if (!phone) {
    invalidFields.push('phone');
  } else {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone) && !/^\d{10}$/.test(cleanPhone)) {
      invalidFields.push('phone');
    }
  }

  if (!password || typeof password !== 'string' || password.trim().length < 3) {
    invalidFields.push('password');
  }

  if (role && !Object.values(ROLES).includes(role.toLowerCase())) {
    invalidFields.push('role');
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Valid 10-digit mobile number and password (min 3 characters) are required.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates Sign Up / Registration payload: name, phone (10-digit number), password (min 4 chars), and role.
 */
export function validateSignup(req, res, next) {
  const { name, phone, password, role } = req.body || {};
  const invalidFields = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    invalidFields.push('name');
  }

  if (!phone) {
    invalidFields.push('phone');
  } else {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone) && !/^\d{10}$/.test(cleanPhone)) {
      invalidFields.push('phone');
    }
  }

  if (!password || typeof password !== 'string' || password.trim().length < 4) {
    invalidFields.push('password');
  }

  if (role && !Object.values(ROLES).includes(role.toLowerCase())) {
    invalidFields.push('role');
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Valid name, 10-digit mobile number, password (min 4 characters), and role are required.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates OTP Request payload: phone (10-digit number) and role enum.
 */
export function validateOtpRequest(req, res, next) {
  const { phone, role } = req.body || {};
  const invalidFields = [];

  if (!phone) {
    invalidFields.push('phone');
  } else {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      invalidFields.push('phone');
    }
  }

  if (role && !Object.values(ROLES).includes(role.toLowerCase())) {
    invalidFields.push('role');
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Valid 10-digit mobile number (Indian format 6-9xxxxxxxx) and valid role are required.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates OTP Verification payload: phone and 6-digit numeric OTP.
 */
export function validateOtpVerify(req, res, next) {
  const { phone, otp } = req.body || {};
  const invalidFields = [];

  if (!phone) {
    invalidFields.push('phone');
  } else {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(cleanPhone)) {
      invalidFields.push('phone');
    }
  }

  if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
    invalidFields.push('otp');
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'A valid 10-digit phone number and 6-digit verification code (OTP) are required.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates AI Triage evaluation payload.
 */
export function validateTriage(req, res, next) {
  const { patientId, symptoms, vitals, painScale } = req.body || {};
  const invalidFields = [];

  if (!patientId || typeof patientId !== 'string' || patientId.trim().length === 0) {
    invalidFields.push('patientId');
  }

  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
    invalidFields.push('symptoms');
  }

  if (painScale != null) {
    const p = Number(painScale);
    if (isNaN(p) || p < 0 || p > 10) {
      invalidFields.push('painScale');
    }
  }

  if (vitals && typeof vitals === 'object') {
    if (vitals.bp && typeof vitals.bp === 'string' && !/^\d{2,3}\/\d{2,3}/.test(vitals.bp)) {
      invalidFields.push('vitals.bp');
    }
    if (vitals.spo2 != null) {
      const spo2 = Number(String(vitals.spo2).replace('%', ''));
      if (isNaN(spo2) || spo2 < 40 || spo2 > 100) {
        invalidFields.push('vitals.spo2');
      }
    }
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Triage assessment requires a valid patientId, descriptive symptoms (min 3 chars), and valid vitals.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates Consult Escalation payload.
 */
export function validateConsultEscalate(req, res, next) {
  const { patientId, rmpId, targetSpecialty, urgency } = req.body || {};
  const invalidFields = [];

  if (!patientId || typeof patientId !== 'string') invalidFields.push('patientId');
  if (!rmpId || typeof rmpId !== 'string') invalidFields.push('rmpId');
  if (!targetSpecialty || typeof targetSpecialty !== 'string') invalidFields.push('targetSpecialty');

  if (urgency && !Object.values(TRIAGE_LEVELS).includes(urgency.toUpperCase())) {
    invalidFields.push('urgency');
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Consultation escalation requires patientId, rmpId, targetSpecialty, and valid urgency.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates Digital Prescription creation payload.
 */
export function validatePrescription(req, res, next) {
  const { patientId, doctorId, diagnosis, medications, medicines } = req.body || {};
  const invalidFields = [];

  if (!patientId || typeof patientId !== 'string') invalidFields.push('patientId');
  if (!doctorId && !req.user?.id) invalidFields.push('doctorId');
  if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim().length < 2) invalidFields.push('diagnosis');

  const medsList = medications || medicines;
  if (!Array.isArray(medsList) || medsList.length === 0) {
    invalidFields.push('medications');
  } else {
    medsList.forEach((med, idx) => {
      if (!med.name || typeof med.name !== 'string' || med.name.trim().length === 0) {
        invalidFields.push(`medications[${idx}].name`);
      }
    });
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Prescription creation requires valid patientId, doctorId, clinical diagnosis, and at least one medication.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates Emergency SOS trigger payload.
 */
export function validateEmergencySos(req, res, next) {
  const { patientId, latitude, longitude } = req.body || {};
  const invalidFields = [];

  if (!patientId || typeof patientId !== 'string') invalidFields.push('patientId');

  if (latitude != null) {
    const lat = Number(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) invalidFields.push('latitude');
  }

  if (longitude != null) {
    const lng = Number(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) invalidFields.push('longitude');
  }

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Emergency SOS trigger requires valid patientId and valid geographic coordinates.',
      invalidFields
    );
  }

  next();
}

/**
 * Validates Health Record creation payload.
 */
export function validateRecord(req, res, next) {
  const patientId = req.params?.patientId || req.body?.patientId;
  const { type, title } = req.body || {};
  const invalidFields = [];

  if (!patientId || typeof patientId !== 'string') invalidFields.push('patientId');
  if (!title && !type) invalidFields.push('title or type');

  if (invalidFields.length > 0) {
    return validationError(
      res,
      'Health record append requires valid patientId and title or type.',
      invalidFields
    );
  }

  next();
}
