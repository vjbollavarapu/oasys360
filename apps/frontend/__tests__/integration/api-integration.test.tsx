/**
 * API Integration Tests
 * Tests the complete API integration including client, transformers, and error handling
 */

import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import apiClient, { TokenManager } from '@/lib/api-client';
import { authService, userService, accountingService } from '@/lib/api-services';
import { errorHandler } from '@/lib/error-handler';
import { defaultRequestTransformer, defaultResponseTransformer } from '@/lib/api-transformers';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    TokenManager.getInstance().clearTokens();
  });

  describe('API Client', () => {
    it('should make authenticated requests with token', async () => {
      const mockToken = 'mock-access-token';
      TokenManager.getInstance().setTokens(mockToken, 'mock-refresh-token', 3600);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { id: 1, name: 'Test User' }, success: true }),
      });

      await apiClient.get('/users/me');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should handle token refresh on 401', async () => {
      const mockAccessToken = 'new-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      // First request returns 401
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Token expired' }),
        })
        // Refresh token request
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            access: mockAccessToken,
            refresh: mockRefreshToken,
          }),
        })
        // Retry original request
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { id: 1, name: 'Test User' }, success: true }),
        });

      TokenManager.getInstance().setTokens('expired-token', mockRefreshToken, 3600);

      const response = await apiClient.get('/users/me');

      expect(response.data).toEqual({ id: 1, name: 'Test User' });
      expect(TokenManager.getInstance().getAccessToken()).toBe(mockAccessToken);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/users/me')).rejects.toMatchObject({
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    });
  });

  describe('Data Transformers', () => {
    it('should transform request data to snake_case', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        createdAt: new Date('2023-01-01'),
      };

      const transformed = defaultRequestTransformer.transform(data, {
        dateFields: ['createdAt'],
      });

      expect(transformed).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
        created_at: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should transform response data to camelCase', () => {
      const data = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
        created_at: '2023-01-01T00:00:00.000Z',
        is_active: true,
      };

      const transformed = defaultResponseTransformer.transform(data, {
        dateFields: ['created_at'],
        booleanFields: ['is_active'],
      });

      expect(transformed).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        isActive: true,
      });
    });

    it('should handle nested object transformation', () => {
      const data = {
        user_profile: {
          first_name: 'John',
          last_name: 'Doe',
          contact_info: {
            email_address: 'john@example.com',
            phone_number: '123-456-7890',
          },
        },
        account_settings: {
          is_notifications_enabled: true,
          theme_preference: 'dark',
        },
      };

      const transformed = defaultResponseTransformer.transform(data);

      expect(transformed).toEqual({
        userProfile: {
          firstName: 'John',
          lastName: 'Doe',
          contactInfo: {
            emailAddress: 'john@example.com',
            phoneNumber: '123-456-7890',
          },
        },
        accountSettings: {
          isNotificationsEnabled: true,
          themePreference: 'dark',
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            validation: {
              email: ['Email is required'],
              password: ['Password must be at least 8 characters'],
            },
          },
        },
      };

      const apiError = errorHandler.handleError(validationError);

      expect(apiError).toMatchObject({
        message: 'Validation failed',
        status: 422,
        code: 'VALIDATION_ERROR',
        validation: {
          email: ['Email is required'],
          password: ['Password must be at least 8 characters'],
        },
      });
    });

    it('should handle server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        },
      };

      const apiError = errorHandler.handleError(serverError);

      expect(apiError).toMatchObject({
        message: 'Internal server error',
        status: 500,
        code: 'INTERNAL_ERROR',
      });
    });

    it('should retry failed requests', async () => {
      let attemptCount = 0;
      const mockOperation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('success');
      });

      const result = await errorHandler.withRetry(mockOperation, 3, 100);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
  });

  describe('Service Layer Integration', () => {
    it('should authenticate user and get profile', async () => {
      const loginResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        expires_in: 3600,
      };

      const userResponse = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        is_active: true,
        created_at: '2023-01-01T00:00:00.000Z',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: loginResponse, success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: userResponse, success: true }),
        });

      // Login
      const loginResult = await authService.login('john@example.com', 'password123');
      expect(loginResult.success).toBe(true);

      // Get user profile
      const userResult = await userService.getUserProfile();
      expect(userResult.data).toMatchObject({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
      });
    });

    it('should handle accounting operations with proper transformation', async () => {
      const accountData = {
        name: 'Cash Account',
        accountType: 'asset',
        accountCode: '1000',
        isActive: true,
      };

      const accountResponse = {
        id: 1,
        name: 'Cash Account',
        account_type: 'asset',
        account_code: '1000',
        is_active: true,
        created_at: '2023-01-01T00:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ data: accountResponse, success: true }),
      });

      const result = await accountingService.createAccount(accountData);

      expect(result.data).toMatchObject({
        id: 1,
        name: 'Cash Account',
        accountType: 'asset',
        accountCode: '1000',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
      });
    });

    it('should handle paginated responses', async () => {
      const paginatedResponse = {
        results: [
          { id: 1, name: 'Account 1' },
          { id: 2, name: 'Account 2' },
        ],
        count: 2,
        next: null,
        previous: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: paginatedResponse, success: true }),
      });

      const result = await accountingService.getAccounts({ page: 1, limit: 10 });

      expect(result.data).toMatchObject({
        results: [
          { id: 1, name: 'Account 1' },
          { id: 2, name: 'Account 2' },
        ],
        count: 2,
        next: null,
        previous: null,
      });
    });
  });

  describe('Error Recovery', () => {
    it('should clear tokens and redirect on authentication failure', async () => {
      const mockWindowLocation = {
        href: '',
      };
      Object.defineProperty(window, 'location', {
        value: mockWindowLocation,
        writable: true,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid token' }),
      });

      TokenManager.getInstance().setTokens('invalid-token', 'invalid-refresh', 3600);

      await expect(apiClient.get('/users/me')).rejects.toMatchObject({
        status: 401,
      });

      expect(TokenManager.getInstance().getAccessToken()).toBeNull();
    });
  });
});
