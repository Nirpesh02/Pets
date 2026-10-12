import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      prefixIcon: PrefixIcon,
      suffixIcon: SuffixIcon,
      className = '',
      id,
      required,
      type = 'text',
      multiline = false,
      rows = 3,
      options = null, // for select
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`input-field-group ${error ? 'has-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && <span className="input-required-star"> *</span>}
          </label>
        )}

        <div className="input-control-wrapper">
          {PrefixIcon && (
            <span className="input-prefix-icon">
              <PrefixIcon size={18} />
            </span>
          )}

          {options ? (
            <select
              id={inputId}
              ref={ref}
              className={`app-input app-select ${PrefixIcon ? 'has-prefix' : ''} ${
                SuffixIcon ? 'has-suffix' : ''
              }`}
              required={required}
              {...props}
            >
              {options.map((opt, i) => (
                <option key={i} value={opt.value ?? opt.id ?? opt}>
                  {opt.label ?? opt.name ?? opt}
                </option>
              ))}
            </select>
          ) : multiline ? (
            <textarea
              id={inputId}
              ref={ref}
              rows={rows}
              className={`app-input app-textarea ${PrefixIcon ? 'has-prefix' : ''} ${
                SuffixIcon ? 'has-suffix' : ''
              }`}
              required={required}
              {...props}
            />
          ) : (
            <input
              id={inputId}
              ref={ref}
              type={type}
              className={`app-input ${PrefixIcon ? 'has-prefix' : ''} ${
                SuffixIcon ? 'has-suffix' : ''
              }`}
              required={required}
              {...props}
            />
          )}

          {SuffixIcon && (
            <span className="input-suffix-icon">
              <SuffixIcon size={18} />
            </span>
          )}
        </div>

        {error ? (
          <span className="input-error-text">{error}</span>
        ) : helperText ? (
          <span className="input-helper-text">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
