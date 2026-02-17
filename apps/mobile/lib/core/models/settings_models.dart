/// User Profile Model (Extended profile information)
class UserProfileModel {
  final String id;
  final String? phone;
  final String timezone;
  final String language;
  final bool twoFactorEnabled;
  final String? web3WalletAddress;
  final String? avatar;
  final String? bio;
  final DateTime? dateOfBirth;
  final String? address;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserProfileModel({
    required this.id,
    this.phone,
    this.timezone = 'UTC',
    this.language = 'en',
    this.twoFactorEnabled = false,
    this.web3WalletAddress,
    this.avatar,
    this.bio,
    this.dateOfBirth,
    this.address,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    return UserProfileModel(
      id: json['id']?.toString() ?? '',
      phone: json['phone'],
      timezone: json['timezone'] ?? 'UTC',
      language: json['language'] ?? 'en',
      twoFactorEnabled: json['two_factor_enabled'] ?? json['twoFactorEnabled'] ?? false,
      web3WalletAddress: json['web3_wallet_address'] ?? json['web3WalletAddress'],
      avatar: json['avatar'],
      bio: json['bio'],
      dateOfBirth: json['date_of_birth'] != null
          ? DateTime.parse(json['date_of_birth'])
          : (json['dateOfBirth'] != null ? DateTime.parse(json['dateOfBirth']) : null),
      address: json['address'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (phone != null) 'phone': phone,
      'timezone': timezone,
      'language': language,
      'two_factor_enabled': twoFactorEnabled,
      if (web3WalletAddress != null) 'web3_wallet_address': web3WalletAddress,
      if (avatar != null) 'avatar': avatar,
      if (bio != null) 'bio': bio,
      if (dateOfBirth != null) 'date_of_birth': dateOfBirth!.toIso8601String().split('T')[0],
      if (address != null) 'address': address,
    };
  }

  UserProfileModel copyWith({
    String? phone,
    String? timezone,
    String? language,
    bool? twoFactorEnabled,
    String? web3WalletAddress,
    String? avatar,
    String? bio,
    DateTime? dateOfBirth,
    String? address,
  }) {
    return UserProfileModel(
      id: id,
      phone: phone ?? this.phone,
      timezone: timezone ?? this.timezone,
      language: language ?? this.language,
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
      web3WalletAddress: web3WalletAddress ?? this.web3WalletAddress,
      avatar: avatar ?? this.avatar,
      bio: bio ?? this.bio,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      address: address ?? this.address,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

/// Password Change Request Model
class PasswordChangeRequest {
  final String oldPassword;
  final String newPassword;
  final String confirmPassword;

  PasswordChangeRequest({
    required this.oldPassword,
    required this.newPassword,
    required this.confirmPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'old_password': oldPassword,
      'new_password': newPassword,
      'confirm_password': confirmPassword,
    };
  }
}

/// Password Change Response Model
class PasswordChangeResponse {
  final String message;
  final bool success;

  PasswordChangeResponse({
    required this.message,
    this.success = true,
  });

  factory PasswordChangeResponse.fromJson(Map<String, dynamic> json) {
    return PasswordChangeResponse(
      message: json['message'] ?? 'Password changed successfully',
      success: json['success'] ?? true,
    );
  }
}

