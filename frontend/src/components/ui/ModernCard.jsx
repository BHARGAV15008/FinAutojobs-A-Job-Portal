import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';

const ModernCard = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  gradient = false,
  glassMorphism = false,
  shadow = 'base',
  padding = 'default',
  borderRadius = 'xl',
  onClick,
  ...props
}) => {
  // Base classes
  const baseClasses = 'relative transition-all duration-300 ease-in-out';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700',
    secondary: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-600',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700',
    warning: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700',
    error: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700',
    transparent: 'bg-transparent border-0'
  };

  // Gradient overlay classes
  const gradientClasses = {
    ocean: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0',
    sunset: 'bg-gradient-to-br from-orange-400 to-pink-400 text-white border-0',
    forest: 'bg-gradient-to-br from-green-400 to-teal-500 text-white border-0',
    aurora: 'bg-gradient-to-br from-purple-400 to-pink-300 text-white border-0',
    cosmic: 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white border-0',
    fire: 'bg-gradient-to-br from-red-500 to-orange-500 text-white border-0',
    royal: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0',
    magic: 'bg-gradient-to-br from-pink-500 to-violet-500 text-white border-0'
  };

  // Glass morphism classes
  const glassClasses = glassMorphism ? 
    'backdrop-blur-lg bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20' : '';

  // Shadow classes
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    base: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    float: 'shadow-lg hover:shadow-2xl',
    glow: 'shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
  };

  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  // Border radius classes
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  };

  // Hover animation variants
  const hoverVariants = {
    default: {
      scale: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0
    },
    hover: {
      scale: hover ? 1.02 : 1,
      y: hover ? -4 : 0,
      rotateX: hover ? 2 : 0,
      rotateY: hover ? 1 : 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Click animation variants
  const tapVariants = {
    tap: {
      scale: 0.98,
      y: 0
    }
  };

  // Combine all classes
  const cardClasses = clsx(
    baseClasses,
    glassMorphism ? glassClasses : (gradient && typeof gradient === 'string' ? gradientClasses[gradient] : variantClasses[variant]),
    shadowClasses[shadow],
    paddingClasses[padding],
    radiusClasses[borderRadius],
    {
      'cursor-pointer': onClick,
      'overflow-hidden': true
    },
    className
  );

  return (
    <motion.div
      className={cardClasses}
      variants={hoverVariants}
      initial="default"
      whileHover="hover"
      whileTap={onClick ? tapVariants.tap : undefined}
      onClick={onClick}
      {...props}
    >
      {/* Floating effect overlay */}
      {hover && !glassMorphism && (
        <motion.div
          className="absolute inset-0 rounded-inherit opacity-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

ModernCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'transparent']),
  hover: PropTypes.bool,
  gradient: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['ocean', 'sunset', 'forest', 'aurora', 'cosmic', 'fire', 'royal', 'magic'])
  ]),
  glassMorphism: PropTypes.bool,
  shadow: PropTypes.oneOf(['none', 'sm', 'base', 'lg', 'xl', '2xl', 'float', 'glow']),
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  borderRadius: PropTypes.oneOf(['none', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', 'full']),
  onClick: PropTypes.func
};

export default ModernCard;
