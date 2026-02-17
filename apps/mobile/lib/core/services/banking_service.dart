import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/banking_models.dart';

/// Banking Service for managing bank accounts and transactions
class BankingService {
  final ApiClient _apiClient;
  
  BankingService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();
  
  /// Get list of bank accounts
  Future<BankAccountListResponse> getBankAccounts() async {
    try {
      final response = await _apiClient.get('/banking/accounts/');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('accounts')) {
          return BankAccountListResponse.fromJson(data);
        } else if (data is List) {
          return BankAccountListResponse.fromJson({'accounts': data});
        } else {
          return BankAccountListResponse.fromJson(data as Map<String, dynamic>);
        }
      } else {
        throw ApiException(
          message: 'Failed to fetch bank accounts',
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
  
  /// Get bank account by ID
  Future<BankAccountModel> getBankAccount(String id) async {
    try {
      final response = await _apiClient.get('/banking/accounts/$id/');
      
      if (response.statusCode == 200 && response.data != null) {
        return BankAccountModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch bank account',
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
  
  /// Get account summary
  Future<Map<String, dynamic>> getAccountSummary() async {
    try {
      final response = await _apiClient.get('/banking/accounts/summary/');
      
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      } else {
        throw ApiException(
          message: 'Failed to fetch account summary',
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
  
  /// Get transactions for an account
  Future<BankTransactionListResponse> getAccountTransactions(
    String accountId, {
    int page = 1,
    int pageSize = 20,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'page_size': pageSize,
      };
      
      if (startDate != null) {
        queryParams['start_date'] = startDate.toIso8601String().split('T')[0];
      }
      
      if (endDate != null) {
        queryParams['end_date'] = endDate.toIso8601String().split('T')[0];
      }
      
      final response = await _apiClient.get(
        '/banking/accounts/$accountId/transactions/',
        queryParameters: queryParams,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return BankTransactionListResponse.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch transactions',
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
  
  /// Get all transactions
  Future<BankTransactionListResponse> getTransactions({
    int page = 1,
    int pageSize = 20,
    String? accountId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'page_size': pageSize,
      };
      
      if (accountId != null && accountId.isNotEmpty) {
        queryParams['account'] = accountId;
      }
      
      if (startDate != null) {
        queryParams['start_date'] = startDate.toIso8601String().split('T')[0];
      }
      
      if (endDate != null) {
        queryParams['end_date'] = endDate.toIso8601String().split('T')[0];
      }
      
      final response = await _apiClient.get(
        '/banking/transactions/',
        queryParameters: queryParams,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return BankTransactionListResponse.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch transactions',
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
  
  /// Get transaction by ID
  Future<BankTransactionModel> getTransaction(String id) async {
    try {
      final response = await _apiClient.get('/banking/transactions/$id/');
      
      if (response.statusCode == 200 && response.data != null) {
        return BankTransactionModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch transaction',
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

