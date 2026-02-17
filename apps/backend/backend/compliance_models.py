"""
Fintech Compliance Models for Audit Trails and Data Governance
Provides comprehensive compliance tracking for financial applications.
"""

import uuid
import json
import hashlib
from typing import Dict, Any, Optional, List
from django.db import models

from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from .query_filters import TenantModel, CompanyScopedModel



class ComplianceAuditLog(TenantModel):
    """
    Comprehensive audit log for compliance tracking.
    Records all data access and modifications for regulatory compliance.
    """
    
    # Audit log types
    AUDIT_TYPES = [
        ('data_access', 'Data Access'),
        ('data_modification', 'Data Modification'),
        ('data_deletion', 'Data Deletion'),
        ('user_authentication', 'User Authentication'),
        ('user_authorization', 'User Authorization'),
        ('system_configuration', 'System Configuration'),
        ('security_event', 'Security Event'),
        ('compliance_check', 'Compliance Check'),
        ('data_export', 'Data Export'),
        ('data_import', 'Data Import'),
    ]
    
    # Severity levels
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Compliance frameworks
    COMPLIANCE_FRAMEWORKS = [
        ('sox', 'SOX (Sarbanes-Oxley)'),
        ('pci_dss', 'PCI DSS'),
        ('gdpr', 'GDPR'),
        ('ccpa', 'CCPA'),
        ('hipaa', 'HIPAA'),
        ('pipa', 'PIPA'),
        ('basel_iii', 'Basel III'),
        ('ifrs', 'IFRS'),
        ('gaap', 'GAAP'),
        ('fincen', 'FinCEN'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audit_type = models.CharField(max_length=50, choices=AUDIT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='medium')
    compliance_framework = models.CharField(max_length=20, choices=COMPLIANCE_FRAMEWORKS, blank=True)
    
    # User and session information
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    session_id = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    
    # Request information
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    query_params = models.JSONField(default=dict, blank=True)
    request_body = models.TextField(blank=True)
    request_size = models.PositiveIntegerField(default=0)
    
    # Response information
    status_code = models.PositiveIntegerField()
    response_body = models.TextField(blank=True)
    response_size = models.PositiveIntegerField(default=0)
    response_time_ms = models.PositiveIntegerField(default=0)
    
    # Data information
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=100, blank=True)
    field_changes = models.JSONField(default=dict, blank=True)
    data_classification = models.CharField(max_length=50, default='internal')
    
    # Compliance information
    retention_period_days = models.PositiveIntegerField(default=2555)  # 7 years default
    is_sensitive_data = models.BooleanField(default=False)
    requires_encryption = models.BooleanField(default=False)
    data_subject_id = models.CharField(max_length=100, blank=True)  # For GDPR compliance
    
    # Audit trail
    audit_hash = models.CharField(max_length=64, unique=True)
    parent_audit_id = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_audits'
    )
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'compliance_audit_logs'
        verbose_name = 'Compliance Audit Log'
        verbose_name_plural = 'Compliance Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tenant', 'timestamp']),
            models.Index(fields=['tenant', 'user', 'timestamp']),
            models.Index(fields=['tenant', 'audit_type', 'timestamp']),
            models.Index(fields=['tenant', 'compliance_framework', 'timestamp']),
            models.Index(fields=['tenant', 'is_sensitive_data', 'timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to generate audit hash and set expiration"""
        if not self.audit_hash:
            self.audit_hash = self._generate_audit_hash()
        
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=self.retention_period_days)
        
        super().save(*args, **kwargs)
    
    def _generate_audit_hash(self):
        """Generate unique hash for audit trail integrity"""
        hash_data = {
            'tenant_id': str(self.tenant.id) if self.tenant else '',
            'user_id': str(self.user.id) if self.user else '',
            'timestamp': self.timestamp.isoformat() if self.timestamp else '',
            'method': self.method,
            'path': self.path,
            'object_id': self.object_id,
        }
        
        hash_string = json.dumps(hash_data, sort_keys=True)
        return hashlib.sha256(hash_string.encode()).hexdigest()
    
    def __str__(self):
        return f"{self.audit_type} - {self.timestamp} - {self.user.email if self.user else 'System'}"


class DataClassification(TenantModel):
    """
    Data classification system for compliance and security.
    Defines how different types of data should be handled.
    """
    
    # Data classification levels
    CLASSIFICATION_LEVELS = [
        ('public', 'Public'),
        ('internal', 'Internal'),
        ('confidential', 'Confidential'),
        ('restricted', 'Restricted'),
        ('top_secret', 'Top Secret'),
    ]
    
    # Data types
    DATA_TYPES = [
        ('personal', 'Personal Information'),
        ('financial', 'Financial Information'),
        ('health', 'Health Information'),
        ('commercial', 'Commercial Information'),
        ('technical', 'Technical Information'),
        ('legal', 'Legal Information'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    classification_level = models.CharField(max_length=20, choices=CLASSIFICATION_LEVELS)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES)
    
    # Security requirements
    requires_encryption = models.BooleanField(default=False)
    requires_access_control = models.BooleanField(default=True)
    requires_audit_logging = models.BooleanField(default=True)
    requires_retention_policy = models.BooleanField(default=True)
    
    # Retention and disposal
    retention_period_days = models.PositiveIntegerField(default=2555)  # 7 years
    disposal_method = models.CharField(max_length=100, default='secure_deletion')
    
    # Compliance requirements
    compliance_frameworks = models.JSONField(default=list, blank=True)
    regulatory_requirements = models.TextField(blank=True)
    
    # Access controls
    allowed_roles = models.JSONField(default=list, blank=True)
    requires_approval = models.BooleanField(default=False)
    approval_roles = models.JSONField(default=list, blank=True)
    
    class Meta:
        db_table = 'data_classifications'
        verbose_name = 'Data Classification'
        verbose_name_plural = 'Data Classifications'
        unique_together = ['tenant', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.classification_level})"


class DataRetentionPolicy(TenantModel):
    """
    Data retention policies for compliance with various regulations.
    """
    
    # Retention types
    RETENTION_TYPES = [
        ('legal_hold', 'Legal Hold'),
        ('regulatory', 'Regulatory'),
        ('business', 'Business'),
        ('operational', 'Operational'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    retention_type = models.CharField(max_length=20, choices=RETENTION_TYPES)
    
    # Data scope
    model_name = models.CharField(max_length=100, blank=True)
    field_name = models.CharField(max_length=100, blank=True)
    data_classification = models.ForeignKey(
        DataClassification,
        on_delete=models.CASCADE,
        related_name='retention_policies'
    )
    
    # Retention periods
    retention_period_days = models.PositiveIntegerField()
    review_period_days = models.PositiveIntegerField(default=365)
    
    # Compliance requirements
    compliance_frameworks = models.JSONField(default=list, blank=True)
    regulatory_basis = models.TextField(blank=True)
    
    # Implementation
    is_active = models.BooleanField(default=True)
    auto_delete = models.BooleanField(default=False)
    requires_approval = models.BooleanField(default=False)
    
    # Audit
    last_reviewed = models.DateTimeField(null=True, blank=True)
    next_review = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'data_retention_policies'
        verbose_name = 'Data Retention Policy'
        verbose_name_plural = 'Data Retention Policies'
        unique_together = ['tenant', 'name']
    
    def save(self, *args, **kwargs):
        """Override save to set next review date"""
        if not self.next_review:
            self.next_review = timezone.now() + timezone.timedelta(days=self.review_period_days)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.retention_period_days} days)"


class ComplianceViolation(TenantModel):
    """
    Records compliance violations and remediation actions.
    """
    
    # Violation types
    VIOLATION_TYPES = [
        ('data_breach', 'Data Breach'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('data_retention', 'Data Retention Violation'),
        ('access_control', 'Access Control Violation'),
        ('audit_failure', 'Audit Failure'),
        ('encryption_failure', 'Encryption Failure'),
        ('data_export', 'Unauthorized Data Export'),
        ('data_import', 'Unauthorized Data Import'),
    ]
    
    # Severity levels
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Status
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    violation_type = models.CharField(max_length=30, choices=VIOLATION_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Description
    title = models.CharField(max_length=200)
    description = models.TextField()
    affected_data = models.TextField(blank=True)
    affected_users = models.JSONField(default=list, blank=True)
    
    # Compliance impact
    compliance_frameworks = models.JSONField(default=list, blank=True)
    regulatory_impact = models.TextField(blank=True)
    potential_fines = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Investigation
    discovered_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='discovered_violations'
    )
    discovered_at = models.DateTimeField(auto_now_add=True)
    investigation_notes = models.TextField(blank=True)
    
    # Resolution
    resolved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_violations'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    remediation_actions = models.JSONField(default=list, blank=True)
    
    # Follow-up
    requires_notification = models.BooleanField(default=False)
    notification_sent = models.BooleanField(default=False)
    notification_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'compliance_violations'
        verbose_name = 'Compliance Violation'
        verbose_name_plural = 'Compliance Violations'
        ordering = ['-discovered_at']
    
    def __str__(self):
        return f"{self.title} ({self.severity})"


class DataSubjectRequest(TenantModel):
    """
    Data subject requests for GDPR and other privacy regulations.
    """
    
    # Request types
    REQUEST_TYPES = [
        ('access', 'Data Access'),
        ('rectification', 'Data Rectification'),
        ('erasure', 'Data Erasure'),
        ('portability', 'Data Portability'),
        ('restriction', 'Processing Restriction'),
        ('objection', 'Objection to Processing'),
    ]
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]
    
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Data subject information
    data_subject_name = models.CharField(max_length=200)
    data_subject_email = models.EmailField()
    data_subject_id = models.CharField(max_length=100, blank=True)
    identity_verified = models.BooleanField(default=False)
    
    # Request details
    description = models.TextField()
    requested_data_types = models.JSONField(default=list, blank=True)
    requested_data_sources = models.JSONField(default=list, blank=True)
    
    # Processing
    assigned_to = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requests'
    )
    processing_notes = models.TextField(blank=True)
    
    # Timelines
    requested_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Response
    response_data = models.JSONField(default=dict, blank=True)
    response_delivery_method = models.CharField(max_length=50, default='email')
    response_delivered = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'data_subject_requests'
        verbose_name = 'Data Subject Request'
        verbose_name_plural = 'Data Subject Requests'
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.request_type} - {self.data_subject_name}"


class SecurityIncident(TenantModel):
    """
    Security incident tracking and response.
    """
    
    # Incident types
    INCIDENT_TYPES = [
        ('malware', 'Malware'),
        ('phishing', 'Phishing'),
        ('data_breach', 'Data Breach'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('system_compromise', 'System Compromise'),
        ('insider_threat', 'Insider Threat'),
        ('ddos', 'DDoS Attack'),
        ('social_engineering', 'Social Engineering'),
    ]
    
    # Severity levels
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Status
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Investigating'),
        ('contained', 'Contained'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    incident_type = models.CharField(max_length=30, choices=INCIDENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Incident details
    title = models.CharField(max_length=200)
    description = models.TextField()
    affected_systems = models.JSONField(default=list, blank=True)
    affected_data = models.TextField(blank=True)
    affected_users = models.JSONField(default=list, blank=True)
    
    # Discovery
    discovered_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='discovered_incidents'
    )
    discovered_at = models.DateTimeField(auto_now_add=True)
    discovery_method = models.CharField(max_length=100, blank=True)
    
    # Response
    assigned_to = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents'
    )
    response_plan = models.TextField(blank=True)
    containment_actions = models.JSONField(default=list, blank=True)
    eradication_actions = models.JSONField(default=list, blank=True)
    recovery_actions = models.JSONField(default=list, blank=True)
    
    # Resolution
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    lessons_learned = models.TextField(blank=True)
    
    # Impact
    business_impact = models.TextField(blank=True)
    financial_impact = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    reputational_impact = models.TextField(blank=True)
    
    class Meta:
        db_table = 'security_incidents'
        verbose_name = 'Security Incident'
        verbose_name_plural = 'Security Incidents'
        ordering = ['-discovered_at']
    
    def __str__(self):
        return f"{self.title} ({self.severity})"
