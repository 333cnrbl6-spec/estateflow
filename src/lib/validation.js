/**
 * Validation utilities for common data patterns
 */

export const validators = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  },

  isValidPostcode: (postcode) => {
    return postcode && postcode.length >= 3;
  },

  isValidCurrency: (amount) => {
    const num = Number(amount);
    return !isNaN(num) && num >= 0;
  },

  isValidDate: (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  },

  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

export const validateEntity = (data, schema) => {
  const errors = {};

  if (!schema?.properties) return errors;

  Object.entries(schema.properties).forEach(([key, field]) => {
    const value = data[key];

    if (schema.required?.includes(key) && !value) {
      errors[key] = `${key} is required`;
    }

    if (value && field.type === 'string' && typeof value !== 'string') {
      errors[key] = `${key} must be a string`;
    }

    if (value && field.type === 'number' && isNaN(Number(value))) {
      errors[key] = `${key} must be a number`;
    }

    if (field.enum && value && !field.enum.includes(value)) {
      errors[key] = `${key} must be one of: ${field.enum.join(', ')}`;
    }

    if (field.format === 'email' && value && !validators.isValidEmail(value)) {
      errors[key] = `${key} must be a valid email`;
    }

    if (field.format === 'date' && value && !validators.isValidDate(value)) {
      errors[key] = `${key} must be a valid date`;
    }
  });

  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;