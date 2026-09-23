// src/pages/DoctorDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useMedicalData } from '../context/MedicalDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConsultRoom } from '../components/consult/ConsultRoom';
import { PrescriptionView } from '../components/consult/PrescriptionView';
import { UpdatePatientDiagnosisModal } from '../components/consult/UpdatePatientDiagnosisModal';
import { Modal } from '../components/common/Modal';
import {
  Stethoscope,
  Video,
  FileText,
  AlertCircle,
  CheckCircle,
  Activity,
  Clock,
  User,
  ShieldCheck,
  Search,
  Filter,
  FileEdit,
  HeartPulse,
  Pill
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { doctorQueue, prescriptions, getPatientProfile } = useMedicalData();

  const [activeConsultPatient, setActiveConsultPatient] = useState(null);
  const [selectedRx, setSelectedRx] = useState(null);
  const [diagnosisPatientCase, setDiagnosisPatientCase] = useState(null);
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQueue = doctorQueue.filter((item) => {
    const matchesUrgency = filterUrgency === 'ALL' || item.urgency === filterUrgency;
    const matchesSearch =
      (item.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.diseaseName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUrgency && matchesSearch;
  });

  const redCount = doctorQueue.filter((q) => q.urgency === 'RED').length;
  const yellowCount = doctorQueue.filter((q) => q.urgency === 'YELLOW').length;
  const greenCount = doctorQueue.filter((q) => q.urgency === 'GREEN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Doctor Profile Header */}
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
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
          >
            <Stethoscope size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)' }}>
                {lang === 'hi' && user?.nameHi ? user.nameHi : user?.name}
              </h2>
              <span className="badge badge-primary">{user?.regNo || 'MCI-MH-44291'}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              {user?.specialty || 'Cardiology & Emergency Tele-Specialist'} • {lang === 'hi' && user?.hospitalHi ? user.hospitalHi : user?.hospital || 'District Telemedicine Hub'}
            </p>
          </div>
        </div>

        {/* Teleconsult Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-50)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--success-100)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-500)', boxShadow: '0 0 8px var(--success-500)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-700)' }}>
            {lang === 'hi' ? 'टेलीपरामर्श केंद्र ऑनलाइन' : 'Tele-Specialist Hub Online'}
          </span>
        </div>
      </div>

      {/* 2. Priority Metrics Summary */}
      <div className="grid-3">
        <div
          className="card card-interactive"
          onClick={() => setFilterUrgency('RED')}
          style={{
            borderLeft: '5px solid var(--emergency-500)',
            background: filterUrgency === 'RED' ? 'var(--emergency-50)' : 'white'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'गंभीर आपातकाल (Red Cases)' : 'Emergency Escalations (Red)'}
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emergency-700)', marginTop: '4px' }}>
            {redCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--emergency-600)' }}>
            Immediate clinical review & video call
          </span>
        </div>

        <div
          className="card card-interactive"
          onClick={() => setFilterUrgency('YELLOW')}
          style={{
            borderLeft: '5px solid var(--warning-500)',
            background: filterUrgency === 'YELLOW' ? 'var(--warning-50)' : 'white'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'त्वरित ध्यान (Yellow Cases)' : 'Urgent Consults (Yellow)'}
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning-700)', marginTop: '4px' }}>
            {yellowCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--warning-600)' }}>
            Review reported disease & symptoms
          </span>
        </div>

        <div
          className="card card-interactive"
          onClick={() => setFilterUrgency('ALL')}
          style={{
            borderLeft: '5px solid var(--primary-500)',
            background: filterUrgency === 'ALL' ? 'var(--primary-50)' : 'white'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'कुल मरीज कतार (All Queue)' : 'Total Patient Queue'}
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-800)', marginTop: '4px' }}>
            {doctorQueue.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>
            {greenCount} routine care cases
          </span>
        </div>
      </div>

      {/* 3. Patient Queue List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', fontWeight: 800 }}>
              {lang === 'hi' ? 'टेलीपरामर्श मरीज कतार एवं रोग रिपोर्ट' : 'Teleconsultation Patient Queue & Illness Reports'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
              {lang === 'hi' ? 'मरीजों द्वारा दर्ज की गई बीमारियां, लक्षण, पुरानी हिस्ट्री व वाइटल्स' : 'Patients reporting illnesses with attached chronic profiles & triage scores'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} color="var(--slate-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient..."
                style={{ paddingLeft: '2rem', fontSize: '0.85rem', padding: '0.45rem 2rem' }}
              />
            </div>

            <div className="role-pill-group">
              {['ALL', 'RED', 'YELLOW', 'GREEN'].map((u) => (
                <button
                  key={u}
                  onClick={() => setFilterUrgency(u)}
                  className={`role-pill-btn ${filterUrgency === u ? 'active' : ''}`}
                  style={{ color: filterUrgency === u ? 'white' : 'var(--slate-700)', fontSize: '0.75rem' }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Queue Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQueue.map((item) => {
            const patientProfile = getPatientProfile(item.patientId || item.phone) || {};
            const chronicList = patientProfile.chronicConditions || item.regularProblems || item.chronicConditions || [];
            const isCompleted = item.status === 'COMPLETED_DIAGNOSED';

            return (
              <div
                key={item.id}
                style={{
                  border: item.urgency === 'RED' ? '1.5px solid var(--emergency-400)' : '1px solid var(--slate-200)',
                  background: isCompleted ? '#f8fafc' : item.urgency === 'RED' ? 'rgba(254, 242, 242, 0.4)' : 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '220px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      background: isCompleted ? '#e2e8f0' : item.urgency === 'RED' ? 'var(--emergency-100)' : 'var(--primary-100)',
                      color: isCompleted ? '#475569' : item.urgency === 'RED' ? 'var(--emergency-700)' : 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    <User size={24} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', fontWeight: 800 }}>
                        {item.patientName}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        ({item.age} Yrs, {patientProfile.gender || item.gender || 'Male'})
                      </span>
                      <StatusBadge urgency={item.urgency} score={item.score} />
                      {isCompleted && (
                        <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
                          ✓ Diagnosed & Updated
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--slate-900)', fontWeight: 700 }}>
                      {item.diseaseName ? `${item.diseaseName}: ` : ''}
                      <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                        {lang === 'hi' && item.reasonHi ? item.reasonHi : item.reason}
                      </span>
                    </p>

                    {/* Patient Regular Problems / Chronic Profile Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)' }}>
                        {lang === 'hi' ? 'पुरानी बीमारियां:' : 'Patient Chronic History:'}
                      </span>
                      {chronicList.length > 0 ? (
                        chronicList.map((cond, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            {cond}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>None registered</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vitals Box */}
                <div
                  style={{
                    background: 'var(--slate-50)',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--slate-400)', display: 'block' }}>BP</span>
                    <strong>{item.vitals?.bp || '130/84'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-400)', display: 'block' }}>Pulse</span>
                    <strong>{item.vitals?.pulse || '78 bpm'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-400)', display: 'block' }}>SpO2</span>
                    <strong style={{ color: item.urgency === 'RED' ? 'var(--emergency-600)' : 'inherit' }}>
                      {item.vitals?.spo2 || '98%'}
                    </strong>
                  </div>
                </div>

                {/* Actions: Video Consult + Update Diagnosis/Profile */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setDiagnosisPatientCase(item)}
                    className="btn btn-secondary btn-md"
                    style={{ fontWeight: 700, gap: '0.4rem', border: '1.5px solid var(--primary-300)' }}
                  >
                    <FileEdit size={16} color="var(--primary-700)" />
                    {lang === 'hi' ? 'रिपोर्ट व प्रोफाइल अपडेट' : 'Review & Update Diagnosis'}
                  </button>

                  <button
                    onClick={() => setActiveConsultPatient(item)}
                    className={`btn ${item.urgency === 'RED' ? 'btn-emergency' : 'btn-primary'} btn-md`}
                    style={{ fontWeight: 700, gap: '0.4rem' }}
                  >
                    <Video size={18} />
                    {lang === 'hi' ? 'वीडियो कॉल' : 'Video Consult'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Teleconsult Room Modal */}
      {activeConsultPatient && (
        <Modal
          isOpen={true}
          onClose={() => setActiveConsultPatient(null)}
          title={`Active Teleconsult: ${activeConsultPatient.patientName}`}
          maxWidth="980px"
        >
          <ConsultRoom
            patient={activeConsultPatient}
            onEndCall={() => setActiveConsultPatient(null)}
            onOpenPrescription={(rx) => {
              setSelectedRx(rx);
              setActiveConsultPatient(null);
            }}
          />
        </Modal>
      )}

      {/* 5. Update Patient Diagnosis & Health Profile Modal */}
      {diagnosisPatientCase && (
        <UpdatePatientDiagnosisModal
          isOpen={true}
          onClose={() => setDiagnosisPatientCase(null)}
          patientCase={diagnosisPatientCase}
          onDiagnosisSaved={(res) => {
            if (res.prescription) {
              setSelectedRx(res.prescription);
            }
          }}
        />
      )}

      {/* 6. Prescription View Modal */}
      {selectedRx && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRx(null)}
          title="Digital Prescription Summary"
          maxWidth="720px"
        >
          <PrescriptionView prescription={selectedRx} />
        </Modal>
      )}
    </div>
  );
};
