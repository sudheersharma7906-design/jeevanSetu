// src/components/common/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  ShieldAlert,
  Video,
  FileText,
  Clock,
  Sparkles,
  CheckCheck,
  X
} from 'lucide-react';

export const NotificationBell = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    webPushPermission,
    requestWebPushPermission
  } = useSocket();

  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'EMERGENCY' | 'CONSULT' | 'RX'
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'EMERGENCY') return n.type?.includes('EMERGENCY') || n.type?.includes('SOS');
    if (activeFilter === 'CONSULT') return n.type?.includes('CONSULT') || n.type?.includes('DOCTOR');
    if (activeFilter === 'RX') return n.type?.includes('PRESCRIPTION') || n.type?.includes('RX');
    return true;
  });

  const getNotifIcon = (type) => {
    if (type?.includes('EMERGENCY') || type?.includes('SOS')) {
      return (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--emergency-600)', padding: '0.4rem', borderRadius: '8px' }}>
          <ShieldAlert size={18} />
        </div>
      );
    }
    if (type?.includes('CONSULT') || type?.includes('DOCTOR')) {
      return (
        <div style={{ background: 'rgba(13, 148, 136, 0.15)', color: 'var(--primary-600)', padding: '0.4rem', borderRadius: '8px' }}>
          <Video size={18} />
        </div>
      );
    }
    if (type?.includes('PRESCRIPTION') || type?.includes('RX')) {
      return (
        <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info-500)', padding: '0.4rem', borderRadius: '8px' }}>
          <FileText size={18} />
        </div>
      );
    }
    return (
      <div style={{ background: 'var(--slate-200)', color: 'var(--slate-700)', padding: '0.4rem', borderRadius: '8px' }}>
        <Bell size={18} />
      </div>
    );
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'SMS':
      case 'SMS_AND_INAPP':
        return <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>📱 SMS Sent</span>;
      case 'WHATSAPP':
        return <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>💬 WhatsApp</span>;
      case 'MULTI_CHANNEL':
        return <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>📡 Multi-Channel</span>;
      case 'SOCKET_PUSH':
        return <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>⚡ Live Push</span>;
      default:
        return <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>🔔 Web Push</span>;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm"
        style={{
          position: 'relative',
          padding: '0.45rem',
          borderRadius: 'var(--radius-md)',
          background: isOpen ? 'var(--slate-200)' : 'transparent'
        }}
        title="Notifications & Live Alerts"
      >
        <Bell size={18} color="var(--slate-700)" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: 'var(--emergency-600)',
              color: 'white',
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 800,
              minWidth: '17px',
              height: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              boxShadow: '0 0 0 2px white',
              animation: 'pulse 1.8s infinite'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '380px',
            maxWidth: '90vw',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--slate-200)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'scaleUp 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--slate-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--slate-50)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                {lang === 'hi' ? 'सूचना केंद्र' : 'Notification Center'}
              </span>
              {unreadCount > 0 && (
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  {unreadCount} {lang === 'hi' ? 'नई' : 'New'}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', color: 'var(--primary-700)' }}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} style={{ marginRight: '3px' }} />
                  {lang === 'hi' ? 'सभी पढ़ें' : 'Read All'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.2rem', color: 'var(--slate-400)' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Web Push Opt-in Banner if not granted */}
          {webPushPermission !== 'granted' && (
            <div
              style={{
                padding: '0.65rem 1rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderBottom: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#166534' }}>
                <Sparkles size={14} color="#16a34a" />
                <span>{lang === 'hi' ? 'ब्राउज़र पुश नोटिफिकेशन चालू करें' : 'Enable Live Browser Web Push'}</span>
              </div>
              <button
                onClick={requestWebPushPermission}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', fontWeight: 700 }}
              >
                {lang === 'hi' ? 'अनुमति दें' : 'Enable'}
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div
            style={{
              display: 'flex',
              padding: '0.4rem 0.75rem',
              gap: '0.35rem',
              borderBottom: '1px solid var(--slate-100)',
              background: 'white',
              overflowX: 'auto'
            }}
          >
            {[
              { id: 'ALL', label: lang === 'hi' ? 'सभी' : 'All' },
              { id: 'EMERGENCY', label: lang === 'hi' ? '🚨 आपातकाल' : '🚨 SOS' },
              { id: 'CONSULT', label: lang === 'hi' ? '🩺 परामर्श' : '🩺 Consults' },
              { id: 'RX', label: lang === 'hi' ? '💊 पर्ची' : '💊 Prescriptions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: activeFilter === tab.id ? 'var(--primary-600)' : 'var(--slate-200)',
                  background: activeFilter === tab.id ? 'var(--primary-50)' : 'transparent',
                  color: activeFilter === tab.id ? 'var(--primary-800)' : 'var(--slate-600)',
                  fontWeight: activeFilter === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                <Bell size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.85rem' }}>
                  {lang === 'hi' ? 'कोई नई सूचना नहीं है।' : 'No notifications in this filter.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markNotificationRead(notif.id);
                    if (onNavigate) onNavigate(notif);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--slate-100)',
                    display: 'flex',
                    gap: '0.75rem',
                    background: notif.read ? 'white' : 'rgba(240, 253, 250, 0.6)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--slate-50)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = notif.read ? 'white' : 'rgba(240, 253, 250, 0.6)'; }}
                >
                  {/* Unread Indicator */}
                  {!notif.read && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '5px',
                        height: '24px',
                        background: 'var(--primary-600)',
                        borderRadius: '3px'
                      }}
                    />
                  )}

                  {getNotifIcon(notif.type)}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontWeight: notif.read ? 600 : 700, fontSize: '0.82rem', color: 'var(--slate-900)', lineHeight: 1.3 }}>
                        {notif.title}
                      </span>
                      {getChannelBadge(notif.channel)}
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.68rem', color: 'var(--slate-400)' }}>
                      <Clock size={11} />
                      <span>
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                      {notif.metadata?.emergencyId && (
                        <span style={{ color: 'var(--emergency-600)', fontWeight: 700 }}>
                          • SOS Ref: {notif.metadata.emergencyId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--slate-50)',
              borderTop: '1px solid var(--slate-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.7rem',
              color: 'var(--slate-500)'
            }}
          >
            <span>⚡ JeevanSetu Real-Time & Web Push</span>
            <span>{notifications.length} alerts</span>
          </div>
        </div>
      )}
    </div>
  );
};
