import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { useEmergency } from '../../context/EmergencyContext';
import {
  HeartPulse,
  Clock,
  CheckCircle,
  Phone,
  Radio,
  Smartphone,
  Navigation
} from 'lucide-react';

export const PatientLiveSosTracker = ({ alert, onResolve }) => {
  const { socket } = useSocket();
  const { lang } = useLanguage();
  const { resolveSos } = useEmergency();

  const [liveStatus, setLiveStatus] = useState(alert?.status || 'DISPATCHED');
  const [matchedRmp, setMatchedRmp] = useState(alert?.matchedRmp || {
    name: 'Dr. Anand Verma',
    clinicName: 'Wada Rural Clinic & Emergency Post',
    distanceKm: 2.4,
    phone: '+91 98112 34567'
  });
  const [statusLog, setStatusLog] = useState([
    {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: '🚨 Emergency SOS broadcast initiated across rural telemetry network.',
      type: 'INIT'
    },
    {
      time: new Date(Date.now() + 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: '📡 Socket push & backup SMS/WhatsApp sent to Dr. Anand Verma (2.4 km away).',
      type: 'SMS'
    }
  ]);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [isEscalated, setIsEscalated] = useState(false);

  // Listen to live socket status updates
  useEffect(() => {
    const handleStatusUpdate = (data) => {
      console.log('[PATIENT TRACKER] Live SOS status update received:', data);
      if (data.status) {
        setLiveStatus(data.status);
      }
      if (data.matchedRmp) {
        setMatchedRmp(data.matchedRmp);
      }
      if (data.tier === 2 || data.status === 'ESCALATED') {
        setIsEscalated(true);
      }

      setStatusLog(prev => [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: data.message || `Status changed to ${data.status}`,
          type: data.status
        },
        ...prev
      ]);
    };

    socket.on('sos:status-update', handleStatusUpdate);
    return () => socket.off('sos:status-update', handleStatusUpdate);
  }, [socket]);

  // Countdown timer for 45s auto-escalation
  useEffect(() => {
    if (liveStatus === 'ACCEPTED' || liveStatus === 'ACCEPTED_BY_RMP' || liveStatus === 'RESOLVED') {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsEscalated(true);
          setLiveStatus('ESCALATED');
          setStatusLog(l => [
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              text: '🚨 45s RMP Response Timeout: Auto-escalated to District Trauma Hub & 108 Emergency Ambulance.',
              type: 'ESCALATED'
            },
            ...l
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [liveStatus]);

  const isAccepted = liveStatus === 'ACCEPTED' || liveStatus === 'ACCEPTED_BY_RMP';

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
        border: '2px solid var(--emergency-500)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--emergency-600)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 6px rgba(239, 68, 68, 0.2)',
              animation: 'pulse 1.5s infinite'
            }}
          >
            <HeartPulse size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emergency-700)', margin: 0 }}>
                {lang === 'hi' ? '🚨 लाइव आपातकालीन स्थिति ट्रैकर' : '🚨 Live SOS Emergency Status Tracker'}
              </h3>
              <span className="badge badge-danger">
                <Radio size={12} className="pulse-alert" /> LIVE STREAM
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
              Patient: <b>{alert?.patientName || 'Rameshwar Patil'}</b> • SOS ID: {alert?.id || 'sos-101'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onResolve ? onResolve() : resolveSos(alert?.id)}
          className="btn btn-secondary btn-sm"
          style={{ fontWeight: 700, borderColor: 'var(--slate-300)' }}
        >
          {lang === 'hi' ? 'आपातकाल समाप्त करें' : 'Cancel / Resolve SOS'}
        </button>
      </div>

      {/* Dynamic Status Progress Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          border: '1px solid var(--emergency-200)'
        }}
      >
        {[
          { step: 1, label: lang === 'hi' ? '1. SOS प्रसारित' : '1. SOS Triggered', active: true, done: true },
          { step: 2, label: lang === 'hi' ? '2. SMS/ऐप अलर्ट' : '2. Alert & SMS Dispatched', active: true, done: true },
          { step: 3, label: lang === 'hi' ? '3. RMP स्वीकृत' : '3. RMP Accepted', active: isAccepted, done: isAccepted },
          { step: 4, label: lang === 'hi' ? '4. रवाना (En Route)' : '4. First Responder En Route', active: isAccepted, done: false },
          { step: 5, label: lang === 'hi' ? '5. सहायता उपलब्ध' : '5. Care Delivered', active: liveStatus === 'RESOLVED', done: liveStatus === 'RESOLVED' }
        ].map((item) => (
          <div
            key={item.step}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.3rem',
              opacity: item.active ? 1 : 0.4
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: item.done ? 'var(--success-500)' : item.active ? 'var(--emergency-600)' : 'var(--slate-200)',
                color: item.active || item.done ? 'white' : 'var(--slate-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}
            >
              {item.done ? <CheckCircle size={18} /> : item.step}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.active ? 'var(--slate-900)' : 'var(--slate-500)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="sos-tracker-grid">
        {/* Left: Matched RMP / Ambulance Card */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: isEscalated ? '2px solid var(--emergency-500)' : '1.5px solid var(--primary-200)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isEscalated ? 'var(--emergency-700)' : 'var(--primary-700)', textTransform: 'uppercase' }}>
              {isEscalated ? '🚨 Tier 2 District Escalation Dispatch' : '👨‍⚕️ Nearest First Responder (RMP)'}
            </span>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
              {isEscalated ? '108 Emergency Ambulance & Trauma Hub' : matchedRmp?.name || 'Dr. Anand Verma'}
            </h4>

            <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: '0.2rem 0' }}>
              {isEscalated ? 'District Trauma Hospital, Wada block dispatch unit' : matchedRmp?.clinicName || 'Wada Rural Clinic'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--slate-700)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                <Navigation size={14} color="var(--primary-600)" />
                {matchedRmp?.distanceKm || '2.4'} km away
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: 'var(--emergency-600)' }}>
                <Clock size={14} />
                ETA: ~{isAccepted ? '5-7 Mins' : 'Awaiting RMP Pickup'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href={`tel:${matchedRmp?.phone || '+919811234567'}`}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Phone size={14} />
              <span>Call Responder ({matchedRmp?.phone || '+91 98112 34567'})</span>
            </a>
          </div>
        </div>

        {/* Right: Auto-Escalation Countdown / Fallback Status */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--emergency-200)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)' }}>
                Response Timeout Protocol:
              </span>
              <span className={`badge ${isAccepted ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                {isAccepted ? '✅ RMP Assigned' : '⏱️ 45s Countdown'}
              </span>
            </div>

            {!isAccepted && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: 'var(--emergency-700)' }}>
                  <span>Auto-Escalation in:</span>
                  <span>{secondsRemaining}s</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--slate-200)',
                    borderRadius: '999px',
                    marginTop: '0.35rem',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(secondsRemaining / 45) * 100}%`,
                      background: 'linear-gradient(90deg, var(--emergency-500), var(--emergency-600))',
                      transition: 'width 1s linear'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Smartphone size={13} color="var(--primary-600)" />
                <span>Twilio SMS & WhatsApp alert dispatched to offline RMP.</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Radio size={13} color="var(--emergency-600)" />
                <span>Real-time GPS telemetry connected to Taluka Emergency Hub.</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Stream Log */}
      <div
        style={{
          background: '#0f172a',
          color: '#f1f5f9',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1rem',
          fontSize: '0.78rem',
          fontFamily: 'monospace',
          maxHeight: '140px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '0.3rem' }}>
          <span>📡 REAL-TIME EVENT STREAM LOG</span>
          <span>WebSocket + Carrier Gateway</span>
        </div>
        {statusLog.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.6rem', color: log.type === 'ESCALATED' ? '#f87171' : log.type === 'SMS' ? '#67e8f9' : '#a7f3d0' }}>
            <span style={{ color: '#64748b' }}>[{log.time}]</span>
            <span>{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
