import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/invoice_models.dart';

/// Invoice Service for managing invoices
class InvoiceService {
  final ApiClient _apiClient;
  
  InvoiceService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();
  
  /// Get list of invoices
  Future<InvoiceListResponse> getInvoices({
    int page = 1,
    int pageSize = 20,
    String? status,
    String? search,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'page_size': pageSize,
      };
      
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      
      if (startDate != null) {
        queryParams['start_date'] = startDate.toIso8601String().split('T')[0];
      }
      
      if (endDate != null) {
        queryParams['end_date'] = endDate.toIso8601String().split('T')[0];
      }
      
      final response = await _apiClient.get(
        '/invoicing/invoices/',
        queryParameters: queryParams,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return InvoiceListResponse.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch invoices',
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
  
  /// Get invoice by ID
  Future<InvoiceModel> getInvoice(String id) async {
    try {
      final response = await _apiClient.get('/invoicing/invoices/$id/');
      
      if (response.statusCode == 200 && response.data != null) {
        return InvoiceModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch invoice',
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
  
  /// Create invoice
  Future<InvoiceModel> createInvoice(InvoiceModel invoice) async {
    try {
      final response = await _apiClient.post(
        '/invoicing/invoices/',
        data: invoice.toJson(),
      );
      
      if (response.statusCode == 201 && response.data != null) {
        return InvoiceModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to create invoice',
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
  
  /// Update invoice
  Future<InvoiceModel> updateInvoice(String id, InvoiceModel invoice) async {
    try {
      final response = await _apiClient.put(
        '/invoicing/invoices/$id/',
        data: invoice.toJson(),
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return InvoiceModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to update invoice',
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
  
  /// Delete invoice
  Future<void> deleteInvoice(String id) async {
    try {
      final response = await _apiClient.delete('/invoicing/invoices/$id/');
      
      if (response.statusCode != 204 && response.statusCode != 200) {
        throw ApiException(
          message: 'Failed to delete invoice',
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
  
  /// Send invoice
  Future<void> sendInvoice(String id) async {
    try {
      final response = await _apiClient.post('/invoicing/invoices/$id/send/');
      
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw ApiException(
          message: 'Failed to send invoice',
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
  
  /// Approve invoice
  Future<void> approveInvoice(String id) async {
    try {
      final response = await _apiClient.post('/invoicing/invoices/$id/approve/');
      
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw ApiException(
          message: 'Failed to approve invoice',
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
  
  /// Get overdue invoices
  Future<InvoiceListResponse> getOverdueInvoices() async {
    try {
      final response = await _apiClient.get('/invoicing/invoices/overdue/');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data is List) {
          return InvoiceListResponse(
            invoices: data
                .map((item) => InvoiceModel.fromJson(item as Map<String, dynamic>))
                .toList(),
            count: data.length,
          );
        } else {
          return InvoiceListResponse.fromJson(data);
        }
      } else {
        throw ApiException(
          message: 'Failed to fetch overdue invoices',
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
  
  /// Get customers list (for invoice creation)
  Future<List<CustomerModel>> getCustomers() async {
    try {
      final response = await _apiClient.get('/sales/customers/');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final results = data is Map ? (data['results'] ?? data['data'] ?? []) : (data as List);
        return (results as List)
            .map((item) => CustomerModel.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        throw ApiException(
          message: 'Failed to fetch customers',
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

