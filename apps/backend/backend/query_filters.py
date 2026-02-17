"""
Automatic Query Filters for Multi-Tenant Data Access
Provides automatic tenant isolation for all database queries.
"""

import logging
from typing import Any, Optional, List, Dict
from django.db import models, connection
from django.db.models import QuerySet, Q
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from .row_tenant_middleware import get_current_tenant, get_current_user

logger = logging.getLogger(__name__)


class TenantQuerySet(QuerySet):
    """
    Custom QuerySet that automatically filters by tenant.
    Ensures all queries are scoped to the current tenant.
    """
    
    def __init__(self, model=None, query=None, using=None, hints=None):
        super().__init__(model, query, using, hints)
        self._tenant_filter_applied = False
    
    def _clone(self):
        """Clone the queryset with tenant filtering"""
        clone = super()._clone()
        clone._tenant_filter_applied = self._tenant_filter_applied
        return clone
    
    def _apply_tenant_filter(self):
        """Apply tenant filter to the queryset"""
        if self._tenant_filter_applied:
            return
            
        current_tenant = get_current_tenant()
        if not current_tenant:
            return
            
        # Check if model has tenant field
        if hasattr(self.model, 'tenant'):
            self._tenant_filter_applied = True
            return self.filter(tenant=current_tenant)
        
        # Check if model has company field with tenant
        if hasattr(self.model, 'company') and hasattr(self.model.company.field.related_model, 'tenant'):
            self._tenant_filter_applied = True
            return self.filter(company__tenant=current_tenant)
        
        # Check if model has user field with tenant
        if hasattr(self.model, 'user') and hasattr(self.model.user.field.related_model, 'tenant'):
            self._tenant_filter_applied = True
            return self.filter(user__tenant=current_tenant)
        
        # Check if model has created_by field with tenant
        if hasattr(self.model, 'created_by') and hasattr(self.model.created_by.field.related_model, 'tenant'):
            self._tenant_filter_applied = True
            return self.filter(created_by__tenant=current_tenant)
    
    def filter(self, *args, **kwargs):
        """Override filter to apply tenant filtering"""
        queryset = self._apply_tenant_filter()
        if queryset:
            return super(TenantQuerySet, queryset).filter(*args, **kwargs)
        return super().filter(*args, **kwargs)
    
    def exclude(self, *args, **kwargs):
        """Override exclude to apply tenant filtering"""
        queryset = self._apply_tenant_filter()
        if queryset:
            return super(TenantQuerySet, queryset).exclude(*args, **kwargs)
        return super().exclude(*args, **kwargs)
    
    def get(self, *args, **kwargs):
        """Override get to apply tenant filtering"""
        queryset = self._apply_tenant_filter()
        if queryset:
            return super(TenantQuerySet, queryset).get(*args, **kwargs)
        return super().get(*args, **kwargs)
    
    def first(self):
        """Override first to apply tenant filtering"""
        queryset = self._apply_tenant_filter()
        if queryset:
            return super(TenantQuerySet, queryset).first()
        return super().first()
    
    def last(self):
        """Override last to apply tenant filtering"""
        queryset = self._apply_tenant_filter()
        if queryset:
            return super(TenantQuerySet, queryset).last()
        return super().last()
    
    def exists(self):
        """Override exists to apply tenant filtering"""
        queryset = self._apply_tenant_filter()
        if queryset:
            return super(TenantQuerySet, queryset).exists()
        return super().exists()
    
    def count(self):
        """Override count to apply tenant filtering"""
        queryset = self._apply_tenant_filter()
        if queryset:
            return super(TenantQuerySet, queryset).count()
        return super().count()


class TenantManager(models.Manager):
    """
    Custom manager that automatically applies tenant filtering.
    All queries through this manager are automatically scoped to the current tenant.
    """
    
    def get_queryset(self):
        """Return queryset with tenant filtering"""
        return TenantQuerySet(self.model, using=self._db)
    
    def for_tenant(self, tenant):
        """Get objects for a specific tenant"""
        if hasattr(self.model, 'tenant'):
            return self.filter(tenant=tenant)
        elif hasattr(self.model, 'company'):
            return self.filter(company__tenant=tenant)
        elif hasattr(self.model, 'user'):
            return self.filter(user__tenant=tenant)
        elif hasattr(self.model, 'created_by'):
            return self.filter(created_by__tenant=tenant)
        else:
            return self.none()
    
    def for_current_tenant(self):
        """Get objects for the current tenant"""
        current_tenant = get_current_tenant()
        if not current_tenant:
            return self.none()
        return self.for_tenant(current_tenant)


class TenantModel(models.Model):
    """
    Abstract base model for tenant-scoped models.
    Automatically handles tenant assignment and filtering.
    """
    
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        null=True,
        blank=True,
        help_text="Tenant that owns this record"
    )
    
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
    
    objects = TenantManager()
    
    class Meta:
        abstract = True
    
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
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to log deletion for audit purposes"""
        self._log_deletion()
        super().delete(*args, **kwargs)
    
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
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
        }
        audit_logger.info(f"Record Deleted: {audit_data}")


class CompanyScopedModel(models.Model):
    """
    Abstract base model for company-scoped models.
    Automatically handles company and tenant assignment.
    """
    
    company = models.ForeignKey(
        'tenants.Company',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        help_text="Company that owns this record"
    )
    
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
    
    objects = TenantManager()
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Override save to automatically set company and audit fields"""
        current_user = get_current_user()
        
        # Set audit fields
        if not self.pk:  # New record
            if current_user:
                self.created_by = current_user
        else:  # Existing record
            if current_user:
                self.updated_by = current_user
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to log deletion for audit purposes"""
        self._log_deletion()
        super().delete(*args, **kwargs)
    
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
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
        }
        audit_logger.info(f"Record Deleted: {audit_data}")


class UserScopedModel(models.Model):
    """
    Abstract base model for user-scoped models.
    Automatically handles user and tenant assignment.
    """
    
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        help_text="User who owns this record"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantManager()
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Override save to automatically set user"""
        if not self.user:
            current_user = get_current_user()
            if current_user:
                self.user = current_user
        
        super().save(*args, **kwargs)


# Signal handlers for automatic tenant assignment
@receiver(pre_save)
def assign_tenant_to_model(sender, instance, **kwargs):
    """Automatically assign tenant to models that have tenant field"""
    if hasattr(instance, 'tenant') and not instance.tenant:
        current_tenant = get_current_tenant()
        if current_tenant:
            instance.tenant = current_tenant


@receiver(pre_save)
def assign_audit_fields(sender, instance, **kwargs):
    """Automatically assign audit fields to models"""
    current_user = get_current_user()
    if not current_user:
        return
    
    if hasattr(instance, 'created_by') and not instance.pk and not instance.created_by:
        instance.created_by = current_user
    
    if hasattr(instance, 'updated_by'):
        instance.updated_by = current_user


@receiver(post_save)
def log_model_changes(sender, instance, created, **kwargs):
    """Log model changes for audit purposes"""
    audit_logger = logging.getLogger('audit')
    
    action = 'CREATE' if created else 'UPDATE'
    audit_data = {
        'timestamp': timezone.now().isoformat(),
        'action': action,
        'model': sender.__name__,
        'object_id': str(instance.pk),
        'tenant_id': str(instance.tenant.id) if hasattr(instance, 'tenant') and instance.tenant else None,
        'user_id': str(get_current_user().id) if get_current_user() else None,
        'request_id': None,  # Request ID not needed for row-based multi-tenancy
    }
    
    audit_logger.info(f"Record {action}: {audit_data}")


@receiver(post_delete)
def log_model_deletion(sender, instance, **kwargs):
    """Log model deletion for audit purposes"""
    audit_logger = logging.getLogger('audit')
    
    audit_data = {
        'timestamp': timezone.now().isoformat(),
        'action': 'DELETE',
        'model': sender.__name__,
        'object_id': str(instance.pk),
        'tenant_id': str(instance.tenant.id) if hasattr(instance, 'tenant') and instance.tenant else None,
        'user_id': str(get_current_user().id) if get_current_user() else None,
        'request_id': None,  # Request ID not needed for row-based multi-tenancy
    }
    
    audit_logger.info(f"Record Deleted: {audit_data}")


# Utility functions for tenant-aware queries
def get_tenant_queryset(model_class, tenant=None):
    """Get queryset filtered by tenant"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if not tenant:
        return model_class.objects.none()
    
    if hasattr(model_class, 'tenant'):
        return model_class.objects.filter(tenant=tenant)
    elif hasattr(model_class, 'company'):
        return model_class.objects.filter(company__tenant=tenant)
    elif hasattr(model_class, 'user'):
        return model_class.objects.filter(user__tenant=tenant)
    elif hasattr(model_class, 'created_by'):
        return model_class.objects.filter(created_by__tenant=tenant)
    else:
        return model_class.objects.none()


def ensure_tenant_access(obj, tenant=None):
    """Ensure object belongs to tenant"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if not tenant:
        raise PermissionDenied("No tenant context")
    
    if hasattr(obj, 'tenant') and obj.tenant != tenant:
        raise PermissionDenied("Object does not belong to current tenant")
    
    if hasattr(obj, 'company') and obj.company.tenant != tenant:
        raise PermissionDenied("Object does not belong to current tenant")
    
    if hasattr(obj, 'user') and obj.user.tenant != tenant:
        raise PermissionDenied("Object does not belong to current tenant")
    
    if hasattr(obj, 'created_by') and obj.created_by.tenant != tenant:
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
