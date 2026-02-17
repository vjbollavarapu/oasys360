"""
Comprehensive Audit Logging System for Fintech Compliance
Provides detailed audit trails for regulatory compliance and security monitoring.
"""

import json
import logging
import time
import uuid
from typing import Any, Dict, List, Optional, Union
from django.db import models, transaction
from django.utils import timezone
from django.contrib.auth.models import User
from django.conf import settings
from django.core.cache import cache
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.utils.encoding import force_str
from .row_tenant_middleware import get_current_tenant, get_current_user
from .compliance_models import ComplianceAuditLog, DataClassification, ComplianceViolation

logger = logging.getLogger(__name__)


class AuditLogger:
    """
    Centralized audit logging system for compliance and security.
    """
    
    def __init__(self):
        self.audit_logger = logging.getLogger('audit')
        self.security_logger = logging.getLogger('security')
        self.compliance_logger = logging.getLogger('compliance')
        self.data_governance_logger = logging.getLogger('data_governance')
    
    def log_data_access(self, user, model_name, object_id, action, 
                        field_changes=None, request=None, **kwargs):
        """Log data access for audit purposes"""
        audit_data = {
            'timestamp': timezone.now().isoformat(),
            'action': action,
            'model_name': model_name,
            'object_id': str(object_id),
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'field_changes': field_changes or {},
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            'ip_address': self._get_client_ip(request) if request else None,
            'user_agent': request.META.get('HTTP_USER_AGENT', '') if request else '',
            'session_id': request.session.session_key if request and hasattr(request, 'session') else None,
            **kwargs
        }
        
        self.audit_logger.info(f"Data Access: {json.dumps(audit_data)}")
        
        # Store in compliance audit log
        self._store_compliance_audit_log(audit_data)
    
    def log_security_event(self, event_type, user, description, severity='medium', 
                          request=None, **kwargs):
        """Log security events"""
        security_data = {
            'timestamp': timezone.now().isoformat(),
            'event_type': event_type,
            'severity': severity,
            'description': description,
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'ip_address': self._get_client_ip(request) if request else None,
            'user_agent': request.META.get('HTTP_USER_AGENT', '') if request else '',
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            **kwargs
        }
        
        self.security_logger.warning(f"Security Event: {json.dumps(security_data)}")
        
        # Create compliance violation if severity is high or critical
        if severity in ['high', 'critical']:
            self._create_compliance_violation(security_data)
    
    def log_compliance_event(self, framework, event_type, user, description, 
                            compliance_data=None, request=None, **kwargs):
        """Log compliance events"""
        compliance_event = {
            'timestamp': timezone.now().isoformat(),
            'framework': framework,
            'event_type': event_type,
            'description': description,
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'compliance_data': compliance_data or {},
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            **kwargs
        }
        
        self.compliance_logger.info(f"Compliance Event: {json.dumps(compliance_event)}")
        
        # Store in compliance audit log
        self._store_compliance_audit_log(compliance_event)
    
    def log_data_governance(self, governance_type, user, data_classification, 
                           data_subject_id=None, request=None, **kwargs):
        """Log data governance events"""
        governance_data = {
            'timestamp': timezone.now().isoformat(),
            'governance_type': governance_type,
            'data_classification': data_classification,
            'data_subject_id': data_subject_id,
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            **kwargs
        }
        
        self.data_governance_logger.info(f"Data Governance: {json.dumps(governance_data)}")
    
    def log_user_authentication(self, user, action, success=True, request=None, **kwargs):
        """Log user authentication events"""
        auth_data = {
            'timestamp': timezone.now().isoformat(),
            'action': action,
            'success': success,
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'ip_address': self._get_client_ip(request) if request else None,
            'user_agent': request.META.get('HTTP_USER_AGENT', '') if request else '',
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            **kwargs
        }
        
        self.audit_logger.info(f"Authentication: {json.dumps(audit_data)}")
        
        # Log security event for failed authentication
        if not success:
            self.log_security_event(
                'authentication_failure',
                user,
                f"Failed {action}",
                severity='medium',
                request=request
            )
    
    def log_data_export(self, user, export_type, data_classification, 
                       record_count, request=None, **kwargs):
        """Log data export events"""
        export_data = {
            'timestamp': timezone.now().isoformat(),
            'export_type': export_type,
            'data_classification': data_classification,
            'record_count': record_count,
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'ip_address': self._get_client_ip(request) if request else None,
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            **kwargs
        }
        
        self.audit_logger.info(f"Data Export: {json.dumps(export_data)}")
        
        # Log compliance event for sensitive data export
        if data_classification in ['confidential', 'restricted', 'top_secret']:
            self.log_compliance_event(
                'gdpr',
                'data_export',
                user,
                f"Exported {record_count} records of {data_classification} data",
                compliance_data=export_data,
                request=request
            )
    
    def log_data_import(self, user, import_type, data_classification, 
                        record_count, request=None, **kwargs):
        """Log data import events"""
        import_data = {
            'timestamp': timezone.now().isoformat(),
            'import_type': import_type,
            'data_classification': data_classification,
            'record_count': record_count,
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'ip_address': self._get_client_ip(request) if request else None,
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            **kwargs
        }
        
        self.audit_logger.info(f"Data Import: {json.dumps(import_data)}")
        
        # Log compliance event for sensitive data import
        if data_classification in ['confidential', 'restricted', 'top_secret']:
            self.log_compliance_event(
                'gdpr',
                'data_import',
                user,
                f"Imported {record_count} records of {data_classification} data",
                compliance_data=import_data,
                request=request
            )
    
    def log_system_configuration(self, user, configuration_type, changes, 
                                request=None, **kwargs):
        """Log system configuration changes"""
        config_data = {
            'timestamp': timezone.now().isoformat(),
            'configuration_type': configuration_type,
            'changes': changes,
            'user_id': str(user.id) if user else None,
            'tenant_id': str(user.tenant.id) if user and hasattr(user, 'tenant') else None,
            'ip_address': self._get_client_ip(request) if request else None,
            'request_id': None,  # Request ID not needed for row-based multi-tenancy
            **kwargs
        }
        
        self.audit_logger.info(f"System Configuration: {json.dumps(config_data)}")
    
    def _store_compliance_audit_log(self, audit_data):
        """Store audit data in compliance audit log"""
        try:
            with transaction.atomic():
                ComplianceAuditLog.objects.create(
                    tenant=get_current_tenant(),
                    user=get_current_user(),
                    audit_type=audit_data.get('action', 'data_access'),
                    severity=audit_data.get('severity', 'medium'),
                    compliance_framework=audit_data.get('framework', ''),
                    user_id=audit_data.get('user_id'),
                    session_id=audit_data.get('session_id'),
                    ip_address=audit_data.get('ip_address'),
                    user_agent=audit_data.get('user_agent'),
                    method=audit_data.get('method', 'GET'),
                    path=audit_data.get('path', ''),
                    query_params=audit_data.get('query_params', {}),
                    status_code=audit_data.get('status_code', 200),
                    model_name=audit_data.get('model_name'),
                    object_id=audit_data.get('object_id'),
                    field_changes=audit_data.get('field_changes', {}),
                    data_classification=audit_data.get('data_classification', 'internal'),
                    is_sensitive_data=audit_data.get('is_sensitive_data', False),
                    data_subject_id=audit_data.get('data_subject_id'),
                    request_id=audit_data.get('request_id'),
                )
        except Exception as e:
            logger.error(f"Failed to store compliance audit log: {e}")
    
    def _create_compliance_violation(self, security_data):
        """Create compliance violation for security events"""
        try:
            with transaction.atomic():
                ComplianceViolation.objects.create(
                    tenant=get_current_tenant(),
                    violation_type='security_event',
                    severity=security_data.get('severity', 'medium'),
                    title=f"Security Event: {security_data.get('event_type')}",
                    description=security_data.get('description'),
                    affected_users=[security_data.get('user_id')] if security_data.get('user_id') else [],
                    discovered_by=get_current_user(),
                    compliance_frameworks=['sox', 'pci_dss'],
                    requires_notification=security_data.get('severity') in ['high', 'critical'],
                )
        except Exception as e:
            logger.error(f"Failed to create compliance violation: {e}")
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        if not request:
            return None
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


# Global audit logger instance
_audit_logger = None


def get_audit_logger() -> AuditLogger:
    """Get global audit logger instance"""
    global _audit_logger
    if _audit_logger is None:
        _audit_logger = AuditLogger()
    return _audit_logger


class AuditMixin:
    """
    Mixin to add audit capabilities to models.
    """
    
    def log_creation(self, user=None, request=None):
        """Log model creation"""
        if not user:
            user = get_current_user()
        
        audit_logger = get_audit_logger()
        audit_logger.log_data_access(
            user=user,
            model_name=self.__class__.__name__,
            object_id=self.pk,
            action='CREATE',
            request=request
        )
    
    def log_update(self, user=None, field_changes=None, request=None):
        """Log model update"""
        if not user:
            user = get_current_user()
        
        audit_logger = get_audit_logger()
        audit_logger.log_data_access(
            user=user,
            model_name=self.__class__.__name__,
            object_id=self.pk,
            action='UPDATE',
            field_changes=field_changes,
            request=request
        )
    
    def log_deletion(self, user=None, request=None):
        """Log model deletion"""
        if not user:
            user = get_current_user()
        
        audit_logger = get_audit_logger()
        audit_logger.log_data_access(
            user=user,
            model_name=self.__class__.__name__,
            object_id=self.pk,
            action='DELETE',
            request=request
        )
    
    def log_access(self, user=None, request=None):
        """Log model access"""
        if not user:
            user = get_current_user()
        
        audit_logger = get_audit_logger()
        audit_logger.log_data_access(
            user=user,
            model_name=self.__class__.__name__,
            object_id=self.pk,
            action='READ',
            request=request
        )


# Signal handlers for automatic audit logging
@receiver(pre_save)
def log_model_pre_save(sender, instance, **kwargs):
    """Log model before save"""
    if hasattr(instance, 'log_update'):
        # Get field changes
        if instance.pk:
            try:
                old_instance = sender.objects.get(pk=instance.pk)
                field_changes = {}
                for field in instance._meta.fields:
                    old_value = getattr(old_instance, field.name, None)
                    new_value = getattr(instance, field.name, None)
                    if old_value != new_value:
                        field_changes[field.name] = {
                            'old': str(old_value) if old_value is not None else None,
                            'new': str(new_value) if new_value is not None else None
                        }
                
                # Store field changes for post_save
                instance._audit_field_changes = field_changes
            except sender.DoesNotExist:
                instance._audit_field_changes = {}


@receiver(post_save)
def log_model_post_save(sender, instance, created, **kwargs):
    """Log model after save"""
    if hasattr(instance, 'log_creation') and hasattr(instance, 'log_update'):
        if created:
            instance.log_creation()
        else:
            field_changes = getattr(instance, '_audit_field_changes', {})
            instance.log_update(field_changes=field_changes)


@receiver(pre_delete)
def log_model_pre_delete(sender, instance, **kwargs):
    """Log model before deletion"""
    if hasattr(instance, 'log_deletion'):
        instance.log_deletion()


# Decorators for audit logging
def audit_log(action, model_name=None, data_classification='internal'):
    """Decorator to log function calls for audit purposes"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            audit_logger = get_audit_logger()
            user = get_current_user()
            
            # Log function call
            audit_logger.log_data_access(
                user=user,
                model_name=model_name or func.__name__,
                object_id=None,
                action=action,
                data_classification=data_classification
            )
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def security_audit(event_type, severity='medium'):
    """Decorator to log security events"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            audit_logger = get_audit_logger()
            user = get_current_user()
            
            # Log security event
            audit_logger.log_security_event(
                event_type=event_type,
                user=user,
                description=f"Function call: {func.__name__}",
                severity=severity
            )
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def compliance_audit(framework, event_type):
    """Decorator to log compliance events"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            audit_logger = get_audit_logger()
            user = get_current_user()
            
            # Log compliance event
            audit_logger.log_compliance_event(
                framework=framework,
                event_type=event_type,
                user=user,
                description=f"Function call: {func.__name__}"
            )
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


# Utility functions for audit logging
def log_data_access(user, model_name, object_id, action, **kwargs):
    """Log data access event"""
    audit_logger = get_audit_logger()
    audit_logger.log_data_access(
        user=user,
        model_name=model_name,
        object_id=object_id,
        action=action,
        **kwargs
    )


def log_security_event(event_type, user, description, severity='medium', **kwargs):
    """Log security event"""
    audit_logger = get_audit_logger()
    audit_logger.log_security_event(
        event_type=event_type,
        user=user,
        description=description,
        severity=severity,
        **kwargs
    )


def log_compliance_event(framework, event_type, user, description, **kwargs):
    """Log compliance event"""
    audit_logger = get_audit_logger()
    audit_logger.log_compliance_event(
        framework=framework,
        event_type=event_type,
        user=user,
        description=description,
        **kwargs
    )


def log_data_export(user, export_type, data_classification, record_count, **kwargs):
    """Log data export event"""
    audit_logger = get_audit_logger()
    audit_logger.log_data_export(
        user=user,
        export_type=export_type,
        data_classification=data_classification,
        record_count=record_count,
        **kwargs
    )


def log_data_import(user, import_type, data_classification, record_count, **kwargs):
    """Log data import event"""
    audit_logger = get_audit_logger()
    audit_logger.log_data_import(
        user=user,
        import_type=import_type,
        data_classification=data_classification,
        record_count=record_count,
        **kwargs
    )
