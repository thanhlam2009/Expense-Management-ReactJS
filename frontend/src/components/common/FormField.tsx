import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  helpText?: string;
  onChange: (name: string, value: any) => void;
  onBlur?: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  error,
  required = false,
  placeholder,
  disabled = false,
  icon,
  helpText,
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
        <input
          type={type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
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

export default FormField;
