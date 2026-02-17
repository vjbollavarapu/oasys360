from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the platform_admin app
router = DefaultRouter()

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Admin Overview
    path('overview-stats/', views.admin_overview_stats, name='admin_overview_stats'),
    
    # System Settings
    path('system-settings/', views.SystemSettingsListView.as_view(), name='system_settings_list'),
    path('system-settings/<uuid:pk>/', views.SystemSettingsDetailView.as_view(), name='system_settings_detail'),
    
    # Admin Settings
    path('settings/', views.AdminSettingsView.as_view(), name='admin_settings'),
    
    # Audit Logs
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit_logs_list'),
    path('audit-logs/<uuid:pk>/', views.AuditLogDetailView.as_view(), name='audit_logs_detail'),
    
    # Security Events
    path('security-events/', views.SecurityEventListView.as_view(), name='security_events_list'),
    path('security-events/<uuid:pk>/', views.SecurityEventDetailView.as_view(), name='security_events_detail'),
    path('security-events/<uuid:pk>/resolve/', views.resolve_security_event, name='resolve_security_event'),
    
    # Backups
    path('backups/', views.BackupListView.as_view(), name='backups_list'),
    path('backups/<uuid:pk>/', views.BackupDetailView.as_view(), name='backups_detail'),
    path('backups/create/', views.create_backup, name='create_backup'),
    
    # Maintenance Windows
    path('maintenance-windows/', views.MaintenanceWindowListView.as_view(), name='maintenance_windows_list'),
    path('maintenance-windows/<uuid:pk>/', views.MaintenanceWindowDetailView.as_view(), name='maintenance_windows_detail'),
    
    # System Health
    path('system-health/', views.SystemHealthListView.as_view(), name='system_health_list'),
    path('system-health/<uuid:pk>/', views.SystemHealthDetailView.as_view(), name='system_health_detail'),
    
    # API Keys
    path('api-keys/', views.APIKeyListView.as_view(), name='api_keys_list'),
    path('api-keys/<uuid:pk>/', views.APIKeyDetailView.as_view(), name='api_keys_detail'),
]

