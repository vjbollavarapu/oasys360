from django.db import models
import uuid


class Document(models.Model):
    """
    Document model for managing uploaded documents
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='documents')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='documents')
    filename = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()  # Size in bytes
    mime_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    document_type = models.CharField(max_length=50, blank=True, choices=[
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('bank_statement', 'Bank Statement'),
        ('contract', 'Contract'),
        ('expense_report', 'Expense Report'),
        ('tax_document', 'Tax Document'),
        ('other', 'Other'),
    ])
    extracted_data = models.JSONField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    processing_errors = models.TextField(blank=True)
    uploaded_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='uploaded_documents')
    processed_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, null=True, blank=True, related_name='processed_documents')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_filename} ({self.document_type})"

    def get_file_size_mb(self):
        """Get file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)

    def is_image(self):
        """Check if document is an image"""
        return self.mime_type.startswith('image/')

    def is_pdf(self):
        """Check if document is a PDF"""
        return self.mime_type == 'application/pdf'


class AICategorization(models.Model):
    """
    AI Categorization model for storing AI categorization results
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='categorizations')
    category = models.CharField(max_length=100)
    confidence = models.FloatField()
    ai_model = models.CharField(max_length=100)
    model_version = models.CharField(max_length=50, blank=True)
    processing_time = models.FloatField(null=True, blank=True)  # Time in seconds
    raw_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_categorizations'
        verbose_name = 'AI Categorization'
        verbose_name_plural = 'AI Categorizations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document.original_filename} - {self.category} ({self.confidence}%)"


class AIExtractionResult(models.Model):
    """
    AI Extraction Result model for storing extracted data from documents
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='extraction_results')
    field_name = models.CharField(max_length=100)
    field_value = models.TextField()
    confidence = models.FloatField()
    bounding_box = models.JSONField(null=True, blank=True)  # For OCR results
    ai_model = models.CharField(max_length=100)
    model_version = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_extraction_results'
        verbose_name = 'AI Extraction Result'
        verbose_name_plural = 'AI Extraction Results'
        ordering = ['field_name', '-confidence']

    def __str__(self):
        return f"{self.document.original_filename} - {self.field_name}: {self.field_value}"


class AIProcessingJob(models.Model):
    """
    AI Processing Job model for managing AI processing tasks
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='ai_processing_jobs')
    job_type = models.CharField(max_length=50, choices=[
        ('document_categorization', 'Document Categorization'),
        ('data_extraction', 'Data Extraction'),
        ('ocr_processing', 'OCR Processing'),
        ('fraud_detection', 'Fraud Detection'),
        ('anomaly_detection', 'Anomaly Detection'),
    ])
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    priority = models.IntegerField(default=5, choices=[
        (1, 'Low'),
        (3, 'Normal'),
        (5, 'High'),
        (7, 'Urgent'),
        (9, 'Critical'),
    ])
    documents = models.ManyToManyField(Document, related_name='processing_jobs')
    parameters = models.JSONField(default=dict, blank=True)
    results = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_processing_jobs'
        verbose_name = 'AI Processing Job'
        verbose_name_plural = 'AI Processing Jobs'
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"{self.job_type} - {self.status} ({self.created_at})"

    def get_processing_time(self):
        """Get total processing time in seconds"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None

    def get_documents_count(self):
        """Get number of documents in this job"""
        return self.documents.count()


class AIModel(models.Model):
    """
    AI Model model for managing different AI models
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=50)
    model_type = models.CharField(max_length=50, choices=[
        ('categorization', 'Categorization'),
        ('extraction', 'Data Extraction'),
        ('ocr', 'OCR'),
        ('fraud_detection', 'Fraud Detection'),
        ('anomaly_detection', 'Anomaly Detection'),
    ])
    provider = models.CharField(max_length=100, choices=[
        ('openai', 'OpenAI'),
        ('google', 'Google'),
        ('azure', 'Microsoft Azure'),
        ('aws', 'Amazon AWS'),
        ('custom', 'Custom'),
    ])
    model_id = models.CharField(max_length=255)  # Provider-specific model ID
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    configuration = models.JSONField(default=dict, blank=True)
    performance_metrics = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_models'
        verbose_name = 'AI Model'
        verbose_name_plural = 'AI Models'
        unique_together = ['name', 'version']

    def __str__(self):
        return f"{self.name} v{self.version} ({self.provider})"

    def save(self, *args, **kwargs):
        # Ensure only one default model per type
        if self.is_default:
            AIModel.objects.filter(
                model_type=self.model_type,
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)


class AIProcessingLog(models.Model):
    """
    AI Processing Log model for tracking AI processing activities
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='ai_processing_logs')
    job = models.ForeignKey(AIProcessingJob, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='processing_logs', null=True, blank=True)
    level = models.CharField(max_length=20, choices=[
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ])
    message = models.TextField()
    details = models.JSONField(null=True, blank=True)
    processing_time = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_processing_logs'
        verbose_name = 'AI Processing Log'
        verbose_name_plural = 'AI Processing Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.level}: {self.message[:50]}"
