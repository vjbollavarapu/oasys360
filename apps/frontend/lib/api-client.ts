/**
 * API Client for OASYS Platform
 * Centralized HTTP client with interceptors, error handling, and authentication
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG } from './api-config';


// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  expires_in?: number;
  user: any;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Token management
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, accessToken);
      localStorage.setItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(API_CONFIG.AUTH.TOKEN_EXPIRY_KEY, this.tokenExpiry.toString());
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;

    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
      const expiry = localStorage.getItem(API_CONFIG.AUTH.TOKEN_EXPIRY_KEY);
      if (expiry) {
        this.tokenExpiry = parseInt(expiry);
      }
    }

    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (this.refreshToken) return this.refreshToken;

    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    }

    return this.refreshToken;
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() >= this.tokenExpiry - 60000; // 1 minute buffer
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.AUTH.TOKEN_EXPIRY_KEY);
    }
  }
}

// API Client class
class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.API_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = this.tokenManager.getAccessToken();
        if (token && !this.tokenManager.isTokenExpired()) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        (config as any).metadata = { startTime: Date.now() };

        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log response time for debugging
        if ((response.config as any).metadata) {
          const duration = Date.now() - (response.config as any).metadata.startTime;
          console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 403 Forbidden - automatically logout (no retry, permission denied)
        if (error.response?.status === 403) {
          this.handleLogout();
          return Promise.reject(this.handleError(error));
        }

        // Handle 401 Unauthorized - token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, wait for the refresh to complete
            try {
              const newToken = await this.refreshPromise;
              if (newToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.axiosInstance(originalRequest);
              }
            } catch (refreshError) {
              this.handleLogout();
              return Promise.reject(this.handleError(refreshError as AxiosError));
            }
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.handleLogout();
            return Promise.reject(this.handleError(refreshError as AxiosError));
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = this.tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_CONFIG.API_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;
        this.tokenManager.setTokens(access, refresh, 3600); // 1 hour default

        resolve(access);
      } catch (error) {
        reject(error);
      }
    });

    return this.refreshPromise;
  }

  private handleError(error: AxiosError): ApiError {
    let apiError: ApiError;

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response as { status: number; data: any };
      apiError = {
        message: data?.message || data?.detail || API_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
        status,
        code: data?.code,
        details: data,
      };
    } else if (error.request) {
      // Request was made but no response received
      apiError = {
        message: API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something else happened
      apiError = {
        message: error.message || API_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
        status: 0,
        code: 'UNKNOWN_ERROR',
      };
    }

    // Show toast notification for errors
    // Skip 401s as they are handled by the auth flow (redirect to login)
    if (apiError.status !== 401) {
      toast.error(apiError.message);
    }

    return apiError;
  }

  private handleLogout(): void {
    this.tokenManager.clearTokens();

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    if (response.success && response.data) {
      const { access, refresh, expires_in } = response.data;
      this.tokenManager.setTokens(access, refresh, expires_in || 3600);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.tokenManager.clearTokens();
    }
  }

  async register(userData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.tokenManager.setTokens(token, '', 3600);
  }

  clearAuth(): void {
    this.tokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.tokenManager.getAccessToken() && !this.tokenManager.isTokenExpired();
  }
}

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export types and utilities
export { TokenManager, ApiClient };
