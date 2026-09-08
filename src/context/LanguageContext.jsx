import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const DICTIONARY = {
  en: {
    appName: 'JivanSetu',
    appTagline: 'Rural Emergency Triage & Teleconsultation Bridge',
    loginTitle: 'Secure Healthcare Access',
    loginSubtitle: 'Mobile Number & Password Login',
    enterPhone: 'Mobile Number',
    enterPassword: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Sign In to Portal',
    selectRole: 'Select Access Role',
    demoCredentials: 'Demo Access Credentials',
    demoQuickLogin: 'Quick Demo 1-Click Access',
    rolePatient: 'Patient (मरीज़)',
    roleRmp: 'RMP (ग्रामीण चिकित्सक)',
    roleDoctor: 'Specialist Doctor (डॉक्टर)',
    roleAdmin: 'Health Mission Admin (प्रशासक)',
    
    // Navigation
    navDashboard: 'Dashboard',
    navProfile: 'My Health Profile',
    navSymptomCheck: 'Assistive Triage',
    navRecords: 'Health Records',
    navConsults: 'Teleconsult',
    navQueue: 'Patient Queue',
    navEmergencies: 'Live Emergencies',
    navPrescriptions: 'Prescriptions',
    navLogout: 'Sign Out',
    editProfile: 'Manage Health Profile',
    reportIllness: '+ Report Disease / Symptoms',
    chronicHistory: 'Regular Problems & Chronic Conditions',
    diagnosePatient: 'Review Report & Update Diagnosis',
    
    // Emergency & SOS
    sosButton: 'EMERGENCY SOS',
    sosSubtext: '5s Countdown to Dispatch',
    voiceSosTitle: 'Voice Activated SOS',
    voiceSosHelp: 'Say "Help", "Bachao", "Emergency" or "Doctor"',
    listening: 'Listening to your voice...',
    micPermissionError: 'Microphone access is unavailable or blocked.',
    cancelSos: 'CANCEL EMERGENCY',
    sosDispatchedTitle: '🚨 Emergency Alert Active!',
    sosDispatchedMsg: 'Immediate alert sent to nearest RMP and emergency helpline.',
    rmpAssigned: 'Assigned Responder',
    distanceAway: 'distance away',
    etaArrival: 'Est. Arrival: 6 mins',
    
    // Triage
    triageTitle: 'AI Assistive Clinical Triage',
    triageSubtitle: 'Clinical urgency prioritization support • Not a medical diagnosis',
    symptomCategory: 'Primary Symptom Category',
    chestPain: 'Chest Pain / Heart Pressure',
    breathing: 'Breathing Difficulty / Asthma',
    fever: 'High Fever / Infection',
    injury: 'Accident / Severe Trauma / Bleeding',
    maternal: 'Maternal / Pregnancy Complication',
    otherSymptom: 'Other Health Complaint',
    howLong: 'How long have symptoms lasted?',
    severityLevel: 'Pain / Discomfort Intensity (1 to 10)',
    describeSymptoms: 'Describe what you are feeling in words or voice',
    voiceRecord: 'Speak Symptoms (Hindi/English)',
    vitalsOptional: 'Vitals (if measured by thermometer/BP cuff)',
    bp: 'Blood Pressure',
    heartRate: 'Pulse / Heart Rate (bpm)',
    spo2: 'SpO2 Oxygen (%)',
    temp: 'Temperature (°F)',
    calculateTriage: 'Run AI Urgency Assessment',
    
    // Triage Urgency Levels
    urgencyRed: 'RED — EMERGENCY (CRITICAL)',
    urgencyYellow: 'YELLOW — URGENT MEDICAL ATTENTION',
    urgencyGreen: 'GREEN — ROUTINE / HOME CARE',
    escalateDoctor: 'Escalate to Specialist Doctor',
    dispatchRmp: 'Request Immediate RMP Field Visit',
    startTeleconsult: 'Enter Video Teleconsult Room',
    
    // Teleconsult Room
    consultRoomTitle: 'Doctor-Patient Video Teleconsult',
    doctorConnected: 'Connected with',
    camOn: 'Camera On',
    camOff: 'Camera Off',
    micOn: 'Mic On',
    micOff: 'Mute',
    endCall: 'End Consultation',
    chatTitle: 'Consultation Live Notes & Chat',
    typeMessage: 'Type clinical note or message...',
    send: 'Send',
    issuePrescription: 'Generate Digital Prescription',
    
    // Prescriptions
    prescriptionTitle: 'Digital Prescription (ई-पर्चा)',
    doctorRegNo: 'MCI Reg. No.',
    patientDetails: 'Patient Information',
    rxMedicines: 'Prescribed Medications & Dosage',
    medName: 'Medicine Name',
    dosage: 'Dosage',
    timings: 'Timing',
    duration: 'Duration',
    instructions: 'Special Advice',
    dietLifestyle: 'Dietary & Lifestyle Advice',
    printRx: 'Print / Save PDF Prescription',
    
    // Records Timeline
    recordHistoryTitle: 'Chronological Health History',
    allRecords: 'All Records',
    vitalsSummary: 'Vitals Summary',
    doctorRemarks: 'Doctor Notes & Diagnosis',
    
    // Admin
    systemStatus: 'National Telemedicine Gateway Active',
    totalTriage: 'Total Triage Consults',
    activeEmergencies: 'Active Red Alerts',
    registeredProviders: 'On-Duty RMPs & Specialists'
  },
  hi: {
    appName: 'जीवनसेतु',
    appTagline: 'ग्रामीण आपातकालीन ट्रायज एवं टेलीपरामर्श सेतु',
    loginTitle: 'सुरक्षित स्वास्थ्य पोर्टल',
    loginSubtitle: 'मोबाइल नंबर एवं पासवर्ड द्वारा लॉगिन',
    enterPhone: 'मोबाइल नंबर',
    enterPassword: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    loginButton: 'पोर्टल में प्रवेश करें',
    selectRole: 'प्रवेश का रोल चुनें',
    demoCredentials: 'डेमो लॉगिन विवरण (Credentials)',
    demoQuickLogin: '1-क्लिक त्वरित डेमो प्रवेश',
    rolePatient: 'मरीज़ (Patient)',
    roleRmp: 'ग्रामीण चिकित्सक (RMP)',
    roleDoctor: 'विशेषज्ञ डॉक्टर (Specialist)',
    roleAdmin: 'स्वास्थ्य मिशन प्रशासक (Admin)',
    
    // Navigation
    navDashboard: 'डैशबोर्ड',
    navProfile: 'मेरी स्वास्थ्य प्रोफाइल',
    navSymptomCheck: 'सहायक ट्रायज (Assistive Triage)',
    navRecords: 'स्वास्थ्य रिकॉर्ड्स',
    navConsults: 'टेलीपरामर्श',
    navQueue: 'मरीज़ कतार',
    navEmergencies: 'लाइव आपातकाल',
    navPrescriptions: 'दवा पर्चे',
    navLogout: 'लॉग आउट',
    editProfile: 'स्वास्थ्य प्रोफाइल बदलें',
    reportIllness: '+ नया रोग / लक्षण दर्ज करें',
    chronicHistory: 'नियमित व पुरानी बीमारियां',
    diagnosePatient: 'रिपोर्ट जांचें व रोग निदान करें',
    
    // Emergency & SOS
    sosButton: 'आपातकालीन SOS',
    sosSubtext: '५ सेकंड में तुरंत अलर्ट भेजें',
    voiceSosTitle: 'ध्वनि सक्रिय SOS (बोलकर मदद)',
    voiceSosHelp: '"बचाओ", "Help", "इमरजेंसी" या "डॉक्टर" बोलें',
    listening: 'आपकी आवाज़ सुन रहे हैं...',
    micPermissionError: 'माइक्रोफ़ोन अनुमति उपलब्ध नहीं है।',
    cancelSos: 'आपातकाल रद्द करें',
    sosDispatchedTitle: '🚨 आपातकालीन अलर्ट सक्रिय!',
    sosDispatchedMsg: 'निकटतम आरएमपी एवं आपातकालीन दल को संदेश भेज दिया गया है।',
    rmpAssigned: 'नियुक्त स्वास्थ्य कर्मी',
    distanceAway: 'की दूरी पर',
    etaArrival: 'पहुंचने का अनुमान: ६ मिनट',
    
    // Triage
    triageTitle: 'एआई सहायक क्लिनिकल ट्रायज (Assistive Triage)',
    triageSubtitle: 'गंभीरता व प्राथमिकता निर्णय समर्थन • यह कोई चिकित्सीय निदान नहीं है',
    symptomCategory: 'मुख्य लक्षण श्रेणी',
    chestPain: 'सीने में दर्द / भारीपन',
    breathing: 'सांस लेने में तकलीफ / दमा',
    fever: 'तेज़ बुखार / संक्रमण',
    injury: 'दुर्घटना / गंभीर चोट / रक्तस्राव',
    maternal: 'मातृत्व / गर्भावस्था संबंधी समस्या',
    otherSymptom: 'अन्य स्वास्थ्य समस्या',
    howLong: 'लक्षण कितने समय से हैं?',
    severityLevel: 'दर्द / परेशानी की तीव्रता (१ से १०)',
    describeSymptoms: 'अपनी परेशानी लिखकर या बोलकर बताएं',
    voiceRecord: 'बोलकर बताएं (हिंदी/अंग्रेजी)',
    vitalsOptional: 'वाइटल्स (यदि मापे गए हों)',
    bp: 'रक्तचाप (BP)',
    heartRate: 'नाड़ी गति (Pulse bpm)',
    spo2: 'ऑक्सीजन (SpO2 %)',
    temp: 'तापमान (°F)',
    calculateTriage: 'एआई गंभीरता स्तर जांचें',
    
    // Triage Urgency Levels
    urgencyRed: 'लाल — अत्यंत गंभीर (तत्काल आपातकाल)',
    urgencyYellow: 'पीला — त्वरित चिकित्सीय सलाह आवश्यक',
    urgencyGreen: 'हरा — सामान्य परामर्श / घरेलू देखभाल',
    escalateDoctor: 'विशेषज्ञ डॉक्टर को भेजें',
    dispatchRmp: 'आरएमपी को घर पर बुलाएं',
    startTeleconsult: 'वीडियो टेलीपरामर्श कक्ष में जाएं',
    
    // Teleconsult Room
    consultRoomTitle: 'डॉक्टर-मरीज़ वीडियो टेलीपरामर्श',
    doctorConnected: 'संबद्ध डॉक्टर',
    camOn: 'कैमरा चालू',
    camOff: 'कैमरा बंद',
    micOn: 'माइक चालू',
    micOff: 'माइक म्यूट',
    endCall: 'परामर्श समाप्त करें',
    chatTitle: 'परामर्श लाइव संदेश व नोट्स',
    typeMessage: 'संदेश या परामर्श टिप्पणी लिखें...',
    send: 'भेजें',
    issuePrescription: 'डिजिटल दवा पर्चा बनाएं',
    
    // Prescriptions
    prescriptionTitle: 'डिजिटल मेडिकल प्रिस्क्रिप्शन (ई-पर्चा)',
    doctorRegNo: 'एमसीआई पंजीकरण सं.',
    patientDetails: 'मरीज़ का विवरण',
    rxMedicines: 'निर्धारित दवाइयां एवं खुराक',
    medName: 'दवा का नाम',
    dosage: 'मात्रा',
    timings: 'समय',
    duration: 'अवधि',
    instructions: 'विशेष सलाह',
    dietLifestyle: 'आहार एवं दिनचर्या सलाह',
    printRx: 'दवा पर्चा प्रिंट / सेव करें',
    
    // Records Timeline
    recordHistoryTitle: 'स्वास्थ्य इतिहास (क्रमानुसार)',
    allRecords: 'सभी रिकॉर्ड्स',
    vitalsSummary: 'वाइटल्स सारांश',
    doctorRemarks: 'डॉक्टर की सलाह एवं निदान',
    
    // Admin
    systemStatus: 'राष्ट्रीय टेलीमेडिसिन गेटवे सक्रिय',
    totalTriage: 'कुल ट्रायज परामर्श',
    activeEmergencies: 'सक्रिय रेड अलर्ट',
    registeredProviders: 'ड्यूटी पर तैनात आरएमपी व विशेषज्ञ'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('jivansetu_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('jivansetu_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return DICTIONARY[lang]?.[key] || DICTIONARY['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
