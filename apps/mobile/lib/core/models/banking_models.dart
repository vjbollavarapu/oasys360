/// Bank Account Model
class BankAccountModel {
  final String id;
  final String accountName;
  final String accountNumber;
  final String? bankName;
  final String accountType; // 'checking', 'savings', 'credit', etc.
  final double balance;
  final String currency;
  final bool isActive;
  final DateTime? lastSyncedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  BankAccountModel({
    required this.id,
    required this.accountName,
    required this.accountNumber,
    this.bankName,
    required this.accountType,
    required this.balance,
    this.currency = 'USD',
    this.isActive = true,
    this.lastSyncedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BankAccountModel.fromJson(Map<String, dynamic> json) {
    return BankAccountModel(
      id: json['id']?.toString() ?? '',
      accountName: json['account_name'] ?? json['name'] ?? '',
      accountNumber: json['account_number'] ?? '',
      bankName: json['bank_name'] ?? json['bank']?['name'],
      accountType: json['account_type'] ?? 'checking',
      balance: ((json['balance'] ?? json['current_balance'] ?? 0.0) as num).toDouble(),
      currency: json['currency'] ?? 'USD',
      isActive: json['is_active'] ?? true,
      lastSyncedAt: json['last_synced_at'] != null
          ? DateTime.parse(json['last_synced_at'])
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }
}

/// Bank Transaction Model
class BankTransactionModel {
  final String id;
  final String accountId;
  final String description;
  final double amount;
  final String type; // 'debit', 'credit'
  final DateTime date;
  final String? category;
  final String? reference;
  final bool isReconciled;
  final DateTime createdAt;

  BankTransactionModel({
    required this.id,
    required this.accountId,
    required this.description,
    required this.amount,
    required this.type,
    required this.date,
    this.category,
    this.reference,
    this.isReconciled = false,
    required this.createdAt,
  });

  factory BankTransactionModel.fromJson(Map<String, dynamic> json) {
    return BankTransactionModel(
      id: json['id']?.toString() ?? '',
      accountId: json['account']?.toString() ?? json['account_id'] ?? '',
      description: json['description'] ?? '',
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] ?? ((json['amount'] as num).toDouble() >= 0 ? 'credit' : 'debit'),
      date: json['date'] != null
          ? DateTime.parse(json['date'])
          : DateTime.now(),
      category: json['category'],
      reference: json['reference'],
      isReconciled: json['is_reconciled'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}

/// Bank Account List Response
class BankAccountListResponse {
  final List<BankAccountModel> accounts;
  final double totalBalance;
  final int count;

  BankAccountListResponse({
    required this.accounts,
    required this.totalBalance,
    required this.count,
  });

  factory BankAccountListResponse.fromJson(Map<String, dynamic> json) {
    final results = json['results'] ?? json['data'] ?? json['accounts'] ?? [];
    final accounts = (results as List)
        .map((item) => BankAccountModel.fromJson(item as Map<String, dynamic>))
        .toList();
    
    final totalBalance = accounts.fold<double>(
      0.0,
      (sum, account) => sum + account.balance,
    );
    
    return BankAccountListResponse(
      accounts: accounts,
      totalBalance: json['total_balance'] ?? totalBalance,
      count: json['count'] ?? accounts.length,
    );
  }
}

/// Bank Transaction List Response
class BankTransactionListResponse {
  final List<BankTransactionModel> transactions;
  final int count;
  final String? next;
  final String? previous;

  BankTransactionListResponse({
    required this.transactions,
    required this.count,
    this.next,
    this.previous,
  });

  factory BankTransactionListResponse.fromJson(Map<String, dynamic> json) {
    final results = json['results'] ?? json['data'] ?? [];
    return BankTransactionListResponse(
      transactions: (results as List)
          .map((item) => BankTransactionModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      count: json['count'] ?? results.length,
      next: json['next'],
      previous: json['previous'],
    );
  }
}

