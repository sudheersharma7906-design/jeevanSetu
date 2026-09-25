// src/context/EmergencyContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';
import { soundManager } from '../utils/soundEffects';
import { INITIAL_EMERGENCIES } from '../utils/mockData';
import { GeolocationService } from '../services/geolocationService';
import { getApiUrl } from '../config/api';

import { useAuth } from './AuthContext';

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSosActive, setIsSosActive] = useState(false);
  const [countdown, setCountdown] = useState(null); // null when not counting down, 5..1 when active
  const [activeAlert, setActiveAlert] = useState(null);
  const [emergencyList, setEmergencyList] = useState([]);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsSosActive(false);
      setActiveAlert(null);
      setEmergencyList([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && emergencyList.length > 0) {
      localStorage.setItem('jivansetu_emergencies', JSON.stringify(emergencyList));
    }
  }, [emergencyList, isAuthenticated]);

  // Sync with real-time Socket.io events
  useEffect(() => {
    const handleStatusUpdate = (data) => {
      console.log('[EMERGENCY CONTEXT: sos:status-update]', data);
      const { emergencyId, status, matchedRmp, tier } = data;

      setEmergencyList(prev =>
        prev.map(e => {
          if (e.id === emergencyId) {
            return {
              ...e,
              status: status || e.status,
              matchedRmp: matchedRmp || e.matchedRmp,
              tier: tier || e.tier
            };
          }
          return e;
        })
      );

      setActiveAlert(prev => {
        if (prev && prev.id === emergencyId) {
          return {
            ...prev,
            status: status || prev.status,
            matchedRmp: matchedRmp || prev.matchedRmp,
            tier: tier || prev.tier
          };
        }
        return prev;
      });

      if (status === 'ACCEPTED' || status === 'ACCEPTED_BY_RMP') {
        soundManager.playSuccessChime();
      }
    };

    const handleSosAlert = (data) => {
      const emergency = data.emergency || data;
      setEmergencyList(prev => {
        if (prev.some(e => e.id === emergency.id)) return prev;
        return [
          {
            ...emergency,
            urgency: 'RED',
            location: emergency.location?.address || 'Rural Area',
            coordinates: {
              lat: emergency.location?.latitude || 19.6542,
              lng: emergency.location?.longitude || 73.1389
            }
          },
          ...prev
        ];
      });
    };

    socket.on('sos:status-update', handleStatusUpdate);
    socket.on('sos:alert', handleSosAlert);

    return () => {
      socket.off('sos:status-update', handleStatusUpdate);
      socket.off('sos:alert', handleSosAlert);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundManager.stopSiren();
    };
  }, []);

  // Trigger SOS countdown sequence (5 seconds)
  const startSosCountdown = (triggerSource = 'SOS Button', details = {}) => {
    if (countdown !== null || isSosActive) return;

    let currentSeconds = 5;
    setCountdown(5);
    soundManager.playCountdownBeep(600, 0.15);

    timerRef.current = setInterval(() => {
      currentSeconds -= 1;
      if (currentSeconds > 0) {
        setCountdown(currentSeconds);
        soundManager.playCountdownBeep(600 + (5 - currentSeconds) * 120, 0.15);
      } else {
        // Countdown reached 0 -> Dispatch emergency
        clearInterval(timerRef.current);
        timerRef.current = null;
        setCountdown(null);
        dispatchEmergency(triggerSource, details);
      }
    }, 1000);
  };

  const watchIdRef = useRef(null);

  // Stop active position watcher
  const stopLiveTracking = () => {
    if (watchIdRef.current) {
      GeolocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Immediate dispatch (without countdown or triggered after 5s)
  const dispatchEmergency = async (triggerSource = 'SOS Button', details = {}) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    setIsSosActive(true);

    soundManager.playEmergencySiren();

    // Acquire high-accuracy live GPS position via Browser Geolocation API
    // Fall back to registered user profile location if live GPS is denied/unavailable. Never dispatch fake coordinates!
    const userLat = user?.location?.coordinates?.[1] || user?.location?.latitude || null;
    const userLng = user?.location?.coordinates?.[0] || user?.location?.longitude || null;
    const userAddr = user?.location?.address || (user?.village ? `${user.village}${user.district ? `, ${user.district}` : ''}` : '');

    let geo = {
      latitude: details.coordinates?.lat || userLat,
      longitude: details.coordinates?.lng || userLng,
      address: details.location || userAddr || 'Location Unavailable (Please Enable GPS Permissions)',
      isFallback: false
    };

    try {
      const liveGeo = await GeolocationService.getCurrentPosition({ timeout: 6000 });
      if (liveGeo && liveGeo.latitude && liveGeo.longitude) {
        geo = {
          latitude: details.coordinates?.lat || liveGeo.latitude,
          longitude: details.coordinates?.lng || liveGeo.longitude,
          address: details.location || liveGeo.address || 'Live GPS Emergency Location',
          accuracy: liveGeo.accuracy,
          isFallback: false
        };
      }
    } catch (geoErr) {
      console.warn('[EMERGENCY CONTEXT] Geolocation notice:', geoErr.message);
    }

    const patientId = user?.id || user?.patientId || details.patientId || 'anonymous';
    const patientName = user?.name || details.patientName || 'Emergency Patient';
    const patientPhone = user?.phone || details.patientPhone || '';

    const emergencyPayload = {
      patientId,
      name: patientName,
      phone: patientPhone,
      age: details.age || user?.age || 35,
      gender: details.gender || user?.gender || 'Unspecified',
      triggerType: triggerSource,
      voiceTranscript: details.voiceTranscript || '',
      symptoms: details.chiefComplaint || 'Emergency SOS broadcast triggered',
      latitude: geo.latitude,
      longitude: geo.longitude,
      address: geo.address,
      accuracy: geo.accuracy || 10,
      locationPrivacy: {
        capturedOnExplicitTrigger: true,
        privacyConsent: 'EXPLICIT_EMERGENCY_ONLY',
        activeEmergencyTracking: true,
        passiveBackgroundTracking: false,
        gpsTimestamp: new Date().toISOString()
      }
    };

    // 1. Dispatch single REST API call (Single Source of Truth)
    let serverEmergency = null;
    try {
      const token = localStorage.getItem('jivansetu_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(getApiUrl('/api/emergency/sos'), {
        method: 'POST',
        headers,
        body: JSON.stringify(emergencyPayload)
      });
      if (res.ok) {
        const data = await res.json();
        serverEmergency = data.emergency;
      }
    } catch (err) {
      console.warn('Backend REST SOS dispatch fallback:', err.message);
    }

    const emergencyId = serverEmergency?.id || `sos-${Date.now().toString().slice(-4)}`;

    // Join emergency socket room for targeted updates
    socket.emit('join-emergency', { emergencyId });

    const newAlert = {
      id: emergencyId,
      patientId: emergencyPayload.patientId,
      patientName: emergencyPayload.name,
      patientPhone: emergencyPayload.phone,
      age: emergencyPayload.age,
      gender: emergencyPayload.gender,
      location: emergencyPayload.address,
      coordinates: { lat: emergencyPayload.latitude, lng: emergencyPayload.longitude },
      accuracy: emergencyPayload.accuracy,
      triggerType: triggerSource,
      urgency: 'RED',
      status: 'DISPATCHED',
      timestamp: new Date().toISOString(),
      assignedRmp: serverEmergency?.matchedRmp?.name || 'Assigned RMP',
      matchedRmp: serverEmergency?.matchedRmp || null,
      chiefComplaint: emergencyPayload.symptoms,
      vitals: details.vitals || { bp: '130/85', pulse: '98 bpm', spo2: '96%' }
    };

    setActiveAlert(newAlert);
    setEmergencyList(prev => [newAlert, ...prev]);

    // 2. Start continuous watchPosition() for live patient tracking during active emergency
    stopLiveTracking();
    watchIdRef.current = GeolocationService.watchPosition(
      (pos) => {
        if (pos && pos.latitude) {
          const updatedCoords = { lat: pos.latitude, lng: pos.longitude };
          setActiveAlert(prev => prev ? { ...prev, coordinates: updatedCoords, accuracy: pos.accuracy } : null);
          GeolocationService.sendLocationToServer(emergencyId, pos);
        }
      },
      (err) => console.warn('[LIVE TRACKING WATCHER NOTICE]', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Cancel emergency countdown
  const cancelSosCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopLiveTracking();
    setCountdown(null);
    soundManager.stopSiren();
  };

  // Cancel / Resolve active emergency
  const resolveSos = async (alertId) => {
    setIsSosActive(false);
    setActiveAlert(null);
    stopLiveTracking();
    soundManager.stopSiren();

    if (alertId) {
      setEmergencyList(prev =>
        prev.map(e => (e.id === alertId ? { ...e, status: 'RESOLVED' } : e))
      );

      socket.emit('sos:status-update', {
        emergencyId: alertId,
        status: 'RESOLVED',
        note: 'Emergency resolved and closed.'
      });

      try {
        const token = localStorage.getItem('jivansetu_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch(getApiUrl(`/api/emergency/${alertId}/status`), {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: 'RESOLVED', note: 'Emergency resolved by user' })
        });
      } catch (err) {
        console.warn('Failed to resolve on server:', err.message);
      }
    }
  };

  // RMP accepts emergency
  const acceptEmergencyByRmp = async (alertId, rmpIdOverride = null) => {
    const rmpId = rmpIdOverride || user?.id || user?.rmpId;
    if (!rmpId) {
      console.warn('[EMERGENCY CONTEXT] Cannot accept emergency: RMP user ID is missing.');
      throw new Error('RMP user identity is required to accept emergency');
    }

    setEmergencyList(prev =>
      prev.map(e => (e.id === alertId ? { ...e, status: 'ACCEPTED_BY_RMP', rmpEnRoute: true } : e))
    );
    soundManager.playSuccessChime();

    socket.emit('sos:accept', {
      emergencyId: alertId,
      rmpId
    });

    try {
      const token = localStorage.getItem('jivansetu_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(getApiUrl(`/api/emergency/${alertId}/accept`), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ rmpId })
      });
    } catch (err) {
      console.warn('Failed to accept SOS on server:', err.message);
    }
  };

  return (
    <EmergencyContext.Provider
      value={{
        isSosActive,
        countdown,
        activeAlert,
        emergencyList,
        startSosCountdown,
        dispatchEmergency,
        cancelSosCountdown,
        resolveSos,
        acceptEmergencyByRmp
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
