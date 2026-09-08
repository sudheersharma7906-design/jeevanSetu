// server/data/seeds.js
import bcrypt from 'bcryptjs';
import { ROLES, TRIAGE_LEVELS, EMERGENCY_STATUS, CONSULT_STATUS } from '../config/constants.js';

export const initialUsers = [
  // Patients
  {
    id: 'pat-101',
    phone: '9876543210',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Rameshwar Patil (रामेश्वर पाटिल)',
    role: ROLES.PATIENT,
    age: 54,
    gender: 'Male',
    bloodGroup: 'B+',
    abhaId: 'ABHA-9821-4451-9012',
    village: 'Wada Rural, Palghar',
    district: 'Palghar',
    state: 'Maharashtra',
    emergencyContact: {
      name: 'Sunita Patil (Wife)',
      phone: '9876543211',
      relation: 'Spouse'
    },
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    location: {
      latitude: 19.6542,
      longitude: 73.1389,
      address: 'Near Gram Panchayat, Wada, Palghar'
    },
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'pat-102',
    phone: '9876543220',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Kavita Devi (कविता देवी)',
    role: ROLES.PATIENT,
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    abhaId: 'ABHA-7731-1029-4412',
    village: 'Vikramgad, Palghar',
    district: 'Palghar',
    state: 'Maharashtra',
    emergencyContact: {
      name: 'Manoj Devi (Husband)',
      phone: '9876543221',
      relation: 'Spouse'
    },
    allergies: ['None known'],
    chronicConditions: ['Pregnancy (2nd Trimester)'],
    location: {
      latitude: 19.7972,
      longitude: 73.0944,
      address: 'House 42, Vikramgad Tribal Block, Palghar'
    },
    createdAt: '2026-02-01T08:30:00Z'
  },
  {
    id: 'pat-103',
    phone: '9876543230',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Bablu Gond (बबलू गोंड)',
    role: ROLES.PATIENT,
    age: 12,
    gender: 'Male',
    bloodGroup: 'A+',
    abhaId: 'ABHA-3312-8874-5501',
    village: 'Jawhar Hill Village',
    district: 'Palghar',
    state: 'Maharashtra',
    emergencyContact: {
      name: 'Suresh Gond (Father)',
      phone: '9876543231',
      relation: 'Parent'
    },
    allergies: ['Dust / Pollen'],
    chronicConditions: ['Asthma history'],
    location: {
      latitude: 19.9142,
      longitude: 73.2325,
      address: 'Zilla Parishad School Lane, Jawhar'
    },
    createdAt: '2026-03-05T14:15:00Z'
  },

  // Rural Medical Practitioners (RMPs)
  {
    id: 'rmp-201',
    phone: '9876543301',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Dr. (RMP) Anand Deshmukh (आनंद देशमुख)',
    role: ROLES.RMP,
    regNumber: 'MH-RMP-2018-8841',
    clinicName: 'Deshmukh Arogya Kendra (Wada)',
    experienceYears: 12,
    qualifications: ['BEMS', 'Rural Health Training Cert (Govt MH)'],
    status: 'ONLINE', // ONLINE, BUSY, OFFLINE
    rating: 4.8,
    totalConsults: 1420,
    emergencyTrained: true,
    location: {
      latitude: 19.6580,
      longitude: 73.1420,
      address: 'Main Market Rd, Wada, Palghar'
    },
    createdAt: '2025-11-15T09:00:00Z'
  },
  {
    id: 'rmp-202',
    phone: '9876543302',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Dr. (RMP) Savitri Waghmare (सावित्री वाघमारे)',
    role: ROLES.RMP,
    regNumber: 'MH-RMP-2020-3319',
    clinicName: 'Seva Sadan Clinic (Vikramgad)',
    experienceYears: 8,
    qualifications: ['DHMS', 'First-Responder Cert'],
    status: 'ONLINE',
    rating: 4.9,
    totalConsults: 980,
    emergencyTrained: true,
    location: {
      latitude: 19.8010,
      longitude: 73.0980,
      address: 'Opposite Sub-District Hospital, Vikramgad'
    },
    createdAt: '2025-12-01T11:00:00Z'
  },
  {
    id: 'rmp-203',
    phone: '9876543303',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Dr. (RMP) Kailash Rathod (कैलाश राठौड़)',
    role: ROLES.RMP,
    regNumber: 'MH-RMP-2016-1290',
    clinicName: 'Rathod First Care (Jawhar)',
    experienceYears: 15,
    qualifications: ['BAMS Rural', 'Trauma Triage Cert'],
    status: 'ONLINE',
    rating: 4.7,
    totalConsults: 2150,
    emergencyTrained: true,
    location: {
      latitude: 19.9180,
      longitude: 73.2350,
      address: 'Jawhar Fort Road, Palghar'
    },
    createdAt: '2025-08-20T08:00:00Z'
  },

  // Specialist Doctors (Hub Telemedicine Hospital)
  {
    id: 'doc-301',
    phone: '9876543401',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Dr. Priya Sharma, MD (Cardiology)',
    role: ROLES.DOCTOR,
    regNumber: 'MCI-MH-44291',
    hospital: 'District Multi-Specialty Hospital & Telemed Hub, Thane',
    specialty: 'Cardiology',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology) - AIIMS'],
    experienceYears: 14,
    status: 'AVAILABLE', // AVAILABLE, IN_CONSULT, AWAY
    rating: 4.95,
    languages: ['English', 'Hindi', 'Marathi'],
    createdAt: '2025-10-01T09:00:00Z'
  },
  {
    id: 'doc-302',
    phone: '9876543402',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Dr. Rajesh Kulkarni, MD (Pediatrics & Pulmonology)',
    role: ROLES.DOCTOR,
    regNumber: 'MCI-MH-19882',
    hospital: 'KEM Telemedicine Wing, Mumbai',
    specialty: 'Pediatrics',
    qualifications: ['MBBS', 'MD (Pediatrics)', 'Fellowship in Pediatric Pulmonology'],
    experienceYears: 16,
    status: 'AVAILABLE',
    rating: 4.9,
    languages: ['English', 'Hindi', 'Marathi', 'Gujarati'],
    createdAt: '2025-10-15T10:00:00Z'
  },
  {
    id: 'doc-303',
    phone: '9876543403',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Dr. Neha Verma, MS (OB/GYN)',
    role: ROLES.DOCTOR,
    regNumber: 'MCI-MH-67123',
    hospital: 'Maternal & Child Hub Hospital, Nashik',
    specialty: 'Gynecology & Obstetrics',
    qualifications: ['MBBS', 'MS (OBG)', 'DNB'],
    experienceYears: 11,
    status: 'AVAILABLE',
    rating: 4.88,
    languages: ['English', 'Hindi'],
    createdAt: '2025-11-01T10:00:00Z'
  },

  // Admin
  {
    id: 'adm-001',
    phone: '9876543999',
    password: 'DemoPass@123',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    name: 'Sanjeev Nair (District Health Officer / Admin)',
    role: ROLES.ADMIN,
    department: 'National Rural Health Mission - Maharashtra',
    email: 'admin@jivansetu.gov.in',
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const initialRecords = [
  {
    id: 'rec-1001',
    patientId: 'pat-101',
    timestamp: '2026-02-10T11:20:00Z',
    type: 'Vitals & Checkup',
    title: 'Routine Blood Pressure & Sugar Monitoring',
    doctorOrRmpName: 'Dr. (RMP) Anand Deshmukh',
    facility: 'Deshmukh Arogya Kendra, Wada',
    details: {
      bp: '138/88 mmHg',
      pulse: '76 bpm',
      randomBloodSugar: '142 mg/dL',
      spo2: '98%',
      temperature: '98.4 F',
      weight: '68 kg'
    },
    notes: 'Patient adhering to dietary restrictions. Mild hypertensive fluctuation. Continued Metformin 500mg.',
    attachments: []
  },
  {
    id: 'rec-1002',
    patientId: 'pat-101',
    timestamp: '2026-02-28T14:40:00Z',
    type: 'Teleconsultation',
    title: 'Cardiology Follow-up for Exertional Dyspnea',
    doctorOrRmpName: 'Dr. Priya Sharma (Cardiologist) via RMP Anand Deshmukh',
    facility: 'JivanSetu Telemedicine Hub',
    details: {
      diagnosis: 'Stable Angina / Mild Exertional Chest Tightness',
      ecgSummary: 'Normal sinus rhythm, minor ST flattening in V4-V6',
      bp: '142/90 mmHg'
    },
    notes: 'Prescribed Sorbitrate SOS and Telmisartan adjustment. Advised lipid panel test.',
    attachments: ['ecg_lead12_feb2026.pdf']
  },
  {
    id: 'rec-1003',
    patientId: 'pat-102',
    timestamp: '2026-02-15T09:30:00Z',
    type: 'Antenatal Checkup',
    title: '2nd Trimester ANC Ultrasound & Hemoglobin Screening',
    doctorOrRmpName: 'Dr. Neha Verma via RMP Savitri Waghmare',
    facility: 'Vikramgad Sub-Center',
    details: {
      gestationalAge: '22 weeks',
      fetalHeartRate: '144 bpm',
      hb: '10.8 g/dL',
      fundalHeight: '21 cm',
      bp: '110/72 mmHg'
    },
    notes: 'Fetal growth on track. Prescribed Iron Folic Acid (IFA) & Calcium supplements.',
    attachments: ['anc_scan_report_wk22.pdf']
  }
];

export const initialPrescriptions = [
  {
    id: 'rx-501',
    consultationId: 'con-801',
    patientId: 'pat-101',
    patientName: 'Rameshwar Patil',
    doctorId: 'doc-301',
    doctorName: 'Dr. Priya Sharma, MD (Cardiology)',
    doctorRegNo: 'MCI-MH-44291',
    hospitalName: 'District Telemedicine Hub, Thane',
    date: '2026-02-28',
    diagnosis: 'Mild Exertional Angina & Essential Hypertension',
    vitals: { bp: '142/90', pulse: '76 bpm', spo2: '98%' },
    medications: [
      {
        name: 'Tab. Telmisartan',
        dosage: '40 mg',
        frequency: 'Once Daily (Morning after food)',
        duration: '30 Days',
        instructions: 'Do not skip dose. Monitor BP weekly at local RMP center.'
      },
      {
        name: 'Tab. Sorbitrate (Isosorbide Dinitrate)',
        dosage: '5 mg',
        frequency: 'Sublingual SOS (Under tongue if chest pain occurs)',
        duration: '10 Tablets',
        instructions: 'Rest immediately. Place under tongue. If pain exceeds 10 mins, trigger JivanSetu SOS.'
      },
      {
        name: 'Tab. Metformin',
        dosage: '500 mg',
        frequency: 'Twice Daily (Morning & Night with meals)',
        duration: '30 Days',
        instructions: 'Maintain low carbohydrate diet.'
      }
    ],
    dietaryAdvice: 'Low sodium (< 3g/day), avoid fried food, daily 20-min gentle walk.',
    followUpDate: '2026-03-30',
    digitalSignature: 'SIG_SHA256_e49b8a371c904fa87129cd8a1',
    verified: true,
    createdAt: '2026-02-28T15:00:00Z'
  }
];

export const initialConsultQueue = [
  {
    id: 'con-802',
    patientId: 'pat-103',
    patientName: 'Bablu Gond (12/M)',
    rmpId: 'rmp-203',
    rmpName: 'Dr. (RMP) Kailash Rathod',
    targetSpecialty: 'Pediatrics',
    assignedDoctorId: 'doc-302',
    urgency: TRIAGE_LEVELS.URGENT,
    symptoms: 'Wheezing, nocturnal dry cough for 5 days, mild chest indrawing',
    vitals: { spo2: '94%', temp: '100.2 F', respiratoryRate: '28/min' },
    status: CONSULT_STATUS.QUEUED,
    notes: 'Child having recurrent seasonal asthma exacerbation. Needs pediatric nebulization protocol.',
    createdAt: '2026-08-15T20:10:00Z'
  },
  {
    id: 'con-803',
    patientId: 'pat-102',
    patientName: 'Kavita Devi (28/F)',
    rmpId: 'rmp-202',
    rmpName: 'Dr. (RMP) Savitri Waghmare',
    targetSpecialty: 'Gynecology & Obstetrics',
    assignedDoctorId: 'doc-303',
    urgency: TRIAGE_LEVELS.ROUTINE,
    symptoms: 'Mild pedal edema, request for trimester dietary counseling',
    vitals: { bp: '114/76', hb: '11.1 g/dL' },
    status: CONSULT_STATUS.QUEUED,
    notes: 'Routine 24th-week checkup review.',
    createdAt: '2026-08-15T20:45:00Z'
  }
];

export const initialEmergencies = [
  {
    id: 'sos-701',
    patientId: 'pat-101',
    patientName: 'Rameshwar Patil',
    patientPhone: '9876543210',
    triggerType: 'BUTTON', // BUTTON or VOICE
    voiceTranscript: '',
    symptomsReported: 'Severe crushing chest pain radiating to left jaw, heavy sweating',
    location: {
      latitude: 19.6542,
      longitude: 73.1389,
      address: 'Near Gram Panchayat, Wada, Palghar'
    },
    matchedRmp: {
      id: 'rmp-201',
      name: 'Dr. (RMP) Anand Deshmukh',
      phone: '9876543301',
      distanceKm: 0.54,
      clinicName: 'Deshmukh Arogya Kendra'
    },
    status: EMERGENCY_STATUS.RESOLVED,
    tier: 1, // 1: Local RMP, 2: Secondary PHC / Doctor, 3: 108 Emergency Ambulance
    timeline: [
      { status: EMERGENCY_STATUS.TRIGGERED, time: '2026-02-20T06:15:00Z', note: 'SOS pressed from patient smartphone' },
      { status: EMERGENCY_STATUS.NOTIFIED, time: '2026-02-20T06:15:02Z', note: 'Nearest RMP Dr. Anand Deshmukh (0.54 km) alerted' },
      { status: EMERGENCY_STATUS.ACCEPTED, time: '2026-02-20T06:15:22Z', note: 'RMP accepted emergency with first-aid kit' },
      { status: EMERGENCY_STATUS.ARRIVED, time: '2026-02-20T06:21:00Z', note: 'RMP arrived at patient residence. Sublingual Nitrate administered.' },
      { status: EMERGENCY_STATUS.RESOLVED, time: '2026-02-20T06:45:00Z', note: 'Patient stabilized and safely transported to Taluka Hospital.' }
    ],
    createdAt: '2026-02-20T06:15:00Z',
    resolvedAt: '2026-02-20T06:45:00Z'
  }
];

export const triageClinicalRules = {
  redFlags: [
    {
      keywords: ['chest pain', 'chest tightness', 'left arm pain', 'सीने में दर्द', 'छाती में दर्द', 'हार्ट अटैक'],
      scoreDelta: 90,
      urgency: TRIAGE_LEVELS.EMERGENCY,
      specialty: 'Cardiology',
      action: 'Immediate SOS dispatch & Aspirin 300mg + Sorbitrate if prescribed'
    },
    {
      keywords: ['difficulty breathing', 'breathless', 'gasping', 'सांस लेने में तकलीफ', 'दम फूलना', 'दम घुटना'],
      scoreDelta: 85,
      urgency: TRIAGE_LEVELS.EMERGENCY,
      specialty: 'Pulmonology',
      action: 'High-flow Oxygen protocol & immediate transport to nearest PHC'
    },
    {
      keywords: ['snakebite', 'snake bite', 'सांप का काटना', 'सर्पदंश'],
      scoreDelta: 95,
      urgency: TRIAGE_LEVELS.EMERGENCY,
      specialty: 'Emergency Medicine',
      action: 'Immobilize limb, DO NOT cut/tourniquet, immediate Anti-Snake Venom (ASV) center rush'
    },
    {
      keywords: ['unconscious', 'fainting', 'coma', 'बेहोश', 'अचेत'],
      scoreDelta: 90,
      urgency: TRIAGE_LEVELS.EMERGENCY,
      specialty: 'Neurology / Critical Care',
      action: 'Recovery position, clear airway, check blood glucose immediately'
    },
    {
      keywords: ['severe bleeding', 'hemorrhage', 'खून बहना', 'अत्यधिक रक्तस्राव'],
      scoreDelta: 88,
      urgency: TRIAGE_LEVELS.EMERGENCY,
      specialty: 'Trauma Care',
      action: 'Apply firm direct pressure with clean gauze, elevate wound, alert nearest RMP'
    },
    {
      keywords: ['seizure', 'convulsion', 'fits', 'दौरे', 'मिर्गी'],
      scoreDelta: 86,
      urgency: TRIAGE_LEVELS.EMERGENCY,
      specialty: 'Neurology',
      action: 'Protect head from injury, turn on side, do not put objects in mouth'
    }
  ],
  moderateFlags: [
    {
      keywords: ['high fever', 'chills', 'rigors', 'तेज बुखार', 'कंपकंपी'],
      scoreDelta: 55,
      urgency: TRIAGE_LEVELS.URGENT,
      specialty: 'General Medicine',
      action: 'Paracetamol 650mg, Cold sponging, Malaria & Dengue Rapid Diagnostic Test (RDT)'
    },
    {
      keywords: ['severe stomach pain', 'acute abdominal pain', 'पेट में बहुत तेज दर्द', 'उल्टी'],
      scoreDelta: 60,
      urgency: TRIAGE_LEVELS.URGENT,
      specialty: 'Gastroenterology / General Surgery',
      action: 'Evaluate for Acute Appendicitis / Cholecystitis. Fasting state recommended.'
    },
    {
      keywords: ['pregnancy pain', 'bleeding in pregnancy', 'गर्भावस्था में दर्द', 'रक्तस्राव'],
      scoreDelta: 75,
      urgency: TRIAGE_LEVELS.URGENT,
      specialty: 'Gynecology & Obstetrics',
      action: 'Emergency Antenatal checkup, fetal heart monitoring, obstetrician consult'
    },
    {
      keywords: ['wheezing in child', 'persistent pediatric cough', 'बच्चे की छाती बजना', 'खांसी'],
      scoreDelta: 65,
      urgency: TRIAGE_LEVELS.URGENT,
      specialty: 'Pediatrics',
      action: 'Pediatric teleconsultation for bronchodilator nebulization'
    }
  ],
  mildFlags: [
    {
      keywords: ['headache', 'सिरदर्द'],
      scoreDelta: 20,
      urgency: TRIAGE_LEVELS.ROUTINE,
      specialty: 'General Medicine',
      action: 'Rest, hydration, Paracetamol if persistent.'
    },
    {
      keywords: ['runny nose', 'cold', 'sore throat', 'सर्दी', 'जुकाम', 'गले में खराश'],
      scoreDelta: 15,
      urgency: TRIAGE_LEVELS.ROUTINE,
      specialty: 'General Medicine',
      action: 'Warm saline gargles, steam inhalation, Cetirizine at night.'
    },
    {
      keywords: ['joint pain', 'knee pain', 'जोड़ों का दर्द', 'कमर दर्द'],
      scoreDelta: 25,
      urgency: TRIAGE_LEVELS.ROUTINE,
      specialty: 'Orthopedics',
      action: 'Hot fomentation, pain relief gel, physiotherapy exercises.'
    },
    {
      keywords: ['skin rash', 'itching', 'खुजली', 'दाद'],
      scoreDelta: 20,
      urgency: TRIAGE_LEVELS.ROUTINE,
      specialty: 'Dermatology',
      action: 'Calamine lotion, antifungal topical cream if fungal, maintain hygiene.'
    }
  ]
};
