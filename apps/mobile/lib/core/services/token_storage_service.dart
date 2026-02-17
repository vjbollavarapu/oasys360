import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Service for securely storing and retrieving authentication tokens
class TokenStorageService {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  
  final FlutterSecureStorage _storage;
  
  TokenStorageService() : _storage = const FlutterSecureStorage(
    // iOS options
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    // iOS options
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
  
  /// Save access token
  Future<void> saveAccessToken(String token) async {
    await _storage.write(key: _accessTokenKey, value: token);
  }
  
  /// Get access token
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  /// Save refresh token
  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }
  
  /// Get refresh token
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }
  
  /// Save both tokens
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await Future.wait([
      saveAccessToken(accessToken),
      saveRefreshToken(refreshToken),
    ]);
  }
  
  /// Clear all tokens
  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }
  
  /// Check if user is logged in (has tokens)
  Future<bool> hasTokens() async {
    final accessToken = await getAccessToken();
    return accessToken != null && accessToken.isNotEmpty;
  }
}

