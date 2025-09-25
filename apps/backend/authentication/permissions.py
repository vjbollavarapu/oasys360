from rest_framework import permissions
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


class IsTenantMember(permissions.BasePermission):
    """
    Permission to check if user is a member of the tenant
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tenant is not None


class IsTenantAdmin(permissions.BasePermission):
    """
    Permission to check if user is a tenant admin
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.tenant is not None and
            request.user.role in ['tenant_admin', 'platform_admin']
        )


class IsFirmAdmin(permissions.BasePermission):
    """
    Permission to check if user is a firm admin
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.tenant is not None and
            request.user.role in ['firm_admin', 'tenant_admin', 'platform_admin']
        )


class IsCFO(permissions.BasePermission):
    """
    Permission to check if user is a CFO or higher
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.tenant is not None and
            request.user.role in ['cfo', 'firm_admin', 'tenant_admin', 'platform_admin']
        )


class IsAccountant(permissions.BasePermission):
    """
    Permission to check if user is an accountant or higher
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.tenant is not None and
            request.user.role in ['accountant', 'cfo', 'firm_admin', 'tenant_admin', 'platform_admin']
        )


class IsPlatformAdmin(permissions.BasePermission):
    """
    Permission to check if user is a platform admin
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'platform_admin'
        )


class TenantObjectPermission(permissions.BasePermission):
    """
    Permission to check if user has access to a specific tenant object
    """
    def has_object_permission(self, request, view, obj):
        # Check if object has tenant attribute
        if hasattr(obj, 'tenant'):
            return obj.tenant == request.user.tenant
        
        # Check if object has company attribute with tenant
        if hasattr(obj, 'company') and hasattr(obj.company, 'tenant'):
            return obj.company.tenant == request.user.tenant
        
        # Check if object is a user
        if isinstance(obj, request.user.__class__):
            return obj.tenant == request.user.tenant
        
        return False


class RoleBasedPermission(permissions.BasePermission):
    """
    Permission based on user role and required permissions
    """
    def __init__(self, required_roles=None, required_permissions=None):
        self.required_roles = required_roles or []
        self.required_permissions = required_permissions or []
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check role-based access
        if self.required_roles and request.user.role not in self.required_roles:
            return False
        
        # Check specific permissions
        if self.required_permissions:
            user_permissions = request.user.permissions or []
            if not all(perm in user_permissions for perm in self.required_permissions):
                return False
        
        return True


class TenantResourcePermission(permissions.BasePermission):
    """
    Permission for tenant-specific resources
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.tenant is not None
        )
    
    def has_object_permission(self, request, view, obj):
        # Check if object belongs to the same tenant
        if hasattr(obj, 'tenant'):
            return obj.tenant == request.user.tenant
        
        # Check if object has a company that belongs to the tenant
        if hasattr(obj, 'company'):
            return obj.company.tenant == request.user.tenant
        
        # Check if object is a user
        if isinstance(obj, request.user.__class__):
            return obj.tenant == request.user.tenant
        
        return False


class ReadOnlyPermission(permissions.BasePermission):
    """
    Permission that allows read-only access
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.method in permissions.SAFE_METHODS


class CreateOnlyPermission(permissions.BasePermission):
    """
    Permission that allows only creation
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.method == 'POST'


class UpdateOnlyPermission(permissions.BasePermission):
    """
    Permission that allows only updates
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.method in ['PUT', 'PATCH']


class DeleteOnlyPermission(permissions.BasePermission):
    """
    Permission that allows only deletion
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.method == 'DELETE'
