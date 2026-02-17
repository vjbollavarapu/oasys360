import 'package:flutter/foundation.dart';
import '../models/notification_models.dart';
import '../services/notification_service.dart';
import '../api/api_exception.dart';

/// Notification Provider for state management
class NotificationProvider extends ChangeNotifier {
  final NotificationService _notificationService;
  
  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  String? _errorMessage;
  int _currentPage = 1;
  bool _hasMore = true;
  int _unreadCount = 0;
  
  NotificationProvider({NotificationService? notificationService})
      : _notificationService = notificationService ?? NotificationService();
  
  // Getters
  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasMore => _hasMore;
  int get unreadCount => _unreadCount;
  
  /// Load notifications
  Future<void> loadNotifications({bool refresh = false, bool unreadOnly = false}) async {
    if (_isLoading && !refresh) return;
    
    if (refresh) {
      _currentPage = 1;
      _notifications.clear();
      _hasMore = true;
    }
    
    if (!_hasMore && !refresh) return;
    
    _setLoading(true);
    _setError(null);
    
    try {
      final response = await _notificationService.getNotifications(
        page: _currentPage,
        unreadOnly: unreadOnly,
      );
      
      if (refresh) {
        _notifications = response.notifications;
      } else {
        _notifications.addAll(response.notifications);
      }
      
      _unreadCount = response.unreadCount;
      _hasMore = response.next != null;
      _currentPage++;
      
      _setLoading(false);
      notifyListeners();
    } on ApiException catch (e) {
      _setError(e.message);
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      // Notifications are not critical, just set empty list
      _notifications = [];
      _unreadCount = 0;
      _setLoading(false);
      notifyListeners();
    }
  }
  
  /// Refresh notifications
  Future<void> refresh() async {
    await loadNotifications(refresh: true);
  }
  
  /// Mark as read
  Future<void> markAsRead(String id) async {
    try {
      await _notificationService.markAsRead(id);
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1) {
        // Update the notification to mark as read
        final notification = _notifications[index];
        _notifications[index] = NotificationModel(
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          status: notification.status,
          priority: notification.priority,
          data: notification.data,
          readAt: DateTime.now(),
          createdAt: notification.createdAt,
        );
        _unreadCount = _notifications.where((n) => !n.isRead).length;
      }
      notifyListeners();
    } catch (e) {
      // Silently fail
    }
  }
  
  /// Mark all as read
  Future<void> markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead();
      _notifications = _notifications.map((n) {
        return NotificationModel(
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          status: n.status,
          priority: n.priority,
          data: n.data,
          readAt: DateTime.now(),
          createdAt: n.createdAt,
        );
      }).toList();
      _unreadCount = 0;
      notifyListeners();
    } catch (e) {
      // Silently fail
    }
  }
  
  /// Delete notification
  Future<bool> deleteNotification(String id) async {
    try {
      await _notificationService.deleteNotification(id);
      _notifications.removeWhere((n) => n.id == id);
      _unreadCount = _notifications.where((n) => !n.isRead).length;
      notifyListeners();
      return true;
    } catch (e) {
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

