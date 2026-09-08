// src/pages/PatientDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useMedicalData } from '../context/MedicalDataContext';
import { SOSButton } from '../components/emergency/SOSButton';
import { VoiceSOSListener } from '../components/emergency/VoiceSOSListener';
import { MapPin } from '../components/emergency/MapPin';
import { TriageForm } from '../components/triage/TriageForm';
import { TriageResult } from '../components/triage/TriageResult';
import { ConsultRoom } from '../components/consult/ConsultRoom';
import { PrescriptionView } from '../components/consult/PrescriptionView';
import { RecordTimeline } from '../components/records/RecordTimeline';
import { StatusBadge } from '../components/common/StatusBadge';
import { PatientLiveSosTracker } from '../components/emergency/PatientLiveSosTracker';
import { PatientProfileModal } from '../components/patient/PatientProfileModal';
import { ReportDiseaseModal } from '../components/patient/ReportDiseaseModal';
import {
  Activity,
  HeartPulse,
  Video,
  FileText,
  Clock,
  ShieldCheck,
  PhoneCall,
  User,
  PlusCircle,
  Sparkles,
  MapPin as PinIcon,
  AlertTriangle,
  Edit3,
  Send,
  Pill,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { isSosActive, activeAlert, resolveSos } = useEmergency();
  const { prescriptions, addTriageCase, getPatientProfile } = useMedicalData();

  const isHindi = lang === 'hi';
  const profile = getPatientProfile(user?.id || user?.phone) || {};

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'profile' | 'triage' | 'records' | 'prescriptions' | 'consult'
  const [triageResult, setTriageResult] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(prescriptions[0] || null);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportDiseaseModal, setShowReportDiseaseModal] = useState(false);

  const handleTriageCompleted = (result) => {
    setTriageResult(result);
    addTriageCase({
      ...result,
      patientId: profile.id || user?.id,
      patientName: profile.name || user?.name,
      age: profile.age || user?.age
    });
  };

  const handleStartConsultFromTriage = () => {
    setActiveTab('consult');
  };

  const handleCaseReported = (createdCase) => {
    // Navigate to records or consult
    setActiveTab('records');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Patient Profile Header Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
          border: '1.5px solid var(--primary-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '62px',
              height: '62px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.6rem',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
            }}
          >
            {profile.name?.charAt(0) || user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.45rem', color: 'var(--slate-900)', fontWeight: 800 }}>
                {profile.name || (isHindi && user?.nameHi ? user.nameHi : user?.name)}
              </h2>
              <span className="badge badge-primary">
                ABHA: {profile.abhaId || user?.abhaId || 'ABHA-9821-4451'}
              </span>
              <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                Blood: <b>{profile.bloodGroup || user?.bloodGroup || 'B+'}</b>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px', flexWrap: 'wrap' }}>
              <span><b>{profile.age || user?.age || 54} Yrs</b>, {profile.gender || user?.gender || 'Male'}</span>
              <span>•</span>
              <span>Phone: <b>+91 {profile.phone || user?.phone || '9876543210'}</b></span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <PinIcon size={14} color="var(--primary-700)" />
                {profile.village || (isHindi && user?.villageHi ? user.villageHi : user?.village) || 'Wada Rural, Palghar'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Profile & Disease Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowReportDiseaseModal(true)}
            className="btn btn-primary btn-md"
            style={{
              fontWeight: 800,
              gap: '0.45rem',
              background: 'linear-gradient(135deg, var(--emergency-600), var(--emergency-700))',
              border: 'none',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
            }}
          >
            <HeartPulse size={18} />
            {isHindi ? '+ नया रोग / लक्षण दर्ज करें' : '+ Report Illness / Symptoms'}
          </button>

          <button
            onClick={() => setShowProfileModal(true)}
            className="btn btn-secondary btn-md"
            style={{ fontWeight: 700, gap: '0.45rem' }}
          >
            <Edit3 size={16} color="var(--primary-700)" />
            {isHindi ? 'स्वास्थ्य प्रोफाइल देखें / बदलें' : 'Manage Health Profile'}
          </button>
        </div>
      </div>

      {/* 2. Active Live Emergency Tracker (when SOS is active) */}
      {isSosActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <PatientLiveSosTracker alert={activeAlert} onResolve={() => resolveSos(activeAlert?.id)} />
          <div className="card" style={{ padding: '1rem', border: '1px solid var(--emergency-200)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emergency-700)', marginBottom: '0.75rem' }}>
              📍 {isHindi ? 'लाइव जीपीएस टेलीमेट्री व रिस्पांडर रूट' : 'Live GPS Telemetry & Responder Route'}
            </h4>
            <MapPin
              patientName={profile.name || user?.name}
              distance="2.4 km away"
              eta="Est. Arrival: 6 mins"
              height="260px"
            />
          </div>
        </div>
      )}

      {/* 3. Emergency SOS Bar & Voice SOS Listener */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SOSButton isFloating={false} />
        <VoiceSOSListener />
      </div>

      {/* 4. Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1.5px solid var(--slate-200)',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'overview', label: t('navDashboard'), icon: Activity },
          { id: 'profile', label: t('navProfile'), icon: User },
          { id: 'triage', label: t('navSymptomCheck'), icon: HeartPulse },
          { id: 'consult', label: t('navConsults'), icon: Video },
          { id: 'prescriptions', label: t('navPrescriptions'), icon: FileText },
          { id: 'records', label: t('navRecords'), icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.5rem 1.15rem',
                fontWeight: isActive ? 700 : 500
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 5. Tab Content Views */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Health Summary & Chronic Disease Card */}
          <div
            className="card"
            style={{
              borderLeft: '5px solid var(--primary-600)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartPulse size={20} color="var(--primary-700)" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {isHindi ? 'आपकी नियमित / पुरानी बीमारियां (Registered Chronic Profile)' : 'Your Registered Health Profile & Chronic Conditions'}
                </h4>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', gap: '0.3rem' }}
              >
                <Edit3 size={14} />
                {isHindi ? 'विवरण बदलें' : 'Update Profile'}
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.chronicConditions && profile.chronicConditions.length > 0 ? (
                profile.chronicConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    🩺 {cond}
                  </span>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                  {isHindi ? 'कोई पुरानी बीमारी दर्ज नहीं है।' : 'No regular health conditions registered yet.'}
                </p>
              )}
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', borderTop: '1px solid var(--slate-200)', paddingTop: '0.65rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span>
                <b>{isHindi ? 'एलर्जी:' : 'Allergies:'}</b>{' '}
                {profile.allergies?.length > 0 ? profile.allergies.join(', ') : 'None registered'}
              </span>
              <span>
                <b>{isHindi ? 'नियमित दवाएं:' : 'Daily Medicines:'}</b>{' '}
                {Array.isArray(profile.currentMedications) ? profile.currentMedications.join(', ') : (profile.currentMedications || 'None')}
              </span>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid-3">
            {/* Action 1: Report Illness */}
            <div
              className="card card-interactive"
              onClick={() => setShowReportDiseaseModal(true)}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1.5px solid var(--primary-200)' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--emergency-100)', color: 'var(--emergency-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartPulse size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', fontWeight: 700 }}>
                  {isHindi ? 'रोग व लक्षण दर्ज करें' : 'Report Illness / Symptoms'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  {isHindi ? 'डॉक्टर एवं आरएमपी को अपनी समस्या भेजें ताकि वे रिपोर्ट जांच सकें।' : 'Send your disease symptoms directly to doctors with your attached history.'}
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emergency-700)', marginTop: 'auto' }}>
                {isHindi ? 'रोग विवरण भेजें →' : 'Report Illness to Doctor →'}
              </span>
            </div>

            {/* Action 2: Teleconsult */}
            <div
              className="card card-interactive"
              onClick={() => setActiveTab('consult')}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', fontWeight: 700 }}>
                  {t('navConsults')}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  {isHindi ? 'विशेषज्ञ डॉक्टर से लाइव वीडियो एवं ऑडियो परामर्श।' : 'Join encrypted video room with district specialist.'}
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: 'auto' }}>
                {isHindi ? 'कक्ष में प्रवेश करें →' : 'Enter Teleconsult Room →'}
              </span>
            </div>

            {/* Action 3: Prescriptions */}
            <div
              className="card card-interactive"
              onClick={() => setActiveTab('prescriptions')}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', fontWeight: 700 }}>
                  {t('navPrescriptions')}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  {isHindi ? 'डिजिटल दवा पर्चा देखें व प्रिंट करें।' : 'View active medications, dosage, and print official Rx.'}
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: 'auto' }}>
                {isHindi ? 'पर्चा देखें →' : 'View Digital Rx →'}
              </span>
            </div>
          </div>

          {/* Recent Records Snippet */}
          <RecordTimeline />
        </div>
      )}

      {/* TAB 2: MY HEALTH PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {isHindi ? 'मेरी स्वास्थ्य प्रोफाइल व व्यक्तिगत विवरण' : 'My Personal Health Profile'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                {isHindi ? 'आपके सभी बुनियादी विवरण, पुरानी बीमारियां व दवाएं' : 'Your registered baseline details, chronic conditions, and emergency contact'}
              </p>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="btn btn-primary btn-md" style={{ fontWeight: 800, gap: '0.45rem' }}>
              <Edit3 size={16} />
              {isHindi ? 'प्रोफाइल संपादित करें (Edit)' : 'Edit Profile Details'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Identity Box */}
            <div className="card">
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={18} color="var(--primary-700)" />
                {isHindi ? 'व्यक्तिगत पहचान (Personal Info)' : 'Personal Identity'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Name:</span>
                  <strong>{profile.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Age & Gender:</span>
                  <strong>{profile.age} Yrs, {profile.gender}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Blood Group:</span>
                  <strong style={{ color: 'var(--emergency-700)' }}>{profile.bloodGroup}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Mobile Phone:</span>
                  <strong>+91 {profile.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>ABHA ID:</span>
                  <strong>{profile.abhaId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Village / Address:</span>
                  <span style={{ textAlign: 'right', fontWeight: 600 }}>{profile.address || profile.village}</span>
                </div>
              </div>
            </div>

            {/* Chronic Conditions Box */}
            <div className="card">
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HeartPulse size={18} color="var(--emergency-600)" />
                {isHindi ? 'नियमित / पुरानी बीमारियां (Chronic Conditions)' : 'Regular Problems & Chronic Illness'}
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {profile.chronicConditions && profile.chronicConditions.length > 0 ? (
                  profile.chronicConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    >
                      🩺 {cond}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>No chronic illness registered.</span>
                )}
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                {isHindi ? 'एलर्जी व नियमित दवाएं:' : 'Allergies & Current Medications:'}
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <span style={{ color: 'var(--slate-500)' }}>Allergies: </span>
                  <b>{profile.allergies?.length > 0 ? profile.allergies.join(', ') : 'None'}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--slate-500)' }}>Current Daily Medicines: </span>
                  <b>{Array.isArray(profile.currentMedications) ? profile.currentMedications.join(', ') : (profile.currentMedications || 'None')}</b>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-200)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--slate-500)', display: 'block', marginBottom: '3px' }}>Emergency Contact:</span>
                <strong>{profile.emergencyContact?.name}</strong> ({profile.emergencyContact?.relation}) • <b>+91 {profile.emergencyContact?.phone}</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIAGE */}
      {activeTab === 'triage' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--slate-900)', fontWeight: 800 }}>
                {t('triageTitle')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                {t('triageSubtitle')}
              </p>
            </div>
            <button onClick={() => setShowReportDiseaseModal(true)} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
              {isHindi ? '+ त्वरित बीमारी रिपोर्ट भेजें' : '+ Fast Report Disease'}
            </button>
          </div>

          {!triageResult ? (
            <TriageForm onComplete={handleTriageCompleted} />
          ) : (
            <TriageResult
              result={triageResult}
              onStartConsult={handleStartConsultFromTriage}
              onReset={() => setTriageResult(null)}
            />
          )}
        </div>
      )}

      {/* TAB 4: CONSULT */}
      {activeTab === 'consult' && (
        <ConsultRoom
          patient={{ patientName: profile.name || user?.name, age: profile.age || user?.age, patientId: profile.id || user?.id }}
          onEndCall={() => setActiveTab('overview')}
          onOpenPrescription={(rx) => {
            setSelectedPrescription(rx);
            setActiveTab('prescriptions');
          }}
        />
      )}

      {/* TAB 5: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <PrescriptionView prescription={selectedPrescription || prescriptions[0]} />
      )}

      {/* TAB 6: RECORDS */}
      {activeTab === 'records' && (
        <div className="card">
          <RecordTimeline />
        </div>
      )}

      {/* Interactive Modals */}
      <PatientProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentPatient={user}
      />

      <ReportDiseaseModal
        isOpen={showReportDiseaseModal}
        onClose={() => setShowReportDiseaseModal(false)}
        currentPatient={user}
        onCaseSubmitted={handleCaseReported}
      />
    </div>
  );
};
