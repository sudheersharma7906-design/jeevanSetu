// server/modules/emergency/emergency.controller.js
import { EmergencyService } from './emergency.service.js';
import { LOCATION_PRIVACY_POLICY } from '../../config/constants.js';

export class EmergencyController {
  static async triggerSos(req, res) {
    try {
      const patientId = req.user?.patientId || req.user?.id || req.body.patientId;
      if (!patientId) {
        return res.status(401).json({ success: false, error: 'Authentication required. Patient identity missing.' });
      }

      const data = {
        patientId,
        phone: req.user?.phone || req.body.phone,
        name: req.user?.name || req.body.name,
        triggerType: req.body.triggerType || 'BUTTON',
        voiceTranscript: req.body.voiceTranscript || '',
        symptoms: req.body.symptoms,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
        locationPrivacy: {
          capturedOnExplicitTrigger: true,
          privacyConsent: 'EXPLICIT_EMERGENCY_ONLY',
          activeEmergencyTracking: true,
          passiveBackgroundTracking: false,
          policy: LOCATION_PRIVACY_POLICY.CAPTURE_MODE,
          gpsTimestamp: new Date().toISOString()
        }
      };

      const result = await EmergencyService.triggerSos(data);
      res.status(201).json({
        success: true,
        message: 'Emergency SOS alert dispatched to nearest RMPs and response network.',
        privacyPolicy: 'Location tracking begins strictly on explicit emergency SOS trigger only and terminates when emergency is resolved. Passive background tracking is disabled.',
        emergency: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getStatus(req, res) {
    try {
      const emergency = await EmergencyService.getStatus(req.params.id);
      res.status(200).json({
        success: true,
        emergency
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async acceptSos(req, res) {
    try {
      const emergencyId = req.params.id;
      const rmpId = req.user?.id || req.body.rmpId;
      const updated = await EmergencyService.acceptSos(emergencyId, rmpId);
      res.status(200).json({
        success: true,
        message: 'Emergency accepted by RMP.',
        emergency: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async escalateSos(req, res) {
    try {
      const emergencyId = req.params.id;
      const { reason, targetTier } = req.body;
      const updated = await EmergencyService.escalateSos(emergencyId, {
        reason: reason || 'Escalation triggered by medical provider',
        targetTier: targetTier || 2
      });
      res.status(200).json({
        success: true,
        message: 'Emergency escalated to higher care tier.',
        emergency: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async updateStatus(req, res) {
    try {
      const emergencyId = req.params.id;
      const { status, note } = req.body;
      const updated = await EmergencyService.updateStatus(emergencyId, status, note);
      res.status(200).json({
        success: true,
        emergency: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getActive(req, res) {
    try {
      const active = await EmergencyService.getActiveEmergencies();
      res.status(200).json({
        success: true,
        count: active.length,
        emergencies: active
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getAll(req, res) {
    try {
      if (req.user && req.user.role === 'patient') {
        return res.status(403).json({
          success: false,
          error: 'Access denied (RBAC). Patients cannot view community emergency logs.'
        });
      }

      const list = await EmergencyService.getAllEmergencies();
      res.status(200).json({
        success: true,
        count: list.length,
        emergencies: list
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  static async updateLocation(req, res) {
    try {
      const emergencyId = req.params.id || req.body.emergencyId;
      const latitude = req.body.latitude || req.body.lat;
      const longitude = req.body.longitude || req.body.lng;
      const accuracy = req.body.accuracy || 10;
      const address = req.body.address || '';

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude coordinates are required.'
        });
      }

      const updated = await EmergencyService.updateLocation({
        emergencyId,
        latitude,
        longitude,
        accuracy,
        address
      });

      res.status(200).json({
        success: true,
        message: 'Real-time emergency GPS location updated.',
        googleMapsUrl: updated.googleMapsUrl || `https://www.google.com/maps?q=${latitude},${longitude}`,
        googleMapsDirUrl: updated.googleMapsDirUrl,
        emergency: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}
