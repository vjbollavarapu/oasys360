"""
Unit tests for tenants app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, datetime
import uuid

from .models import Tenant, Company, TenantInvitation
from authentication.models import User

User = get_user_model()


class TenantModelTest(TestCase):
    """Test Tenant model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True,
            plan='basic',
            max_users=10,
            max_storage_gb=100
        )
    
    def test_tenant_creation(self):
        """Test tenant creation with required fields"""
        self.assertEqual(self.tenant.name, 'Test Tenant')
        self.assertTrue(self.tenant.is_active)
        self.assertEqual(self.tenant.plan, 'basic')
        self.assertEqual(self.tenant.max_users, 10)
    
    def test_tenant_str_representation(self):
        """Test tenant string representation"""
        self.assertEqual(str(self.tenant), 'Test Tenant')
    
    def test_tenant_plan_display(self):
        """Test tenant plan display"""
        self.assertEqual(self.tenant.get_plan_display(), 'Basic')
    
    def test_tenant_user_count(self):
        """Test tenant user count"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            tenant=self.tenant
        )
        self.assertEqual(self.tenant.user_count, 1)


class CompanyModelTest(TestCase):
    """Test Company model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True
        )
        self.company = Company.objects.create(
            tenant=self.tenant,
            name='Test Company',
            registration_number='123456789',
            tax_number='TAX123456',
            address='123 Test St',
            city='Test City',
            country='Test Country',
            phone='+1234567890',
            email='company@test.com',
            website='https://test.com',
            industry='Technology',
            is_active=True
        )
    
    def test_company_creation(self):
        """Test company creation with required fields"""
        self.assertEqual(self.company.name, 'Test Company')
        self.assertEqual(self.company.registration_number, '123456789')
        self.assertEqual(self.company.tenant, self.tenant)
        self.assertTrue(self.company.is_active)
    
    def test_company_str_representation(self):
        """Test company string representation"""
        self.assertEqual(str(self.company), 'Test Company')
    
    def test_company_industry_display(self):
        """Test company industry display"""
        self.assertEqual(self.company.get_industry_display(), 'Technology')


class TenantInvitationModelTest(TestCase):
    """Test TenantInvitation model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True
        )
        self.invitation = TenantInvitation.objects.create(
            tenant=self.tenant,
            email='invite@example.com',
            role='accountant',
            token='test-token-123',
            expires_at=datetime.now()
        )
    
    def test_invitation_creation(self):
        """Test invitation creation"""
        self.assertEqual(self.invitation.email, 'invite@example.com')
        self.assertEqual(self.invitation.role, 'accountant')
        self.assertEqual(self.invitation.token, 'test-token-123')
        self.assertFalse(self.invitation.is_accepted)
    
    def test_invitation_str_representation(self):
        """Test invitation string representation"""
        self.assertEqual(str(self.invitation), 'invite@example.com - Test Tenant')


class TenantsAPITest(APITestCase):
    """Test tenants APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True,
            plan='basic'
        )
        self.company = Company.objects.create(
            tenant=self.tenant,
            name='Test Company',
            registration_number='123456789',
            is_active=True
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            tenant=self.tenant,
            role='firm_admin'
        )
    
    def test_tenant_list(self):
        """Test listing tenants"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:tenant_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_tenant_detail(self):
        """Test retrieving tenant detail"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:tenant_detail', kwargs={'pk': self.tenant.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Tenant')
    
    def test_tenant_update(self):
        """Test updating tenant"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:tenant_detail', kwargs={'pk': self.tenant.pk})
        data = {
            'name': 'Updated Tenant',
            'plan': 'premium'
        }
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Tenant')
        self.assertEqual(response.data['plan'], 'premium')
    
    def test_tenant_dashboard(self):
        """Test tenant dashboard"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:dashboard')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tenant', response.data)
        self.assertIn('company', response.data)
        self.assertIn('stats', response.data)
    
    def test_company_list(self):
        """Test listing companies"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:company_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_company_detail(self):
        """Test retrieving company detail"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:company_detail', kwargs={'pk': self.company.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Company')
    
    def test_company_create(self):
        """Test creating new company"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:company_list')
        data = {
            'name': 'New Company',
            'registration_number': '987654321',
            'tax_number': 'TAX987654',
            'address': '456 New St',
            'city': 'New City',
            'country': 'New Country',
            'phone': '+9876543210',
            'email': 'new@company.com',
            'industry': 'Finance'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Company')
    
    def test_tenant_invitation_create(self):
        """Test creating tenant invitation"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:invitation_list')
        data = {
            'email': 'invite@example.com',
            'role': 'accountant',
            'message': 'Welcome to our platform!'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'invite@example.com')
    
    def test_tenant_invitation_list(self):
        """Test listing tenant invitations"""
        invitation = TenantInvitation.objects.create(
            tenant=self.tenant,
            email='invite@example.com',
            role='accountant',
            token='test-token-123',
            expires_at=datetime.now()
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:invitation_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_tenant_stats(self):
        """Test tenant statistics"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tenants:tenant_stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('total_companies', response.data)
        self.assertIn('total_invitations', response.data)


class TenantPermissionTest(APITestCase):
    """Test tenant permissions"""
    
    def setUp(self):
        self.client = APIClient()
        self.tenant1 = Tenant.objects.create(
            name='Tenant 1',
            schema_name='tenant1',
            is_active=True
        )
        self.tenant2 = Tenant.objects.create(
            name='Tenant 2',
            schema_name='tenant2',
            is_active=True
        )
        
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@tenant1.com',
            password='pass123',
            tenant=self.tenant1,
            role='firm_admin'
        )
        
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@tenant2.com',
            password='pass123',
            tenant=self.tenant2,
            role='firm_admin'
        )
        
        self.company1 = Company.objects.create(
            tenant=self.tenant1,
            name='Company 1',
            registration_number='123456789'
        )
        
        self.company2 = Company.objects.create(
            tenant=self.tenant2,
            name='Company 2',
            registration_number='987654321'
        )
    
    def test_tenant_isolation(self):
        """Test that users can only access their own tenant data"""
        # User1 should only see Tenant1 data
        self.client.force_authenticate(user=self.user1)
        url = reverse('tenants:tenant_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Tenant 1')
        
        # User1 should not be able to access Tenant2 data
        url = reverse('tenants:tenant_detail', kwargs={'pk': self.tenant2.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_company_isolation(self):
        """Test that users can only access their own company data"""
        # User1 should only see Company1 data
        self.client.force_authenticate(user=self.user1)
        url = reverse('tenants:company_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Company 1')
        
        # User1 should not be able to access Company2 data
        url = reverse('tenants:company_detail', kwargs={'pk': self.company2.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
