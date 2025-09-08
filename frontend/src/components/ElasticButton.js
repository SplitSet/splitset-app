import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const ElasticButton = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-shopify-600 text-white hover:bg-shopify-700 focus:ring-shopify-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const buttonClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  const elasticVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02, 
      y: -1,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1, ease: 'easeOut' }
    }
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Add haptic feedback if available (mobile)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      className={buttonClasses}
      variants={elasticVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : "initial"}
      whileTap={!disabled && !loading ? "tap" : "initial"}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && (
        <div className="mr-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        </div>
      )}
      {children}
    </motion.button>
  );
};

// Icon button variant with enhanced elastic effect
export const ElasticIconButton = ({
  children,
  className = '',
  size = 'md',
  disabled = false,
  onClick,
  ...props
}) => {
  const sizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  const buttonClasses = clsx(
    'inline-flex items-center justify-center rounded-full transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-shopify-500 hover:bg-gray-100',
    sizes[size],
    className
  );

  const iconElasticVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.15, ease: 'easeOut' }
    },
    tap: { 
      scale: 0.9,
      transition: { duration: 0.1, ease: 'easeOut' }
    }
  };

  const handleClick = (e) => {
    if (disabled) return;
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      className={buttonClasses}
      variants={iconElasticVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : "initial"}
      whileTap={!disabled ? "tap" : "initial"}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default ElasticButton;
