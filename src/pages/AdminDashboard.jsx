import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useMedicalData } from '../context/MedicalDataContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { IntegrationsHub } from '../components/common/IntegrationsHub';
import {
  Hospital,
  ShieldCheck,
  Activity,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Server,
  MapPin,
  Stethoscope,
  Cpu
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { emergencyList } = useEmergency();
  const { doctorQueue, healthRecords } = useMedicalData();

  const [activeTab, setActiveTab] = useState('providers'); // 'providers' | 'logs' | 'analytics'
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [providers, setProviders] = useState([
    {
      id: 'rmp-201',
      name: 'Dr. Anand Verma',
      role: 'RMP (Rural Medical Practitioner)',
      post: 'Sitapur Rural Post #4',
      phone: '+91 94150 11223',
      status: 'ACTIVE',
      casesHandled: 142
    },
    {
      id: 'doc-301',
      name: 'Dr. Priya Nambiar',
      role: 'Specialist Doctor (Cardiologist)',
      post: 'District Hospital / Tele-Hub',
      phone: '+91 98112 33445',
      status: 'ACTIVE',
      casesHandled: 89
    },
    {
      id: 'rmp-202',
      name: 'Dr. (RMP) Mahesh Prasad',
      role: 'RMP (Rural Medical Practitioner)',
      post: 'Mahmoodabad Sub-Center',
      phone: '+91 98390 44556',
      status: 'ON_LEAVE',
      casesHandled: 98
    },
    {
      id: 'doc-302',
      name: 'Dr. Sanjay Mehrotra',
      role: 'Specialist Doctor (Pulmonology)',
      post: 'District Hospital / Tele-Hub',
      phone: '+91 94500 77889',
      status: 'ACTIVE',
      casesHandled: 114
    }
  ]);

  const [newProvName, setNewProvName] = useState('');
  const [newProvRole, setNewProvRole] = useState('RMP (Rural Medical Practitioner)');
  const [newProvPost, setNewProvPost] = useState('');
  const [newProvPhone, setNewProvPhone] = useState('');

  const handleAddProvider = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `prov-${Date.now().toString().slice(-4)}`,
      name: newProvName,
      role: newProvRole,
      post: newProvPost || 'Rural Health Post',
      phone: newProvPhone || '+91 99999 00000',
      status: 'ACTIVE',
      casesHandled: 0
    };
    setProviders(prev => [newEntry, ...prev]);
    setShowAddProviderModal(false);
    setNewProvName('');
    setNewProvPost('');
    setNewProvPhone('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Admin Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          border: '1px solid var(--slate-700)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Hospital size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'white' }}>
                {lang === 'hi' && user?.nameHi ? user.nameHi : user?.name}
              </h2>
              <span className="badge" style={{ background: 'var(--primary-500)', color: 'white' }}>ADMIN</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-300)', marginTop: '2px' }}>
              {user?.department}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <Server size={18} color="#2dd4bf" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('systemStatus')}</span>
        </div>
      </div>

      {/* 2. System KPI Counters */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700 }}>ON-DUTY PROVIDERS</span>
            <Users size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {providers.filter(p => p.status === 'ACTIVE').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success-600)' }}>100% telemetry online</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700 }}>ACTIVE SOS ALERTS</span>
            <AlertTriangle size={18} color="var(--emergency-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emergency-600)', marginTop: '0.25rem' }}>
            {emergencyList.filter(e => e.status === 'DISPATCHED' || e.status === 'ACCEPTED_BY_RMP').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Average RMP ETA: 5.8m</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700 }}>TOTAL TRIAGE CASES</span>
            <Activity size={18} color="var(--warning-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {doctorQueue.length + 184}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>94% accuracy rating</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700 }}>TELECONSULTS HELD</span>
            <Stethoscope size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {healthRecords.length + 128}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success-600)' }}>Digital prescriptions saved</span>
        </div>
      </div>

      {/* 3. Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1.5px solid var(--slate-200)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('providers')}
          className={`btn btn-sm ${activeTab === 'providers' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Users size={16} />
          {lang === 'hi' ? 'स्वास्थ्य कर्मी व डॉक्टर खाते' : 'Manage Providers (RMPs/Doctors)'}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <AlertTriangle size={16} />
          {lang === 'hi' ? 'आपातकालीन लॉग सूची' : 'Emergency Incident Logs'}
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`btn btn-sm ${activeTab === 'integrations' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Cpu size={16} />
          {lang === 'hi' ? '🔌 थर्ड-पार्टी इंटीग्रेशन हब' : '🔌 3rd-Party Integrations Hub'}
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'providers' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)', fontWeight: 800 }}>
                {lang === 'hi' ? 'पंजीकृत स्वास्थ्य सेवा प्रदाता' : 'Registered Health Providers & Practitioners'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                Oversee on-duty rural medical practitioners and district tele-specialists.
              </p>
            </div>

            <button
              onClick={() => setShowAddProviderModal(true)}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, gap: '0.4rem' }}
            >
              <Plus size={16} />
              {lang === 'hi' ? '+ नया प्रदाता जोड़ें' : '+ Register New Provider'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--slate-100)', textAlign: 'left', borderBottom: '1.5px solid var(--slate-300)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Provider Name</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Role & Specialty</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Assigned Post</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--slate-700)' }}>
                      {p.role}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>
                      {p.post}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>
                      {p.phone}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)', fontWeight: 800 }}>
              {lang === 'hi' ? 'राष्ट्रीय आपातकालीन टेलीमेट्री लॉग' : 'Real-time Emergency Incident Telemetry'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Complete audit trail of SOS triggers, speech triggers, and RMP field responses.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--slate-100)', textAlign: 'left', borderBottom: '1.5px solid var(--slate-300)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Log ID & Time</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Patient</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Trigger Source</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Assigned Responder</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {emergencyList.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ color: 'var(--slate-900)' }}>{log.id}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                      {log.patientName} ({log.age} Yrs)
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{log.location}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-warning">{log.triggerType}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--slate-700)' }}>
                      {log.assignedRmp}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={log.status} urgency={log.urgency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <IntegrationsHub />
      )}

      {/* Add Provider Modal */}
      <Modal
        isOpen={showAddProviderModal}
        onClose={() => setShowAddProviderModal(false)}
        title="Register Health Provider (RMP / Doctor)"
      >
        <form onSubmit={handleAddProvider} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name & Credentials</label>
            <input
              type="text"
              className="form-input"
              value={newProvName}
              onChange={(e) => setNewProvName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Kumar (MD)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Type</label>
            <select
              className="form-select"
              value={newProvRole}
              onChange={(e) => setNewProvRole(e.target.value)}
            >
              <option value="RMP (Rural Medical Practitioner)">RMP (Rural Medical Practitioner)</option>
              <option value="Specialist Doctor (Cardiology)">Specialist Doctor (Cardiology)</option>
              <option value="Specialist Doctor (General Medicine)">Specialist Doctor (General Medicine)</option>
              <option value="Specialist Doctor (Pediatrics)">Specialist Doctor (Pediatrics)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Post / Hospital</label>
            <input
              type="text"
              className="form-input"
              value={newProvPost}
              onChange={(e) => setNewProvPost(e.target.value)}
              placeholder="e.g. Sitapur Health Post #5"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={newProvPhone}
              onChange={(e) => setNewProvPhone(e.target.value)}
              placeholder="+91 98765 00000"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddProviderModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              <CheckCircle2 size={16} />
              Register Provider
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
