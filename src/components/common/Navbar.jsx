// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { NotificationBell } from './NotificationBell';
import { SecurityInfoModal } from './SecurityInfoModal';
import {
  Globe,
  LogOut,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

export const Navbar = ({ setCurrentTab }) => {
  const { role, user, logout, isAuthenticated } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { isConnected } = useSocket();
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  if (!isAuthenticated) return null;

  const handleNotificationNavigate = (notif) => {
    if (notif.type?.includes('CONSULT') || notif.type?.includes('DOCTOR')) {
      setCurrentTab('consult');
    } else if (notif.type?.includes('PRESCRIPTION') || notif.type?.includes('RX')) {
      setCurrentTab('prescriptions');
    } else if (notif.type?.includes('EMERGENCY') || notif.type?.includes('SOS')) {
      setCurrentTab('emergency');
    }
  };

  return (
    <header className="navbar-wrapper">
      {/* Main Navbar */}
      <div className="navbar">
        <div className="brand-container" onClick={() => setCurrentTab('dashboard')}>
          <div className="brand-icon-box">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{lang === 'hi' ? 'जीवनसेतु' : 'JeevanSetu'}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary-700)', background: 'var(--primary-100)', padding: '0.1rem 0.45rem', borderRadius: '6px', fontWeight: 700 }}>
                WEB
              </span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isConnected ? '#22c55e' : '#ef4444',
                  boxShadow: isConnected ? '0 0 6px #22c55e' : 'none'
                }}
                title={isConnected ? 'Live WebSocket Connected' : 'Disconnected'}
              />
            </div>
            <div className="brand-subtitle">
              {lang === 'hi' ? 'ग्रामीण आपातकालीन ट्रायज व टेलीपरामर्श' : 'Rural Emergency & Telemedicine Bridge'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Security Baseline Status Badge */}
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="btn btn-secondary btn-sm"
            title="Inspect MVP Security Baseline & Privacy"
            style={{
              gap: '0.35rem',
              fontWeight: 700,
              color: '#047857',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0'
            }}
          >
            <ShieldCheck size={16} color="#059669" />
            <span style={{ fontSize: '0.78rem' }}>{lang === 'hi' ? 'सुरक्षा 🔒' : 'Security 🔒'}</span>
          </button>

          {/* Notification Bell Dropdown */}
          <NotificationBell onNavigate={handleNotificationNavigate} />

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="btn btn-secondary btn-sm"
            title="Toggle Language"
            style={{ gap: '0.4rem', fontWeight: 700 }}
          >
            <Globe size={15} color="var(--primary-700)" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* User Profile Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--slate-100)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)'
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary-600)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-900)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lang === 'hi' && user?.nameHi ? user.nameHi : user?.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>
                {role}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            title={t('navLogout')}
            style={{ padding: '0.4rem 0.5rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Security & Privacy Details Modal */}
      <SecurityInfoModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </header>
  );
};
