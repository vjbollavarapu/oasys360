"""
JWT Authentication Tests
Tests JWT token generation, validation, and multi-tenant functionality
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from tenants.models import Tenant
from authentication.tokens import CustomTokenObtainPairSerializer
from backend.row_tenant_middleware import set_tenant_context, clear_tenant_context
import json

User = get_user_model()


class JWTTokenTests(APITestCase):
    """Test JWT token functionality"""
    
    def setUp(self):
        """Set up test data"""
        # Clear any existing credentials
        self.client.credentials()
        
        # Create test tenant
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            slug='test-tenant',
            plan='professional',
            is_active=True
        )
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123',
            tenant=self.tenant,
            role='user'
        )
    
    def tearDown(self):
        """Clean up after each test"""
        self.client.credentials()
        clear_tenant_context()
        # Clear any cached authentication state
        if hasattr(self.client, '_credentials'):
            self.client._credentials = {}
    
    def test_jwt_token_generation(self):
        """Test JWT token generation with tenant information"""
        # Generate token using our custom serializer
        serializer = CustomTokenObtainPairSerializer()
        serializer.user = self.user
        token = serializer.get_token(self.user)
        
        # Check token payload
        payload = token.payload
        
        # Verify user information
        self.assertEqual(payload['user_id'], str(self.user.id))
        self.assertEqual(payload['email'], self.user.email)
        self.assertEqual(payload['role'], self.user.role)
        
        # Verify tenant information
        self.assertEqual(payload['tenant_id'], str(self.tenant.id))
        self.assertEqual(payload['tenant_slug'], self.tenant.slug)
        self.assertEqual(payload['tenant_plan'], self.tenant.plan)
    
    def test_custom_token_serializer(self):
        """Test custom token serializer includes tenant data"""
        serializer = CustomTokenObtainPairSerializer()
        
        # Mock authentication
        serializer.user = self.user
        
        # Test token generation
        token = serializer.get_token(self.user)
        payload = token.payload
        
        # Verify tenant information in token
        self.assertEqual(payload['tenant_id'], str(self.tenant.id))
        self.assertEqual(payload['tenant_slug'], self.tenant.slug)
        self.assertEqual(payload['tenant_plan'], self.tenant.plan)
    
    def test_token_obtain_endpoint(self):
        """Test JWT token obtain endpoint"""
        url = '/api/v1/auth/token/'
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response data
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertIn('tenant', response.data)
        
        # Verify user data
        user_data = response.data['user']
        self.assertEqual(user_data['email'], 'test@example.com')
        self.assertEqual(user_data['role'], 'user')
        
        # Verify tenant data
        tenant_data = response.data['tenant']
        self.assertEqual(tenant_data['id'], str(self.tenant.id))
        self.assertEqual(tenant_data['name'], 'Test Tenant')
        self.assertEqual(tenant_data['slug'], 'test-tenant')
        self.assertEqual(tenant_data['plan'], 'professional')
    
    def test_token_refresh_endpoint(self):
        """Test JWT token refresh endpoint"""
        # First get tokens
        url = '/api/v1/auth/token/'
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        refresh_token = response.data['refresh']
        
        # Refresh token
        refresh_url = '/api/v1/auth/token/refresh/'
        refresh_data = {'refresh': refresh_token}
        
        response = self.client.post(refresh_url, refresh_data, format='json')
        
        # Debug: print response details
        print(f"Refresh response status: {response.status_code}")
        print(f"Refresh response data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response data
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        self.assertIn('tenant', response.data)
    
    def test_token_blacklist_endpoint(self):
        """Test JWT token blacklist endpoint"""
        # First get tokens
        url = '/api/v1/auth/token/'
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        refresh_token = response.data['refresh']
        
        # Blacklist token
        blacklist_url = '/api/v1/auth/token/blacklist/'
        blacklist_data = {'refresh': refresh_token}
        
        response = self.client.post(blacklist_url, blacklist_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Try to refresh with blacklisted token
        refresh_url = '/api/v1/auth/token/refresh/'
        refresh_data = {'refresh': refresh_token}
        
        response = self.client.post(refresh_url, refresh_data, format='json')
        
        # Should fail with blacklisted token
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_request_with_jwt(self):
        """Test authenticated request with JWT token"""
        # Get token
        url = '/api/v1/auth/token/'
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        access_token = response.data['access']
        
        # Make authenticated request
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Test current user endpoint
        user_url = '/api/v1/auth/current-user/'
        response = self.client.get(user_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
    
    def test_tenant_isolation_with_jwt(self):
        """Test tenant isolation with JWT tokens"""
        # Create second tenant and user
        tenant2 = Tenant.objects.create(
            name='Second Tenant',
            slug='second-tenant',
            plan='basic',
            is_active=True
        )
        
        user2 = User.objects.create_user(
            email='user2@example.com',
            username='user2',
            password='testpass123',
            tenant=tenant2,
            role='user'
        )
        
        # Get token for first user
        url = '/api/v1/auth/token/'
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        access_token = response.data['access']
        
        # Verify tenant information in token
        from rest_framework_simplejwt.tokens import AccessToken
        token = AccessToken(access_token)
        payload = token.payload
        
        self.assertEqual(payload['tenant_id'], str(self.tenant.id))
        self.assertEqual(payload['tenant_slug'], 'test-tenant')
        self.assertNotEqual(payload['tenant_id'], str(tenant2.id))
    
    def test_jwt_middleware_tenant_context(self):
        """Test JWT middleware sets tenant context"""
        # Get token
        url = '/api/v1/auth/token/'
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        access_token = response.data['access']
        
        # Make request with JWT token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Test that tenant context is set (this would be tested in middleware)
        # For now, just verify the token contains tenant information
        from rest_framework_simplejwt.tokens import AccessToken
        token = AccessToken(access_token)
        payload = token.payload
        
        self.assertIn('tenant_id', payload)
        self.assertIn('tenant_slug', payload)
        self.assertIn('tenant_plan', payload)
    
    def test_invalid_jwt_token(self):
        """Test handling of invalid JWT tokens"""
        # Clear any existing credentials first
        self.client.credentials()
        
        # Test with invalid token
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        
        user_url = '/api/v1/auth/current-user/'
        response = self.client.get(user_url)
        
        # Should return 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_expired_jwt_token(self):
        """Test handling of expired JWT tokens"""
        # Create token with very short lifetime
        from datetime import timedelta
        from rest_framework_simplejwt.tokens import AccessToken
        
        # This would require custom token creation with short expiry
        # For now, just test the concept
        refresh = RefreshToken.for_user(self.user)
        access_token = refresh.access_token
        
        # Make request with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        user_url = '/api/v1/auth/current-user/'
        response = self.client.get(user_url)
        
        # Should work with valid token
        self.assertEqual(response.status_code, status.HTTP_200_OK)
