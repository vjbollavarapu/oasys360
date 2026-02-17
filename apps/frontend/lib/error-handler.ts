/**
 * Error Handling Middleware for OASYS Platform
 * Centralized error handling, logging, and user notifications
 */

import React from 'react';
import { AxiosError } from 'axios';
import API_CONFIG from './api-config';

// Error types and interfaces
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  field?: string;
  validation?: Record<string, string[]>;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  tenantId?: string;
  requestId?: string;
  timestamp: string;
}

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableNotifications: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// Error class for custom errors
export class OasysError extends Error {
  public status: number;
  public code: string;
  public category: ErrorCategory;
  public severity: ErrorSeverity;
  public details?: any;
  public context?: ErrorContext;
  public timestamp: string;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'UNKNOWN_ERROR',
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: any,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'OasysError';
    this.status = status;
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.details = details;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

// Error handler class
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorLog: ApiError[] = [];
  private notificationCallbacks: ((error: ApiError) => void)[] = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableNotifications: true,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error',
      ...config,
    };
  }

  // Main error handling method
  handleError(error: any, context?: Partial<ErrorContext>): ApiError {
    const apiError = this.normalizeError(error, context);
    
    if (this.config.enableLogging) {
      this.logError(apiError);
    }

    if (this.config.enableNotifications) {
      this.notifyError(apiError);
    }

    return apiError;
  }

  // Normalize different error types to ApiError
  private normalizeError(error: any, context?: Partial<ErrorContext>): ApiError {
    const timestamp = new Date().toISOString();
    const errorContext: ErrorContext = {
      timestamp,
      ...context,
    };

    // Handle Axios errors
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error, errorContext);
    }

    // Handle OasysError
    if (error instanceof OasysError) {
      return {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details,
        timestamp: error.timestamp,
        requestId: error.context?.requestId,
      };
    }

    // Handle standard Error
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
        code: 'INTERNAL_ERROR',
        details: { stack: error.stack },
        timestamp,
        requestId: errorContext.requestId,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: error,
        status: 500,
        code: 'UNKNOWN_ERROR',
        timestamp,
        requestId: errorContext.requestId,
      };
    }

    // Handle object errors
    if (typeof error === 'object' && error !== null) {
      return {
        message: error.message || 'An unknown error occurred',
        status: error.status || 500,
        code: error.code || 'UNKNOWN_ERROR',
        details: error,
        timestamp,
        requestId: errorContext.requestId,
      };
    }

    // Fallback
    return {
      message: 'An unexpected error occurred',
      status: 500,
      code: 'UNEXPECTED_ERROR',
      details: { originalError: error },
      timestamp,
      requestId: errorContext.requestId,
    };
  }

  // Handle Axios-specific errors
  private handleAxiosError(error: AxiosError, context: ErrorContext): ApiError {
    const { response, request, message } = error;

    if (response) {
      // Server responded with error status
      const { status, data } = response;
      const apiError: ApiError = {
        message: data?.message || data?.detail || this.getDefaultMessage(status),
        status,
        code: data?.code || this.getErrorCode(status),
        details: data,
        timestamp: context.timestamp,
        requestId: context.requestId,
      };

      // Handle validation errors
      if (status === 400 && data?.validation) {
        apiError.validation = data.validation;
        apiError.message = 'Validation failed';
      }

      // Handle field-specific errors
      if (data?.field) {
        apiError.field = data.field;
      }

      return apiError;
    } else if (request) {
      // Request was made but no response received
      return {
        message: API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
        code: 'NETWORK_ERROR',
        details: { request: request },
        timestamp: context.timestamp,
        requestId: context.requestId,
      };
    } else {
      // Something else happened
      return {
        message: message || API_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
        status: 0,
        code: 'REQUEST_ERROR',
        details: { error },
        timestamp: context.timestamp,
        requestId: context.requestId,
      };
    }
  }

  // Get default error message based on status code
  private getDefaultMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists or is in use.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The request took too long to process.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Get error code based on status code
  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'RATE_LIMITED';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      case 502:
        return 'BAD_GATEWAY';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      case 504:
        return 'GATEWAY_TIMEOUT';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  // Log error
  private logError(error: ApiError): void {
    this.errorLog.push(error);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Console logging based on level
    const logMessage = `[${error.timestamp}] ${error.code}: ${error.message}`;
    
    switch (this.config.logLevel) {
      case 'error':
        console.error(logMessage, error);
        break;
      case 'warn':
        console.warn(logMessage, error);
        break;
      case 'info':
        console.info(logMessage, error);
        break;
      case 'debug':
        console.debug(logMessage, error);
        break;
    }

    // Send to external logging service (if configured)
    this.sendToLoggingService(error);
  }

  // Send error to external logging service
  private sendToLoggingService(error: ApiError): void {
    // This would integrate with services like Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  // Notify error to registered callbacks
  private notifyError(error: ApiError): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (notificationError) {
        console.error('Error in notification callback:', notificationError);
      }
    });
  }

  // Register notification callback
  onError(callback: (error: ApiError) => void): void {
    this.notificationCallbacks.push(callback);
  }

  // Remove notification callback
  offError(callback: (error: ApiError) => void): void {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  // Get error log
  getErrorLog(): ApiError[] {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Create custom error
  createError(
    message: string,
    status: number = 500,
    code: string = 'CUSTOM_ERROR',
    details?: any
  ): OasysError {
    return new OasysError(message, status, code, ErrorCategory.CLIENT, ErrorSeverity.MEDIUM, details);
  }

  // Retry mechanism
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
    delay: number = this.config.retryDelay
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Don't retry certain errors
        if (this.shouldNotRetry(error)) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }

    throw lastError;
  }

  // Determine if error should not be retried
  private shouldNotRetry(error: any): boolean {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      // Don't retry client errors (4xx) except 429 (rate limit)
      return status >= 400 && status < 500 && status !== 429;
    }
    return false;
  }
}

// Default error handler instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error scenarios
export const createValidationError = (field: string, message: string): OasysError => {
  return new OasysError(
    message,
    422,
    'VALIDATION_ERROR',
    ErrorCategory.VALIDATION,
    ErrorSeverity.LOW,
    { field }
  );
};

export const createAuthenticationError = (message: string = 'Authentication required'): OasysError => {
  return new OasysError(
    message,
    401,
    'UNAUTHORIZED',
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.HIGH
  );
};

export const createAuthorizationError = (message: string = 'Access denied'): OasysError => {
  return new OasysError(
    message,
    403,
    'FORBIDDEN',
    ErrorCategory.AUTHORIZATION,
    ErrorSeverity.HIGH
  );
};

export const createNetworkError = (message: string = 'Network error'): OasysError => {
  return new OasysError(
    message,
    0,
    'NETWORK_ERROR',
    ErrorCategory.NETWORK,
    ErrorSeverity.MEDIUM
  );
};

// Error boundary helper for React components
export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: {
    fallback?: React.ComponentType<{ error: ApiError }>;
    onError?: (error: ApiError) => void;
  }
) => {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean; error?: ApiError }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
      const apiError = errorHandler.handleError(error, {
        component: Component.name,
        action: 'render',
      });
      
      return { hasError: true, error: apiError };
    }

    componentDidCatch(error: any, errorInfo: any) {
      errorHandler.handleError(error, {
        component: Component.name,
        action: 'componentDidCatch',
        details: errorInfo,
      });
    }

    render() {
      if (this.state.hasError) {
        if (errorBoundaryProps?.fallback) {
          return React.createElement(errorBoundaryProps.fallback, { error: this.state.error! });
        }
        
        return React.createElement('div', { className: 'error-boundary' },
          React.createElement('h2', null, 'Something went wrong'),
          React.createElement('p', null, this.state.error?.message || 'An unexpected error occurred'),
          React.createElement('button', { 
            onClick: () => this.setState({ hasError: false, error: undefined }) 
          }, 'Try again')
        );
      }

      return React.createElement(Component, this.props);
    }
  };
};

// Export types and utilities
export type { ApiError, ErrorContext, ErrorHandlerConfig };
