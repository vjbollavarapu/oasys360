"""
Enhanced Role-Based Access Control for Multi-Tenant Fintech Applications
Provides granular permissions and compliance-aware access control.
"""

import logging
from typing import List, Dict, Any, Optional, Set
from django.db import models
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import PermissionDenied
from django.conf import settings
from rest_framework import permissions
from rest_framework.permissions import BasePermission
from .tenant_middleware import get_current_tenant, get_current_user
from .query_filters import ensure_tenant_access

logger = logging.getLogger(__name__)


class FintechPermission(BasePermission):
    """
    Base permission class for fintech applications with compliance awareness.
    """
    
    def __init__(self, required_permissions=None, required_roles=None, 
                 compliance_required=False, audit_required=False):
        self.required_permissions = required_permissions or []
        self.required_roles = required_roles or []
        self.compliance_required = compliance_required
        self.audit_required = audit_required
    
    def has_permission(self, request, view):
        """Check if user has required permissions"""
        if not request.user.is_authenticated:
            return False
        
        # Check tenant access
        if not self._check_tenant_access(request):
            return False
        
        # Check role-based access
        if not self._check_role_access(request):
            return False
        
        # Check specific permissions
        if not self._check_specific_permissions(request):
            return False
        
        # Check compliance requirements
        if self.compliance_required and not self._check_compliance(request):
            return False
        
        # Log access for audit
        if self.audit_required:
            self._log_access(request, view)
        
        return True
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permissions"""
        # Ensure object belongs to tenant
        try:
            ensure_tenant_access(obj, request.user.tenant)
        except PermissionDenied:
            return False
        
        # Check additional object-level permissions
        return self._check_object_permissions(request, view, obj)
    
    def _check_tenant_access(self, request):
        """Check if user belongs to current tenant"""
        return (
            hasattr(request.user, 'tenant') and 
            request.user.tenant is not None
        )
    
    def _check_role_access(self, request):
        """Check role-based access"""
        if not self.required_roles:
            return True
        
        user_role = getattr(request.user, 'role', None)
        return user_role in self.required_roles
    
    def _check_specific_permissions(self, request):
        """Check specific permissions"""
        if not self.required_permissions:
            return True
        
        user_permissions = getattr(request.user, 'permissions', [])
        return all(perm in user_permissions for perm in self.required_permissions)
    
    def _check_compliance(self, request):
        """Check compliance requirements"""
        # Check if user has compliance training
        if hasattr(request.user, 'compliance_training_completed'):
            if not request.user.compliance_training_completed:
                return False
        
        # Check if user is authorized for sensitive data
        if hasattr(request.user, 'sensitive_data_access'):
            if not request.user.sensitive_data_access:
                return False
        
        return True
    
    def _check_object_permissions(self, request, view, obj):
        """Check object-specific permissions"""
        # Override in subclasses for specific object-level checks
        return True
    
    def _log_access(self, request, view):
        """Log access for audit purposes"""
        audit_logger = logging.getLogger('access_audit')
        audit_data = {
            'user_id': str(request.user.id),
            'tenant_id': str(request.user.tenant.id) if request.user.tenant else None,
            'method': request.method,
            'path': request.path,
            'view_name': view.__class__.__name__,
            'permissions_checked': self.required_permissions,
            'roles_checked': self.required_roles,
        }
        audit_logger.info(f"Access Granted: {audit_data}")


class PlatformAdminPermission(FintechPermission):
    """Permission for platform administrators"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin'],
            audit_required=True
        )


class TenantAdminPermission(FintechPermission):
    """Permission for tenant administrators"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin'],
            audit_required=True
        )


class FirmAdminPermission(FintechPermission):
    """Permission for firm administrators"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin'],
            audit_required=True
        )


class CFOPermission(FintechPermission):
    """Permission for CFO and financial officers"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin', 'cfo'],
            compliance_required=True,
            audit_required=True
        )


class AccountantPermission(FintechPermission):
    """Permission for accountants"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin', 'cfo', 'accountant'],
            compliance_required=True,
            audit_required=True
        )


class StaffPermission(FintechPermission):
    """Permission for general staff"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin', 'cfo', 'accountant', 'staff']
        )


class FinancialDataPermission(FintechPermission):
    """Permission for financial data access"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin', 'cfo', 'accountant'],
            required_permissions=['view_financial_data'],
            compliance_required=True,
            audit_required=True
        )


class SensitiveDataPermission(FintechPermission):
    """Permission for sensitive data access"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin'],
            required_permissions=['view_sensitive_data'],
            compliance_required=True,
            audit_required=True
        )


class AuditDataPermission(FintechPermission):
    """Permission for audit data access"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin'],
            required_permissions=['view_audit_data'],
            compliance_required=True,
            audit_required=True
        )


class DataExportPermission(FintechPermission):
    """Permission for data export operations"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin'],
            required_permissions=['export_data'],
            compliance_required=True,
            audit_required=True
        )


class DataImportPermission(FintechPermission):
    """Permission for data import operations"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin'],
            required_permissions=['import_data'],
            compliance_required=True,
            audit_required=True
        )


class UserManagementPermission(FintechPermission):
    """Permission for user management operations"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin', 'firm_admin'],
            required_permissions=['manage_users'],
            audit_required=True
        )


class SystemConfigurationPermission(FintechPermission):
    """Permission for system configuration"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin'],
            required_permissions=['configure_system'],
            audit_required=True
        )


class CompliancePermission(FintechPermission):
    """Permission for compliance operations"""
    
    def __init__(self):
        super().__init__(
            required_roles=['platform_admin', 'tenant_admin'],
            required_permissions=['manage_compliance'],
            compliance_required=True,
            audit_required=True
        )


class RoleBasedPermission(FintechPermission):
    """
    Flexible role-based permission that can be configured per view.
    """
    
    def __init__(self, roles=None, permissions=None, compliance_required=False, audit_required=False):
        super().__init__(
            required_roles=roles or [],
            required_permissions=permissions or [],
            compliance_required=compliance_required,
            audit_required=audit_required
        )


class DataClassificationPermission(FintechPermission):
    """
    Permission based on data classification level.
    """
    
    def __init__(self, max_classification_level='internal'):
        self.max_classification_level = max_classification_level
        super().__init__(audit_required=True)
    
    def _check_object_permissions(self, request, view, obj):
        """Check if user can access data at this classification level"""
        if not hasattr(obj, 'data_classification'):
            return True
        
        classification_levels = {
            'public': 1,
            'internal': 2,
            'confidential': 3,
            'restricted': 4,
            'top_secret': 5,
        }
        
        user_max_level = classification_levels.get(
            getattr(request.user, 'max_data_classification', 'internal'), 1
        )
        object_level = classification_levels.get(obj.data_classification, 1)
        
        return user_max_level >= object_level


class TimeBasedPermission(FintechPermission):
    """
    Permission that considers time-based access restrictions.
    """
    
    def __init__(self, allowed_hours=None, allowed_days=None):
        self.allowed_hours = allowed_hours or range(24)  # All hours by default
        self.allowed_days = allowed_days or range(7)    # All days by default
        super().__init__(audit_required=True)
    
    def has_permission(self, request, view):
        """Check time-based access"""
        from django.utils import timezone
        
        now = timezone.now()
        current_hour = now.hour
        current_day = now.weekday()
        
        if current_hour not in self.allowed_hours:
            return False
        
        if current_day not in self.allowed_days:
            return False
        
        return super().has_permission(request, view)


class IPBasedPermission(FintechPermission):
    """
    Permission based on IP address restrictions.
    """
    
    def __init__(self, allowed_ips=None, blocked_ips=None):
        self.allowed_ips = allowed_ips or []
        self.blocked_ips = blocked_ips or []
        super().__init__(audit_required=True)
    
    def has_permission(self, request, view):
        """Check IP-based access"""
        client_ip = self._get_client_ip(request)
        
        # Check blocked IPs first
        if self._is_ip_blocked(client_ip):
            return False
        
        # Check allowed IPs if specified
        if self.allowed_ips and not self._is_ip_allowed(client_ip):
            return False
        
        return super().has_permission(request, view)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')
    
    def _is_ip_blocked(self, ip):
        """Check if IP is blocked"""
        return any(self._ip_in_network(ip, blocked) for blocked in self.blocked_ips)
    
    def _is_ip_allowed(self, ip):
        """Check if IP is allowed"""
        return any(self._ip_in_network(ip, allowed) for allowed in self.allowed_ips)
    
    def _ip_in_network(self, ip, network):
        """Check if IP is in network (simplified implementation)"""
        # This is a simplified implementation
        # In production, use proper IP network matching
        return ip == network


class MultiFactorPermission(FintechPermission):
    """
    Permission that requires multi-factor authentication.
    """
    
    def __init__(self):
        super().__init__(audit_required=True)
    
    def has_permission(self, request, view):
        """Check MFA requirements"""
        # Check if user has completed MFA
        if hasattr(request.user, 'mfa_completed'):
            if not request.user.mfa_completed:
                return False
        
        # Check if MFA is required for this session
        if hasattr(request, 'session'):
            mfa_verified = request.session.get('mfa_verified', False)
            if not mfa_verified:
                return False
        
        return super().has_permission(request, view)


class ComplianceAwarePermission(FintechPermission):
    """
    Permission that considers compliance requirements.
    """
    
    def __init__(self, compliance_frameworks=None):
        self.compliance_frameworks = compliance_frameworks or []
        super().__init__(compliance_required=True, audit_required=True)
    
    def _check_compliance(self, request):
        """Check compliance requirements"""
        # Check if user has required compliance training
        if hasattr(request.user, 'compliance_training'):
            user_frameworks = request.user.compliance_training.get('frameworks', [])
            if not all(fw in user_frameworks for fw in self.compliance_frameworks):
                return False
        
        # Check if user is authorized for compliance operations
        if hasattr(request.user, 'compliance_authorized'):
            if not request.user.compliance_authorized:
                return False
        
        return True


# Permission mixins for views
class PermissionMixin:
    """Mixin to add permission checking to views"""
    
    def check_permission(self, permission_class, **kwargs):
        """Check permission with custom parameters"""
        permission = permission_class(**kwargs)
        return permission.has_permission(self.request, self)
    
    def check_object_permission(self, permission_class, obj, **kwargs):
        """Check object permission with custom parameters"""
        permission = permission_class(**kwargs)
        return permission.has_object_permission(self.request, self, obj)


# Utility functions
def get_user_permissions(user):
    """Get all permissions for a user"""
    permissions = []
    
    # Role-based permissions
    role_permissions = get_role_permissions(user.role)
    permissions.extend(role_permissions)
    
    # Specific user permissions
    if hasattr(user, 'permissions'):
        permissions.extend(user.permissions)
    
    # Tenant-specific permissions
    if user.tenant:
        tenant_permissions = get_tenant_permissions(user.tenant)
        permissions.extend(tenant_permissions)
    
    return list(set(permissions))


def get_role_permissions(role):
    """Get permissions for a specific role"""
    role_permission_map = {
        'platform_admin': [
            'view_all_data', 'edit_all_data', 'delete_all_data',
            'manage_users', 'manage_tenants', 'configure_system',
            'view_audit_data', 'export_data', 'import_data',
            'manage_compliance', 'view_sensitive_data'
        ],
        'tenant_admin': [
            'view_tenant_data', 'edit_tenant_data', 'delete_tenant_data',
            'manage_tenant_users', 'configure_tenant',
            'view_tenant_audit_data', 'export_tenant_data',
            'manage_tenant_compliance'
        ],
        'firm_admin': [
            'view_firm_data', 'edit_firm_data', 'delete_firm_data',
            'manage_firm_users', 'view_firm_audit_data',
            'export_firm_data'
        ],
        'cfo': [
            'view_financial_data', 'edit_financial_data',
            'view_financial_audit_data', 'export_financial_data',
            'approve_financial_transactions'
        ],
        'accountant': [
            'view_financial_data', 'edit_financial_data',
            'view_financial_audit_data', 'export_financial_data'
        ],
        'staff': [
            'view_basic_data', 'edit_basic_data'
        ]
    }
    
    return role_permission_map.get(role, [])


def get_tenant_permissions(tenant):
    """Get tenant-specific permissions"""
    permissions = []
    
    # Plan-based permissions
    if tenant.plan == 'enterprise':
        permissions.extend(['advanced_analytics', 'custom_integrations'])
    elif tenant.plan == 'professional':
        permissions.extend(['advanced_analytics'])
    
    # Feature-based permissions
    if 'audit_logging' in tenant.features:
        permissions.append('view_audit_data')
    
    if 'data_export' in tenant.features:
        permissions.append('export_data')
    
    if 'api_access' in tenant.features:
        permissions.append('api_access')
    
    return permissions


def check_data_access_permission(user, data_classification):
    """Check if user can access data at specific classification level"""
    user_max_classification = getattr(user, 'max_data_classification', 'internal')
    
    classification_levels = {
        'public': 1,
        'internal': 2,
        'confidential': 3,
        'restricted': 4,
        'top_secret': 5,
    }
    
    user_level = classification_levels.get(user_max_classification, 2)
    data_level = classification_levels.get(data_classification, 2)
    
    return user_level >= data_level
