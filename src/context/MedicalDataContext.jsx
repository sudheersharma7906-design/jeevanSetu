import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_HEALTH_RECORDS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DOCTOR_QUEUE,
  MOCK_USERS
} from '../utils/mockData';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';
import { getApiUrl } from '../config/api';

const MedicalDataContext = createContext();

export const MedicalDataProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();

  const [patientProfiles, setPatientProfiles] = useState({});
  const [healthRecords, setHealthRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorQueue, setDoctorQueue] = useState(() => {
    const saved = localStorage.getItem('jivansetu_queue');
    return saved ? JSON.parse(saved) : INITIAL_DOCTOR_QUEUE;
  });

  const [currentConsultPatient, setCurrentConsultPatient] = useState(INITIAL_DOCTOR_QUEUE[0]);

  // Sync / fetch user-isolated medical records & prescriptions whenever auth state changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setHealthRecords([]);
      setPrescriptions([]);
      setPatientProfiles({});
      return;
    }

    // Set user's own profile in map
    const userId = user.id || user._id;
    if (userId) {
      setPatientProfiles(prev => ({
        ...prev,
        [userId]: user,
        [user.phone]: user
      }));
    }

    // Fetch user-specific records from backend
    const fetchUserData = async () => {
      if (!token) return;

      try {
        const recordsRes = await fetch(getApiUrl('/api/records/my'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const recordsData = await recordsRes.json();
        if (recordsRes.ok && recordsData.success) {
          setHealthRecords(recordsData.records || []);
        }

        const rxRes = await fetch(getApiUrl('/api/prescriptions/my'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rxData = await rxRes.json();
        if (rxRes.ok && rxData.success) {
          setPrescriptions(rxData.prescriptions || []);
        }
      } catch (err) {
        console.warn('[MEDICAL DATA FETCH WARNING]:', err.message);
      }
    };

    fetchUserData();
  }, [user, token, isAuthenticated]);

  // Medical records & prescriptions are maintained in active React session state and fetched dynamically from backend DB.
  // Sensitive PHI is never stored unencrypted in browser localStorage.

  // Get single patient profile (no pat-101 hard-coded fallback)
  const getPatientProfile = (identifier) => {
    if (!identifier) return user || null;
    const cleanId = String(identifier).replace(/\D/g, '').slice(-10);
    return (
      patientProfiles[identifier] ||
      patientProfiles[cleanId] ||
      (user && (user.id === identifier || user._id === identifier || user.phone === cleanId) ? user : null)
    );
  };

  // Update or save patient profile
  const updatePatientProfile = (identifier, updates = {}) => {
    const targetId = identifier || updates.id || user?.id || user?.patientId || '';
    const cleanId = String(targetId || updates.phone || '').replace(/\D/g, '').slice(-10);
    const prev = getPatientProfile(targetId) || {};

    const updatedProfile = {
      ...prev,
      ...updates,
      id: updates.id || prev.id || `pat-${cleanId}`,
      phone: updates.phone || prev.phone || cleanId,
      profileCompleted: true,
      lastUpdated: new Date().toISOString()
    };

    setPatientProfiles((prevMap) => ({
      ...prevMap,
      [updatedProfile.id]: updatedProfile,
      [cleanId]: updatedProfile,
      [updatedProfile.phone]: updatedProfile
    }));

    return updatedProfile;
  };

  // Report Disease / Symptoms & Transmit to Doctors and RMPs
  const reportDiseaseIssue = ({
    patientId = '',
    patientName,
    phone,
    age,
    gender,
    diseaseCategory,
    diseaseName,
    symptoms,
    duration,
    painScale = 5,
    vitals = { bp: '130/85', pulse: '80 bpm', spo2: '98%', temp: '98.6 °F' },
    notes = ''
  }) => {
    const targetPatientId = patientId || user?.id || user?.patientId || '';
    const profile = getPatientProfile(targetPatientId || phone) || {};
    const effectiveName = patientName || profile.name || user?.name || 'Patient';
    const effectiveAge = age || profile.age || 45;
    const effectiveGender = gender || profile.gender || 'Unknown';
    const effectiveChronic = profile.chronicConditions || [];
    const effectiveAllergies = profile.allergies || [];

    // Calculate clinical urgency
    let urgency = 'YELLOW';
    let score = 55;
    const lowerCategory = (diseaseCategory || '').toLowerCase();
    const lowerSymptoms = (symptoms || '').toLowerCase();

    if (
      lowerCategory.includes('chest') ||
      lowerCategory.includes('heart') ||
      lowerCategory.includes('breath') ||
      lowerSymptoms.includes('chest pain') ||
      lowerSymptoms.includes('difficulty breathing') ||
      painScale >= 8 ||
      (vitals.spo2 && parseInt(vitals.spo2) < 92)
    ) {
      urgency = 'RED';
      score = 90;
    } else if (painScale <= 3 && !lowerCategory.includes('infection')) {
      urgency = 'GREEN';
      score = 25;
    }

    const newCaseId = `case-${Date.now().toString().slice(-5)}`;
    const reasonText = diseaseName ? `${diseaseName} - ${symptoms}` : symptoms;

    const newCase = {
      id: newCaseId,
      patientId: profile.id || targetPatientId || user?.id || user?.patientId || '',
      patientName: effectiveName,
      phone: profile.phone || phone || user?.phone || '',
      age: effectiveAge,
      gender: effectiveGender,
      bloodGroup: profile.bloodGroup || 'B+',
      village: profile.village || user?.village || 'Rural Block',
      district: profile.district || 'Palghar',
      regularProblems: effectiveChronic,
      chronicConditions: effectiveChronic,
      allergies: effectiveAllergies,
      currentMedications: profile.currentMedications || [],
      urgency,
      score,
      diseaseCategory: diseaseCategory || 'General Health Complaint',
      diseaseName: diseaseName || 'Reported Illness',
      symptoms,
      duration: duration || '1-2 Days',
      painScale,
      reason: reasonText,
      reasonHi: `रोग रिपोर्ट: ${diseaseName || diseaseCategory} (${symptoms})`,
      reportedAt: 'Just now',
      timestamp: new Date().toISOString(),
      rmpNotes: notes || `Reported by patient. Past history: ${effectiveChronic.join(', ') || 'None'}. Allergies: ${effectiveAllergies.join(', ') || 'None'}.`,
      vitals,
      status: 'PENDING_DOCTOR_REVIEW'
    };

    // Add to Doctor / RMP Queue
    setDoctorQueue((prev) => [newCase, ...prev]);

    // Append to Patient's Health Records Timeline
    const newRecord = {
      id: `rec-case-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      title: `Reported Illness: ${diseaseName || diseaseCategory}`,
      titleHi: `रोग रिपोर्ट: ${diseaseName || diseaseCategory}`,
      doctor: 'Submitted to Tele-Specialist & RMP Hub',
      rmp: 'On-Duty RMP',
      vitals,
      notes: `Symptoms: ${symptoms} | Severity: ${painScale}/10 | Duration: ${duration || '1-2 Days'} | Transmitted to Doctor & RMP network.`,
      notesHi: `लक्षण: ${symptoms} | तीव्रता: ${painScale}/10 | अवधि: ${duration || '1-2 दिन'} | डॉक्टर एवं आरएमपी को प्रेषित।`,
      status: 'UNDER_REVIEW'
    };

    setHealthRecords((prev) => [newRecord, ...prev]);

    // Persist to backend database (Single Source of Truth)
    if (token) {
      (async () => {
        try {
          await fetch(getApiUrl('/api/triage'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              patientId: newCase.patientId,
              symptoms: newCase.symptoms,
              vitals: newCase.vitals,
              painScale: newCase.painScale
            })
          });

          if (newCase.patientId) {
            await fetch(getApiUrl(`/api/records/${newCase.patientId}`), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                title: newRecord.title,
                doctor: newRecord.doctor,
                rmp: newRecord.rmp,
                notes: newRecord.notes,
                vitals: newRecord.vitals
              })
            });
          }
        } catch (err) {
          console.warn('[MEDICAL DATA BACKEND SYNC WARNING]:', err.message);
        }
      })();
    }

    // Emit Socket notification to Doctors & RMPs
    try {
      socket.emit('consult:case-reported', newCase);
    } catch (e) {
      // ignore
    }

    return newCase;
  };

  // Add Triage Case into Doctor / RMP Queue (Compatibility method)
  const addTriageCase = (triageData = {}) => {
    return reportDiseaseIssue({
      patientId: triageData.patientId || user?.id || user?.patientId || '',
      patientName: triageData.patientName || user?.name,
      age: triageData.age,
      diseaseCategory: triageData.category || 'Clinical Triage Evaluation',
      diseaseName: triageData.category || 'AI Triage Case',
      symptoms: triageData.reason || 'Symptom checklist submitted',
      vitals: triageData.vitals,
      painScale: triageData.painScale || 5,
      notes: triageData.notes
    });
  };

  // Doctor / RMP Examines & Updates Patient Profile with New Disease, Issues & Prescription
  const doctorUpdateDiagnosis = ({
    caseId,
    patientId = '',
    patientPhone,
    patientName,
    doctorName = 'Dr. Priya Sharma, MD',
    doctorReg = 'MCI-MH-44291',
    doctorRole = 'Specialist Doctor (Cardiologist)',
    diagnosis,
    diagnosisHi,
    clinicalNotes,
    clinicalNotesHi,
    addedChronicConditions = [],
    medicines = [],
    dietAdvice = 'Proper hydration, balanced light diet, regular vitals checkup.',
    dietAdviceHi = 'पर्याप्त पानी पिएं, पौष्टिक व सुपाच्य भोजन लें, विश्राम करें।',
    vitals = { bp: '130/84', pulse: '78 bpm', spo2: '98%', temp: '98.4 °F' },
    nextFollowup = 'After 7 days'
  }) => {
    const profile = getPatientProfile(patientId || patientPhone) || {};
    const existingChronic = profile.chronicConditions || [];

    // Merge newly identified regular/chronic problems into patient's permanent profile
    const mergedChronic = Array.from(
      new Set([...existingChronic, ...(addedChronicConditions || [])])
    );

    // 1. Update Patient Profile in State & Storage
    updatePatientProfile(patientId || profile.id, {
      chronicConditions: mergedChronic,
      latestDiagnosis: diagnosis,
      lastCheckupDate: new Date().toISOString().split('T')[0]
    });

    // 2. Create Certified Digital Prescription
    const fullRx = {
      id: `rx-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      doctorName,
      doctorReg,
      specialty: doctorRole,
      patientName: patientName || profile.name || 'Patient',
      patientAge: profile.age || 50,
      patientGender: profile.gender || 'Male',
      diagnosis: diagnosis || 'Clinical Teleconsultation Assessment',
      diagnosisHi: diagnosisHi || diagnosis || 'चिकित्सीय मूल्यांकन',
      vitals: `BP: ${vitals.bp || '130/84'} | HR: ${vitals.pulse || '78 bpm'} | SpO2: ${vitals.spo2 || '98%'}`,
      medicines: medicines.length > 0 ? medicines : [
        { name: 'Paracetamol 500mg', dosage: '1 Tab SOS', timing: 'After food', duration: '3 Days' }
      ],
      dietAdvice,
      dietAdviceHi,
      nextFollowup,
      digitalSignature: `SIG_SHA256_${Date.now().toString(16).toUpperCase()}_AUTHENTIC`
    };

    setPrescriptions((prev) => [fullRx, ...prev]);

    // 3. Append Doctor's Certified Clinical Report to Health Records Timeline
    const timelineEntry = {
      id: `rec-diag-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      title: `Doctor Clinical Diagnosis: ${diagnosis}`,
      titleHi: `डॉक्टर नैदानिक रिपोर्ट: ${diagnosisHi || diagnosis}`,
      doctor: doctorName,
      rmp: 'On-Duty RMP',
      vitals,
      notes: `${clinicalNotes || 'Patient evaluated via teleconsultation.'} Prescribed ${fullRx.medicines.length} medications. Added to health record.`,
      notesHi: `${clinicalNotesHi || clinicalNotes || 'टेलीपरामर्श द्वारा मरीज की जांच पूर्ण की गई।'} ${fullRx.medicines.length} दवाएं निर्धारित की गईं।`,
      prescriptions: fullRx.medicines.map((m) => ({
        medicine: m.name,
        dosage: m.dosage,
        duration: m.duration
      })),
      verifiedBy: doctorName,
      status: 'DIAGNOSED_VERIFIED'
    };

    setHealthRecords((prev) => [timelineEntry, ...prev]);

    // 4. Update status in Doctor Queue to COMPLETED
    if (caseId) {
      setDoctorQueue((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, status: 'COMPLETED_DIAGNOSED', diagnosis, doctorNotes: clinicalNotes }
            : c
        )
      );
    }

    // 5. Persist to backend database (Single Source of Truth)
    if (token) {
      (async () => {
        try {
          await fetch(getApiUrl('/api/prescriptions'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              patientId: profile.id || patientId,
              diagnosis: fullRx.diagnosis,
              medications: fullRx.medicines,
              vitals: vitals,
              instructions: dietAdvice
            })
          });

          const targetPid = profile.id || patientId;
          if (targetPid) {
            await fetch(getApiUrl(`/api/records/${targetPid}`), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                title: timelineEntry.title,
                doctor: timelineEntry.doctor,
                rmp: timelineEntry.rmp,
                notes: timelineEntry.notes,
                vitals: timelineEntry.vitals,
                verifiedBy: timelineEntry.verifiedBy
              })
            });
          }
        } catch (err) {
          console.warn('[DOCTOR DIAGNOSIS BACKEND SYNC WARNING]:', err.message);
        }
      })();
    }

    return { profile, prescription: fullRx, record: timelineEntry };
  };

  // Add new Prescription
  const addPrescription = (newRx) => {
    return doctorUpdateDiagnosis({
      patientName: newRx.patientName,
      patientAge: newRx.patientAge,
      doctorName: newRx.doctorName,
      diagnosis: newRx.diagnosis,
      diagnosisHi: newRx.diagnosisHi,
      medicines: newRx.medicines,
      dietAdvice: newRx.dietAdvice,
      dietAdviceHi: newRx.dietAdviceHi
    }).prescription;
  };

  return (
    <MedicalDataContext.Provider
      value={{
        patientProfiles,
        getPatientProfile,
        updatePatientProfile,
        reportDiseaseIssue,
        doctorUpdateDiagnosis,
        healthRecords,
        prescriptions,
        doctorQueue,
        currentConsultPatient,
        setCurrentConsultPatient,
        addTriageCase,
        addPrescription
      }}
    >
      {children}
    </MedicalDataContext.Provider>
  );
};

export const useMedicalData = () => useContext(MedicalDataContext);
