import 'package:flutter/foundation.dart';
import '../models/vendor_model.dart';
import '../services/vendor_service.dart';
import '../api/api_exception.dart';

/// Vendor Provider for state management
class VendorProvider extends ChangeNotifier {
  final VendorService _vendorService;

  List<VendorModel> _vendors = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';
  String _sortBy = 'name'; // 'name', 'email', 'total_spent'

  VendorProvider({VendorService? vendorService})
      : _vendorService = vendorService ?? VendorService();

  // Getters
  List<VendorModel> get vendors => _filteredVendors;
  List<VendorModel> get allVendors => _vendors;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;
  String get sortBy => _sortBy;

  // Filtered vendors based on search query
  List<VendorModel> get _filteredVendors {
    if (_searchQuery.isEmpty) {
      return _sortedVendors;
    }
    final query = _searchQuery.toLowerCase();
    return _sortedVendors.where((vendor) {
      return vendor.name.toLowerCase().contains(query) ||
          (vendor.email?.toLowerCase().contains(query) ?? false) ||
          (vendor.phone?.contains(query) ?? false) ||
          (vendor.city?.toLowerCase().contains(query) ?? false) ||
          (vendor.contactPerson?.toLowerCase().contains(query) ?? false);
    }).toList();
  }

  // Sorted vendors
  List<VendorModel> get _sortedVendors {
    final sorted = List<VendorModel>.from(_vendors);
    switch (_sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.compareTo(b.name));
        break;
      case 'email':
        sorted.sort((a, b) =>
            (a.email ?? '').compareTo(b.email ?? ''));
        break;
      case 'total_spent':
        sorted.sort((a, b) =>
            (b.totalSpent ?? 0).compareTo(a.totalSpent ?? 0));
        break;
    }
    return sorted;
  }

  /// Load vendors
  Future<void> loadVendors({bool forceRefresh = false}) async {
    if (_isLoading && !forceRefresh) return;

    _setLoading(true);
    _setError(null);

    try {
      final vendors = await _vendorService.getVendors(
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        ordering: _sortBy,
      );
      _vendors = vendors;
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to load vendors: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }

  /// Search vendors
  Future<void> searchVendors(String query) async {
    _searchQuery = query;
    notifyListeners();

    if (query.isEmpty) {
      await loadVendors(forceRefresh: true);
      return;
    }

    _setLoading(true);
    _setError(null);

    try {
      final vendors = await _vendorService.searchVendors(query);
      _vendors = vendors;
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to search vendors: ${e.toString()}');
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
    loadVendors(forceRefresh: true);
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

