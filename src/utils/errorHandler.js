/**
 * Error handler utility for API responses
 * Converts backend validation errors to a format the frontend can easily use
 */

/**
 * Parse validation errors from API response
 * @param {Error} error - Axios error object
 * @returns {Object} - { fieldErrors: {}, message: string, isValidationError: boolean }
 */
export const parseApiError = (error) => {
  const fieldErrors = {};
  let message = 'An error occurred';
  let isValidationError = false;

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Handle validation errors (400 status with errors array)
    if (status === 400 && data.errors && Array.isArray(data.errors)) {
      isValidationError = true;
      data.errors.forEach((err) => {
        fieldErrors[err.field] = err.message;
      });
      message = 'Please fix the validation errors below';
    }
    // Handle generic error message from backend
    else if (data.message) {
      message = data.message;
    }
    // Handle 401 - Unauthorized
    else if (status === 401) {
      message = 'Authentication failed. Please log in again.';
    }
    // Handle 403 - Forbidden
    else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    }
    // Handle 429 - Too many requests
    else if (status === 429) {
      message = data.message || 'Too many requests. Please try again later.';
    }
    // Handle 500 - Server error
    else if (status === 500) {
      message = 'Server error. Please try again later.';
    }
  } else if (error.message) {
    message = error.message;
  }

  return {
    fieldErrors,
    message,
    isValidationError,
  };
};

/**
 * Get field error message
 * @param {Object} fieldErrors - Field errors object
 * @param {string} fieldName - Name of the field
 * @returns {string} - Error message or empty string
 */
export const getFieldError = (fieldErrors, fieldName) => {
  return fieldErrors[fieldName] || '';
};

/**
 * Check if field has error
 * @param {Object} fieldErrors - Field errors object
 * @param {string} fieldName - Name of the field
 * @returns {boolean} - True if field has error
 */
export const hasFieldError = (fieldErrors, fieldName) => {
  return !!fieldErrors[fieldName];
};

export default parseApiError;
