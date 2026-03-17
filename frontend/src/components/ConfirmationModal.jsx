import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

// PASTIKAN TIDAK ADA IMPORT AuthContext DI SINI

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Konfirmasi", 
  cancelText = "Batal",
  type = "warning" 
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertCircle className="icon-danger" size={32} />;
      case 'success': return <CheckCircle2 className="icon-success" size={32} />;
      default: return <HelpCircle className="icon-warning" size={32} />;
    }
  };

  const styles = `
    .modal-overlay {
      position: fixed;
      inset: 0;
      /* Gunakan fixed agar lepas dari batasan parent sidebar */
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      /* Z-index harus sangat tinggi karena dashboard card biasanya punya z-index sendiri */
      z-index: 9999999 !important; 
      padding: 20px;
      opacity: ${isOpen ? '1' : '0'};
      transition: opacity 0.3s ease;
      pointer-events: ${isOpen ? 'auto' : 'none'};
    }

    .modal-content {
      background: white;
      width: 100%;
      max-width: 420px;
      border-radius: 28px;
      padding: 32px;
      /* Shadow sangat dalam agar terlihat melayang di atas card dashboard */
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);
      transform: ${isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)'};
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-align: center;
      position: relative;
      /* Pastikan konten modal juga punya z-index tinggi di atas overlay-nya sendiri */
      z-index: 10000000 !important;
    }

    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .icon-warning { color: #f59e0b; background: #fef3c7; }
    .icon-danger { color: #e11d48; background: #fff1f2; }
    .icon-success { color: #10b981; background: #ecfdf5; }

    .modal-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }

    .modal-message {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .modal-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .btn-modal {
      padding: 14px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-confirm {
      color: white;
      background: ${type === 'danger' ? '#e11d48' : '#0ea5e9'};
    }

    @media (max-width: 480px) {
      .modal-actions { grid-template-columns: 1fr; }
      .btn-cancel { order: 2; }
    }
  `;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{styles}</style>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`icon-wrapper icon-${type}`}>
          {getIcon()}
        </div>
        
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button className="btn-modal btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-modal btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}