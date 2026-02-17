"""
Base Tenant Model for Row-Based Multi-Tenancy
Provides a consistent base class for all tenant-scoped models.
"""

from django.db import models
from django.core.exceptions import PermissionDenied
from .row_tenant_middleware import get_current_tenant, get_current_user


class BaseTenantModel(models.Model):
    """
    Abstract base model for all tenant-scoped models.
    Provides automatic tenant filtering and audit fields.
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
    
    def _validate_tenant_access(self):
        """Validate that the object belongs to the current tenant"""
        current_tenant = get_current_tenant()
        if current_tenant and self.tenant and self.tenant != current_tenant:
            raise PermissionDenied("Object does not belong to current tenant")

