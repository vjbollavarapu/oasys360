import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/notification_provider.dart';
import '../../core/models/notification_models.dart';
import 'package:intl/intl.dart';

/// Notifications Screen
/// Converted from stitch_transactions/notifications/code.html
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedFilter = 'All';

  @override
  void initState() {
    super.initState();
    // Load notifications after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);
      notificationProvider.loadNotifications(refresh: true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode(context);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.backgroundDark : AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Consumer<NotificationProvider>(
            builder: (context, notificationProvider, _) {
              if (notificationProvider.unreadCount == 0) {
                return const SizedBox.shrink();
              }
              return TextButton(
                onPressed: () async {
                  await notificationProvider.markAllAsRead();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('All notifications marked as read'),
                        backgroundColor: AppTheme.success,
                      ),
                    );
                  }
                },
                child: Text(
                  'Mark all as read',
                  style: TextStyle(
                    color: AppTheme.primaryColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Chips
            _buildFilterChips(context, isDark),
            
            // Notifications List
            Expanded(
              child: Consumer<NotificationProvider>(
                builder: (context, notificationProvider, _) {
                  // Filter notifications based on selected filter
                  List<NotificationModel> filteredNotifications = notificationProvider.notifications;
                  
                  if (_selectedFilter == 'Unread') {
                    filteredNotifications = filteredNotifications.where((n) => !n.isRead).toList();
                  } else if (_selectedFilter == 'Important') {
                    filteredNotifications = filteredNotifications.where((n) => n.priority == 'high' || n.priority == 'urgent').toList();
                  } else if (_selectedFilter == 'System') {
                    filteredNotifications = filteredNotifications.where((n) => n.type == 'update' || n.type == 'alert').toList();
                  }

                  // Loading state
                  if (notificationProvider.isLoading && filteredNotifications.isEmpty) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  // Error state
                  if (notificationProvider.errorMessage != null && filteredNotifications.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 64,
                            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            notificationProvider.errorMessage ?? 'Error loading notifications',
                            style: TextStyle(
                              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => notificationProvider.refresh(),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    );
                  }

                  // Empty state
                  if (filteredNotifications.isEmpty) {
                    return _buildEmptyState(context, isDark);
                  }

                  // Notifications list
                  return RefreshIndicator(
                    onRefresh: () => notificationProvider.refresh(),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredNotifications.length,
                      itemBuilder: (context, index) {
                        final notification = filteredNotifications[index];
                        return _buildNotificationItem(
                          context,
                          notification,
                          isDark,
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChips(BuildContext context, bool isDark) {
    final filters = ['All', 'Unread', 'Important', 'System'];
    
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = _selectedFilter == filter;
          
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(filter),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  _selectedFilter = filter;
                });
              },
              selectedColor: AppTheme.primaryColor.withValues(alpha: 0.2),
              checkmarkColor: AppTheme.primaryColor,
              labelStyle: TextStyle(
                color: isSelected
                    ? AppTheme.primaryColor
                    : (isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              backgroundColor: isDark ? AppTheme.surfaceDark : Colors.white,
              side: BorderSide(
                color: isSelected
                    ? AppTheme.primaryColor
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : AppTheme.borderLight),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotificationItem(
    BuildContext context,
    NotificationModel notification,
    bool isDark,
  ) {
    final isRead = notification.isRead;
    final icon = _getNotificationIcon(notification.type);
    final color = _getNotificationColor(notification.type, notification.priority);
    final time = notification.createdAt;
    
    final timeAgo = _formatTimeAgo(time);
    
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppTheme.error,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) async {
        final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);
        final success = await notificationProvider.deleteNotification(notification.id);
        if (context.mounted && !success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to delete notification'),
              backgroundColor: AppTheme.error,
            ),
          );
        }
      },
      child: InkWell(
        onTap: () async {
          if (!isRead) {
            final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);
            await notificationProvider.markAsRead(notification.id);
          }
          // TODO: Navigate to notification detail when screen is created
        },
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isRead
                ? (isDark ? AppTheme.surfaceDark : Colors.white)
                : AppTheme.primaryColor.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.05)
                  : AppTheme.borderLight.withValues(alpha: 0.3),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                                color: isDark ? AppTheme.textDark : AppTheme.textLight,
                              ),
                            ),
                          ),
                          if (!isRead)
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        notification.message,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 8),
                    Text(
                      timeAgo,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppTheme.textMutedDark : AppTheme.textMutedLight,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none_outlined,
            size: 64,
            color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
          ),
          const SizedBox(height: 16),
          Text(
            'All caught up!',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? AppTheme.textDark : AppTheme.textLight,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No new notifications',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d, yyyy').format(dateTime);
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type.toLowerCase()) {
      case 'invoice':
        return Icons.receipt_long_outlined;
      case 'payment':
        return Icons.payment_outlined;
      case 'expense':
        return Icons.credit_card_outlined;
      case 'approval':
        return Icons.approval_outlined;
      case 'reminder':
        return Icons.notifications_active_outlined;
      case 'alert':
        return Icons.warning_amber_outlined;
      case 'update':
        return Icons.system_update_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _getNotificationColor(String type, String priority) {
    // Priority-based colors take precedence
    if (priority == 'urgent' || priority == 'high') {
      return AppTheme.error;
    }
    
    // Type-based colors
    switch (type.toLowerCase()) {
      case 'invoice':
      case 'payment':
        return AppTheme.success;
      case 'expense':
      case 'approval':
        return AppTheme.warning;
      case 'alert':
        return AppTheme.error;
      case 'update':
      case 'reminder':
        return AppTheme.info;
      default:
        return AppTheme.primaryColor;
    }
  }
}
