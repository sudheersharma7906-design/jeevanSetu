// src/components/consult/UpdatePatientDiagnosisModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMedicalData } from '../../context/MedicalDataContext';
import { Modal } from '../common/Modal';
import {
  Stethoscope,
  User,
  HeartPulse,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  FileCheck2,
  Activity,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const UpdatePatientDiagnosisModal = ({ isOpen, onClose, patientCase, onDiagnosisSaved }) => {
  const { user, role } = useAuth();
  const { lang, t } = useLanguage();
  const { getPatientProfile, doctorUpdateDiagnosis } = useMedicalData();

  const isHindi = lang === 'hi';

  const patientProfile = getPatientProfile(patientCase?.patientId || patientCase?.phone) || {};
  const currentChronic = patientProfile.chronicConditions || patientCase?.regularProblems || patientCase?.chronicConditions || [];
  const currentAllergies = patientProfile.allergies || patientCase?.allergies || [];

  const [diagnosis, setDiagnosis] = useState(
    patientCase?.diseaseName || patientCase?.reason || 'Acute Clinical Assessment'
  );
  const [diagnosisHi, setDiagnosisHi] = useState(
    isHindi ? 'चिकित्सीय मूल्यांकन व उपचार' : 'Clinical Diagnosis & Treatment'
  );

  const [clinicalNotes, setClinicalNotes] = useState(
    `Patient evaluated via teleconsultation. Reported symptoms: ${patientCase?.symptoms || 'General weakness'}. Advised medication compliance and resting.`
  );

  const [addAsChronicCondition, setAddAsChronicCondition] = useState(false);
  const [newChronicConditionName, setNewChronicConditionName] = useState('');

  const [medicines, setMedicines] = useState([
    { name: 'Tab. Paracetamol 500mg', dosage: '1 Tab TDS after meals', duration: '3 Days', instructions: 'For fever & pain' },
    { name: 'Tab. Cetirizine 10mg', dosage: '1 Tab Nightly', duration: '5 Days', instructions: 'For allergy & cough' }
  ]);

  const [dietAdvice, setDietAdvice] = useState('Adequate hydration, warm fluid intake, low sodium diet, avoid strenuous labor.');
  const [nextFollowup, setNextFollowup] = useState('Review after 5-7 days or immediate SOS if symptoms worsen.');

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 Tab Twice Daily');
  const [newMedDuration, setNewMedDuration] = useState('5 Days');
  const [newMedInstructions, setNewMedInstructions] = useState('After meals');

  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !patientCase) return null;

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    setMedicines((prev) => [
      ...prev,
      {
        name: newMedName.trim(),
        dosage: newMedDosage.trim(),
        duration: newMedDuration.trim(),
        instructions: newMedInstructions.trim()
      }
    ]);

    setNewMedName('');
    setNewMedDosage('1 Tab Twice Daily');
    setNewMedDuration('5 Days');
    setNewMedInstructions('After meals');
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmitDiagnosis = (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) return;

    const addedConditions = [];
    if (addAsChronicCondition && newChronicConditionName.trim()) {
      addedConditions.push(newChronicConditionName.trim());
    } else if (addAsChronicCondition && diagnosis.trim()) {
      addedConditions.push(diagnosis.trim());
    }

    const doctorDisplayName = user?.name || (role === 'doctor' ? 'Specialist Doctor' : 'On-Duty RMP');
    const doctorRegNumber = user?.regNo || user?.regNumber || user?.registrationNo || 'MCI-MH-44291';
    const doctorSpecialty = user?.specialty || (role === 'doctor' ? 'Specialist Tele-Consultant' : 'Rural Medical Practitioner');

    const result = doctorUpdateDiagnosis({
      caseId: patientCase.id,
      patientId: patientCase.patientId || patientProfile.id,
      patientPhone: patientCase.phone || patientProfile.phone,
      patientName: patientCase.patientName || patientProfile.name,
      doctorName: doctorDisplayName,
      doctorReg: doctorRegNumber,
      doctorRole: doctorSpecialty,
      diagnosis: diagnosis.trim(),
      diagnosisHi: diagnosisHi.trim(),
      clinicalNotes: clinicalNotes.trim(),
      addedChronicConditions: addedConditions,
      medicines,
      dietAdvice: dietAdvice.trim(),
      vitals: patientCase.vitals || { bp: '130/84', pulse: '78 bpm', spo2: '98%', temp: '98.4 °F' },
      nextFollowup
    });

    setIsSaved(true);

    if (onDiagnosisSaved) {
      onDiagnosisSaved(result);
    }

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHindi ? '📋 मरीज रिपोर्ट जांचें, रोग निदान करें व प्रोफाइल अपडेट करें' : '📋 Review Patient Report & Update Clinical Diagnosis'}
      maxWidth="860px"
    >
      <form onSubmit={handleSubmitDiagnosis} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Section 1: Patient Background & Reported Disease Report (Read-only Summary) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1.5px solid var(--slate-300)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--primary-600)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}
              >
                {patientCase.patientName?.charAt(0) || 'P'}
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {patientCase.patientName} ({patientCase.age} Yrs, {patientCase.gender || 'Male'})
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  Phone: +91 {patientCase.phone || patientProfile.phone || 'N/A'} • {patientProfile.village || 'N/A'}
                </span>
              </div>
            </div>

            <span className={`badge ${patientCase.urgency === 'RED' ? 'badge-emergency' : 'badge-primary'}`}>
              Urgency: {patientCase.urgency || 'YELLOW'} ({patientCase.score || 60}/100)
            </span>
          </div>

          {/* Regular Problems & Reported Disease Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', display: 'block' }}>
                {isHindi ? 'मरीज की नियमित / पुरानी बीमारियां:' : "Patient's Regular / Chronic Problems:"}
              </span>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', marginTop: '2px' }}>
                {currentChronic.length > 0 ? currentChronic.join(', ') : (isHindi ? 'कोई पुरानी बीमारी दर्ज नहीं' : 'No prior chronic conditions')}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'block', marginTop: '3px' }}>
                Allergies: {currentAllergies.length > 0 ? currentAllergies.join(', ') : 'None registered'}
              </span>
            </div>

            <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emergency-700)', display: 'block' }}>
                {isHindi ? 'मरीज द्वारा दर्ज नए लक्षण व परेशानी:' : 'Reported Symptoms & Vitals:'}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-800)', marginTop: '2px', fontWeight: 600 }}>
                {patientCase.symptoms || patientCase.reason}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', gap: '0.6rem', marginTop: '3px' }}>
                <span>BP: <b>{patientCase.vitals?.bp || '130/84'}</b></span>
                <span>SpO2: <b>{patientCase.vitals?.spo2 || '98%'}</b></span>
                <span>Pulse: <b>{patientCase.vitals?.pulse || '78 bpm'}</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Doctor / RMP Clinical Diagnosis */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Stethoscope size={16} color="var(--primary-700)" />
            {isHindi ? '२. डॉक्टर / RMP नैदानिक मूल्यांकन (Clinical Diagnosis)' : '2. Clinical Diagnosis & Examination'}
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">{isHindi ? 'पुष्टि किया गया रोग निदान (Confirmed Diagnosis - English)' : 'Confirmed Diagnosis (English)'}</label>
              <input
                type="text"
                className="form-input"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis, Type 2 Diabetes Exacerbation..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'रोग निदान (हिंदी / स्थानीय भाषा में)' : 'Diagnosis (Hindi Translation)'}</label>
              <input
                type="text"
                className="form-input"
                value={diagnosisHi}
                onChange={(e) => setDiagnosisHi(e.target.value)}
                placeholder="उदा. तीव्र ब्रोंकाइटिस, दमा..."
              />
            </div>
          </div>

          {/* Add as Chronic Problem Checkbox */}
          <div
            style={{
              background: addAsChronicCondition ? '#fef3c7' : 'white',
              border: addAsChronicCondition ? '1.5px solid #f59e0b' : '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              marginTop: '0.75rem',
              transition: 'all 0.15s ease'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              <input
                type="checkbox"
                checked={addAsChronicCondition}
                onChange={(e) => setAddAsChronicCondition(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-600)' }}
              />
              <span>
                {isHindi
                  ? '➕ इस बीमारी को मरीज की स्थायी नियमित/पुरानी बीमारी सूची (Chronic Profile) में जोड़ें'
                  : "➕ Add this diagnosis to Patient's Permanent Regular / Chronic Health Profile"}
              </span>
            </label>

            {addAsChronicCondition && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={newChronicConditionName || diagnosis}
                  onChange={(e) => setNewChronicConditionName(e.target.value)}
                  placeholder="Condition title to save in patient profile"
                  style={{ fontSize: '0.82rem', background: 'white' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '2px', display: 'block' }}>
                  ✓ This condition will now permanently appear in the patient's background for future consultations.
                </span>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '0.85rem' }}>
            <label className="form-label">{isHindi ? 'क्लिनिकल नोट्स व जांच विवरण (Clinical Examination Notes):' : 'Clinical Examination Notes:'}</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Enter clinical observations, chest sounds, abdominal exam, advice..."
            />
          </div>
        </div>

        {/* Section 3: Prescribed Medications */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Pill size={16} color="var(--primary-700)" />
              {isHindi ? '३. निर्धारित दवाएं व खुराक (Prescribed Medicines)' : '3. Prescribed Medications'}
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
              {medicines.length} {isHindi ? 'दवाएं जोड़ी गईं' : 'medicines added'}
            </span>
          </div>

          {/* Medicines List Table */}
          {medicines.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'white',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--slate-900)' }}>{med.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                      {med.dosage} • {med.duration} {med.instructions && `(${med.instructions})`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--emergency-600)', padding: '4px' }}
                    title="Remove medicine"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new medicine row */}
          <div
            style={{
              background: 'white',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--primary-300)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="Medicine name (e.g. Azithromycin 500mg)"
                style={{ fontSize: '0.82rem' }}
              />
              <input
                type="text"
                className="form-input"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder="Dosage (e.g. 1 Tab Daily)"
                style={{ fontSize: '0.82rem' }}
              />
              <input
                type="text"
                className="form-input"
                value={newMedDuration}
                onChange={(e) => setNewMedDuration(e.target.value)}
                placeholder="Duration (e.g. 5 Days)"
                style={{ fontSize: '0.82rem' }}
              />
              <input
                type="text"
                className="form-input"
                value={newMedInstructions}
                onChange={(e) => setNewMedInstructions(e.target.value)}
                placeholder="Instructions (e.g. After meals)"
                style={{ fontSize: '0.82rem' }}
              />
            </div>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', fontSize: '0.78rem', gap: '0.3rem' }}
            >
              <Plus size={14} />
              {isHindi ? '+ दवा सूची में जोड़ें' : '+ Add Medicine to List'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginTop: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{isHindi ? 'आहार व परहेज सलाह:' : 'Diet & Lifestyle Advice:'}</label>
              <input
                type="text"
                className="form-input"
                value={dietAdvice}
                onChange={(e) => setDietAdvice(e.target.value)}
                placeholder="e.g. Adequate hydration, low salt diet..."
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{isHindi ? 'अगला परामर्श / फॉलो-अप:' : 'Next Follow-up Date:'}</label>
              <input
                type="text"
                className="form-input"
                value={nextFollowup}
                onChange={(e) => setNextFollowup(e.target.value)}
                placeholder="e.g. Review after 7 days"
              />
            </div>
          </div>
        </div>

        {isSaved && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#166534',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle2 size={18} color="#16a34a" />
            {isHindi
              ? '✅ मरीज प्रोफाइल व नैदानिक रिकॉर्ड सफलतापूर्वक अपडेट हो गया!'
              : "✅ Patient Profile & Health Records successfully updated!"}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-md">
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-md"
            style={{
              fontWeight: 800,
              gap: '0.5rem',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))'
            }}
          >
            <FileCheck2 size={18} />
            {isHindi ? '💾 प्रोफाइल अपडेट करें व पर्चा जारी करें' : '💾 Update Profile, Diagnose & Issue Rx'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
