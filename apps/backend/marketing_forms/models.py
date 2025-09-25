from django.db import models
from django.contrib.auth import get_user_model
from tenants.models import Tenant
from django.utils import timezone
import uuid

User = get_user_model()


class BetaProgramApplication(models.Model):
    """Model for storing beta program applications"""
    
    COMPANY_SIZES = [
        ('1-10', '1-10 employees'),
        ('11-50', '11-50 employees'),
        ('51-200', '51-200 employees'),
        ('201-1000', '201-1000 employees'),
        ('1000+', '1000+ employees'),
    ]
    
    ROLES = [
        ('ceo', 'CEO/Founder'),
        ('cfo', 'CFO'),
        ('accountant', 'Accountant'),
        ('bookkeeper', 'Bookkeeper'),
        ('finance-manager', 'Finance Manager'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('onboarded', 'Onboarded'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='beta_applications', null=True, blank=True)
    
    # Personal Information
    name = models.CharField(max_length=200)
    email = models.EmailField()
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=ROLES)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZES)
    
    # Application Details
    use_case = models.TextField(help_text="How do you plan to use OASYS?")
    expectations = models.TextField(blank=True, null=True, help_text="What are your expectations from the beta program?")
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_beta_applications')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Additional Fields
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'beta_program_applications'
        ordering = ['-created_at']
        verbose_name = 'Beta Program Application'
        verbose_name_plural = 'Beta Program Applications'
    
    def __str__(self):
        return f"{self.name} - {self.company} (Beta Application)"
    
    def approve(self):
        """Approve the beta application"""
        self.status = 'approved'
        self.approved_at = timezone.now()
        self.save()
    
    def reject(self):
        """Reject the beta application"""
        self.status = 'rejected'
        self.reviewed_at = timezone.now()
        self.save()


class EarlyAccessRequest(models.Model):
    """Model for storing early access requests"""
    
    COMPANY_SIZES = [
        ('1-10', '1-10 employees'),
        ('11-50', '11-50 employees'),
        ('51-200', '51-200 employees'),
        ('201-1000', '201-1000 employees'),
        ('1000+', '1000+ employees'),
    ]
    
    ROLES = [
        ('ceo', 'CEO/Founder'),
        ('cfo', 'CFO'),
        ('accountant', 'Accountant'),
        ('bookkeeper', 'Bookkeeper'),
        ('finance-manager', 'Finance Manager'),
        ('other', 'Other'),
    ]
    
    INDUSTRIES = [
        ('technology', 'Technology'),
        ('finance', 'Finance'),
        ('healthcare', 'Healthcare'),
        ('retail', 'Retail'),
        ('manufacturing', 'Manufacturing'),
        ('consulting', 'Consulting'),
        ('other', 'Other'),
    ]
    
    TIMELINES = [
        ('immediately', 'Immediately'),
        ('1-month', 'Within 1 month'),
        ('3-months', 'Within 3 months'),
        ('6-months', 'Within 6 months'),
        ('exploring', 'Just exploring'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('onboarded', 'Onboarded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='early_access_requests', null=True, blank=True)
    
    # Personal Information
    name = models.CharField(max_length=200)
    email = models.EmailField()
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=ROLES)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZES)
    industry = models.CharField(max_length=20, choices=INDUSTRIES)
    
    # Request Details
    current_challenges = models.TextField(help_text="Current financial challenges you're facing")
    timeline = models.CharField(max_length=20, choices=TIMELINES)
    expectations = models.TextField(blank=True, null=True, help_text="What do you expect from early access?")
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_early_access_requests')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    interview_scheduled_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Additional Fields
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'early_access_requests'
        ordering = ['-created_at']
        verbose_name = 'Early Access Request'
        verbose_name_plural = 'Early Access Requests'
    
    def __str__(self):
        return f"{self.name} - {self.company} (Early Access Request)"
    
    def schedule_interview(self):
        """Schedule interview for early access request"""
        self.status = 'interview_scheduled'
        self.interview_scheduled_at = timezone.now()
        self.save()
    
    def approve(self):
        """Approve the early access request"""
        self.status = 'approved'
        self.approved_at = timezone.now()
        self.save()


class FounderFeedback(models.Model):
    """Model for storing founder feedback submissions"""
    
    FEEDBACK_TYPES = [
        ('feature-request', 'Feature Request'),
        ('product-feedback', 'Product Feedback'),
        ('general-feedback', 'General Feedback'),
        ('partnership', 'Partnership Inquiry'),
        ('bug-report', 'Bug Report'),
        ('other', 'Other'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    CONTACT_PREFERENCES = [
        ('email', 'Email'),
        ('phone', 'Phone Call'),
        ('video', 'Video Call'),
        ('no-preference', 'No Preference'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('acknowledged', 'Acknowledged'),
        ('in-progress', 'In Progress'),
        ('responded', 'Responded'),
        ('closed', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='founder_feedback', null=True, blank=True)
    
    # Contact Information
    name = models.CharField(max_length=200)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    
    # Feedback Details
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    contact_preference = models.CharField(max_length=20, choices=CONTACT_PREFERENCES, default='email')
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_founder_feedback')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Additional Fields
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'founder_feedback'
        ordering = ['-created_at']
        verbose_name = 'Founder Feedback'
        verbose_name_plural = 'Founder Feedback'
    
    def __str__(self):
        return f"{self.name} - {self.subject} ({self.feedback_type})"
    
    def acknowledge(self):
        """Acknowledge the feedback"""
        self.status = 'acknowledged'
        self.acknowledged_at = timezone.now()
        self.save()
    
    def mark_responded(self):
        """Mark feedback as responded"""
        self.status = 'responded'
        self.responded_at = timezone.now()
        self.save()