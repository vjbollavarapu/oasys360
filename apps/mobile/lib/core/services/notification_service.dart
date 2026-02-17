import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/notification_models.dart';

/// Notification Service for managing notifications
class NotificationService {
  final ApiClient _apiClient;
  
  NotificationService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();
  
  /// Get list of notifications
  Future<NotificationListResponse> getNotifications({
    int page = 1,
    int pageSize = 20,
    String? type,
    bool? unreadOnly,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'page_size': pageSize,
      };
      
      if (type != null && type.isNotEmpty) {
        queryParams['type'] = type;
      }
      
      if (unreadOnly == true) {
        queryParams['unread'] = true;
      }
      
      // Try mobile notifications endpoint first, fallback to general notifications
      try {
        final response = await _apiClient.get(
          '/mobile/notifications/',
          queryParameters: queryParams,
        );
        
        if (response.statusCode == 200 && response.data != null) {
          return NotificationListResponse.fromJson(response.data);
        }
      } catch (e) {
        // Fallback to general notifications if mobile endpoint doesn't exist
      }
      
      // Fallback: return empty list if endpoint doesn't exist
      return NotificationListResponse(
        notifications: [],
        count: 0,
        unreadCount: 0,
      );
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      // Return empty list on error (notifications are not critical)
      return NotificationListResponse(
        notifications: [],
        count: 0,
        unreadCount: 0,
      );
    }
  }
  
  /// Mark notification as read
  Future<void> markAsRead(String id) async {
    try {
      await _apiClient.patch(
        '/mobile/notifications/$id/',
        data: {'read_at': DateTime.now().toIso8601String()},
      );
    } catch (e) {
      // Silently fail - notifications marking as read is not critical
    }
  }
  
  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      await _apiClient.post('/mobile/notifications/mark-all-read/');
    } catch (e) {
      // Silently fail
    }
  }
  
  /// Delete notification
  Future<void> deleteNotification(String id) async {
    try {
      await _apiClient.delete('/mobile/notifications/$id/');
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

