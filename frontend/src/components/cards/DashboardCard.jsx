import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/dashboard.scss';

const DashboardCard = ({
  title,
  value,
  change,
  changeType = 'positive', // 'positive', 'negative', 'neutral'
  icon,
  gradient = 'blue',
  onClick,
  children,
  className = '',
  loading = false,
  animated = true,
  size = 'default' // 'small', 'default', 'large'
}) => {
  // Enhanced gradient definitions with vibrant, professional color combinations
  const gradients = {
    blue: 'from-blue-500 via-sky-500 to-cyan-500',
    green: 'from-emerald-500 via-green-500 to-teal-500',
    purple: 'from-purple-500 via-violet-500 to-fuchsia-500',
    orange: 'from-orange-500 via-amber-500 to-yellow-500',
    red: 'from-red-500 via-rose-500 to-pink-500',
    indigo: 'from-indigo-500 via-blue-500 to-sky-500',
    pink: 'from-pink-500 via-rose-500 to-red-500',
    teal: 'from-teal-500 via-cyan-500 to-blue-500',
    slate: 'from-slate-500 via-gray-500 to-zinc-500',
    emerald: 'from-emerald-400 via-green-400 to-teal-400'
  };

  // Enhanced background gradients for card backgrounds - more vibrant in light mode
  const backgroundGradients = {
    blue: 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    green: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    purple: 'bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20',
    orange: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20',
    red: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
    indigo: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 dark:from-indigo-900/20 dark:to-sky-900/20',
    pink: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20',
    teal: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20',
    slate: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900/20 dark:to-zinc-900/20',
    emerald: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
  };

  const changeColors = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-400'
  };

  const sizeClasses = {
    small: 'p-3 sm:p-4',
    default: 'p-4 sm:p-5 md:p-6',
    large: 'p-6 sm:p-7 md:p-8'
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    hover: { 
      y: -8,
      scale: 1.02,
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        delay: 0.2,
        duration: 0.5,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2 }
    }
  };

  const valueVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: 0.3,
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl border-2 border-gray-200/60 dark:border-gray-700/50
        bg-white dark:bg-gray-800 backdrop-blur-sm
        shadow-xl hover:shadow-2xl transition-all duration-500
        ${backgroundGradients[gradient]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      variants={animated ? cardVariants : {}}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
      whileHover={animated ? "hover" : {}}
      whileTap={animated && onClick ? "tap" : {}}
      onClick={onClick}
    >
      {/* Animated background pattern - more prominent */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${gradients[gradient]} rounded-full transform translate-x-20 -translate-y-20 blur-2xl`}></div>
        <div className={`absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr ${gradients[gradient]} rounded-full transform -translate-x-16 translate-y-16 blur-2xl`}></div>
      </div>
      
      {/* Animated top border accent */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[gradient]}`}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
      
      <div className={`relative z-10 ${sizeClasses[size]}`}>
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <motion.h3 
                className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h3>
              {icon && (
                <motion.div 
                  className={`p-3 sm:p-3.5 rounded-xl bg-gradient-to-br ${gradients[gradient]} shadow-lg flex items-center justify-center ring-4 ring-white/50 dark:ring-gray-800/50`}
                  variants={animated ? iconVariants : {}}
                  initial={animated ? "initial" : false}
                  animate={animated ? "animate" : false}
                  whileHover={animated ? "hover" : {}}
                >
                  {React.isValidElement(icon) ? React.cloneElement(icon, { 
                    sx: { fontSize: 26, color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' },
                    className: "dashboard-card-icon"
                  }) : icon}
                </motion.div>
              )}
            </div>

            {/* Value */}
            {value !== undefined && (
              <motion.div 
                className="mb-4"
                variants={animated ? valueVariants : {}}
                initial={animated ? "initial" : false}
                animate={animated ? "animate" : false}
              >
                <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </motion.div>
            )}

            {/* Change indicator */}
            {change && (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className={`text-sm font-semibold ${changeColors[changeType]}`}>
                  {changeType === 'positive' && '↗ '}
                  {changeType === 'negative' && '↘ '}
                  {change}
                </span>
                {changeType !== 'neutral' && (
                  <motion.svg
                    className={`w-4 h-4 ml-2 ${changeColors[changeType]}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={changeType === 'positive' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                    />
                  </motion.svg>
                )}
              </motion.div>
            )}

            {/* Custom content */}
            {children && (
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {children}
              </motion.div>
            )}
          </>
        )}
      </div>
      
      {/* Hover glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-md bg-gradient-to-br ${gradients[gradient]} opacity-0`}
        whileHover={{ opacity: 0.05 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default DashboardCard;
