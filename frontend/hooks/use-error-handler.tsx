/**
 * React Hook for Error Handling
 * Provides error handling functionality for React components
 */

import { useState, useCallback, useEffect } from 'react';
import { errorHandler, ApiError, ErrorContext } from '@/lib/error-handler';

export interface UseErrorHandlerOptions {
  enableNotifications?: boolean;
  enableLogging?: boolean;
  onError?: (error: ApiError) => void;
  onRetry?: () => void;
}

export interface UseErrorHandlerReturn {
  error: ApiError | null;
  isLoading: boolean;
  isRetrying: boolean;
  handleError: (error: any, context?: Partial<ErrorContext>) => void;
  clearError: () => void;
  retry: () => void;
  withErrorHandling: <T>(operation: () => Promise<T>) => Promise<T | null>;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const {
    enableNotifications = true,
    enableLogging = true,
    onError,
    onRetry,
  } = options;

  // Handle error
  const handleError = useCallback((error: any, context?: Partial<ErrorContext>) => {
    const apiError = errorHandler.handleError(error, context);
    setError(apiError);
    
    if (onError) {
      onError(apiError);
    }
  }, [onError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Retry operation
  const retry = useCallback(() => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  }, [onRetry]);

  // Wrap operation with error handling
  const withErrorHandling = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    clearError();

    try {
      const result = await errorHandler.withRetry(operation);
      return result;
    } catch (error) {
      handleError(error, {
        component: 'useErrorHandler',
        action: 'withErrorHandling',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  // Set up error notification listener
  useEffect(() => {
    if (!enableNotifications) return;

    const notificationCallback = (apiError: ApiError) => {
      setError(apiError);
    };

    errorHandler.onError(notificationCallback);

    return () => {
      errorHandler.offError(notificationCallback);
    };
  }, [enableNotifications]);

  return {
    error,
    isLoading,
    isRetrying,
    handleError,
    clearError,
    retry,
    withErrorHandling,
  };
};

// Hook for API operations with error handling
export const useApiOperation = <T>(
  operation: () => Promise<T>,
  options: UseErrorHandlerOptions = {}
) => {
  const errorHandler = useErrorHandler(options);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    const result = await errorHandler.withErrorHandling(async () => {
      const response = await operation();
      setData(response);
      return response;
    });
    return result;
  }, [operation, errorHandler]);

  return {
    ...errorHandler,
    data,
    execute,
  };
};

// Hook for form error handling
export const useFormErrorHandler = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleFormError = useCallback((error: ApiError) => {
    if (error.validation) {
      // Handle validation errors
      const errors: Record<string, string> = {};
      Object.entries(error.validation).forEach(([field, messages]) => {
        errors[field] = Array.isArray(messages) ? messages[0] : messages;
      });
      setFieldErrors(errors);
    } else if (error.field) {
      // Handle field-specific error
      setFieldErrors({ [error.field]: error.message });
    } else {
      // Handle general error
      setGeneralError(error.message);
    }
  }, []);

  const clearFormErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, []);

  const getFieldError = useCallback((field: string) => {
    return fieldErrors[field] || null;
  }, [fieldErrors]);

  const hasFieldError = useCallback((field: string) => {
    return !!fieldErrors[field];
  }, [fieldErrors]);

  const hasErrors = Object.keys(fieldErrors).length > 0 || !!generalError;

  return {
    fieldErrors,
    generalError,
    handleFormError,
    clearFormErrors,
    getFieldError,
    hasFieldError,
    hasErrors,
  };
};

// Hook for toast notifications
export const useErrorNotifications = () => {
  const [notifications, setNotifications] = useState<ApiError[]>([]);

  const addNotification = useCallback((error: ApiError) => {
    setNotifications(prev => [...prev, error]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.timestamp !== error.timestamp));
    }, 5000);
  }, []);

  const removeNotification = useCallback((timestamp: string) => {
    setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Set up error notification listener
  useEffect(() => {
    const notificationCallback = (error: ApiError) => {
      addNotification(error);
    };

    errorHandler.onError(notificationCallback);

    return () => {
      errorHandler.offError(notificationCallback);
    };
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

export default useErrorHandler;
