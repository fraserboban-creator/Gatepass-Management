'use client';

/**
 * Example Component: Error Handling Integration
 * 
 * This component demonstrates how to use the global error handling system
 * in your components. You can use this as a reference for implementing
 * error handling in other parts of the application.
 */

import { useState } from 'react';
import { useError } from '@/context/ErrorContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { handleApiError, handleValidationError } from '@/lib/errorHandling';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ErrorHandlingExample() {
  const { showError } = useError();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);

  // Example 1: Direct error display
  const handleDirectError = () => {
    showError('404 Error', 'This is an example error message.');
  };

  // Example 2: Simulate API error
  const handleApiErrorExample = async () => {
    setLoading(true);
    try {
      // This will fail and trigger error handling
      await api.get('/invalid-endpoint');
    } catch (error) {
      handleApiError(error, showError, 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Using error handler hook
  const handleWithHook = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await api.get('/invalid-endpoint');
    } catch (error) {
      handleError(error, 'Failed to complete action');
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Validation error
  const handleValidationExample = () => {
    const errors = {
      email: ['Email is required', 'Email must be valid'],
      password: ['Password must be at least 8 characters']
    };
    handleValidationError(errors, showError);
  };

  // Example 5: Custom error scenarios
  const handleCustomError = (scenario) => {
    const scenarios = {
      notFound: {
        title: '404 Error',
        message: 'The requested resource could not be found.'
      },
      accessDenied: {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.'
      },
      serverError: {
        title: 'Server Error',
        message: 'An internal server error occurred. Please try again later.'
      },
      networkError: {
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.'
      }
    };

    const error = scenarios[scenario];
    if (error) {
      showError(error.title, error.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Error Handling Examples</h1>

      <div className="space-y-4">
        {/* Example 1 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Example 1: Direct Error Display</h3>
          <p className="text-sm text-blue-700 mb-3">
            Shows how to directly display an error using the useError hook.
          </p>
          <button
            onClick={handleDirectError}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show Direct Error
          </button>
        </div>

        {/* Example 2 */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Example 2: API Error Handling</h3>
          <p className="text-sm text-purple-700 mb-3">
            Demonstrates handling API errors with handleApiError utility.
          </p>
          <button
            onClick={handleApiErrorExample}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Trigger API Error'}
          </button>
        </div>

        {/* Example 3 */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Example 3: Error Handler Hook</h3>
          <p className="text-sm text-green-700 mb-3">
            Shows how to use the useErrorHandler hook for consistent error handling.
          </p>
          <button
            onClick={handleWithHook}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Use Error Handler Hook'}
          </button>
        </div>

        {/* Example 4 */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-900 mb-2">Example 4: Validation Errors</h3>
          <p className="text-sm text-orange-700 mb-3">
            Demonstrates handling multiple validation errors.
          </p>
          <button
            onClick={handleValidationExample}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Show Validation Error
          </button>
        </div>

        {/* Example 5 */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">Example 5: Custom Error Scenarios</h3>
          <p className="text-sm text-red-700 mb-3">
            Shows different error scenarios you might encounter.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleCustomError('notFound')}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              404 Not Found
            </button>
            <button
              onClick={() => handleCustomError('accessDenied')}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Access Denied
            </button>
            <button
              onClick={() => handleCustomError('serverError')}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Server Error
            </button>
            <button
              onClick={() => handleCustomError('networkError')}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Network Error
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How to Use in Your Components:</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { useError } from '@/context/ErrorContext';

export default function MyComponent() {
  const { showError } = useError();

  const handleError = () => {
    showError('Error Title', 'Error message');
  };

  return <button onClick={handleError}>Show Error</button>;
}`}
        </pre>
      </div>
    </div>
  );
}
