/// Notification Model
class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type; // 'invoice', 'payment', 'expense', 'approval', 'reminder', 'alert', 'update', 'other'
  final String status; // 'pending', 'sent', 'delivered', 'failed', 'cancelled'
  final String priority; // 'low', 'normal', 'high', 'urgent'
  final Map<String, dynamic>? data;
  final DateTime? readAt;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.status = 'sent',
    this.priority = 'normal',
    this.data,
    this.readAt,
    required this.createdAt,
  });

  bool get isRead => readAt != null;

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['notification_type'] ?? json['type'] ?? 'other',
      status: json['status'] ?? 'sent',
      priority: json['priority'] ?? 'normal',
      data: json['data'] != null
          ? Map<String, dynamic>.from(json['data'])
          : null,
      readAt: json['read_at'] != null
          ? DateTime.parse(json['read_at'])
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}

/// Notification List Response
class NotificationListResponse {
  final List<NotificationModel> notifications;
  final int count;
  final int unreadCount;
  final String? next;
  final String? previous;

  NotificationListResponse({
    required this.notifications,
    required this.count,
    this.unreadCount = 0,
    this.next,
    this.previous,
  });

  factory NotificationListResponse.fromJson(Map<String, dynamic> json) {
    final results = json['results'] ?? json['data'] ?? [];
    final notifications = (results as List)
        .map((item) => NotificationModel.fromJson(item as Map<String, dynamic>))
        .toList();
    
    return NotificationListResponse(
      notifications: notifications,
      count: json['count'] ?? results.length,
      unreadCount: json['unread_count'] ?? notifications.where((n) => !n.isRead).length,
      next: json['next'],
      previous: json['previous'],
    );
  }
}

