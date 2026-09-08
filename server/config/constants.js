// server/config/constants.js

export const JWT_SECRET = process.env.JWT_SECRET || 'jeevansetu-healthcare-jwt-secret-key-2026';
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '1h'; // Short-lived access token
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
export const JWT_EXPIRES_IN = JWT_ACCESS_EXPIRES_IN; // Backward compatibility

export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_OTP_VERIFY_ATTEMPTS = 5; // Max 5 failed attempts before lockout
export const OTP_LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes lockout on brute-force detection
export const EMERGENCY_TIMEOUT_MS = 45 * 1000; // 45 seconds auto-escalate

export const LOCATION_PRIVACY_POLICY = {
  CAPTURE_MODE: 'EXPLICIT_SOS_ONLY',
  CONTINUOUS_TRACKING: false,
  CONSENT_REQUIRED: true,
  AUDIT_LOG_ENABLED: true
};

export const ROLES = {
  PATIENT: 'patient',
  RMP: 'rmp',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

export const TRIAGE_LEVELS = {
  EMERGENCY: 'EMERGENCY',   // Red - immediate emergency response
  URGENT: 'URGENT',         // Yellow - escalation to specialist doctor
  ROUTINE: 'ROUTINE'        // Green - RMP primary care / OTC advice
};

export const EMERGENCY_STATUS = {
  TRIGGERED: 'TRIGGERED',
  NOTIFIED: 'NOTIFIED',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED'
};

export const CONSULT_STATUS = {
  QUEUED: 'QUEUED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ESCALATED: 'ESCALATED',
  CANCELLED: 'CANCELLED'
};

export const DEFAULT_COORDINATES = {
  latitude: 19.0760,
  longitude: 72.8777,
  address: 'Palghar Rural Health Center, Maharashtra'
};

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 999999;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}
