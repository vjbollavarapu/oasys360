"""
Base Model with Automatic Tenant Filtering
Provides a base model that automatically applies tenant filtering to all queries.
"""

import logging
import uuid
from typing import Any, Optional, Dict
from django.db import models
from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from .tenant_queryset import TenantAwareQuerySet, TenantAwareManager
from .row_tenant_middleware import get_current_tenant, get_current_user

logger = logging.getLogger(__name__)


class TenantBaseModel(models.Model):
    """
    Base model that automatically applies tenant filtering to all queries.
    All models inheriting from this will have automatic tenant isolation.
    """
    
    # Tenant relationship - required for all tenant-scoped models
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        help_text="Tenant that owns this record"
    )
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_%(class)s_set',
        help_text="User who created this record"
    )
    updated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_%(class)s_set',
        help_text="User who last updated this record"
    )
    
    # Enhanced manager with automatic tenant filtering
    objects = TenantAwareManager()
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['tenant', 'created_at']),
            models.Index(fields=['tenant', 'updated_at']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to automatically set tenant and audit fields"""
        current_tenant = get_current_tenant()
        current_user = get_current_user()
        
        # Set tenant if not already set
        if not self.tenant and current_tenant:
            self.tenant = current_tenant
        
        # Set audit fields
        if not self.pk:  # New record
            if current_user:
                self.created_by = current_user
        else:  # Existing record
            if current_user:
                self.updated_by = current_user
        
        # Validate tenant access
        self._validate_tenant_access()
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to log deletion for audit purposes"""
        self._log_deletion()
        super().delete(*args, **kwargs)
    
    def _validate_tenant_access(self):
        """Validate that the object belongs to the current tenant"""
        current_tenant = get_current_tenant()
        if current_tenant and self.tenant and self.tenant != current_tenant:
            raise PermissionDenied("Object does not belong to current tenant")
    
    def _log_deletion(self):
        """Log record deletion for audit purposes"""
        audit_logger = logging.getLogger('audit')
        audit_data = {
            'timestamp': timezone.now().isoformat(),
            'action': 'DELETE',
            'model': self.__class__.__name__,
            'object_id': str(self.pk),
            'tenant_id': str(self.tenant.id) if self.tenant else None,
            'user_id': str(get_current_user().id) if get_current_user() else None,
        }
        audit_logger.info(f"Record Deleted: {audit_data}")
    
    @classmethod
    def for_tenant(cls, tenant):
        """Get objects for a specific tenant"""
        return cls.objects.for_tenant(tenant)
    
    @classmethod
    def for_current_tenant(cls):
        """Get objects for the current tenant"""
        return cls.objects.for_current_tenant()
    
    @classmethod
    def create_for_tenant(cls, tenant, **kwargs):
        """Create object for a specific tenant"""
        kwargs['tenant'] = tenant
        return cls.objects.create(**kwargs)
    
    @classmethod
    def create_for_current_tenant(cls, **kwargs):
        """Create object for the current tenant"""
        current_tenant = get_current_tenant()
        if not current_tenant:
            raise PermissionDenied("No tenant context available")
        return cls.create_for_tenant(current_tenant, **kwargs)


class CompanyScopedModel(models.Model):
    """
    Base model for company-scoped models with automatic tenant filtering.
    Tenant filtering is applied through the company relationship.
    """
    
    # Company relationship - automatically provides tenant filtering
    company = models.ForeignKey(
        'tenants.Company',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        help_text="Company that owns this record"
    )
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_%(class)s_set',
        help_text="User who created this record"
    )
    updated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_%(class)s_set',
        help_text="User who last updated this record"
    )
    
    # Enhanced manager with automatic tenant filtering
    objects = TenantAwareManager()
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['company', 'created_at']),
            models.Index(fields=['company', 'updated_at']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to automatically set audit fields"""
        current_user = get_current_user()
        
        # Set audit fields
        if not self.pk:  # New record
            if current_user:
                self.created_by = current_user
        else:  # Existing record
            if current_user:
                self.updated_by = current_user
        
        # Validate tenant access through company
        self._validate_tenant_access()
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to log deletion for audit purposes"""
        self._log_deletion()
        super().delete(*args, **kwargs)
    
    def _validate_tenant_access(self):
        """Validate that the object belongs to the current tenant through company"""
        current_tenant = get_current_tenant()
        if current_tenant and self.company and self.company.tenant != current_tenant:
            raise PermissionDenied("Object does not belong to current tenant")
    
    def _log_deletion(self):
        """Log record deletion for audit purposes"""
        audit_logger = logging.getLogger('audit')
        audit_data = {
            'timestamp': timezone.now().isoformat(),
            'action': 'DELETE',
            'model': self.__class__.__name__,
            'object_id': str(self.pk),
            'company_id': str(self.company.id) if self.company else None,
            'tenant_id': str(self.company.tenant.id) if self.company and self.company.tenant else None,
            'user_id': str(get_current_user().id) if get_current_user() else None,
        }
        audit_logger.info(f"Record Deleted: {audit_data}")
    
    @classmethod
    def for_tenant(cls, tenant):
        """Get objects for a specific tenant"""
        return cls.objects.filter(company__tenant=tenant)
    
    @classmethod
    def for_current_tenant(cls):
        """Get objects for the current tenant"""
        return cls.objects.for_current_tenant()
    
    @classmethod
    def create_for_tenant(cls, tenant, **kwargs):
        """Create object for a specific tenant"""
        # Find a company for the tenant
        from tenants.models import Company
        company = Company.objects.filter(tenant=tenant).first()
        if not company:
            raise ValidationError("No company found for tenant")
        kwargs['company'] = company
        return cls.objects.create(**kwargs)
    
    @classmethod
    def create_for_current_tenant(cls, **kwargs):
        """Create object for the current tenant"""
        current_tenant = get_current_tenant()
        if not current_tenant:
            raise PermissionDenied("No tenant context available")
        return cls.create_for_tenant(current_tenant, **kwargs)


class UserScopedModel(models.Model):
    """
    Base model for user-scoped models with automatic tenant filtering.
    Tenant filtering is applied through the user relationship.
    """
    
    # User relationship - automatically provides tenant filtering
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        help_text="User who owns this record"
    )
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Enhanced manager with automatic tenant filtering
    objects = TenantAwareManager()
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user', 'updated_at']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to automatically set user and validate tenant access"""
        if not self.user:
            current_user = get_current_user()
            if current_user:
                self.user = current_user
        
        # Validate tenant access through user
        self._validate_tenant_access()
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to log deletion for audit purposes"""
        self._log_deletion()
        super().delete(*args, **kwargs)
    
    def _validate_tenant_access(self):
        """Validate that the object belongs to the current tenant through user"""
        current_tenant = get_current_tenant()
        if current_tenant and self.user and self.user.tenant != current_tenant:
            raise PermissionDenied("Object does not belong to current tenant")
    
    def _log_deletion(self):
        """Log record deletion for audit purposes"""
        audit_logger = logging.getLogger('audit')
        audit_data = {
            'timestamp': timezone.now().isoformat(),
            'action': 'DELETE',
            'model': self.__class__.__name__,
            'object_id': str(self.pk),
            'user_id': str(self.user.id) if self.user else None,
            'tenant_id': str(self.user.tenant.id) if self.user and self.user.tenant else None,
        }
        audit_logger.info(f"Record Deleted: {audit_data}")
    
    @classmethod
    def for_tenant(cls, tenant):
        """Get objects for a specific tenant"""
        return cls.objects.filter(user__tenant=tenant)
    
    @classmethod
    def for_current_tenant(cls):
        """Get objects for the current tenant"""
        return cls.objects.for_current_tenant()
    
    @classmethod
    def create_for_tenant(cls, tenant, **kwargs):
        """Create object for a specific tenant"""
        # Find a user for the tenant
        from authentication.models import User
        user = User.objects.filter(tenant=tenant).first()
        if not user:
            raise ValidationError("No user found for tenant")
        kwargs['user'] = user
        return cls.objects.create(**kwargs)
    
    @classmethod
    def create_for_current_tenant(cls, **kwargs):
        """Create object for the current tenant"""
        current_tenant = get_current_tenant()
        if not current_tenant:
            raise PermissionDenied("No tenant context available")
        return cls.create_for_tenant(current_tenant, **kwargs)


class FinancialModel(TenantBaseModel):
    """
    Base model for financial data with enhanced security and compliance features.
    """
    
    # Financial data classification
    data_classification = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('internal', 'Internal'),
            ('confidential', 'Confidential'),
            ('restricted', 'Restricted'),
            ('top_secret', 'Top Secret'),
        ],
        default='confidential',
        help_text="Data classification level"
    )
    
    # Compliance fields
    requires_audit = models.BooleanField(default=True)
    retention_period_days = models.PositiveIntegerField(default=2555)  # 7 years
    is_sensitive = models.BooleanField(default=True)
    
    class Meta:
        abstract = True
    
    def clean(self):
        """Validate financial data requirements"""
        super().clean()
        
        # Ensure sensitive financial data has proper classification
        if self.is_sensitive and self.data_classification in ['public', 'internal']:
            raise ValidationError(
                "Sensitive financial data must have confidential or higher classification"
            )


class AuditModel(TenantBaseModel):
    """
    Base model for audit and compliance data.
    """
    
    # Audit trail fields
    audit_hash = models.CharField(max_length=64, blank=True, help_text="Hash for audit integrity")
    parent_audit_id = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_audits',
        help_text="Parent audit record"
    )
    
    # Compliance fields
    compliance_framework = models.CharField(
        max_length=20,
        choices=[
            ('sox', 'SOX'),
            ('pci_dss', 'PCI DSS'),
            ('gdpr', 'GDPR'),
            ('hipaa', 'HIPAA'),
            ('basel_iii', 'Basel III'),
        ],
        blank=True,
        help_text="Compliance framework"
    )
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Override save to generate audit hash"""
        if not self.audit_hash:
            self.audit_hash = self._generate_audit_hash()
        super().save(*args, **kwargs)
    
    def _generate_audit_hash(self):
        """Generate audit hash for integrity"""
        import hashlib
        import json
        
        hash_data = {
            'tenant_id': str(self.tenant.id) if self.tenant else '',
            'created_at': self.created_at.isoformat() if self.created_at else '',
            'model': self.__class__.__name__,
            'object_id': str(self.pk) if self.pk else '',
        }
        
        hash_string = json.dumps(hash_data, sort_keys=True)
        return hashlib.sha256(hash_string.encode()).hexdigest()


# Utility functions for tenant-aware operations
def get_tenant_queryset(model_class, tenant=None):
    """Get queryset filtered by tenant"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if not tenant:
        return model_class.objects.none()
    
    # Use enhanced manager for automatic filtering
    return model_class.objects.for_tenant(tenant)


def ensure_tenant_access(obj, tenant=None):
    """Ensure object belongs to tenant"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if not tenant:
        raise PermissionDenied("No tenant context")
    
    # Check direct tenant field
    if hasattr(obj, 'tenant') and obj.tenant != tenant:
        raise PermissionDenied("Object does not belong to current tenant")
    
    # Check company-based tenant
    if hasattr(obj, 'company') and obj.company.tenant != tenant:
        raise PermissionDenied("Object does not belong to current tenant")
    
    # Check user-based tenant
    if hasattr(obj, 'user') and obj.user.tenant != tenant:
        raise PermissionDenied("Object does not belong to current tenant")
    
    return True


def get_tenant_filter(tenant=None):
    """Get Q object for tenant filtering"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if not tenant:
        return Q(pk__in=[])  # Empty queryset
    
    # Try different tenant field patterns
    tenant_filters = []
    
    # Direct tenant field
    tenant_filters.append(Q(tenant=tenant))
    
    # Company-based tenant
    tenant_filters.append(Q(company__tenant=tenant))
    
    # User-based tenant
    tenant_filters.append(Q(user__tenant=tenant))
    
    # Created by user-based tenant
    tenant_filters.append(Q(created_by__tenant=tenant))
    
    return Q(*tenant_filters, _connector=Q.OR)
