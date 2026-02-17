/// Customer Model
class CustomerModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? city;
  final String? state;
  final String? country;
  final String? postalCode;
  final String? taxId;
  final String currency;
  final String paymentTerms;
  final double? creditLimit;
  final bool isActive;
  final int? totalOrders;
  final double? totalRevenue;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  CustomerModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.city,
    this.state,
    this.country,
    this.postalCode,
    this.taxId,
    this.currency = 'USD',
    this.paymentTerms = 'net_30',
    this.creditLimit,
    this.isActive = true,
    this.totalOrders,
    this.totalRevenue,
    this.createdAt,
    this.updatedAt,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'],
      address: json['address'],
      city: json['city'],
      state: json['state'],
      country: json['country'],
      postalCode: json['postal_code'],
      taxId: json['tax_id'],
      currency: json['currency'] ?? 'USD',
      paymentTerms: json['payment_terms'] ?? 'net_30',
      creditLimit: json['credit_limit'] != null
          ? (json['credit_limit'] as num).toDouble()
          : null,
      isActive: json['is_active'] ?? true,
      totalOrders: json['total_orders'],
      totalRevenue: json['total_revenue'] != null
          ? (json['total_revenue'] as num).toDouble()
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (email != null) 'email': email,
      if (phone != null) 'phone': phone,
      if (address != null) 'address': address,
      if (city != null) 'city': city,
      if (state != null) 'state': state,
      if (country != null) 'country': country,
      if (postalCode != null) 'postal_code': postalCode,
      if (taxId != null) 'tax_id': taxId,
      'currency': currency,
      'payment_terms': paymentTerms,
      if (creditLimit != null) 'credit_limit': creditLimit,
      'is_active': isActive,
    };
  }
}

