"""
Multi-Tenant Implementation Tests
Following the Multi-Tenant Implementation Guide patterns
"""
from django.test import TestCase, Client
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import json

from authentication.models import User
from tenants.models import Tenant
from authentication.utils import detect_user_type, assign_user_to_group, setup_user_groups
from authentication.navigation import TenantNavigation


class MultiTenantUserClassificationTest(TestCase):
    """Test user classification following multi-tenant guide pattern"""
    
    def setUp(self):
        # Create groups
        self.multi_tenant_group, self.tenant_group = setup_user_groups()
        
        # Create test tenant
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            domain='testtenant',
            plan='basic',
            is_active=True
        )
        
        # Create test users
        self.multi_tenant_user = User.objects.create_user(
            username='multitenant',
            email='multitenant@test.com',
            password='testpass123',
            role='platform_admin'
        )
        
        self.tenant_user = User.objects.create_user(
            username='tenantuser',
            email='tenantuser@test.com',
            password='testpass123',
            role='accountant',
            tenant=self.tenant
        )
        
        self.guest_user = None  # Unauthenticated user

    def test_detect_user_type_multi_tenant(self):
        """Test multi-tenant user detection"""
        # Assign user to Multi-Tenant group
        assign_user_to_group(self.multi_tenant_user, 'Multi-Tenant')
        
        user_info = detect_user_type(self.multi_tenant_user, None)
        
        self.assertEqual(user_info['user_type'], 'multi_tenant')
        self.assertEqual(user_info['group'], 'Multi-Tenant')
        self.assertEqual(user_info['role'], 'admin')
        self.assertIn('access_all_tenants', user_info['permissions'])

    def test_detect_user_type_tenant_user(self):
        """Test tenant user detection"""
        # Assign user to Tenant group
        assign_user_to_group(self.tenant_user, 'Tenant')
        
        user_info = detect_user_type(self.tenant_user, self.tenant)
        
        self.assertEqual(user_info['user_type'], 'tenant_user')
        self.assertEqual(user_info['group'], 'Tenant')
        self.assertEqual(user_info['role'], 'user')  # accountant maps to user role
        self.assertIsInstance(user_info['permissions'], list)

    def test_detect_user_type_guest(self):
        """Test guest user detection"""
        user_info = detect_user_type(self.guest_user, None)
        
        self.assertEqual(user_info['user_type'], 'guest')
        self.assertIsNone(user_info['group'])
        self.assertIsNone(user_info['role'])
        self.assertEqual(user_info['permissions'], [])

    def test_user_group_assignment(self):
        """Test user group assignment"""
        # Test Multi-Tenant assignment
        success = assign_user_to_group(self.multi_tenant_user, 'Multi-Tenant')
        self.assertTrue(success)
        self.assertTrue(self.multi_tenant_user.groups.filter(name='Multi-Tenant').exists())
        
        # Test Tenant assignment
        success = assign_user_to_group(self.tenant_user, 'Tenant')
        self.assertTrue(success)
        self.assertTrue(self.tenant_user.groups.filter(name='Tenant').exists())

    def test_invalid_group_assignment(self):
        """Test invalid group assignment"""
        success = assign_user_to_group(self.multi_tenant_user, 'InvalidGroup')
        self.assertFalse(success)


class MultiTenantNavigationTest(TestCase):
    """Test navigation system following multi-tenant guide pattern"""
    
    def setUp(self):
        # Create groups
        self.multi_tenant_group, self.tenant_group = setup_user_groups()
        
        # Create test tenant
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            domain='testtenant',
            plan='basic',
            is_active=True
        )
        
        # Create test users
        self.multi_tenant_user = User.objects.create_user(
            username='multitenant',
            email='multitenant@test.com',
            password='testpass123',
            role='platform_admin'
        )
        assign_user_to_group(self.multi_tenant_user, 'Multi-Tenant')
        
        self.tenant_user = User.objects.create_user(
            username='tenantuser',
            email='tenantuser@test.com',
            password='testpass123',
            role='tenant_admin',
            tenant=self.tenant
        )
        assign_user_to_group(self.tenant_user, 'Tenant')

    def test_multi_tenant_navigation(self):
        """Test multi-tenant user navigation"""
        nav = TenantNavigation(self.multi_tenant_user, None)
        navigation_data = nav.get_user_navigation_data('localhost')
        
        self.assertEqual(navigation_data['user_type'], 'multi_tenant')
        self.assertEqual(navigation_data['group'], 'Multi-Tenant')
        self.assertEqual(navigation_data['role'], 'admin')
        self.assertIsInstance(navigation_data['navigation'], list)
        
        # Check for multi-tenant specific navigation items
        nav_items = navigation_data['navigation']
        nav_labels = [item['label'] for item in nav_items]
        self.assertIn('System Dashboard', nav_labels)
        self.assertIn('All Tenants', nav_labels)

    def test_tenant_user_navigation(self):
        """Test tenant user navigation"""
        nav = TenantNavigation(self.tenant_user, self.tenant)
        navigation_data = nav.get_user_navigation_data('localhost')
        
        self.assertEqual(navigation_data['user_type'], 'tenant_user')
        self.assertEqual(navigation_data['group'], 'Tenant')
        self.assertEqual(navigation_data['role'], 'admin')  # tenant_admin maps to admin
        self.assertIsInstance(navigation_data['navigation'], list)
        
        # Check for tenant-specific navigation items
        nav_items = navigation_data['navigation']
        nav_labels = [item['label'] for item in nav_items]
        self.assertIn('Dashboard', nav_labels)
        self.assertIn('Users', nav_labels)

    def test_guest_navigation(self):
        """Test guest user navigation"""
        nav = TenantNavigation(None, None)
        navigation_data = nav.get_user_navigation_data('localhost')
        
        self.assertEqual(navigation_data['user_type'], 'guest')
        self.assertIsNone(navigation_data['group'])
        self.assertIsNone(navigation_data['role'])
        self.assertIsInstance(navigation_data['navigation'], list)

    def test_navigation_config_validation(self):
        """Test navigation configuration validation"""
        nav = TenantNavigation()
        is_valid, message = nav.validate_navigation_config()
        self.assertTrue(is_valid, f"Navigation config validation failed: {message}")


class MultiTenantAPITest(APITestCase):
    """Test multi-tenant API endpoints following guide pattern"""
    
    def setUp(self):
        # Create groups
        self.multi_tenant_group, self.tenant_group = setup_user_groups()
        
        # Create test tenant
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            domain='testtenant',
            plan='basic',
            is_active=True
        )
        
        # Create test users
        self.multi_tenant_user = User.objects.create_user(
            username='multitenant',
            email='multitenant@test.com',
            password='testpass123',
            role='platform_admin'
        )
        assign_user_to_group(self.multi_tenant_user, 'Multi-Tenant')
        
        self.tenant_user = User.objects.create_user(
            username='tenantuser',
            email='tenantuser@test.com',
            password='testpass123',
            role='accountant',
            tenant=self.tenant
        )
        assign_user_to_group(self.tenant_user, 'Tenant')

    def test_login_with_navigation_data(self):
        """Test login response includes navigation data"""
        url = reverse('login')
        data = {
            'username': 'multitenant@test.com',
            'email': 'multitenant@test.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data)
        self.assertIn('navigation', response.data)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        
        # Check navigation data structure
        navigation = response.data['navigation']
        self.assertIn('user_type', navigation)
        self.assertIn('group', navigation)
        self.assertIn('role', navigation)
        self.assertIn('navigation', navigation)
        self.assertEqual(navigation['user_type'], 'multi_tenant')

    def test_navigation_endpoint(self):
        """Test navigation endpoint"""
        # Login first
        self.client.force_authenticate(user=self.multi_tenant_user)
        
        url = reverse('navigation_data')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user_type', response.data)
        self.assertIn('group', response.data)
        self.assertIn('role', response.data)
        self.assertIn('navigation', response.data)
        self.assertEqual(response.data['user_type'], 'multi_tenant')

    def test_tenant_user_login(self):
        """Test tenant user login with navigation"""
        url = reverse('login')
        data = {
            'username': 'tenantuser@test.com',
            'email': 'tenantuser@test.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('navigation', response.data)
        
        navigation = response.data['navigation']
        self.assertEqual(navigation['user_type'], 'tenant_user')
        self.assertEqual(navigation['group'], 'Tenant')

    def test_unauthorized_navigation_access(self):
        """Test navigation endpoint requires authentication"""
        url = reverse('navigation_data')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MultiTenantIntegrationTest(APITestCase):
    """Integration tests for multi-tenant functionality"""
    
    def setUp(self):
        # Create groups
        self.multi_tenant_group, self.tenant_group = setup_user_groups()
        
        # Create test tenant
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            domain='testtenant',
            plan='basic',
            is_active=True
        )

    def test_complete_user_registration_flow(self):
        """Test complete user registration with group assignment"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'testpass123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'accountant',
            'tenant': self.tenant.id
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('success', response.data)
        self.assertIn('navigation', response.data)
        
        # Check user was created and assigned to group
        user = User.objects.get(email='newuser@test.com')
        self.assertTrue(user.groups.filter(name='Tenant').exists())
        
        # Check navigation data
        navigation = response.data['navigation']
        self.assertEqual(navigation['user_type'], 'tenant_user')
        self.assertEqual(navigation['group'], 'Tenant')

    def test_multi_tenant_user_creation(self):
        """Test multi-tenant user creation"""
        url = reverse('register')
        data = {
            'username': 'multitenantuser',
            'email': 'multitenantuser@test.com',
            'password': 'testpass123',
            'first_name': 'Multi',
            'last_name': 'Tenant',
            'role': 'platform_admin'
            # No tenant specified for multi-tenant user
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check user was created and assigned to group
        user = User.objects.get(email='multitenantuser@test.com')
        self.assertTrue(user.groups.filter(name='Multi-Tenant').exists())
        
        # Check navigation data
        navigation = response.data['navigation']
        self.assertEqual(navigation['user_type'], 'multi_tenant')
        self.assertEqual(navigation['group'], 'Multi-Tenant')
