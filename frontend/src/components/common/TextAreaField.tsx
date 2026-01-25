import React from 'react';

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: any;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  helpText?: string;
  rows?: number;
  maxLength?: number;
  onChange: (name: string, value: any) => void;
  onBlur?: () => void;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  error,
  required = false,
  placeholder,
  disabled = false,
  icon,
  helpText,
  rows = 3,
  maxLength,
  onChange,
  onBlur
}) => {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {icon && <i className={`${icon} me-2`}></i>}
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      
      <div className="position-relative">
        <textarea
          className={`form-control ${error ? 'is-invalid' : ''}`}
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={onBlur}
          required={required}
        />
        {error && (
          <div className="invalid-feedback d-block">
            <i className="fas fa-exclamation-circle me-1"></i>
            {error}
          </div>
        )}
        {maxLength && (
          <small className="form-text text-muted float-end">
            {value?.length || 0}/{maxLength}
          </small>
        )}
      </div>
      
      {helpText && !error && (
        <small className="form-text text-muted">
          <i className="fas fa-info-circle me-1"></i>
          {helpText}
        </small>
      )}
    </div>
  );
};

export default TextAreaField;
