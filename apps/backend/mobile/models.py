from django.db import models
import uuid


class MobileDevice(models.Model):
    """
    Mobile Device model for managing mobile devices
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mobile_devices')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='mobile_devices')
    device_id = models.CharField(max_length=255, unique=True)
    device_name = models.CharField(max_length=255)
    device_type = models.CharField(max_length=20, choices=[
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web'),
    ])
    device_model = models.CharField(max_length=255, blank=True)
    os_version = models.CharField(max_length=50, blank=True)
    app_version = models.CharField(max_length=50, blank=True)
    push_token = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_devices'
        verbose_name = 'Mobile Device'
        verbose_name_plural = 'Mobile Devices'

    def __str__(self):
        return f"{self.device_name} ({self.device_type}) - {self.user.email}"


class MobileNotification(models.Model):
    """
    Mobile Notification model for managing push notifications
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mobile_notifications')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='mobile_notifications')
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=[
        ('invoice', 'Invoice'),
        ('payment', 'Payment'),
        ('expense', 'Expense'),
        ('approval', 'Approval'),
        ('reminder', 'Reminder'),
        ('alert', 'Alert'),
        ('update', 'Update'),
        ('other', 'Other'),
    ])
    data = models.JSONField(default=dict, blank=True)  # Additional notification data
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    priority = models.CharField(max_length=20, default='normal', choices=[
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ])
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_notifications'
        verbose_name = 'Mobile Notification'
        verbose_name_plural = 'Mobile Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"

    def is_read(self):
        """Check if notification has been read"""
        return self.read_at is not None

    def is_delivered(self):
        """Check if notification has been delivered"""
        return self.delivered_at is not None


class MobileSession(models.Model):
    """
    Mobile Session model for tracking mobile app sessions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mobile_sessions')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='mobile_sessions')
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE, related_name='sessions')
    session_token = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_sessions'
        verbose_name = 'Mobile Session'
        verbose_name_plural = 'Mobile Sessions'
        ordering = ['-started_at']

    def __str__(self):
        return f"Session {self.session_token[:10]}... - {self.user.email}"

    def get_duration(self):
        """Get session duration in seconds"""
        from django.utils import timezone
        end_time = self.ended_at or timezone.now()
        return (end_time - self.started_at).total_seconds()

    def is_expired(self):
        """Check if session has expired"""
        from django.utils import timezone
        from datetime import timedelta
        # Sessions expire after 24 hours of inactivity
        return self.last_activity < timezone.now() - timedelta(hours=24)


class MobileAppVersion(models.Model):
    """
    Mobile App Version model for managing app versions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mobile_app_versions')
    platform = models.CharField(max_length=20, choices=[
        ('ios', 'iOS'),
        ('android', 'Android'),
    ])
    version = models.CharField(max_length=50)
    build_number = models.CharField(max_length=50)
    is_required = models.BooleanField(default=False)  # Force update
    is_recommended = models.BooleanField(default=False)  # Recommended update
    release_notes = models.TextField(blank=True)
    download_url = models.URLField(blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    checksum = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)
    release_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_app_versions'
        verbose_name = 'Mobile App Version'
        verbose_name_plural = 'Mobile App Versions'
        unique_together = ['tenant', 'platform', 'version']

    def __str__(self):
        return f"{self.platform} v{self.version} (Build {self.build_number})"


class MobileFeatureFlag(models.Model):
    """
    Mobile Feature Flag model for managing feature flags
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mobile_feature_flags')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_enabled = models.BooleanField(default=False)
    platforms = models.JSONField(default=list)  # List of platforms where feature is available
    user_roles = models.JSONField(default=list)  # List of user roles that can access the feature
    rollout_percentage = models.IntegerField(default=100)  # Percentage of users to roll out to
    settings = models.JSONField(default=dict, blank=True)  # Feature-specific settings
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_feature_flags'
        verbose_name = 'Mobile Feature Flag'
        verbose_name_plural = 'Mobile Feature Flags'
        unique_together = ['tenant', 'name']

    def __str__(self):
        return f"{self.name} - {'Enabled' if self.is_enabled else 'Disabled'}"


class MobileAnalytics(models.Model):
    """
    Mobile Analytics model for tracking mobile app usage
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mobile_analytics')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='mobile_analytics')
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE, related_name='analytics')
    event_type = models.CharField(max_length=100)
    event_name = models.CharField(max_length=255)
    event_data = models.JSONField(default=dict, blank=True)
    screen_name = models.CharField(max_length=255, blank=True)
    session_id = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        db_table = 'mobile_analytics'
        verbose_name = 'Mobile Analytics'
        verbose_name_plural = 'Mobile Analytics'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event_type}: {self.event_name} - {self.user.email}"


class MobileOfflineData(models.Model):
    """
    Mobile Offline Data model for managing offline data sync
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mobile_offline_data')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='mobile_offline_data')
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE, related_name='offline_data')
    data_type = models.CharField(max_length=100)  # e.g., 'invoices', 'customers', 'items'
    data_id = models.CharField(max_length=255)  # ID of the specific record
    action = models.CharField(max_length=20, choices=[
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
    ])
    data = models.JSONField()  # The actual data
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('syncing', 'Syncing'),
        ('synced', 'Synced'),
        ('failed', 'Failed'),
    ])
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'mobile_offline_data'
        verbose_name = 'Mobile Offline Data'
        verbose_name_plural = 'Mobile Offline Data'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} {self.data_type} - {self.user.email}"
