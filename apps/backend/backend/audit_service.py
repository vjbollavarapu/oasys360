"""
Audit Service for Multi-Tenant Database Operations
Provides comprehensive audit logging service for compliance and security.
"""

import logging
import json
import hashlib
from typing import Any, Optional, Dict, List, Union
from django.db import models, transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import Q, QuerySet
from django.conf import settings
from .audit_models import AuditLog, AuditQuery, AuditExport, AuditViolation
from .row_tenant_middleware import get_current_tenant, get_current_user

User = get_user_model()
logger = logging.getLogger(__name__)


class AuditService:
    """
    Comprehensive audit service for multi-tenant database operations.
    Provides methods for logging all database operations with compliance features.
    """
    
    def __init__(self):
        self.audit_logger = logging.getLogger('audit')
        self.security_logger = logging.getLogger('security')
        self.compliance_logger = logging.getLogger('compliance')
    
    def log_operation(
        self,
        operation: str,
        resource_type: str,
        resource_id: str,
        resource_name: str = "",
        old_data: Dict = None,
        new_data: Dict = None,
        changed_fields: List = None,
        compliance_framework: str = "",
        data_classification: str = "CONFIDENTIAL",
        is_sensitive: bool = False,
        tenant=None,
        user=None,
        request_id: str = "",
        session_id: str = "",
        ip_address: str = "",
        user_agent: str = "",
        parent_audit_id: str = None
    ) -> AuditLog:
        """
        Log a database operation for audit purposes.
        
        Args:
            operation: Type of operation (CREATE, READ, UPDATE, DELETE, etc.)
            resource_type: Type of resource (model name)
            resource_id: ID of the resource
            resource_name: Human-readable name of the resource
            old_data: Data before the operation
            new_data: Data after the operation
            changed_fields: List of fields that were changed
            compliance_framework: Compliance framework (SOX, PCI_DSS, etc.)
            data_classification: Data classification level
            is_sensitive: Whether this operation involved sensitive data
            tenant: Tenant object (if None, uses current tenant)
            user: User object (if None, uses current user)
            request_id: Request identifier
            session_id: Session identifier
            ip_address: IP address of the request
            user_agent: User agent string
            parent_audit_id: Parent audit record ID
        
        Returns:
            AuditLog: Created audit log record
        """
        try:
            # Get tenant and user context
            if not tenant:
                tenant = get_current_tenant()
            if not user:
                user = get_current_user()
            if not request_id:
                request_id = get_current_request_id() or ""
            
            if not tenant:
                raise ValidationError("Tenant context required for audit logging")
            
            # Create audit log record
            audit_log = AuditLog.objects.create(
                tenant=tenant,
                user=user,
                operation=operation,
                resource_type=resource_type,
                resource_id=resource_id,
                resource_name=resource_name,
                old_data=old_data or {},
                new_data=new_data or {},
                changed_fields=changed_fields or [],
                compliance_framework=compliance_framework,
                data_classification=data_classification,
                is_sensitive=is_sensitive,
                request_id=request_id,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                parent_audit_id=parent_audit_id,
            )
            
            # Log to audit logger
            self.audit_logger.info(
                f"Audit Log: {operation} {resource_type} {resource_id} "
                f"by {user.email if user else 'system'} "
                f"at {timezone.now().isoformat()}"
            )
            
            return audit_log
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
            raise
    
    def log_query(
        self,
        query_type: str,
        model_name: str,
        filters_applied: Dict = None,
        fields_accessed: List = None,
        record_count: int = 0,
        data_classification: str = "CONFIDENTIAL",
        is_sensitive: bool = False,
        tenant=None,
        user=None,
        request_id: str = "",
        ip_address: str = "",
        user_agent: str = ""
    ) -> AuditQuery:
        """
        Log a query operation for audit purposes.
        
        Args:
            query_type: Type of query (SELECT, COUNT, AGGREGATE, etc.)
            model_name: Name of the model being queried
            filters_applied: Filters that were applied
            fields_accessed: Fields that were accessed
            record_count: Number of records returned
            data_classification: Data classification level
            is_sensitive: Whether this query involved sensitive data
            tenant: Tenant object (if None, uses current tenant)
            user: User object (if None, uses current user)
            request_id: Request identifier
            ip_address: IP address of the request
            user_agent: User agent string
        
        Returns:
            AuditQuery: Created audit query record
        """
        try:
            # Get tenant and user context
            if not tenant:
                tenant = get_current_tenant()
            if not user:
                user = get_current_user()
            if not request_id:
                request_id = get_current_request_id() or ""
            
            if not tenant:
                raise ValidationError("Tenant context required for audit logging")
            
            # Create audit query record
            audit_query = AuditQuery.objects.create(
                tenant=tenant,
                user=user,
                query_type=query_type,
                model_name=model_name,
                filters_applied=filters_applied or {},
                fields_accessed=fields_accessed or [],
                record_count=record_count,
                data_classification=data_classification,
                is_sensitive=is_sensitive,
                request_id=request_id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            
            # Log to audit logger
            self.audit_logger.info(
                f"Audit Query: {query_type} {model_name} "
                f"by {user.email if user else 'system'} "
                f"at {timezone.now().isoformat()}"
            )
            
            return audit_query
            
        except Exception as e:
            logger.error(f"Failed to create audit query: {e}")
            raise
    
    def log_export(
        self,
        export_type: str,
        model_name: str,
        filters_applied: Dict = None,
        record_count: int = 0,
        file_path: str = "",
        file_size: int = 0,
        data_classification: str = "CONFIDENTIAL",
        is_sensitive: bool = False,
        tenant=None,
        user=None,
        request_id: str = "",
        ip_address: str = "",
        user_agent: str = ""
    ) -> AuditExport:
        """
        Log a data export operation for audit purposes.
        
        Args:
            export_type: Type of export (CSV, EXCEL, PDF, etc.)
            model_name: Name of the model being exported
            filters_applied: Filters that were applied
            record_count: Number of records exported
            file_path: Path to the exported file
            file_size: Size of the exported file
            data_classification: Data classification level
            is_sensitive: Whether this export involved sensitive data
            tenant: Tenant object (if None, uses current tenant)
            user: User object (if None, uses current user)
            request_id: Request identifier
            ip_address: IP address of the request
            user_agent: User agent string
        
        Returns:
            AuditExport: Created audit export record
        """
        try:
            # Get tenant and user context
            if not tenant:
                tenant = get_current_tenant()
            if not user:
                user = get_current_user()
            if not request_id:
                request_id = get_current_request_id() or ""
            
            if not tenant:
                raise ValidationError("Tenant context required for audit logging")
            
            # Create audit export record
            audit_export = AuditExport.objects.create(
                tenant=tenant,
                user=user,
                export_type=export_type,
                model_name=model_name,
                filters_applied=filters_applied or {},
                record_count=record_count,
                file_path=file_path,
                file_size=file_size,
                data_classification=data_classification,
                is_sensitive=is_sensitive,
                request_id=request_id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            
            # Log to audit logger
            self.audit_logger.info(
                f"Audit Export: {export_type} {model_name} "
                f"by {user.email if user else 'system'} "
                f"at {timezone.now().isoformat()}"
            )
            
            return audit_export
            
        except Exception as e:
            logger.error(f"Failed to create audit export: {e}")
            raise
    
    def log_violation(
        self,
        violation_type: str,
        description: str,
        details: Dict = None,
        severity: str = "MEDIUM",
        tenant=None,
        user=None,
        request_id: str = "",
        ip_address: str = "",
        user_agent: str = ""
    ) -> AuditViolation:
        """
        Log a security violation or compliance breach.
        
        Args:
            violation_type: Type of violation
            description: Description of the violation
            details: Additional details about the violation
            severity: Severity level (LOW, MEDIUM, HIGH, CRITICAL)
            tenant: Tenant object (if None, uses current tenant)
            user: User object (if None, uses current user)
            request_id: Request identifier
            ip_address: IP address of the request
            user_agent: User agent string
        
        Returns:
            AuditViolation: Created audit violation record
        """
        try:
            # Get tenant and user context
            if not tenant:
                tenant = get_current_tenant()
            if not user:
                user = get_current_user()
            if not request_id:
                request_id = get_current_request_id() or ""
            
            if not tenant:
                raise ValidationError("Tenant context required for audit logging")
            
            # Create audit violation record
            audit_violation = AuditViolation.objects.create(
                tenant=tenant,
                user=user,
                violation_type=violation_type,
                description=description,
                details=details or {},
                severity=severity,
                request_id=request_id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            
            # Log to security logger
            self.security_logger.warning(
                f"Security Violation: {violation_type} - {description} "
                f"by {user.email if user else 'system'} "
                f"at {timezone.now().isoformat()}"
            )
            
            return audit_violation
            
        except Exception as e:
            logger.error(f"Failed to create audit violation: {e}")
            raise
    
    def get_audit_trail(
        self,
        tenant=None,
        user=None,
        operation=None,
        resource_type=None,
        start_date=None,
        end_date=None,
        compliance_framework=None,
        data_classification=None,
        is_sensitive=None,
        limit=100,
        offset=0
    ) -> QuerySet:
        """
        Get audit trail for a tenant with optional filters.
        
        Args:
            tenant: Tenant object (if None, uses current tenant)
            user: User object (if None, uses current user)
            operation: Filter by operation type
            resource_type: Filter by resource type
            start_date: Filter by start date
            end_date: Filter by end date
            compliance_framework: Filter by compliance framework
            data_classification: Filter by data classification
            is_sensitive: Filter by sensitive data flag
            limit: Maximum number of records to return
            offset: Number of records to skip
        
        Returns:
            QuerySet: Filtered audit log records
        """
        try:
            # Get tenant context
            if not tenant:
                tenant = get_current_tenant()
            
            if not tenant:
                raise ValidationError("Tenant context required for audit trail")
            
            # Build query
            query = Q(tenant=tenant)
            
            if user:
                query &= Q(user=user)
            
            if operation:
                query &= Q(operation=operation)
            
            if resource_type:
                query &= Q(resource_type=resource_type)
            
            if start_date:
                query &= Q(timestamp__gte=start_date)
            
            if end_date:
                query &= Q(timestamp__lte=end_date)
            
            if compliance_framework:
                query &= Q(compliance_framework=compliance_framework)
            
            if data_classification:
                query &= Q(data_classification=data_classification)
            
            if is_sensitive is not None:
                query &= Q(is_sensitive=is_sensitive)
            
            # Execute query
            audit_logs = AuditLog.objects.filter(query).order_by('-timestamp')
            
            # Apply pagination
            if limit:
                audit_logs = audit_logs[offset:offset + limit]
            
            return audit_logs
            
        except Exception as e:
            logger.error(f"Failed to get audit trail: {e}")
            raise
    
    def get_compliance_report(
        self,
        tenant=None,
        compliance_framework=None,
        start_date=None,
        end_date=None
    ) -> Dict:
        """
        Get compliance report for a tenant.
        
        Args:
            tenant: Tenant object (if None, uses current tenant)
            compliance_framework: Filter by compliance framework
            start_date: Filter by start date
            end_date: Filter by end date
        
        Returns:
            Dict: Compliance report data
        """
        try:
            # Get tenant context
            if not tenant:
                tenant = get_current_tenant()
            
            if not tenant:
                raise ValidationError("Tenant context required for compliance report")
            
            # Build query
            query = Q(tenant=tenant)
            
            if compliance_framework:
                query &= Q(compliance_framework=compliance_framework)
            
            if start_date:
                query &= Q(timestamp__gte=start_date)
            
            if end_date:
                query &= Q(timestamp__lte=end_date)
            
            # Get audit logs
            audit_logs = AuditLog.objects.filter(query)
            
            # Generate report
            report = {
                'tenant_id': str(tenant.id),
                'tenant_name': tenant.name,
                'compliance_framework': compliance_framework,
                'start_date': start_date.isoformat() if start_date else None,
                'end_date': end_date.isoformat() if end_date else None,
                'total_operations': audit_logs.count(),
                'operations_by_type': {},
                'operations_by_user': {},
                'operations_by_resource': {},
                'sensitive_operations': audit_logs.filter(is_sensitive=True).count(),
                'violations': AuditViolation.objects.filter(tenant=tenant).count(),
                'generated_at': timezone.now().isoformat(),
            }
            
            # Operations by type
            for operation in audit_logs.values_list('operation', flat=True).distinct():
                report['operations_by_type'][operation] = audit_logs.filter(operation=operation).count()
            
            # Operations by user
            for user_id in audit_logs.values_list('user__email', flat=True).distinct():
                if user_id:
                    report['operations_by_user'][user_id] = audit_logs.filter(user__email=user_id).count()
            
            # Operations by resource
            for resource_type in audit_logs.values_list('resource_type', flat=True).distinct():
                report['operations_by_resource'][resource_type] = audit_logs.filter(resource_type=resource_type).count()
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate compliance report: {e}")
            raise
    
    def get_user_activity(
        self,
        user,
        start_date=None,
        end_date=None,
        limit=100
    ) -> QuerySet:
        """
        Get user activity audit trail.
        
        Args:
            user: User object
            start_date: Filter by start date
            end_date: Filter by end date
            limit: Maximum number of records to return
        
        Returns:
            QuerySet: User activity audit records
        """
        try:
            # Build query
            query = Q(user=user)
            
            if start_date:
                query &= Q(timestamp__gte=start_date)
            
            if end_date:
                query &= Q(timestamp__lte=end_date)
            
            # Execute query
            audit_logs = AuditLog.objects.filter(query).order_by('-timestamp')
            
            # Apply limit
            if limit:
                audit_logs = audit_logs[:limit]
            
            return audit_logs
            
        except Exception as e:
            logger.error(f"Failed to get user activity: {e}")
            raise
    
    def get_resource_audit_trail(
        self,
        resource_type: str,
        resource_id: str,
        tenant=None
    ) -> QuerySet:
        """
        Get audit trail for a specific resource.
        
        Args:
            resource_type: Type of resource
            resource_id: ID of the resource
            tenant: Tenant object (if None, uses current tenant)
        
        Returns:
            QuerySet: Resource audit records
        """
        try:
            # Get tenant context
            if not tenant:
                tenant = get_current_tenant()
            
            if not tenant:
                raise ValidationError("Tenant context required for resource audit trail")
            
            # Build query
            query = Q(
                tenant=tenant,
                resource_type=resource_type,
                resource_id=resource_id
            )
            
            # Execute query
            audit_logs = AuditLog.objects.filter(query).order_by('-timestamp')
            
            return audit_logs
            
        except Exception as e:
            logger.error(f"Failed to get resource audit trail: {e}")
            raise
    
    def cleanup_old_audit_logs(self, days=2555):
        """
        Clean up old audit logs based on retention policy.
        
        Args:
            days: Number of days to retain audit logs
        """
        try:
            cutoff_date = timezone.now() - timezone.timedelta(days=days)
            
            # Delete old audit logs
            deleted_count = AuditLog.objects.filter(
                timestamp__lt=cutoff_date,
                is_archived=True
            ).delete()[0]
            
            logger.info(f"Cleaned up {deleted_count} old audit logs")
            
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup old audit logs: {e}")
            raise
    
    def archive_audit_logs(self, days=365):
        """
        Archive old audit logs.
        
        Args:
            days: Number of days after which to archive
        """
        try:
            cutoff_date = timezone.now() - timezone.timedelta(days=days)
            
            # Archive old audit logs
            archived_count = AuditLog.objects.filter(
                timestamp__lt=cutoff_date,
                is_archived=False
            ).update(is_archived=True)
            
            logger.info(f"Archived {archived_count} audit logs")
            
            return archived_count
            
        except Exception as e:
            logger.error(f"Failed to archive audit logs: {e}")
            raise


# Global audit service instance
audit_service = AuditService()


# Utility functions for easy access
def log_operation(*args, **kwargs):
    """Log a database operation"""
    return audit_service.log_operation(*args, **kwargs)


def log_query(*args, **kwargs):
    """Log a query operation"""
    return audit_service.log_query(*args, **kwargs)


def log_export(*args, **kwargs):
    """Log a data export operation"""
    return audit_service.log_export(*args, **kwargs)


def log_violation(*args, **kwargs):
    """Log a security violation"""
    return audit_service.log_violation(*args, **kwargs)


def get_audit_trail(*args, **kwargs):
    """Get audit trail for a tenant"""
    return audit_service.get_audit_trail(*args, **kwargs)


def get_compliance_report(*args, **kwargs):
    """Get compliance report for a tenant"""
    return audit_service.get_compliance_report(*args, **kwargs)


def get_user_activity(*args, **kwargs):
    """Get user activity audit trail"""
    return audit_service.get_user_activity(*args, **kwargs)


def get_resource_audit_trail(*args, **kwargs):
    """Get audit trail for a specific resource"""
    return audit_service.get_resource_audit_trail(*args, **kwargs)
