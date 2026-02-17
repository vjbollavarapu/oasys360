from django.db import models
import uuid


class SystemSettings(models.Model):
    """
    System Settings model for managing platform-wide settings
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    setting_key = models.CharField(max_length=255, unique=True)
    setting_value = models.TextField()
    setting_type = models.CharField(max_length=50, choices=[
        ('string', 'String'),
        ('integer', 'Integer'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
        ('email', 'Email'),
        ('url', 'URL'),
    ], default='string')
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_public = models.BooleanField(default=False)  # Whether setting is visible to tenants
    is_editable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_settings'
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"{self.setting_key} = {self.setting_value}"


class AuditLog(models.Model):
    """
    Audit Log model for tracking system-wide activities
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='audit_logs', null=True, blank=True)
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='audit_logs', null=True, blank=True)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=100)  # e.g., 'user', 'invoice', 'tenant'
    resource_id = models.CharField(max_length=255, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=255, blank=True)
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.resource_type} - {self.created_at}"


class Backup(models.Model):
    """
    Backup model for managing system backups
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    backup_type = models.CharField(max_length=50, choices=[
        ('database', 'Database'),
        ('files', 'Files'),
        ('full', 'Full System'),
    ])
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()  # Size in bytes
    checksum = models.CharField(max_length=64)  # SHA-256 hash
    status = models.CharField(max_length=20, default='in_progress', choices=[
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    compression_type = models.CharField(max_length=20, choices=[
        ('none', 'None'),
        ('gzip', 'Gzip'),
        ('zip', 'Zip'),
        ('tar', 'Tar'),
    ], default='gzip')
    encryption_enabled = models.BooleanField(default=True)
    retention_days = models.IntegerField(default=30)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'backups'
        verbose_name = 'Backup'
        verbose_name_plural = 'Backups'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.backup_type} backup - {self.filename}"

    def get_file_size_mb(self):
        """Get file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)

    def is_expired(self):
        """Check if backup has expired based on retention policy"""
        from django.utils import timezone
        from datetime import timedelta
        return self.created_at < timezone.now() - timedelta(days=self.retention_days)


class MaintenanceWindow(models.Model):
    """
    Maintenance Window model for scheduling system maintenance
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    maintenance_type = models.CharField(max_length=50, choices=[
        ('scheduled', 'Scheduled'),
        ('emergency', 'Emergency'),
        ('upgrade', 'System Upgrade'),
        ('backup', 'Backup'),
        ('other', 'Other'),
    ])
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, default='scheduled', choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ])
    affected_services = models.JSONField(default=list)  # List of affected services
    notification_sent = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'maintenance_windows'
        verbose_name = 'Maintenance Window'
        verbose_name_plural = 'Maintenance Windows'
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.title} - {self.start_time}"

    def is_active(self):
        """Check if maintenance window is currently active"""
        from django.utils import timezone
        return self.start_time <= timezone.now() <= self.end_time

    def get_duration_hours(self):
        """Get maintenance duration in hours"""
        return (self.end_time - self.start_time).total_seconds() / 3600


class SystemHealth(models.Model):
    """
    System Health model for monitoring system health
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[
        ('healthy', 'Healthy'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
        ('down', 'Down'),
    ])
    response_time = models.FloatField(null=True, blank=True)  # Response time in seconds
    error_count = models.IntegerField(default=0)
    last_check = models.DateTimeField(auto_now_add=True)
    next_check = models.DateTimeField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_health'
        verbose_name = 'System Health'
        verbose_name_plural = 'System Health'
        ordering = ['service_name']

    def __str__(self):
        return f"{self.service_name} - {self.status}"


class SecurityEvent(models.Model):
    """
    Security Event model for tracking security-related events
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='security_events', null=True, blank=True)
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='security_events', null=True, blank=True)
    event_type = models.CharField(max_length=100, choices=[
        ('login_failed', 'Login Failed'),
        ('login_success', 'Login Success'),
        ('logout', 'Logout'),
        ('password_change', 'Password Change'),
        ('password_reset', 'Password Reset'),
        ('account_locked', 'Account Locked'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('data_access', 'Data Access'),
        ('permission_change', 'Permission Change'),
        ('api_access', 'API Access'),
        ('file_upload', 'File Upload'),
        ('file_download', 'File Download'),
        ('other', 'Other'),
    ])
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ])
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    details = models.JSONField(default=dict, blank=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, null=True, blank=True, related_name='resolved_security_events')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'security_events'
        verbose_name = 'Security Event'
        verbose_name_plural = 'Security Events'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} - {self.severity} - {self.created_at}"


class SystemMetrics(models.Model):
    """
    System Metrics model for tracking system performance metrics
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric_name = models.CharField(max_length=100)
    metric_value = models.FloatField()
    metric_unit = models.CharField(max_length=20, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    tags = models.JSONField(default=dict, blank=True)  # Additional tags for filtering

    class Meta:
        db_table = 'system_metrics'
        verbose_name = 'System Metric'
        verbose_name_plural = 'System Metrics'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.metric_name}: {self.metric_value} {self.metric_unit}"


class APIKey(models.Model):
    """
    API Key model for managing API access
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='api_keys', null=True, blank=True)
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=255)
    key_hash = models.CharField(max_length=255)  # Hashed API key
    permissions = models.JSONField(default=list)  # List of permissions
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_keys'
        verbose_name = 'API Key'
        verbose_name_plural = 'API Keys'

    def __str__(self):
        return f"{self.name} - {self.user.email}"

    def is_expired(self):
        """Check if API key has expired"""
        from django.utils import timezone
        return self.expires_at and self.expires_at < timezone.now()


class AdminSettings(models.Model):
    """
    Admin Settings model for tenant-specific admin configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='admin_settings')
    
    # General Settings
    timezone = models.CharField(max_length=100, default='UTC')
    date_format = models.CharField(max_length=20, default='YYYY-MM-DD')
    currency = models.CharField(max_length=3, default='USD')
    language = models.CharField(max_length=10, default='en')
    
    # Notification Settings
    email_notifications = models.BooleanField(default=True)
    enable_maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(blank=True)
    
    # Security Settings
    enable_two_factor = models.BooleanField(default=False)
    password_policy = models.JSONField(default=dict, blank=True)
    session_timeout_minutes = models.IntegerField(default=60)
    max_login_attempts = models.IntegerField(default=5)
    
    # Backup Settings
    auto_backup_enabled = models.BooleanField(default=True)
    backup_frequency = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ], default='daily')
    backup_retention_days = models.IntegerField(default=30)
    
    # Audit Settings
    enable_audit_logging = models.BooleanField(default=True)
    audit_retention_days = models.IntegerField(default=365)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admin_settings'
        verbose_name = 'Admin Settings'
        verbose_name_plural = 'Admin Settings'
        unique_together = ['tenant']

    def __str__(self):
        return f"Admin Settings - {self.tenant.name}"
