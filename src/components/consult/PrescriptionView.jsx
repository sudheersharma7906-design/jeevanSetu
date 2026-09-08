import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Printer,
  FileCheck,
  ShieldCheck,
  Calendar,
  User,
  Heart,
  Pill,
  Share2,
  Download
} from 'lucide-react';

export const PrescriptionView = ({ prescription }) => {
  const { lang, t } = useLanguage();

  if (!prescription) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <FileCheck size={48} color="var(--slate-300)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--slate-500)' }}>
          {lang === 'hi' ? 'कोई दवा पर्चा चयनित नहीं है।' : 'No prescription selected to view.'}
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>
            {t('prescriptionTitle')}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            Rx ID: {prescription.id} | Date: {prescription.date}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <Printer size={15} />
            {t('printRx')}
          </button>
        </div>
      </div>

      {/* Printable Digital Rx Pad */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          border: '2px solid var(--slate-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}
      >
        {/* Rx Stationery Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--primary-700)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-800)', fontWeight: 800 }}>
              {prescription.doctorName}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>
              {prescription.specialty}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              {t('doctorRegNo')}: <b>{prescription.doctorReg}</b> | Tele-Hub Sitapur / Lucknow
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--primary-50)',
                color: 'var(--primary-800)',
                border: '1px solid var(--primary-200)',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <ShieldCheck size={14} color="var(--primary-600)" />
              <span>{lang === 'hi' ? 'सत्यापित ई-हस्ताक्षरित पर्चा' : 'Verified Digital Tele-Rx'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '6px' }}>
              Date: <b>{prescription.date}</b>
            </div>
          </div>
        </div>

        {/* Patient Metadata Grid */}
        <div
          style={{
            background: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Patient Name</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
              {prescription.patientName}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Age / Gender</span>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
              {prescription.patientAge} Yrs / {prescription.patientGender || 'Male'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Recorded Vitals</span>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-800)' }}>
              {prescription.vitals || 'BP: 130/84 | HR: 80 bpm'}
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'चिकित्सीय निदान (Diagnosis)' : 'Clinical Diagnosis'}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '2px' }}>
            {lang === 'hi' && prescription.diagnosisHi ? prescription.diagnosisHi : prescription.diagnosis}
          </div>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-800)', fontFamily: 'serif' }}>
              ℞
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              {t('rxMedicines')}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--slate-100)', textAlign: 'left', borderBottom: '1.5px solid var(--slate-300)' }}>
                  <th style={{ padding: '0.65rem 0.85rem', color: 'var(--slate-700)' }}>#</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: 'var(--slate-700)' }}>{t('medName')}</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: 'var(--slate-700)' }}>{t('dosage')}</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: 'var(--slate-700)' }}>{t('timings')}</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: 'var(--slate-700)' }}>{t('duration')}</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines?.map((med, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                    <td style={{ padding: '0.75rem 0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {med.name}
                      {med.instructions && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--slate-500)' }}>
                          ℹ️ {med.instructions}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', color: 'var(--slate-700)' }}>
                      {med.dosage}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', color: 'var(--slate-700)' }}>
                      {med.timing}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                      {med.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advice & Follow-up */}
        <div
          style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--primary-900)' }}>
              {t('dietLifestyle')}:
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary-800)', marginTop: '2px' }}>
              {lang === 'hi' && prescription.dietAdviceHi ? prescription.dietAdviceHi : prescription.dietAdvice}
            </p>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--primary-900)', fontWeight: 600, marginTop: '4px' }}>
            📅 Next Follow-up: <b>{prescription.nextFollowup || '7 Days'}</b>
          </div>
        </div>

        {/* Footer Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px dashed var(--slate-300)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
            Generated via JivanSetu Rural Telemedicine Platform | National Digital Health Mission Compliant
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.1rem', color: 'var(--primary-800)', fontWeight: 700 }}>
              {prescription.doctorName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', borderTop: '1px solid var(--slate-400)', paddingTop: '2px' }}>
              Authorized Medical Officer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
