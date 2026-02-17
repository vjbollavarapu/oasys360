/// Tenant Model
class TenantModel {
  final String id;
  final String name;
  final String? domain;
  
  TenantModel({
    required this.id,
    required this.name,
    this.domain,
  });
  
  factory TenantModel.fromJson(Map<String, dynamic> json) {
    return TenantModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      domain: json['domain'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (domain != null) 'domain': domain,
    };
  }
}

