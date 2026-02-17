import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/tenant_model.dart';
import '../services/auth_service.dart';
import '../api/api_exception.dart';

/// Authentication Provider for state management
class AuthProvider extends ChangeNotifier {
  final AuthService _authService;
  
  UserModel? _currentUser;
  TenantModel? _currentTenant;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _errorMessage;
  
  AuthProvider({AuthService? authService})
      : _authService = authService ?? AuthService() {
    _initializeAuth();
  }
  
  // Getters
  UserModel? get currentUser => _currentUser;
  TenantModel? get currentTenant => _currentTenant;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  
  /// Initialize authentication state
  Future<void> _initializeAuth() async {
    _setLoading(true);
    try {
      await _authService.initializeAuth();
      final hasTokens = await _authService.isAuthenticated();
      if (hasTokens) {
        try {
          // Try to get user profile to verify token is still valid
          final user = await _authService.getProfile();
          _currentUser = user;
          _isAuthenticated = true;
        } catch (e) {
          // Token might be expired, clear state
          await _authService.logout();
          _isAuthenticated = false;
          _currentUser = null;
        }
      } else {
        _isAuthenticated = false;
        _currentUser = null;
      }
    } catch (e) {
      _isAuthenticated = false;
      _currentUser = null;
    } finally {
      _setLoading(false);
    }
    notifyListeners();
  }
  
  /// Login user
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _setError(null);
    
    try {
      final loginResponse = await _authService.login(email, password);
      
      // Debug: Log what we're setting
      debugPrint('[AuthProvider] Setting user: ${loginResponse.user.email}, ${loginResponse.user.fullName}');
      debugPrint('[AuthProvider] User ID: ${loginResponse.user.id}');
      debugPrint('[AuthProvider] First name: ${loginResponse.user.firstName}, Last name: ${loginResponse.user.lastName}');
      
      _currentUser = loginResponse.user;
      _currentTenant = loginResponse.tenant;
      _isAuthenticated = true;
      _setLoading(false);
      notifyListeners();
      
      // Debug: Verify it was set
      debugPrint('[AuthProvider] Current user after set: ${_currentUser?.email}, ${_currentUser?.fullName}');
      
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('An unexpected error occurred: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }
  
  /// Logout user
  Future<void> logout() async {
    _setLoading(true);
    _setError(null);
    
    try {
      await _authService.logout();
      _currentUser = null;
      _currentTenant = null;
      _isAuthenticated = false;
    } catch (e) {
      // Even if logout fails on server, clear local state
      _currentUser = null;
      _currentTenant = null;
      _isAuthenticated = false;
      _setError('Logout failed: ${e.toString()}');
    } finally {
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Refresh user profile
  Future<void> refreshProfile() async {
    if (!_isAuthenticated) return;
    
    _setLoading(true);
    try {
      final user = await _authService.getProfile();
      _currentUser = user;
      notifyListeners();
    } catch (e) {
      // If profile fetch fails, user might not be authenticated
      if (e is ApiException && e.statusCode == 401) {
        await logout();
      }
      debugPrint('Failed to refresh profile: $e');
    } finally {
      _setLoading(false);
    }
  }
  
  /// Refresh user (alias for refreshProfile for consistency)
  Future<void> refreshUser() async {
    await refreshProfile();
  }
  
  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
  
  // Private helper methods
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
  
  void _setError(String? message) {
    _errorMessage = message;
  }
}

