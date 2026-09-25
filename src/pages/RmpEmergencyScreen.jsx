import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { MapPin } from '../components/emergency/MapPin';
import { StatusBadge } from '../components/common/StatusBadge';
import { socket } from '../services/socket';
import {
  AlertOctagon,
  Phone,
  Navigation,
  CheckCircle,
  ArrowLeft,
  HeartPulse,
  ShieldAlert,
  User,
  Activity,
  Ambulance,
  ExternalLink
} from 'lucide-react';

export const RmpEmergencyScreen = ({ alert: initialAlert, onBack }) => {
  const { lang, t } = useLanguage();
  const { acceptEmergencyByRmp } = useEmergency();
  const [currentAlert, setCurrentAlert] = useState(initialAlert);

  useEffect(() => {
    setCurrentAlert(initialAlert);
  }, [initialAlert]);

  // Listen for real-time live location updates from patient device
  useEffect(() => {
    if (!currentAlert?.id) return;

    socket.emit('join-emergency', { emergencyId: currentAlert.id });

    const handleLocationUpdate = (data) => {
      if (data && data.emergencyId === currentAlert.id && data.latitude && data.longitude) {
        setCurrentAlert(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            coordinates: { lat: data.latitude, lng: data.longitude },
            accuracy: data.accuracy || prev.accuracy
          };
        });
      }
    };

    socket.on('sos:location-update', handleLocationUpdate);
    return () => {
      socket.off('sos:location-update', handleLocationUpdate);
    };
  }, [currentAlert?.id]);

  if (!currentAlert) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertOctagon size={48} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
        <p>No active emergency selected.</p>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  const isAccepted = currentAlert.status === 'ACCEPTED_BY_RMP' || currentAlert.status === 'ACCEPTED';

  // Construct Google Maps Turn-by-Turn Navigation URL
  const destinationLat = currentAlert.coordinates?.lat || currentAlert.latitude || null;
  const destinationLng = currentAlert.coordinates?.lng || currentAlert.longitude || null;
  const googleMapsNavUrl = (destinationLat && destinationLng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentAlert.location || 'Emergency Location')}`;

  const handleStartNavigation = () => {
    window.open(googleMapsNavUrl, '_blank', 'noopener,noreferrer');
  };

  const rmpCoords = (currentAlert.matchedRmp?.latitude && currentAlert.matchedRmp?.longitude)
    ? { lat: currentAlert.matchedRmp.latitude, lng: currentAlert.matchedRmp.longitude }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onBack} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            {lang === 'hi' ? 'वापस जाएं' : 'Back to Dashboard'}
          </button>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--emergency-700)', fontWeight: 800 }}>
              {lang === 'hi' ? '🚨 आपातकालीन रिस्पांडर कमांड' : '🚨 Emergency Responder Dispatch Screen'}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Alert ID: {currentAlert.id} • Triggered: {new Date(currentAlert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isAccepted ? (
            <button
              onClick={() => acceptEmergencyByRmp(currentAlert.id)}
              className="btn btn-emergency btn-lg"
              style={{ fontWeight: 800 }}
            >
              <CheckCircle size={20} />
              {lang === 'hi' ? 'स्वीकार करें व रवाना हों (Accept)' : 'Accept SOS & Start Navigation'}
            </button>
          ) : (
            <button
              onClick={handleStartNavigation}
              className="btn btn-primary btn-lg"
              style={{ fontWeight: 800, background: 'linear-gradient(135deg, #4285F4, #1a73e8)', border: 'none' }}
            >
              <ExternalLink size={20} />
              {lang === 'hi' ? 'गूगल मैप्स में टर्न-बाय-टर्न नेविगेशन' : 'Open Google Maps Navigation'}
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Map & Patient Details */}
      <div className="rmp-emergency-grid">
        {/* Left: Leaflet Live Map */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', fontWeight: 700 }}>
              {lang === 'hi' ? 'मरीज़ जीपीएस लोकेशन व रूट' : 'Live Patient Location & Navigation Route'}
            </h4>
            <StatusBadge urgency="RED" />
          </div>

          <MapPin
            patientName={currentAlert.patientName}
            patientCoords={currentAlert.coordinates}
            rmpCoords={rmpCoords}
            distance={currentAlert.matchedRmp?.distanceKm ? `${currentAlert.matchedRmp.distanceKm} km` : null}
            height="420px"
          />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <a
              href={`tel:${alert.patientPhone}`}
              className="btn btn-secondary btn-md"
              style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
            >
              <Phone size={18} color="var(--primary-700)" />
              {lang === 'hi' ? 'मरीज़ को कॉल करें' : 'Call Patient Directly'}
            </a>
            <button
              onClick={() => alert(lang === 'hi' ? '[सिम्युलेटेड डेमो] 108 आपातकालीन एम्बुलेंस सेवा को अलर्ट भेजा गया।' : '[Demo Simulation] 108 Emergency Ambulance Dispatch Alert Triggered.')}
              className="btn btn-outline btn-md"
              style={{ flex: 1, borderColor: 'var(--emergency-500)', color: 'var(--emergency-700)' }}
            >
              <Ambulance size={18} />
              {lang === 'hi' ? '[डेमो] 108 एम्बुलेंस बुलाएं' : 'Demo: Dispatch 108 Ambulance'}
            </button>
          </div>
        </div>

        {/* Right: Patient Vitals & Clinical Snapshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ border: '2px solid var(--emergency-300)', background: '#fffafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--emergency-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', fontWeight: 800 }}>
                  {alert.patientName}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                  {alert.age} Yrs, {alert.gender} • Blood Group: <b>B+</b>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--emergency-700)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Chief Complaint / Trigger
                </span>
                <p style={{ fontWeight: 700, color: 'var(--slate-900)', marginTop: '2px' }}>
                  {alert.chiefComplaint}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  Source: <b>{alert.triggerType}</b>
                </div>
              </div>

              {/* Vitals Telemetry */}
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Live Vitals Snapshot
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.4rem', textAlign: 'center' }}>
                  <div style={{ background: 'var(--slate-50)', padding: '0.4rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>BP</div>
                    <strong style={{ color: 'var(--emergency-700)' }}>{alert.vitals?.bp}</strong>
                  </div>
                  <div style={{ background: 'var(--slate-50)', padding: '0.4rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Pulse</div>
                    <strong style={{ color: 'var(--slate-900)' }}>{alert.vitals?.pulse}</strong>
                  </div>
                  <div style={{ background: 'var(--slate-50)', padding: '0.4rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>SpO2</div>
                    <strong style={{ color: 'var(--emergency-700)' }}>{alert.vitals?.spo2}</strong>
                  </div>
                </div>
              </div>

              {/* Known History & Allergies */}
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Known Chronic Conditions & Allergies
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                  <span className="badge badge-warning">Type 2 Diabetes</span>
                  <span className="badge badge-warning">Hypertension</span>
                  <span className="badge badge-emergency">Allergic to Penicillin</span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Emergency Family Contact
                </span>
                <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
                  +91 98765 00001 (Son - Amit Sharma)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
