// src/components/common/SmsSimulatorModal.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../config/api';
import {
  Smartphone,
  MessageSquare,
  Send,
  CheckCheck,
  Radio,
  RefreshCw,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

export const SmsSimulatorModal = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('SMS'); // 'SMS' | 'WHATSAPP' | 'LEDGER'
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Test custom dispatch form
  const [targetPhone, setTargetPhone] = useState('+91 98112 34567');
  const [recipientName, setRecipientName] = useState('Dr. Anand Verma (RMP)');
  const [dispatchType, setDispatchType] = useState('EMERGENCY_SOS');
  const [customMsg, setCustomMsg] = useState(
    '🚨 [JEEVANSETU EMERGENCY SOS] Patient: Rameshwar Patil. Severe chest pain at Rampur Kalan. Tap to respond: http://localhost:5173/?sos=sos-101'
  );

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/notifications/carrier/logs?limit=40'));
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn('Could not fetch carrier logs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const handleSendTest = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const endpoint = activeTab === 'WHATSAPP' ? '/api/notifications/whatsapp' : '/api/notifications/sms';
      const res = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetPhone,
          message: customMsg,
          recipientName,
          type: dispatchType
        })
      });
      if (res.ok) {
        await fetchLogs();
      }
    } catch (err) {
      console.warn('Failed to send test message:', err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handlePresetChange = (type) => {
    setDispatchType(type);
    if (type === 'EMERGENCY_SOS') {
      setCustomMsg('🚨 [JIVANSETU EMERGENCY SOS] Critical Distress: Rampur Kalan. Patient: Rameshwar Patil (54M). Respond: http://localhost:5173/?sos=sos-101');
    } else if (type === 'CONSULT_REMINDER') {
      setCustomMsg('🩺 [JIVANSETU TELECONSULT] Reminder: Your video consultation with Dr. Priya Sharma starts in 15 mins. Join: http://localhost:5173/?consult=con-101');
    } else if (type === 'PRESCRIPTION_READY') {
      setCustomMsg('💊 [JIVANSETU DIGITAL RX] Your prescription from Dr. Priya Sharma is ready with 3 medicines. View: http://localhost:5173/?rx=rx-101');
    }
  };

  if (!isOpen) return null;

  const smsLogs = logs.filter(l => l.channel === 'SMS');
  const waLogs = logs.filter(l => l.channel === 'WHATSAPP');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {lang === 'hi' ? '📱 टेलीकॉम व एसएमएस/व्हाट्सएप करियर कंसोल' : '📱 Telecom Carrier SMS & WhatsApp Console'}
              </h2>
              <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                Twilio SMS Gateway • WhatsApp Business API • Offline RMP Fallback Dispatcher
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchLogs}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              title="Refresh Logs"
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{ color: 'white', padding: '0.4rem' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--slate-200)',
            background: 'var(--slate-50)',
            padding: '0 1.5rem',
            gap: '1rem'
          }}
        >
          <button
            onClick={() => setActiveTab('SMS')}
            style={{
              padding: '0.85rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderBottom: activeTab === 'SMS' ? '3px solid var(--primary-600)' : '3px solid transparent',
              color: activeTab === 'SMS' ? 'var(--primary-700)' : 'var(--slate-600)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Smartphone size={16} />
            <span>Twilio SMS ({smsLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('WHATSAPP')}
            style={{
              padding: '0.85rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderBottom: activeTab === 'WHATSAPP' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'WHATSAPP' ? '#16a34a' : 'var(--slate-600)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <MessageSquare size={16} />
            <span>WhatsApp Business API ({waLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            style={{
              padding: '0.85rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderBottom: activeTab === 'LEDGER' ? '3px solid var(--slate-900)' : '3px solid transparent',
              color: activeTab === 'LEDGER' ? 'var(--slate-900)' : 'var(--slate-600)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Layers size={16} />
            <span>Full Transmission Ledger</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Phone Device Simulation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                {activeTab === 'WHATSAPP' ? '💬 WhatsApp Live Conversation Feed' : '📱 GSM Carrier SMS Inbox (Offline RMP)'}
              </span>
              <span className="badge badge-success">
                <Radio size={10} /> Carrier Simulated Live
              </span>
            </div>

            {/* Simulated Phone Shell */}
            <div
              style={{
                background: activeTab === 'WHATSAPP' ? '#efeae2' : '#f8fafc',
                borderRadius: '24px',
                border: '8px solid #334155',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.12)',
                padding: '1rem',
                minHeight: '380px',
                maxHeight: '440px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundImage: activeTab === 'WHATSAPP' ? 'radial-gradient(#d1d7db 1px, transparent 1px)' : 'none',
                backgroundSize: '16px 16px'
              }}
            >
              {/* Phone Status Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: '#64748b',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                <span>Jio 5G / BSNL Rural</span>
                <span>Receiver: Dr. Anand Verma</span>
                <span>100% 🔋</span>
              </div>

              {(activeTab === 'WHATSAPP' ? waLogs : smsLogs).length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--slate-400)' }}>
                  <MessageSquare size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.85rem' }}>No messages transmitted on this channel yet.</p>
                </div>
              ) : (
                (activeTab === 'WHATSAPP' ? waLogs : smsLogs).map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: msg.type === 'EMERGENCY_SOS' ? '#fef2f2' : activeTab === 'WHATSAPP' ? '#d9fdd3' : '#ffffff',
                      border: msg.type === 'EMERGENCY_SOS' ? '1.5px solid #f87171' : '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: msg.type === 'EMERGENCY_SOS' ? 'var(--emergency-700)' : 'var(--slate-900)' }}>
                        {msg.type === 'EMERGENCY_SOS' ? '🚨 EMERGENCY SOS DISPATCH' : msg.recipientName}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-800)', whiteSpace: 'pre-line', lineHeight: 1.4, margin: 0 }}>
                      {msg.body}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                      <span>SID: {msg.sid}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#16a34a', fontWeight: 700 }}>
                        <CheckCheck size={13} /> {msg.status} ({msg.latencyMs}ms)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Interactive Dispatch Simulator */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary-600)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                Test Multi-Channel Dispatch
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', margin: 0 }}>
              Trigger real-time simulated carrier SMS / WhatsApp dispatches to test offline RMP fallback delivery.
            </p>

            {/* Template Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'EMERGENCY_SOS', label: '🚨 SOS Emergency' },
                { id: 'CONSULT_REMINDER', label: '🩺 Teleconsult Reminder' },
                { id: 'PRESCRIPTION_READY', label: '💊 Prescription Ready' }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetChange(preset.id)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: dispatchType === preset.id ? 'var(--primary-600)' : 'var(--slate-300)',
                    background: dispatchType === preset.id ? 'var(--primary-100)' : 'white',
                    color: dispatchType === preset.id ? 'var(--primary-800)' : 'var(--slate-700)',
                    fontWeight: dispatchType === preset.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendTest} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)' }}>Recipient Phone Number</label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)' }}>Recipient Name / Role</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)' }}>Message Content</label>
                <textarea
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="input"
                  rows={3}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className={`btn ${activeTab === 'WHATSAPP' ? 'btn-success' : 'btn-primary'} btn-md`}
                style={{ fontWeight: 700, gap: '0.5rem', justifyContent: 'center' }}
              >
                <Send size={16} />
                <span>{isSending ? 'Transmitting Carrier Signal...' : `Send ${activeTab} Dispatch`}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: 'var(--slate-100)',
            borderTop: '1px solid var(--slate-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--slate-600)'
          }}
        >
          <span>📡 Carrier Network: Simulated Telco Gateway (Jio / Airtel / BSNL Tier-1)</span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
