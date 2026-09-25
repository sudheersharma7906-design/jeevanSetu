// src/context/SocketContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';
import { soundManager } from '../utils/soundEffects';
import { getApiUrl } from '../config/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, role, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id || null);
  const [notifications, setNotifications] = useState([]);
  const [activeIncomingSos, setActiveIncomingSos] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [webPushPermission, setWebPushPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );

  // Helper to add floating toast
  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast = { id, timestamp: Date.now(), duration: 5000, ...toast };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration || 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Request browser Web Push notification permission
  const requestWebPushPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setWebPushPermission(perm);
        if (perm === 'granted') {
          addToast({
            type: 'SUCCESS',
            title: '🔔 Push Notifications Enabled',
            message: 'You will receive instant alerts for emergencies, consultations, and prescriptions.'
          });
        }
        return perm;
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
    return 'denied';
  }, [addToast]);

  // Dispatch browser native Web Push notification
  const triggerBrowserPush = useCallback(({ title, body, icon, data }) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          data
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('Failed to display browser notification:', err);
      }
    }
  }, []);

  // Fetch initial notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('jivansetu_token');
      const userId = user?.id || '';
      const roleParam = role || '';
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(getApiUrl(`/api/notifications?userId=${userId}&role=${roleParam}`), { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.warn('Could not fetch notifications from backend:', err.message);
    }
  }, [user, role]);

  // Register user session with socket server
  useEffect(() => {
    if (isAuthenticated && user) {
      socket.emit('user:register', {
        userId: user.id,
        role: role || user.role,
        name: user.name,
        phone: user.phone
      });
      fetchNotifications();
    }
  }, [isAuthenticated, user, role, fetchNotifications]);

  // Socket event listeners
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id);
      console.log(`[SOCKET] Connected to real-time server (${socket.id})`);

      if (user) {
        socket.emit('user:register', {
          userId: user.id,
          role: role || user.role,
          name: user.name,
          phone: user.phone
        });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
      console.log('[SOCKET] Disconnected from real-time server');
    };

    // Incoming SOS Alert (primarily for RMPs, Doctors, and Admins)
    const handleSosAlert = (data) => {
      console.log('[SOCKET EVENT: sos:alert received]', data);
      const emergency = data.emergency || data;

      // Play emergency siren sound
      soundManager.playEmergencySiren();

      // Show floating emergency modal/banner if RMP, Doctor, or Admin
      if (role === 'rmp' || role === 'doctor' || role === 'admin') {
        setActiveIncomingSos(emergency);
      }

      // Add to toast and push notification
      addToast({
        type: 'EMERGENCY',
        title: `🚨 CRITICAL SOS: ${emergency.patientName || 'Patient'}`,
        message: `${emergency.symptomsReported || 'Emergency reported'} • ${emergency.location?.address || 'Rural Area'}`,
        duration: 10000
      });

      triggerBrowserPush({
        title: `🚨 JeevanSetu Emergency SOS: ${emergency.patientName}`,
        body: `${emergency.symptomsReported || 'Critical distress reported'}. Nearest responder alert dispatched!`
      });

      // Add to notification list
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          recipientRole: 'RMP',
          type: 'EMERGENCY_SOS',
          title: `🚨 Emergency SOS: ${emergency.patientName}`,
          message: `${emergency.symptomsReported}. Location: ${emergency.location?.address || 'Nearby'}`,
          channel: 'SOCKET_PUSH',
          read: false,
          timestamp: new Date().toISOString(),
          metadata: { emergencyId: emergency.id }
        },
        ...prev
      ]);
    };

    // General Notification Received
    const handleNotificationReceived = (data) => {
      console.log('[SOCKET EVENT: notification:received]', data);
      const notif = data.notification || data;

      // Play subtle chime
      soundManager.playSuccessChime();

      addToast({
        type: notif.type === 'EMERGENCY_SOS' ? 'EMERGENCY' : 'INFO',
        title: notif.title || 'JeevanSetu Alert',
        message: notif.message || '',
        duration: 6000
      });

      triggerBrowserPush({
        title: notif.title || 'JeevanSetu Notification',
        body: notif.message || ''
      });

      setNotifications(prev => [
        {
          id: notif.id || `notif-${Date.now()}`,
          ...notif,
          read: false,
          timestamp: notif.timestamp || new Date().toISOString()
        },
        ...prev
      ]);
    };

    // Doctor Ready Notice in Consult
    const handleDoctorReady = (data) => {
      console.log('[SOCKET EVENT: consult:doctor-ready]', data);
      soundManager.playSuccessChime();

      addToast({
        type: 'SUCCESS',
        title: `🩺 Doctor is Ready: ${data.doctorName || 'Dr. Priya Sharma'}`,
        message: 'The teleconsultation room is active. Click to join video call.',
        duration: 8000
      });

      triggerBrowserPush({
        title: `🩺 ${data.doctorName || 'Doctor'} has entered the consult room`,
        body: 'Click to start your live video teleconsultation now.'
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('sos:alert', handleSosAlert);
    socket.on('notification:received', handleNotificationReceived);
    socket.on('consult:doctor-ready', handleDoctorReady);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('sos:alert', handleSosAlert);
      socket.off('notification:received', handleNotificationReceived);
      socket.off('consult:doctor-ready', handleDoctorReady);
    };
  }, [role, user, addToast, triggerBrowserPush]);

  // Mark single notification as read
  const markNotificationRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    );

    try {
      const token = localStorage.getItem('jivansetu_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(getApiUrl(`/api/notifications/${id}/read`), { method: 'PUT', headers });
    } catch (err) {
      console.warn('Failed to mark read on server:', err.message);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const token = localStorage.getItem('jivansetu_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(getApiUrl('/api/notifications/mark-all-read'), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userId: user?.id })
      });
    } catch (err) {
      console.warn('Failed to mark all read on server:', err.message);
    }
  };

  const dismissIncomingSos = () => {
    soundManager.stopSiren();
    setActiveIncomingSos(null);
  };

  const acceptIncomingSos = (emergencyId) => {
    soundManager.stopSiren();
    const rmpId = user?.id || user?.rmpId;
    if (!rmpId) {
      addToast({
        type: 'ERROR',
        title: 'Authentication Required',
        message: 'You must be logged in as an RMP to accept emergency calls.'
      });
      return;
    }
    socket.emit('sos:accept', {
      emergencyId,
      rmpId
    });
    setActiveIncomingSos(null);
    addToast({
      type: 'SUCCESS',
      title: '✅ SOS Accepted',
      message: 'You have accepted the emergency. Real-time navigation and patient telemetry active.'
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        socketId,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeIncomingSos,
        dismissIncomingSos,
        acceptIncomingSos,
        toasts,
        addToast,
        dismissToast,
        webPushPermission,
        requestWebPushPermission,
        triggerBrowserPush
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
