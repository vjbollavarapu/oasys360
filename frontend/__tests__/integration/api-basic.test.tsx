/**
 * Basic API Integration Tests
 * Simple tests to verify core functionality
 */

import { defaultRequestTransformer, defaultResponseTransformer } from '@/lib/api-transformers';
import { errorHandler } from '@/lib/error-handler';

describe('Basic API Integration Tests', () => {
  describe('Data Transformers', () => {
    it('should transform request data to snake_case', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
      };

      const transformed = defaultRequestTransformer.transform(data);

      expect(transformed).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      });
    });

    it('should transform response data to camelCase', () => {
      const data = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
        is_active: true,
      };

      const transformed = defaultResponseTransformer.transform(data);

      expect(transformed).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        isActive: true,
      });
    });

    it('should handle nested object transformation', () => {
      const data = {
        user_profile: {
          first_name: 'John',
          last_name: 'Doe',
        },
        account_settings: {
          is_notifications_enabled: true,
        },
      };

      const transformed = defaultResponseTransformer.transform(data);

      expect(transformed).toEqual({
        userProfile: {
          firstName: 'John',
          lastName: 'Doe',
        },
        accountSettings: {
          isNotificationsEnabled: true,
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle string errors', () => {
      const error = 'Something went wrong';
      const apiError = errorHandler.handleError(error);

      expect(apiError).toMatchObject({
        message: 'Something went wrong',
        status: 500,
        code: 'UNKNOWN_ERROR',
      });
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const apiError = errorHandler.handleError(error);

      expect(apiError).toMatchObject({
        message: 'Test error',
        status: 500,
        code: 'INTERNAL_ERROR',
      });
    });

    it('should handle object errors', () => {
      const error = {
        message: 'Custom error',
        status: 400,
        code: 'CUSTOM_ERROR',
      };
      const apiError = errorHandler.handleError(error);

      expect(apiError).toMatchObject({
        message: 'Custom error',
        status: 400,
        code: 'CUSTOM_ERROR',
      });
    });
  });

  describe('API Configuration', () => {
    it('should have correct base URL', () => {
      const API_CONFIG = require('@/lib/api-config').default;
      expect(API_CONFIG.API_URL).toBe('http://localhost:8000/api/v1');
    });

    it('should have authentication endpoints', () => {
      const API_CONFIG = require('@/lib/api-config').default;
      expect(API_CONFIG.ENDPOINTS.AUTH.LOGIN).toBe('/auth/login/');
      expect(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout/');
      expect(API_CONFIG.ENDPOINTS.AUTH.REGISTER).toBe('/auth/register/');
    });

    it('should have accounting endpoints', () => {
      const API_CONFIG = require('@/lib/api-config').default;
      expect(API_CONFIG.ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS.LIST).toBe('/accounting/accounts/');
      expect(API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.LIST).toBe('/accounting/journal-entries/');
    });
  });
});
