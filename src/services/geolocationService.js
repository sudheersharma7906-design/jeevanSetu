// src/services/geolocationService.js
import { getApiUrl } from '../config/api';

/**
 * Standard default fallback coordinates (Sitapur Rural Health Post, Uttar Pradesh)
 */
export const DEFAULT_RURAL_COORDS = {
  latitude: null,
  longitude: null,
  accuracy: null,
  address: 'Location Unavailable (Please Enable GPS Permissions)',
  isFallback: true
};

export class GeolocationService {
  /**
   * Check if the browser supports the Geolocation API.
   */
  static isSupported() {
    return typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator;
  }

  /**
   * Retrieve current high-accuracy GPS coordinates.
   * @param {Object} options Geolocation options
   * @returns {Promise<{latitude: number|null, longitude: number|null, accuracy: number|null, address: string, isFallback: boolean}>}
   */
  static async getCurrentPosition(options = {}) {
    if (!this.isSupported()) {
      console.warn('[GEOLOCATION] Browser Geolocation API not supported.');
      return { ...DEFAULT_RURAL_COORDS };
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
      ...options
    };

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`[GEOLOCATION ACQUIRED] Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}, Accuracy: ±${Math.round(accuracy)}m`);

          // Attempt reverse geocoding via OpenStreetMap Nominatim
          const resolvedAddress = await this.reverseGeocode(latitude, longitude);

          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            address: resolvedAddress || `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            isFallback: false,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.warn('[GEOLOCATION ERROR]', error.message, 'Location permission or GPS signal required.');
          resolve({
            latitude: null,
            longitude: null,
            accuracy: null,
            address: 'Location Unavailable (Please Enable GPS Permissions)',
            isFallback: true,
            errorMessage: error.message
          });
        },
        geoOptions
      );
    });
  }

  /**
   * Continuous location watcher.
   */
  static watchPosition(onSuccess, onError, options = {}) {
    if (!this.isSupported()) {
      if (onError) onError(new Error('Geolocation not supported'));
      return null;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      ...options
    };

    return navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        onSuccess({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          speed: speed || 0,
          heading: heading || 0,
          timestamp: position.timestamp
        });
      },
      onError,
      geoOptions
    );
  }

  /**
   * Clears an active position watch.
   */
  static clearWatch(watchId) {
    if (watchId && this.isSupported()) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Reverse geocode latitude and longitude to human-readable address
   * via OpenStreetMap Nominatim API with 3s timeout.
   */
  static async reverseGeocode(latitude, longitude) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en,hi',
          'User-Agent': 'JivanSetu-RuralHealthcare-Web/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          const addr = data.address || {};
          const village = addr.village || addr.suburb || addr.town || addr.hamlet || addr.county || '';
          const district = addr.state_district || addr.district || '';
          const state = addr.state || '';
          const postcode = addr.postcode || '';

          const parts = [village, district, state, postcode].filter(Boolean);
          return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(', ');
        }
      }
    } catch (err) {
      console.warn('[REVERSE GEOCODE] Nominatim lookup skipped:', err.message);
    }

    return null;
  }

  /**
   * Calculate distance between two lat/lng coordinates using Haversine formula (in km).
   */
  static calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Estimate travel ETA based on rural transit speeds (approx 25 km/h for village roads).
   */
  static estimateEtaMinutes(distanceKm, averageSpeedKmh = 25) {
    const hours = distanceKm / averageSpeedKmh;
    const minutes = Math.max(2, Math.round(hours * 60));
    return `${minutes}-${minutes + 3} mins`;
  }

  /**
   * Send high-accuracy GPS coordinates to backend emergency location endpoint.
   */
  static async sendLocationToServer(emergencyId, coords) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jivansetu_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl('/api/emergency/location'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          emergencyId,
          latitude: coords.latitude || coords.lat,
          longitude: coords.longitude || coords.lng,
          accuracy: coords.accuracy || 10,
          address: coords.address || ''
        })
      });
      return await response.json();
    } catch (err) {
      console.warn('[GEOLOCATION] Failed to send live GPS coordinates to backend:', err.message);
      return { success: false, error: err.message };
    }
  }
}
