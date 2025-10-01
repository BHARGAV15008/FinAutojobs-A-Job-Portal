/**
 * Unified Button Component
 * Standardizes all button functionality across the website
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { buttonActions } from '../../services/buttonActions';
import { useAuth } from '../../contexts/AuthContext.jsx';

const UnifiedButton = ({
  action, // 'view', 'apply', 'applications', 'save', 'edit', 'delete', 'share', 'contact'
  data, // job, application, or other data object
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  icon = null,
  children,
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [buttonState, setButtonState] = useState({});

  const dataId = data?.id || data?._id || data;
  const buttonId = `${action}-${dataId}`;

  // Subscribe to loading state changes
  useEffect(() => {
    const unsubscribe = buttonActions.onStateChange(buttonId, (loading) => {
      setIsLoading(loading);
    });
    
    return () => {
      // Cleanup subscription if needed
    };
  }, [buttonId]);

  // Get button configuration based on action
  const getButtonConfig = () => {
    // Check if job is expired for apply button
    const isJobExpired = data?.status === 'Expired' || 
                        (data?.applicationDeadline && new Date() > new Date(data.applicationDeadline));
    
    const configs = {
      view: {
        defaultText: 'View Details',
        defaultIcon: '👁️',
        loadingText: 'Loading...',
        handler: () => buttonActions.handleViewDetails(data, {
          onViewDetails: props.onViewDetails,
          showModal: props.showModal
        })
      },
      apply: {
        defaultText: isJobExpired ? 'Job Expired' : 'Apply Now',
        defaultIcon: isJobExpired ? '⏰' : '📝',
        loadingText: 'Applying...',
        disabled: isJobExpired || data?.status !== 'Active',
        handler: () => buttonActions.handleApply(data, {
          user,
          isAuthenticated,
          onApply: props.onApply,
          onAuthRequired: props.onAuthRequired,
          showSuccessModal: props.showSuccessModal
        })
      },
      applications: {
        defaultText: 'Applications',
        defaultIcon: '👥',
        loadingText: 'Loading...',
        handler: () => buttonActions.handleViewApplications(data, {
          user,
          userRole: user?.role,
          onViewApplications: props.onViewApplications
        })
      },
      save: {
        defaultText: buttonState.isSaved ? 'Saved' : 'Save Job',
        defaultIcon: buttonState.isSaved ? '⭐' : '☆',
        loadingText: 'Saving...',
        handler: () => buttonActions.handleSaveJob(data, {
          user,
          isSaved: buttonState.isSaved,
          onSave: (job, saved) => {
            setButtonState(prev => ({ ...prev, isSaved: saved }));
            if (props.onSave) props.onSave(job, saved);
          }
        })
      },
      edit: {
        defaultText: 'Edit',
        defaultIcon: '✏️',
        loadingText: 'Loading...',
        handler: () => buttonActions.handleEdit(data, {
          onEdit: props.onEdit,
          type: props.type || 'job'
        })
      },
      delete: {
        defaultText: 'Delete',
        defaultIcon: '🗑️',
        loadingText: 'Deleting...',
        handler: () => buttonActions.handleDelete(data, {
          onDelete: props.onDelete,
          type: props.type || 'job',
          confirmMessage: props.confirmMessage
        })
      },
      share: {
        defaultText: 'Share',
        defaultIcon: '📤',
        loadingText: 'Sharing...',
        handler: () => buttonActions.handleShare(data, {
          type: props.type || 'job'
        })
      },
      contact: {
        defaultText: 'Contact',
        defaultIcon: '📞',
        loadingText: 'Connecting...',
        handler: () => buttonActions.handleContact(data, {
          onContact: props.onContact,
          type: props.type || 'recruiter'
        })
      }
    };

    return configs[action] || configs.view;
  };

  const config = getButtonConfig();

  // Handle button click
  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isLoading) return;

    try {
      await config.handler();
      
      // Call custom onClick if provided
      if (onClick) {
        onClick(e);
      }
    } catch (error) {
      console.error(`Button action ${action} failed:`, error);
    }
  };

  // Get button styles based on variant and size
  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantStyles = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
      outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
      success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
      warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500"
    };

    const sizeStyles = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2 text-sm",
      large: "px-6 py-3 text-base"
    };

    const isDisabled = disabled || isLoading || config.disabled;
    const disabledStyles = isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

    return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;
  };

  // Get button text
  const getButtonText = () => {
    if (isLoading) return config.loadingText;
    if (children) return children;
    return config.defaultText;
  };

  // Get button icon
  const getButtonIcon = () => {
    if (isLoading) return '⏳';
    if (icon) return icon;
    return config.defaultIcon;
  };

  // Filter out custom props that shouldn't be passed to the button element
  const {
    data: _data,
    variant: _variant,
    size: _size,
    icon: _icon,
    children: _children,
    className: _className,
    disabled: _disabled,
    onClick: _onClick,
    onApply,
    onViewApplications,
    onEdit,
    onDelete,
    onSave,
    onAuthRequired,
    showSuccessModal,
    confirmMessage,
    type,
    ...buttonProps
  } = props;

  const isDisabled = disabled || isLoading || config.disabled;

  return (
    <motion.button
      className={getButtonStyles()}
      onClick={isDisabled ? undefined : handleClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      {...buttonProps}
    >
      <span className="mr-2">{getButtonIcon()}</span>
      {getButtonText()}
    </motion.button>
  );
};

export default UnifiedButton;

// Export specific button components for convenience
export const ViewButton = (props) => <UnifiedButton action="view" {...props} />;
export const ApplyButton = (props) => <UnifiedButton action="apply" {...props} />;
export const ApplicationsButton = (props) => <UnifiedButton action="applications" {...props} />;
export const SaveButton = (props) => <UnifiedButton action="save" {...props} />;
export const EditButton = (props) => <UnifiedButton action="edit" {...props} />;
export const DeleteButton = (props) => <UnifiedButton action="delete" variant="danger" {...props} />;
export const ShareButton = (props) => <UnifiedButton action="share" variant="outline" {...props} />;
export const ContactButton = (props) => <UnifiedButton action="contact" variant="secondary" {...props} />;
