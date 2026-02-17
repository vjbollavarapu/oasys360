/// API Configuration for the OASYS360 Mobile App
class ApiConfig {
  // Base URL - can be changed based on environment (dev, staging, production)
  // Default to localhost for development
  // In production, this should be set via environment variables
  static const String defaultBaseUrl = 'http://localhost:8000';
  
  static String _baseUrl = defaultBaseUrl;
  
  /// Get the current base URL
  static String get baseUrl => _baseUrl;
  
  /// Set the base URL (e.g., from environment variables or settings)
  static void setBaseUrl(String url) {
    _baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }
  
  /// Get the API base URL (includes /api/v1/)
  static String get apiBaseUrl => '$_baseUrl/api/v1';
  
  /// Authentication endpoints
  static String get loginEndpoint => '$apiBaseUrl/auth/login/';
  static String get logoutEndpoint => '$apiBaseUrl/auth/logout/';
  static String get profileEndpoint => '$apiBaseUrl/auth/profile/';
  static String get changePasswordEndpoint => '$apiBaseUrl/auth/password/change/';
  static String get forgotPasswordEndpoint => '$apiBaseUrl/auth/password/reset/';
  static String get tokenRefreshEndpoint => '$apiBaseUrl/auth/token/refresh/';
  
  /// Request timeout duration (in seconds)
  static const int timeoutSeconds = 30;
  
  /// Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

