import 'package:flutter/foundation.dart';
import '../models/invoice_models.dart';
import '../services/invoice_service.dart';
import '../api/api_exception.dart';

/// Invoice Provider for state management
class InvoiceProvider extends ChangeNotifier {
  final InvoiceService _invoiceService;
  
  List<InvoiceModel> _invoices = [];
  bool _isLoading = false;
  String? _errorMessage;
  int _currentPage = 1;
  bool _hasMore = true;
  String? _selectedStatus;
  String? _searchQuery;
  
  InvoiceProvider({InvoiceService? invoiceService})
      : _invoiceService = invoiceService ?? InvoiceService();
  
  // Getters
  List<InvoiceModel> get invoices => _invoices;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasMore => _hasMore;
  String? get selectedStatus => _selectedStatus;
  
  /// Load invoices
  Future<void> loadInvoices({bool refresh = false, String? status}) async {
    if (_isLoading && !refresh) return;
    
    if (refresh) {
      _currentPage = 1;
      _invoices.clear();
      _hasMore = true;
      _selectedStatus = status;
    }
    
    if (!_hasMore && !refresh) return;
    
    _setLoading(true);
    _setError(null);
    
    try {
      final response = await _invoiceService.getInvoices(
        page: _currentPage,
        status: status ?? _selectedStatus,
        search: _searchQuery,
      );
      
      if (refresh) {
        _invoices = response.invoices;
      } else {
        _invoices.addAll(response.invoices);
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
      _setError('Failed to load invoices: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Refresh invoices
  Future<void> refresh() async {
    await loadInvoices(refresh: true);
  }
  
  /// Load more invoices
  Future<void> loadMore() async {
    if (!_hasMore || _isLoading) return;
    await loadInvoices();
  }
  
  /// Search invoices
  Future<void> search(String query) async {
    _searchQuery = query.isEmpty ? null : query;
    await loadInvoices(refresh: true);
  }
  
  /// Filter by status
  Future<void> filterByStatus(String? status) async {
    _selectedStatus = status;
    await loadInvoices(refresh: true, status: status);
  }
  
  /// Create invoice
  Future<bool> createInvoice(InvoiceModel invoice) async {
    _setLoading(true);
    _setError(null);
    
    try {
      final created = await _invoiceService.createInvoice(invoice);
      _invoices.insert(0, created);
      _setLoading(false);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to create invoice: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }
  
  /// Update invoice
  Future<bool> updateInvoice(String id, InvoiceModel invoice) async {
    _setLoading(true);
    _setError(null);
    
    try {
      final updated = await _invoiceService.updateInvoice(id, invoice);
      final index = _invoices.indexWhere((i) => i.id == id);
      if (index != -1) {
        _invoices[index] = updated;
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
      _setError('Failed to update invoice: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }
  
  /// Send invoice
  Future<bool> sendInvoice(String id) async {
    try {
      await _invoiceService.sendInvoice(id);
      final index = _invoices.indexWhere((i) => i.id == id);
      if (index != -1) {
        _invoices[index] = InvoiceModel(
          id: _invoices[index].id,
          invoiceNumber: _invoices[index].invoiceNumber,
          customerId: _invoices[index].customerId,
          customerName: _invoices[index].customerName,
          invoiceDate: _invoices[index].invoiceDate,
          dueDate: _invoices[index].dueDate,
          status: 'sent',
          paymentTerms: _invoices[index].paymentTerms,
          subtotal: _invoices[index].subtotal,
          taxAmount: _invoices[index].taxAmount,
          discountAmount: _invoices[index].discountAmount,
          totalAmount: _invoices[index].totalAmount,
          currency: _invoices[index].currency,
          notes: _invoices[index].notes,
          termsConditions: _invoices[index].termsConditions,
          createdAt: _invoices[index].createdAt,
          updatedAt: DateTime.now(),
          lines: _invoices[index].lines,
        );
      }
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to send invoice: ${e.toString()}');
      notifyListeners();
      return false;
    }
  }
  
  /// Delete invoice
  Future<bool> deleteInvoice(String id) async {
    try {
      await _invoiceService.deleteInvoice(id);
      _invoices.removeWhere((i) => i.id == id);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to delete invoice: ${e.toString()}');
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

