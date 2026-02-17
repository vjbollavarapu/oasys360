/// Expense Model (using Journal Entry structure)
class ExpenseModel {
  final String id;
  final String description;
  final String? merchant;
  final double amount;
  final DateTime date;
  final String? category;
  final String? receiptUrl;
  final String? notes;
  final String status; // 'draft', 'posted', 'approved'
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? metadata;

  ExpenseModel({
    required this.id,
    required this.description,
    this.merchant,
    required this.amount,
    required this.date,
    this.category,
    this.receiptUrl,
    this.notes,
    this.status = 'draft',
    required this.createdAt,
    required this.updatedAt,
    this.metadata,
  });

  factory ExpenseModel.fromJson(Map<String, dynamic> json) {
    return ExpenseModel(
      id: json['id']?.toString() ?? '',
      description: json['description'] ?? json['memo'] ?? '',
      merchant: json['merchant'] ?? json['vendor'] ?? json['payee'],
      amount: (json['amount'] ?? json['total'] ?? 0.0).toDouble(),
      date: json['date'] != null
          ? DateTime.parse(json['date'])
          : (json['transaction_date'] != null
              ? DateTime.parse(json['transaction_date'])
              : DateTime.now()),
      category: json['category'] ?? json['account']?['name'],
      receiptUrl: json['receipt_url'] ?? json['receiptUrl'] ?? json['document_url'],
      notes: json['notes'] ?? json['memo'],
      status: json['status'] ?? 'draft',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      metadata: json['metadata'] != null
          ? Map<String, dynamic>.from(json['metadata'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      if (merchant != null) 'merchant': merchant,
      'amount': amount,
      'date': date.toIso8601String().split('T')[0],
      if (category != null) 'category': category,
      if (receiptUrl != null) 'receipt_url': receiptUrl,
      if (notes != null) 'notes': notes,
      'status': status,
    };
  }

  /// Convert to journal entry format for API
  Map<String, dynamic> toJournalEntryJson() {
    return {
      'entry_date': date.toIso8601String().split('T')[0],
      'memo': description,
      'lines': [
        {
          'account': category ?? 'Expenses', // Default expense account
          'debit': amount,
          'credit': 0.0,
          'description': description,
        },
        {
          'account': 'Cash', // Default cash account
          'debit': 0.0,
          'credit': amount,
          'description': description,
        },
      ],
      'metadata': {
        'merchant': merchant,
        'receipt_url': receiptUrl,
        'notes': notes,
        'type': 'expense',
      },
    };
  }
}

/// Expense Create Request Model
class ExpenseCreateRequest {
  final String description;
  final String? merchant;
  final double amount;
  final DateTime date;
  final String? category;
  final String? receiptUrl;
  final String? notes;

  ExpenseCreateRequest({
    required this.description,
    this.merchant,
    required this.amount,
    required this.date,
    this.category,
    this.receiptUrl,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      if (merchant != null) 'merchant': merchant,
      'amount': amount,
      'date': date.toIso8601String().split('T')[0],
      if (category != null) 'category': category,
      if (receiptUrl != null) 'receipt_url': receiptUrl,
      if (notes != null) 'notes': notes,
    };
  }
}

/// Expense List Response Model
class ExpenseListResponse {
  final List<ExpenseModel> expenses;
  final int count;
  final String? next;
  final String? previous;

  ExpenseListResponse({
    required this.expenses,
    required this.count,
    this.next,
    this.previous,
  });

  factory ExpenseListResponse.fromJson(Map<String, dynamic> json) {
    final results = json['results'] ?? json['data'] ?? [];
    return ExpenseListResponse(
      expenses: (results as List)
          .map((item) => ExpenseModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      count: json['count'] ?? results.length,
      next: json['next'],
      previous: json['previous'],
    );
  }
}

