/// User Model
class UserModel {
  final String id;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? role;
  final Map<String, dynamic>? permissions;
  final DateTime? dateJoined;
  final DateTime? lastLogin;
  
  UserModel({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.role,
    this.permissions,
    this.dateJoined,
    this.lastLogin,
  });
  
  String get fullName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    } else if (firstName != null) {
      return firstName!;
    } else if (lastName != null) {
      return lastName!;
    }
    return email.split('@').first;
  }
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email'] ?? '',
      firstName: json['first_name'] ?? json['firstName'],
      lastName: json['last_name'] ?? json['lastName'],
      role: json['role'],
      permissions: json['permissions'] != null 
          ? Map<String, dynamic>.from(json['permissions'])
          : null,
      dateJoined: json['date_joined'] != null
          ? DateTime.parse(json['date_joined'])
          : (json['dateJoined'] != null ? DateTime.parse(json['dateJoined']) : null),
      lastLogin: json['last_login'] != null
          ? DateTime.parse(json['last_login'])
          : (json['lastLogin'] != null ? DateTime.parse(json['lastLogin']) : null),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      if (firstName != null) 'first_name': firstName,
      if (lastName != null) 'last_name': lastName,
      if (role != null) 'role': role,
      if (permissions != null) 'permissions': permissions,
      if (dateJoined != null) 'date_joined': dateJoined!.toIso8601String(),
      if (lastLogin != null) 'last_login': lastLogin!.toIso8601String(),
    };
  }
}

