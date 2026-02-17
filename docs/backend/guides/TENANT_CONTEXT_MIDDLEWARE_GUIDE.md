# Tenant Context Middleware Guide

## Overview

This guide explains how to use the tenant context middleware that automatically extracts tenant_id from request headers or JWT claims and integrates with Django ORM for automatic tenant filtering.

## Key Features

- **Automatic Tenant Extraction**: Extracts tenant_id from headers, JWT tokens, subdomains, and URL paths
- **Django ORM Integration**: Automatically filters all queries by tenant_id
- **Thread-Safe Context**: Uses thread-local storage for tenant context
- **PostgreSQL RLS Support**: Integrates with Row-Level Security for additional protection
- **Comprehensive Audit Logging**: Logs all tenant access for compliance
- **Multiple Extraction Methods**: Supports various ways to identify tenants

## Middleware Components

### 1. TenantContextMiddleware

Main middleware that extracts tenant_id and sets up tenant context.

```python
# settings.py
MIDDLEWARE = [
    'backend.tenant_context_middleware.TenantContextMiddleware',
    'backend.tenant_context_middleware.TenantQueryFilterMiddleware',
    # ... other middleware
]
```

**Features:**
- Extracts tenant_id from multiple sources
- Validates tenant_id against database
- Sets up thread-local tenant context
- Configures database connection for RLS
- Logs tenant access for audit purposes

### 2. TenantQueryFilterMiddleware

Middleware that automatically applies tenant filtering to Django ORM queries.

**Features:**
- Works in conjunction with TenantContextMiddleware
- Sets up tenant context for query filtering
- Clears tenant context after request

## Tenant ID Extraction Methods

### 1. Request Headers

```python
# Client request with tenant header
headers = {
    'X-Tenant-ID': 'tenant-uuid-here',
    'Authorization': 'Bearer jwt-token'
}
```

### 2. JWT Token Claims

```python
# JWT token with tenant information
token_payload = {
    'user_id': 'user-uuid',
    'tenant_id': 'tenant-uuid',
    'tenant_name': 'Tenant Name',
    'role': 'admin'
}
```

### 3. Subdomain

```python
# Request from subdomain
# tenant1.example.com -> tenant_id = 'tenant1'
# tenant-uuid.example.com -> tenant_id = 'tenant-uuid'
```

### 4. URL Path

```python
# Request with tenant in path
# /tenant/tenant-uuid/api/accounts -> tenant_id = 'tenant-uuid'
```

### 5. Session

```python
# Tenant stored in session
request.session['tenant_id'] = 'tenant-uuid'
```

## Base Model Classes

### 1. TenantBaseModel

Base model for tenant-scoped data with automatic tenant filtering.

```python
from backend.tenant_base_model import TenantBaseModel

class MyModel(TenantBaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField()
    
    class Meta:
        db_table = 'my_model'
```

**Features:**
- Automatic tenant assignment
- Automatic audit field management
- Enhanced QuerySet with tenant filtering
- Automatic tenant validation

### 2. CompanyScopedModel

Base model for company-scoped data (automatically filtered by tenant through company).

```python
from backend.tenant_base_model import CompanyScopedModel

class CompanyDocument(CompanyScopedModel):
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    class Meta:
        db_table = 'company_documents'
```

### 3. UserScopedModel

Base model for user-scoped data (automatically filtered by tenant through user).

```python
from backend.tenant_base_model import UserScopedModel

class UserPreference(UserScopedModel):
    setting_name = models.CharField(max_length=100)
    setting_value = models.TextField()
    
    class Meta:
        db_table = 'user_preferences'
```

### 4. FinancialModel

Base model for financial data with enhanced security and compliance features.

```python
from backend.tenant_base_model import FinancialModel

class BankAccount(FinancialModel):
    account_number = models.CharField(max_length=50)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    bank_name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'bank_accounts'
```

## Enhanced QuerySet and Manager

### TenantAwareQuerySet

Automatic tenant filtering with RLS support.

```python
# Automatic tenant filtering
records = MyModel.objects.all()  # Only returns records for current tenant

# Automatic RLS enablement
records = MyModel.objects.filter(name__icontains='test')  # RLS automatically enabled

# Manual tenant filtering
records = MyModel.objects.for_tenant(specific_tenant)
records = MyModel.objects.for_current_tenant()
```

### TenantAwareManager

Enhanced manager with automatic tenant filtering.

```python
# Create with automatic tenant assignment
record = MyModel.objects.create(
    name='Test Record',
    description='Test description'
    # tenant is automatically assigned
)

# Get queryset for specific tenant
records = MyModel.objects.for_tenant(tenant)
records = MyModel.objects.for_current_tenant()
```

## Usage Examples

### 1. Creating Models

```python
from backend.tenant_base_model import FinancialModel

class BankAccount(FinancialModel):
    account_number = models.CharField(max_length=50)
    routing_number = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    bank_name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'bank_accounts'
        verbose_name = 'Bank Account'
        verbose_name_plural = 'Bank Accounts'
```

### 2. Using in Views

```python
from django.shortcuts import render
from django.http import JsonResponse
from backend.tenant_context_middleware import get_current_tenant, ensure_tenant_access

def list_bank_accounts(request):
    """List bank accounts for current tenant"""
    # Automatic tenant filtering
    accounts = BankAccount.objects.all()
    
    data = [
        {
            'id': str(account.id),
            'account_number': account.account_number,
            'balance': float(account.balance),
            'bank_name': account.bank_name,
        }
        for account in accounts
    ]
    
    return JsonResponse({'accounts': data})

def get_bank_account(request, account_id):
    """Get specific bank account"""
    try:
        # Automatic tenant filtering
        account = BankAccount.objects.get(id=account_id)
        
        # Additional security check
        ensure_tenant_access(account)
        
        data = {
            'id': str(account.id),
            'account_number': account.account_number,
            'balance': float(account.balance),
            'bank_name': account.bank_name,
        }
        
        return JsonResponse({'account': data})
        
    except BankAccount.DoesNotExist:
        return JsonResponse({'error': 'Account not found'}, status=404)
```

### 3. Using in Serializers

```python
from rest_framework import serializers

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = [
            'id', 'account_number', 'routing_number', 'balance',
            'bank_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create bank account with automatic tenant assignment"""
        return BankAccount.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update bank account with automatic tenant validation"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
```

### 4. Using in ViewSets

```python
from rest_framework import viewsets, permissions
from rest_framework.decorators import action

class BankAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for bank accounts with automatic tenant filtering"""
    
    serializer_class = BankAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get queryset with automatic tenant filtering"""
        return BankAccount.objects.all()
    
    def perform_create(self, serializer):
        """Create bank account with automatic tenant assignment"""
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def active_accounts(self, request):
        """Get active bank accounts for current tenant"""
        accounts = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(accounts, many=True)
        return JsonResponse({'accounts': serializer.data})
```

### 5. Using in Tests

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from tenants.models import Tenant
from unittest.mock import patch

User = get_user_model()

class TenantContextTestCase(TestCase):
    def setUp(self):
        self.tenant = Tenant.objects.create(
            schema_name='test_tenant',
            name='Test Tenant'
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
        with patch('backend.tenant_context_middleware.get_current_tenant', return_value=self.tenant):
            accounts = BankAccount.objects.all()
            self.assertEqual(accounts.count(), 1)
            self.assertEqual(accounts.first(), account1)
```

## JWT Token Integration

### Creating JWT Tokens with Tenant Information

```python
from rest_framework_simplejwt.tokens import AccessToken

def create_jwt_token(user, tenant):
    """Create JWT token with tenant information"""
    token = AccessToken()
    token['user_id'] = str(user.id)
    token['email'] = user.email
    token['tenant_id'] = str(tenant.id)
    token['tenant_name'] = tenant.name
    token['role'] = user.role
    
    return str(token)
```

### Extracting Tenant from JWT

```python
def extract_tenant_from_jwt(token):
    """Extract tenant information from JWT token"""
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
```

## Request Header Integration

### Setting Tenant Headers

```python
def make_tenant_request(tenant_id, user_token=None):
    """Make request with tenant context"""
    headers = {
        'X-Tenant-ID': str(tenant_id),
        'Authorization': f'Bearer {user_token}' if user_token else None,
    }
    
    # Remove None values
    headers = {k: v for k, v in headers.items() if v is not None}
    
    return headers
```

### Subdomain Integration

```python
# Request from subdomain
# tenant1.example.com -> tenant_id = 'tenant1'
# tenant-uuid.example.com -> tenant_id = 'tenant-uuid'
```

## Utility Functions

### Tenant Context Access

```python
from backend.tenant_context_middleware import (
    get_current_tenant, get_current_user, get_current_tenant_id,
    set_tenant_context, clear_tenant_context
)

# Get current tenant
tenant = get_current_tenant()

# Get current user
user = get_current_user()

# Get current tenant ID
tenant_id = get_current_tenant_id()

# Set tenant context manually
set_tenant_context(tenant, user, request_id)

# Clear tenant context
clear_tenant_context()
```

### Tenant-Aware Queries

```python
from backend.tenant_queryset import get_tenant_queryset, ensure_tenant_access

# Get queryset for current tenant
accounts = get_tenant_queryset(BankAccount)

# Ensure object belongs to tenant
ensure_tenant_access(account)
```

### Decorators

```python
from backend.tenant_context_middleware import require_tenant_context

@require_tenant_context
def my_view(request):
    """View that requires tenant context"""
    # This view will only work if tenant context is set
    pass
```

## Configuration

### Django Settings

```python
# settings.py

# Enable RLS
ENABLE_ROW_LEVEL_SECURITY = True

# Allow tenant bypass (for system operations)
ALLOW_TENANT_BYPASS = False

# Tenant context middleware configuration
TENANT_CONTEXT_CONFIG = {
    'extract_from_headers': True,
    'extract_from_jwt': True,
    'extract_from_subdomain': True,
    'extract_from_path': True,
    'extract_from_session': True,
    'validate_tenant': True,
    'cache_tenant': True,
    'cache_timeout': 300,  # 5 minutes
}

# Audit logging configuration
AUDIT_LOG_CONFIG = {
    'enabled': True,
    'log_tenant_access': True,
    'log_tenant_errors': True,
    'log_tenant_validation': True,
}
```

### Middleware Configuration

```python
# settings.py

MIDDLEWARE = [
    # Tenant identification and context (MUST be first)
    'backend.tenant_context_middleware.TenantContextMiddleware',
    'backend.tenant_context_middleware.TenantQueryFilterMiddleware',
    
    # Security middleware
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'backend.security_middleware.SecurityHeadersMiddleware',
    'backend.security_middleware.RateLimitMiddleware',
    'backend.security_middleware.RequestLoggingMiddleware',
    'backend.security_middleware.InputValidationMiddleware',
    
    # Cache middleware
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    
    # Authentication and CSRF
    'backend.security_middleware.CSRFProtectionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Security audit (MUST be last)
    'backend.security_middleware.SecurityAuditMiddleware',
]
```

## Best Practices

### 1. Model Design

- Always inherit from appropriate base model
- Use automatic tenant filtering
- Include proper indexes for performance
- Validate tenant access in model methods

### 2. View Design

- Use automatic tenant filtering
- Validate tenant access for sensitive operations
- Handle tenant context errors gracefully
- Log tenant access for audit purposes

### 3. Security

- Never bypass tenant filtering
- Always validate tenant access
- Use HTTPS for JWT tokens
- Implement proper access controls

### 4. Performance

- Use database indexes effectively
- Monitor query performance
- Use connection pooling
- Implement caching where appropriate

### 5. Testing

- Test tenant isolation thoroughly
- Mock tenant context in tests
- Test error handling
- Verify audit logging

## Troubleshooting

### Common Issues

1. **No Tenant Context**
   - Check middleware configuration
   - Verify tenant extraction logic
   - Check request headers/tokens

2. **Query Filtering Not Working**
   - Check model inheritance
   - Verify manager configuration
   - Test query filtering manually

3. **JWT Token Issues**
   - Check token format
   - Verify JWT settings
   - Test token extraction

4. **Subdomain Issues**
   - Check subdomain configuration
   - Verify tenant identification
   - Test subdomain extraction

### Debug Tools

- Use Django debug toolbar for query analysis
- Enable SQL query logging for performance analysis
- Use audit log queries for compliance verification
- Monitor security logs for anomaly detection

## Conclusion

The tenant context middleware provides comprehensive multi-tenant security with:

- **Automatic Tenant Extraction**: Multiple methods for identifying tenants
- **Django ORM Integration**: Seamless integration with Django queries
- **Thread-Safe Context**: Reliable tenant context management
- **PostgreSQL RLS Support**: Database-level security for additional protection
- **Comprehensive Audit Logging**: Complete audit trails for compliance
- **Multiple Base Models**: Flexible model inheritance options

This implementation ensures complete tenant isolation while maintaining performance and compliance requirements for multi-tenant applications.
