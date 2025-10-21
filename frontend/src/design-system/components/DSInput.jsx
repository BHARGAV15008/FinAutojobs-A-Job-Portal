import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const DSInput = forwardRef(function DSInput(
  { id, label, hint, error, className, required, ...props },
  ref
) {
  const inputId = id || props.name || `input-${Math.random().toString(36).slice(2)}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn('w-full space-y-1', className)}>
      {label && (
        <label htmlFor={inputId} className="label-text">
          {label} {required && <span className="text-red-600" aria-hidden>*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'input-field',
          error && 'border-red-500 focus:ring-red-500'
        )}
        required={required}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="help-text">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="help-text text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default DSInput;
