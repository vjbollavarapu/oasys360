"""
Multi-Tenant Navigation System
Following the Multi-Tenant Implementation Guide patterns
"""
import json
import os
from django.conf import settings
from .utils import detect_user_type


class TenantNavigation:
    """
    Navigation system for multi-tenant application
    Following the guide's navigation pattern
    """
    
    def __init__(self, user=None, tenant=None):
        self.user = user
        self.tenant = tenant
        self.config = self._load_config()
    
    def _load_config(self):
        """
        Load navigation configuration from JSON file
        """
        try:
            config_path = os.path.join(settings.BASE_DIR, 'navigation_config.json')
            with open(config_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading navigation config: {e}")
            return {}
    
    def get_navigation_by_domain_and_role(self, domain, role=None):
        """
        Get navigation items based on domain and user role
        Following the guide's navigation logic pattern
        """
        try:
            # Check user groups first (following guide pattern)
            multi_tenant_group = self.user.groups.filter(name='Multi-Tenant').first()
            tenant_group = self.user.groups.filter(name='Tenant').first()
            
            if multi_tenant_group:
                # Multi-tenant users get multi-tenant navigation
                return self.config.get('multi_tenant_navigation', {}).get('admin', [])
            elif tenant_group and self.tenant:
                # Tenant users get role-based navigation
                return self.config.get('tenant_navigation', {}).get(role, [])
            else:
                # Public navigation for unauthenticated users
                return self.config.get('public_navigation', {}).get('main', [])
                
        except Exception as e:
            print(f"Error getting navigation: {e}")
            return []
    
    def get_navigation_for_user(self, domain=None):
        """
        Get navigation for current user
        """
        if not self.user or not self.user.is_authenticated:
            return self.config.get('public_navigation', {}).get('main', [])
        
        # Detect user type and role
        user_info = detect_user_type(self.user, self.tenant)
        role = user_info.get('role', 'user')
        
        return self.get_navigation_by_domain_and_role(domain, role)
    
    def get_user_navigation_data(self, domain=None):
        """
        Get complete navigation data for user
        Following the guide's API response pattern
        """
        try:
            user_info = detect_user_type(self.user, self.tenant)
            navigation_items = self.get_navigation_for_user(domain)
            
            return {
                'role': user_info.get('role'),
                'navigation': navigation_items,
                'domain': domain,
                'user_type': user_info.get('user_type'),
                'group': user_info.get('group'),
                'permissions': user_info.get('permissions', [])
            }
        except Exception as e:
            print(f"Error getting navigation data: {e}")
            return {
                'role': None,
                'navigation': [],
                'domain': domain,
                'user_type': 'unknown',
                'group': None,
                'permissions': []
            }
    
    def get_public_navigation(self):
        """
        Get public navigation for unauthenticated users
        """
        return self.config.get('public_navigation', {}).get('main', [])
    
    def get_multi_tenant_navigation(self, role='admin'):
        """
        Get multi-tenant navigation
        """
        return self.config.get('multi_tenant_navigation', {}).get(role, [])
    
    def get_tenant_navigation(self, role='user'):
        """
        Get tenant-specific navigation
        """
        return self.config.get('tenant_navigation', {}).get(role, [])
    
    def validate_navigation_config(self):
        """
        Validate navigation configuration
        """
        required_sections = ['public_navigation', 'multi_tenant_navigation', 'tenant_navigation']
        
        for section in required_sections:
            if section not in self.config:
                return False, f"Missing section: {section}"
        
        return True, "Configuration is valid"
