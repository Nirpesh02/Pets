import React from 'react';
import { useToast } from '../../context/ToastContext';

export const ToastNotification = ({ id, type = 'info', title, message, onClose }) => {
  return (
    <div className={`toast-card toast-${type}`} role="alert">
      <div className="toast-body">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-msg">{message}</div>
      </div>
      {onClose && (
        <button type="button" className="toast-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

export default ToastNotification;
