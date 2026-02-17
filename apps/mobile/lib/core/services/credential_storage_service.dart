import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Service for storing and retrieving user credentials securely
class CredentialStorageService {
  static const String _rememberMeKey = 'remember_me';
  static const String _savedEmailKey = 'saved_email';
  static const String _savedPasswordKey = 'saved_password';
  
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
  
  /// Save credentials when "Remember me" is checked
  Future<void> saveCredentials(String email, String password, bool rememberMe) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_rememberMeKey, rememberMe);
    
    if (rememberMe) {
      await prefs.setString(_savedEmailKey, email);
      // Save password securely
      await _secureStorage.write(key: _savedPasswordKey, value: password);
    } else {
      // Clear saved credentials if remember me is unchecked
      await prefs.remove(_savedEmailKey);
      await _secureStorage.delete(key: _savedPasswordKey);
    }
  }
  
  /// Get saved email if "Remember me" was previously checked
  Future<String?> getSavedEmail() async {
    final prefs = await SharedPreferences.getInstance();
    final rememberMe = prefs.getBool(_rememberMeKey) ?? false;
    if (rememberMe) {
      return prefs.getString(_savedEmailKey);
    }
    return null;
  }
  
  /// Get saved password if "Remember me" was previously checked
  Future<String?> getSavedPassword() async {
    final prefs = await SharedPreferences.getInstance();
    final rememberMe = prefs.getBool(_rememberMeKey) ?? false;
    if (rememberMe) {
      return await _secureStorage.read(key: _savedPasswordKey);
    }
    return null;
  }
  
  /// Check if "Remember me" was previously checked
  Future<bool> shouldRememberMe() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_rememberMeKey) ?? false;
  }
  
  /// Clear all saved credentials
  Future<void> clearCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_rememberMeKey);
    await prefs.remove(_savedEmailKey);
    await _secureStorage.delete(key: _savedPasswordKey);
  }
}
