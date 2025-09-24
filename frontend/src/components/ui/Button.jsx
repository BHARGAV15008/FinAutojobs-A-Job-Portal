import React from 'react';
import { theme } from '../../theme';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = theme.components.button.variants[variant] || theme.components.button.variants.primary;
  const sizeClasses = theme.components.button.sizes[size] || theme.components.button.sizes.md;
  
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${loading ? 'relative' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

export default Button;