/**
 * JivanSetu API Client Service
 * Centralized HTTP client for all backend REST endpoints with automatic JWT token management.
 */

import { getApiUrl } from '../config/api';

/**
 * Helper to get stored auth token
 */
const getAuthToken = () => {
  return localStorage.getItem('jivansetu_token') || '';
};

/**
 * Standard HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = getApiUrl(`/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP Error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // ==========================================
  // 1. Authentication Endpoints
  // ==========================================
  auth: {
    requestOtp: (phone, role = 'patient') =>
      request('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone, role }),
      }),

    verifyOtp: (phone, otp) =>
      request('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      }),

    getProfile: () => request('/auth/me'),
  },

  // ==========================================
  // 2. User & Provider Endpoints
  // ==========================================
  users: {
    getById: (id) => request(`/users/${id}`),
    updateProfile: (id, updates) =>
      request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    updateLocation: (id, coordinates) =>
      request(`/users/${id}/location`, {
        method: 'PUT',
        body: JSON.stringify({ coordinates }),
      }),
    getNearbyRmps: (lat, lng, radiusKm = 30) =>
      request(`/users/rmps/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`),
    getDoctorsList: (specialty) =>
      request(`/users/doctors/list${specialty ? `?specialty=${encodeURIComponent(specialty)}` : ''}`),
  },

  // ==========================================
  // 3. Clinical AI Triage Endpoints
  // ==========================================
  triage: {
    evaluate: (triagePayload) =>
      request('/triage', {
        method: 'POST',
        body: JSON.stringify(triagePayload),
      }),
    getById: (id) => request(`/triage/${id}`),
    getHistoryByPatient: (patientId) => request(`/triage/history/${patientId}`),
  },

  // ==========================================
  // 4. Teleconsultation Endpoints
  // ==========================================
  consult: {
    escalate: (consultData) =>
      request('/consult/escalate', {
        method: 'POST',
        body: JSON.stringify(consultData),
      }),
    getQueue: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/consult/queue${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/consult/${id}`),
    complete: (id, summaryData) =>
      request(`/consult/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(summaryData),
      }),
    prescribe: (id, prescriptionData) =>
      request(`/consult/${id}/prescribe`, {
        method: 'POST',
        body: JSON.stringify(prescriptionData),
      }),
  },

  // ==========================================
  // 5. Digital Prescriptions
  // ==========================================
  prescriptions: {
    create: (prescriptionData) =>
      request('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(prescriptionData),
      }),
    getById: (id) => request(`/prescriptions/${id}`),
    getByPatient: (patientId) => request(`/prescriptions/patient/${patientId}`),
    verifySignature: (id) => request(`/prescriptions/${id}/verify`),
  },

  // ==========================================
  // 6. Append-Only Health Records
  // ==========================================
  records: {
    getTimeline: (patientId) => request(`/records/${patientId}`),
    appendEvent: (patientId, recordPayload) =>
      request(`/records/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(recordPayload),
      }),
  },

  // ==========================================
  // 7. Emergency SOS Endpoints
  // ==========================================
  emergency: {
    triggerSos: (sosPayload) =>
      request('/emergency/sos', {
        method: 'POST',
        body: JSON.stringify(sosPayload),
      }),
    getStatus: (id) => request(`/emergency/${id}/status`),
    acceptSos: (id, rmpId) =>
      request(`/emergency/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ rmpId }),
      }),
    escalateSos: (id, tier, reason) =>
      request(`/emergency/${id}/escalate`, {
        method: 'POST',
        body: JSON.stringify({ tier, reason }),
      }),
    getActive: () => request('/emergency/active'),
    getAllLogs: () => request('/emergency/all'),
  },

  // ==========================================
  // 8. Notifications Endpoints
  // ==========================================
  notifications: {
    send: (notificationPayload) =>
      request('/notifications/send', {
        method: 'POST',
        body: JSON.stringify(notificationPayload),
      }),
    getInbox: (userId) => request(`/notifications/${userId}`),
    markAsRead: (id) =>
      request(`/notifications/${id}/read`, {
        method: 'PUT',
      }),
  },

  // ==========================================
  // 9. Admin & Audit Endpoints
  // ==========================================
  admin: {
    getStats: () => request('/admin/stats'),
    getEmergencyLogs: () => request('/admin/emergency-logs'),
    getUsers: () => request('/admin/users'),
    verifyUser: (userId) =>
      request(`/admin/users/${userId}/verify`, {
        method: 'POST',
      }),
  },
};

export default api;
