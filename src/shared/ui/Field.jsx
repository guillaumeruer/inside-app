import { useId } from 'react';
import './field.css';

export function Field({
  label,
  icon: Icon,
  labelAction,
  action,
  hint,
  error,
  after,
  id,
  className = '',
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [inputProps['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;

  const inputClasses = [
    'input',
    Icon && 'input--with-icon',
    action && 'input--with-action',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="field">
      <div className="field__header">
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="input-group">
        {Icon && <Icon className="input-group__icon" aria-hidden="true" />}
        <input
          {...inputProps}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {action}
      </div>

      {after}
      {hint && !error && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
