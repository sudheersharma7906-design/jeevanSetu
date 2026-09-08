// src/App.jsx
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { MedicalDataProvider } from './context/MedicalDataContext';
import { Navbar } from './components/common/Navbar';
import { SOSButton } from './components/emergency/SOSButton';
import { EmergencyAlertBanner } from './components/common/EmergencyAlertBanner';
import { LoginScreen } from './pages/LoginScreen';
import { PatientDashboard } from './pages/PatientDashboard';
import { RmpDashboard } from './pages/RmpDashboard';
import { RmpEmergencyScreen } from './pages/RmpEmergencyScreen';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { soundManager } from './utils/soundEffects';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, dismissToast } = useSocket();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        maxWidth: '380px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            background: toast.type === 'EMERGENCY' ? '#fff1f2' : toast.type === 'SUCCESS' ? '#f0fdf4' : '#ffffff',
            border: `1.5px solid ${toast.type === 'EMERGENCY' ? '#f87171' : toast.type === 'SUCCESS' ? '#86efac' : '#cbd5e1'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1rem',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            animation: 'slideInRight 0.2s ease-out'
          }}
        >
          {toast.type === 'EMERGENCY' && <AlertTriangle size={20} color="var(--emergency-600)" style={{ flexShrink: 0, marginTop: '2px' }} />}
          {toast.type === 'SUCCESS' && <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />}
          {toast.type === 'INFO' && <Info size={20} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--slate-900)' }}>
              {toast.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.15rem', lineHeight: 1.3 }}>
              {toast.message}
            </div>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--slate-400)',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

const MainAppContent = () => {
  const { isAuthenticated, role } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedEmergencyAlert, setSelectedEmergencyAlert] = useState(null);

  // Initialize sound synthesizer on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.init();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="app-container">
      {/* Sticky Global Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Floating Real-time Emergency Banner / Modal for RMP & Doctor */}
      <EmergencyAlertBanner
        onAcceptNavigate={(alert) => {
          setSelectedEmergencyAlert(alert);
        }}
      />

      {/* Real-time Toast Alerts Container */}
      <ToastContainer />

      {/* Main Page Area */}
      <main className="main-content">
        {role === 'patient' && <PatientDashboard />}

        {role === 'rmp' && (
          selectedEmergencyAlert ? (
            <RmpEmergencyScreen
              alert={selectedEmergencyAlert}
              onBack={() => setSelectedEmergencyAlert(null)}
            />
          ) : (
            <RmpDashboard
              onOpenEmergencyScreen={(alert) => setSelectedEmergencyAlert(alert)}
            />
          )
        )}

        {role === 'doctor' && <DoctorDashboard />}

        {role === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Floating SOS Button */}
      <div className="floating-sos-container">
        <SOSButton isFloating={true} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <EmergencyProvider>
            <MedicalDataProvider>
              <MainAppContent />
            </MedicalDataProvider>
          </EmergencyProvider>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
