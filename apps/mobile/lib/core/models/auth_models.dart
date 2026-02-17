import 'user_model.dart';
import 'tenant_model.dart';

/// Login Request Model
class LoginRequest {
  final String email;
  final String password;
  
  LoginRequest({
    required this.email,
    required this.password,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

/// Login Response Model
class LoginResponse {
  final bool success;
  final UserModel user;
  final TenantModel? tenant;
  final TokenPair tokens;
  final Map<String, dynamic>? navigation;
  
  LoginResponse({
    required this.success,
    required this.user,
    this.tenant,
    required this.tokens,
    this.navigation,
  });
  
  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      success: json['success'] ?? true,
      user: UserModel.fromJson(json['user']),
      tenant: json['tenant'] != null
          ? TenantModel.fromJson(json['tenant'])
          : null,
      tokens: TokenPair.fromJson(json['tokens']),
      navigation: json['navigation'] != null
          ? Map<String, dynamic>.from(json['navigation'])
          : null,
    );
  }
}

/// Token Pair Model (Access + Refresh tokens)
class TokenPair {
  final String access;
  final String refresh;
  
  TokenPair({
    required this.access,
    required this.refresh,
  });
  
  factory TokenPair.fromJson(Map<String, dynamic> json) {
    return TokenPair(
      access: json['access'] ?? '',
      refresh: json['refresh'] ?? '',
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'access': access,
      'refresh': refresh,
    };
  }
}

/// Token Refresh Request Model
class TokenRefreshRequest {
  final String refresh;
  
  TokenRefreshRequest({required this.refresh});
  
  Map<String, dynamic> toJson() {
    return {
      'refresh': refresh,
    };
  }
}

/// Token Refresh Response Model
class TokenRefreshResponse {
  final String access;
  
  TokenRefreshResponse({required this.access});
  
  factory TokenRefreshResponse.fromJson(Map<String, dynamic> json) {
    return TokenRefreshResponse(
      access: json['access'] ?? '',
    );
  }
}

