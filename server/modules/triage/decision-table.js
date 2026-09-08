// server/modules/triage/decision-table.js
import { TRIAGE_LEVELS } from '../../config/constants.js';

/**
 * Standard Assistive Triage Disclaimers
 * MANDATORY REQUIREMENT: Clearly labeled as assistive triage, NOT a medical diagnosis.
 */
export const TRIAGE_DISCLAIMERS = {
  en: 'ASSISTIVE CLINICAL TRIAGE ONLY: This automated evaluation is an assistive clinical decision support tool designed to prioritize urgency. It is NOT a medical diagnosis. A certified doctor or medical practitioner must examine the patient.',
  hi: 'केवल सहायक चिकित्सीय ट्रायज (Assistive Triage): यह स्वचालित मूल्यांकन केवल प्राथमिकता और गंभीरता तय करने हेतु एक सहायक प्रणाली है, कोई चिकित्सीय निदान (Diagnosis) नहीं। योग्य डॉक्टर या आरएमपी द्वारा जांच आवश्यक है।'
};

/**
 * Multi-Symptom Combination Clinical Decision Table
 * Matches symptom combinations, triggers priority scoring, assigns specialty and protocols.
 */
export const SYMPTOM_COMBINATION_RULES = [
  // 1. CARDIAC & VASCULAR CRITICAL COMBINATIONS
  {
    id: 'COMB_CARDIAC_ACUTE',
    name: 'Acute Coronary Syndrome / Myocardial Infarction Indicator',
    requiredKeywords: [
      ['chest pain', 'chest pressure', 'chest heaviness', 'सीने में दर्द', 'छाती में दर्द', 'सीने में भारीपन'],
      ['sweating', 'cold sweat', 'dizziness', 'left arm pain', 'jaw pain', 'पसीना', 'चक्कर', 'बांह में दर्द', 'जबड़े में दर्द']
    ],
    score: 95,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Cardiology / Emergency Care',
    requiresImmediateSos: true,
    action: 'Immediate Emergency SOS dispatch. High risk of Acute Coronary Syndrome. Administer Dispersible Aspirin 300mg + Sorbitrate 5mg sublingually if indicated by on-duty physician.',
    actionHi: 'तत्काल आपातकालीन SOS भेजें। एक्यूट कोरोनरी सिंड्रोम का उच्च जोखिम। डॉक्टर के निर्देशानुसार एस्पिरिन ३००mg एवं सोर्बिट्रेट ५mg दें।'
  },
  {
    id: 'COMB_CARDIAC_ISCHEMIC',
    name: 'Ischemic Chest Discomfort / Angina',
    requiredKeywords: [
      ['chest pain', 'tightness', 'सीने में दर्द', 'छाती में जकड़न']
    ],
    score: 82,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Cardiology',
    requiresImmediateSos: true,
    action: 'Immediate tele-cardiology consult. Keep patient sitting upright at 45 degrees, monitor continuous SpO2 and pulse.',
    actionHi: 'तत्काल कार्डियोलॉजिस्ट परामर्श। मरीज को ४५ डिग्री कोण पर बैठाएं और SpO2 की निगरानी करें।'
  },

  // 2. RESPIRATORY CRITICAL COMBINATIONS
  {
    id: 'COMB_RESP_SEVERE_DISTRESS',
    name: 'Severe Acute Respiratory Distress / Stridor',
    requiredKeywords: [
      ['difficulty breathing', 'breathless', 'shortness of breath', 'gasping', 'stridor', 'wheezing', 'सांस फूलना', 'सांस लेने में तकलीफ', 'दम घुटना'],
      ['cyanosis', 'unable to speak', 'blue lips', 'drowsy', 'नीले होंठ', 'बोलने में असमर्थ', 'सुस्ती']
    ],
    score: 96,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Pulmonology / Critical Care',
    requiresImmediateSos: true,
    action: 'High-flow Oxygen protocol (4-6 L/min). Immediate rush to nearest PHC/Hospital with oxygen facility.',
    actionHi: 'उच्च प्रवाह ऑक्सीजन प्रोटोकॉल। तुरंत ऑक्सीजन सुविधा युक्त नजदीकी पीएचसी/अस्पताल ले जाएं।'
  },
  {
    id: 'COMB_RESP_ACUTE_DYSPNEA',
    name: 'Acute Breathlessness / Asthma Exacerbation',
    requiredKeywords: [
      ['difficulty breathing', 'breathless', 'wheezing', 'cough', 'सांस में तकलीफ', 'दम फूलना', 'खांसी']
    ],
    score: 84,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Pulmonology',
    requiresImmediateSos: true,
    action: 'Nebulization with Salbutamol/Ipratropium if available at RMP center. Priority Doctor Video Triage.',
    actionHi: 'आरएमपी केंद्र पर सालब्यूटामोल नेबुलाइजेशन। प्राथमिकता पर विशेषज्ञ डॉक्टर से वीडियो कॉल।'
  },

  // 3. TOXICOLOGY & VENOMOUS BITES
  {
    id: 'COMB_SNAKEBITE',
    name: 'Snakebite / Venomous Envenomation Protocol',
    requiredKeywords: [
      ['snakebite', 'snake bite', 'fang mark', 'reptile bite', 'सांप का काटना', 'सर्पदंश', 'सांप']
    ],
    score: 98,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Emergency Toxicology',
    requiresImmediateSos: true,
    action: 'CRITICAL: Immobilize bitten limb with splint. DO NOT CUT, SUCK, OR APPLY TOURNIQUET. Rush to nearest Anti-Snake Venom (ASV) designated Health Center.',
    actionHi: 'अति-गंभीर: काटे गए अंग को स्थिर रखें। चीरा या कसकर पट्टी (टूर्निकेट) न बांधें। तुरंत ASV उपलब्ध केंद्र पर ले जाएं।'
  },

  // 4. NEUROLOGY / STROKE / SEIZURES
  {
    id: 'COMB_STROKE_FAST',
    name: 'Acute Cerebrovascular Event (Stroke FAST Symptoms)',
    requiredKeywords: [
      ['facial droop', 'face drooping', 'arm weakness', 'slurred speech', 'paralysis', 'चेहरा टेढ़ा', 'लकवा', 'आवाज लड़खड़ाना', 'हाथ पैर में कमजोरी']
    ],
    score: 94,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Neurology / Stroke Care',
    requiresImmediateSos: true,
    action: 'Golden Hour Stroke alert. Check Blood Sugar (RBS) to rule out hypoglycemia. Urgent transport for CT scan.',
    actionHi: 'गोल्डन ऑवर स्ट्रोक अलर्ट। तुरंत ब्लड शुगर जांचें एवं सीटी स्कैन हेतु बड़े अस्पताल रेफर करें।'
  },
  {
    id: 'COMB_SEIZURE_ACTIVE',
    name: 'Status Epilepticus / Severe Convulsions',
    requiredKeywords: [
      ['seizure', 'convulsion', 'fits', 'epilepsy', 'दौरे', 'मिर्गी', 'झटके आना']
    ],
    score: 89,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Neurology',
    requiresImmediateSos: true,
    action: 'Protect patient from head injury, turn to left lateral recovery position. Never insert spoon/keys into mouth.',
    actionHi: 'सिर को चोट से बचाएं, बायीं करवट लिटाएं। मुंह में चम्मच या लोहे की चाभी न डालें।'
  },
  {
    id: 'COMB_UNCONSCIOUS',
    name: 'Unconsciousness / Coma / Syncope',
    requiredKeywords: [
      ['unconscious', 'fainted', 'loss of consciousness', 'blackout', 'बेहोश', 'अचेत', 'सुध-बुध खोना']
    ],
    score: 92,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Critical Care / Internal Medicine',
    requiresImmediateSos: true,
    action: 'Verify carotid pulse and airway breathing. Keep in recovery position. Check RBS immediately.',
    actionHi: 'सांस और नब्ज जांचें। रिकवरी पोजीशन में रखें। ब्लड शुगर की त्वरित जांच करें।'
  },

  // 5. MATERNAL & OBSTETRIC EMERGENCIES
  {
    id: 'COMB_OBSTETRIC_EMERGENCY',
    name: 'High-Risk Pregnancy / Obstetric Bleeding / Labor Complication',
    requiredKeywords: [
      ['pregnancy', 'pregnant', 'maternal', 'गर्भावस्था', 'गर्भवती'],
      ['bleeding', 'severe abdominal pain', 'fluid leakage', 'reduced fetal movement', 'खून बहना', 'पेट में तेज दर्द', 'पानी छूटना', 'बच्चे की हलचल कम']
    ],
    score: 91,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Gynecology & Obstetrics',
    requiresImmediateSos: true,
    action: 'Immediate 108 Ambulance / SOS dispatch to FRU (First Referral Unit) Obstetric Facility. Keep patient warm and hydrated.',
    actionHi: 'तत्काल 108 एम्बुलेंस / एफआरयू रेफरल। गर्भवती महिला को तत्काल प्रसूति विशेषज्ञ के पास भेजें।'
  },

  // 6. TRAUMA & ACUTE HEMORRHAGE
  {
    id: 'COMB_MAJOR_TRAUMA',
    name: 'Severe Hemorrhage / Polytrauma / Open Fracture',
    requiredKeywords: [
      ['severe bleeding', 'hemorrhage', 'accident', 'open fracture', 'गंभीर चोट', 'खून बहना', 'दुर्घटना', 'हड्डी टूटना']
    ],
    score: 90,
    urgency: TRIAGE_LEVELS.EMERGENCY,
    urgencyBadge: 'Red',
    specialty: 'Trauma & Orthopedics',
    requiresImmediateSos: true,
    action: 'Apply firm direct sterile pressure over bleeding site. Splint suspected fracture. IV access & fluid resuscitation.',
    actionHi: 'घाव पर साफ कपड़े से सीधा दबाव बनाएं। टूटे हुए अंग को सहारा दें और तुरंत अस्पताल ले जाएं।'
  },

  // 7. MODERATE / URGENT COMBINATIONS (YELLOW)
  {
    id: 'COMB_FEVER_MALARIA_DENGUE',
    name: 'Acute Febrile Illness / Suspected Vector-Borne Infection',
    requiredKeywords: [
      ['fever', 'high fever', 'chills', 'rigors', 'shivering', 'तेज बुखार', 'कंपकंपी', 'ठंड लगना', 'बुखार'],
      ['body ache', 'joint pain', 'headache', 'vomiting', 'शरीर दर्द', 'सिरदर्द', 'उल्टी']
    ],
    score: 62,
    urgency: TRIAGE_LEVELS.URGENT,
    urgencyBadge: 'Yellow',
    specialty: 'General Medicine',
    requiresImmediateSos: false,
    action: 'Perform rapid diagnostic tests (Malaria RDT, Dengue NS1). Prescribe antipyretic (Paracetamol 650mg) & Oral Rehydration Solution (ORS).',
    actionHi: 'मलेरिया व डेंगू आरडीटी जांच करें। पैरासिटामोल ६५०mg एवं ओआरएस (ORS) घोल दें। २ घंटे में परामर्श।'
  },
  {
    id: 'COMB_ACUTE_ABDOMINAL_PAIN',
    name: 'Acute Abdomen / Suspected Appendicitis or Cholecystitis',
    requiredKeywords: [
      ['stomach pain', 'abdominal pain', 'belly pain', 'vomiting', 'पेट दर्द', 'पेट में दर्द', 'उल्टी']
    ],
    score: 65,
    urgency: TRIAGE_LEVELS.URGENT,
    urgencyBadge: 'Yellow',
    specialty: 'Gastroenterology / General Surgery',
    requiresImmediateSos: false,
    action: 'Nil by mouth (NPO). Palpate for tenderness and rebound tenderness. Schedule urgent teleconsultation with General Surgeon.',
    actionHi: 'मरीज को कुछ न खिलाएं। पेट की जांच करें और विशेषज्ञ सर्जन से तुरंत परामर्श जोड़ें।'
  },
  {
    id: 'COMB_PEDIATRIC_FEVER_COUGH',
    name: 'Pediatric Acute Respiratory Infection',
    requiredKeywords: [
      ['child', 'baby', 'infant', 'kid', 'pediatric', 'बच्चा', 'शिशु', 'बालक'],
      ['fever', 'cough', 'fast breathing', 'wheeze', 'बुखार', 'खांसी', 'तेज सांस']
    ],
    score: 68,
    urgency: TRIAGE_LEVELS.URGENT,
    urgencyBadge: 'Yellow',
    specialty: 'Pediatrics',
    requiresImmediateSos: false,
    action: 'Count respiratory rate per minute. Check chest indrawing. Pediatric teleconsultation within 1 hour.',
    actionHi: 'बच्चे की सांस की गति गिनें। पसलियां धंसने की जांच करें। १ घंटे में शिशु रोग विशेषज्ञ से परामर्श।'
  },
  {
    id: 'COMB_DIARRHEA_DEHYDRATION',
    name: 'Acute Gastroenteritis / Moderate Dehydration',
    requiredKeywords: [
      ['diarrhea', 'loose motions', 'watery stools', 'dast', 'दस्त', 'पतले दस्त', 'उल्टी दस्त']
    ],
    score: 55,
    urgency: TRIAGE_LEVELS.URGENT,
    urgencyBadge: 'Yellow',
    specialty: 'General Medicine',
    requiresImmediateSos: false,
    action: 'Administer WHO-standard ORS electrolyte replacement and Zinc supplement. Monitor urine output.',
    actionHi: 'ओआरएस घोल एवं जिंक की गोली दें। पर्याप्त तरल पदार्थ दें और डॉक्टर से परामर्श लें।'
  },

  // 8. ROUTINE / MILD CONDITIONS (GREEN)
  {
    id: 'COMB_COMMON_COLD',
    name: 'Upper Respiratory Tract Infection / Common Cold',
    requiredKeywords: [
      ['cold', 'runny nose', 'sneezing', 'sore throat', 'mild cough', 'जुकाम', 'सर्दी', 'छींकें', 'गले में खराश']
    ],
    score: 18,
    urgency: TRIAGE_LEVELS.ROUTINE,
    urgencyBadge: 'Green',
    specialty: 'General Medicine',
    requiresImmediateSos: false,
    action: 'Symptomatic relief: Warm saline gargles, steam inhalation, hydration, antihistamine if needed.',
    actionHi: 'गर्म पानी के गरारे, भाप लेना और आराम। नियमित देखभाल पर्याप्त है।'
  },
  {
    id: 'COMB_MILD_HEADACHE',
    name: 'Tension Headache / Fatigue',
    requiredKeywords: [
      ['mild headache', 'stress', 'tiredness', 'सिरदर्द', 'थकान']
    ],
    score: 15,
    urgency: TRIAGE_LEVELS.ROUTINE,
    urgencyBadge: 'Green',
    specialty: 'General Medicine',
    requiresImmediateSos: false,
    action: 'Rest in quiet room, adequate hydration, Paracetamol if persistent.',
    actionHi: 'आराम, पर्याप्त पानी पीना और यदि आवश्यकता हो तो सामान्य दर्द निवारक।'
  },
  {
    id: 'COMB_JOINT_PAIN',
    name: 'Chronic Musculoskeletal / Osteoarthritis Pain',
    requiredKeywords: [
      ['joint pain', 'knee pain', 'back pain', 'stiffness', 'जोड़ों का दर्द', 'घुटने में दर्द', 'कमर दर्द']
    ],
    score: 22,
    urgency: TRIAGE_LEVELS.ROUTINE,
    urgencyBadge: 'Green',
    specialty: 'Orthopedics / Physiotherapy',
    requiresImmediateSos: false,
    action: 'Topical analgesic application, gentle mobilization exercises, routine orthopedics appointment.',
    actionHi: 'दर्द निवारक जेल का उपयोग, हल्का व्यायाम और नियमित ओपीडी परामर्श।'
  },
  {
    id: 'COMB_SKIN_ALLERGY',
    name: 'Dermatitis / Superficial Skin Allergy',
    requiredKeywords: [
      ['skin rash', 'itching', 'skin allergy', 'khujli', 'दाद', 'खुजली', 'त्वचा संक्रमण']
    ],
    score: 20,
    urgency: TRIAGE_LEVELS.ROUTINE,
    urgencyBadge: 'Green',
    specialty: 'Dermatology',
    requiresImmediateSos: false,
    action: 'Topical soothing lotion (Calamine), keep area clean and dry, routine tele-dermatology consult.',
    actionHi: 'कैलामाइन लोशन लगाएं, त्वचा को साफ व सूखा रखें।'
  }
];

/**
 * Vitals Thresholds Matrix
 */
export const VITALS_RULES = {
  spo2: [
    { min: 0, max: 89, scoreDelta: 35, urgency: TRIAGE_LEVELS.EMERGENCY, flag: 'Critical Hypoxia (SpO2 < 90%)', action: 'High-flow O2 therapy immediately' },
    { min: 90, max: 94, scoreDelta: 20, urgency: TRIAGE_LEVELS.URGENT, flag: 'Moderate Hypoxia (SpO2 90-94%)', action: 'Monitor respiratory rate & supplemental O2' }
  ],
  systolicBp: [
    { condition: (bp) => bp >= 180 || bp <= 80, scoreDelta: 30, urgency: TRIAGE_LEVELS.EMERGENCY, flag: 'Hypertensive Crisis or Severe Hypotension / Shock' },
    { condition: (bp) => bp >= 145 || bp <= 90, scoreDelta: 15, urgency: TRIAGE_LEVELS.URGENT, flag: 'Elevated / Borderline Blood Pressure' }
  ],
  pulse: [
    { condition: (p) => p >= 125 || p <= 45, scoreDelta: 25, urgency: TRIAGE_LEVELS.EMERGENCY, flag: 'Critical Tachycardia / Bradycardia' },
    { condition: (p) => p >= 105 || p <= 55, scoreDelta: 12, urgency: TRIAGE_LEVELS.URGENT, flag: 'Abnormal Heart Rate' }
  ],
  temp: [
    { condition: (t) => t >= 103.5, scoreDelta: 20, urgency: TRIAGE_LEVELS.URGENT, flag: 'High Hyperpyrexia (Temp >= 103.5°F)' },
    { condition: (t) => t >= 100.5, scoreDelta: 10, urgency: TRIAGE_LEVELS.URGENT, flag: 'Mild to Moderate Fever (Temp >= 100.5°F)' }
  ]
};

/**
 * Duration & Pain modifiers
 */
export const MODIFIERS = {
  duration: {
    '< 1 hour': 10,     // Sudden acute onset
    '1 - 6 hours': 6,
    '1 - 2 days': 2,
    '3+ days': 0
  },
  painScale: (pain) => {
    const p = parseInt(pain, 10) || 0;
    if (p >= 8) return 15;
    if (p >= 5) return 8;
    return 0;
  }
};
