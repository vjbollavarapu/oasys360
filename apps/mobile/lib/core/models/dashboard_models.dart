/// Dashboard Statistics Model
class DashboardStats {
  final double totalBalance;
  final double expenses;
  final int pendingInvoices;
  final double revenue;
  final double balanceChange; // Percentage change
  final DateTime? lastUpdated;

  DashboardStats({
    required this.totalBalance,
    required this.expenses,
    required this.pendingInvoices,
    required this.revenue,
    this.balanceChange = 0.0,
    this.lastUpdated,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalBalance: (json['total_balance'] ?? json['totalBalance'] ?? 0.0).toDouble(),
      expenses: (json['expenses'] ?? 0.0).toDouble(),
      pendingInvoices: json['pending_invoices'] ?? json['pendingInvoices'] ?? 0,
      revenue: (json['revenue'] ?? 0.0).toDouble(),
      balanceChange: (json['balance_change'] ?? json['balanceChange'] ?? 0.0).toDouble(),
      lastUpdated: json['last_updated'] != null
          ? DateTime.parse(json['last_updated'])
          : (json['lastUpdated'] != null ? DateTime.parse(json['lastUpdated']) : null),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_balance': totalBalance,
      'expenses': expenses,
      'pending_invoices': pendingInvoices,
      'revenue': revenue,
      'balance_change': balanceChange,
      if (lastUpdated != null) 'last_updated': lastUpdated!.toIso8601String(),
    };
  }
}

/// Recent Activity Model
class RecentActivity {
  final String id;
  final String type; // 'transaction', 'invoice', 'expense', etc.
  final String title;
  final String description;
  final double? amount;
  final DateTime timestamp;
  final Map<String, dynamic>? metadata;

  RecentActivity({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    this.amount,
    required this.timestamp,
    this.metadata,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      id: json['id']?.toString() ?? '',
      type: json['type'] ?? 'unknown',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : null,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      metadata: json['metadata'] != null
          ? Map<String, dynamic>.from(json['metadata'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'description': description,
      if (amount != null) 'amount': amount,
      'timestamp': timestamp.toIso8601String(),
      if (metadata != null) 'metadata': metadata,
    };
  }
}

/// Chart Data Point Model
class ChartDataPoint {
  final String label; // Month, week, etc.
  final double value;
  final DateTime? date;

  ChartDataPoint({
    required this.label,
    required this.value,
    this.date,
  });

  factory ChartDataPoint.fromJson(Map<String, dynamic> json) {
    return ChartDataPoint(
      label: json['label'] ?? json['month'] ?? '',
      value: (json['value'] ?? json['revenue'] ?? 0.0).toDouble(),
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'value': value,
      if (date != null) 'date': date!.toIso8601String(),
    };
  }
}

/// Chart Data Model
class ChartData {
  final List<ChartDataPoint> dataPoints;
  final String title;
  final String? unit; // Currency, percentage, etc.

  ChartData({
    required this.dataPoints,
    required this.title,
    this.unit,
  });

  factory ChartData.fromJson(Map<String, dynamic> json) {
    final points = json['data_points'] ?? json['dataPoints'] ?? json['data'] ?? [];
    return ChartData(
      dataPoints: (points as List)
          .map((point) => ChartDataPoint.fromJson(point as Map<String, dynamic>))
          .toList(),
      title: json['title'] ?? '',
      unit: json['unit'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'data_points': dataPoints.map((point) => point.toJson()).toList(),
      'title': title,
      if (unit != null) 'unit': unit,
    };
  }
}

/// Dashboard Data Model (Aggregated)
class DashboardData {
  final DashboardStats stats;
  final List<RecentActivity> recentActivities;
  final ChartData? revenueChart;
  final ChartData? expensesChart;
  final DateTime? lastFetched;

  DashboardData({
    required this.stats,
    required this.recentActivities,
    this.revenueChart,
    this.expensesChart,
    this.lastFetched,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      stats: DashboardStats.fromJson(json['stats'] ?? {}),
      recentActivities: (json['recent_activities'] ?? json['recentActivities'] ?? [])
          .map((activity) => RecentActivity.fromJson(activity as Map<String, dynamic>))
          .toList()
          .cast<RecentActivity>(),
      revenueChart: json['revenue_chart'] != null
          ? ChartData.fromJson(json['revenue_chart'] as Map<String, dynamic>)
          : null,
      expensesChart: json['expenses_chart'] != null
          ? ChartData.fromJson(json['expenses_chart'] as Map<String, dynamic>)
          : null,
      lastFetched: json['last_fetched'] != null
          ? DateTime.parse(json['last_fetched'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stats': stats.toJson(),
      'recent_activities': recentActivities.map((activity) => activity.toJson()).toList(),
      if (revenueChart != null) 'revenue_chart': revenueChart!.toJson(),
      if (expensesChart != null) 'expenses_chart': expensesChart!.toJson(),
      'last_fetched': lastFetched?.toIso8601String(),
    };
  }
}

