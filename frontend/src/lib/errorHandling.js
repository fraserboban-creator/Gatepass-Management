/**
 * Global Error Handling Utilities
 * 
 * This module provides utilities for consistent error handling across the application.
 * Errors are logged to console for debugging and displayed to users via the error popup.
 */

/**
 * Handle API errors and show appropriate error popup
 * @param {Error} error - The error object
 * @param {Function} showError - The showError function from useError hook
 * @param {string} defaultMessage - Default message if error details are unavailable
 */
export function handleApiError(error, showError, defaultMessage = 'Something went wrong.') {
  console.error('API Error:', error);

  let title = '404 Error';
  let message = defaultMessage;

  if (error?.response?.status === 404) {
    title = '404 Error';
    message = error.response.data?.message || 'The requested resource could not be found.';
  } else if (error?.response?.status === 403) {
    title = 'Access Denied';
    message = error.response.data?.message || 'You do not have permission to access this resource.';
  } else if (error?.response?.status === 401) {
    title = 'Unauthorized';
    message = 'Your session has expired. Please log in again.';
  } else if (error?.response?.status === 500) {
    title = 'Server Error';
    message = error.response.data?.message || 'An internal server error occurred.';
  } else if (error?.response?.status === 400) {
    title = 'Bad Request';
    message = error.response.data?.message || 'The request was invalid.';
  } else if (error?.message === 'Network Error') {
    title = 'Network Error';
    message = 'Unable to connect to the server. Please check your internet connection.';
  }

  showError(title, message);
}

/**
 * Handle component errors
 * @param {Error} error - The error object
 * @param {Function} showError - The showError function from useError hook
 */
export function handleComponentError(error, showError) {
  console.error('Component Error:', error);
  showError('Component Error', 'An error occurred while loading this component. Please try refreshing the page.');
}

/**
 * Handle validation errors
 * @param {Object} errors - Object containing validation errors
 * @param {Function} showError - The showError function from useError hook
 */
export function handleValidationError(errors, showError) {
  console.error('Validation Errors:', errors);
  const errorMessages = Object.values(errors).flat().join(', ');
  showError('Validation Error', errorMessages || 'Please check your input and try again.');
}
