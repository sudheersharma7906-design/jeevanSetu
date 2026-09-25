// Mock Medical & Emergency Data for JivanSetu

export const MOCK_USERS = {
  patient: {
    id: 'pat-101',
    name: 'Rameshwar Sharma',
    nameHi: 'रामेश्वर शर्मा',
    age: 54,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    village: 'Rampur Kalan, Dist. Sitapur',
    villageHi: 'रामपुर कलां, जिला सीतापुर',
    role: 'patient',
    abhaId: '91-4821-3920-1092',
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    chronicConditionsHi: ['टाइप 2 मधुमेह', 'उच्च रक्तचाप'],
    allergies: ['Penicillin'],
    allergiesHi: ['पेनिसिलिन'],
    emergencyContact: '+91 98765 00001 (Son - Amit)',
    lat: 27.5644,
    lng: 80.6829
  },
  rmp: {
    id: 'rmp-201',
    name: 'Dr. (RMP) Anand Verma',
    nameHi: 'डॉ. (आरएमपी) आनंद वर्मा',
    role: 'rmp',
    registrationNo: 'UP-RMP-8834',
    phone: '+91 94150 11223',
    centerName: 'Sitapur Rural Health Post #4',
    centerNameHi: 'सीतापुर ग्रामीण स्वास्थ्य केंद्र #४',
    village: 'Sitapur Block C',
    villageHi: 'सीतापुर ब्लॉक सी',
    distanceToPatientKm: 2.4,
    lat: 27.5750,
    lng: 80.6950,
    status: 'Available / On Duty'
  },
  doctor: {
    id: 'doc-301',
    name: 'Dr. Priya Nambiar (MD, Cardiology)',
    nameHi: 'डॉ. प्रिया नंबियार (एमडी, हृदय रोग विशेषज्ञ)',
    role: 'doctor',
    regNo: 'MCI-2014-9921',
    phone: '+91 98112 33445',
    hospital: 'District Hospital, Lucknow / Tele-Specialist Hub',
    hospitalHi: 'जिला अस्पताल, लखनऊ / टेली-विशेषज्ञ केंद्र',
    specialty: 'Cardiology & Emergency Medicine',
    status: 'Online & Available for Teleconsult'
  },
  admin: {
    id: 'adm-401',
    name: 'Govt. Health Mission Officer - Rajesh Gupta',
    nameHi: 'स्वास्थ्य मिशन अधिकारी - राजेश गुप्ता',
    role: 'admin',
    phone: '+91 99000 88776',
    department: 'National Rural Telemedicine Command Center'
  }
};

export const INITIAL_HEALTH_RECORDS = [
  {
    id: 'rec-001',
    date: '2026-08-10',
    title: 'Hypertension Follow-up & Vitals Check',
    titleHi: 'उच्च रक्तचाप अनुवर्ती व वाइटल्स जांच',
    doctor: 'Dr. Priya Nambiar',
    rmp: 'Dr. Anand Verma',
    vitals: { bp: '138/88 mmHg', pulse: '76 bpm', spo2: '98%', temp: '98.4 °F' },
    notes: 'Patient reported mild evening fatigue. Advised reduced dietary sodium and regular morning walk.',
    notesHi: 'मरीज ने शाम को हल्का थकान बताया। नमक कम करने और नियमित सुबह टहलने की सलाह दी गई।',
    prescriptions: [
      { medicine: 'Amlodipine 5mg', dosage: '1 Tab Daily Morning', duration: '30 Days' },
      { medicine: 'Metformin 500mg', dosage: '1 Tab Twice Daily after meals', duration: '30 Days' }
    ]
  },
  {
    id: 'rec-002',
    date: '2026-07-22',
    title: 'Acute Bronchitis / Seasonal Cough',
    titleHi: 'तीव्र ब्रोंकाइटिस / मौसमी खांसी',
    doctor: 'Dr. Sanjay Mehrotra',
    rmp: 'Dr. Anand Verma',
    vitals: { bp: '124/80 mmHg', pulse: '82 bpm', spo2: '96%', temp: '100.2 °F' },
    notes: 'Wheezing in right lower lung field. Treated with bronchodilator & steam inhalation.',
    notesHi: 'दाहिने फेफड़े में घरघराहट। ब्रोंकोडायलेटर और भाप लेने से सुधार हुआ।',
    prescriptions: [
      { medicine: 'Levocetirizine + Montelukast', dosage: '1 Tab Nightly', duration: '7 Days' },
      { medicine: 'Azithromycin 500mg', dosage: '1 Tab Daily', duration: '3 Days' }
    ]
  },
  {
    id: 'rec-003',
    date: '2026-05-14',
    title: 'Annual Blood Glucose & HbA1c Lab Report',
    titleHi: 'वार्षिक रक्त शर्करा एवं एचबीए1सी रिपोर्ट',
    doctor: 'Pathology Lab Sitapur',
    rmp: 'Dr. Anand Verma',
    vitals: { fbs: '128 mg/dL', ppbs: '172 mg/dL', hba1c: '6.8%' },
    notes: 'Glycemic control fair. Continued current oral hypoglycemic regimen.',
    notesHi: 'रक्त शर्करा नियंत्रण सामान्य। वर्तमान दवाएं जारी रखें।'
  }
];

export const INITIAL_PRESCRIPTIONS = [
  {
    id: 'rx-2026-881',
    date: '10 Aug 2026',
    doctorName: 'Dr. Priya Nambiar',
    doctorReg: 'MCI-2014-9921',
    specialty: 'Cardiologist & General Physician',
    patientName: 'Rameshwar Sharma',
    patientAge: 54,
    patientGender: 'Male',
    diagnosis: 'Essential Hypertension & Mild Type 2 Diabetes Mellitus',
    diagnosisHi: 'उच्च रक्तचाप एवं नियंत्रित मधुमेह',
    vitals: 'BP: 138/88 | HR: 76 bpm | SpO2: 98%',
    medicines: [
      {
        name: 'Tab. Amlodipine 5mg',
        dosage: '1 tablet once daily',
        timing: 'Morning after breakfast (नाश्ते के बाद)',
        duration: '30 Days',
        instructions: 'Do not miss dosage. Monitor BP weekly.'
      },
      {
        name: 'Tab. Metformin 500mg (SR)',
        dosage: '1 tablet twice daily',
        timing: 'After lunch and dinner (दोपहर व रात भोजन के बाद)',
        duration: '30 Days',
        instructions: 'Take with a glass of water.'
      },
      {
        name: 'Cap. Multivitamin & Zinc',
        dosage: '1 capsule daily',
        timing: 'Afternoon',
        duration: '15 Days',
        instructions: 'General immunity support.'
      }
    ],
    dietAdvice: 'Low sodium salt diet, limit oily food, 30 min brisk walk every morning.',
    dietAdviceHi: 'कम नमक वाला आहार लें, तला-भुना कम करें, प्रतिदिन 30 मिनट टहलें।',
    nextFollowup: '10 Sep 2026'
  }
];

export const INITIAL_EMERGENCIES = [
  {
    id: 'sos-901',
    patientId: 'pat-101',
    patientName: 'Rameshwar Sharma',
    patientPhone: '+91 98765 43210',
    age: 54,
    gender: 'Male',
    location: 'Wada Rural Center, Palghar',
    coordinates: { lat: 19.6542, lng: 73.1389 },
    triggerType: 'Voice SOS ("Bachao / Seene me dard")',
    urgency: 'RED',
    status: 'DISPATCHED',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    assignedRmp: 'Dr. Anand Verma',
    chiefComplaint: 'Severe radiating chest pain + breathing shortness',
    vitals: { bp: '158/102', pulse: '110 bpm', spo2: '92%' }
  }
];

export const INITIAL_DOCTOR_QUEUE = [
  {
    id: 'triage-801',
    patientId: 'pat-101',
    patientName: 'Rameshwar Sharma',
    age: 54,
    urgency: 'RED',
    score: 92,
    reason: 'Possible Acute Coronary Syndrome with hypoxia (SpO2 92%)',
    reasonHi: 'संभावित तीव्र हृदय रोग (SpO2 92%)',
    reportedAt: '5 mins ago',
    rmpNotes: 'Patient experiencing crushing retrosternal chest pain for 45 mins. Aspirin 300mg administered by RMP.',
    vitals: { bp: '158/102', pulse: '110 bpm', spo2: '92%', temp: '98.6 °F' },
    status: 'PENDING_CONSULT'
  },
  {
    id: 'triage-802',
    patientId: 'pat-102',
    patientName: 'Sunita Devi',
    age: 36,
    urgency: 'YELLOW',
    score: 64,
    reason: 'High grade fever with severe abdominal cramps (Day 3)',
    reasonHi: 'तीव्र बुखार एवं पेट में गंभीर दर्द (तीसरा दिन)',
    reportedAt: '22 mins ago',
    rmpNotes: 'Suspected acute gastroenteritis / viral fever. Dehydration level moderate.',
    vitals: { bp: '110/72', pulse: '94 bpm', spo2: '97%', temp: '102.4 °F' },
    status: 'WAITING'
  },
  {
    id: 'triage-803',
    patientId: 'pat-103',
    patientName: 'Kallu Ram',
    age: 62,
    urgency: 'GREEN',
    score: 25,
    reason: 'Chronic osteoarthritis knee joint pain prescription renewal',
    reasonHi: 'घुटने के पुराने दर्द की दवा का नवीनीकरण',
    reportedAt: '1 hour ago',
    rmpNotes: 'Routine checkup, vitals completely stable.',
    vitals: { bp: '126/82', pulse: '72 bpm', spo2: '98%', temp: '98.2 °F' },
    status: 'SCHEDULED'
  }
];
