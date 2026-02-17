from django.db import models
import uuid


class DocumentFile(models.Model):
    """
    Document File model for managing document files
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='document_files')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='document_files')
    filename = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()  # Size in bytes
    mime_type = models.CharField(max_length=100, blank=True)
    document_type = models.CharField(max_length=50, choices=[
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('contract', 'Contract'),
        ('report', 'Report'),
        ('statement', 'Statement'),
        ('certificate', 'Certificate'),
        ('license', 'License'),
        ('other', 'Other'),
    ])
    category = models.CharField(max_length=100, blank=True)
    tags = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)
    folder = models.ForeignKey('DocumentFolder', on_delete=models.SET_NULL, null=True, blank=True, related_name='files')
    is_public = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    version = models.IntegerField(default=1)
    checksum = models.CharField(max_length=64, blank=True)  # SHA-256 hash
    uploaded_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='uploaded_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_files'
        verbose_name = 'Document File'
        verbose_name_plural = 'Document Files'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_filename} ({self.document_type})"

    def get_file_size_mb(self):
        """Get file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)

    def get_file_extension(self):
        """Get file extension"""
        return self.original_filename.split('.')[-1].lower() if '.' in self.original_filename else ''


class DocumentFolder(models.Model):
    """
    Document Folder model for organizing documents
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='document_folders')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    path = models.CharField(max_length=500, blank=True)  # Full folder path
    is_public = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False)  # System folders cannot be deleted
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_folders'
        verbose_name = 'Document Folder'
        verbose_name_plural = 'Document Folders'
        unique_together = ['tenant', 'parent', 'name']

    def __str__(self):
        return self.name

    def get_full_path(self):
        """Get full folder path"""
        if self.parent:
            return f"{self.parent.get_full_path()}/{self.name}"
        return self.name

    def save(self, *args, **kwargs):
        self.path = self.get_full_path()
        super().save(*args, **kwargs)


class DocumentTemplate(models.Model):
    """
    Document Template model for managing document templates
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='document_templates')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    template_type = models.CharField(max_length=50, choices=[
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('contract', 'Contract'),
        ('report', 'Report'),
        ('letter', 'Letter'),
        ('form', 'Form'),
        ('other', 'Other'),
    ])
    file_path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=100)
    variables = models.JSONField(default=list, blank=True)  # Template variables
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_templates'
        verbose_name = 'Document Template'
        verbose_name_plural = 'Document Templates'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one default template per type per tenant
        if self.is_default:
            DocumentTemplate.objects.filter(
                tenant=self.tenant,
                template_type=self.template_type,
                is_default=True
            ).exclude(id=self.id if self.id else None).update(is_default=False)
        super().save(*args, **kwargs)


class DocumentVersion(models.Model):
    """
    Document Version model for tracking document versions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(DocumentFile, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    checksum = models.CharField(max_length=64)
    changes = models.TextField(blank=True)  # Description of changes
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_versions'
        verbose_name = 'Document Version'
        verbose_name_plural = 'Document Versions'
        unique_together = ['document', 'version_number']
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.document.original_filename} v{self.version_number}"


class DocumentShare(models.Model):
    """
    Document Share model for managing document sharing
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(DocumentFile, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='shared_documents')
    shared_with = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='received_documents', null=True, blank=True)
    shared_with_email = models.EmailField(blank=True)  # For external sharing
    permission = models.CharField(max_length=20, choices=[
        ('view', 'View'),
        ('download', 'Download'),
        ('edit', 'Edit'),
        ('admin', 'Admin'),
    ], default='view')
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    access_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_shares'
        verbose_name = 'Document Share'
        verbose_name_plural = 'Document Shares'

    def __str__(self):
        return f"{self.document.original_filename} shared with {self.shared_with_email or self.shared_with.email}"

    def is_expired(self):
        """Check if share has expired"""
        from django.utils import timezone
        return self.expires_at and self.expires_at < timezone.now()


class DocumentComment(models.Model):
    """
    Document Comment model for managing document comments
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(DocumentFile, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    comment = models.TextField()
    page_number = models.IntegerField(null=True, blank=True)  # For PDF comments
    coordinates = models.JSONField(null=True, blank=True)  # For positioning comments
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_comments'
        verbose_name = 'Document Comment'
        verbose_name_plural = 'Document Comments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment on {self.document.original_filename} by {self.user.email}"


class DocumentAuditLog(models.Model):
    """
    Document Audit Log model for tracking document activities
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(DocumentFile, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=[
        ('created', 'Created'),
        ('viewed', 'Viewed'),
        ('downloaded', 'Downloaded'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('shared', 'Shared'),
        ('commented', 'Commented'),
        ('archived', 'Archived'),
        ('restored', 'Restored'),
    ])
    details = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_audit_logs'
        verbose_name = 'Document Audit Log'
        verbose_name_plural = 'Document Audit Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.document.original_filename} by {self.user.email}"


class DocumentWorkflow(models.Model):
    """
    Document Workflow model for managing document processing workflows
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='document_workflows')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    workflow_type = models.CharField(max_length=50, choices=[
        ('approval', 'Approval Workflow'),
        ('review', 'Review Workflow'),
        ('processing', 'Processing Workflow'),
        ('routing', 'Document Routing'),
        ('classification', 'Classification'),
        ('custom', 'Custom Workflow'),
    ])
    trigger_type = models.CharField(max_length=50, choices=[
        ('upload', 'On Upload'),
        ('manual', 'Manual'),
        ('scheduled', 'Scheduled'),
        ('event', 'Event Based'),
    ], default='upload')
    steps = models.JSONField(default=list, blank=True, help_text='Workflow steps configuration')
    is_active = models.BooleanField(default=True)
    auto_assign = models.BooleanField(default=False)
    notification_enabled = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_workflows'
        verbose_name = 'Document Workflow'
        verbose_name_plural = 'Document Workflows'

    def __str__(self):
        return f"{self.name} ({self.get_workflow_type_display()})"


class DocumentWorkflowInstance(models.Model):
    """
    Document Workflow Instance model for tracking workflow executions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='document_workflow_instances')
    workflow = models.ForeignKey(DocumentWorkflow, on_delete=models.CASCADE, related_name='instances')
    document = models.ForeignKey(DocumentFile, on_delete=models.CASCADE, related_name='workflow_instances')
    current_step = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    started_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='started_workflows')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'document_workflow_instances'
        verbose_name = 'Document Workflow Instance'
        verbose_name_plural = 'Document Workflow Instances'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.workflow.name} - {self.document.original_filename} ({self.status})"


class DocumentWorkflowStep(models.Model):
    """
    Document Workflow Step model for tracking individual workflow steps
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_instance = models.ForeignKey(DocumentWorkflowInstance, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    step_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
        ('rejected', 'Rejected'),
    ], default='pending')
    assigned_to = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_workflow_steps')
    action = models.CharField(max_length=100, blank=True)
    comments = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'document_workflow_steps'
        verbose_name = 'Document Workflow Step'
        verbose_name_plural = 'Document Workflow Steps'
        ordering = ['step_number']

    def __str__(self):
        return f"Step {self.step_number}: {self.step_name} - {self.status}"


class DocumentStorage(models.Model):
    """
    Document Storage model for managing storage locations and configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='document_storages')
    name = models.CharField(max_length=255)
    storage_type = models.CharField(max_length=50, choices=[
        ('local', 'Local Storage'),
        ('s3', 'AWS S3'),
        ('r2', 'Cloudflare R2'),
        ('azure', 'Azure Blob Storage'),
        ('gcs', 'Google Cloud Storage'),
        ('dropbox', 'Dropbox'),
        ('onedrive', 'OneDrive'),
        ('custom', 'Custom Storage'),
    ])
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict, blank=True, help_text='Storage configuration (credentials, bucket, etc.)')
    base_path = models.CharField(max_length=500, blank=True)
    total_space = models.BigIntegerField(null=True, blank=True, help_text='Total storage space in bytes')
    used_space = models.BigIntegerField(default=0, help_text='Used storage space in bytes')
    is_encrypted = models.BooleanField(default=True)
    backup_enabled = models.BooleanField(default=False)
    backup_frequency = models.CharField(max_length=50, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ], blank=True)
    last_backup = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_storages'
        verbose_name = 'Document Storage'
        verbose_name_plural = 'Document Storages'
        unique_together = ['tenant', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_storage_type_display()})"

    def get_used_space_percentage(self):
        """Get used space as percentage"""
        if self.total_space and self.total_space > 0:
            return (self.used_space / self.total_space) * 100
        return 0


class DocumentSettings(models.Model):
    """
    Document Settings model for tenant/company-specific document configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='document_settings')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='document_settings', null=True, blank=True)
    
    # General Settings
    max_file_size_mb = models.IntegerField(default=100, help_text='Maximum file size in MB')
    allowed_file_types = models.JSONField(default=list, blank=True, help_text='Allowed file extensions')
    enable_versioning = models.BooleanField(default=True)
    max_versions = models.IntegerField(default=10)
    
    # Processing Settings
    enable_ocr = models.BooleanField(default=True)
    auto_classification = models.BooleanField(default=False)
    enable_auto_indexing = models.BooleanField(default=True)
    ocr_languages = models.JSONField(default=list, blank=True)
    
    # Storage Settings
    default_storage = models.ForeignKey(DocumentStorage, on_delete=models.SET_NULL, null=True, blank=True, related_name='default_for_settings')
    enable_compression = models.BooleanField(default=False)
    retention_days = models.IntegerField(default=2555, help_text='Document retention period in days')
    
    # Security Settings
    enable_encryption = models.BooleanField(default=True)
    enable_watermark = models.BooleanField(default=False)
    require_approval_for_deletion = models.BooleanField(default=False)
    enable_audit_logging = models.BooleanField(default=True)
    
    # Workflow Settings
    enable_workflows = models.BooleanField(default=True)
    default_workflow = models.ForeignKey(DocumentWorkflow, on_delete=models.SET_NULL, null=True, blank=True, related_name='default_for_settings')
    
    # Notification Settings
    enable_email_notifications = models.BooleanField(default=True)
    notify_on_upload = models.BooleanField(default=False)
    notify_on_approval = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_settings'
        verbose_name = 'Document Settings'
        verbose_name_plural = 'Document Settings'
        unique_together = ['tenant', 'company']

    def __str__(self):
        return f"Document Settings - {self.tenant.name}"
