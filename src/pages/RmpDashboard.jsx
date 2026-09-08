// src/pages/RmpDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useMedicalData } from '../context/MedicalDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { MapPin } from '../components/emergency/MapPin';
import { TriageForm } from '../components/triage/TriageForm';
import { TriageResult } from '../components/triage/TriageResult';
import { ConsultRoom } from '../components/consult/ConsultRoom';
import { UpdatePatientDiagnosisModal } from '../components/consult/UpdatePatientDiagnosisModal';
import { Modal } from '../components/common/Modal';
import {
  Activity,
  AlertTriangle,
  UserPlus,
  Navigation,
  Phone,
  ArrowUpRight,
  Video,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HeartPulse,
  FileEdit
} from 'lucide-react';

export const RmpDashboard = ({ onOpenEmergencyScreen }) => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { emergencyList, acceptEmergencyByRmp } = useEmergency();
  const { doctorQueue, addTriageCase, getPatientProfile } = useMedicalData();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'new_triage' | 'consult'
  const [selectedPatientForConsult, setSelectedPatientForConsult] = useState(null);
  const [diagnosisPatientCase, setDiagnosisPatientCase] = useState(null);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [fieldTriageResult, setFieldTriageResult] = useState(null);

  const activeEmergencies = emergencyList.filter(
    (e) => e.status === 'DISPATCHED' || e.status === 'ACCEPTED_BY_RMP'
  );

  const handleFieldTriageComplete = (result) => {
    setFieldTriageResult(result);
    addTriageCase({
      ...result,
      patientName: 'Kishan Lal (Walk-in)',
      age: 48,
      notes: 'Logged directly in field by RMP Dr. Anand Deshmukh.'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. RMP Header Profile */}
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
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
          >
            <Activity size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)' }}>
                {lang === 'hi' && user?.nameHi ? user.nameHi : user?.name}
              </h2>
              <span className="badge badge-primary">{user?.regNumber || user?.registrationNo || 'MH-RMP-2018'}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              {lang === 'hi' && user?.centerNameHi ? user.centerNameHi : user?.centerName || 'Wada Rural Health Post #4'} | <b>Status: On Field Duty</b>
            </p>
          </div>
        </div>

        {/* Action Button: New Field Triage */}
        <button
          onClick={() => setShowTriageModal(true)}
          className="btn btn-primary btn-md"
          style={{ fontWeight: 700, gap: '0.5rem' }}
        >
          <UserPlus size={18} />
          {lang === 'hi' ? '+ नया मरीज ट्रायज दर्ज करें' : '+ Log Field Patient Triage'}
        </button>
      </div>

      {/* 2. Priority Active Emergency Alerts Section */}
      {activeEmergencies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--emergency-600)" className="pulse-alert" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--emergency-700)', fontWeight: 800 }}>
              {lang === 'hi' ? '🚨 सक्रिय आपातकालीन अलर्ट (तत्काल ध्यान दें)' : '🚨 Active Emergency SOS Dispatches (Action Required)'}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeEmergencies.map((alert) => (
              <div
                key={alert.id}
                className="card"
                style={{
                  border: '2px solid var(--emergency-500)',
                  background: '#fff5f5',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <StatusBadge urgency="RED" label="CRITICAL SOS" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Triggered {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now'} via {alert.triggerType}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', color: 'var(--slate-900)', fontWeight: 800 }}>
                      {alert.patientName} ({alert.age} Yrs, {alert.gender})
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--emergency-800)', fontWeight: 600 }}>
                      <b>Complaint:</b> {alert.chiefComplaint}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onOpenEmergencyScreen ? onOpenEmergencyScreen(alert) : acceptEmergencyByRmp(alert.id)}
                      className="btn btn-emergency btn-md"
                      style={{ fontWeight: 800, gap: '0.4rem' }}
                    >
                      <Navigation size={16} />
                      {alert.status === 'ACCEPTED_BY_RMP'
                        ? (lang === 'hi' ? 'नेविगेशन व रिस्पांडर कमांड' : 'Open Responder Screen')
                        : (lang === 'hi' ? 'आपातकाल स्वीकारें (Accept)' : 'Accept SOS Dispatch')}
                    </button>
                  </div>
                </div>

                <MapPin
                  patientName={alert.patientName}
                  distance={alert.distanceKm ? `${alert.distanceKm} km away` : '1.8 km away'}
                  eta="Est. Arrival: 5 mins"
                  height="220px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Community Patients Queue & Illness Reports */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', fontWeight: 800 }}>
              {lang === 'hi' ? 'ग्रामीण मरीज कतार एवं रोग रिपोर्ट' : 'Village Patient Cases & Reported Diseases'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
              {lang === 'hi' ? 'मरीजों द्वारा दर्ज की गई बीमारियां, लक्षण, पुरानी हिस्ट्री व वाइटल्स' : 'Patients reporting illnesses with attached chronic health history'}
            </p>
          </div>
        </div>

        {/* Patient Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--slate-100)', textAlign: 'left', borderBottom: '1.5px solid var(--slate-300)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Patient</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Urgency</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Reported Illness & Chronic History</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Vitals</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctorQueue.map((item) => {
                const patientProfile = getPatientProfile(item.patientId || item.phone) || {};
                const chronicList = patientProfile.chronicConditions || item.regularProblems || item.chronicConditions || [];
                const isCompleted = item.status === 'COMPLETED_DIAGNOSED';

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--slate-200)', background: isCompleted ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      <div>{item.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 400 }}>
                        {item.age} Yrs • {item.reportedAt || 'Just now'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge urgency={item.urgency} score={item.score} />
                      {isCompleted && (
                        <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '3px' }}>
                          ✓ Diagnosed
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '320px' }}>
                      <div style={{ fontSize: '0.88rem', color: 'var(--slate-900)', fontWeight: 700 }}>
                        {item.diseaseName ? `${item.diseaseName}: ` : ''}
                        <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                          {lang === 'hi' && item.reasonHi ? item.reasonHi : item.reason}
                        </span>
                      </div>

                      {/* Attached Chronic Background */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)' }}>Chronic History:</span>
                        {chronicList.length > 0 ? (
                          chronicList.map((cond, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.7rem',
                                fontWeight: 700
                              }}
                            >
                              {cond}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>None registered</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                      <div><b>BP:</b> {item.vitals?.bp || '130/84'}</div>
                      <div><b>SpO2:</b> {item.vitals?.spo2 || '98%'} | <b>HR:</b> {item.vitals?.pulse || '78 bpm'}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setDiagnosisPatientCase(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.3rem', fontSize: '0.78rem', border: '1px solid var(--primary-300)' }}
                        >
                          <FileEdit size={14} color="var(--primary-700)" />
                          {lang === 'hi' ? 'निदान व प्रोफाइल' : 'Update Diagnosis'}
                        </button>
                        <button
                          onClick={() => setSelectedPatientForConsult(item)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '0.3rem', fontSize: '0.78rem' }}
                        >
                          <Video size={14} />
                          {lang === 'hi' ? 'टेलीपरामर्श' : 'Teleconsult'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Triage Modal */}
      <Modal
        isOpen={showTriageModal}
        onClose={() => {
          setShowTriageModal(false);
          setFieldTriageResult(null);
        }}
        title={lang === 'hi' ? 'नया मरीज लक्षण ट्रायज (आरएमपी पोर्टल)' : 'Field Patient Triage Assessment'}
        maxWidth="680px"
      >
        {!fieldTriageResult ? (
          <TriageForm onComplete={handleFieldTriageComplete} />
        ) : (
          <TriageResult
            result={fieldTriageResult}
            onStartConsult={() => {
              setShowTriageModal(false);
              setSelectedPatientForConsult({ patientName: 'Kishan Lal', age: 48 });
            }}
            onReset={() => setFieldTriageResult(null)}
          />
        )}
      </Modal>

      {/* Update Patient Diagnosis & Profile Modal */}
      {diagnosisPatientCase && (
        <UpdatePatientDiagnosisModal
          isOpen={true}
          onClose={() => setDiagnosisPatientCase(null)}
          patientCase={diagnosisPatientCase}
        />
      )}

      {/* In-Call Teleconsult Modal */}
      {selectedPatientForConsult && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPatientForConsult(null)}
          title={`Teleconsultation: ${selectedPatientForConsult.patientName}`}
          maxWidth="980px"
        >
          <ConsultRoom
            patient={selectedPatientForConsult}
            onEndCall={() => setSelectedPatientForConsult(null)}
          />
        </Modal>
      )}
    </div>
  );
};
