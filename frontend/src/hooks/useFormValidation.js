import { useState } from 'react';

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return 'Invalid email address';
    }
    return '';
  };

  const validatePassword = (password, isRegister = false) => {
    if (!password) return 'Password is required';
    if (isRegister) {
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (!/\d/.test(password)) return 'Password must contain a number';
      if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
      if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Password must contain a special character';
      }
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return '';
    const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Invalid phone number (10-15 digits)';
    }
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateName = (name, field) => {
    if (!name) return `${field} is required`;
    if (name.length < 2) return `${field} is too short`;
    if (!/^[a-zA-Z\s-']+$/.test(name)) return `${field} can only contain letters`;
    return '';
  };

  const validateRequired = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    return '';
  };

  return {
    errors,
    setErrors,
    validateEmail,
    validatePassword,
    validatePhone,
    validateConfirmPassword,
    validateName,
    validateRequired
  };
};
