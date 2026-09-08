// src/config/api.js

/**
 * JivanSetu Centralized API & Service Configuration
 * Resolves backend REST and WebSocket endpoints based on runtime environment.
 */

// Determine the API base URL:
// 1. Explicit VITE_API_URL or VITE_BACKEND_URL from environment (.env or cloud hosting settings)
// 2. Localhost development fallback (http://localhost:5000)
// 3. Current window origin for reverse-proxied / same-origin deployments
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Helper to construct full API endpoint URL
 * @param {string} path - API path (e.g. '/api/emergency/sos' or 'api/auth/login')
 * @returns {string} - Full URL
 */
export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Helper to get WebSocket server URL
 * @returns {string}
 */
export const getSocketUrl = () => {
  return API_BASE_URL;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getSocketUrl
};
