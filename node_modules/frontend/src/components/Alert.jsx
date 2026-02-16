import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import './Alert.css';

const Alert = ({ type = 'info', message, onClose, autoClose = true, duration = 5000 }) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <XCircle size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      case 'info':
      default:
        return <Info size={24} />;
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-icon">
        {getIcon()}
      </div>
      <div className="alert-message">
        {message}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Cerrar alerta">
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
