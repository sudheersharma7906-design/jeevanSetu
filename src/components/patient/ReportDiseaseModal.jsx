// src/components/patient/ReportDiseaseModal.jsx
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMedicalData } from '../../context/MedicalDataContext';
import { Modal } from '../common/Modal';
import {
  HeartPulse,
  Send,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Thermometer,
  Sparkles
} from 'lucide-react';

const COMMON_DISEASE_CATEGORIES = [
  { id: 'chest_heart', labelEn: 'Chest Pain / Heart Discomfort', labelHi: 'सीने में दर्द / भारीपन', icon: '🫀' },
  { id: 'breathing', labelEn: 'Breathing Difficulty / Severe Asthma', labelHi: 'सांस लेने में तकलीफ / दमा', icon: '🫁' },
  { id: 'fever_infection', labelEn: 'High Fever / Chills / Viral Illness', labelHi: 'तेज बुखार / कंपकंपी / संक्रमण', icon: '🌡️' },
  { id: 'stomach_vomiting', labelEn: 'Severe Abdominal Pain / Vomiting / Diarrhea', labelHi: 'पेट में तेज दर्द / उल्टी / दस्त', icon: '🤢' },
  { id: 'joint_bone', labelEn: 'Severe Joint / Bone / Back Pain', labelHi: 'जोड़ों / हड्डियों में तेज दर्द', icon: '🦴' },
  { id: 'head_neuro', labelEn: 'Severe Headache / Dizziness / Stroke Sign', labelHi: 'सिरदर्द / चक्कर / बेहोशी', icon: '🤕' },
  { id: 'maternal', labelEn: 'Pregnancy / Maternal Complication', labelHi: 'गर्भावस्था संबंधी समस्या', icon: '🤰' },
  { id: 'injury_trauma', labelEn: 'Accident / Severe Injury / Bleeding', labelHi: 'चोट / दुर्घटना / रक्तस्राव', icon: '🩹' },
  { id: 'general', labelEn: 'Other Illness / Symptoms', labelHi: 'अन्य कोई बीमारी / लक्षण', icon: '🩺' }
];

export const ReportDiseaseModal = ({ isOpen, onClose, currentPatient, onCaseSubmitted }) => {
  const { lang, t } = useLanguage();
  const { getPatientProfile, reportDiseaseIssue } = useMedicalData();

  const isHindi = lang === 'hi';
  const profile = getPatientProfile(currentPatient?.id || currentPatient?.phone) || {};

  const [selectedCategory, setSelectedCategory] = useState(COMMON_DISEASE_CATEGORIES[0].labelEn);
  const [diseaseTitle, setDiseaseTitle] = useState('');
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [duration, setDuration] = useState('1-2 Days');
  const [painScale, setPainScale] = useState(6);

  // Vitals
  const [bp, setBp] = useState('134/86');
  const [pulse, setPulse] = useState('78');
  const [spo2, setSpo2] = useState('97');
  const [temp, setTemp] = useState('98.6');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptomsDescription.trim()) return;

    setIsSubmitting(true);

    const createdCase = reportDiseaseIssue({
      patientId: profile.id || currentPatient?.id || 'pat-101',
      patientName: profile.name || currentPatient?.name,
      phone: profile.phone || currentPatient?.phone,
      age: profile.age || currentPatient?.age,
      gender: profile.gender || currentPatient?.gender,
      diseaseCategory: selectedCategory,
      diseaseName: diseaseTitle.trim() || selectedCategory,
      symptoms: symptomsDescription.trim(),
      duration,
      painScale: Number(painScale),
      vitals: {
        bp: bp || '130/84',
        pulse: `${pulse || 78} bpm`,
        spo2: `${spo2 || 98}%`,
        temp: `${temp || 98.6} °F`
      }
    });

    setIsSubmitting(false);
    setSubmissionResult(createdCase);

    if (onCaseSubmitted) {
      onCaseSubmitted(createdCase);
    }
  };

  const handleResetAndClose = () => {
    setSubmissionResult(null);
    setDiseaseTitle('');
    setSymptomsDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isHindi ? '🚨 नया रोग या लक्षण दर्ज करें (डॉक्टर को भेजें)' : '🚨 Report New Illness / Symptoms (Transmit to Doctors)'}
      maxWidth="740px"
    >
      {!submissionResult ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Patient Attached Profile Preview Badge */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)',
              border: '1.5px solid var(--primary-300)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <ShieldCheck size={22} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary-900)', fontSize: '0.9rem' }}>
                  {profile.name || currentPatient?.name} ({profile.age} Yrs, {profile.gender})
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                  {isHindi ? 'प्रोफाइल डेटा संलग्न' : 'Profile Auto-Attached'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-700)', marginTop: '3px', lineHeight: 1.35 }}>
                <b>{isHindi ? 'नियमित बीमारियां:' : 'Regular Problems:'}</b>{' '}
                {profile.chronicConditions?.length > 0 ? profile.chronicConditions.join(', ') : (isHindi ? 'कोई नहीं दर्ज' : 'None registered')}{' '}
                • <b>{isHindi ? 'एलर्जी:' : 'Allergies:'}</b>{' '}
                {profile.allergies?.length > 0 ? profile.allergies.join(', ') : 'None'}
              </p>
            </div>
          </div>

          {/* Step 1: Disease Category Selection */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              {isHindi ? '१. मुख्य समस्या / लक्षण श्रेणी चुनें (Disease Category):' : '1. Select Main Complaint Category:'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.5rem' }}>
              {COMMON_DISEASE_CATEGORIES.map((cat) => {
                const isSel = selectedCategory === cat.labelEn;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.labelEn)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSel ? '2px solid var(--primary-600)' : '1px solid var(--slate-200)',
                      background: isSel ? 'var(--primary-50)' : 'white',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isSel ? 700 : 500,
                      color: isSel ? 'var(--primary-900)' : 'var(--slate-700)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                    <span>{isHindi ? cat.labelHi : cat.labelEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Specific Disease Title / Name */}
          <div className="form-group">
            <label className="form-label">
              {isHindi ? '२. रोग का नाम या मुख्य लक्षण शीर्षक (Disease / Problem Title):' : '2. Specific Problem / Disease Title:'}
            </label>
            <input
              type="text"
              className="form-input"
              value={diseaseTitle}
              onChange={(e) => setDiseaseTitle(e.target.value)}
              placeholder={isHindi ? 'जैसे: ३ दिन से तेज बुखार, सीने में तेज चुभन, दमा का दौरा...' : 'e.g. 3-Day High Fever with Cough, Acute Chest Pain...'}
            />
          </div>

          {/* Step 3: Detailed Symptoms & Duration */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              {isHindi ? '३. आप क्या महसूस कर रहे हैं? विस्तार से बताएं (Describe Symptoms):' : '3. Describe what you are feeling in detail:'}
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={symptomsDescription}
              onChange={(e) => setSymptomsDescription(e.target.value)}
              placeholder={isHindi ? 'लक्षण कब से हैं, क्या खाने या सांस लेने में परेशानी है, कोई अन्य शिकायत...' : 'Mention when it started, what triggers it, any accompanying pain or shivering...'}
              required
            />
          </div>

          {/* Duration & Pain Severity Scale */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{isHindi ? 'लक्षण कितने समय से हैं? (Duration)' : 'Symptom Duration'}</label>
              <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="Few hours">{isHindi ? 'कुछ घंटों से (Few hours)' : 'Few hours'}</option>
                <option value="1-2 Days">{isHindi ? '१-२ दिन से (1-2 Days)' : '1-2 Days'}</option>
                <option value="3-5 Days">{isHindi ? '३-५ दिन से (3-5 Days)' : '3-5 Days'}</option>
                <option value="More than a week">{isHindi ? '१ सप्ताह से अधिक (Over a week)' : 'Over a week'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {isHindi ? `दर्द / परेशानी की तीव्रता (${painScale}/१०):` : `Discomfort Severity (${painScale}/10):`}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painScale}
                  onChange={(e) => setPainScale(e.target.value)}
                  style={{ flex: 1, accentColor: painScale >= 7 ? 'var(--emergency-600)' : 'var(--primary-600)' }}
                />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: painScale >= 7 ? 'var(--emergency-700)' : 'var(--primary-700)',
                    width: '35px',
                    textAlign: 'center'
                  }}
                >
                  {painScale}/10
                </span>
              </div>
            </div>
          </div>

          {/* Step 4: Measured Vitals (Optional) */}
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <Thermometer size={16} color="var(--primary-700)" />
              {isHindi ? '४. वाइटल्स माप (यदि थर्मामीटर/बीपी मशीन से मापा हो):' : '4. Measured Vitals (if available):'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>BP (रक्तचाप)</span>
                <input type="text" className="form-input" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="130/84" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Pulse (नाड़ी)</span>
                <input type="text" className="form-input" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="78" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>SpO2 (ऑक्सीजन %)</span>
                <input type="text" className="form-input" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Temp (°F बुखार)</span>
                <input type="text" className="form-input" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="98.6" />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-md">
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-md"
              style={{ fontWeight: 800, gap: '0.5rem', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}
            >
              <Send size={18} />
              {isSubmitting
                ? (isHindi ? 'भेजा जा रहा है...' : 'Transmitting...')
                : (isHindi ? 'डॉक्टर व RMP को भेजें (Submit to Doctors)' : 'Submit Report to Doctor & RMP')}
            </button>
          </div>
        </form>
      ) : (
        /* Submission Success Confirmation Screen */
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            {isHindi ? '✅ बीमारी रिपोर्ट डॉक्टरों को सफलतापूर्वक भेज दी गई!' : '✅ Illness Report Successfully Transmitted to Doctors & RMPs!'}
          </h3>

          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.4 }}>
            {isHindi
              ? `आपका केस ID ${submissionResult.id} के साथ टेली-स्पेशलिस्ट डॉक्टर एवं नजदीकी ग्रामीण चिकित्सक की कतार में दर्ज हो गया है। डॉक्टर आपकी रिपोर्ट जांच कर परामर्श व दवा पर्चा जारी करेंगे।`
              : `Your case (ID: ${submissionResult.id}) with clinical urgency [${submissionResult.urgency}] has been routed to the specialist teleconsultation queue and district health post.`}
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              textAlign: 'left',
              maxWidth: '520px',
              margin: '0 auto 1.5rem',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>Reported Illness:</span>
              <b>{submissionResult.diseaseName}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>Urgency Level:</span>
              <b style={{ color: submissionResult.urgency === 'RED' ? 'var(--emergency-600)' : 'var(--warning-700)' }}>
                {submissionResult.urgency} ({submissionResult.score}/100)
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Auto-Attached Background:</span>
              <span>{submissionResult.chronicConditions?.join(', ') || 'No prior chronic conditions'}</span>
            </div>
          </div>

          <button onClick={handleResetAndClose} className="btn btn-primary btn-md" style={{ fontWeight: 800 }}>
            {isHindi ? 'डैशबोर्ड पर लौटें' : 'Done & Return to Dashboard'}
          </button>
        </div>
      )}
    </Modal>
  );
};
