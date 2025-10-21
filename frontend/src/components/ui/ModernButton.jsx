import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';

const ModernButton = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  glow = false,
  onClick,
  type = 'button',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none relative overflow-hidden';

  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs rounded-md gap-1',
    sm: 'px-3 py-2 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
    xl: 'px-8 py-4 text-lg rounded-xl gap-3'
  };

  // Variant classes
  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500'
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500',
    secondary: gradient
      ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl focus:ring-gray-500'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 hover:border-gray-400 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600',
    success: gradient
      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500'
      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500'
      : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg focus:ring-yellow-500',
    error: gradient
      ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500'
      : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
    link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500 p-0 h-auto'
  };

  // Glow effect classes
  const glowClasses = glow ? {
    primary: 'shadow-blue-500/50 hover:shadow-blue-500/75',
    success: 'shadow-green-500/50 hover:shadow-green-500/75',
    warning: 'shadow-yellow-500/50 hover:shadow-yellow-500/75',
    error: 'shadow-red-500/50 hover:shadow-red-500/75'
  }[variant] || 'shadow-blue-500/50 hover:shadow-blue-500/75' : '';

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: variant === 'link' ? 1 : 1.02,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    },
    tap: { 
      scale: variant === 'link' ? 1 : 0.98,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <motion.div
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  // Ripple effect component
  const RippleEffect = () => (
    <motion.div
      className="absolute inset-0 rounded-inherit"
      initial={{ scale: 0, opacity: 0.5 }}
      whileTap={{ scale: 1, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
      }}
    />
  );

  // Combine classes
  const buttonClasses = clsx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    glowClasses,
    {
      'w-full': fullWidth,
      'pointer-events-none': loading || disabled
    },
    className
  );

  return (
    <motion.button
      className={buttonClasses}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {/* Ripple effect */}
      {!disabled && !loading && <RippleEffect />}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-inherit">
        {/* Loading state */}
        {loading && <LoadingSpinner />}
        
        {/* Icon - left position */}
        {icon && iconPosition === 'left' && !loading && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        
        {/* Button text */}
        {children && (
          <span className={clsx({ 'sr-only': loading })}>
            {children}
          </span>
        )}
        
        {/* Icon - right position */}
        {icon && iconPosition === 'right' && !loading && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
      </span>

      {/* Gradient overlay for enhanced hover effect */}
      {gradient && (
        <motion.div
          className="absolute inset-0 rounded-inherit opacity-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
};

ModernButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'outline', 'ghost', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  gradient: PropTypes.bool,
  glow: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default ModernButton;
