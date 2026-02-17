import 'package:flutter/foundation.dart';
import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/auth_models.dart';
import '../models/user_model.dart';
import 'token_storage_service.dart';

/// Authentication Service for handling login, logout, and token management
class AuthService {
  final ApiClient _apiClient;
  final TokenStorageService _tokenStorage;
  
  AuthService({
    ApiClient? apiClient,
    TokenStorageService? tokenStorage,
  }) : _apiClient = apiClient ?? ApiClient(),
       _tokenStorage = tokenStorage ?? TokenStorageService();
  
  /// Login user with email and password
  Future<LoginResponse> login(String email, String password) async {
    try {
      final request = LoginRequest(email: email, password: password);
      final response = await _apiClient.post(
        '/auth/login/',
        data: request.toJson(),
      );
      
      if (response.statusCode == 200 && response.data != null) {
        // Debug: Log the response data
        debugPrint('[AuthService] Login response data: ${response.data}');
        
        final loginResponse = LoginResponse.fromJson(response.data);
        
        // Debug: Log parsed user data
        debugPrint('[AuthService] Parsed user: ${loginResponse.user.email}, ${loginResponse.user.fullName}');
        
        // Save tokens to secure storage
        await _tokenStorage.saveTokens(
          loginResponse.tokens.access,
          loginResponse.tokens.refresh,
        );
        
        // Set access token in API client for subsequent requests
        _apiClient.setAuthToken(loginResponse.tokens.access);
        
        return loginResponse;
      } else {
        throw ApiException(
          message: 'Invalid response from server',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: e.toString(),
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Logout user
  Future<void> logout() async {
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      
      if (refreshToken != null) {
        // Try to blacklist the refresh token on the server
        try {
          await _apiClient.post(
            '/auth/logout/',
            data: {'refresh_token': refreshToken},
          );
        } catch (e) {
          // Even if logout fails on server, clear local tokens
          debugPrint('Warning: Logout request failed: $e');
        }
      }
      
      // Clear tokens from local storage
      await _tokenStorage.clearTokens();
      
      // Clear token from API client
      _apiClient.clearAuthToken();
    } catch (e) {
      // Always clear local tokens even if server logout fails
      await _tokenStorage.clearTokens();
      _apiClient.clearAuthToken();
      rethrow;
    }
  }
  
  /// Refresh access token using refresh token
  Future<String> refreshAccessToken() async {
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      
      if (refreshToken == null) {
        throw ApiException(
          message: 'No refresh token available',
          statusCode: 401,
        );
      }
      
      final request = TokenRefreshRequest(refresh: refreshToken);
      final response = await _apiClient.post(
        '/auth/token/refresh/',
        data: request.toJson(),
      );
      
      if (response.statusCode == 200 && response.data != null) {
        final refreshResponse = TokenRefreshResponse.fromJson(response.data);
        
        // Save new access token
        await _tokenStorage.saveAccessToken(refreshResponse.access);
        
        // Update API client with new token
        _apiClient.setAuthToken(refreshResponse.access);
        
        return refreshResponse.access;
      } else {
        throw ApiException(
          message: 'Failed to refresh token',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: e.toString(),
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Get current user profile
  Future<UserModel> getProfile() async {
    try {
      // Use current-user endpoint which returns UserSerializer data directly
      final response = await _apiClient.get(
        '/auth/current-user/',
      );
      
      if (response.statusCode == 200 && response.data != null) {
        // The response.data should be the user object directly
        return UserModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch profile',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: e.toString(),
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Check if user is authenticated (has valid tokens)
  Future<bool> isAuthenticated() async {
    return await _tokenStorage.hasTokens();
  }
  
  /// Initialize API client with stored access token (if available)
  Future<void> initializeAuth() async {
    final accessToken = await _tokenStorage.getAccessToken();
    if (accessToken != null) {
      _apiClient.setAuthToken(accessToken);
    }
  }
  
  /// Get the API client instance (useful for other services)
  ApiClient get apiClient => _apiClient;
}

