// server/modules/emergency/emergency.service.js
import { db } from '../../data/db.js';
import {
  EMERGENCY_STATUS,
  EMERGENCY_TIMEOUT_MS,
  DEFAULT_COORDINATES,
  calculateHaversineDistance,
  ROLES
} from '../../config/constants.js';
import { SmsService } from '../notification/sms.service.js';

export class EmergencyService {
  static activeTimers = new Map(); // emergencyId -> NodeJS.Timeout
  static socketEmitter = null; // Injected from socket server
  static isUserOnlineCheck = null;

  static setSocketEmitter(emitter) {
    this.socketEmitter = emitter;
  }

  static setIsUserOnlineCheck(fn) {
    this.isUserOnlineCheck = fn;
  }

  /**
   * Triggers an SOS emergency from button click or voice trigger.
   */
  static async triggerSos(data) {
    const {
      patientId = 'anonymous',
      phone = '',
      name = '',
      triggerType = 'BUTTON', // 'BUTTON' or 'VOICE'
      voiceTranscript = '',
      symptoms = 'Critical Emergency Reported',
      latitude = DEFAULT_COORDINATES.latitude,
      longitude = DEFAULT_COORDINATES.longitude,
      address = DEFAULT_COORDINATES.address
    } = data;

    // Find or lookup patient
    let patientName = name;
    let patientPhone = phone;

    if (patientId && patientId !== 'anonymous') {
      const patient = db.findUserById(patientId);
      if (patient) {
        patientName = patient.name;
        patientPhone = patient.phone;
      }
    }

    if (!patientName) patientName = 'Emergency Patient';

    const lat = parseFloat(latitude) || DEFAULT_COORDINATES.latitude;
    const lon = parseFloat(longitude) || DEFAULT_COORDINATES.longitude;

    // 1. Geo-match nearest RMPs (up to 30km)
    const nearbyRmps = db.getNearbyRmps(lat, lon, 30);
    const closestRmp = nearbyRmps.length > 0 ? nearbyRmps[0] : null;

    const matchedRmp = closestRmp
      ? {
          id: closestRmp.id,
          name: closestRmp.name,
          phone: closestRmp.phone,
          distanceKm: closestRmp.distanceKm,
          clinicName: closestRmp.clinicName
        }
      : null;

    // 2. Create emergency entity
    const newEmergency = db.createEmergency({
      patientId,
      patientName,
      patientPhone,
      triggerType,
      voiceTranscript: voiceTranscript || (triggerType === 'VOICE' ? 'Voice SOS Alert' : ''),
      symptomsReported: symptoms,
      location: {
        latitude: lat,
        longitude: lon,
        address: address || 'Rural Location'
      },
      matchedRmp,
      status: EMERGENCY_STATUS.NOTIFIED,
      tier: 1, // Tier 1: Local RMP
      timeoutSeconds: Math.floor(EMERGENCY_TIMEOUT_MS / 1000),
      initialNote: `SOS triggered via ${triggerType}. Nearest RMP: ${closestRmp ? `${closestRmp.name} (${closestRmp.distanceKm} km)` : 'None in direct 30km radius - Broadcast to District Hub'}`
    });

    console.log(`[EMERGENCY SOS] Created ID: ${newEmergency.id} for ${patientName}. Nearest RMP: ${closestRmp?.name || 'None'}`);

    // 3. Emit real-time Socket.io events
    if (this.socketEmitter) {
      // Alert all active RMPs in area & broadcast to RMP room
      this.socketEmitter('sos:alert', {
        emergency: newEmergency,
        nearbyCount: nearbyRmps.length,
        timestamp: new Date().toISOString()
      });

      // Stream live status update to patient session
      this.socketEmitter('sos:status-update', {
        emergencyId: newEmergency.id,
        status: EMERGENCY_STATUS.NOTIFIED,
        matchedRmp,
        message: matchedRmp
          ? `Alert dispatched to ${matchedRmp.name} (${matchedRmp.distanceKm} km away). Response countdown started.`
          : 'Alerting District Emergency Medical Officer and 108 Ambulance Network.'
      });
    }

    // 4. Multi-channel Offline & Backup Alerts (Twilio SMS / WhatsApp)
    const isOnline = closestRmp && this.isUserOnlineCheck ? this.isUserOnlineCheck(closestRmp.id) : false;
    console.log(`[RMP AVAILABILITY CHECK] Matched RMP '${closestRmp?.name}' is ${isOnline ? '🟢 ONLINE (Socket active)' : '🔴 OFFLINE (App closed/inactive)'}`);

    // Always trigger SMS/WhatsApp for nearest RMP as guaranteed mission-critical delivery
    if (closestRmp) {
      await SmsService.sendEmergencyAlertToRmp({
        rmp: closestRmp,
        emergency: newEmergency,
        isOffline: !isOnline
      });
    }

    // 5. Log in-app notification
    db.addNotification({
      type: 'EMERGENCY_SOS',
      title: `🚨 EMERGENCY SOS: ${patientName}`,
      message: `${symptoms}. Location: ${address || `${lat}, ${lon}`}`,
      recipientRole: ROLES.RMP,
      metadata: { emergencyId: newEmergency.id, isRmpOnline: isOnline }
    });

    // 6. Start auto-escalation timer (45 seconds)
    this.startEscalationTimer(newEmergency.id);

    return newEmergency;
  }

  /**
   * Starts a 45-second auto-escalation countdown.
   */
  static startEscalationTimer(emergencyId) {
    this.clearEscalationTimer(emergencyId);

    const timer = setTimeout(() => {
      const em = db.getEmergencyById(emergencyId);
      if (em && (em.status === EMERGENCY_STATUS.TRIGGERED || em.status === EMERGENCY_STATUS.NOTIFIED)) {
        console.log(`[EMERGENCY TIMEOUT] Auto-escalating SOS ${emergencyId} to Tier 2 (Taluka Hospital / 108 Ambulance)`);
        EmergencyService.escalateSos(emergencyId, {
          reason: 'Timeout: No RMP accepted within 45 seconds. Auto-escalated to District Trauma Network & 108 Dispatch.',
          targetTier: 2
        });
      }
    }, EMERGENCY_TIMEOUT_MS);

    this.activeTimers.set(emergencyId, timer);
  }

  static clearEscalationTimer(emergencyId) {
    if (this.activeTimers.has(emergencyId)) {
      clearTimeout(this.activeTimers.get(emergencyId));
      this.activeTimers.delete(emergencyId);
    }
  }

  /**
   * RMP accepts the emergency request.
   */
  static async acceptSos(emergencyId, rmpId) {
    const emergency = db.getEmergencyById(emergencyId);
    if (!emergency) {
      throw new Error(`Emergency with ID '${emergencyId}' not found.`);
    }

    if (emergency.status === EMERGENCY_STATUS.RESOLVED || emergency.status === EMERGENCY_STATUS.CANCELLED) {
      throw new Error(`Emergency is already ${emergency.status.toLowerCase()}.`);
    }

    // Clear auto-escalation timer
    this.clearEscalationTimer(emergencyId);

    const rmp = db.findUserById(rmpId);
    const rmpInfo = rmp
      ? {
          id: rmp.id,
          name: rmp.name,
          phone: rmp.phone,
          clinicName: rmp.clinicName,
          distanceKm: calculateHaversineDistance(
            emergency.location.latitude,
            emergency.location.longitude,
            rmp.location?.latitude,
            rmp.location?.longitude
          )
        }
      : emergency.matchedRmp;

    const updated = db.updateEmergency(emergencyId, {
      status: EMERGENCY_STATUS.ACCEPTED,
      matchedRmp: rmpInfo,
      acceptedAt: new Date().toISOString(),
      statusNote: `Emergency accepted by ${rmpInfo?.name || 'Local RMP'}. First responder en route.`
    });

    if (this.socketEmitter) {
      this.socketEmitter('sos:status-update', {
        emergencyId,
        status: EMERGENCY_STATUS.ACCEPTED,
        matchedRmp: rmpInfo,
        message: `${rmpInfo?.name || 'RMP'} has accepted the emergency and is preparing immediate first-aid dispatch.`
      });
    }

    // Send SMS confirmation to patient phone if available
    if (emergency.patientPhone) {
      await SmsService.sendSms({
        to: emergency.patientPhone,
        message: `✅ [JEEVANSETU SOS] ${rmpInfo?.name || 'Dr. Anand Verma'} has accepted your emergency request. En route (${rmpInfo?.distanceKm || '2.4'} km). Stay calm.`,
        type: 'EMERGENCY_STATUS',
        metadata: { emergencyId }
      });
    }

    return updated;
  }

  /**
   * Escalates emergency to Tier 2 (District Hospital) or Tier 3 (108 Ambulance).
   */
  static async escalateSos(emergencyId, { reason = 'Emergency Escalation Requested', targetTier = 2 }) {
    const emergency = db.getEmergencyById(emergencyId);
    if (!emergency) {
      throw new Error(`Emergency with ID '${emergencyId}' not found.`);
    }

    this.clearEscalationTimer(emergencyId);

    const updated = db.updateEmergency(emergencyId, {
      status: EMERGENCY_STATUS.ESCALATED,
      tier: targetTier,
      escalatedAt: new Date().toISOString(),
      statusNote: `Tier ${targetTier} Escalation: ${reason}`
    });

    if (this.socketEmitter) {
      this.socketEmitter('sos:status-update', {
        emergencyId,
        status: EMERGENCY_STATUS.ESCALATED,
        tier: targetTier,
        message: `🚨 Emergency Escalated to Tier ${targetTier}: District Hospital & 108 Emergency Medical Services alerted.`
      });
    }

    db.addNotification({
      type: 'EMERGENCY_ESCALATION',
      title: `🚨 TIER ${targetTier} ESCALATION: ${emergency.patientName}`,
      message: reason,
      recipientRole: 'ALL',
      metadata: { emergencyId }
    });

    // SMS dispatch to 108 ambulance dispatch and district hospital officer
    await SmsService.sendSms({
      to: '+91 10800 00108',
      message: `🚨 [108 AMBULANCE DISPATCH - JEEVANSETU]\nTier ${targetTier} Escalation for ${emergency.patientName}.\nLocation: ${emergency.location?.address || 'Rural Village'}\nReason: ${reason}`,
      type: 'EMERGENCY_ESCALATION',
      recipientName: '108 Ambulance Dispatch',
      metadata: { emergencyId, tier: targetTier }
    });

    return updated;
  }

  /**
   * Updates general status of SOS (e.g. EN_ROUTE, ARRIVED, RESOLVED, CANCELLED).
   */
  static async updateStatus(emergencyId, status, note = '') {
    const valid = Object.values(EMERGENCY_STATUS);
    if (!valid.includes(status)) {
      throw new Error(`Invalid status '${status}'. Valid: ${valid.join(', ')}`);
    }

    const emergency = db.getEmergencyById(emergencyId);
    if (!emergency) {
      throw new Error(`Emergency with ID '${emergencyId}' not found.`);
    }

    if (status === EMERGENCY_STATUS.RESOLVED || status === EMERGENCY_STATUS.CANCELLED) {
      this.clearEscalationTimer(emergencyId);
    }

    const updated = db.updateEmergency(emergencyId, {
      status,
      statusNote: note || `Status transitioned to ${status}`,
      ...(status === EMERGENCY_STATUS.RESOLVED ? { resolvedAt: new Date().toISOString() } : {})
    });

    if (this.socketEmitter) {
      this.socketEmitter('sos:status-update', {
        emergencyId,
        status,
        message: note || `Emergency status is now ${status}.`
      });
    }

    return updated;
  }

  static getStatus(emergencyId) {
    const emergency = db.getEmergencyById(emergencyId);
    if (!emergency) {
      throw new Error(`Emergency with ID '${emergencyId}' not found.`);
    }
    return emergency;
  }

  static getActiveEmergencies() {
    return db.getActiveEmergencies();
  }

  static getAllEmergencies() {
    return db.getAllEmergencies();
  }
}
