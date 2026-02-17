import 'package:flutter/foundation.dart';
import '../models/approval_models.dart';
import '../services/approval_service.dart';
import '../api/api_exception.dart';

/// Approval Provider for state management
class ApprovalProvider extends ChangeNotifier {
  final ApprovalService _approvalService;
  
  List<ApprovalRequestModel> _approvals = [];
  bool _isLoading = false;
  String? _errorMessage;
  int _currentPage = 1;
  bool _hasMore = true;
  String? _selectedStatus;
  
  ApprovalProvider({ApprovalService? approvalService})
      : _approvalService = approvalService ?? ApprovalService();
  
  // Getters
  List<ApprovalRequestModel> get approvals => _approvals;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasMore => _hasMore;
  String? get selectedStatus => _selectedStatus;
  
  int get pendingCount => _approvals.where((a) => a.status == 'pending').length;
  
  /// Load approvals
  Future<void> loadApprovals({bool refresh = false, String? status}) async {
    if (_isLoading && !refresh) return;
    
    if (refresh) {
      _currentPage = 1;
      _approvals.clear();
      _hasMore = true;
      _selectedStatus = status;
    }
    
    if (!_hasMore && !refresh) return;
    
    _setLoading(true);
    _setError(null);
    
    try {
      final response = await _approvalService.getApprovals(
        page: _currentPage,
        status: status ?? _selectedStatus,
      );
      
      if (refresh) {
        _approvals = response.approvals;
      } else {
        _approvals.addAll(response.approvals);
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
      _setError('Failed to load approvals: ${e.toString()}');
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Refresh approvals
  Future<void> refresh() async {
    await loadApprovals(refresh: true);
  }
  
  /// Filter by status
  Future<void> filterByStatus(String? status) async {
    _selectedStatus = status;
    await loadApprovals(refresh: true, status: status);
  }
  
  /// Approve request
  Future<bool> approveRequest(String id, {String? notes}) async {
    try {
      await _approvalService.approveRequest(id, notes: notes);
      final index = _approvals.indexWhere((a) => a.id == id);
      if (index != -1) {
        await loadApprovals(refresh: true, status: _selectedStatus);
      }
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to approve request: ${e.toString()}');
      notifyListeners();
      return false;
    }
  }
  
  /// Reject request
  Future<bool> rejectRequest(String id, String reason) async {
    try {
      await _approvalService.rejectRequest(id, reason);
      final index = _approvals.indexWhere((a) => a.id == id);
      if (index != -1) {
        await loadApprovals(refresh: true, status: _selectedStatus);
      }
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _setError(e.message);
      notifyListeners();
      return false;
    } catch (e) {
      _setError('Failed to reject request: ${e.toString()}');
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

