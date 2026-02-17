"""
Enhanced QuerySet with Automatic Tenant Filtering
Integrates with Django ORM to automatically filter queries by tenant_id.
"""

import logging
from typing import Any, Optional, List, Dict
from django.db import models, connection
from django.db.models import QuerySet, Q, Manager
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.conf import settings
from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from .row_tenant_middleware import get_current_tenant, get_current_user

logger = logging.getLogger(__name__)


class TenantAwareQuerySet(QuerySet):
    """
    Enhanced QuerySet that automatically applies tenant filtering.
    Integrates with tenant context middleware for seamless tenant isolation.
    """
    
    def __init__(self, model=None, query=None, using=None, hints=None):
        super().__init__(model, query, using, hints)
        self._tenant_filter_applied = False
        self._rls_enabled = False
        self._tenant_context_checked = False
    
    def _clone(self):
        """Clone the queryset with tenant filtering"""
        clone = super()._clone()
        clone._tenant_filter_applied = self._tenant_filter_applied
        clone._rls_enabled = self._rls_enabled
        clone._tenant_context_checked = self._tenant_context_checked
        return clone
    
    def _check_tenant_context(self):
        """Check and validate tenant context"""
        if self._tenant_context_checked:
            return True
        
        current_tenant = get_current_tenant()
        if not current_tenant:
            # No tenant context - this might be intentional for some queries
            # Log warning but don't fail
            logger.warning("No tenant context available for query")
            self._tenant_context_checked = True
            return False
        
        self._tenant_context_checked = True
        return True
    
    def _apply_tenant_filter(self):
        """Apply tenant filter to the queryset"""
        if self._tenant_filter_applied:
            return self
        
        current_tenant = get_current_tenant()
        if not current_tenant:
            # No tenant context - return empty queryset for safety
            logger.warning("No tenant context - returning empty queryset")
            return self.none()
        
        # Apply tenant filtering based on model structure
        tenant_filter = self._get_tenant_filter(current_tenant)
        if tenant_filter:
            self._tenant_filter_applied = True
            return self.filter(tenant_filter)
        
        # If no tenant filter can be applied, return empty queryset
        logger.warning(f"No tenant filter applied for model {self.model.__name__}")
        return self.none()
    
    def _get_tenant_filter(self, tenant):
        """Get appropriate tenant filter based on model structure"""
        # Direct tenant field
        if hasattr(self.model, 'tenant'):
            return Q(tenant=tenant)
        
        # Company-based tenant
        if hasattr(self.model, 'company') and hasattr(self.model.company.field.related_model, 'tenant'):
            return Q(company__tenant=tenant)
        
        # User-based tenant
        if hasattr(self.model, 'user') and hasattr(self.model.user.field.related_model, 'tenant'):
            return Q(user__tenant=tenant)
        
        # Created by user-based tenant
        if hasattr(self.model, 'created_by') and hasattr(self.model.created_by.field.related_model, 'tenant'):
            return Q(created_by__tenant=tenant)
        
        # Bank account-based tenant
        if hasattr(self.model, 'bank_account') and hasattr(self.model.bank_account.field.related_model, 'tenant'):
            return Q(bank_account__tenant=tenant)
        
        # Journal entry-based tenant
        if hasattr(self.model, 'journal_entry') and hasattr(self.model.journal_entry.field.related_model, 'tenant'):
            return Q(journal_entry__tenant=tenant)
        
        # Sales order-based tenant
        if hasattr(self.model, 'sales_order') and hasattr(self.model.sales_order.field.related_model, 'tenant'):
            return Q(sales_order__tenant=tenant)
        
        # Customer-based tenant
        if hasattr(self.model, 'customer') and hasattr(self.model.customer.field.related_model, 'tenant'):
            return Q(customer__tenant=tenant)
        
        # Invoice-based tenant
        if hasattr(self.model, 'invoice') and hasattr(self.model.invoice.field.related_model, 'tenant'):
            return Q(invoice__tenant=tenant)
        
        return None
    
    def _enable_rls(self):
        """Enable Row-Level Security for this queryset"""
        if self._rls_enabled:
            return
        
        current_tenant = get_current_tenant()
        current_user = get_current_user()
        
        if not current_tenant:
            return
        
        try:
            with connection.cursor() as cursor:
                # Set tenant context for RLS
                cursor.execute("SET LOCAL app.current_tenant_id = %s", [str(current_tenant.id)])
                
                if current_user:
                    cursor.execute("SET LOCAL app.current_user_id = %s", [str(current_user.id)])
                    cursor.execute("SET LOCAL app.current_user_role = %s", [current_user.role])
                
                # Enable RLS if configured
                if getattr(settings, 'ENABLE_ROW_LEVEL_SECURITY', False):
                    cursor.execute("SET LOCAL row_security = on")
                
                self._rls_enabled = True
        except Exception as e:
            logger.error(f"Failed to enable RLS: {e}")
    
    def filter(self, *args, **kwargs):
        """Override filter to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().filter(*args, **kwargs)
    
    def exclude(self, *args, **kwargs):
        """Override exclude to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().exclude(*args, **kwargs)
    
    def get(self, *args, **kwargs):
        """Override get to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().get(*args, **kwargs)
    
    def first(self):
        """Override first to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().first()
    
    def last(self):
        """Override last to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().last()
    
    def exists(self):
        """Override exists to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().exists()
    
    def count(self):
        """Override count to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().count()
    
    def all(self):
        """Override all to apply tenant filtering and RLS"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().all()
    
    def select_related(self, *fields):
        """Override select_related to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().select_related(*fields)
    
    def prefetch_related(self, *lookups):
        """Override prefetch_related to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().prefetch_related(*lookups)
    
    def order_by(self, *field_names):
        """Override order_by to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().order_by(*field_names)
    
    def distinct(self, *field_names):
        """Override distinct to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().distinct(*field_names)
    
    def values(self, *fields, **expressions):
        """Override values to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().values(*fields, **expressions)
    
    def values_list(self, *fields, flat=False, named=False):
        """Override values_list to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().values_list(*fields, flat=flat, named=named)
    
    def aggregate(self, *args, **kwargs):
        """Override aggregate to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().aggregate(*args, **kwargs)
    
    def annotate(self, *args, **kwargs):
        """Override annotate to maintain tenant filtering"""
        self._check_tenant_context()
        self._apply_tenant_filter()
        self._enable_rls()
        return super().annotate(*args, **kwargs)
    
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
        elif hasattr(self.model, 'bank_account'):
            return self.filter(bank_account__tenant=tenant)
        elif hasattr(self.model, 'journal_entry'):
            return self.filter(journal_entry__tenant=tenant)
        elif hasattr(self.model, 'sales_order'):
            return self.filter(sales_order__tenant=tenant)
        elif hasattr(self.model, 'customer'):
            return self.filter(customer__tenant=tenant)
        elif hasattr(self.model, 'invoice'):
            return self.filter(invoice__tenant=tenant)
        else:
            return self.none()
    
    def for_current_tenant(self):
        """Get objects for the current tenant"""
        current_tenant = get_current_tenant()
        if not current_tenant:
            return self.none()
        return self.for_tenant(current_tenant)
    
    def without_tenant_filter(self):
        """Get queryset without tenant filtering (use with caution)"""
        # This should only be used in very specific cases where you need
        # to bypass tenant filtering (e.g., system operations)
        if not getattr(settings, 'ALLOW_TENANT_BYPASS', False):
            raise PermissionDenied("Tenant bypass not allowed")
        
        return self


class TenantAwareManager(Manager):
    """
    Enhanced manager that automatically applies tenant filtering.
    All queries through this manager are automatically scoped to the current tenant.
    """
    
    def get_queryset(self):
        """Return queryset with tenant filtering"""
        return TenantAwareQuerySet(self.model, using=self._db)
    
    def for_tenant(self, tenant):
        """Get objects for a specific tenant"""
        return self.get_queryset().for_tenant(tenant)
    
    def for_current_tenant(self):
        """Get objects for the current tenant"""
        return self.get_queryset().for_current_tenant()
    
    def create(self, **kwargs):
        """Create object with automatic tenant assignment"""
        current_tenant = get_current_tenant()
        current_user = get_current_user()
        
        # Auto-assign tenant if not provided
        if hasattr(self.model, 'tenant') and 'tenant' not in kwargs and current_tenant:
            kwargs['tenant'] = current_tenant
        
        # Auto-assign created_by if not provided
        if hasattr(self.model, 'created_by') and 'created_by' not in kwargs and current_user:
            kwargs['created_by'] = current_user
        
        return super().create(**kwargs)
    
    def get_or_create(self, defaults=None, **kwargs):
        """Get or create with automatic tenant assignment"""
        current_tenant = get_current_tenant()
        current_user = get_current_user()
        
        # Auto-assign tenant if not provided
        if hasattr(self.model, 'tenant') and 'tenant' not in kwargs and current_tenant:
            kwargs['tenant'] = current_tenant
        
        # Auto-assign created_by if not provided
        if hasattr(self.model, 'created_by') and 'created_by' not in kwargs and current_user:
            kwargs['created_by'] = current_user
        
        if defaults is None:
            defaults = {}
        
        # Auto-assign tenant in defaults if not provided
        if hasattr(self.model, 'tenant') and 'tenant' not in defaults and current_tenant:
            defaults['tenant'] = current_tenant
        
        # Auto-assign created_by in defaults if not provided
        if hasattr(self.model, 'created_by') and 'created_by' not in defaults and current_user:
            defaults['created_by'] = current_user
        
        return super().get_or_create(defaults=defaults, **kwargs)
    
    def update_or_create(self, defaults=None, **kwargs):
        """Update or create with automatic tenant assignment"""
        current_tenant = get_current_tenant()
        current_user = get_current_user()
        
        # Auto-assign tenant if not provided
        if hasattr(self.model, 'tenant') and 'tenant' not in kwargs and current_tenant:
            kwargs['tenant'] = current_tenant
        
        if defaults is None:
            defaults = {}
        
        # Auto-assign updated_by if not provided
        if hasattr(self.model, 'updated_by') and 'updated_by' not in defaults and current_user:
            defaults['updated_by'] = current_user
        
        return super().update_or_create(defaults=defaults, **kwargs)


# Utility functions for tenant-aware queries
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
    
    # Check created_by-based tenant
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
    
    # Bank account-based tenant
    tenant_filters.append(Q(bank_account__tenant=tenant))
    
    # Journal entry-based tenant
    tenant_filters.append(Q(journal_entry__tenant=tenant))
    
    # Sales order-based tenant
    tenant_filters.append(Q(sales_order__tenant=tenant))
    
    # Customer-based tenant
    tenant_filters.append(Q(customer__tenant=tenant))
    
    # Invoice-based tenant
    tenant_filters.append(Q(invoice__tenant=tenant))
    
    return Q(*tenant_filters, _connector=Q.OR)


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
        'request_id': get_current_request_id(),
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
        'request_id': get_current_request_id(),
    }
    
    audit_logger.info(f"Record Deleted: {audit_data}")


def get_current_request_id():
    """Get current request ID from thread-local storage"""
    # Request ID is not needed for row-based multi-tenancy
    return None
