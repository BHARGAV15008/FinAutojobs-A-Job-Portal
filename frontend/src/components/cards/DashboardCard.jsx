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
  // Enhanced gradient definitions with unique color combinations
  const gradients = {
    blue: 'from-blue-500 via-blue-600 to-indigo-600',
    green: 'from-emerald-500 via-green-600 to-teal-600',
    purple: 'from-purple-500 via-violet-600 to-indigo-600',
    orange: 'from-orange-500 via-amber-600 to-yellow-600',
    red: 'from-red-500 via-rose-600 to-pink-600',
    indigo: 'from-indigo-500 via-blue-600 to-cyan-600',
    pink: 'from-pink-500 via-rose-600 to-red-600',
    teal: 'from-teal-500 via-cyan-600 to-blue-600',
    slate: 'from-slate-500 via-gray-600 to-zinc-600',
    emerald: 'from-emerald-400 via-green-500 to-teal-600'
  };

  // Enhanced background gradients for card backgrounds
  const backgroundGradients = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
    green: 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20',
    purple: 'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20',
    orange: 'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20',
    red: 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20',
    indigo: 'bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20',
    pink: 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20',
    teal: 'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20',
    slate: 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20',
    emerald: 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20'
  };

  const changeColors = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-400'
  };

  const sizeClasses = {
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
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
        relative overflow-hidden rounded-xl border border-gray-200/50 dark:border-gray-700/50
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
        shadow-lg hover:shadow-2xl transition-all duration-500
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
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradients[gradient]} rounded-full transform translate-x-20 -translate-y-20`}></div>
        <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr ${gradients[gradient]} rounded-full transform -translate-x-16 translate-y-16`}></div>
      </div>
      
      {/* Floating light effect */}
      <motion.div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradients[gradient]} opacity-60`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
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
            <div className="flex items-center justify-between mb-6">
              <motion.h3 
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h3>
              {icon && (
                <motion.div 
                  className={`p-3 rounded-xl bg-gradient-to-br ${gradients[gradient]} text-white shadow-lg`}
                  variants={animated ? iconVariants : {}}
                  initial={animated ? "initial" : false}
                  animate={animated ? "animate" : false}
                  whileHover={animated ? "hover" : {}}
                >
                  {icon}
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
                <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
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
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradients[gradient]} opacity-0`}
        whileHover={{ opacity: 0.05 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default DashboardCard;
