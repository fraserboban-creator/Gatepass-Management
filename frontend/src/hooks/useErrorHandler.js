import { useError } from '@/context/ErrorContext';
import { useCallback } from 'react';

export function useErrorHandler() {
  const { showError } = useError();

  const handleError = useCallback((error, defaultMessage = 'Something went wrong.') => {
    console.error('Error:', error);

    let title = '404 Error';
    let message = defaultMessage;

    if (error?.response?.status === 404) {
      title = '404 Error';
      message = error.response.data?.message || 'The requested resource could not be found.';
    } else if (error?.response?.status === 403) {
      title = 'Access Denied';
      message = error.response.data?.message || 'You do not have permission to access this resource.';
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
  }, [showError]);

  return { handleError };
}
