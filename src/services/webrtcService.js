// src/services/webrtcService.js
import { socket } from './socket.js';

export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export class WebRtcService {
  constructor(roomId, userId, role) {
    this.roomId = roomId;
    this.userId = userId;
    this.role = role;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    this.onConnectionStateCallback = null;
    this.isInitiator = false;

    this.setupSocketListeners();
  }

  /**
   * Set callback for when remote stream is received.
   */
  setOnRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * Set callback for connection state changes (connecting, connected, disconnected, failed).
   */
  setOnConnectionStateChange(callback) {
    this.onConnectionStateCallback = callback;
  }

  /**
   * Initialize local camera & microphone media stream.
   */
  async startLocalMedia(video = true, audio = true) {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
          audio: audio ? { echoCancellation: true, noiseSuppression: true } : false
        });
        return this.localStream;
      }
    } catch (err) {
      console.warn('[WebRTC] Media device access notice (simulated stream available):', err.message);
    }
    return null;
  }

  /**
   * Initialize RTCPeerConnection instance.
   */
  createPeerConnection() {
    if (this.peerConnection) return this.peerConnection;

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // ICE Candidate generation -> Send to remote peer via Socket.io
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate,
          senderId: this.userId
        });
      }
    };

    // Remote Track received
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.streams[0]);
      this.remoteStream = event.streams[0];
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(event.streams[0]);
      }
    };

    // Connection state logging & callback
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log(`[WebRTC] Peer Connection State: ${state}`);
      if (this.onConnectionStateCallback) {
        this.onConnectionStateCallback(state);
      }
    };

    return this.peerConnection;
  }

  /**
   * Join video room and initiate signaling.
   */
  joinRoom(isInitiator = false) {
    this.isInitiator = isInitiator;
    socket.emit('webrtc:join', {
      roomId: this.roomId,
      userId: this.userId,
      role: this.role
    });

    if (this.isInitiator) {
      this.createOffer();
    }
  }

  /**
   * Create SDP Offer and dispatch to remote peer.
   */
  async createOffer() {
    try {
      const pc = this.createPeerConnection();
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      socket.emit('webrtc:offer', {
        roomId: this.roomId,
        offer,
        senderId: this.userId
      });
      console.log('[WebRTC] SDP Offer sent to room:', this.roomId);
    } catch (err) {
      console.warn('[WebRTC] Create offer error:', err);
    }
  }

  /**
   * Receive SDP Offer, set remote description, and send SDP Answer.
   */
  async handleOffer(offer) {
    try {
      const pc = this.createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc:answer', {
        roomId: this.roomId,
        answer,
        senderId: this.userId
      });
      console.log('[WebRTC] SDP Answer sent to room:', this.roomId);
    } catch (err) {
      console.warn('[WebRTC] Handle offer error:', err);
    }
  }

  /**
   * Receive SDP Answer and set remote description.
   */
  async handleAnswer(answer) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[WebRTC] SDP Answer applied successfully.');
      }
    } catch (err) {
      console.warn('[WebRTC] Handle answer error:', err);
    }
  }

  /**
   * Receive and add remote ICE candidate.
   */
  async handleIceCandidate(candidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.warn('[WebRTC] Add ICE candidate warning:', err);
    }
  }

  /**
   * Setup Socket.io signaling event listeners.
   */
  setupSocketListeners() {
    socket.on('webrtc:user-joined', (data) => {
      console.log('[WebRTC] Another peer joined room:', data);
      if (this.isInitiator || this.role === 'doctor') {
        this.createOffer();
      }
    });

    socket.on('webrtc:offer', async ({ offer, senderId }) => {
      if (senderId !== this.userId) {
        await this.handleOffer(offer);
      }
    });

    socket.on('webrtc:answer', async ({ answer, senderId }) => {
      if (senderId !== this.userId) {
        await this.handleAnswer(answer);
      }
    });

    socket.on('webrtc:ice-candidate', async ({ candidate, senderId }) => {
      if (senderId !== this.userId) {
        await this.handleIceCandidate(candidate);
      }
    });

    socket.on('webrtc:user-left', () => {
      console.log('[WebRTC] Remote peer left consult room.');
      if (this.onConnectionStateCallback) {
        this.onConnectionStateCallback('disconnected');
      }
    });
  }

  /**
   * Toggle local audio track.
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle local video track.
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Start screen sharing and replace video track.
   */
  async startScreenShare() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (this.peerConnection) {
          const senders = this.peerConnection.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          this.stopScreenShare();
        };

        return screenStream;
      } catch (err) {
        console.warn('[WebRTC] Screen share canceled or not supported:', err);
      }
    }
    return null;
  }

  /**
   * Revert back to local camera after screen share.
   */
  async stopScreenShare() {
    if (this.localStream && this.peerConnection) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
      if (videoSender && videoTrack) {
        videoSender.replaceTrack(videoTrack);
      }
    }
  }

  /**
   * Teardown peer connection, release camera/mic, and leave room.
   */
  destroy() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    socket.emit('webrtc:leave', {
      roomId: this.roomId,
      userId: this.userId
    });

    socket.off('webrtc:user-joined');
    socket.off('webrtc:offer');
    socket.off('webrtc:answer');
    socket.off('webrtc:ice-candidate');
    socket.off('webrtc:user-left');
  }
}
