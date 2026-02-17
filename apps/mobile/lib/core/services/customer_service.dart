import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/customer_model.dart';

/// Customer Service - Handles customer API calls
class CustomerService {
  final ApiClient _apiClient;

  CustomerService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  /// Get list of customers
  Future<List<CustomerModel>> getCustomers({
    String? search,
    String? ordering,
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (ordering != null) {
        queryParams['ordering'] = ordering;
      }
      if (limit != null) {
        queryParams['limit'] = limit;
      }

      final response = await _apiClient.get(
        '/sales/customers/',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final results = data is Map
            ? (data['results'] ?? data['data'] ?? [])
            : (data as List);

        return (results as List)
            .map((item) => CustomerModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to fetch customers: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }

  /// Search customers
  Future<List<CustomerModel>> searchCustomers(String query) async {
    try {
      final response = await _apiClient.get(
        '/sales/customers/search/',
        queryParameters: {'q': query},
      );

      if (response.statusCode == 200 && response.data != null) {
        final results = response.data as List;
        return results
            .map((item) => CustomerModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to search customers: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }

  /// Get customer by ID
  Future<CustomerModel> getCustomerById(String id) async {
    try {
      final response = await _apiClient.get('/sales/customers/$id/');

      if (response.statusCode == 200 && response.data != null) {
        return CustomerModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw ApiException(
        message: 'Customer not found',
        statusCode: response.statusCode,
      );
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to fetch customer: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }
}

