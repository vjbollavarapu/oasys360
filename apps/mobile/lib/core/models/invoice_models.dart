/// Invoice Line Item Model
class InvoiceLineItem {
  final String id;
  final String description;
  final double quantity;
  final double unitPrice;
  final double taxRate;
  final double discountRate;
  final double lineTotal;

  InvoiceLineItem({
    required this.id,
    required this.description,
    required this.quantity,
    required this.unitPrice,
    this.taxRate = 0.0,
    this.discountRate = 0.0,
    required this.lineTotal,
  });

  factory InvoiceLineItem.fromJson(Map<String, dynamic> json) {
    final subtotal = ((json['quantity'] ?? 0.0) as num).toDouble() * 
                    ((json['unit_price'] ?? 0.0) as num).toDouble();
    final discount = subtotal * (((json['discount_rate'] ?? 0.0) as num).toDouble() / 100);
    final taxableAmount = subtotal - discount;
    final tax = taxableAmount * (((json['tax_rate'] ?? 0.0) as num).toDouble() / 100);
    final total = subtotal - discount + tax;

    return InvoiceLineItem(
      id: json['id']?.toString() ?? '',
      description: json['description'] ?? '',
      quantity: ((json['quantity'] ?? 0.0) as num).toDouble(),
      unitPrice: ((json['unit_price'] ?? 0.0) as num).toDouble(),
      taxRate: ((json['tax_rate'] ?? 0.0) as num).toDouble(),
      discountRate: ((json['discount_rate'] ?? 0.0) as num).toDouble(),
      lineTotal: ((json['total_amount'] ?? json['line_total'] ?? total) as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id.isNotEmpty) 'id': id,
      'description': description,
      'quantity': quantity,
      'unit_price': unitPrice,
      'tax_rate': taxRate,
      'discount_rate': discountRate,
    };
  }
}

/// Invoice Model
class InvoiceModel {
  final String id;
  final String invoiceNumber;
  final String customerId;
  final String customerName;
  final DateTime invoiceDate;
  final DateTime dueDate;
  final String status; // 'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
  final String paymentTerms;
  final double subtotal;
  final double taxAmount;
  final double discountAmount;
  final double totalAmount;
  final String currency;
  final String? notes;
  final String? termsConditions;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<InvoiceLineItem>? lines;

  InvoiceModel({
    required this.id,
    required this.invoiceNumber,
    required this.customerId,
    required this.customerName,
    required this.invoiceDate,
    required this.dueDate,
    required this.status,
    this.paymentTerms = 'net_30',
    required this.subtotal,
    required this.taxAmount,
    this.discountAmount = 0.0,
    required this.totalAmount,
    this.currency = 'USD',
    this.notes,
    this.termsConditions,
    required this.createdAt,
    required this.updatedAt,
    this.lines,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    final lines = json['lines'];
    return InvoiceModel(
      id: json['id']?.toString() ?? '',
      invoiceNumber: json['invoice_number'] ?? '',
      customerId: json['customer']?.toString() ?? '',
      customerName: json['customer_name'] ?? '',
      invoiceDate: json['invoice_date'] != null
          ? DateTime.parse(json['invoice_date'])
          : DateTime.now(),
      dueDate: json['due_date'] != null
          ? DateTime.parse(json['due_date'])
          : DateTime.now(),
      status: json['status'] ?? 'draft',
      paymentTerms: json['payment_terms'] ?? 'net_30',
      subtotal: ((json['subtotal'] ?? json['total_amount'] ?? 0.0) as num).toDouble() -
                ((json['total_tax'] ?? json['tax_amount'] ?? 0.0) as num).toDouble() -
                ((json['total_discount'] ?? json['discount_amount'] ?? 0.0) as num).toDouble(),
      taxAmount: ((json['total_tax'] ?? json['tax_amount'] ?? 0.0) as num).toDouble(),
      discountAmount: ((json['total_discount'] ?? json['discount_amount'] ?? 0.0) as num).toDouble(),
      totalAmount: ((json['total_amount'] ?? 0.0) as num).toDouble(),
      currency: json['currency'] ?? 'USD',
      notes: json['notes'],
      termsConditions: json['terms_conditions'] ?? json['terms'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      lines: lines != null
          ? (lines as List)
              .map((line) => InvoiceLineItem.fromJson(line as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id.isNotEmpty) 'id': id,
      'invoice_number': invoiceNumber,
      'customer': customerId,
      'invoice_date': invoiceDate.toIso8601String().split('T')[0],
      'due_date': dueDate.toIso8601String().split('T')[0],
      'status': status,
      'payment_terms': paymentTerms,
      'currency': currency,
      if (notes != null) 'notes': notes,
      if (termsConditions != null) 'terms_conditions': termsConditions,
      if (lines != null) 'lines': lines!.map((line) => line.toJson()).toList(),
    };
  }
}

/// Invoice List Response
class InvoiceListResponse {
  final List<InvoiceModel> invoices;
  final int count;
  final String? next;
  final String? previous;

  InvoiceListResponse({
    required this.invoices,
    required this.count,
    this.next,
    this.previous,
  });

  factory InvoiceListResponse.fromJson(Map<String, dynamic> json) {
    final results = json['results'] ?? json['data'] ?? [];
    return InvoiceListResponse(
      invoices: (results as List)
          .map((item) => InvoiceModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      count: json['count'] ?? results.length,
      next: json['next'],
      previous: json['previous'],
    );
  }
}

/// Customer Model (for invoice creation)
class CustomerModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;

  CustomerModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'],
    );
  }
}

