// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Activity } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading JeevanSetu...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        gap: '1rem',
        width: '100%',
        color: 'var(--primary-700, #0f766e)'
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '3px solid rgba(15, 118, 110, 0.15)',
          borderTopColor: 'var(--primary-600, #0f766e)',
          borderRightColor: 'var(--primary-600, #0f766e)',
          animation: 'spin 0.8s linear infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Activity size={24} style={{ color: 'var(--primary-600, #0f766e)' }} />
      </div>
      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--slate-600, #475569)' }}>
        {label}
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
