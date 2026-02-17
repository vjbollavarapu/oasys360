import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/api_config.dart';
import 'api_exception.dart';
import '../services/token_storage_service.dart';

/// Base API Client using Dio for HTTP requests
class ApiClient {
  late Dio _dio;
  final TokenStorageService _tokenStorage;
  
  ApiClient({String? baseUrl, TokenStorageService? tokenStorage})
      : _tokenStorage = tokenStorage ?? TokenStorageService() {
    final apiBaseUrl = baseUrl ?? ApiConfig.apiBaseUrl;
    
    _dio = Dio(
      BaseOptions(
        baseUrl: apiBaseUrl,
        connectTimeout: Duration(seconds: ApiConfig.timeoutSeconds),
        receiveTimeout: Duration(seconds: ApiConfig.timeoutSeconds),
        headers: ApiConfig.defaultHeaders,
      ),
    );
    
    // Add auth interceptor to automatically add tokens (must be first)
    _dio.interceptors.add(_AuthInterceptor(_tokenStorage));
    
    // Add error interceptor (before logging)
    _dio.interceptors.add(_ErrorInterceptor());
    
    // Add logging interceptor (useful for debugging)
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        logPrint: (object) {
          // Use debugPrint in production, or a logging package
          debugPrint('[API] $object');
        },
      ),
    );
  }
  
  /// Set authorization token in headers
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
  
  /// Clear authorization token
  void clearAuthToken() {
    _dio.options.headers.remove('Authorization');
  }
  
  /// GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  /// POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  /// PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  /// PATCH request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  /// DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  /// Handle errors and convert to ApiException
  ApiException _handleError(dynamic error) {
    if (error is DioException) {
      return ApiException.fromDioError(error);
    }
    return ApiException(
      message: error.toString(),
      statusCode: 0,
    );
  }
  
  /// Get the underlying Dio instance (for advanced use cases)
  Dio get dio => _dio;
}

/// Auth interceptor to automatically add tokens to requests
class _AuthInterceptor extends Interceptor {
  final TokenStorageService _tokenStorage;
  
  _AuthInterceptor(this._tokenStorage);
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Skip auth for login/register/password reset endpoints
    if (options.path.contains('/auth/login') || 
        options.path.contains('/auth/register') ||
        options.path.contains('/auth/password/reset') ||
        options.path.contains('/auth/password/forgot')) {
      super.onRequest(options, handler);
      return;
    }
    
    // Get token from storage and add to headers if not already set
    if (!options.headers.containsKey('Authorization')) {
      try {
        final token = await _tokenStorage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
      } catch (e) {
        debugPrint('[AuthInterceptor] Failed to get token: $e');
      }
    }
    
    super.onRequest(options, handler);
  }
}

/// Error interceptor to handle global error scenarios
class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Handle 401 Unauthorized - token expired or invalid
    if (err.response?.statusCode == 401) {
      // Token refresh logic can be added here
      // For now, just pass through the error
      debugPrint('[ErrorInterceptor] 401 Unauthorized - Token may be expired');
    }
    
    super.onError(err, handler);
  }
}

