from django.db import models
from django.contrib.auth import get_user_model
from tenants.models import Tenant
from django.utils import timezone
import uuid

User = get_user_model()


class SalesInquiry(models.Model):
    """Model for storing sales inquiries from potential customers"""
    
    INQUIRY_TYPES = [
        ('demo', 'Request Demo'),
        ('pricing', 'Pricing Information'),
        ('enterprise', 'Enterprise Solution'),
        ('partnership', 'Partnership Inquiry'),
        ('support', 'Technical Support'),
        ('general', 'General Information'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('demo_scheduled', 'Demo Scheduled'),
        ('proposal_sent', 'Proposal Sent'),
        ('negotiating', 'Negotiating'),
        ('closed_won', 'Closed Won'),
        ('closed_lost', 'Closed Lost'),
        ('follow_up', 'Follow Up Required'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='sales_inquiries')
    
    # Contact Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=200)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Inquiry Details
    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPES, default='general')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    # Business Information
    company_size = models.CharField(max_length=50, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    current_solution = models.CharField(max_length=200, blank=True, null=True)
    budget_range = models.CharField(max_length=50, blank=True, null=True)
    timeline = models.CharField(max_length=50, blank=True, null=True)
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Assignment and Follow-up
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_inquiries')
    source = models.CharField(max_length=50, default='website')  # website, referral, ad, etc.
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    contacted_at = models.DateTimeField(null=True, blank=True)
    
    # Additional Fields
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'sales_inquiries'
        ordering = ['-created_at']
        verbose_name = 'Sales Inquiry'
        verbose_name_plural = 'Sales Inquiries'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company} ({self.inquiry_type})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def mark_contacted(self):
        """Mark inquiry as contacted"""
        self.status = 'contacted'
        self.contacted_at = timezone.now()
        self.save()


class SalesInquiryResponse(models.Model):
    """Model for storing responses to sales inquiries"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inquiry = models.ForeignKey(SalesInquiry, on_delete=models.CASCADE, related_name='responses')
    responded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inquiry_responses')
    
    response_type = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('call', 'Phone Call'),
        ('meeting', 'Meeting'),
        ('demo', 'Demo'),
        ('proposal', 'Proposal'),
        ('follow_up', 'Follow Up'),
    ])
    
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_internal = models.BooleanField(default=False)  # Internal notes vs customer communication
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sales_inquiry_responses'
        ordering = ['-created_at']
        verbose_name = 'Sales Inquiry Response'
        verbose_name_plural = 'Sales Inquiry Responses'
    
    def __str__(self):
        return f"Response to {self.inquiry.full_name} - {self.response_type}"


class SalesInquiryAttachment(models.Model):
    """Model for storing attachments related to sales inquiries"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inquiry = models.ForeignKey(SalesInquiry, on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.IntegerField()
    file_type = models.CharField(max_length=100)
    
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sales_inquiry_attachments'
        verbose_name = 'Sales Inquiry Attachment'
        verbose_name_plural = 'Sales Inquiry Attachments'
    
    def __str__(self):
        return f"{self.file_name} - {self.inquiry.full_name}"