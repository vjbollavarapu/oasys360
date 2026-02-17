import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/settings_models.dart';

/// Settings Service for managing user profile and account settings
class SettingsService {
  final ApiClient _apiClient;
  
  SettingsService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();
  
  /// Get user profile
  Future<UserProfileModel> getProfile() async {
    try {
      final response = await _apiClient.get('/auth/profile/');
      
      if (response.statusCode == 200 && response.data != null) {
        return UserProfileModel.fromJson(response.data);
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
  
  /// Update user profile
  Future<UserProfileModel> updateProfile(UserProfileModel profile) async {
    try {
      final response = await _apiClient.put(
        '/auth/profile/',
        data: profile.toJson(),
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return UserProfileModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to update profile',
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
  
  /// Update user profile (partial update)
  Future<UserProfileModel> updateProfilePartial(Map<String, dynamic> updates) async {
    try {
      final response = await _apiClient.patch(
        '/auth/profile/',
        data: updates,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return UserProfileModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to update profile',
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
  
  /// Change password
  Future<PasswordChangeResponse> changePassword(PasswordChangeRequest request) async {
    try {
      // Validate passwords match
      if (request.newPassword != request.confirmPassword) {
        throw ApiException(
          message: 'New password and confirm password do not match',
          statusCode: 400,
        );
      }
      
      final response = await _apiClient.post(
        '/auth/password/change/',
        data: {
          'old_password': request.oldPassword,
          'new_password': request.newPassword,
        },
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return PasswordChangeResponse.fromJson(response.data);
      } else {
        // Try to extract error message from response
        String errorMessage = 'Failed to change password';
        if (response.data is Map) {
          final data = response.data as Map;
          if (data.containsKey('error')) {
            errorMessage = data['error'].toString();
          } else if (data.containsKey('message')) {
            errorMessage = data['message'].toString();
          } else if (data.containsKey('non_field_errors')) {
            errorMessage = data['non_field_errors'].toString();
          }
        }
        
        throw ApiException(
          message: errorMessage,
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
  
  /// Update two-factor authentication status
  Future<UserProfileModel> updateTwoFactor(bool enabled) async {
    return await updateProfilePartial({
      'two_factor_enabled': enabled,
    });
  }
  
  /// Update language preference
  Future<UserProfileModel> updateLanguage(String language) async {
    return await updateProfilePartial({
      'language': language,
    });
  }
  
  /// Update timezone preference
  Future<UserProfileModel> updateTimezone(String timezone) async {
    return await updateProfilePartial({
      'timezone': timezone,
    });
  }
}

