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
import { EmergencyRequest, User } from '../../models/index.js';

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
      try {
        const patient = await User.findById(patientId);
        if (patient) {
          patientName = patient.name;
          patientPhone = patient.phone;
        }
      } catch (e) {}

      if (!patientName) {
        const patientMem = db.findUserById(patientId);
        if (patientMem) {
          patientName = patientMem.name;
          patientPhone = patientMem.phone;
        }
      }
    }

    if (!patientName) patientName = 'Emergency Patient';

    const lat = parseFloat(latitude) || DEFAULT_COORDINATES.latitude;
    const lon = parseFloat(longitude) || DEFAULT_COORDINATES.longitude;

    // 1. Geo-match nearest RMPs (up to 30km) via MongoDB 2dsphere index or memory DB
    let nearbyRmps = [];
    try {
      const mongoRmps = await User.findNearestRmps(lon, lat, 30000);
      if (mongoRmps && mongoRmps.length > 0) {
        nearbyRmps = mongoRmps.map(r => {
          const rLat = r.location?.coordinates ? r.location.coordinates[1] : lat;
          const rLng = r.location?.coordinates ? r.location.coordinates[0] : lon;
          return {
            id: r._id.toString(),
            name: r.name,
            phone: r.phone,
            clinicName: r.clinicName || 'Rural Clinic',
            latitude: rLat,
            longitude: rLng,
            distanceKm: parseFloat(calculateHaversineDistance(lat, lon, rLat, rLng).toFixed(1))
          };
        });
      }
    } catch (e) {}

    if (nearbyRmps.length === 0) {
      nearbyRmps = db.getNearbyRmps(lat, lon, 30);
    }

    const closestRmp = nearbyRmps.length > 0 ? nearbyRmps[0] : null;

    const matchedRmp = closestRmp
      ? {
          id: closestRmp.id,
          name: closestRmp.name,
          phone: closestRmp.phone,
          distanceKm: closestRmp.distanceKm,
          clinicName: closestRmp.clinicName,
          latitude: closestRmp.latitude || 27.5750,
          longitude: closestRmp.longitude || 80.6950
        }
      : null;

    let newEmergency = null;

    // 2. Persist to MongoDB EmergencyRequest collection
    try {
      const mongoEmerg = await EmergencyRequest.create({
        patientId,
        patientName,
        patientPhone,
        triggerType: triggerType.toLowerCase(),
        voiceTranscript: voiceTranscript || (triggerType === 'VOICE' ? 'Voice SOS Alert' : ''),
        symptoms,
        location: {
          type: 'Point',
          coordinates: [lon, lat],
          address: address || 'Rural Location'
        },
        matchedRmp,
        status: 'notified',
        tier: 1,
        timeline: [
          {
            status: EMERGENCY_STATUS.NOTIFIED,
            time: new Date(),
            note: `SOS triggered via ${triggerType}. Nearest RMP: ${closestRmp ? `${closestRmp.name} (${closestRmp.distanceKm} km)` : 'None in direct 30km radius - Broadcast to District Hub'}`
          }
        ]
      });

      newEmergency = mongoEmerg.toObject();
      newEmergency.id = mongoEmerg._id.toString();
      newEmergency.status = EMERGENCY_STATUS.NOTIFIED;
      newEmergency.symptomsReported = symptoms;
      newEmergency.timeoutSeconds = Math.floor(EMERGENCY_TIMEOUT_MS / 1000);
    } catch (mongoErr) {
      console.warn('[EMERGENCY] MongoDB create notice (falling back to memory):', mongoErr.message);
    }

    // 3. Sync to memory DB
    const memoryEmergency = db.createEmergency({
      id: newEmergency?.id || `sos-${Date.now()}`,
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
      tier: 1,
      timeoutSeconds: Math.floor(EMERGENCY_TIMEOUT_MS / 1000),
      initialNote: `SOS triggered via ${triggerType}. Nearest RMP: ${closestRmp ? `${closestRmp.name} (${closestRmp.distanceKm} km)` : 'None in direct 30km radius - Broadcast to District Hub'}`
    });

    const activeEmergency = newEmergency || memoryEmergency;

    console.log(`[EMERGENCY SOS] Created ID: ${activeEmergency.id} for ${patientName}. Nearest RMP: ${closestRmp?.name || 'None'}`);

    // 4. Emit real-time Socket.io events
    if (this.socketEmitter) {
      this.socketEmitter('sos:alert', {
        emergency: activeEmergency,
        nearbyCount: nearbyRmps.length,
        timestamp: new Date().toISOString()
      });

      this.socketEmitter('sos:status-update', {
        emergencyId: activeEmergency.id,
        status: EMERGENCY_STATUS.NOTIFIED,
        matchedRmp,
        message: matchedRmp
          ? `Alert dispatched to ${matchedRmp.name} (${matchedRmp.distanceKm} km away). Response countdown started.`
          : 'Alerting District Emergency Medical Officer and 108 Ambulance Network.'
      });
    }

    // 5. Multi-channel Offline & Backup Alerts
    const isOnline = closestRmp && this.isUserOnlineCheck ? this.isUserOnlineCheck(closestRmp.id) : false;
    console.log(`[RMP AVAILABILITY CHECK] Matched RMP '${closestRmp?.name}' is ${isOnline ? '🟢 ONLINE (Socket active)' : '🔴 OFFLINE (App closed/inactive)'}`);

    if (closestRmp) {
      await SmsService.sendEmergencyAlertToRmp({
        rmp: closestRmp,
        emergency: activeEmergency,
        isOffline: !isOnline
      });
    }

    // 6. Log in-app notification
    db.addNotification({
      type: 'EMERGENCY_SOS',
      title: `🚨 EMERGENCY SOS: ${patientName}`,
      message: `${symptoms}. Location: ${address || `${lat}, ${lon}`}`,
      recipientRole: ROLES.RMP,
      metadata: { emergencyId: activeEmergency.id, isRmpOnline: isOnline }
    });

    // 7. Start auto-escalation timer (45 seconds)
    this.startEscalationTimer(activeEmergency.id);

    return activeEmergency;
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
    this.clearEscalationTimer(emergencyId);

    let rmpInfo = null;
    if (rmpId) {
      try {
        const rmp = await User.findById(rmpId);
        if (rmp) {
          rmpInfo = {
            id: rmp._id.toString(),
            name: rmp.name,
            phone: rmp.phone,
            clinicName: rmp.clinicName
          };
        }
      } catch (e) {}

      if (!rmpInfo) {
        const rmpMem = db.findUserById(rmpId);
        if (rmpMem) {
          rmpInfo = {
            id: rmpMem.id,
            name: rmpMem.name,
            phone: rmpMem.phone,
            clinicName: rmpMem.clinicName
          };
        }
      }
    }

    try {
      const updatedMongo = await EmergencyRequest.findByIdAndUpdate(
        emergencyId,
        {
          status: 'accepted',
          assignedRmpId: rmpId || null,
          $push: {
            timeline: {
              status: EMERGENCY_STATUS.ACCEPTED,
              time: new Date(),
              note: `Emergency accepted by ${rmpInfo?.name || 'Local RMP'}. First responder en route.`
            }
          }
        },
        { new: true }
      );
      if (updatedMongo) {
        db.updateEmergency(emergencyId, {
          status: EMERGENCY_STATUS.ACCEPTED,
          matchedRmp: rmpInfo,
          acceptedAt: new Date().toISOString(),
          statusNote: `Emergency accepted by ${rmpInfo?.name || 'Local RMP'}. First responder en route.`
        });

        const obj = updatedMongo.toObject();
        obj.id = obj._id.toString();
        obj.status = EMERGENCY_STATUS.ACCEPTED;

        if (this.socketEmitter) {
          this.socketEmitter('sos:status-update', {
            emergencyId,
            status: EMERGENCY_STATUS.ACCEPTED,
            matchedRmp: rmpInfo,
            message: `${rmpInfo?.name || 'RMP'} has accepted the emergency and is preparing immediate first-aid dispatch.`
          });
        }
        return obj;
      }
    } catch (e) {}

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

    return updated;
  }

  /**
   * Escalates emergency to Tier 2 (District Hospital) or Tier 3 (108 Ambulance).
   */
  static async escalateSos(emergencyId, { reason = 'Emergency Escalation Requested', targetTier = 2 }) {
    this.clearEscalationTimer(emergencyId);

    try {
      const updatedMongo = await EmergencyRequest.findByIdAndUpdate(
        emergencyId,
        {
          status: 'escalated',
          tier: targetTier,
          $push: {
            escalationHistory: { tier: targetTier, reason, timestamp: new Date() },
            timeline: { status: EMERGENCY_STATUS.ESCALATED, time: new Date(), note: `Tier ${targetTier} Escalation: ${reason}` }
          }
        },
        { new: true }
      );

      if (updatedMongo) {
        db.updateEmergency(emergencyId, {
          status: EMERGENCY_STATUS.ESCALATED,
          tier: targetTier,
          escalatedAt: new Date().toISOString(),
          statusNote: `Tier ${targetTier} Escalation: ${reason}`
        });

        const obj = updatedMongo.toObject();
        obj.id = obj._id.toString();
        obj.status = EMERGENCY_STATUS.ESCALATED;

        if (this.socketEmitter) {
          this.socketEmitter('sos:status-update', {
            emergencyId,
            status: EMERGENCY_STATUS.ESCALATED,
            tier: targetTier,
            message: `🚨 Emergency Escalated to Tier ${targetTier}: District Hospital & 108 Emergency Medical Services alerted.`
          });
        }
        return obj;
      }
    } catch (e) {}

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

    if (status === EMERGENCY_STATUS.RESOLVED || status === EMERGENCY_STATUS.CANCELLED) {
      this.clearEscalationTimer(emergencyId);
    }

    try {
      const updatedMongo = await EmergencyRequest.findByIdAndUpdate(
        emergencyId,
        {
          status: status.toLowerCase(),
          $push: {
            timeline: { status, time: new Date(), note: note || `Status transitioned to ${status}` }
          }
        },
        { new: true }
      );

      if (updatedMongo) {
        db.updateEmergency(emergencyId, {
          status,
          statusNote: note || `Status transitioned to ${status}`
        });

        const obj = updatedMongo.toObject();
        obj.id = obj._id.toString();
        obj.status = status;
        return obj;
      }
    } catch (e) {}

    return db.updateEmergency(emergencyId, {
      status,
      statusNote: note || `Status transitioned to ${status}`
    });
  }

  static async getStatus(emergencyId) {
    try {
      const mongoEmerg = await EmergencyRequest.findById(emergencyId);
      if (mongoEmerg) {
        const obj = mongoEmerg.toObject();
        obj.id = obj._id.toString();
        return obj;
      }
    } catch (e) {}

    const emergency = db.getEmergencyById(emergencyId);
    if (!emergency) {
      throw new Error(`Emergency with ID '${emergencyId}' not found.`);
    }
    return emergency;
  }

  static async getActiveEmergencies() {
    try {
      const activeMongo = await EmergencyRequest.find({
        status: { $nin: ['resolved', 'cancelled', 'RESOLVED', 'CANCELLED'] }
      }).sort({ createdAt: -1 });

      if (activeMongo && activeMongo.length > 0) {
        return activeMongo.map(e => {
          const obj = e.toObject();
          return { ...obj, id: obj._id.toString() };
        });
      }
    } catch (e) {}

    return db.getActiveEmergencies();
  }

  static async getAllEmergencies() {
    try {
      const allMongo = await EmergencyRequest.find().sort({ createdAt: -1 });
      if (allMongo && allMongo.length > 0) {
        return allMongo.map(e => {
          const obj = e.toObject();
          return { ...obj, id: obj._id.toString() };
        });
      }
    } catch (e) {}

    return db.getAllEmergencies();
  }

  /**
   * Updates patient live GPS location for an active emergency.
   */
  static async updateLocation({ emergencyId, latitude, longitude, accuracy = 10, address = '' }) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Invalid latitude or longitude numbers provided.');
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    // Update in Memory DB
    const memoryEmergency = db.getEmergencyById(emergencyId);
    let updatedEmergency = null;

    if (memoryEmergency) {
      const rmpLat = memoryEmergency.matchedRmp?.latitude || 27.5750;
      const rmpLon = memoryEmergency.matchedRmp?.longitude || 80.6950;
      const computedDistanceKm = calculateHaversineDistance(lat, lon, rmpLat, rmpLon);

      updatedEmergency = db.updateEmergency(emergencyId, {
        location: {
          latitude: lat,
          longitude: lon,
          address: address || memoryEmergency.location?.address || `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`
        },
        accuracy,
        googleMapsUrl,
        googleMapsDirUrl,
        distanceKm: computedDistanceKm,
        lastLocationUpdate: new Date().toISOString()
      });
    }

    // Update in MongoDB if available
    try {
      const updatedMongo = await EmergencyRequest.findByIdAndUpdate(
        emergencyId,
        {
          'location.type': 'Point',
          'location.coordinates': [lon, lat],
          'location.address': address || `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          accuracy,
          googleMapsUrl,
          lastLocationUpdate: new Date()
        },
        { new: true }
      );

      if (updatedMongo) {
        const obj = updatedMongo.toObject();
        obj.id = obj._id.toString();
        obj.googleMapsUrl = googleMapsUrl;
        obj.googleMapsDirUrl = googleMapsDirUrl;
        updatedEmergency = obj;
      }
    } catch (e) {}

    // Emit live Socket update to emergency-specific room
    if (this.socketEmitter) {
      this.socketEmitter(
        'sos:location-update',
        {
          emergencyId,
          latitude: lat,
          longitude: lon,
          accuracy,
          address: address || `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          googleMapsUrl,
          googleMapsDirUrl,
          timestamp: new Date().toISOString()
        },
        `emergency:${emergencyId}`
      );
    }

    return updatedEmergency || {
      id: emergencyId,
      latitude: lat,
      longitude: lon,
      accuracy,
      googleMapsUrl,
      googleMapsDirUrl,
      timestamp: new Date().toISOString()
    };
  }
}
