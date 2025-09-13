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
            ).update(is_default=False)
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
