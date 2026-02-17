import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/dashboard_models.dart';

/// Dashboard Service - Aggregates data from multiple API endpoints
class DashboardService {
  final ApiClient _apiClient;
  
  DashboardService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();
  
  /// Get dashboard statistics
  /// Aggregates data from banking stats, invoice stats, and accounting
  Future<DashboardStats> getDashboardStats() async {
    try {
      // Fetch data from multiple endpoints in parallel
      final futures = await Future.wait<Map<String, dynamic>>([
        _getBankingStats().catchError((e) => <String, dynamic>{}),
        _getInvoiceStats().catchError((e) => <String, dynamic>{}),
        _getAccountSummary().catchError((e) => <String, dynamic>{}),
      ]);
      
      final bankingStats = futures[0];
      final invoiceStats = futures[1];
      final accountSummary = futures[2];
      
      // Aggregate the data
      final totalBalance = (bankingStats['total_balance'] ?? 
                           accountSummary['total_balance'] ?? 
                           bankingStats['total_liquidity'] ?? 0.0).toDouble();
      
      final expenses = (accountSummary['total_expenses'] ?? 
                       accountSummary['expenses'] ?? 0.0).toDouble();
      
      final pendingInvoices = invoiceStats['pending_invoices'] ?? 
                             invoiceStats['unpaid_count'] ?? 0;
      
      final revenue = (invoiceStats['total_revenue'] ?? 
                      invoiceStats['paid_amount'] ?? 0.0).toDouble();
      
      // Calculate balance change if previous balance is available
      final previousBalance = bankingStats['previous_balance'] ?? 0.0;
      double balanceChange = 0.0;
      if (previousBalance > 0) {
        balanceChange = ((totalBalance - previousBalance) / previousBalance) * 100;
      }
      
      return DashboardStats(
        totalBalance: totalBalance,
        expenses: expenses,
        pendingInvoices: pendingInvoices,
        revenue: revenue,
        balanceChange: balanceChange,
        lastUpdated: DateTime.now(),
      );
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to fetch dashboard stats: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Get banking statistics
  Future<Map<String, dynamic>> _getBankingStats() async {
    try {
      final response = await _apiClient.get('/banking/stats/');
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      // Return empty map if endpoint doesn't exist or fails
      return {};
    }
  }
  
  /// Get invoice statistics
  Future<Map<String, dynamic>> _getInvoiceStats() async {
    try {
      final response = await _apiClient.get('/invoicing/invoices/stats/');
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      // Return empty map if endpoint doesn't exist or fails
      return {};
    }
  }
  
  /// Get account summary
  Future<Map<String, dynamic>> _getAccountSummary() async {
    try {
      final response = await _apiClient.get('/banking/accounts/summary/');
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      // Return empty map if endpoint doesn't exist or fails
      return {};
    }
  }
  
  /// Get recent activities
  /// Fetches from multiple sources: transactions, invoices, expenses
  Future<List<RecentActivity>> getRecentActivities({int limit = 10}) async {
    try {
      final activities = <RecentActivity>[];
      
      // Fetch recent transactions
      try {
        final transactionsResponse = await _apiClient.get(
          '/banking/transactions/',
          queryParameters: {'limit': limit, 'ordering': '-date'},
        );
        if (transactionsResponse.statusCode == 200 && transactionsResponse.data != null) {
          final data = transactionsResponse.data;
          final results = data is Map ? (data['results'] ?? data['data'] ?? []) : (data as List);
          for (var item in results) {
            final transaction = item as Map<String, dynamic>;
            activities.add(RecentActivity(
              id: transaction['id']?.toString() ?? '',
              type: 'transaction',
              title: transaction['description'] ?? 'Bank Transaction',
              description: transaction['description'] ?? '',
              amount: transaction['amount'] != null 
                  ? (transaction['amount'] as num).toDouble() 
                  : null,
              timestamp: transaction['date'] != null
                  ? DateTime.parse(transaction['date'])
                  : DateTime.now(),
              metadata: {'category': transaction['category']},
            ));
          }
        }
      } catch (e) {
        // Continue if transactions endpoint fails
      }
      
      // Fetch recent invoices
      try {
        final invoicesResponse = await _apiClient.get(
          '/invoicing/invoices/',
          queryParameters: {'limit': limit, 'ordering': '-created_at'},
        );
        if (invoicesResponse.statusCode == 200 && invoicesResponse.data != null) {
          final data = invoicesResponse.data;
          final results = data is Map ? (data['results'] ?? data['data'] ?? []) : (data as List);
          for (var item in results) {
            final invoice = item as Map<String, dynamic>;
            activities.add(RecentActivity(
              id: invoice['id']?.toString() ?? '',
              type: 'invoice',
              title: 'Invoice ${invoice['invoice_number'] ?? invoice['id']}',
              description: invoice['customer_name'] ?? 'Invoice',
              amount: invoice['total'] != null 
                  ? (invoice['total'] as num).toDouble() 
                  : null,
              timestamp: invoice['created_at'] != null
                  ? DateTime.parse(invoice['created_at'])
                  : DateTime.now(),
              metadata: {'status': invoice['status']},
            ));
          }
        }
      } catch (e) {
        // Continue if invoices endpoint fails
      }
      
      // Sort by timestamp and limit
      activities.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      return activities.take(limit).toList();
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to fetch recent activities: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Get revenue chart data
  Future<ChartData> getRevenueChart({int months = 6}) async {
    try {
      // Try to get invoice stats with monthly breakdown
      final response = await _apiClient.get('/invoicing/invoices/stats/');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final monthlyData = data['monthly_revenue'] ?? data['payment_trends'] ?? [];
        
        if (monthlyData is List && monthlyData.isNotEmpty) {
          final dataPoints = monthlyData
              .map((item) => ChartDataPoint.fromJson(item as Map<String, dynamic>))
              .toList();
          return ChartData(
            dataPoints: dataPoints,
            title: 'Revenue',
            unit: 'USD',
          );
        }
      }
      
      // Return empty chart if no data available
      return ChartData(
        dataPoints: [],
        title: 'Revenue',
        unit: 'USD',
      );
    } catch (e) {
      // Return empty chart on error
      return ChartData(
        dataPoints: [],
        title: 'Revenue',
        unit: 'USD',
      );
    }
  }
  
  /// Get expenses chart data
  Future<ChartData> getExpensesChart({int months = 6}) async {
    try {
      // Try to get accounting transactions with expense filter
      await _apiClient.get(
        '/accounting/journal-entries/',
        queryParameters: {
          'limit': 100,
          'type': 'expense',
        },
      );
      
      // For now, return empty chart - can be enhanced with actual expense aggregation
      return ChartData(
        dataPoints: [],
        title: 'Expenses',
        unit: 'USD',
      );
    } catch (e) {
      // Return empty chart on error
      return ChartData(
        dataPoints: [],
        title: 'Expenses',
        unit: 'USD',
      );
    }
  }
  
  /// Get complete dashboard data
  Future<DashboardData> getDashboardData() async {
    try {
      final futures = await Future.wait([
        getDashboardStats(),
        getRecentActivities(),
        getRevenueChart(),
        getExpensesChart(),
      ]);
      
      return DashboardData(
        stats: futures[0] as DashboardStats,
        recentActivities: futures[1] as List<RecentActivity>,
        revenueChart: futures[2] as ChartData,
        expensesChart: futures[3] as ChartData,
        lastFetched: DateTime.now(),
      );
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to fetch dashboard data: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }
}

