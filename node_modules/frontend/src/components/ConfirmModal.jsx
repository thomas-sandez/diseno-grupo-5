import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, title, message, type = 'confirm', onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={48} className="confirm-icon warning" />;
      case 'danger':
        return <AlertCircle size={48} className="confirm-icon danger" />;
      default:
        return <AlertCircle size={48} className="confirm-icon confirm" />;
    }
  };

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-container">
          {getIcon()}
        </div>
        <div className="confirm-content">
          {title && <h3 className="confirm-title">{title}</h3>}
          <p className="confirm-message">{message}</p>
        </div>
        <div className="confirm-buttons">
          <button 
            className="confirm-btn confirm-btn-cancel" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn confirm-btn-confirm ${type === 'danger' ? 'danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
