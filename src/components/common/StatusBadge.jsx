import React from 'react';

export const StatusBadge = ({ status, urgency, score, label }) => {
  let badgeClass = 'badge-neutral';
  let displayLabel = label || status || urgency;

  const normalized = (urgency || status || '').toUpperCase();

  if (normalized.includes('RED') || normalized.includes('EMERGENCY') || normalized.includes('DISPATCHED') || score >= 80) {
    badgeClass = 'badge-emergency';
    displayLabel = label || 'RED / CRITICAL';
  } else if (normalized.includes('YELLOW') || normalized.includes('URGENT') || normalized.includes('WAITING') || (score >= 40 && score < 80)) {
    badgeClass = 'badge-warning';
    displayLabel = label || 'YELLOW / URGENT';
  } else if (normalized.includes('GREEN') || normalized.includes('ROUTINE') || normalized.includes('RESOLVED') || normalized.includes('COMPLETED') || score < 40) {
    badgeClass = 'badge-success';
    displayLabel = label || 'GREEN / ROUTINE';
  } else if (normalized.includes('ACCEPTED') || normalized.includes('IN_PROGRESS')) {
    badgeClass = 'badge-primary';
    displayLabel = label || 'ACCEPTED / EN ROUTE';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {displayLabel}
    </span>
  );
};
