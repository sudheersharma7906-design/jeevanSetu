import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMedicalData } from '../../context/MedicalDataContext';
import {
  Calendar,
  Activity,
  FileText,
  User,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Search,
  Pill,
  Clock
} from 'lucide-react';

export const RecordTimeline = () => {
  const { lang, t } = useLanguage();
  const { healthRecords } = useMedicalData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(healthRecords[0]?.id || null);

  const filteredRecords = healthRecords.filter(rec => {
    const term = searchTerm.toLowerCase();
    const title = (rec.title || '').toLowerCase();
    const doctor = (rec.doctor || '').toLowerCase();
    const notes = (rec.notes || '').toLowerCase();
    return title.includes(term) || doctor.includes(term) || notes.includes(term);
  });

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>
            {t('recordHistoryTitle')}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            {filteredRecords.length} {lang === 'hi' ? 'स्वास्थ्य घटनाएं दर्ज' : 'clinical episodes recorded'}
          </span>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search
            size={16}
            color="var(--slate-400)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'hi' ? 'रिकॉर्ड खोजें...' : 'Search medical history...'}
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div style={{ position: 'relative', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
        {/* Vertical timeline spine */}
        <div
          style={{
            position: 'absolute',
            left: '7px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: 'var(--slate-300)'
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredRecords.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <div key={record.id} style={{ position: 'relative' }}>
                {/* Timeline node icon */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '12px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--primary-600)',
                    border: '3px solid white',
                    boxShadow: '0 0 0 2px var(--primary-200)'
                  }}
                />

                {/* Timeline Card */}
                <div
                  className="card"
                  style={{
                    padding: '1.25rem',
                    transition: 'all 0.2s ease',
                    border: isExpanded ? '1.5px solid var(--primary-400)' : '1px solid var(--slate-200)',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleExpand(record.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                          {lang === 'hi' && record.titleHi ? record.titleHi : record.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={13} />
                            {record.date}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Stethoscope size={13} />
                            {record.doctor}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.25rem', color: 'var(--slate-500)' }}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--slate-200)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {/* Vitals */}
                      {record.vitals && (
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                            {t('vitalsSummary')}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                            {Object.entries(record.vitals).map(([key, val]) => (
                              <span
                                key={key}
                                style={{
                                  background: 'var(--slate-100)',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  color: 'var(--slate-800)',
                                  fontWeight: 600
                                }}
                              >
                                {key.toUpperCase()}: {val}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clinical Notes */}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                          {t('doctorRemarks')}
                        </span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '0.25rem', background: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                          {lang === 'hi' && record.notesHi ? record.notesHi : record.notes}
                        </p>
                      </div>

                      {/* Prescribed medicines summary if present */}
                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                            {lang === 'hi' ? 'दवाइयां' : 'Prescribed Medicines'}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                            {record.prescriptions.map((p, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  background: 'var(--primary-50)',
                                  border: '1px solid var(--primary-200)',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  color: 'var(--primary-800)'
                                }}
                              >
                                <Pill size={12} />
                                <span><b>{p.medicine}</b> ({p.dosage})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
