import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  isDisabled = false
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle style={{ color: '#ef4444' }} size={32} />;
      case 'success':
        return <CheckCircle2 style={{ color: '#10b981' }} size={32} />;
      case 'info':
        return <Info style={{ color: '#0ea5e9' }} size={32} />;
      case 'warning':
      default:
        return <AlertTriangle style={{ color: '#f59e0b' }} size={32} />;
    }
  };

  const getColorScheme = () => {
    switch (type) {
      case 'danger':
        return '#ef4444';
      case 'success':
        return '#10b981';
      case 'info':
        return '#0ea5e9';
      case 'warning':
      default:
        return '#f59e0b';
    }
  };

  const primaryColor = getColorScheme();

  const styles = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 24px;
      padding: 36px 32px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s ease;
      text-align: center;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-icon {
      margin: 0 auto 16px;
      display: flex;
      justify-content: center;
    }

    .modal-header {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .modal-body {
      font-size: 14px;
      color: #475569;
      margin-bottom: 32px;
      line-height: 1.6;
      white-space: pre-line;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-danger {
      background: ${primaryColor};
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e2e8f0;
      border-color: #cbd5e1;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay" onClick={!isDisabled ? onClose : null}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-icon">{getIcon()}</div>
          <div className="modal-header">{title}</div>
          <div className="modal-body">{message}</div>
          <div className="modal-actions">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isDisabled}
            >
              {cancelText}
            </button>
            <button 
              className="btn btn-danger" 
              onClick={onConfirm}
              disabled={isDisabled}
            >
              {isDisabled && <Loader2 size={16} className="animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}