import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, AlertOctagon, X, PhoneCall } from 'lucide-react';

export const SOSButton = ({ isFloating = false, customSize }) => {
  const { countdown, isSosActive, startSosCountdown, cancelSosCountdown, activeAlert } = useEmergency();
  const { lang, t } = useLanguage();

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // countdown is 5 to 1. stroke-dashoffset: 0 when 5, circumference when 0
  const progressPercent = countdown !== null ? (5 - countdown) / 5 : 0;
  const strokeDashoffset = circumference * (1 - progressPercent);

  // If countdown is active, show the high-priority modal / countdown ring
  if (countdown !== null) {
    return (
      <div className="modal-backdrop" style={{ zIndex: 2000 }}>
        <div
          className="modal-card"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            border: '3px solid var(--emergency-500)',
            boxShadow: '0 0 45px rgba(239, 68, 68, 0.4)'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '0.75rem',
              borderRadius: '50%',
              background: 'var(--emergency-100)',
              color: 'var(--emergency-600)',
              marginBottom: '1rem'
            }}
          >
            <AlertOctagon size={48} className="pulse-alert" />
          </div>

          <h2 style={{ fontSize: '1.75rem', color: 'var(--emergency-700)', marginBottom: '0.5rem' }}>
            {lang === 'hi' ? '🚨 आपातकालीन SOS सक्रिय हो रहा है!' : '🚨 Triggering Emergency SOS!'}
          </h2>
          <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {lang === 'hi'
              ? 'निकटतम आरएमपी एवं डॉक्टर को तत्काल सूचना भेजी जा रही है।'
              : 'Alerting nearest Rural Medical Practitioner & District Emergency Hub.'}
          </p>

          {/* SVG Animated Circular Countdown */}
          <div className="countdown-container">
            <svg className="countdown-svg" viewBox="0 0 130 130">
              <circle
                className="countdown-circle-bg"
                cx="65"
                cy="65"
                r={radius}
              />
              <circle
                className="countdown-circle-progress"
                cx="65"
                cy="65"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="countdown-number">{countdown}</div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={cancelSosCountdown}
              className="btn btn-secondary btn-lg"
              style={{
                background: 'var(--slate-900)',
                color: 'white',
                border: 'none',
                fontWeight: 700
              }}
            >
              <X size={20} />
              {t('cancelSos')}
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              {lang === 'hi'
                ? 'यदि गलती से दब गया है तो तुरंत रद्द करें'
                : 'Click cancel if this was triggered accidentally'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If floating action button
  if (isFloating) {
    return (
      <button
        onClick={() => startSosCountdown('Floating SOS Button')}
        className="floating-sos-btn"
        title={t('sosButton')}
        aria-label="Emergency SOS"
      >
        <ShieldAlert size={28} />
        <span style={{ fontSize: '0.7rem', marginTop: '2px', letterSpacing: '0.05em' }}>SOS</span>
      </button>
    );
  }

  // Dashboard / Inline Emergency Banner Button
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '2px solid var(--emergency-400)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.12)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'var(--emergency-600)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)'
          }}
        >
          <ShieldAlert size={30} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--emergency-900)', fontWeight: 800 }}>
            {lang === 'hi' ? 'आपातकालीन सहायता (SOS)' : 'One-Tap Emergency SOS'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--emergency-700)' }}>
            {lang === 'hi'
              ? 'गंभीर स्थिति में दबाएं। ५ सेकंड में निकटतम RMP और एम्बुलेंस को अलर्ट जाएगा।'
              : 'Directly dispatches emergency alert with your GPS coordinates to on-duty RMP.'}
          </p>
        </div>
      </div>

      <button
        onClick={() => startSosCountdown('Dashboard SOS Banner')}
        className="btn btn-emergency btn-lg"
        style={{ fontSize: '1.1rem', fontWeight: 800, padding: '0.9rem 2rem' }}
      >
        <PhoneCall size={20} />
        {t('sosButton')}
      </button>
    </div>
  );
};
