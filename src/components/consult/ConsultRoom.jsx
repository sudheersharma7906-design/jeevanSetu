import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMedicalData } from '../../context/MedicalDataContext';
import { WebRtcService } from '../../services/webrtcService';
import { socket } from '../../services/socket';
import { Modal } from '../common/Modal';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Send,
  CheckCircle,
  MonitorUp,
  Wifi
} from 'lucide-react';

export const ConsultRoom = ({ patient, onEndCall, onOpenPrescription }) => {
  const { role, user } = useAuth();
  const { lang, t } = useLanguage();
  const { addPrescription } = useMedicalData();

  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [remoteStreamAttached, setRemoteStreamAttached] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'System',
      text: 'Encrypted Teleconsultation session initiated. WebRTC P2P stream & Socket.io channel ready.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showRxModal, setShowRxModal] = useState(false);

  // Quick Prescription Form state inside Consult Room
  const [rxDiagnosis, setRxDiagnosis] = useState('Acute Exacerbation of Angina / Hypertensive Urgency');
  const [rxMeds, setRxMeds] = useState([
    { name: 'Tab. Sorbitrate 5mg (Sublingual)', dosage: '1 stat, under tongue', timing: 'Immediate', duration: '1 Day' },
    { name: 'Tab. Aspirin 150mg', dosage: '1 Tab Daily after meal', timing: 'Morning', duration: '15 Days' },
    { name: 'Tab. Telmisartan 40mg', dosage: '1 Tab Daily', timing: 'Morning', duration: '30 Days' }
  ]);
  const [rxDiet, setRxDiet] = useState('Strict bed rest, zero exertion, avoid cold exposure, proceed to district hospital if pain recurs.');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const webrtcRef = useRef(null);

  const roomId = `room-consult-${patient?.patientId || patient?.id || 'active-session'}`;

  // Initialize WebRTC & Media Streams
  useEffect(() => {
    const webrtc = new WebRtcService(roomId, user?.id || `usr-${Date.now()}`, role);
    webrtcRef.current = webrtc;

    webrtc.setOnRemoteStream((stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setRemoteStreamAttached(true);
      }
    });

    webrtc.setOnConnectionStateChange((state) => {
      setConnectionState(state);
    });

    // Start local camera stream
    webrtc.startLocalMedia(isCamOn, isMicOn).then((stream) => {
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      webrtc.joinRoom(role === 'doctor');
    });

    // Notify others that doctor is ready
    if (role === 'doctor') {
      socket.emit('consult:doctor-ready', {
        consultId: patient?.id || 'con-101',
        doctorId: user?.id,
        doctorName: user?.name,
        patientId: patient?.patientId
      });
    }

    // In-call chat listener via Socket.io
    const handleInCallMessage = (msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            sender: msg.senderName,
            text: msg.message,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });
    };

    socket.on('consult:message', handleInCallMessage);

    return () => {
      socket.off('consult:message', handleInCallMessage);
      webrtc.destroy();
    };
  }, [roomId, user, role, patient]);

  // Audio / Video Toggle
  const handleToggleCam = () => {
    const next = !isCamOn;
    setIsCamOn(next);
    if (webrtcRef.current) {
      webrtcRef.current.toggleVideo(next);
    }
  };

  const handleToggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    if (webrtcRef.current) {
      webrtcRef.current.toggleAudio(next);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!webrtcRef.current) return;
    if (isScreenSharing) {
      await webrtcRef.current.stopScreenShare();
      setIsScreenSharing(false);
    } else {
      const stream = await webrtcRef.current.startScreenShare();
      if (stream) {
        setIsScreenSharing(true);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = user?.name || (role === 'doctor' ? 'Dr. Priya Nambiar' : 'Patient');
    const newMsg = {
      id: `msg-${Date.now()}`,
      roomId,
      message: inputText.trim(),
      senderId: user?.id || 'guest',
      senderName,
      senderRole: role?.toUpperCase() || 'PATIENT',
      timestamp: new Date().toISOString()
    };

    // Emit to Socket.io for all participants
    socket.emit('consult:message', newMsg);

    setChatMessages((prev) => [
      ...prev,
      {
        id: newMsg.id,
        sender: senderName,
        text: newMsg.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputText('');
  };

  const handleCreatePrescription = (e) => {
    e.preventDefault();
    const created = addPrescription({
      doctorName: user?.name || 'Dr. Priya Nambiar',
      patientName: patient?.patientName || 'Rameshwar Sharma',
      patientAge: patient?.age || 54,
      diagnosis: rxDiagnosis,
      diagnosisHi: lang === 'hi' ? 'सीने में दर्द एवं उच्च रक्तचाप' : 'Angina / Hypertension',
      medicines: rxMeds,
      dietAdvice: rxDiet
    });

    setShowRxModal(false);
    if (onOpenPrescription) {
      onOpenPrescription(created);
    }
  };

  return (
    <div className="consult-room-grid">
      {/* 1. Video Conference Viewport */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--slate-950)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative'
        }}
      >
        {/* Main Remote Video Stream Window */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)',
            minHeight: '400px',
            overflow: 'hidden'
          }}
        >
          {/* Remote Video Stream if live, or fallback avatar stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: remoteStreamAttached ? 'block' : 'none'
            }}
          />

          {!remoteStreamAttached && (
            <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '2.5rem',
                  boxShadow: '0 0 25px rgba(13, 148, 136, 0.4)'
                }}
              >
                {role === 'doctor' ? '👨‍🌾' : '👩‍⚕️'}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {role === 'doctor' ? (patient?.patientName || 'Rameshwar Sharma') : 'Dr. Priya Nambiar (MD, Cardiology)'}
              </h3>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: remoteStreamAttached ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                  border: `1px solid ${remoteStreamAttached ? '#10b981' : '#eab308'}`,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  color: remoteStreamAttached ? '#6ee7b7' : '#fde047'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: remoteStreamAttached ? '#10b981' : '#eab308' }} />
                {remoteStreamAttached
                  ? (lang === 'hi' ? 'लाइव WebRTC P2P वीडियो सक्रिय' : 'Live WebRTC P2P Video Active')
                  : (lang === 'hi' ? 'WebRTC सिग्नैलिंग सक्रिय (डेमो / पीयर वीडियो प्रतीक्षारत)' : 'WebRTC Signaling Active (Demo / Waiting for Peer Video)')}
              </div>
            </div>
          )}

          {/* Picture-in-Picture Self Camera Window */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '150px',
              height: '110px',
              background: '#334155',
              borderRadius: 'var(--radius-md)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isCamOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: 'var(--slate-400)', fontSize: '0.75rem', textAlign: 'center' }}>
                <VideoOff size={20} style={{ margin: '0 auto 4px' }} />
                <span>Cam Muted</span>
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '6px',
                fontSize: '0.65rem',
                color: 'white',
                background: 'rgba(0,0,0,0.6)',
                padding: '1px 5px',
                borderRadius: '3px'
              }}
            >
              You ({role})
            </div>
          </div>

          {/* WebRTC Connection Telemetry Status HUD */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Wifi size={13} color={connectionState === 'connected' ? '#10b981' : '#f59e0b'} />
            <span>
              WebRTC: <b>{connectionState.toUpperCase()}</b> • STUN P2P
            </span>
          </div>

          {/* Vitals HUD overlay on bottom-left */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '0.75rem',
              display: 'flex',
              gap: '0.85rem'
            }}
          >
            <span><b>BP:</b> 142/92</span>
            <span><b>HR:</b> 84 bpm</span>
            <span><b>SpO2:</b> 96%</span>
          </div>
        </div>

        {/* Video Controls Bar */}
        <div
          style={{
            padding: '1rem',
            background: 'var(--slate-900)',
            borderTop: '1px solid var(--slate-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Cam Toggle */}
          <button
            onClick={handleToggleCam}
            className={`btn btn-sm ${isCamOn ? 'btn-secondary' : 'btn-outline'}`}
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}
            title={isCamOn ? t('camOff') : t('camOn')}
          >
            {isCamOn ? <Video size={18} /> : <VideoOff size={18} color="var(--emergency-500)" />}
          </button>

          {/* Mic Toggle */}
          <button
            onClick={handleToggleMic}
            className={`btn btn-sm ${isMicOn ? 'btn-secondary' : 'btn-outline'}`}
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}
            title={isMicOn ? t('micOff') : t('micOn')}
          >
            {isMicOn ? <Mic size={18} /> : <MicOff size={18} color="var(--emergency-500)" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            onClick={handleToggleScreenShare}
            className={`btn btn-sm ${isScreenSharing ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}
            title="Screen Share"
          >
            <MonitorUp size={18} />
          </button>

          {/* Doctor only: Issue Rx button */}
          {role === 'doctor' && (
            <button
              onClick={() => setShowRxModal(true)}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, gap: '0.4rem' }}
            >
              <FileText size={16} />
              {t('issuePrescription')}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="btn btn-emergency btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.25rem', fontWeight: 700 }}
          >
            <PhoneOff size={18} />
            {t('endCall')}
          </button>
        </div>
      </div>

      {/* 2. In-Call Chat & Clinical Notes Sidebar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          height: '100%',
          maxHeight: '620px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--slate-200)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="var(--primary-600)" />
            <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>{t('chatTitle')}</h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
            {chatMessages.length} notes
          </span>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {chatMessages.map(msg => {
            const isMe = msg.sender === user?.name;
            const isSystem = msg.sender === 'System';

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  style={{
                    background: 'var(--slate-100)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--slate-600)',
                    textAlign: 'center'
                  }}
                >
                  🔒 {msg.text}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: isMe ? 'var(--primary-600)' : 'var(--slate-100)',
                  color: isMe ? 'white' : 'var(--slate-900)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    marginBottom: '2px',
                    color: isMe ? 'var(--primary-100)' : 'var(--primary-800)'
                  }}
                >
                  {msg.sender}
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{msg.text}</div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    marginTop: '4px',
                    textAlign: 'right',
                    opacity: 0.75
                  }}
                >
                  {msg.time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <input
            type="text"
            className="form-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('typeMessage')}
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 0.85rem' }}>
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Doctor Quick Prescription Modal */}
      <Modal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        title={lang === 'hi' ? 'डिजिटल दवा पर्चा (Rx) जारी करें' : 'Generate Digital Prescription'}
        maxWidth="640px"
      >
        <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">{lang === 'hi' ? 'नैदानिक निष्कर्ष (Clinical Diagnosis)' : 'Diagnosis'}</label>
            <input
              type="text"
              className="form-input"
              value={rxDiagnosis}
              onChange={(e) => setRxDiagnosis(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">{lang === 'hi' ? 'दवाइयां (Medications)' : 'Medications'}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {rxMeds.map((med, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--slate-50)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--slate-200)',
                    fontSize: '0.85rem'
                  }}
                >
                  <strong>{med.name}</strong> — {med.dosage} ({med.timing}, {med.duration})
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{lang === 'hi' ? 'विशेष सलाह व परहेज (Lifestyle & Diet Advice)' : 'Dietary Advice'}</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={rxDiet}
              onChange={(e) => setRxDiet(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowRxModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              <CheckCircle size={16} />
              {lang === 'hi' ? 'दवा पर्चा जारी करें व मरीज को भेजें' : 'Sign & Transmit Prescription'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
