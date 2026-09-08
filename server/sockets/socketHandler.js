// server/sockets/socketHandler.js
import { EmergencyService } from '../modules/emergency/emergency.service.js';
import { NotificationService } from '../modules/notification/notification.service.js';

// Online user tracking registry: userId -> Set of socketIds
export const onlineUsers = new Map();
// SocketId -> { userId, role, name, joinedAt }
export const socketRegistry = new Map();

export function isUserOnline(userId) {
  const sockets = onlineUsers.get(userId);
  return Boolean(sockets && sockets.size > 0);
}

export function isRmpOnline(rmpId) {
  return isUserOnline(rmpId);
}

export function setupSocketHandlers(io) {
  // Inject global socket emitter into services
  const broadcastEmitter = (event, data) => {
    io.emit(event, data);
  };

  EmergencyService.setSocketEmitter(broadcastEmitter);
  EmergencyService.setIsUserOnlineCheck(isUserOnline);
  NotificationService.setSocketEmitter(broadcastEmitter);

  io.on('connection', (socket) => {
    console.log(`[SOCKET CONNECTED] Client connected: ${socket.id}`);

    // Register user session with role & personal room
    socket.on('user:register', ({ userId, role, name, phone }) => {
      if (userId) {
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        const userRoom = `user:${userId}`;
        socket.join(userRoom);
      }

      if (role) {
        const roleRoom = `role:${role.toLowerCase()}`;
        socket.join(roleRoom);
        socket.join(`role:${role.toUpperCase()}`);
      }

      socketRegistry.set(socket.id, {
        userId,
        role: role?.toUpperCase() || 'ANONYMOUS',
        name: name || 'User',
        phone: phone || '',
        connectedAt: new Date().toISOString()
      });

      console.log(`[SOCKET REGISTERED] User ${name || userId} (${role}) attached to socket ${socket.id}. Online sockets for user: ${onlineUsers.get(userId)?.size || 1}`);

      // Emit connected status ack
      socket.emit('user:registered', {
        socketId: socket.id,
        userId,
        role,
        online: true,
        serverTime: new Date().toISOString()
      });
    });

    // Join specific room (e.g. consult room or emergency tracker)
    socket.on('join-room', ({ roomId, userId, role, name }) => {
      if (roomId) {
        socket.join(roomId);
        console.log(`[SOCKET] Socket ${socket.id} (User: ${userId || name || 'Guest'}, Role: ${role}) joined room: ${roomId}`);
      }
      if (role) {
        socket.join(`role:${role.toLowerCase()}`);
        socket.join(`role:${role.toUpperCase()}`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('leave-room', ({ roomId }) => {
      if (roomId) {
        socket.leave(roomId);
        console.log(`[SOCKET] Socket ${socket.id} left room: ${roomId}`);
      }
    });

    // --- SOS Emergency Events ---
    socket.on('sos:trigger', async (data) => {
      try {
        console.log(`[SOCKET SOS TRIGGER] Received from ${socket.id}:`, data);
        const emergency = await EmergencyService.triggerSos(data);
        socket.emit('sos:triggered-success', { emergency });
      } catch (err) {
        socket.emit('sos:error', { error: err.message });
      }
    });

    socket.on('sos:accept', async ({ emergencyId, rmpId }) => {
      try {
        const userMeta = socketRegistry.get(socket.id);
        const effectiveRmpId = rmpId || userMeta?.userId || 'usr-rmp-001';
        const updated = await EmergencyService.acceptSos(emergencyId, effectiveRmpId);
        
        io.emit('sos:status-update', {
          emergencyId,
          status: updated.status,
          matchedRmp: updated.matchedRmp,
          message: `${updated.matchedRmp?.name || 'RMP'} has accepted the emergency! First responder is en route.`
        });
      } catch (err) {
        socket.emit('sos:error', { error: err.message });
      }
    });

    socket.on('sos:escalate', async ({ emergencyId, reason, targetTier }) => {
      try {
        const updated = await EmergencyService.escalateSos(emergencyId, { reason, targetTier });
        io.emit('sos:status-update', {
          emergencyId,
          status: updated.status,
          tier: updated.tier,
          message: `Emergency escalated to Tier ${updated.tier}. District Hub & 108 Ambulance notified.`
        });
      } catch (err) {
        socket.emit('sos:error', { error: err.message });
      }
    });

    socket.on('sos:status-update', async ({ emergencyId, status, note }) => {
      try {
        const updated = await EmergencyService.updateStatus(emergencyId, status, note);
        io.emit('sos:status-update', {
          emergencyId,
          status: updated.status,
          message: note || `Emergency status is now ${status}.`
        });
      } catch (err) {
        socket.emit('sos:error', { error: err.message });
      }
    });

    // --- Consultations & Telemedicine Notifications ---
    socket.on('consult:doctor-ready', async ({ consultId, doctorId, doctorName, patientId }) => {
      console.log(`[SOCKET] Doctor ${doctorName} is ready in consult ${consultId}`);
      io.to(`consult:${consultId}`).emit('consult:doctor-ready', {
        consultId,
        doctorId,
        doctorName,
        timestamp: new Date().toISOString()
      });

      if (patientId) {
        io.to(`user:${patientId}`).emit('consult:doctor-ready', {
          consultId,
          doctorName,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('consult:reminder', async ({ consultId, patientId, minutesBefore }) => {
      io.to(`user:${patientId}`).emit('notification:received', {
        type: 'CONSULT_REMINDER',
        title: '🩺 Teleconsultation Starting Soon',
        message: `Your video consultation starts in ${minutesBefore || 15} minutes.`,
        metadata: { consultId }
      });
    });

    // --- In-Consult Live Chat ---
    socket.on('consult:message', ({ roomId, message, senderId, senderName, senderRole }) => {
      const chatPayload = {
        id: `msg-${Date.now()}`,
        roomId,
        message,
        senderId,
        senderName: senderName || 'User',
        senderRole: senderRole || 'PATIENT',
        timestamp: new Date().toISOString()
      };
      io.to(roomId).emit('consult:message', chatPayload);
    });

    // --- WebRTC Signaling ---
    socket.on('webrtc:join', ({ roomId, userId, role, name }) => {
      socket.join(roomId);
      console.log(`[WebRTC] User ${name || userId} (${role}) joined video room: ${roomId}`);
      socket.to(roomId).emit('webrtc:user-joined', {
        socketId: socket.id,
        userId,
        role,
        name
      });
    });

    socket.on('webrtc:offer', ({ roomId, offer, senderId }) => {
      socket.to(roomId).emit('webrtc:offer', {
        offer,
        senderId: senderId || socket.id,
        socketId: socket.id
      });
    });

    socket.on('webrtc:answer', ({ roomId, answer, senderId }) => {
      socket.to(roomId).emit('webrtc:answer', {
        answer,
        senderId: senderId || socket.id,
        socketId: socket.id
      });
    });

    socket.on('webrtc:ice-candidate', ({ roomId, candidate, senderId }) => {
      socket.to(roomId).emit('webrtc:ice-candidate', {
        candidate,
        senderId: senderId || socket.id,
        socketId: socket.id
      });
    });

    socket.on('webrtc:leave', ({ roomId, userId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('webrtc:user-left', {
        userId,
        socketId: socket.id
      });
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const meta = socketRegistry.get(socket.id);
      if (meta?.userId) {
        const set = onlineUsers.get(meta.userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) onlineUsers.delete(meta.userId);
        }
      }
      socketRegistry.delete(socket.id);
      console.log(`[SOCKET DISCONNECTED] Client disconnected: ${socket.id} (User: ${meta?.name || 'Anonymous'})`);
    });
  });
}
