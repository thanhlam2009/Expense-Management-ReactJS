import React from 'react';

interface SelectFieldProps {
  label: string;
  name: string;
  value: any;
  options: Array<{ value: any; label: string }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: string;
  helpText?: string;
  onChange: (name: string, value: any) => void;
  onBlur?: () => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  options,
  error,
  required = false,
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
        <select
          className={`form-select ${error ? 'is-invalid' : ''}`}
          id={name}
          name={name}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={onBlur}
          required={required}
        >
          <option value="">Chọn {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

export default SelectField;
