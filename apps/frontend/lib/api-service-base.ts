/**
 * Base API Service Class
 * Shared base class for all API service classes
 */

import apiClient, { ApiResponse } from './api-client';
import { 
  defaultRequestTransformer, 
  defaultResponseTransformer, 
  TRANSFORM_CONFIGS,
  TransformConfigType 
} from './api-transformers';
import { errorHandler, ErrorContext, OasysError, ErrorCategory, ErrorSeverity } from './error-handler';

// Base service class
export abstract class BaseApiService {
  protected client = apiClient;
  protected requestTransformer = defaultRequestTransformer;
  protected responseTransformer = defaultResponseTransformer;

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: {
      transformConfig?: TransformConfigType;
      context?: Partial<ErrorContext>;
      skipTransform?: boolean;
    }
  ): Promise<ApiResponse<T>> {
    try {
      // Transform request data
      let transformedData = data;
      if (data && !config?.skipTransform && config?.transformConfig) {
        const transformConfig = TRANSFORM_CONFIGS[config.transformConfig];
        transformedData = this.requestTransformer.transform(data, transformConfig);
      }

      // Make API request
      let response: ApiResponse<T>;
      switch (method) {
        case 'GET':
          response = await this.client.get<T>(endpoint);
          break;
        case 'POST':
          response = await this.client.post<T>(endpoint, transformedData);
          break;
        case 'PUT':
          response = await this.client.put<T>(endpoint, transformedData);
          break;
        case 'PATCH':
          response = await this.client.patch<T>(endpoint, transformedData);
          break;
        case 'DELETE':
          response = await this.client.delete<T>(endpoint);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Transform response data
      if (!config?.skipTransform && config?.transformConfig) {
        const transformConfig = TRANSFORM_CONFIGS[config.transformConfig];
        response.data = this.responseTransformer.transform(response.data, transformConfig);
      }

      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, {
        component: this.constructor.name,
        action: `${method} ${endpoint}`,
        ...config?.context,
      });
      // Convert ApiError to OasysError for proper error handling
      throw new OasysError(
        apiError.message || 'An error occurred',
        apiError.status || 500,
        apiError.code || 'UNKNOWN_ERROR',
        apiError.status && apiError.status >= 500 ? ErrorCategory.SERVER : ErrorCategory.CLIENT,
        ErrorSeverity.MEDIUM,
        apiError.details,
        { requestId: apiError.requestId }
      );
    }
  }

  protected async get<T>(endpoint: string, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  protected async post<T>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  protected async put<T>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  protected async patch<T>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  protected async delete<T>(endpoint: string, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }
}

