import React from 'react';

export default function KPICard({ title, value, icon, color = '#0ea5e9' }) {
  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      transition: 'transform 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: '56px', height: '56px',
        borderRadius: '16px',
        background: `${color}15`, // Background warna icon transparan
        color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          {value}
        </h3>
      </div>
    </div>
  );
}