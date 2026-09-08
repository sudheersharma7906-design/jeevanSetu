// src/services/socket.js
import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/api';

const SOCKET_SERVER_URL = getSocketUrl();

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling']
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinRoom = (roomId, userMeta = {}) => {
  if (socket.connected) {
    socket.emit('join-room', { roomId, ...userMeta });
  }
};

export const leaveRoom = (roomId) => {
  if (socket.connected) {
    socket.emit('leave-room', { roomId });
  }
};

export default socket;
