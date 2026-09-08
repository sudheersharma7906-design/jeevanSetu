// src/components/patient/PatientProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMedicalData } from '../../context/MedicalDataContext';
import { Modal } from '../common/Modal';
import {
  User,
  HeartPulse,
  MapPin,
  Phone,
  Shield,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Activity,
  Pill,
  Save
} from 'lucide-react';

const COMMON_CHRONIC_CONDITIONS = [
  { id: 'diabetes', labelEn: 'Type 2 Diabetes', labelHi: 'टाइप 2 मधुमेह (शुगर)' },
  { id: 'hypertension', labelEn: 'Hypertension (High BP)', labelHi: 'उच्च रक्तचाप (हाई बीपी)' },
  { id: 'asthma', labelEn: 'Asthma / Breathing Issue', labelHi: 'दमा / सांस की बीमारी' },
  { id: 'heart', labelEn: 'Heart Disease / Angina', labelHi: 'हृदय रोग / सीने में दर्द' },
  { id: 'arthritis', labelEn: 'Arthritis / Joint Pain', labelHi: 'गठिया / जोड़ों का दर्द' },
  { id: 'thyroid', labelEn: 'Thyroid Disorder', labelHi: 'थायराइड' },
  { id: 'acidity', labelEn: 'Chronic Acidity / GERD', labelHi: 'गैस / एसिडिटी की समस्या' },
  { id: 'kidney', labelEn: 'Kidney Condition', labelHi: 'गुर्दे (किडनी) संबंधी समस्या' }
];

const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa drugs',
  'Aspirin / NSAIDs',
  'Dust & Pollen',
  'Peanuts',
  'Egg / Seafood',
  'None Known'
];

export const PatientProfileModal = ({ isOpen, onClose, currentPatient, onSaved }) => {
  const { lang, t } = useLanguage();
  const { getPatientProfile, updatePatientProfile } = useMedicalData();

  const isHindi = lang === 'hi';

  const initialProfile = getPatientProfile(currentPatient?.id || currentPatient?.phone) || {};

  const [name, setName] = useState(initialProfile.name || currentPatient?.name || '');
  const [age, setAge] = useState(initialProfile.age || currentPatient?.age || 45);
  const [gender, setGender] = useState(initialProfile.gender || currentPatient?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(initialProfile.bloodGroup || 'B+');
  const [phone, setPhone] = useState(initialProfile.phone || currentPatient?.phone || '9876543210');
  const [abhaId, setAbhaId] = useState(initialProfile.abhaId || 'ABHA-9821-4451-9012');
  const [address, setAddress] = useState(initialProfile.address || 'Near Gram Panchayat, Wada Rural, Dist. Palghar');
  const [village, setVillage] = useState(initialProfile.village || 'Wada Rural');
  const [district, setDistrict] = useState(initialProfile.district || 'Palghar');
  const [state, setState] = useState(initialProfile.state || 'Maharashtra');

  const [emergencyName, setEmergencyName] = useState(initialProfile.emergencyContact?.name || 'Sunita Patil');
  const [emergencyPhone, setEmergencyPhone] = useState(initialProfile.emergencyContact?.phone || '9876543211');
  const [emergencyRelation, setEmergencyRelation] = useState(initialProfile.emergencyContact?.relation || 'Spouse');

  const [chronicConditions, setChronicConditions] = useState(initialProfile.chronicConditions || ['Type 2 Diabetes', 'Hypertension (High BP)']);
  const [customChronic, setCustomChronic] = useState('');

  const [allergies, setAllergies] = useState(initialProfile.allergies || ['Penicillin']);
  const [customAllergy, setCustomAllergy] = useState('');

  const [currentMeds, setCurrentMeds] = useState(
    Array.isArray(initialProfile.currentMedications)
      ? initialProfile.currentMedications.join(', ')
      : initialProfile.currentMedications || 'Amlodipine 5mg (Daily Morning), Metformin 500mg (Twice Daily)'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const p = getPatientProfile(currentPatient?.id || currentPatient?.phone) || {};
      setName(p.name || currentPatient?.name || '');
      setAge(p.age || currentPatient?.age || 45);
      setGender(p.gender || currentPatient?.gender || 'Male');
      setBloodGroup(p.bloodGroup || 'B+');
      setPhone(p.phone || currentPatient?.phone || '9876543210');
      setAbhaId(p.abhaId || 'ABHA-9821-4451-9012');
      setAddress(p.address || 'Near Gram Panchayat, Wada Rural, Dist. Palghar');
      setVillage(p.village || 'Wada Rural');
      setDistrict(p.district || 'Palghar');
      setState(p.state || 'Maharashtra');
      setEmergencyName(p.emergencyContact?.name || 'Sunita Patil');
      setEmergencyPhone(p.emergencyContact?.phone || '9876543211');
      setEmergencyRelation(p.emergencyContact?.relation || 'Spouse');
      setChronicConditions(p.chronicConditions || ['Type 2 Diabetes', 'Hypertension (High BP)']);
      setAllergies(p.allergies || ['Penicillin']);
      setCurrentMeds(
        Array.isArray(p.currentMedications) ? p.currentMedications.join(', ') : p.currentMedications || ''
      );
      setSavedSuccess(false);
    }
  }, [isOpen, currentPatient]);

  if (!isOpen) return null;

  const toggleChronic = (condText) => {
    setChronicConditions((prev) =>
      prev.includes(condText) ? prev.filter((c) => c !== condText) : [...prev, condText]
    );
  };

  const addCustomChronic = (e) => {
    e.preventDefault();
    if (customChronic.trim() && !chronicConditions.includes(customChronic.trim())) {
      setChronicConditions([...chronicConditions, customChronic.trim()]);
      setCustomChronic('');
    }
  };

  const removeChronic = (item) => {
    setChronicConditions(chronicConditions.filter((c) => c !== item));
  };

  const toggleAllergy = (allg) => {
    setAllergies((prev) =>
      prev.includes(allg) ? prev.filter((a) => a !== allg) : [...prev, allg]
    );
  };

  const addCustomAllergy = (e) => {
    e.preventDefault();
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const removeAllergy = (item) => {
    setAllergies(allergies.filter((a) => a !== item));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const medsArray = currentMeds
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const updated = updatePatientProfile(currentPatient?.id || phone, {
      name,
      age: Number(age),
      gender,
      bloodGroup,
      phone,
      abhaId,
      address,
      village,
      district,
      state,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation
      },
      chronicConditions,
      allergies,
      currentMedications: medsArray,
      profileCompleted: true
    });

    setSavedSuccess(true);
    if (onSaved) {
      onSaved(updated);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHindi ? '🩺 मरीज स्वास्थ्य प्रोफाइल एवं नियमित बीमारी विवरण' : '🩺 Patient Health Profile & Chronic Health History'}
      maxWidth="780px"
    >
      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Info Banner */}
        <div
          style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: 'var(--primary-900)'
          }}
        >
          <Shield size={20} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <b>{isHindi ? 'मरीज की व्यक्तिगत स्वास्थ्य प्रोफाइल' : 'Personal Medical Profile & Health History'}</b>
            <p style={{ marginTop: '2px', color: 'var(--slate-600)', fontSize: '0.8rem' }}>
              {isHindi
                ? 'यह जानकारी आपके द्वारा किसी भी नई बीमारी / लक्षण दर्ज करने पर डॉक्टर एवं ग्रामीण चिकित्सक (RMP) को स्वचालित रूप से साझा की जाएगी।'
                : 'This health history is securely linked to your account and automatically shared with specialist doctors & RMPs whenever you report any illness.'}
            </p>
          </div>
        </div>

        {/* Section 1: Basic Identity */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={16} color="var(--primary-700)" />
            {isHindi ? '१. बुनियादी व्यक्तिगत विवरण (Basic Details)' : '1. Basic Identity & Contact'}
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">{isHindi ? 'पूरा नाम (Full Name)' : 'Full Name'}</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rameshwar Patil"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'उम्र (Age in Years)' : 'Age (Years)'}</label>
              <input
                type="number"
                className="form-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={1}
                max={120}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'लिंग (Gender)' : 'Gender'}</label>
              <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">{isHindi ? 'पुरुष (Male)' : 'Male'}</option>
                <option value="Female">{isHindi ? 'महिला (Female)' : 'Female'}</option>
                <option value="Other">{isHindi ? 'अन्य (Other)' : 'Other'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'रक्त समूह (Blood Group)' : 'Blood Group'}</label>
              <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'मोबाइल नंबर (Mobile Phone)' : 'Mobile Phone'}</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'ABHA स्वास्थ्य खाता संख्या' : 'ABHA Health ID'}</label>
              <input
                type="text"
                className="form-input"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="ABHA-XXXX-XXXX-XXXX"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginTop: '0.85rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">{isHindi ? 'गाँव व पूरा पता (Village & Full Address)' : 'Village & Full Address'}</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Gram Panchayat, Wada Rural, Dist. Palghar"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Regular Health Problems & Chronic Illness */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <HeartPulse size={16} color="var(--emergency-600)" />
            {isHindi ? '२. नियमित / पुरानी बीमारियां (Regular Problems & Chronic History)' : '2. Regular Problems & Chronic Conditions'}
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
            {isHindi ? 'लागू होने वाली बीमारियों पर टैप करें या नई जोड़ें:' : 'Tap to select all applicable conditions or add custom ones:'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
            {COMMON_CHRONIC_CONDITIONS.map((cond) => {
              const isSelected = chronicConditions.includes(cond.labelEn);
              return (
                <button
                  type="button"
                  key={cond.id}
                  onClick={() => toggleChronic(cond.labelEn)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--slate-300)',
                    background: isSelected ? 'var(--primary-100)' : 'white',
                    color: isSelected ? 'var(--primary-900)' : 'var(--slate-700)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected && <CheckCircle2 size={13} color="var(--primary-700)" />}
                  {isHindi ? cond.labelHi : cond.labelEn}
                </button>
              );
            })}
          </div>

          {/* Active Selected Chronic Badges */}
          {chronicConditions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem', padding: '0.5rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', alignSelf: 'center', marginRight: '0.25rem' }}>
                {isHindi ? 'चुनी गई बीमारियां:' : 'Active Conditions:'}
              </span>
              {chronicConditions.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {item}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeChronic(item)} />
                </span>
              ))}
            </div>
          )}

          {/* Add custom chronic problem */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              value={customChronic}
              onChange={(e) => setCustomChronic(e.target.value)}
              placeholder={isHindi ? 'अन्य कोई बीमारी दर्ज करें (जैसे: साइनस, माइग्रेन)...' : 'Add custom regular problem (e.g. Migraine, Sinusitis)...'}
              style={{ fontSize: '0.85rem' }}
            />
            <button type="button" onClick={addCustomChronic} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              <Plus size={15} />
              {isHindi ? 'जोड़ें' : 'Add'}
            </button>
          </div>
        </div>

        {/* Section 3: Allergies & Current Daily Medications */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Pill size={16} color="var(--primary-700)" />
            {isHindi ? '३. एलर्जी एवं वर्तमान में चल रही दवाएं (Allergies & Daily Medicines)' : '3. Allergies & Daily Medications'}
          </h4>

          {/* Allergies pills */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{isHindi ? 'ज्ञात एलर्जी (Known Allergies):' : 'Known Allergies:'}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {COMMON_ALLERGIES.map((allg, idx) => {
                const isSel = allergies.includes(allg);
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => toggleAllergy(allg)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: isSel ? 700 : 500,
                      border: isSel ? '1.5px solid var(--emergency-500)' : '1px solid var(--slate-300)',
                      background: isSel ? 'var(--emergency-50)' : 'white',
                      color: isSel ? 'var(--emergency-800)' : 'var(--slate-700)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {isSel && <CheckCircle2 size={12} color="var(--emergency-700)" />}
                    {allg}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                placeholder={isHindi ? 'अन्य कोई एलर्जी दर्ज करें...' : 'Add other allergy...'}
                style={{ fontSize: '0.85rem' }}
              />
              <button type="button" onClick={addCustomAllergy} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                <Plus size={15} />
                {isHindi ? 'जोड़ें' : 'Add'}
              </button>
            </div>
          </div>

          {/* Daily Medications */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              {isHindi ? 'वर्तमान में चल रही नियमित दवाएं (Daily Medications):' : 'Current Daily Medications (comma-separated):'}
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              value={currentMeds}
              onChange={(e) => setCurrentMeds(e.target.value)}
              placeholder="e.g. Amlodipine 5mg (Daily Morning), Metformin 500mg (Twice Daily)"
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Section 4: Emergency Contact */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Phone size={16} color="var(--emergency-600)" />
            {isHindi ? '४. आपातकालीन संपर्क (Emergency Contact)' : '4. Emergency Contact Person'}
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">{isHindi ? 'संपर्क व्यक्ति का नाम' : 'Contact Name'}</label>
              <input
                type="text"
                className="form-input"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Sunita Patil"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'आपातकालीन फोन नंबर' : 'Emergency Phone'}</label>
              <input
                type="tel"
                className="form-input"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="9876543211"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isHindi ? 'संबंध (Relation)' : 'Relationship'}</label>
              <input
                type="text"
                className="form-input"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                placeholder="e.g. Spouse / Son / Father"
                required
              />
            </div>
          </div>
        </div>

        {savedSuccess && (
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
            {isHindi ? 'स्वास्थ्य प्रोफाइल सफलतापूर्वक सहेज ली गई है!' : 'Health profile updated & saved successfully!'}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-md">
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button type="submit" className="btn btn-primary btn-md" style={{ fontWeight: 800, gap: '0.5rem' }}>
            <Save size={18} />
            {isHindi ? 'प्रोफाइल सहेजें (Save Profile)' : 'Save Health Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
