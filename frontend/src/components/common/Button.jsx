import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = `app-btn btn-${variant} btn-${size} ${fullWidth ? 'btn-block' : ''} ${className}`;

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="btn-spinner animate-spin" size={size === 'sm' ? 14 : 18} />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="btn-icon" size={size === 'sm' ? 14 : 18} />
      )}
      <span className="btn-text">{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="btn-icon" size={size === 'sm' ? 14 : 18} />
      )}
    </button>
  );
};

export default Button;
