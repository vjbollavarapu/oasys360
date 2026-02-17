"""
Enhanced Base Models with Automatic Tenant Filtering and PostgreSQL RLS
Provides comprehensive tenant isolation with database-level security.
"""

import logging
import uuid
from typing import Any, Optional, Dict, List
from django.db import models, connection, transaction
from django.db.models import QuerySet, Q, Manager
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.conf import settings
from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from django.contrib.auth.models import User
from .row_tenant_middleware import get_current_tenant, get_current_user
from .query_filters import TenantQuerySet, TenantManager

logger = logging.getLogger(__name__)


class EnhancedTenantQuerySet(QuerySet):
    """
    Enhanced QuerySet with automatic tenant filtering and RLS support.
    Ensures all queries are scoped to the current tenant with database-level security.
    """
    
    def __init__(self, model=None, query=None, using=None, hints=None):
        super().__init__(model, query, using, hints)
        self._tenant_filter_applied = False
        self._rls_enabled = False
    
    def _clone(self):
        """Clone the queryset with tenant filtering"""
        clone = super()._clone()
        clone._tenant_filter_applied = self._tenant_filter_applied
        clone._rls_enabled = self._rls_enabled
        return clone
    
    def _apply_tenant_filter(self):
        """Apply tenant filter to the queryset"""
        if self._tenant_filter_applied:
            return
            
        current_tenant = get_current_tenant()
        if not current_tenant:
            # Return empty queryset if no tenant context
            return self.none()
        
        # Apply tenant filtering based on model structure
        tenant_filter = self._get_tenant_filter(current_tenant)
        if tenant_filter:
            self._tenant_filter_applied = True
            return self.filter(tenant_filter)
        
        return self
    
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
                
                self._rls_enabled = True
        except Exception as e:
            logger.error(f"Failed to enable RLS: {e}")
    
    def filter(self, *args, **kwargs):
        """Override filter to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().filter(*args, **kwargs)
    
    def exclude(self, *args, **kwargs):
        """Override exclude to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().exclude(*args, **kwargs)
    
    def get(self, *args, **kwargs):
        """Override get to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().get(*args, **kwargs)
    
    def first(self):
        """Override first to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().first()
    
    def last(self):
        """Override last to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().last()
    
    def exists(self):
        """Override exists to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().exists()
    
    def count(self):
        """Override count to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().count()
    
    def all(self):
        """Override all to apply tenant filtering and RLS"""
        self._apply_tenant_filter()
        self._enable_rls()
        return super().all()


class EnhancedTenantManager(Manager):
    """
    Enhanced manager with automatic tenant filtering and RLS support.
    All queries through this manager are automatically scoped to the current tenant.
    """
    
    def get_queryset(self):
        """Return queryset with tenant filtering and RLS"""
        return EnhancedTenantQuerySet(self.model, using=self._db)
    
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
        else:
            return self.none()
    
    def for_current_tenant(self):
        """Get objects for the current tenant"""
        current_tenant = get_current_tenant()
        if not current_tenant:
            return self.none()
        return self.for_tenant(current_tenant)
    
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


class TenantScopedModel(models.Model):
    """
    Enhanced base model that enforces tenant isolation automatically.
    All models inheriting from this will have automatic tenant filtering.
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
    
    # Enhanced manager
    objects = EnhancedTenantManager()
    
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
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
        }
        audit_logger.info(f"Record Deleted: {audit_data}")


class CompanyScopedModel(models.Model):
    """
    Enhanced base model for company-scoped models with automatic tenant filtering.
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
    
    # Enhanced manager
    objects = EnhancedTenantManager()
    
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
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
        }
        audit_logger.info(f"Record Deleted: {audit_data}")


class UserScopedModel(models.Model):
    """
    Enhanced base model for user-scoped models with automatic tenant filtering.
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
    
    # Enhanced manager
    objects = EnhancedTenantManager()
    
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
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
        }
        audit_logger.info(f"Record Deleted: {audit_data}")


class MultiCurrencyMixin(models.Model):
    """
    Mixin for financial models to handle multi-currency transactions
    Adds transaction_currency, exchange_rate, and converted_amount_in_base_currency
    """
    transaction_currency = models.CharField(
        max_length=3,
        blank=True,
        null=True,
        help_text='Currency code for this transaction (e.g., USD, MYR)'
    )
    exchange_rate = models.DecimalField(
        max_digits=18,
        decimal_places=8,
        null=True,
        blank=True,
        help_text='Exchange rate used for conversion (from transaction_currency to base_currency)'
    )
    converted_amount_in_base_currency = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Amount converted to tenant base currency'
    )
    exchange_rate_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date/time when exchange rate was applied'
    )

    class Meta:
        abstract = True

    def get_base_currency(self):
        """Get tenant's base currency"""
        if hasattr(self, 'tenant') and self.tenant:
            try:
                from fx_conversion.models import Currency
                base_currency = Currency.objects.filter(
                    tenant=self.tenant,
                    is_base_currency=True
                ).first()
                if base_currency:
                    return base_currency.code
            except Exception:
                pass
            # Fallback to tenant currency_code
            return getattr(self.tenant, 'currency_code', 'USD')
        return 'USD'

    def convert_to_base_currency(self, amount, transaction_currency=None, exchange_rate=None):
        """
        Convert amount to base currency
        
        Args:
            amount: Amount in transaction currency
            transaction_currency: Currency code (if None, uses self.transaction_currency)
            exchange_rate: Exchange rate (if None, fetches from ExchangeRate model)
        
        Returns:
            Converted amount in base currency
        """
        from decimal import Decimal
        
        if not transaction_currency:
            transaction_currency = self.transaction_currency
        
        if not transaction_currency:
            return amount  # No conversion needed
        
        base_currency = self.get_base_currency()
        
        # If same currency, no conversion
        if transaction_currency == base_currency:
            return amount
        
        # Use provided exchange rate or fetch from database
        if not exchange_rate:
            if self.exchange_rate:
                exchange_rate = self.exchange_rate
            else:
                # Fetch latest exchange rate
                try:
                    from fx_conversion.models import ExchangeRate
                    from django.utils import timezone
                    rate_obj = ExchangeRate.objects.filter(
                        tenant=self.tenant if hasattr(self, 'tenant') else None,
                        from_currency=transaction_currency,
                        to_currency=base_currency,
                        is_active=True
                    ).order_by('-valid_from').first()
                    
                    if rate_obj:
                        exchange_rate = rate_obj.rate
                        self.exchange_rate = exchange_rate
                        self.exchange_rate_date = timezone.now()
                    else:
                        # No rate found, return original amount
                        return amount
                except Exception:
                    return amount
        
        # Convert amount
        converted = Decimal(str(amount)) * Decimal(str(exchange_rate))
        return converted

    def save(self, *args, **kwargs):
        """Auto-convert to base currency if transaction_currency is set"""
        # Auto-convert if transaction_currency is different from base
        if self.transaction_currency and hasattr(self, 'amount'):
            base_currency = self.get_base_currency()
            if self.transaction_currency != base_currency:
                # Try to get amount field (could be 'amount', 'total', 'value', etc.)
                amount_fields = ['amount', 'total', 'value', 'price', 'subtotal']
                amount_value = None
                for field in amount_fields:
                    if hasattr(self, field):
                        amount_value = getattr(self, field)
                        break
                
                if amount_value:
                    converted = self.convert_to_base_currency(amount_value)
                    self.converted_amount_in_base_currency = converted
        
        super().save(*args, **kwargs)


class FinancialModel(TenantScopedModel, MultiCurrencyMixin):
    """
    Base model for financial data with enhanced security and compliance features.
    Includes multi-currency support via MultiCurrencyMixin.
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


class AuditModel(TenantScopedModel):
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


# Signal handlers for automatic tenant assignment and audit logging
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
    
    return Q(*tenant_filters, _connector=Q.OR)
