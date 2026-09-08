import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useEmergency } from '../../context/EmergencyContext';
import { StatusBadge } from '../common/StatusBadge';
import confetti from 'canvas-confetti';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Video,
  UserPlus,
  PhoneCall,
  Activity,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Stethoscope,
  Info
} from 'lucide-react';

export const TriageResult = ({ result, onStartConsult, onReset }) => {
  const { lang, t } = useLanguage();
  const { startSosCountdown } = useEmergency();

  useEffect(() => {
    if (result.urgency === 'GREEN') {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {
        // ignore
      }
    }
  }, [result]);

  const isRed = result.urgency === 'RED' || result.urgency === 'EMERGENCY';
  const isYellow = result.urgency === 'YELLOW' || result.urgency === 'URGENT';
  const isGreen = result.urgency === 'GREEN' || result.urgency === 'ROUTINE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Mandatory Assistive Triage & Non-Diagnosis Disclaimer Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
          border: '1.5px solid #facc15',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(234, 179, 8, 0.12)'
        }}
      >
        <div style={{ color: '#a16207', flexShrink: 0, marginTop: '2px' }}>
          <ShieldAlert size={20} />
        </div>
        <div style={{ fontSize: '0.82rem', color: '#713f12', lineHeight: 1.45 }}>
          <strong>{lang === 'hi' ? '⚠️ सहायक क्लिनिकल ट्रायज सूचना (Assistive Triage Only):' : '⚠️ Assistive Clinical Triage Notice:'}</strong>
          <p style={{ marginTop: '2px', marginBottom: 0 }}>
            {lang === 'hi'
              ? result.disclaimerHi || 'यह स्वचालित मूल्यांकन केवल प्राथमिकता और आपातकालीन गंभीरता तय करने हेतु एक सहायक प्रणाली है, कोई चिकित्सीय निदान (Diagnosis) नहीं। योग्य डॉक्टर द्वारा प्रत्यक्ष जांच अनिवार्य है।'
              : result.disclaimer || 'This automated evaluation is an assistive clinical decision support tool designed to prioritize urgency. It is NOT a medical diagnosis. A certified doctor must examine the patient.'}
          </p>
        </div>
      </div>

      {/* 2. Main Urgency Outcome Card */}
      <div
        style={{
          background: isRed
            ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
            : isYellow
            ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
            : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: `2px solid ${isRed ? 'var(--emergency-500)' : isYellow ? 'var(--warning-500)' : 'var(--success-500)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: isRed ? '0 10px 30px rgba(239, 68, 68, 0.2)' : 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: isRed ? 'var(--emergency-600)' : isYellow ? 'var(--warning-500)' : 'var(--success-600)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              {isRed && <AlertOctagon size={32} className="pulse-alert" />}
              {isYellow && <AlertTriangle size={32} />}
              {isGreen && <CheckCircle2 size={32} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <StatusBadge urgency={isRed ? 'RED' : isYellow ? 'YELLOW' : 'GREEN'} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)' }}>
                  Assistive Risk Score: {result.score}/100
                </span>
              </div>
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: isRed ? 'var(--emergency-900)' : isYellow ? 'var(--warning-700)' : 'var(--success-700)'
                }}
              >
                {isRed ? t('urgencyRed') : isYellow ? t('urgencyYellow') : t('urgencyGreen')}
              </h2>
            </div>
          </div>

          <button onClick={onReset} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <RotateCcw size={14} />
            {lang === 'hi' ? 'पुनः जांचें' : 'Retake Triage'}
          </button>
        </div>

        {/* Clinical Reasoning & Specialty */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-900)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Sparkles size={16} color="var(--primary-600)" />
              <span>{lang === 'hi' ? 'सहायक क्लिनिकल निर्णय व अनुशंसित विभाग:' : 'Assistive Clinical Assessment & Recommended Specialty:'}</span>
            </div>
            {result.recommendedSpecialty && (
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Stethoscope size={12} />
                {result.recommendedSpecialty}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--slate-800)', lineHeight: 1.5, marginBottom: '0.4rem' }}>
            <strong>{lang === 'hi' ? 'अनुशंसित कार्यवाही:' : 'Recommended Protocol:'} </strong>
            {lang === 'hi' && result.recommendedActionHi ? result.recommendedActionHi : (result.recommendedAction || result.reason)}
          </p>

          {result.flagsDetected && result.flagsDetected.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)' }}>
                {lang === 'hi' ? 'पहचाने गए लक्षण:' : 'Detected Flags:'}
              </span>
              {result.flagsDetected.map((flag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: isRed ? '#fee2e2' : '#fef3c7',
                    color: isRed ? '#991b1b' : '#92400e',
                    fontWeight: 600
                  }}
                >
                  {typeof flag === 'string' ? flag : flag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Vitals & Input Summary */}
      <div className="card">
        <h4 style={{ fontSize: '0.98rem', color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={17} color="var(--primary-600)" />
          {lang === 'hi' ? 'दर्ज वाइटल्स एवं इनपुट सारांश' : 'Recorded Vitals & Symptoms Summary'}
        </h4>

        <div className="grid-4" style={{ marginBottom: '0.75rem' }}>
          <div style={{ background: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>Blood Pressure</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>{result.vitals?.bp || '130/84 mmHg'}</strong>
          </div>
          <div style={{ background: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>Heart Rate / Pulse</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>{result.vitals?.pulse || '80 bpm'}</strong>
          </div>
          <div style={{ background: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>Oxygen (SpO2)</span>
            <strong style={{ fontSize: '0.95rem', color: isRed ? 'var(--emergency-600)' : 'var(--slate-900)' }}>{result.vitals?.spo2 || '97%'}</strong>
          </div>
          <div style={{ background: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>Temperature</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>{result.vitals?.temp || '98.6 °F'}</strong>
          </div>
        </div>

        {result.description && (
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', background: 'var(--slate-100)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: 0 }}>
            <b>{lang === 'hi' ? 'वर्णन:' : 'Reported Symptoms:'}</b> {result.description}
          </p>
        )}
      </div>

      {/* 4. Action Recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)', fontWeight: 700 }}>
          {lang === 'hi' ? 'अनुशंसित त्वरित कदम:' : 'Recommended Action Protocol:'}
        </h4>

        {isRed && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={() => startSosCountdown(`Critical Triage Alert: ${result.category || 'Emergency'}`)}
              className="btn btn-emergency btn-lg"
              style={{ flex: 1, minWidth: '240px', fontWeight: 800 }}
            >
              <PhoneCall size={20} />
              {lang === 'hi' ? '🚨 तुरंत आपातकालीन SOS भेजें' : '🚨 Trigger Immediate Emergency SOS'}
            </button>
            <button
              onClick={onStartConsult}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, minWidth: '240px' }}
            >
              <Video size={20} />
              {lang === 'hi' ? 'इमरजेंसी डॉक्टर से वीडियो कॉल' : 'Emergency Doctor Video Call'}
            </button>
          </div>
        )}

        {(isYellow || isGreen) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={onStartConsult}
              className="btn btn-primary btn-lg"
              style={{ flex: 1, minWidth: '240px', fontWeight: 700 }}
            >
              <Video size={20} />
              {t('startTeleconsult')}
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => alert(lang === 'hi' ? 'आरएमपी को परामर्श अनुरोध भेजा गया।' : 'Consult request dispatched to on-duty RMP Anand Deshmukh.')}
              className="btn btn-outline btn-lg"
              style={{ flex: 1, minWidth: '200px' }}
            >
              <UserPlus size={18} />
              {lang === 'hi' ? 'आरएमपी गृह-मुलाकात अनुरोध' : 'Request RMP Field Visit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
