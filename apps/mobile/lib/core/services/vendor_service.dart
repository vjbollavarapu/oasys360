import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/vendor_model.dart';

/// Vendor/Supplier Service - Handles vendor API calls
class VendorService {
  final ApiClient _apiClient;

  VendorService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  /// Get list of vendors/suppliers
  Future<List<VendorModel>> getVendors({
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
        '/purchase/suppliers/',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final results = data is Map
            ? (data['results'] ?? data['data'] ?? [])
            : (data as List);

        return (results as List)
            .map((item) => VendorModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to fetch vendors: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }

  /// Search vendors/suppliers
  Future<List<VendorModel>> searchVendors(String query) async {
    try {
      final response = await _apiClient.get(
        '/purchase/suppliers/search/',
        queryParameters: {'q': query},
      );

      if (response.statusCode == 200 && response.data != null) {
        final results = response.data as List;
        return results
            .map((item) => VendorModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to search vendors: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }

  /// Get vendor by ID
  Future<VendorModel> getVendorById(String id) async {
    try {
      final response = await _apiClient.get('/purchase/suppliers/$id/');

      if (response.statusCode == 200 && response.data != null) {
        return VendorModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw ApiException(
        message: 'Vendor not found',
        statusCode: response.statusCode,
      );
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to fetch vendor: ${e.toString()}',
        statusCode: 0,
        originalError: e,
      );
    }
  }
}

