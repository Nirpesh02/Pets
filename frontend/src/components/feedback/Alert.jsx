import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const IconComponent = ICONS[variant] || Info;

  return (
    <div className={`alert-box alert-${variant} ${className}`}>
      <div className="alert-icon-wrapper">
        <IconComponent size={20} />
      </div>
      <div className="alert-body">
        {title && <h4 className="alert-title">{title}</h4>}
        <div className="alert-content">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert-close-btn"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
