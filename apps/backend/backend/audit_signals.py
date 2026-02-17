"""
Audit Signal Handlers for Multi-Tenant Database Operations
Automatically logs all database operations for audit purposes.
"""

import logging
import json
from typing import Any, Dict, List
from django.db import models
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .audit_service import audit_service
from .row_tenant_middleware import get_current_tenant, get_current_user

User = get_user_model()
logger = logging.getLogger(__name__)


class AuditSignalHandler:
    """
    Handles audit signals for database operations.
    """
    
    def __init__(self):
        self.audit_logger = logging.getLogger('audit')
        self.excluded_models = {
            'AuditLog', 'AuditQuery', 'AuditExport', 'AuditViolation',
            'Session', 'ContentType', 'LogEntry'
        }
        self.sensitive_fields = {
            'password', 'ssn', 'credit_card', 'bank_account', 'routing_number',
            'api_key', 'secret', 'token', 'private_key', 'encryption_key'
        }
    
    def is_sensitive_field(self, field_name: str) -> bool:
        """Check if a field contains sensitive data"""
        field_name_lower = field_name.lower()
        return any(sensitive in field_name_lower for sensitive in self.sensitive_fields)
    
    def get_field_value(self, instance, field_name: str) -> Any:
        """Get field value safely"""
        try:
            if hasattr(instance, field_name):
                value = getattr(instance, field_name)
                # Mask sensitive fields
                if self.is_sensitive_field(field_name):
                    return "***MASKED***"
                return value
            return None
        except Exception:
            return None
    
    def get_model_data(self, instance) -> Dict:
        """Get model data for audit logging"""
        try:
            data = {}
            for field in instance._meta.fields:
                field_name = field.name
                value = self.get_field_value(instance, field_name)
                if value is not None:
                    data[field_name] = value
            return data
        except Exception as e:
            logger.error(f"Failed to get model data: {e}")
            return {}
    
    def get_changed_fields(self, instance, old_data: Dict, new_data: Dict) -> List[str]:
        """Get list of changed fields"""
        changed_fields = []
        for field_name in new_data:
            if field_name in old_data:
                if old_data[field_name] != new_data[field_name]:
                    changed_fields.append(field_name)
            else:
                changed_fields.append(field_name)
        return changed_fields
    
    def get_compliance_framework(self, instance) -> str:
        """Get compliance framework for the model"""
        # Check if model has compliance framework attribute
        if hasattr(instance, 'compliance_framework'):
            return instance.compliance_framework
        
        # Check if model has tenant and determine framework
        if hasattr(instance, 'tenant'):
            # Financial models typically fall under SOX
            if hasattr(instance, 'balance') or hasattr(instance, 'amount'):
                return 'SOX'
            # User data falls under GDPR
            if hasattr(instance, 'email') or hasattr(instance, 'phone'):
                return 'GDPR'
            # Health data falls under HIPAA
            if hasattr(instance, 'medical') or hasattr(instance, 'health'):
                return 'HIPAA'
        
        return 'SOX'  # Default to SOX for financial applications
    
    def get_data_classification(self, instance) -> str:
        """Get data classification for the model"""
        # Check if model has data classification attribute
        if hasattr(instance, 'data_classification'):
            return instance.data_classification
        
        # Determine classification based on model type
        if hasattr(instance, 'is_sensitive') and instance.is_sensitive:
            return 'RESTRICTED'
        
        # Financial data is typically confidential
        if hasattr(instance, 'balance') or hasattr(instance, 'amount'):
            return 'CONFIDENTIAL'
        
        # User data is typically confidential
        if hasattr(instance, 'email') or hasattr(instance, 'phone'):
            return 'CONFIDENTIAL'
        
        return 'CONFIDENTIAL'  # Default to confidential
    
    def is_sensitive_operation(self, instance) -> bool:
        """Check if operation involves sensitive data"""
        # Check if model has sensitive flag
        if hasattr(instance, 'is_sensitive'):
            return instance.is_sensitive
        
        # Check for sensitive fields
        for field in instance._meta.fields:
            if self.is_sensitive_field(field.name):
                return True
        
        return False
    
    def log_operation(
        self,
        operation: str,
        instance,
        old_data: Dict = None,
        new_data: Dict = None
    ):
        """Log a database operation"""
        try:
            # Skip excluded models
            if instance.__class__.__name__ in self.excluded_models:
                return
            
            # Get tenant and user context
            tenant = get_current_tenant()
            user = get_current_user()
            
            if not tenant:
                # Skip if no tenant context
                return
            
            # Get operation details
            resource_type = instance.__class__.__name__
            resource_id = str(instance.pk) if instance.pk else 'new'
            resource_name = str(instance) if hasattr(instance, '__str__') else f"{resource_type} {resource_id}"
            
            # Get compliance and classification
            compliance_framework = self.get_compliance_framework(instance)
            data_classification = self.get_data_classification(instance)
            is_sensitive = self.is_sensitive_operation(instance)
            
            # Get changed fields for updates
            changed_fields = []
            if operation == 'UPDATE' and old_data and new_data:
                changed_fields = self.get_changed_fields(instance, old_data, new_data)
            
            # Log the operation
            audit_service.log_operation(
                operation=operation,
                resource_type=resource_type,
                resource_id=resource_id,
                resource_name=resource_name,
                old_data=old_data or {},
                new_data=new_data or {},
                changed_fields=changed_fields,
                compliance_framework=compliance_framework,
                data_classification=data_classification,
                is_sensitive=is_sensitive,
                tenant=tenant,
                user=user,
            )
            
        except Exception as e:
            logger.error(f"Failed to log operation {operation}: {e}")
    
    def log_query(self, model_class, filters: Dict = None, fields: List = None, count: int = 0):
        """Log a query operation"""
        try:
            # Get tenant and user context
            tenant = get_current_tenant()
            user = get_current_user()
            
            if not tenant:
                return
            
            # Skip excluded models
            if model_class.__name__ in self.excluded_models:
                return
            
            # Determine if query involves sensitive data
            is_sensitive = False
            if fields:
                is_sensitive = any(self.is_sensitive_field(field) for field in fields)
            
            # Log the query
            audit_service.log_query(
                query_type='SELECT',
                model_name=model_class.__name__,
                filters_applied=filters or {},
                fields_accessed=fields or [],
                record_count=count,
                data_classification='CONFIDENTIAL' if is_sensitive else 'INTERNAL',
                is_sensitive=is_sensitive,
                tenant=tenant,
                user=user,
            )
            
        except Exception as e:
            logger.error(f"Failed to log query: {e}")


# Global audit signal handler
audit_handler = AuditSignalHandler()


# Signal handlers for automatic audit logging
@receiver(pre_save)
def audit_pre_save(sender, instance, **kwargs):
    """Log before save operation"""
    try:
        # Store old data for update operations
        if instance.pk:
            try:
                old_instance = sender.objects.get(pk=instance.pk)
                old_data = audit_handler.get_model_data(old_instance)
                # Store in instance for use in post_save
                instance._audit_old_data = old_data
            except sender.DoesNotExist:
                instance._audit_old_data = {}
        else:
            instance._audit_old_data = {}
    except Exception as e:
        logger.error(f"Failed to store old data for audit: {e}")


@receiver(post_save)
def audit_post_save(sender, instance, created, **kwargs):
    """Log after save operation"""
    try:
        # Get old data
        old_data = getattr(instance, '_audit_old_data', {})
        
        # Get new data
        new_data = audit_handler.get_model_data(instance)
        
        # Determine operation
        operation = 'CREATE' if created else 'UPDATE'
        
        # Log the operation
        audit_handler.log_operation(
            operation=operation,
            instance=instance,
            old_data=old_data,
            new_data=new_data
        )
        
        # Clean up
        if hasattr(instance, '_audit_old_data'):
            delattr(instance, '_audit_old_data')
            
    except Exception as e:
        logger.error(f"Failed to log post_save audit: {e}")


@receiver(pre_delete)
def audit_pre_delete(sender, instance, **kwargs):
    """Log before delete operation"""
    try:
        # Get data before deletion
        old_data = audit_handler.get_model_data(instance)
        
        # Store in instance for use in post_delete
        instance._audit_old_data = old_data
        
    except Exception as e:
        logger.error(f"Failed to store data for delete audit: {e}")


@receiver(post_delete)
def audit_post_delete(sender, instance, **kwargs):
    """Log after delete operation"""
    try:
        # Get old data
        old_data = getattr(instance, '_audit_old_data', {})
        
        # Log the operation
        audit_handler.log_operation(
            operation='DELETE',
            instance=instance,
            old_data=old_data,
            new_data={}
        )
        
    except Exception as e:
        logger.error(f"Failed to log post_delete audit: {e}")


# Custom QuerySet for automatic query logging
class AuditableQuerySet(models.QuerySet):
    """
    QuerySet that automatically logs queries for audit purposes.
    """
    
    def filter(self, *args, **kwargs):
        """Override filter to log query"""
        queryset = super().filter(*args, **kwargs)
        self._log_query('FILTER', kwargs)
        return queryset
    
    def exclude(self, *args, **kwargs):
        """Override exclude to log query"""
        queryset = super().exclude(*args, **kwargs)
        self._log_query('EXCLUDE', kwargs)
        return queryset
    
    def get(self, *args, **kwargs):
        """Override get to log query"""
        self._log_query('GET', kwargs)
        return super().get(*args, **kwargs)
    
    def count(self):
        """Override count to log query"""
        self._log_query('COUNT', {})
        return super().count()
    
    def exists(self):
        """Override exists to log query"""
        self._log_query('EXISTS', {})
        return super().exists()
    
    def values(self, *fields, **expressions):
        """Override values to log query"""
        queryset = super().values(*fields, **expressions)
        self._log_query('VALUES', {'fields': fields})
        return queryset
    
    def values_list(self, *fields, flat=False, named=False):
        """Override values_list to log query"""
        queryset = super().values_list(*fields, flat=flat, named=named)
        self._log_query('VALUES_LIST', {'fields': fields})
        return queryset
    
    def _log_query(self, query_type: str, filters: Dict):
        """Log query for audit purposes"""
        try:
            # Get model class
            model_class = self.model
            
            # Get fields being accessed
            fields = []
            if hasattr(self, '_fields'):
                fields = list(self._fields)
            
            # Get record count
            count = 0
            try:
                count = self.count()
            except Exception:
                pass
            
            # Log the query
            audit_handler.log_query(
                model_class=model_class,
                filters=filters,
                fields=fields,
                count=count
            )
            
        except Exception as e:
            logger.error(f"Failed to log query audit: {e}")


# Custom Manager for automatic query logging
class AuditableManager(models.Manager):
    """
    Manager that automatically logs queries for audit purposes.
    """
    
    def get_queryset(self):
        """Return auditable queryset"""
        return AuditableQuerySet(self.model, using=self._db)
    
    def create(self, **kwargs):
        """Override create to log operation"""
        instance = super().create(**kwargs)
        # The post_save signal will handle the audit logging
        return instance
    
    def update(self, **kwargs):
        """Override update to log operation"""
        # Get old data before update
        old_data = {}
        for instance in self.all():
            old_data[str(instance.pk)] = audit_handler.get_model_data(instance)
        
        # Perform update
        result = super().update(**kwargs)
        
        # Log update for each affected instance
        for instance in self.all():
            audit_handler.log_operation(
                operation='UPDATE',
                instance=instance,
                old_data=old_data.get(str(instance.pk), {}),
                new_data=audit_handler.get_model_data(instance)
            )
        
        return result
    
    def delete(self):
        """Override delete to log operation"""
        # Get data before deletion
        old_data = {}
        for instance in self.all():
            old_data[str(instance.pk)] = audit_handler.get_model_data(instance)
        
        # Perform deletion
        result = super().delete()
        
        # Log deletion for each affected instance
        for instance in self.all():
            audit_handler.log_operation(
                operation='DELETE',
                instance=instance,
                old_data=old_data.get(str(instance.pk), {}),
                new_data={}
            )
        
        return result


# Utility functions for manual audit logging
def log_manual_operation(
    operation: str,
    resource_type: str,
    resource_id: str,
    resource_name: str = "",
    old_data: Dict = None,
    new_data: Dict = None,
    changed_fields: List = None,
    compliance_framework: str = "",
    data_classification: str = "CONFIDENTIAL",
    is_sensitive: bool = False
):
    """Log a manual operation for audit purposes"""
    return audit_service.log_operation(
        operation=operation,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_name=resource_name,
        old_data=old_data,
        new_data=new_data,
        changed_fields=changed_fields,
        compliance_framework=compliance_framework,
        data_classification=data_classification,
        is_sensitive=is_sensitive
    )


def log_security_violation(
    violation_type: str,
    description: str,
    details: Dict = None,
    severity: str = "MEDIUM"
):
    """Log a security violation"""
    return audit_service.log_violation(
        violation_type=violation_type,
        description=description,
        details=details,
        severity=severity
    )


def log_data_export(
    export_type: str,
    model_name: str,
    filters_applied: Dict = None,
    record_count: int = 0,
    file_path: str = "",
    file_size: int = 0
):
    """Log a data export operation"""
    return audit_service.log_export(
        export_type=export_type,
        model_name=model_name,
        filters_applied=filters_applied,
        record_count=record_count,
        file_path=file_path,
        file_size=file_size
    )
