from rest_framework import serializers
from .models import (
    SystemSettings, AuditLog, Backup, MaintenanceWindow,
    SystemHealth, SecurityEvent, SystemMetrics, APIKey, AdminSettings
)


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for System Settings"""
    setting_type_display = serializers.CharField(source='get_setting_type_display', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = [
            'id', 'setting_key', 'setting_value', 'setting_type',
            'setting_type_display', 'description', 'category',
            'is_public', 'is_editable', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for Audit Log"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    # Fix for DRF 3.14.0 bug with GenericIPAddressField - use CharField instead
    ip_address = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'tenant', 'tenant_name', 'user', 'user_email',
            'action', 'resource_type', 'resource_id', 'details',
            'ip_address', 'user_agent', 'session_id', 'severity',
            'severity_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BackupSerializer(serializers.ModelSerializer):
    """Serializer for Backup"""
    backup_type_display = serializers.CharField(source='get_backup_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    compression_type_display = serializers.CharField(source='get_compression_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Backup
        fields = [
            'id', 'backup_type', 'backup_type_display', 'filename',
            'file_path', 'file_size', 'file_size_mb', 'checksum',
            'status', 'status_display', 'compression_type',
            'compression_type_display', 'encryption_enabled',
            'retention_days', 'started_at', 'completed_at',
            'error_message', 'created_by', 'created_by_name',
            'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'started_at', 'created_at']
    
    def get_file_size_mb(self, obj):
        return obj.get_file_size_mb()
    
    def get_is_expired(self, obj):
        return obj.is_expired()


class MaintenanceWindowSerializer(serializers.ModelSerializer):
    """Serializer for Maintenance Window"""
    maintenance_type_display = serializers.CharField(source='get_maintenance_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_active = serializers.SerializerMethodField()
    duration_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceWindow
        fields = [
            'id', 'title', 'description', 'maintenance_type',
            'maintenance_type_display', 'start_time', 'end_time',
            'status', 'status_display', 'affected_services',
            'notification_sent', 'notification_sent_at',
            'created_by', 'created_by_name', 'is_active',
            'duration_hours', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_active(self, obj):
        return obj.is_active()
    
    def get_duration_hours(self, obj):
        return obj.get_duration_hours()


class SystemHealthSerializer(serializers.ModelSerializer):
    """Serializer for System Health"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SystemHealth
        fields = [
            'id', 'service_name', 'status', 'status_display',
            'response_time', 'error_count', 'last_check',
            'next_check', 'details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SecurityEventSerializer(serializers.ModelSerializer):
    """Serializer for Security Event"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    # Fix for DRF 3.14.0 bug with GenericIPAddressField - use CharField instead
    ip_address = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    
    class Meta:
        model = SecurityEvent
        fields = [
            'id', 'tenant', 'tenant_name', 'user', 'user_email',
            'event_type', 'event_type_display', 'severity',
            'severity_display', 'description', 'ip_address',
            'user_agent', 'location', 'details', 'is_resolved',
            'resolved_at', 'resolved_by', 'resolved_by_name',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SystemMetricsSerializer(serializers.ModelSerializer):
    """Serializer for System Metrics"""
    
    class Meta:
        model = SystemMetrics
        fields = [
            'id', 'metric_name', 'metric_value', 'metric_unit',
            'timestamp', 'tags'
        ]
        read_only_fields = ['id', 'timestamp']


class APIKeySerializer(serializers.ModelSerializer):
    """Serializer for API Key"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = APIKey
        fields = [
            'id', 'tenant', 'tenant_name', 'user', 'user_email',
            'name', 'permissions', 'is_active', 'last_used',
            'expires_at', 'is_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_used']
        extra_kwargs = {
            'key_hash': {'write_only': True},  # Never expose the key hash
        }
    
    def get_is_expired(self, obj):
        return obj.is_expired()


class AdminSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Admin Settings"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    backup_frequency_display = serializers.CharField(source='get_backup_frequency_display', read_only=True)
    
    class Meta:
        model = AdminSettings
        fields = [
            'id', 'tenant', 'tenant_name', 'timezone', 'date_format',
            'currency', 'language', 'email_notifications',
            'enable_maintenance_mode', 'maintenance_message',
            'enable_two_factor', 'password_policy',
            'session_timeout_minutes', 'max_login_attempts',
            'auto_backup_enabled', 'backup_frequency',
            'backup_frequency_display', 'backup_retention_days',
            'enable_audit_logging', 'audit_retention_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminOverviewStatsSerializer(serializers.Serializer):
    """Serializer for Admin Overview Statistics"""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_tenants = serializers.IntegerField()
    active_tenants = serializers.IntegerField()
    recent_security_events = serializers.IntegerField()
    pending_backups = serializers.IntegerField()
    system_health_status = serializers.CharField()
    active_maintenance_windows = serializers.IntegerField()

