import 'package:flutter/foundation.dart';
import '../models/customer_model.dart';
import '../services/customer_service.dart';
import '../api/api_exception.dart';

/// Customer Provider for state management
class CustomerProvider extends ChangeNotifier {
  final CustomerService _customerService;

  List<CustomerModel> _customers = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';
  String _sortBy = 'name'; // 'name', 'email', 'total_revenue'

  CustomerProvider({CustomerService? customerService})
      : _customerService = customerService ?? CustomerService();

  // Getters
  List<CustomerModel> get customers => _filteredCustomers;
  List<CustomerModel> get allCustomers => _customers;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;
  String get sortBy => _sortBy;

  // Filtered customers based on search query
  List<CustomerModel> get _filteredCustomers {
    if (_searchQuery.isEmpty) {
      return _sortedCustomers;
    }
    final query = _searchQuery.toLowerCase();
    return _sortedCustomers.where((customer) {
      return customer.name.toLowerCase().contains(query) ||
          (customer.email?.toLowerCase().contains(query) ?? false) ||
          (customer.phone?.contains(query) ?? false) ||
          (customer.city?.toLowerCase().contains(query) ?? false);
    }).toList();
  }

  // Sorted customers
  List<CustomerModel> get _sortedCustomers {
    final sorted = List<CustomerModel>.from(_customers);
    switch (_sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.compareTo(b.name));
        break;
      case 'email':
        sorted.sort((a, b) =>
            (a.email ?? '').compareTo(b.email ?? ''));
        break;
      case 'total_revenue':
        sorted.sort((a, b) =>
            (b.totalRevenue ?? 0).compareTo(a.totalRevenue ?? 0));
        break;
    }
    return sorted;
  }

  /// Load customers
  Future<void> loadCustomers({bool forceRefresh = false}) async {
    if (_isLoading && !forceRefresh) return;

    _setLoading(true);
    _setError(null);

    try {
      final customers = await _customerService.getCustomers(
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        ordering: _sortBy,
      );
      _customers = customers;
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to load customers: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }

  /// Search customers
  Future<void> searchCustomers(String query) async {
    _searchQuery = query;
    notifyListeners();

    if (query.isEmpty) {
      await loadCustomers(forceRefresh: true);
      return;
    }

    _setLoading(true);
    _setError(null);

    try {
      final customers = await _customerService.searchCustomers(query);
      _customers = customers;
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to search customers: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }

  /// Set sort order
  void setSortBy(String sortBy) {
    if (_sortBy != sortBy) {
      _sortBy = sortBy;
      notifyListeners();
    }
  }

  /// Clear search
  void clearSearch() {
    _searchQuery = '';
    notifyListeners();
    loadCustomers(forceRefresh: true);
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

