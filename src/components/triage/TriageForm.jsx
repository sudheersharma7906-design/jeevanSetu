import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  HeartPulse,
  Activity,
  Thermometer,
  Wind,
  Baby,
  Sparkles,
  Mic,
  AlertCircle,
  FileCheck,
  Stethoscope,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';

export const TriageForm = ({ onComplete }) => {
  const { lang, t } = useLanguage();

  const [category, setCategory] = useState('chest');
  const [duration, setDuration] = useState('< 1 hour');
  const [severity, setSeverity] = useState(7);
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Vitals
  const [bpSystolic, setBpSystolic] = useState('140');
  const [bpDiastolic, setBpDiastolic] = useState('90');
  const [pulse, setPulse] = useState('98');
  const [spo2, setSpo2] = useState('94');
  const [temp, setTemp] = useState('99.2');

  // Red-flag checklist
  const [redFlags, setRedFlags] = useState({
    sweatingOrDizziness: true,
    radiatingToArmJaw: true,
    lossOfConsciousness: false,
    unableToSpeakSentences: false,
    venomousBiteSuspected: false
  });

  const categories = [
    { id: 'chest', label: t('chestPain'), icon: HeartPulse, baseRisk: 82 },
    { id: 'breathing', label: t('breathing'), icon: Wind, baseRisk: 80 },
    { id: 'snakebite', label: lang === 'hi' ? 'सर्पदंश / विषैला कीड़ा' : 'Snakebite / Venomous', icon: Zap, baseRisk: 95 },
    { id: 'fever', label: t('fever'), icon: Thermometer, baseRisk: 45 },
    { id: 'maternal', label: t('maternal'), icon: Baby, baseRisk: 70 },
    { id: 'injury', label: t('injury'), icon: Activity, baseRisk: 75 },
    { id: 'other', label: t('otherSymptom'), icon: Stethoscope, baseRisk: 25 }
  ];

  const handleRedFlagChange = (key) => {
    setRedFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick preset loader for demonstration
  const applyPreset = (presetType) => {
    if (presetType === 'cardiac') {
      setCategory('chest');
      setSeverity(9);
      setDuration('< 1 hour');
      setBpSystolic('155');
      setBpDiastolic('98');
      setPulse('104');
      setSpo2('93');
      setTemp('98.6');
      setRedFlags({
        sweatingOrDizziness: true,
        radiatingToArmJaw: true,
        lossOfConsciousness: false,
        unableToSpeakSentences: false,
        venomousBiteSuspected: false
      });
      setDescription(
        lang === 'hi'
          ? 'सीने में अत्यधिक भारीपन और दबाव, बायीं बांह में दर्द तथा ठंडा पसीना।'
          : 'Crushing central chest tightness radiating to left arm and jaw with profuse cold sweating.'
      );
    } else if (presetType === 'snakebite') {
      setCategory('snakebite');
      setSeverity(9);
      setDuration('< 1 hour');
      setBpSystolic('130');
      setBpDiastolic('85');
      setPulse('112');
      setSpo2('96');
      setTemp('98.4');
      setRedFlags({
        sweatingOrDizziness: true,
        radiatingToArmJaw: false,
        lossOfConsciousness: false,
        unableToSpeakSentences: false,
        venomousBiteSuspected: true
      });
      setDescription(
        lang === 'hi'
          ? 'खेत में काम करते समय दाहिने पैर में सांप ने काटा है, दो दांतों के निशान और तेज सूजन है।'
          : 'Suspected venomous snake bite on right foot with visible fang punctures, local swelling and burning pain.'
      );
    } else if (presetType === 'fever') {
      setCategory('fever');
      setSeverity(5);
      setDuration('1 - 2 days');
      setBpSystolic('120');
      setBpDiastolic('80');
      setPulse('88');
      setSpo2('97');
      setTemp('102.8');
      setRedFlags({
        sweatingOrDizziness: false,
        radiatingToArmJaw: false,
        lossOfConsciousness: false,
        unableToSpeakSentences: false,
        venomousBiteSuspected: false
      });
      setDescription(
        lang === 'hi'
          ? 'तेज बुखार, कंपकंपी के साथ ठंड लगना, सिरदर्द और पूरे शरीर में दर्द।'
          : 'High intermittent fever with shivering chills, severe body ache and frontal headache.'
      );
    } else if (presetType === 'routine') {
      setCategory('other');
      setSeverity(2);
      setDuration('3+ days');
      setBpSystolic('120');
      setBpDiastolic('80');
      setPulse('72');
      setSpo2('98');
      setTemp('98.4');
      setRedFlags({
        sweatingOrDizziness: false,
        radiatingToArmJaw: false,
        lossOfConsciousness: false,
        unableToSpeakSentences: false,
        venomousBiteSuspected: false
      });
      setDescription(
        lang === 'hi'
          ? 'हल्की सर्दी, जुकाम और गले में खराश।'
          : 'Mild runny nose, sneezing and slight throat irritation since 3 days.'
      );
    }
  };

  // Mock voice symptom dictation
  const handleVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setDescription(
        lang === 'hi'
          ? 'सीने में भारी दबाव महसूस हो रहा है और बायीं बांह में दर्द जा रहा है। पसीना भी आ रहा है।'
          : 'Severe pressure on chest radiating to left shoulder and neck. Heavy sweating since 40 minutes.'
      );
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Deterministic Rule-based Scoring Matrix
    let score = 15;
    const catObj = categories.find(c => c.id === category);
    if (catObj) score += catObj.baseRisk * 0.45;

    // Severity factor (1-10)
    score += severity * 3.2;

    // Red flag modifiers
    const flagsDetected = [];
    if (redFlags.sweatingOrDizziness) { score += 15; flagsDetected.push('Diaphoresis / Dizziness'); }
    if (redFlags.radiatingToArmJaw) { score += 20; flagsDetected.push('Pain radiating to arm/jaw'); }
    if (redFlags.lossOfConsciousness) { score += 30; flagsDetected.push('Loss of consciousness'); }
    if (redFlags.unableToSpeakSentences) { score += 25; flagsDetected.push('Acute respiratory compromise'); }
    if (redFlags.venomousBiteSuspected) { score += 40; flagsDetected.push('Suspected venomous bite'); }

    // Vital signs risk calculation
    const spo2Num = parseInt(spo2, 10);
    if (spo2Num < 90) { score += 35; flagsDetected.push('Critical Hypoxia (SpO2 <90%)'); }
    else if (spo2Num < 95) { score += 15; flagsDetected.push('Moderate Hypoxia (SpO2 90-94%)'); }

    const pulseNum = parseInt(pulse, 10);
    if (pulseNum > 120 || pulseNum < 48) { score += 20; flagsDetected.push('Abnormal heart rate'); }

    const bpSys = parseInt(bpSystolic, 10);
    if (bpSys > 170 || bpSys < 85) { score += 25; flagsDetected.push('Hypertensive / Hypotensive crisis'); }

    const tempNum = parseFloat(temp);
    if (tempNum >= 103) { score += 18; flagsDetected.push('Hyperpyrexia (Temp >= 103°F)'); }

    if (duration === '< 1 hour') score += 10;

    score = Math.min(Math.max(Math.round(score), 15), 100);

    let urgency = 'GREEN';
    let urgencyBadge = 'Green';
    let requiresImmediateSos = false;
    let specialty = 'General Medicine';
    let actionEn = 'Consult local RMP or primary care clinic for routine clinical assessment.';
    let actionHi = 'नियमित स्वास्थ्य जांच हेतु स्थानीय आरएमपी अथवा प्राथमिक स्वास्थ्य केंद्र से संपर्क करें।';

    if (score >= 75 || redFlags.venomousBiteSuspected || redFlags.lossOfConsciousness) {
      urgency = 'RED';
      urgencyBadge = 'Red';
      requiresImmediateSos = true;
      if (category === 'chest') {
        specialty = 'Cardiology / Critical Care';
        actionEn = 'Immediate Emergency SOS dispatch. High risk of Acute Coronary Syndrome. Aspirin 300mg + Sorbitrate if physician approved.';
        actionHi = 'तत्काल आपातकालीन SOS भेजें। एक्यूट कोरोनरी सिंड्रोम का उच्च जोखिम। डॉक्टर के निर्देशानुसार एस्पिरिन दें।';
      } else if (category === 'snakebite' || redFlags.venomousBiteSuspected) {
        specialty = 'Emergency Toxicology';
        actionEn = 'Immobilize limb with splint. Do not cut or tourniquet. Rush to nearest Anti-Snake Venom (ASV) center.';
        actionHi = 'काटे गए अंग को स्थिर रखें। चीरा या कसकर पट्टी न बांधें। तुरंत ASV उपलब्ध केंद्र पर ले जाएं।';
      } else if (category === 'breathing') {
        specialty = 'Pulmonology / Critical Care';
        actionEn = 'High-flow Oxygen protocol. Immediate rush to nearest PHC with oxygen facilities.';
        actionHi = 'उच्च प्रवाह ऑक्सीजन प्रोटोकॉल। तुरंत ऑक्सीजन सुविधा युक्त नजदीकी पीएचसी ले जाएं।';
      } else {
        specialty = 'Emergency Medicine';
        actionEn = 'Emergency clinical intervention required immediately.';
        actionHi = 'तत्काल आपातकालीन चिकित्सीय हस्तक्षेप आवश्यक।';
      }
    } else if (score >= 45) {
      urgency = 'YELLOW';
      urgencyBadge = 'Yellow';
      if (category === 'fever') {
        specialty = 'General Medicine';
        actionEn = 'Perform rapid diagnostic tests (Malaria RDT, Dengue NS1). Paracetamol 650mg & ORS hydration.';
        actionHi = 'मलेरिया व डेंगू आरडीटी जांच करें। पैरासिटामोल ६५०mg एवं ओआरएस घोल दें।';
      } else {
        specialty = 'General Medicine / Specialist';
        actionEn = 'Progressive symptoms requiring clinical teleconsultation within 2 to 4 hours.';
        actionHi = 'मध्यम गंभीरता: २ से ४ घंटे के भीतर विशेषज्ञ डॉक्टर से टेलीपरामर्श आवश्यक।';
      }
    }

    const triageResult = {
      triageType: 'assistive_triage',
      isAssistiveTriage: true,
      isDiagnosis: false,
      disclaimer: 'ASSISTIVE CLINICAL TRIAGE ONLY: This automated evaluation is an assistive clinical decision support tool to prioritize urgency. It is NOT a medical diagnosis. A certified medical practitioner or doctor must evaluate the patient.',
      disclaimerHi: 'केवल सहायक चिकित्सीय ट्रायज (Assistive Triage): यह स्वचालित मूल्यांकन केवल प्राथमिकता और गंभीरता तय करने हेतु एक सहायक प्रणाली है, कोई चिकित्सीय निदान (Diagnosis) नहीं। योग्य डॉक्टर द्वारा जांच आवश्यक है।',
      category: catObj?.label || 'General',
      duration,
      severity,
      description: description || 'Symptom checklist filled by patient / RMP.',
      score,
      urgency,
      urgencyBadge,
      requiresImmediateSos,
      recommendedSpecialty: specialty,
      recommendedAction: actionEn,
      recommendedActionHi: actionHi,
      flagsDetected,
      vitals: {
        bp: `${bpSystolic}/${bpDiastolic} mmHg`,
        pulse: `${pulse} bpm`,
        spo2: `${spo2}%`,
        temp: `${temp} °F`
      }
    };

    onComplete(triageResult);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Assistive Triage Compliance Notice */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1.5px solid #93c5fd',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.08)'
        }}
      >
        <div style={{ color: 'var(--primary-700)', flexShrink: 0 }}>
          <ShieldAlert size={22} />
        </div>
        <div style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.4 }}>
          <strong>{lang === 'hi' ? '⚠️ केवल सहायक ट्रायज (Assistive Triage)' : '⚠️ Assistive Triage Decision Support'}</strong>
          <span style={{ display: 'block', color: '#1e40af', marginTop: '2px' }}>
            {lang === 'hi'
              ? 'यह प्रणाली लक्षणों की गंभीरता और तात्कालिकता तय करने हेतु सहायक है, यह अंतिम चिकित्सीय निदान (Medical Diagnosis) नहीं है।'
              : 'This rule-based engine provides clinical prioritization support only, not a formal medical diagnosis. Certified clinical examination is mandatory.'}
          </span>
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={14} color="var(--primary-600)" />
            {lang === 'hi' ? 'त्वरित परिदृश्य उदाहरण (Quick Presets):' : 'Quick Scenario Presets:'}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => applyPreset('cardiac')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            🫀 {lang === 'hi' ? 'हार्ट अटैक / सीने में दर्द' : 'Acute Chest Pain (Red)'}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('snakebite')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            🐍 {lang === 'hi' ? 'सर्पदंश (Snakebite)' : 'Snakebite (Red)'}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('fever')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            🌡️ {lang === 'hi' ? 'तेज बुखार / ठंड लगना' : 'High Fever / Chills (Yellow)'}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('routine')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            🌿 {lang === 'hi' ? 'सामान्य सर्दी / सिरदर्द' : 'Mild Cold / Routine (Green)'}
          </button>
        </div>
      </div>

      {/* 1. Category Selection */}
      <div>
        <label className="form-label" style={{ marginBottom: '0.65rem', fontSize: '0.9rem' }}>
          <Sparkles size={16} color="var(--primary-600)" />
          {t('symptomCategory')}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.65rem' }}>
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary-600)' : '1.5px solid var(--slate-200)',
                  background: isSelected ? 'var(--primary-50)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(13, 148, 136, 0.15)' : 'none'
                }}
              >
                <div
                  style={{
                    color: isSelected ? 'var(--primary-700)' : 'var(--slate-500)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--primary-900)' : 'var(--slate-700)' }}>
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Duration & Pain Scale */}
      <div className="grid-2">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('howLong')}</label>
          <select
            className="form-select"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="< 1 hour">{lang === 'hi' ? '१ घंटे से कम (तीव्र शुरुआत)' : '< 1 hour (Sudden onset)'}</option>
            <option value="1 - 6 hours">{lang === 'hi' ? '१ से ६ घंटे' : '1 - 6 hours'}</option>
            <option value="1 - 2 days">{lang === 'hi' ? '१ से २ दिन' : '1 - 2 days'}</option>
            <option value="3+ days">{lang === 'hi' ? '३ दिन से अधिक' : '3+ days'}</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">{t('severityLevel')}</label>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: severity >= 8 ? 'var(--emergency-600)' : severity >= 5 ? 'var(--warning-600)' : 'var(--success-600)'
              }}
            >
              {severity} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              accentColor: severity >= 8 ? 'var(--emergency-500)' : 'var(--primary-600)',
              marginTop: '0.35rem'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-400)' }}>
            <span>{lang === 'hi' ? 'हल्का' : 'Mild'}</span>
            <span>{lang === 'hi' ? 'मध्यम' : 'Moderate'}</span>
            <span>{lang === 'hi' ? 'अत्यंत तीव्र' : 'Severe'}</span>
          </div>
        </div>
      </div>

      {/* 3. Red-Flag Checklist */}
      <div
        style={{
          background: '#fff1f2',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid #fecdd3'
        }}
      >
        <label className="form-label" style={{ marginBottom: '0.65rem', color: 'var(--emergency-700)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={16} />
          {lang === 'hi' ? 'महत्वपूर्ण चेतावनी लक्षण (यदि मौजूद हों तो टिक करें):' : 'Emergency Red-Flag Indicators (Check if present):'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', color: '#881337' }}>
            <input
              type="checkbox"
              checked={redFlags.sweatingOrDizziness}
              onChange={() => handleRedFlagChange('sweatingOrDizziness')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emergency-600)' }}
            />
            <span>{lang === 'hi' ? 'पसीना या चक्कर आना' : 'Cold sweating / Dizziness'}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', color: '#881337' }}>
            <input
              type="checkbox"
              checked={redFlags.radiatingToArmJaw}
              onChange={() => handleRedFlagChange('radiatingToArmJaw')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emergency-600)' }}
            />
            <span>{lang === 'hi' ? 'दर्द बांह या जबड़े में जाना' : 'Pain radiating to arm/jaw'}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', color: '#881337' }}>
            <input
              type="checkbox"
              checked={redFlags.lossOfConsciousness}
              onChange={() => handleRedFlagChange('lossOfConsciousness')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emergency-600)' }}
            />
            <span>{lang === 'hi' ? 'बेहोशी / सुस्ती' : 'Loss of consciousness / Fainting'}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', color: '#881337' }}>
            <input
              type="checkbox"
              checked={redFlags.unableToSpeakSentences}
              onChange={() => handleRedFlagChange('unableToSpeakSentences')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emergency-600)' }}
            />
            <span>{lang === 'hi' ? 'बोलने में भारी सांस फूलना' : 'Unable to speak full sentences'}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', color: '#881337' }}>
            <input
              type="checkbox"
              checked={redFlags.venomousBiteSuspected}
              onChange={() => handleRedFlagChange('venomousBiteSuspected')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emergency-600)' }}
            />
            <span>{lang === 'hi' ? 'सर्पदंश / विषैला डंक' : 'Suspected Snakebite / Sting'}</span>
          </label>
        </div>
      </div>

      {/* 4. Free text + Voice Input */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>{t('describeSymptoms')}</label>
          <button
            type="button"
            onClick={handleVoiceInput}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', color: isRecording ? 'var(--emergency-600)' : 'var(--primary-700)', padding: '0.25rem 0.65rem' }}
          >
            <Mic size={14} className={isRecording ? 'pulse-alert' : ''} />
            <span>{isRecording ? (lang === 'hi' ? 'रिकॉर्ड हो रहा है...' : 'Listening...') : t('voiceRecord')}</span>
          </button>
        </div>
        <textarea
          className="form-textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={lang === 'hi' ? 'उदाहरण: सीने में भारीपन, सांस लेने में हल्की कठिनाई, पसीना...' : 'e.g. Sharp pain in chest since morning, feeling breathless while walking, sweating...'}
        />
      </div>

      {/* 5. Vitals (BP, HR, SpO2, Temp) */}
      <div>
        <label className="form-label" style={{ marginBottom: '0.4rem', fontSize: '0.88rem' }}>
          <Activity size={16} color="var(--primary-600)" />
          {t('vitalsOptional')}
        </label>
        <div className="grid-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>BP Systolic (mmHg)</span>
            <input
              type="number"
              className="form-input"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>BP Diastolic (mmHg)</span>
            <input
              type="number"
              className="form-input"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>SpO2 Oxygen (%)</span>
            <input
              type="number"
              className="form-input"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Pulse (bpm)</span>
            <input
              type="number"
              className="form-input"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ marginTop: '0.35rem', fontWeight: 800 }}
      >
        <FileCheck size={20} />
        {t('calculateTriage')}
      </button>
    </form>
  );
};
