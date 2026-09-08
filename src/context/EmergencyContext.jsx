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

  // Immediate dispatch (without countdown or triggered after 5s)
  const dispatchEmergency = async (triggerSource = 'SOS Button', details = {}) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    setIsSosActive(true);

    soundManager.playEmergencySiren();

    // Acquire live GPS position via Browser Geolocation API
    let geo = {
      latitude: details.coordinates?.lat || 27.5644,
      longitude: details.coordinates?.lng || 80.6829,
      address: details.location || 'Rampur Kalan, Sitapur (2.4 km away)'
    };

    try {
      const liveGeo = await GeolocationService.getCurrentPosition({ timeout: 4000 });
      if (liveGeo && liveGeo.latitude) {
        geo = {
          latitude: details.coordinates?.lat || liveGeo.latitude,
          longitude: details.coordinates?.lng || liveGeo.longitude,
          address: details.location || liveGeo.address || 'Rural Emergency Location',
          accuracy: liveGeo.accuracy
        };
      }
    } catch (geoErr) {
      console.warn('[EMERGENCY CONTEXT] Geolocation fallback used:', geoErr.message);
    }

    const emergencyPayload = {
      patientId: details.patientId || 'pat-101',
      name: details.patientName || 'Rameshwar Patil',
      phone: details.patientPhone || '+91 98765 43210',
      age: details.age || 54,
      gender: details.gender || 'Male',
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
        continuousTracking: false,
        gpsTimestamp: new Date().toISOString()
      }
    };

    // 1. Emit real-time Socket.io trigger
    socket.emit('sos:trigger', emergencyPayload);

    // 2. Dispatch REST API call
    let serverEmergency = null;
    try {
      const res = await fetch(getApiUrl('/api/emergency/sos'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyPayload)
      });
      if (res.ok) {
        const data = await res.json();
        serverEmergency = data.emergency;
      }
    } catch (err) {
      console.warn('Backend REST SOS dispatch fallback:', err.message);
    }

    const newAlert = {
      id: serverEmergency?.id || `sos-${Date.now().toString().slice(-4)}`,
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
      assignedRmp: serverEmergency?.matchedRmp?.name || 'Dr. Anand Verma',
      matchedRmp: serverEmergency?.matchedRmp || {
        name: 'Dr. Anand Verma',
        clinicName: 'Wada Rural Clinic & Post',
        distanceKm: 2.4,
        phone: '+91 98112 34567'
      },
      chiefComplaint: emergencyPayload.symptoms,
      vitals: details.vitals || { bp: '150/98', pulse: '108 bpm', spo2: '93%' }
    };

    setActiveAlert(newAlert);
    setEmergencyList(prev => [newAlert, ...prev]);
  };

  // Cancel emergency countdown
  const cancelSosCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    soundManager.stopSiren();
  };

  // Cancel / Resolve active emergency
  const resolveSos = async (alertId) => {
    setIsSosActive(false);
    setActiveAlert(null);
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
        await fetch(getApiUrl(`/api/emergency/${alertId}/status`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'RESOLVED', note: 'Emergency resolved by user' })
        });
      } catch (err) {
        console.warn('Failed to resolve on server:', err.message);
      }
    }
  };

  // RMP accepts emergency
  const acceptEmergencyByRmp = async (alertId, rmpId = 'usr-rmp-001') => {
    setEmergencyList(prev =>
      prev.map(e => (e.id === alertId ? { ...e, status: 'ACCEPTED_BY_RMP', rmpEnRoute: true } : e))
    );
    soundManager.playSuccessChime();

    socket.emit('sos:accept', {
      emergencyId: alertId,
      rmpId
    });

    try {
      await fetch(getApiUrl(`/api/emergency/${alertId}/accept`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
