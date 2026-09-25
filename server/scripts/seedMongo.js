// server/scripts/seedMongo.js
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/database.js';
import {
  User,
  TriageResult,
  Consult,
  Prescription,
  HealthRecord,
  EmergencyRequest
} from '../models/index.js';

export const seedUsers = [
  // 1. Patients
  {
    role: 'patient',
    name: 'Rameshwar Patil (रामेश्वर पाटिल)',
    phone: '9876543210',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    village: 'Wada Rural, Palghar',
    block: 'Wada',
    district: 'Palghar',
    state: 'Maharashtra',
    language: 'hi',
    location: {
      type: 'Point',
      coordinates: [73.1389, 19.6542], // [longitude, latitude]
      address: 'Near Gram Panchayat, Wada, Palghar'
    },
    status: 'online',
    age: 54,
    gender: 'Male',
    bloodGroup: 'B+',
    abhaId: 'ABHA-9821-4451-9012',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    emergencyContact: {
      name: 'Sunita Patil (Wife)',
      phone: '9876543211',
      relation: 'Spouse'
    }
  },
  {
    role: 'patient',
    name: 'Kavita Devi (कविता देवी)',
    phone: '9876543220',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    village: 'Vikramgad, Palghar',
    block: 'Vikramgad',
    district: 'Palghar',
    state: 'Maharashtra',
    language: 'hi',
    location: {
      type: 'Point',
      coordinates: [73.0944, 19.7972], // [longitude, latitude]
      address: 'House 42, Vikramgad Tribal Block, Palghar'
    },
    status: 'online',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    abhaId: 'ABHA-7731-1029-4412',
    allergies: ['None known'],
    chronicConditions: ['Pregnancy (2nd Trimester)'],
    emergencyContact: {
      name: 'Manoj Devi (Husband)',
      phone: '9876543221',
      relation: 'Spouse'
    }
  },
  {
    role: 'patient',
    name: 'Bablu Gond (बबलू गोंड)',
    phone: '9876543230',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    village: 'Jawhar Hill Village',
    block: 'Jawhar',
    district: 'Palghar',
    state: 'Maharashtra',
    language: 'hi',
    location: {
      type: 'Point',
      coordinates: [73.2325, 19.9142], // [longitude, latitude]
      address: 'Zilla Parishad School Lane, Jawhar'
    },
    status: 'online',
    age: 12,
    gender: 'Male',
    bloodGroup: 'A+',
    abhaId: 'ABHA-3312-8874-5501',
    allergies: ['Dust / Pollen'],
    chronicConditions: ['Asthma history'],
    emergencyContact: {
      name: 'Suresh Gond (Father)',
      phone: '9876543231',
      relation: 'Parent'
    }
  },

  // 2. Rural Medical Practitioners (RMPs)
  {
    role: 'rmp',
    name: 'Dr. (RMP) Anand Deshmukh (आनंद देशमुख)',
    phone: '9876543301',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    village: 'Wada Center',
    block: 'Wada',
    district: 'Palghar',
    state: 'Maharashtra',
    language: 'mr',
    location: {
      type: 'Point',
      coordinates: [73.1420, 19.6580], // [longitude, latitude]
      address: 'Main Market Rd, Wada, Palghar'
    },
    status: 'online',
    regNumber: 'MH-RMP-2018-8841',
    clinicName: 'Deshmukh Arogya Kendra (Wada)',
    experienceYears: 12,
    qualifications: ['BEMS', 'Rural Health Training Cert (Govt MH)'],
    rating: 4.8,
    totalConsults: 1420,
    emergencyTrained: true
  },
  {
    role: 'rmp',
    name: 'Dr. (RMP) Savitri Waghmare (सावित्री वाघमारे)',
    phone: '9876543302',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    village: 'Vikramgad Central',
    block: 'Vikramgad',
    district: 'Palghar',
    state: 'Maharashtra',
    language: 'mr',
    location: {
      type: 'Point',
      coordinates: [73.0980, 19.8010], // [longitude, latitude]
      address: 'Opposite Sub-District Hospital, Vikramgad'
    },
    status: 'online',
    regNumber: 'MH-RMP-2020-3319',
    clinicName: 'Seva Sadan Clinic (Vikramgad)',
    experienceYears: 8,
    qualifications: ['DHMS', 'First-Responder Cert'],
    rating: 4.9,
    totalConsults: 980,
    emergencyTrained: true
  },
  {
    role: 'rmp',
    name: 'Dr. (RMP) Kailash Rathod (कैलाश राठौड़)',
    phone: '9876543303',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    village: 'Jawhar Central',
    block: 'Jawhar',
    district: 'Palghar',
    state: 'Maharashtra',
    language: 'mr',
    location: {
      type: 'Point',
      coordinates: [73.2350, 19.9180], // [longitude, latitude]
      address: 'Jawhar Fort Road, Palghar'
    },
    status: 'online',
    regNumber: 'MH-RMP-2016-1290',
    clinicName: 'Rathod First Care (Jawhar)',
    experienceYears: 15,
    qualifications: ['BAMS Rural', 'Trauma Triage Cert'],
    rating: 4.7,
    totalConsults: 2150,
    emergencyTrained: true
  },

  // 3. Specialist Doctors
  {
    role: 'doctor',
    name: 'Dr. Priya Sharma, MD (Cardiology)',
    phone: '9876543401',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    district: 'Thane',
    state: 'Maharashtra',
    language: 'en',
    location: {
      type: 'Point',
      coordinates: [72.9781, 19.2183],
      address: 'District Multi-Specialty Hospital & Telemed Hub, Thane'
    },
    status: 'online',
    regNumber: 'MCI-MH-44291',
    hospital: 'District Multi-Specialty Hospital & Telemed Hub, Thane',
    specialty: 'Cardiology',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology) - AIIMS'],
    experienceYears: 14,
    rating: 4.95
  },
  {
    role: 'doctor',
    name: 'Dr. Rajesh Kulkarni, MD (Pediatrics & Pulmonology)',
    phone: '9876543402',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    district: 'Mumbai',
    state: 'Maharashtra',
    language: 'en',
    location: {
      type: 'Point',
      coordinates: [72.8407, 19.0028],
      address: 'KEM Telemedicine Wing, Mumbai'
    },
    status: 'online',
    regNumber: 'MCI-MH-19882',
    hospital: 'KEM Telemedicine Wing, Mumbai',
    specialty: 'Pediatrics',
    qualifications: ['MBBS', 'MD (Pediatrics)', 'Fellowship in Pediatric Pulmonology'],
    experienceYears: 16,
    rating: 4.90
  },
  {
    role: 'doctor',
    name: 'Dr. Neha Verma, MS (OB/GYN)',
    phone: '9876543403',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    district: 'Nashik',
    state: 'Maharashtra',
    language: 'en',
    location: {
      type: 'Point',
      coordinates: [73.7898, 19.9975],
      address: 'Maternal & Child Hub Hospital, Nashik'
    },
    status: 'online',
    regNumber: 'MCI-MH-67123',
    hospital: 'Maternal & Child Hub Hospital, Nashik',
    specialty: 'Gynecology & Obstetrics',
    qualifications: ['MBBS', 'MS (OBG)', 'DNB'],
    experienceYears: 11,
    rating: 4.88
  },

  // 4. Admin
  {
    role: 'admin',
    name: 'Sanjeev Nair (District Health Officer / Admin)',
    phone: '9876543999',
    passwordHash: bcrypt.hashSync('DemoPass@123', 10),
    district: 'Palghar',
    state: 'Maharashtra',
    language: 'en',
    location: {
      type: 'Point',
      coordinates: [72.7667, 19.6967],
      address: 'District Collectorate & NRHM Office, Palghar'
    },
    status: 'online'
  }
];

export async function seedDatabase() {
  console.log('--- Starting JivanSetu MongoDB Database Seeding ---');
  const conn = await connectDB();
  if (!conn) {
    console.error('Cannot seed: MongoDB connection could not be established.');
    return;
  }

  try {
    // 1. Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await TriageResult.deleteMany({});
    await Consult.deleteMany({});
    await Prescription.deleteMany({});
    await HealthRecord.deleteMany({});
    await EmergencyRequest.deleteMany({});

    // Ensure 2dsphere indexes
    await User.syncIndexes();
    await EmergencyRequest.syncIndexes();

    // 2. Insert Users
    console.log('Inserting users (Patients, RMPs, Doctors, Admin)...');
    const createdUsers = await User.insertMany(seedUsers);
    console.log(`Created ${createdUsers.length} users with 2dsphere geo-indexing.`);

    const pat1 = createdUsers.find(u => u.phone === '9876543210');
    const pat2 = createdUsers.find(u => u.phone === '9876543220');
    const pat3 = createdUsers.find(u => u.phone === '9876543230');
    const rmp1 = createdUsers.find(u => u.phone === '9876543301');
    const rmp3 = createdUsers.find(u => u.phone === '9876543303');
    const doc1 = createdUsers.find(u => u.phone === '9876543401');
    const doc2 = createdUsers.find(u => u.phone === '9876543402');

    // 3. Insert Triage Results
    console.log('Inserting triage results...');
    const triage1 = await TriageResult.create({
      patientId: pat1._id,
      symptoms: ['Mild exertional chest tightness', 'Breathlessness on brisk walk'],
      urgencyLevel: 'medium',
      guidanceText: 'Moderate risk. Scheduled teleconsultation with Cardiologist recommended.',
      score: 65,
      vitals: { bp: '138/88', pulse: '78 bpm', spo2: '98%', temp: '98.4 F' },
      recommendedSpecialty: 'Cardiology',
      flagsDetected: {
        red: [],
        moderate: ['Mild chest tightness'],
        mild: []
      },
      requiresImmediateSos: false
    });

    await TriageResult.create({
      patientId: pat3._id,
      symptoms: ['Wheezing', 'Nocturnal cough', 'Difficulty breathing in cold air'],
      urgencyLevel: 'high',
      guidanceText: 'High urgency pediatric respiratory symptoms. Urgent teleconsultation required.',
      score: 75,
      vitals: { bp: '100/65', pulse: '104 bpm', spo2: '94%', temp: '100.2 F' },
      recommendedSpecialty: 'Pediatrics',
      flagsDetected: {
        red: [],
        moderate: ['Wheezing in child', 'Pediatric cough'],
        mild: []
      },
      requiresImmediateSos: false
    });

    // 4. Insert Consults
    console.log('Inserting consults...');
    const consult1 = await Consult.create({
      patientId: pat1._id,
      rmpId: rmp1._id,
      doctorId: doc1._id,
      status: 'closed',
      targetSpecialty: 'Cardiology',
      urgency: 'URGENT',
      symptoms: 'Exertional dyspnea & chest tightness',
      vitals: { bp: '142/90', pulse: '76 bpm', spo2: '98%' },
      notes: 'Cardiology teleconsultation completed. Sorbitrate SOS and Telmisartan advised.',
      roomSessionId: 'room-telemed-cardio-01',
      diagnosis: 'Stable Angina & Stage 1 Essential Hypertension',
      advice: 'Low sodium diet, gentle walking, avoid strenuous exertion. Follow up in 30 days.',
      closedAt: new Date('2026-02-28T15:00:00Z')
    });

    await Consult.create({
      patientId: pat3._id,
      rmpId: rmp3._id,
      doctorId: doc2._id,
      status: 'open',
      targetSpecialty: 'Pediatrics',
      urgency: 'URGENT',
      symptoms: 'Wheezing, nocturnal cough for 5 days',
      vitals: { spo2: '94%', temp: '100.2 F', pulse: '104 bpm' },
      notes: 'Child with recurrent seasonal asthma exacerbation. Awaiting pediatric review.',
      roomSessionId: 'room-telemed-peds-02'
    });

    // 5. Insert Prescriptions
    console.log('Inserting prescriptions...');
    const prescription1 = await Prescription.create({
      consultId: consult1._id,
      doctorId: doc1._id,
      patientId: pat1._id,
      medicines: [
        {
          name: 'Tab. Telmisartan',
          dosage: '40 mg',
          frequency: 'Once Daily (Morning after breakfast)',
          duration: '30 Days',
          instructions: 'Regular blood pressure monitoring at local RMP clinic'
        },
        {
          name: 'Tab. Sorbitrate (Isosorbide Dinitrate)',
          dosage: '5 mg',
          frequency: 'Sublingual SOS (Under tongue if acute chest pain occurs)',
          duration: '10 Tablets',
          instructions: 'Rest immediately. Place under tongue. If pain > 10 min, trigger JivanSetu SOS.'
        },
        {
          name: 'Tab. Metformin',
          dosage: '500 mg',
          frequency: 'Twice Daily (With meals)',
          duration: '30 Days',
          instructions: 'Maintain low glycemic diet'
        }
      ],
      instructions: 'Strictly follow medicine schedule. Weekly BP check at Deshmukh Arogya Kendra.',
      dietaryAdvice: 'Low sodium (< 3g/day), avoid fried food, drink plenty of warm water.',
      diagnosis: 'Mild Exertional Angina & Essential Hypertension',
      followUpDate: '2026-03-30',
      digitalSignature: 'SIG_SHA256_e49b8a371c904fa87129cd8a1',
      verified: true,
      issuedAt: new Date('2026-02-28T15:00:00Z')
    });

    // Link prescriptionId to closed consult
    consult1.prescriptionId = prescription1._id;
    await consult1.save();

    // 6. Insert Append-Only Health Records
    console.log('Inserting append-only health records...');
    await HealthRecord.create([
      {
        patientId: pat1._id,
        type: 'symptom',
        refId: triage1._id,
        title: 'AI Triage: Cardiology Assessment (Score: 65/100)',
        doctorOrRmpName: 'JivanSetu AI Clinical Engine',
        facility: 'Digital Triage Desk',
        details: {
          symptoms: triage1.symptoms,
          score: 65,
          urgencyLevel: 'medium'
        },
        notes: 'Recommended teleconsultation with Cardiologist.',
        timestamp: new Date('2026-02-28T14:15:00Z')
      },
      {
        patientId: pat1._id,
        type: 'consult',
        refId: consult1._id,
        title: 'Cardiology Teleconsultation: Stable Angina',
        doctorOrRmpName: 'Dr. Priya Sharma (Cardiologist) via RMP Dr. Anand Deshmukh',
        facility: 'JivanSetu Telemedicine Hub',
        details: {
          diagnosis: consult1.diagnosis,
          vitals: consult1.vitals
        },
        notes: consult1.advice,
        timestamp: new Date('2026-02-28T14:45:00Z')
      },
      {
        patientId: pat1._id,
        type: 'prescription',
        refId: prescription1._id,
        title: 'Digital Prescription: 3 Medications Prescribed',
        doctorOrRmpName: 'Dr. Priya Sharma, MD (Cardiology)',
        facility: 'District Telemedicine Hub, Thane',
        details: {
          prescriptionId: prescription1._id,
          medicationCount: 3,
          digitalSignature: prescription1.digitalSignature
        },
        notes: 'Tab. Telmisartan 40mg, Tab. Sorbitrate 5mg SOS, Tab. Metformin 500mg.',
        timestamp: new Date('2026-02-28T15:00:00Z')
      },
      {
        patientId: pat2._id,
        type: 'consult',
        refId: null,
        title: '2nd Trimester Antenatal Care (ANC) Screening',
        doctorOrRmpName: 'Dr. Neha Verma via RMP Dr. Savitri Waghmare',
        facility: 'Vikramgad Sub-District Center',
        details: {
          gestationalAge: '22 weeks',
          fetalHeartRate: '144 bpm',
          hb: '10.8 g/dL',
          bp: '110/72 mmHg'
        },
        notes: 'Fetal growth on track. Iron & Folic Acid supplements issued.',
        timestamp: new Date('2026-02-15T09:30:00Z')
      }
    ]);

    // 7. Insert Emergency Requests (SOS)
    console.log('Inserting emergency requests (SOS)...');
    await EmergencyRequest.create([
      {
        patientId: pat1._id,
        patientName: pat1.name,
        patientPhone: pat1.phone,
        triggerType: 'button',
        keywordMatched: 'chest pain',
        voiceTranscript: '',
        symptoms: 'Severe crushing chest pain radiating to left arm and jaw, profuse diaphoresis',
        location: {
          type: 'Point',
          coordinates: [73.1389, 19.6542], // [longitude, latitude]
          source: 'gps',
          address: 'Near Gram Panchayat, Wada, Palghar'
        },
        status: 'resolved',
        tier: 1,
        assignedRmpId: rmp1._id,
        matchedRmp: {
          id: rmp1._id.toString(),
          name: rmp1.name,
          phone: rmp1.phone,
          distanceKm: 0.54,
          clinicName: rmp1.clinicName
        },
        responseTimeSeconds: 360, // 6 minutes to arrive
        escalationHistory: [],
        timeline: [
          { status: 'TRIGGERED', time: new Date('2026-02-20T06:15:00Z'), note: 'SOS button pressed by patient' },
          { status: 'NOTIFIED', time: new Date('2026-02-20T06:15:02Z'), note: 'Nearest RMP Dr. Anand Deshmukh (0.54 km) dispatched' },
          { status: 'ACCEPTED', time: new Date('2026-02-20T06:15:22Z'), note: 'RMP accepted emergency with first-aid trauma kit' },
          { status: 'ARRIVED', time: new Date('2026-02-20T06:21:00Z'), note: 'RMP arrived at patient residence. Sublingual nitrate administered.' },
          { status: 'RESOLVED', time: new Date('2026-02-20T06:45:00Z'), note: 'Patient stabilized and transported to Taluka Hospital.' }
        ]
      }
    ]);

    console.log('--- MongoDB Seeding Completed Successfully ---');

    // Test 2dsphere $near query verification
    console.log('\n--- Testing Native MongoDB $near Nearest-RMP Query ---');
    const nearbyRmps = await User.findNearestRmps(73.1389, 19.6542, 30000);
    console.log(`Found ${nearbyRmps.length} nearby RMPs within 30km of patient location [73.1389, 19.6542]:`);
    nearbyRmps.forEach(rmp => {
      console.log(` - ${rmp.name} | Phone: ${rmp.phone} | Status: ${rmp.status} | Clinic: ${rmp.clinicName}`);
    });

  } catch (error) {
    console.error('Error during MongoDB seeding:', error);
  } finally {
    await disconnectDB();
  }
}

// Run directly if executed via CLI
if (process.argv[1]?.endsWith('seedMongo.js')) {
  seedDatabase();
}
