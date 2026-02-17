import 'package:flutter/foundation.dart';
import '../models/banking_models.dart';
import '../services/banking_service.dart';
import '../api/api_exception.dart';

/// Banking Provider for state management
class BankingProvider extends ChangeNotifier {
  final BankingService _bankingService;
  
  List<BankAccountModel> _accounts = [];
  List<BankTransactionModel> _transactions = [];
  bool _isLoading = false;
  String? _errorMessage;
  double _totalBalance = 0.0;
  String? _selectedAccountId;
  
  BankingProvider({BankingService? bankingService})
      : _bankingService = bankingService ?? BankingService();
  
  // Getters
  List<BankAccountModel> get accounts => _accounts;
  List<BankTransactionModel> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  double get totalBalance => _totalBalance;
  String? get selectedAccountId => _selectedAccountId;
  
  /// Load bank accounts
  Future<void> loadBankAccounts() async {
    _setLoading(true);
    _setError(null);
    
    try {
      final response = await _bankingService.getBankAccounts();
      _accounts = response.accounts;
      _totalBalance = response.totalBalance;
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to load bank accounts: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Load transactions for an account
  Future<void> loadAccountTransactions(String accountId) async {
    _setLoading(true);
    _setError(null);
    _selectedAccountId = accountId;
    
    try {
      final response = await _bankingService.getAccountTransactions(accountId);
      _transactions = response.transactions;
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to load transactions: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Load all transactions
  Future<void> loadTransactions({String? accountId}) async {
    _setLoading(true);
    _setError(null);
    _selectedAccountId = accountId;
    
    try {
      final response = await _bankingService.getTransactions(accountId: accountId);
      _transactions = response.transactions;
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to load transactions: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
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

