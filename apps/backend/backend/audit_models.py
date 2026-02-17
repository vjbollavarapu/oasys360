"""
Audit Models for Multi-Tenant Database Operations
Provides comprehensive audit logging for compliance and security.
"""

import logging
import json
import hashlib
import uuid
from typing import Any, Optional, Dict, List
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import Q, QuerySet
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.conf import settings
from .row_tenant_middleware import get_current_tenant, get_current_user

# User = get_user_model()  # Lazy import to avoid circular import issues
logger = logging.getLogger(__name__)


class AuditLog(models.Model):
    """
    Comprehensive audit log for all tenant-specific database operations.
    Stores tenant_id, user_id, operation, and timestamp for compliance.
    """
    
    # Primary identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Tenant and user context
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='audit_logs',
        help_text="Tenant that owns this audit record"
    )
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text="User who performed the operation"
    )
    
    # Operation details
    operation = models.CharField(
        max_length=20,
        choices=[
            ('CREATE', 'Create'),
            ('READ', 'Read'),
            ('UPDATE', 'Update'),
            ('DELETE', 'Delete'),
            ('LOGIN', 'Login'),
            ('LOGOUT', 'Logout'),
            ('EXPORT', 'Export'),
            ('IMPORT', 'Import'),
            ('BACKUP', 'Backup'),
            ('RESTORE', 'Restore'),
            ('SYSTEM', 'System'),
        ],
        help_text="Type of operation performed"
    )
    
    # Resource information
    resource_type = models.CharField(
        max_length=100,
        help_text="Type of resource (model name)"
    )
    resource_id = models.CharField(
        max_length=100,
        help_text="ID of the resource"
    )
    resource_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Human-readable name of the resource"
    )
    
    # Operation context
    request_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Unique request identifier"
    )
    session_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="User session identifier"
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the request"
    )
    user_agent = models.TextField(
        blank=True,
        help_text="User agent string"
    )
    
    # Data changes
    old_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Data before the operation"
    )
    new_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Data after the operation"
    )
    changed_fields = models.JSONField(
        default=list,
        blank=True,
        help_text="List of fields that were changed"
    )
    
    # Compliance and security
    compliance_framework = models.CharField(
        max_length=20,
        choices=[
            ('SOX', 'SOX'),
            ('PCI_DSS', 'PCI DSS'),
            ('GDPR', 'GDPR'),
            ('HIPAA', 'HIPAA'),
            ('BASEL_III', 'Basel III'),
            ('ISO_27001', 'ISO 27001'),
        ],
        blank=True,
        help_text="Compliance framework this operation relates to"
    )
    data_classification = models.CharField(
        max_length=20,
        choices=[
            ('PUBLIC', 'Public'),
            ('INTERNAL', 'Internal'),
            ('CONFIDENTIAL', 'Confidential'),
            ('RESTRICTED', 'Restricted'),
            ('TOP_SECRET', 'Top Secret'),
        ],
        default='CONFIDENTIAL',
        help_text="Classification of the data involved"
    )
    is_sensitive = models.BooleanField(
        default=False,
        help_text="Whether this operation involved sensitive data"
    )
    
    # Audit integrity
    audit_hash = models.CharField(
        max_length=64,
        blank=True,
        help_text="Hash for audit integrity verification"
    )
    parent_audit_id = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_audits',
        help_text="Parent audit record for related operations"
    )
    
    # Timestamps
    timestamp = models.DateTimeField(
        default=timezone.now,
        help_text="When the operation occurred"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Retention and compliance
    retention_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this audit record should be deleted"
    )
    is_archived = models.BooleanField(
        default=False,
        help_text="Whether this audit record has been archived"
    )
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tenant', 'timestamp']),
            models.Index(fields=['tenant', 'operation']),
            models.Index(fields=['tenant', 'resource_type']),
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['operation']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['compliance_framework']),
            models.Index(fields=['data_classification']),
            models.Index(fields=['is_sensitive']),
            models.Index(fields=['retention_until']),
        ]
    
    def __str__(self):
        return f"{self.operation} {self.resource_type} {self.resource_id} - {self.timestamp}"
    
    def save(self, *args, **kwargs):
        """Override save to generate audit hash"""
        if not self.audit_hash:
            self.audit_hash = self._generate_audit_hash()
        
        # Set retention period based on compliance framework
        if not self.retention_until:
            self.retention_until = self._calculate_retention_period()
        
        super().save(*args, **kwargs)
    
    def _generate_audit_hash(self):
        """Generate audit hash for integrity verification"""
        hash_data = {
            'tenant_id': str(self.tenant.id) if self.tenant else '',
            'user_id': str(self.user.id) if self.user else '',
            'operation': self.operation,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'timestamp': self.timestamp.isoformat(),
            'old_data': self.old_data,
            'new_data': self.new_data,
        }
        
        hash_string = json.dumps(hash_data, sort_keys=True)
        return hashlib.sha256(hash_string.encode()).hexdigest()
    
    def _calculate_retention_period(self):
        """Calculate retention period based on compliance framework"""
        retention_days = {
            'SOX': 2555,  # 7 years
            'PCI_DSS': 1095,  # 3 years
            'GDPR': 2555,  # 7 years
            'HIPAA': 2555,  # 7 years
            'BASEL_III': 2555,  # 7 years
            'ISO_27001': 1095,  # 3 years
        }
        
        days = retention_days.get(self.compliance_framework, 2555)  # Default 7 years
        return timezone.now() + timezone.timedelta(days=days)
    
    def verify_integrity(self):
        """Verify audit record integrity"""
        expected_hash = self._generate_audit_hash()
        return self.audit_hash == expected_hash
    
    def get_related_audits(self):
        """Get related audit records"""
        return AuditLog.objects.filter(
            Q(parent_audit_id=self) | Q(id=self.parent_audit_id)
        ).order_by('timestamp')
    
    def archive(self):
        """Archive this audit record"""
        self.is_archived = True
        self.save(update_fields=['is_archived'])
    
    def get_summary(self):
        """Get audit record summary"""
        return {
            'id': str(self.id),
            'operation': self.operation,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'timestamp': self.timestamp.isoformat(),
            'user': self.user.email if self.user else None,
            'is_sensitive': self.is_sensitive,
            'compliance_framework': self.compliance_framework,
        }


class AuditQuery(models.Model):
    """
    Audit log for query operations (READ operations).
    Tracks what data was accessed by whom and when.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Tenant and user context
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='audit_queries'
    )
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_queries'
    )
    
    # Query details
    query_type = models.CharField(
        max_length=50,
        choices=[
            ('SELECT', 'Select'),
            ('COUNT', 'Count'),
            ('AGGREGATE', 'Aggregate'),
            ('EXPORT', 'Export'),
            ('REPORT', 'Report'),
        ]
    )
    model_name = models.CharField(max_length=100)
    filters_applied = models.JSONField(default=dict, blank=True)
    fields_accessed = models.JSONField(default=list, blank=True)
    record_count = models.PositiveIntegerField(default=0)
    
    # Context
    request_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Compliance
    data_classification = models.CharField(
        max_length=20,
        choices=[
            ('PUBLIC', 'Public'),
            ('INTERNAL', 'Internal'),
            ('CONFIDENTIAL', 'Confidential'),
            ('RESTRICTED', 'Restricted'),
            ('TOP_SECRET', 'Top Secret'),
        ],
        default='CONFIDENTIAL'
    )
    is_sensitive = models.BooleanField(default=False)
    
    # Timestamps
    timestamp = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_queries'
        verbose_name = 'Audit Query'
        verbose_name_plural = 'Audit Queries'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tenant', 'timestamp']),
            models.Index(fields=['tenant', 'model_name']),
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['model_name']),
        ]
    
    def __str__(self):
        return f"{self.query_type} {self.model_name} - {self.timestamp}"


class AuditExport(models.Model):
    """
    Audit log for data export operations.
    Tracks what data was exported by whom and when.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Tenant and user context
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='audit_exports'
    )
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_exports'
    )
    
    # Export details
    export_type = models.CharField(
        max_length=50,
        choices=[
            ('CSV', 'CSV'),
            ('EXCEL', 'Excel'),
            ('PDF', 'PDF'),
            ('JSON', 'JSON'),
            ('XML', 'XML'),
        ]
    )
    model_name = models.CharField(max_length=100)
    filters_applied = models.JSONField(default=dict, blank=True)
    record_count = models.PositiveIntegerField(default=0)
    file_path = models.CharField(max_length=500, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    
    # Context
    request_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Compliance
    data_classification = models.CharField(
        max_length=20,
        choices=[
            ('PUBLIC', 'Public'),
            ('INTERNAL', 'Internal'),
            ('CONFIDENTIAL', 'Confidential'),
            ('RESTRICTED', 'Restricted'),
            ('TOP_SECRET', 'Top Secret'),
        ],
        default='CONFIDENTIAL'
    )
    is_sensitive = models.BooleanField(default=False)
    
    # Timestamps
    timestamp = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_exports'
        verbose_name = 'Audit Export'
        verbose_name_plural = 'Audit Exports'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tenant', 'timestamp']),
            models.Index(fields=['tenant', 'export_type']),
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['export_type']),
        ]
    
    def __str__(self):
        return f"{self.export_type} {self.model_name} - {self.timestamp}"


class AuditViolation(models.Model):
    """
    Audit log for security violations and compliance breaches.
    Tracks unauthorized access attempts and policy violations.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Tenant and user context
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='audit_violations'
    )
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_violations'
    )
    
    # Violation details
    violation_type = models.CharField(
        max_length=50,
        choices=[
            ('UNAUTHORIZED_ACCESS', 'Unauthorized Access'),
            ('DATA_BREACH', 'Data Breach'),
            ('POLICY_VIOLATION', 'Policy Violation'),
            ('COMPLIANCE_BREACH', 'Compliance Breach'),
            ('SECURITY_INCIDENT', 'Security Incident'),
            ('PRIVILEGE_ESCALATION', 'Privilege Escalation'),
            ('DATA_LEAKAGE', 'Data Leakage'),
            ('UNAUTHORIZED_EXPORT', 'Unauthorized Export'),
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('CRITICAL', 'Critical'),
        ],
        default='MEDIUM'
    )
    description = models.TextField()
    details = models.JSONField(default=dict, blank=True)
    
    # Context
    request_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Resolution
    status = models.CharField(
        max_length=20,
        choices=[
            ('OPEN', 'Open'),
            ('INVESTIGATING', 'Investigating'),
            ('RESOLVED', 'Resolved'),
            ('CLOSED', 'Closed'),
        ],
        default='OPEN'
    )
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_violations'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    timestamp = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'audit_violations'
        verbose_name = 'Audit Violation'
        verbose_name_plural = 'Audit Violations'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tenant', 'timestamp']),
            models.Index(fields=['tenant', 'violation_type']),
            models.Index(fields=['tenant', 'severity']),
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['violation_type']),
            models.Index(fields=['severity']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.violation_type} - {self.severity} - {self.timestamp}"
    
    def resolve(self, resolved_by, notes=""):
        """Resolve this violation"""
        self.status = 'RESOLVED'
        self.resolution_notes = notes
        self.resolved_by = resolved_by
        self.resolved_at = timezone.now()
        self.save()
    
    def get_summary(self):
        """Get violation summary"""
        return {
            'id': str(self.id),
            'violation_type': self.violation_type,
            'severity': self.severity,
            'status': self.status,
            'timestamp': self.timestamp.isoformat(),
            'user': self.user.email if self.user else None,
        }
