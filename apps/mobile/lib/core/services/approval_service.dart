import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/approval_models.dart';

/// Approval Service for managing approval requests
class ApprovalService {
  final ApiClient _apiClient;
  
  ApprovalService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();
  
  /// Get list of approval requests
  Future<ApprovalListResponse> getApprovals({
    int page = 1,
    int pageSize = 20,
    String? status,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'page_size': pageSize,
      };
      
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }
      
      final response = await _apiClient.get(
        '/purchase/approvals/',
        queryParameters: queryParams,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return ApprovalListResponse.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch approvals',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: e.toString(),
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Get approval request by ID
  Future<ApprovalRequestModel> getApproval(String id) async {
    try {
      final response = await _apiClient.get('/purchase/approvals/$id/');
      
      if (response.statusCode == 200 && response.data != null) {
        return ApprovalRequestModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch approval',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: e.toString(),
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Approve request
  Future<void> approveRequest(String id, {String? notes}) async {
    try {
      final data = <String, dynamic>{};
      if (notes != null && notes.isNotEmpty) {
        data['notes'] = notes;
      }
      
      final response = await _apiClient.post(
        '/purchase/approvals/$id/approve/',
        data: data.isNotEmpty ? data : null,
      );
      
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw ApiException(
          message: 'Failed to approve request',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: e.toString(),
        statusCode: 0,
        originalError: e,
      );
    }
  }
  
  /// Reject request
  Future<void> rejectRequest(String id, String reason) async {
    try {
      final response = await _apiClient.patch(
        '/purchase/approvals/$id/',
        data: {
          'status': 'rejected',
          'rejection_reason': reason,
        },
      );
      
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw ApiException(
          message: 'Failed to reject request',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: e.toString(),
        statusCode: 0,
        originalError: e,
      );
    }
  }
}

