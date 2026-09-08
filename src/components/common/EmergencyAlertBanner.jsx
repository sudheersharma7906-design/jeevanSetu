// src/components/common/EmergencyAlertBanner.jsx
import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  AlertTriangle,
  HeartPulse,
  CheckCircle,
  X,
  MapPin
} from 'lucide-react';

export const EmergencyAlertBanner = ({ onAcceptNavigate }) => {
  const { activeIncomingSos, dismissIncomingSos, acceptIncomingSos } = useSocket();
  const { lang } = useLanguage();

  if (!activeIncomingSos) return null;

  const handleAccept = () => {
    acceptIncomingSos(activeIncomingSos.id);
    if (onAcceptNavigate) {
      onAcceptNavigate(activeIncomingSos);
    }
  };

  const patientName = activeIncomingSos.patientName || 'Critical Patient';
  const location = activeIncomingSos.location?.address || 'Rampur Kalan (2.4 km away)';
  const symptoms = activeIncomingSos.symptomsReported || 'Acute emergency distress reported via SOS trigger';
  const triggerType = activeIncomingSos.triggerType || 'BUTTON';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
          border: '3px solid var(--emergency-600)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.5), 0 0 0 8px rgba(239, 68, 68, 0.25)',
          position: 'relative',
          animation: 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Siren Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'var(--emergency-600)',
              color: 'white',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.5px'
            }}
          >
            <AlertTriangle size={18} className="pulse-alert" />
            <span>{lang === 'hi' ? '🚨 आपातकालीन SOS चेतावनी' : '🚨 INCOMING SOS EMERGENCY ALERT'}</span>
          </div>

          <button
            onClick={dismissIncomingSos}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--slate-400)', padding: '0.3rem' }}
            title="Dismiss"
          >
            <X size={20} />
          </button>
        </div>

        {/* Patient Profile & Urgency */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--emergency-100)',
              border: '2px solid var(--emergency-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emergency-600)',
              flexShrink: 0
            }}
          >
            <HeartPulse size={36} className="pulse-alert" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--slate-900)', fontWeight: 800, lineHeight: 1.2 }}>
              {patientName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              <span className="badge badge-danger">🔴 RED TIER 1</span>
              <span>•</span>
              <span>Trigger: <b>{triggerType}</b></span>
              <span>•</span>
              <span style={{ color: 'var(--emergency-600)', fontWeight: 700 }}>45s Auto-Escalation Active</span>
            </div>
          </div>
        </div>

        {/* Detail Box */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--emergency-200)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginBottom: '1.5rem',
            fontSize: '0.88rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <MapPin size={18} color="var(--emergency-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>Location & Distance:</span>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{location}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <AlertTriangle size={18} color="var(--warning-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>Reported Symptoms / Complaint:</span>
              <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{symptoms}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
          <button
            onClick={dismissIncomingSos}
            className="btn btn-secondary btn-lg"
            style={{ fontWeight: 700 }}
          >
            {lang === 'hi' ? 'खारिज करें' : 'Dismiss'}
          </button>
          <button
            onClick={handleAccept}
            className="btn btn-emergency btn-lg"
            style={{
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={20} />
            <span>{lang === 'hi' ? 'स्वीकार करें व रवाना हों' : 'Accept SOS & Respond'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
