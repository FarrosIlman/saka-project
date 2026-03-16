import React, { useState } from 'react';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function ExportButton({ userId, exportType = 'progress', variant = 'default' }) {
  // exportType: 'progress-csv', 'progress-pdf', 'users-csv', 'leaderboard-csv'
  const [loading, setLoading] = useState(false);
  const { error } = useToast();

  const handleExport = async (format) => {
    try {
      setLoading(true);
      let endpoint = '';

      switch (exportType) {
        case 'progress-csv':
          endpoint = userId ? `/api/export/progress/csv?userId=${userId}` : '/api/export/progress/csv';
          break;
        case 'progress-pdf':
          endpoint = userId ? `/api/export/progress/pdf?userId=${userId}` : '/api/export/progress/pdf';
          break;
        case 'users-csv':
          endpoint = '/api/export/users/csv';
          break;
        case 'leaderboard-csv':
          endpoint = '/api/export/leaderboard/csv';
          break;
        default:
          throw new Error('Invalid export type');
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal mengekspor data');
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename="')[1].split('"')[0]
        : `export_${Date.now()}.${format === 'pdf' ? 'pdf' : 'csv'}`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      error(err.message || 'Gagal mengekspor data');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (format) => {
    return format === 'pdf' ? <FileText size={16} /> : <File size={16} />;
  };

  const getButtonLabel = (format) => {
    return format === 'pdf' ? 'PDF' : 'CSV';
  };

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleExport('csv')}
          disabled={loading}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <File size={12} />}
          CSV
        </button>
        {exportType.includes('progress') && (
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            PDF
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <button
        onClick={() => handleExport('csv')}
        disabled={loading}
        style={{
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.65 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!loading) e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'none';
        }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <File size={16} />}
        Export CSV
      </button>
      {exportType.includes('progress') && (
        <button
          onClick={() => handleExport('pdf')}
          disabled={loading}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.65 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'none';
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Export PDF
        </button>
      )}
    </div>
  );
}

export default ExportButton;
