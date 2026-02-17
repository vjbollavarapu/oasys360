import 'package:dio/dio.dart';

/// Custom API Exception class
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic originalError;
  
  ApiException({
    required this.message,
    this.statusCode,
    this.originalError,
  });
  
  /// Create ApiException from DioError
  factory ApiException.fromDioError(DioException error) {
    String message = 'An error occurred';
    
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        message = 'Connection timeout. Please check your internet connection.';
        break;
      case DioExceptionType.badResponse:
        if (error.response != null) {
          message = _handleStatusCode(error.response!.statusCode);
          // Try to get error message from response
          if (error.response?.data is Map) {
            final data = error.response!.data as Map;
            if (data.containsKey('detail')) {
              message = data['detail'].toString();
            } else if (data.containsKey('error')) {
              message = data['error'].toString();
            } else if (data.containsKey('message')) {
              message = data['message'].toString();
            } else if (data.containsKey('non_field_errors')) {
              final errors = data['non_field_errors'];
              if (errors is List && errors.isNotEmpty) {
                message = errors.first.toString();
              } else {
                message = errors.toString();
              }
            }
          }
        } else {
          message = 'Received invalid response from server.';
        }
        break;
      case DioExceptionType.cancel:
        message = 'Request was cancelled.';
        break;
      case DioExceptionType.unknown:
        if (error.error is FormatException) {
          message = 'Invalid response format from server.';
        } else {
          message = 'Network error. Please check your internet connection.';
        }
        break;
      default:
        message = 'An unexpected error occurred.';
    }
    
    return ApiException(
      message: message,
      statusCode: error.response?.statusCode,
      originalError: error,
    );
  }
  
  /// Handle HTTP status codes
  static String _handleStatusCode(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. Server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Server is under maintenance.';
      default:
        return 'An error occurred (Status: $statusCode).';
    }
  }
  
  @override
  String toString() => message;
}

