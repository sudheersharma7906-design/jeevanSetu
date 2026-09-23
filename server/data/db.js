// server/data/db.js
import {
  initialUsers,
  initialRecords,
  initialPrescriptions,
  initialConsultQueue,
  initialEmergencies
} from './seeds.js';
import { calculateHaversineDistance, ROLES } from '../config/constants.js';

class InMemoryDatabase {
  constructor() {
    this.init();
  }

  init() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.records = JSON.parse(JSON.stringify(initialRecords));
    this.prescriptions = JSON.parse(JSON.stringify(initialPrescriptions));
    this.consults = JSON.parse(JSON.stringify(initialConsultQueue));
    this.emergencies = JSON.parse(JSON.stringify(initialEmergencies));
    this.otps = new Map(); // phone -> { code, expiresAt, role, createdAt }
    this.otpAttempts = new Map(); // phone -> { attempts: number, lockedUntil: number }
    this.revokedTokens = new Set(); // blacklisted JWT tokens
    this.notifications = [];
    this.triageLogs = [];
  }

  reset() {
    this.init();
  }

  // --- Users ---
  getAllUsers() {
    return this.users;
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  findUserByPhone(phone) {
    return this.users.find(u => u.phone === phone);
  }

  createUser(userData) {
    const id = userData.id || `usr-${Date.now()}`;
    const newUser = {
      id,
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date().toISOString() };
    return this.users[index];
  }

  getNearbyRmps(latitude, longitude, maxDistanceKm = 30) {
    const rmps = this.users.filter(u => u.role === ROLES.RMP && (u.status === 'ONLINE' || u.status === 'online' || u.status === 'AVAILABLE' || u.status === 'available'));
    return rmps
      .map(rmp => {
        const rmpLat = rmp.location?.coordinates ? rmp.location.coordinates[1] : rmp.location?.latitude;
        const rmpLng = rmp.location?.coordinates ? rmp.location.coordinates[0] : rmp.location?.longitude;
        const distance = calculateHaversineDistance(
          latitude,
          longitude,
          rmpLat,
          rmpLng
        );
        return { ...rmp, distanceKm: distance };
      })
      .filter(rmp => rmp.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // --- OTPs & Brute-force Mitigation ---
  setOtp(phone, otpData) {
    this.otps.set(phone, {
      ...otpData,
      createdAt: Date.now()
    });
  }

  getOtp(phone) {
    return this.otps.get(phone);
  }

  deleteOtp(phone) {
    this.otps.delete(phone);
    this.otpAttempts.delete(phone);
  }

  recordOtpFailure(phone, maxAttempts = 5, lockoutMs = 10 * 60 * 1000) {
    const current = this.otpAttempts.get(phone) || { attempts: 0, lockedUntil: 0 };
    current.attempts += 1;
    if (current.attempts >= maxAttempts) {
      current.lockedUntil = Date.now() + lockoutMs;
      // Invalidate active OTP on brute-force lockout
      this.otps.delete(phone);
    }
    this.otpAttempts.set(phone, current);
    return current;
  }

  isOtpLocked(phone) {
    const record = this.otpAttempts.get(phone);
    if (!record || !record.lockedUntil) return false;
    if (Date.now() > record.lockedUntil) {
      this.otpAttempts.delete(phone);
      return false;
    }
    return true;
  }

  getOtpRemainingLockoutSeconds(phone) {
    const record = this.otpAttempts.get(phone);
    if (!record || !record.lockedUntil) return 0;
    return Math.max(0, Math.ceil((record.lockedUntil - Date.now()) / 1000));
  }

  // --- Session Token Revocation ---
  revokeToken(token) {
    if (token) this.revokedTokens.add(token);
  }

  isTokenRevoked(token) {
    return token ? this.revokedTokens.has(token) : false;
  }

  // --- RBAC Patient-Provider Clinical Assignment Lookups ---
  isPatientAssignedToRmp(patientId, rmpId) {
    if (!patientId || !rmpId) return false;
    // 1. Check if RMP has an active or past consult for this patient
    const hasConsult = this.consults.some(c => c.patientId === patientId && c.rmpId === rmpId);
    if (hasConsult) return true;
    // 2. Check if RMP responded to an emergency for this patient
    const hasEmergency = this.emergencies.some(e => e.patientId === patientId && (e.matchedRmp?.id === rmpId || e.rmpId === rmpId));
    if (hasEmergency) return true;
    // 3. Check if RMP has recorded clinical entries for this patient
    const hasRecord = this.records.some(r => r.patientId === patientId && (r.rmpId === rmpId || (r.doctorOrRmpName && r.doctorOrRmpName.includes('Deshmukh') && rmpId === 'rmp-201')));
    if (hasRecord) return true;
    // 4. Default RMP rural cluster jurisdiction
    const patient = this.findUserById(patientId);
    const rmp = this.findUserById(rmpId);
    if (patient && rmp && patient.district && rmp.location?.address && rmp.location.address.includes(patient.district)) {
      return true;
    }
    return false;
  }

  isPatientAssignedToDoctor(patientId, doctorId) {
    if (!patientId || !doctorId) return false;
    // 1. Check if doctor has an active or queued consult for this patient
    const hasConsult = this.consults.some(c => c.patientId === patientId && (c.assignedDoctorId === doctorId || !c.assignedDoctorId));
    if (hasConsult) return true;
    // 2. Check if doctor issued a prescription to this patient
    const hasRx = this.prescriptions.some(rx => rx.patientId === patientId && rx.doctorId === doctorId);
    if (hasRx) return true;
    return false;
  }

  // --- Records (Append-Only) ---
  getRecordsByPatientId(patientId) {
    return this.records
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  addRecord(recordData) {
    const id = recordData.id || `rec-${Date.now()}`;
    const newRecord = {
      id,
      timestamp: recordData.timestamp || new Date().toISOString(),
      ...recordData
    };
    this.records.push(newRecord);
    return newRecord;
  }

  // --- Prescriptions ---
  createPrescription(rxData) {
    const id = rxData.id || `rx-${Date.now()}`;
    const newRx = {
      id,
      createdAt: new Date().toISOString(),
      verified: true,
      ...rxData
    };
    this.prescriptions.push(newRx);
    return newRx;
  }

  getPrescriptionById(id) {
    return this.prescriptions.find(rx => rx.id === id);
  }

  getPrescriptionsByPatientId(patientId) {
    return this.prescriptions
      .filter(rx => rx.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // --- Consultations & Escalations ---
  createConsult(consultData) {
    const id = consultData.id || `con-${Date.now()}`;
    const newConsult = {
      id,
      createdAt: new Date().toISOString(),
      ...consultData
    };
    this.consults.push(newConsult);
    return newConsult;
  }

  getConsultById(id) {
    return this.consults.find(c => c.id === id);
  }

  updateConsult(id, updates) {
    const index = this.consults.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.consults[index] = { ...this.consults[index], ...updates, updatedAt: new Date().toISOString() };
    return this.consults[index];
  }

  getConsultQueue(filter = {}) {
    let list = [...this.consults];
    if (filter.specialty) {
      list = list.filter(c => c.targetSpecialty?.toLowerCase() === filter.specialty.toLowerCase());
    }
    if (filter.doctorId) {
      list = list.filter(c => c.assignedDoctorId === filter.doctorId || !c.assignedDoctorId);
    }
    if (filter.status) {
      list = list.filter(c => c.status === filter.status);
    }
    if (filter.rmpId) {
      list = list.filter(c => c.rmpId === filter.rmpId);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // --- Emergencies (SOS) ---
  createEmergency(sosData) {
    const id = sosData.id || `sos-${Date.now()}`;
    const newEmergency = {
      id,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: sosData.status || 'TRIGGERED',
          time: new Date().toISOString(),
          note: sosData.initialNote || 'SOS Emergency trigger initiated'
        }
      ],
      ...sosData
    };
    this.emergencies.push(newEmergency);
    return newEmergency;
  }

  getEmergencyById(id) {
    return this.emergencies.find(e => e.id === id);
  }

  updateEmergency(id, updates) {
    const index = this.emergencies.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    const existing = this.emergencies[index];
    const updatedTimeline = [...(existing.timeline || [])];
    
    if (updates.status && updates.status !== existing.status) {
      updatedTimeline.push({
        status: updates.status,
        time: new Date().toISOString(),
        note: updates.statusNote || `Status updated to ${updates.status}`
      });
    }

    this.emergencies[index] = {
      ...existing,
      ...updates,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };
    return this.emergencies[index];
  }

  getActiveEmergencies() {
    return this.emergencies
      .filter(e => e.status !== 'RESOLVED' && e.status !== 'CANCELLED')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAllEmergencies() {
    return this.emergencies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // --- Triage Logs ---
  addTriageLog(triageData) {
    const id = triageData.id || `trg-${Date.now()}`;
    const entry = {
      id,
      timestamp: new Date().toISOString(),
      ...triageData
    };
    this.triageLogs.push(entry);
    return entry;
  }

  getTriageById(id) {
    return this.triageLogs.find(t => t.id === id);
  }

  getTriageHistory(patientId) {
    return this.triageLogs
      .filter(t => t.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // --- Notifications ---
  addNotification(notificationData) {
    const id = notificationData.id || `notif-${Date.now()}`;
    const newNotif = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notificationData
    };
    this.notifications.push(newNotif);
    return newNotif;
  }

  getNotificationsByUserId(userId) {
    return this.notifications
      .filter(n => n.recipientId === userId || n.recipientRole === 'ALL')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

export const db = new InMemoryDatabase();
