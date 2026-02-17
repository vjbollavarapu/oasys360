"""
Example Usage of Tenant Context Middleware
Demonstrates how to use the tenant context middleware for automatic tenant filtering.
"""

from django.db import models
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action
from backend.tenant_base_model import TenantBaseModel, FinancialModel, CompanyScopedModel, UserScopedModel
from backend.row_tenant_middleware import get_current_tenant, get_current_user, require_tenant_context, filter_by_tenant

User = get_user_model()


# Example models using the new base models
class BankAccount(FinancialModel):
    """
    Example bank account model using FinancialModel base class.
    Automatically applies tenant filtering and includes financial compliance features.
    """
    
    account_number = models.CharField(max_length=50)
    routing_number = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    bank_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50, choices=[
        ('checking', 'Checking'),
        ('savings', 'Savings'),
        ('money_market', 'Money Market'),
    ])
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'bank_accounts'
        verbose_name = 'Bank Account'
        verbose_name_plural = 'Bank Accounts'
        indexes = [
            models.Index(fields=['tenant', 'account_number']),
            models.Index(fields=['tenant', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class CompanyDocument(CompanyScopedModel):
    """
    Example company document model using CompanyScopedModel base class.
    Automatically filtered by company (and therefore tenant).
    """
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    document_type = models.CharField(max_length=50, choices=[
        ('contract', 'Contract'),
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('statement', 'Statement'),
    ])
    file_path = models.CharField(max_length=500, blank=True)
    
    class Meta:
        db_table = 'company_documents'
        verbose_name = 'Company Document'
        verbose_name_plural = 'Company Documents'
    
    def __str__(self):
        return f"{self.title} ({self.document_type})"


class UserPreference(UserScopedModel):
    """
    Example user preference model using UserScopedModel base class.
    Automatically filtered by user (and therefore tenant).
    """
    
    setting_name = models.CharField(max_length=100)
    setting_value = models.TextField()
    setting_type = models.CharField(max_length=20, choices=[
        ('string', 'String'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
    ], default='string')
    
    class Meta:
        db_table = 'user_preferences'
        verbose_name = 'User Preference'
        verbose_name_plural = 'User Preferences'
        unique_together = ['user', 'setting_name']
    
    def __str__(self):
        return f"{self.setting_name} = {self.setting_value}"


# Example views using tenant context middleware
def example_view_usage():
    """
    Example of how to use the tenant context middleware in views.
    """
    
    def list_bank_accounts(request):
        """List bank accounts for current tenant"""
        # Automatic tenant filtering - no need to manually filter
        accounts = BankAccount.objects.all()  # Automatically filtered by tenant
        
        data = [
            {
                'id': str(account.id),
                'account_number': account.account_number,
                'balance': float(account.balance),
                'bank_name': account.bank_name,
                'account_type': account.account_type,
                'is_active': account.is_active,
            }
            for account in accounts
        ]
        
        return JsonResponse({'accounts': data})
    
    def get_bank_account(request, account_id):
        """Get specific bank account"""
        try:
            # Automatic tenant filtering - will only return accounts for current tenant
            account = BankAccount.objects.get(id=account_id)
            
            # Additional security check (redundant but good practice)
            # Account is already filtered by tenant through the base model
            
            data = {
                'id': str(account.id),
                'account_number': account.account_number,
                'balance': float(account.balance),
                'bank_name': account.bank_name,
                'account_type': account.account_type,
                'is_active': account.is_active,
            }
            
            return JsonResponse({'account': data})
            
        except BankAccount.DoesNotExist:
            return JsonResponse({'error': 'Account not found'}, status=404)
    
    def create_bank_account(request):
        """Create new bank account"""
        if request.method == 'POST':
            data = request.json
            
            # Create account - tenant is automatically assigned
            account = BankAccount.objects.create(
                account_number=data['account_number'],
                routing_number=data['routing_number'],
                balance=data['balance'],
                bank_name=data['bank_name'],
                account_type=data.get('account_type', 'checking'),
            )
            
            return JsonResponse({
                'id': str(account.id),
                'message': 'Account created successfully'
            })
        
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    def list_company_documents(request):
        """List company documents for current tenant"""
        # Automatic tenant filtering through company relationship
        documents = CompanyDocument.objects.all()
        
        data = [
            {
                'id': str(doc.id),
                'title': doc.title,
                'document_type': doc.document_type,
                'file_path': doc.file_path,
                'created_at': doc.created_at.isoformat(),
            }
            for doc in documents
        ]
        
        return JsonResponse({'documents': data})
    
    def list_user_preferences(request):
        """List user preferences for current tenant"""
        # Automatic tenant filtering through user relationship
        preferences = UserPreference.objects.all()
        
        data = [
            {
                'id': str(pref.id),
                'setting_name': pref.setting_name,
                'setting_value': pref.setting_value,
                'setting_type': pref.setting_type,
            }
            for pref in preferences
        ]
        
        return JsonResponse({'preferences': data})


# Example serializers using tenant context middleware
def example_serializer_usage():
    """
    Example of how to use the tenant context middleware in serializers.
    """
    
    class BankAccountSerializer(serializers.ModelSerializer):
        """Serializer for bank accounts"""
        
        class Meta:
            model = BankAccount
            fields = [
                'id', 'account_number', 'routing_number', 'balance',
                'bank_name', 'account_type', 'is_active', 'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']
        
        def create(self, validated_data):
            """Create bank account with automatic tenant assignment"""
            # Tenant is automatically assigned by the model
            return BankAccount.objects.create(**validated_data)
        
        def update(self, instance, validated_data):
            """Update bank account with automatic tenant validation"""
            # Tenant access is automatically validated by the model
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
    
    class CompanyDocumentSerializer(serializers.ModelSerializer):
        """Serializer for company documents"""
        
        class Meta:
            model = CompanyDocument
            fields = [
                'id', 'title', 'content', 'document_type', 'file_path',
                'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']
    
    class UserPreferenceSerializer(serializers.ModelSerializer):
        """Serializer for user preferences"""
        
        class Meta:
            model = UserPreference
            fields = [
                'id', 'setting_name', 'setting_value', 'setting_type',
                'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']


# Example viewsets using tenant context middleware
def example_viewset_usage():
    """
    Example of how to use the tenant context middleware in viewsets.
    """
    
    class BankAccountViewSet(viewsets.ModelViewSet):
        """ViewSet for bank accounts with automatic tenant filtering"""
        
        serializer_class = BankAccountSerializer
        permission_classes = [permissions.IsAuthenticated]
        
        def get_queryset(self):
            """Get queryset with automatic tenant filtering"""
            # Automatic tenant filtering - no need to manually filter
            return BankAccount.objects.all()
        
        def perform_create(self, serializer):
            """Create bank account with automatic tenant assignment"""
            # Tenant is automatically assigned by the model
            serializer.save()
        
        def perform_update(self, serializer):
            """Update bank account with automatic tenant validation"""
            # Tenant access is automatically validated by the model
            serializer.save()
        
        @action(detail=False, methods=['get'])
        def active_accounts(self, request):
            """Get active bank accounts for current tenant"""
            accounts = self.get_queryset().filter(is_active=True)
            serializer = self.get_serializer(accounts, many=True)
            return JsonResponse({'accounts': serializer.data})
        
        @action(detail=True, methods=['post'])
        def deactivate(self, request, pk=None):
            """Deactivate bank account"""
            account = self.get_object()
            account.is_active = False
            account.save()
            return JsonResponse({'message': 'Account deactivated'})
    
    class CompanyDocumentViewSet(viewsets.ModelViewSet):
        """ViewSet for company documents with automatic tenant filtering"""
        
        serializer_class = CompanyDocumentSerializer
        permission_classes = [permissions.IsAuthenticated]
        
        def get_queryset(self):
            """Get queryset with automatic tenant filtering"""
            return CompanyDocument.objects.all()
        
        def perform_create(self, serializer):
            """Create document with automatic tenant assignment"""
            serializer.save()
        
        @action(detail=False, methods=['get'])
        def by_type(self, request):
            """Get documents by type for current tenant"""
            doc_type = request.query_params.get('type')
            if doc_type:
                documents = self.get_queryset().filter(document_type=doc_type)
            else:
                documents = self.get_queryset()
            
            serializer = self.get_serializer(documents, many=True)
            return JsonResponse({'documents': serializer.data})
    
    class UserPreferenceViewSet(viewsets.ModelViewSet):
        """ViewSet for user preferences with automatic tenant filtering"""
        
        serializer_class = UserPreferenceSerializer
        permission_classes = [permissions.IsAuthenticated]
        
        def get_queryset(self):
            """Get queryset with automatic tenant filtering"""
            return UserPreference.objects.all()
        
        def perform_create(self, serializer):
            """Create preference with automatic tenant assignment"""
            serializer.save()
        
        @action(detail=False, methods=['get'])
        def by_name(self, request):
            """Get preference by name for current tenant"""
            setting_name = request.query_params.get('name')
            if setting_name:
                preferences = self.get_queryset().filter(setting_name=setting_name)
            else:
                preferences = self.get_queryset()
            
            serializer = self.get_serializer(preferences, many=True)
            return JsonResponse({'preferences': serializer.data})


# Example tests using tenant context middleware
def example_test_usage():
    """
    Example of how to test the tenant context middleware.
    """
    from django.test import TestCase
    from django.contrib.auth import get_user_model
    from tenants.models import Tenant, Company
    from unittest.mock import patch
    
    User = get_user_model()
    
    class TenantContextTestCase(TestCase):
        """Test case for tenant context middleware"""
        
        def setUp(self):
            """Set up test data"""
            self.tenant = Tenant.objects.create(
                schema_name='test_tenant',
                name='Test Tenant'
            )
            
            self.company = Company.objects.create(
                tenant=self.tenant,
                name='Test Company'
            )
            
            self.user = User.objects.create_user(
                email='test@example.com',
                username='testuser',
                password='testpass123',
                tenant=self.tenant
            )
        
        def test_tenant_filtering(self):
            """Test that queries are automatically filtered by tenant"""
            # Create accounts for different tenants
            tenant2 = Tenant.objects.create(
                schema_name='test_tenant_2',
                name='Test Tenant 2'
            )
            
            # Create account for current tenant
            account1 = BankAccount.objects.create(
                tenant=self.tenant,
                account_number='123456',
                balance=1000.00,
                bank_name='Test Bank'
            )
            
            # Create account for different tenant
            account2 = BankAccount.objects.create(
                tenant=tenant2,
                account_number='789012',
                balance=2000.00,
                bank_name='Test Bank 2'
            )
            
            # Test automatic tenant filtering
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
                accounts = BankAccount.objects.all()
                self.assertEqual(accounts.count(), 1)
                self.assertEqual(accounts.first(), account1)
        
        def test_automatic_tenant_assignment(self):
            """Test that tenant is automatically assigned"""
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
                account = BankAccount.objects.create(
                    account_number='123456',
                    balance=1000.00,
                    bank_name='Test Bank'
                )
                
                self.assertEqual(account.tenant, self.tenant)
        
        def test_company_scoped_model(self):
            """Test company-scoped model"""
            document = CompanyDocument.objects.create(
                company=self.company,
                title='Test Document',
                content='Test content',
                document_type='contract'
            )
            
            # Should be automatically filtered by company
            documents = CompanyDocument.objects.all()
            self.assertEqual(documents.count(), 1)
            self.assertEqual(documents.first(), document)
        
        def test_user_scoped_model(self):
            """Test user-scoped model"""
            preference = UserPreference.objects.create(
                user=self.user,
                setting_name='theme',
                setting_value='dark',
                setting_type='string'
            )
            
            # Should be automatically filtered by user
            preferences = UserPreference.objects.all()
            self.assertEqual(preferences.count(), 1)
            self.assertEqual(preferences.first(), preference)
        
        def test_tenant_context_utilities(self):
            """Test tenant context utility functions"""
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
                # Test filter_by_tenant
                accounts = filter_by_tenant(BankAccount.objects.all())
                self.assertEqual(accounts.count(), 0)  # No accounts yet
                
                # Test tenant filtering
                account = BankAccount.objects.create(
                    tenant=self.tenant,
                    account_number='123456',
                    balance=1000.00,
                    bank_name='Test Bank'
                )
                
                # Should not raise exception
                ensure_tenant_access(account)
                
                # Test with different tenant
                tenant2 = Tenant.objects.create(
                    schema_name='test_tenant_2',
                    name='Test Tenant 2'
                )
                
                account2 = BankAccount.objects.create(
                    tenant=tenant2,
                    account_number='789012',
                    balance=2000.00,
                    bank_name='Test Bank 2'
                )
                
                # Should raise exception
                with self.assertRaises(PermissionDenied):
                    ensure_tenant_access(account2)


# Example JWT token usage
def example_jwt_usage():
    """
    Example of how to use JWT tokens with tenant context middleware.
    """
    
    def create_jwt_token(user, tenant):
        """Create JWT token with tenant information"""
        from rest_framework_simplejwt.tokens import AccessToken
        
        token = AccessToken()
        token['user_id'] = str(user.id)
        token['email'] = user.email
        token['tenant_id'] = str(tenant.id)
        token['tenant_name'] = tenant.name
        token['role'] = user.role
        
        return str(token)
    
    def extract_tenant_from_jwt(token):
        """Extract tenant information from JWT token"""
        from rest_framework_simplejwt.tokens import AccessToken
        
        try:
            access_token = AccessToken(token)
            payload = access_token.payload
            
            tenant_id = payload.get('tenant_id')
            tenant_name = payload.get('tenant_name')
            
            return {
                'tenant_id': tenant_id,
                'tenant_name': tenant_name,
            }
        except Exception as e:
            logger.error(f"Failed to extract tenant from JWT: {e}")
            return None


# Example request header usage
def example_header_usage():
    """
    Example of how to use request headers with tenant context middleware.
    """
    
    def make_tenant_request(tenant_id, user_token=None):
        """Make request with tenant context"""
        headers = {
            'X-Tenant-ID': str(tenant_id),
            'Authorization': f'Bearer {user_token}' if user_token else None,
        }
        
        # Remove None values
        headers = {k: v for k, v in headers.items() if v is not None}
        
        return headers
    
    def make_subdomain_request(tenant_slug):
        """Make request with tenant subdomain"""
        # This would be handled by the middleware automatically
        # when the request comes from a subdomain like tenant1.example.com
        pass


# Example management command usage
def example_management_command_usage():
    """
    Example of how to use the tenant context middleware in management commands.
    """
    from django.core.management.base import BaseCommand
    from backend.row_tenant_middleware import set_tenant_context
    
    class Command(BaseCommand):
        help = 'Example management command using tenant context'
        
        def add_arguments(self, parser):
            parser.add_argument('--tenant-id', type=str, help='Tenant ID to process')
            parser.add_argument('--action', type=str, choices=['list', 'cleanup'], help='Action to perform')
        
        def handle(self, *args, **options):
            tenant_id = options.get('tenant_id')
            action = options.get('action', 'list')
            
            if not tenant_id:
                self.stdout.write(self.style.ERROR('Tenant ID is required'))
                return
            
            # Set tenant context for the command
            from tenants.models import Tenant
            tenant = Tenant.objects.get(id=tenant_id)
            set_tenant_context(tenant)
            
            if action == 'list':
                self.list_accounts()
            elif action == 'cleanup':
                self.cleanup_accounts()
        
        def list_accounts(self):
            """List bank accounts for tenant"""
            accounts = BankAccount.objects.all()
            
            self.stdout.write(f'Found {accounts.count()} bank accounts')
            for account in accounts:
                self.stdout.write(f'  - {account.bank_name}: {account.account_number}')
        
        def cleanup_accounts(self):
            """Cleanup inactive accounts for tenant"""
            inactive_accounts = BankAccount.objects.filter(is_active=False)
            
            count = inactive_accounts.count()
            inactive_accounts.delete()
            
            self.stdout.write(f'Deleted {count} inactive accounts')
