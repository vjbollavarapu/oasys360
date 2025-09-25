"""
Multi-Tenant User Classification Utilities
Following the Multi-Tenant Implementation Guide patterns
"""
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

User = get_user_model()


def detect_user_type(user, tenant=None):
    """
    Detect user type based on Django Groups
    Following the guide's user classification pattern
    """
    if not user or not user.is_authenticated:
        return {
            'user_type': 'guest', 
            'group': None,
            'role': None,
            'permissions': []
        }
    
    # Check Multi-Tenant group first
    if user.groups.filter(name='Multi-Tenant').exists():
        return {
            'user_type': 'multi_tenant',
            'group': 'Multi-Tenant',
            'role': 'admin',
            'permissions': ['access_all_tenants', 'system_admin']
        }
    
    # Check Tenant group
    if user.groups.filter(name='Tenant').exists() and tenant:
        # Determine role based on user's role field
        role_mapping = {
            'platform_admin': 'admin',
            'tenant_admin': 'admin',
            'firm_admin': 'admin',
            'cfo': 'manager',
            'accountant': 'user',
            'staff': 'user'
        }
        
        role = role_mapping.get(user.role, 'user')
        
        return {
            'user_type': 'tenant_user',
            'group': 'Tenant',
            'role': role,
            'permissions': user.permissions or []
        }
    
    return {
        'user_type': 'guest',
        'group': None,
        'role': None,
        'permissions': []
    }


def setup_user_groups():
    """
    Create the required Django Groups for multi-tenant classification
    """
    multi_tenant_group, created = Group.objects.get_or_create(name='Multi-Tenant')
    if created:
        print("Created Multi-Tenant group")
    
    tenant_group, created = Group.objects.get_or_create(name='Tenant')
    if created:
        print("Created Tenant group")
    
    return multi_tenant_group, tenant_group


def assign_user_to_group(user, group_name):
    """
    Assign user to appropriate group based on their role
    """
    try:
        group = Group.objects.get(name=group_name)
        user.groups.add(group)
        return True
    except Group.DoesNotExist:
        return False


def get_user_group(user):
    """
    Get the primary group for a user
    """
    if user.groups.filter(name='Multi-Tenant').exists():
        return 'Multi-Tenant'
    elif user.groups.filter(name='Tenant').exists():
        return 'Tenant'
    return None


def is_multi_tenant_user(user):
    """
    Check if user is a multi-tenant user
    """
    return user.groups.filter(name='Multi-Tenant').exists()


def is_tenant_user(user):
    """
    Check if user is a tenant user
    """
    return user.groups.filter(name='Tenant').exists()


def get_user_permissions(user, tenant=None):
    """
    Get user permissions based on their type and role
    """
    user_info = detect_user_type(user, tenant)
    
    if user_info['user_type'] == 'multi_tenant':
        return [
            'access_all_tenants',
            'system_admin',
            'create_tenants',
            'manage_users',
            'view_all_data'
        ]
    elif user_info['user_type'] == 'tenant_user':
        role_permissions = {
            'admin': [
                'manage_tenant_users',
                'view_tenant_data',
                'manage_tenant_settings',
                'view_reports'
            ],
            'manager': [
                'view_tenant_data',
                'manage_limited_users',
                'view_reports'
            ],
            'user': [
                'view_own_data',
                'update_own_profile'
            ]
        }
        return role_permissions.get(user_info['role'], [])
    
    return []
