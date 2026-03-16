import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const colorConfig = {
    success: {
      bg: '#f0fdf4',
      border: '#dcfce7',
      bgInner: '#ecfdf5',
      text: '#166534',
      icon: '#10b981',
      shadow: 'rgba(16, 185, 129, 0.2)',
    },
    error: {
      bg: '#fef2f2',
      border: '#fee2e2',
      bgInner: '#fff1f2',
      text: '#991b1b',
      icon: '#ef4444',
      shadow: 'rgba(239, 68, 68, 0.2)',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fef3c7',
      bgInner: '#fef9e7',
      text: '#92400e',
      icon: '#f59e0b',
      shadow: 'rgba(245, 158, 11, 0.2)',
    },
    info: {
      bg: '#f0f9ff',
      border: '#e0f2fe',
      bgInner: '#f0f9ff',
      text: '#0c4a6e',
      icon: '#0ea5e9',
      shadow: 'rgba(14, 165, 233, 0.2)',
    },
  };

  const config = colorConfig[type] || colorConfig.success;

  const IconComponent = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }[type] || CheckCircle2;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        left: '20px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
        maxWidth: 'calc(100% - 40px)',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @media (max-width: 480px) {
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        }
      `}</style>
      <div
        style={{
          background: config.bg,
          border: `1.5px solid ${config.border}`,
          borderRadius: '14px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          minHeight: '44px',
          minWidth: '280px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: `0 10px 25px ${config.shadow}`,
        }}
      >
        <IconComponent
          size={20}
          style={{
            color: config.icon,
            flexShrink: 0,
            marginTop: '2px',
          }}
        />
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '14px',
              color: config.text,
              lineHeight: '1.4',
            }}
          >
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: config.icon,
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.6')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Toast Container untuk manage multiple toasts
export const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id || index}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};
