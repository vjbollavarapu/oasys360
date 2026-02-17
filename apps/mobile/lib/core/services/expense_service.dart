import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/expense_models.dart';

/// Expense Service for managing expenses (using journal entries)
class ExpenseService {
  final ApiClient _apiClient;
  
  ExpenseService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();
  
  /// Get list of expenses
  /// Uses journal entries filtered by expense type
  Future<ExpenseListResponse> getExpenses({
    int page = 1,
    int pageSize = 20,
    String? search,
    String? category,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'page_size': pageSize,
        'type': 'expense', // Filter for expense type
      };
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      
      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }
      
      if (startDate != null) {
        queryParams['start_date'] = startDate.toIso8601String().split('T')[0];
      }
      
      if (endDate != null) {
        queryParams['end_date'] = endDate.toIso8601String().split('T')[0];
      }
      
      final response = await _apiClient.get(
        '/accounting/journal-entries/',
        queryParameters: queryParams,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        // Transform journal entries to expenses
        final data = response.data as Map<String, dynamic>;
        final results = data['results'] ?? data['data'] ?? [];
        
        final expenses = (results as List)
            .where((item) {
              final entry = item as Map<String, dynamic>;
              // Filter for expense entries (debit entries to expense accounts)
              final metadata = entry['metadata'] as Map<String, dynamic>?;
              return metadata?['type'] == 'expense' || 
                     entry['memo']?.toString().toLowerCase().contains('expense') == true;
            })
            .map((item) => ExpenseModel.fromJson(item as Map<String, dynamic>))
            .toList();
        
        return ExpenseListResponse(
          expenses: expenses,
          count: data['count'] ?? expenses.length,
          next: data['next'],
          previous: data['previous'],
        );
      } else {
        throw ApiException(
          message: 'Failed to fetch expenses',
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
  
  /// Get expense by ID
  Future<ExpenseModel> getExpense(String id) async {
    try {
      final response = await _apiClient.get('/accounting/journal-entries/$id/');
      
      if (response.statusCode == 200 && response.data != null) {
        return ExpenseModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to fetch expense',
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
  
  /// Create expense (as journal entry)
  Future<ExpenseModel> createExpense(ExpenseCreateRequest request) async {
    try {
      final expense = ExpenseModel(
        id: '', // Will be assigned by backend
        description: request.description,
        merchant: request.merchant,
        amount: request.amount,
        date: request.date,
        category: request.category,
        receiptUrl: request.receiptUrl,
        notes: request.notes,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      final journalEntryData = expense.toJournalEntryJson();
      
      final response = await _apiClient.post(
        '/accounting/journal-entries/',
        data: journalEntryData,
      );
      
      if (response.statusCode == 201 && response.data != null) {
        return ExpenseModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to create expense',
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
  
  /// Update expense
  Future<ExpenseModel> updateExpense(String id, ExpenseCreateRequest request) async {
    try {
      final expense = ExpenseModel(
        id: id,
        description: request.description,
        merchant: request.merchant,
        amount: request.amount,
        date: request.date,
        category: request.category,
        receiptUrl: request.receiptUrl,
        notes: request.notes,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      final journalEntryData = expense.toJournalEntryJson();
      
      final response = await _apiClient.put(
        '/accounting/journal-entries/$id/',
        data: journalEntryData,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        return ExpenseModel.fromJson(response.data);
      } else {
        throw ApiException(
          message: 'Failed to update expense',
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
  
  /// Delete expense
  Future<void> deleteExpense(String id) async {
    try {
      final response = await _apiClient.delete('/accounting/journal-entries/$id/');
      
      if (response.statusCode != 204 && response.statusCode != 200) {
        throw ApiException(
          message: 'Failed to delete expense',
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
  
  /// Upload receipt document
  Future<String> uploadReceipt(String filePath) async {
    try {
      // Use FormData for file upload
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
        'type': 'receipt',
      });
      
      final response = await _apiClient.post(
        '/documents/files/',
        data: formData,
      );
      
      if (response.statusCode == 201 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        return data['url'] ?? data['file_url'] ?? '';
      } else {
        throw ApiException(
          message: 'Failed to upload receipt',
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

