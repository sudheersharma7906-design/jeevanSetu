// src/components/common/SecurityInfoModal.jsx
import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Users,
  MapPinOff,
  Globe,
  FileCheck2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const SecurityInfoModal = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const { role, user, token } = useAuth();

  if (!isOpen) return null;

  const isHindi = lang === 'hi';

  const securityPillars = [
    {
      icon: Lock,
      title: isHindi ? 'शॉर्ट-लिव्ड जेडब्ल्यूटी (JWT) ऑथेंटिकेशन' : 'Short-Lived JWT Session Auth',
      desc: isHindi
        ? '1 घंटे की अवधि वाले सुरक्षित सत्र टोकन। लॉगआउट करने पर टोकन तत्काल ब्लैकलिस्ट और रद्द हो जाते हैं।'
        : 'Short-lived 1-hour session tokens with automatic refresh and instant server-side revocation on logout.',
      status: 'ACTIVE'
    },
    {
      icon: KeyRound,
      title: isHindi ? 'सुरक्षित पासवर्ड प्रमाणीकरण व क्रेडेंशियल सुरक्षा' : 'Secure Credential & Password Authentication',
      desc: isHindi
        ? 'भूमिका-आधारित सुरक्षित पासवर्ड प्रमाणीकरण, दर-सीमित (Rate-limited) लॉगिन और ऑटो-लॉकआउट सुरक्षा।'
        : 'Role-based encrypted password verification with automated brute-force rate-limiting, lockout protection, and credential integrity.',
      status: 'ACTIVE'
    },
    {
      icon: Users,
      title: isHindi ? 'भूमिका-आधारित अभिगम नियंत्रण (RBAC)' : 'Role-Based Access Control (RBAC)',
      desc: isHindi
        ? 'मरीज केवल अपना मेडिकल रिकॉर्ड देख सकते हैं। आरएमपी केवल आवंटित मरीजों की फाइलें खोल सकते हैं। डॉक्टर ही दवा पर्चा लिख सकते हैं।'
        : "Patients cannot view other patients' records (403 Forbidden). RMPs only see assigned patients. Only verified Doctors can author prescriptions.",
      status: 'ENFORCED'
    },
    {
      icon: MapPinOff,
      title: isHindi ? 'एसओएस-आधारित स्थान गोपनीयता (शून्य ट्रैकिंग)' : 'SOS-Trigger Location Only (Zero Background Tracking)',
      desc: isHindi
        ? 'मरीज की लोकेशन केवल एसओएस बटन दबाने पर तात्कालिक रूप से कैप्चर होती है। कोई निरंतर बैकग्राउंड जीपीएस ट्रैकिंग नहीं।'
        : 'GPS location coordinates are captured exclusively upon explicit SOS trigger with audit metadata. Zero continuous background tracking.',
      status: 'COMPLIANT'
    },
    {
      icon: Globe,
      title: isHindi ? 'एचटीटीपीएस और सुरक्षा हेडर' : 'HTTPS & Strict Security Headers',
      desc: isHindi
        ? 'एचएसटीएस (HSTS), नो-स्निफ़, एक्स-फ़्रेम विकल्प और क्लिकजैकिंग से बचाव के लिए सख्त हेडर सक्रिय।'
        : 'Strict-Transport-Security (HSTS 1-year), X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, and CSP enabled.',
      status: 'ENFORCED'
    },
    {
      icon: FileCheck2,
      title: isHindi ? 'इनपुट सैनिटाइजेशन और नो-एसक्यूएल/एक्सएसएस सुरक्षा' : 'Universal Input Sanitization & Anti-Injection',
      desc: isHindi
        ? 'सभी एपीआई एंडपॉइंट्स पर नो-एसक्यूएल इंजेक्शन ऑपरेटरों ($/.) और एक्सएसएस (XSS) स्क्रिप्ट्स का स्वचालित निष्प्रभावीकरण।'
        : 'Recursive deep sanitization stripping MongoDB injection keys and escaping HTML/JavaScript injection across all endpoints.',
      status: 'ACTIVE'
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid var(--slate-200)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {isHindi ? 'जीवनसेतु सुरक्षा एवं गोपनीयता आधारशिला' : 'JeevanSetu MVP Security Baseline'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                {isHindi ? 'ग्रामीण स्वास्थ्य डेटा संरक्षण मानक (ISO/DISHA दिशानिर्देशित)' : 'Rural Healthcare Data Protection Standards'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Session Bar */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f8fafc',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
            <span style={{ fontWeight: 700 }}>{isHindi ? 'सक्रिय सत्र:' : 'Active Session:'}</span>
            <span
              style={{
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.75rem'
              }}
            >
              {role}
            </span>
            <span>({user?.name || 'User'})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>{token ? 'JWT Bearer Authenticated' : 'Local Verified'}</span>
          </div>
        </div>

        {/* Security Pillars List */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: 'calc(90vh - 180px)'
          }}
        >
          {securityPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--slate-200)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
                      {item.title}
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.9rem 1.5rem',
            borderTop: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
            <AlertCircle size={15} color="#0284c7" />
            <span>{isHindi ? 'सभी संचार TLS 1.3 एन्क्रिप्टेड हैं' : 'All payload exchanges enforced via TLS 1.3 encryption'}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--slate-900)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {isHindi ? 'समझ गया' : 'Acknowledge'}
          </button>
        </div>
      </div>
    </div>
  );
};
