import 'package:flutter/foundation.dart';
import '../models/expense_models.dart';
import '../services/expense_service.dart';
import '../api/api_exception.dart';

/// Expense Provider for state management
class ExpenseProvider extends ChangeNotifier {
  final ExpenseService _expenseService;
  
  List<ExpenseModel> _expenses = [];
  bool _isLoading = false;
  String? _errorMessage;
  int _currentPage = 1;
  bool _hasMore = true;
  String? _searchQuery;
  String? _selectedCategory;
  DateTime? _startDate;
  DateTime? _endDate;
  
  ExpenseProvider({ExpenseService? expenseService})
      : _expenseService = expenseService ?? ExpenseService();
  
  // Getters
  List<ExpenseModel> get expenses => _expenses;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasMore => _hasMore;
  String? get searchQuery => _searchQuery;
  String? get selectedCategory => _selectedCategory;
  
  /// Load expenses
  Future<void> loadExpenses({bool refresh = false}) async {
    if (_isLoading && !refresh) return;
    
    if (refresh) {
      _currentPage = 1;
      _expenses.clear();
      _hasMore = true;
    }
    
    if (!_hasMore && !refresh) return;
    
    _setLoading(true);
    _setError(null);
    
    try {
      final response = await _expenseService.getExpenses(
        page: _currentPage,
        search: _searchQuery,
        category: _selectedCategory,
        startDate: _startDate,
        endDate: _endDate,
      );
      
      if (refresh) {
        _expenses = response.expenses;
      } else {
        _expenses.addAll(response.expenses);
      }
      
      _hasMore = response.next != null;
      _currentPage++;
      
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to load expenses: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Refresh expenses
  Future<void> refresh() async {
    await loadExpenses(refresh: true);
  }
  
  /// Load more expenses (pagination)
  Future<void> loadMore() async {
    if (!_hasMore || _isLoading) return;
    await loadExpenses();
  }
  
  /// Search expenses
  Future<void> search(String query) async {
    _searchQuery = query.isEmpty ? null : query;
    await loadExpenses(refresh: true);
  }
  
  /// Filter by category
  Future<void> filterByCategory(String? category) async {
    _selectedCategory = category;
    await loadExpenses(refresh: true);
  }
  
  /// Filter by date range
  Future<void> filterByDateRange(DateTime? start, DateTime? end) async {
    _startDate = start;
    _endDate = end;
    await loadExpenses(refresh: true);
  }
  
  /// Create expense
  Future<bool> createExpense(ExpenseCreateRequest request) async {
    _setLoading(true);
    _setError(null);
    
    try {
      final expense = await _expenseService.createExpense(request);
      _expenses.insert(0, expense);
      _setLoading(false);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to create expense: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }
  
  /// Update expense
  Future<bool> updateExpense(String id, ExpenseCreateRequest request) async {
    _setLoading(true);
    _setError(null);
    
    try {
      final expense = await _expenseService.updateExpense(id, request);
      final index = _expenses.indexWhere((e) => e.id == id);
      if (index != -1) {
        _expenses[index] = expense;
      }
      _setLoading(false);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to update expense: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }
  
  /// Delete expense
  Future<bool> deleteExpense(String id) async {
    _setLoading(true);
    _setError(null);
    
    try {
      await _expenseService.deleteExpense(id);
      _expenses.removeWhere((e) => e.id == id);
      _setLoading(false);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to delete expense: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }
  
  /// Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
  
  // Private helpers
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
  
  void _setError(String? message) {
    _errorMessage = message;
  }
}

