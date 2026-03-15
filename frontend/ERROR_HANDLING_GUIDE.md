# Error Handling System Guide

## Overview

The application now includes a global error handling system with:
- **Error Popup Component**: Displays user-friendly error messages
- **Error Context**: Manages error state globally
- **Error Utilities**: Helper functions for consistent error handling
- **404 Page**: Custom page for invalid routes

## Components

### 1. ErrorPopup Component
Located at: `frontend/src/components/error/ErrorPopup.jsx`

Displays a modal popup with:
- Error icon (red alert circle)
- Customizable title and message
- Close button
- "Return to Dashboard" button

### 2. ErrorContext
Located at: `frontend/src/context/ErrorContext.jsx`

Provides:
- `showError(title, message)` - Display error popup
- `closeError()` - Close error popup
- `error` - Current error state

### 3. Error Utilities
Located at: `frontend/src/lib/errorHandling.js`

Functions:
- `handleApiError(error, showError, defaultMessage)` - Handle API errors
- `handleComponentError(error, showError)` - Handle component errors
- `handleValidationError(errors, showError)` - Handle validation errors

## Usage Examples

### Example 1: Using Error Hook in a Component

```jsx
'use client';

import { useError } from '@/context/ErrorContext';
import { handleApiError } from '@/lib/errorHandling';
import api from '@/lib/api';

export default function MyComponent() {
  const { showError } = useError();

  const fetchData = async () => {
    try {
      const response = await api.get('/some-endpoint');
      // Handle success
    } catch (error) {
      handleApiError(error, showError, 'Failed to fetch data');
    }
  };

  return (
    <button onClick={fetchData}>
      Fetch Data
    </button>
  );
}
```

### Example 2: Direct Error Display

```jsx
'use client';

import { useError } from '@/context/ErrorContext';

export default function MyComponent() {
  const { showError } = useError();

  const handleClick = () => {
    showError('404 Error', 'The page you are looking for does not exist.');
  };

  return (
    <button onClick={handleClick}>
      Show Error
    </button>
  );
}
```

### Example 3: Using Error Handler Hook

```jsx
'use client';

import { useErrorHandler } from '@/hooks/useErrorHandler';
import api from '@/lib/api';

export default function MyComponent() {
  const { handleError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const response = await api.get('/some-endpoint');
      // Handle success
    } catch (error) {
      handleError(error, 'Failed to fetch data');
    }
  };

  return (
    <button onClick={fetchData}>
      Fetch Data
    </button>
  );
}
```

## Error Types Handled

### API Errors
- **404 Not Found**: Resource does not exist
- **403 Forbidden**: Access denied
- **401 Unauthorized**: Session expired
- **500 Server Error**: Internal server error
- **400 Bad Request**: Invalid request

### Network Errors
- Connection failures
- Timeout errors

### Component Errors
- Component loading failures
- Rendering errors

### Validation Errors
- Form validation failures
- Input validation errors

## Layout Changes

### Removed Components
- `DashboardLayout` - No longer used in role-based layouts
- Old `Sidebar` component - Replaced with `FixedSidebar`

### Updated Layouts
All role-based layouts now simply return children:
- `frontend/src/app/student/layout.js`
- `frontend/src/app/security/layout.js`
- `frontend/src/app/coordinator/layout.js`
- `frontend/src/app/admin/layout.js`
- `frontend/src/app/warden/layout.js`

### Single Sidebar
The application now uses only one sidebar:
- `FixedSidebar` - Fixed left sidebar with role-based navigation
- Positioned at `md:ml-64` for desktop
- Mobile responsive with hamburger menu

## 404 Page

Custom 404 page at: `frontend/src/app/not-found.js`

Features:
- Large 404 error icon
- Helpful message
- "Go Back" button
- "Return Home" button

## Best Practices

1. **Always use error handlers** - Don't let errors go unhandled
2. **Provide context** - Include relevant information in error messages
3. **Log for debugging** - Errors are logged to console for development
4. **User-friendly messages** - Show helpful messages to users
5. **Consistent styling** - All errors use the same popup design

## Testing Error Handling

To test the error system:

1. **Test API Error**:
   ```jsx
   const { showError } = useError();
   showError('404 Error', 'Test error message');
   ```

2. **Test 404 Page**:
   - Navigate to `/invalid-route`

3. **Test Error Handler**:
   - Trigger an API error in any component using the error handler

## Future Enhancements

- Error logging service (Sentry, LogRocket, etc.)
- Error analytics and monitoring
- Automatic error recovery
- Error retry mechanisms
- Detailed error tracking
