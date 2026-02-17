import 'package:flutter/foundation.dart';
import '../models/dashboard_models.dart';
import '../services/dashboard_service.dart';
import '../api/api_exception.dart';

/// Dashboard Provider for state management
class DashboardProvider extends ChangeNotifier {
  final DashboardService _dashboardService;
  
  DashboardData? _dashboardData;
  bool _isLoading = false;
  String? _errorMessage;
  DateTime? _lastRefresh;
  
  DashboardProvider({DashboardService? dashboardService})
      : _dashboardService = dashboardService ?? DashboardService();
  
  // Getters
  DashboardData? get dashboardData => _dashboardData;
  DashboardStats? get stats => _dashboardData?.stats;
  List<RecentActivity> get recentActivities => _dashboardData?.recentActivities ?? [];
  ChartData? get revenueChart => _dashboardData?.revenueChart;
  ChartData? get expensesChart => _dashboardData?.expensesChart;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  DateTime? get lastRefresh => _lastRefresh;
  
  /// Load dashboard data
  Future<void> loadDashboardData({bool forceRefresh = false}) async {
    // Don't reload if already loading
    if (_isLoading && !forceRefresh) return;
    
    // Don't reload if data is fresh (less than 30 seconds old)
    if (!forceRefresh && 
        _dashboardData != null && 
        _lastRefresh != null &&
        DateTime.now().difference(_lastRefresh!).inSeconds < 30) {
      return;
    }
    
    _setLoading(true);
    _setError(null);
    
    try {
      final data = await _dashboardService.getDashboardData();
      _dashboardData = data;
      _lastRefresh = DateTime.now();
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to load dashboard data: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Refresh dashboard data
  Future<void> refresh() async {
    await loadDashboardData(forceRefresh: true);
  }
  
  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
  
  // Private helper methods
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
  
  void _setError(String? message) {
    _errorMessage = message;
  }
}

