# Enhanced Base Models with Automatic Tenant Filtering

## Overview

This guide explains how to use the enhanced base models that provide automatic tenant filtering, PostgreSQL Row-Level Security (RLS), and comprehensive audit logging for multi-tenant Django applications.

## Key Features

- **Automatic Tenant Filtering**: All queries are automatically scoped to the current tenant
- **PostgreSQL RLS**: Database-level security for additional protection
- **Field-Level Encryption**: Automatic encryption/decryption of sensitive data
- **Comprehensive Audit Logging**: Automatic audit trails for compliance
- **Role-Based Access Control**: Granular permissions with compliance awareness
- **Data Classification**: Automatic data classification and handling

## Base Model Classes

### 1. TenantScopedModel

Base model for tenant-scoped data with automatic tenant filtering.

```python
from backend.enhanced_base_models import TenantScopedModel, FinancialModel

class MyModel(FinancialModel):
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
from backend.enhanced_base_models import CompanyScopedModel

class CompanyDocument(CompanyScopedModel):
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    class Meta:
        db_table = 'company_documents'
```

**Features:**
- Automatic company assignment
- Tenant filtering through company relationship
- Enhanced QuerySet with company filtering
- Automatic tenant validation

### 3. UserScopedModel

Base model for user-scoped data (automatically filtered by tenant through user).

```python
from backend.enhanced_base_models import UserScopedModel

class UserPreference(UserScopedModel):
    setting_name = models.CharField(max_length=100)
    setting_value = models.TextField()
    
    class Meta:
        db_table = 'user_preferences'
```

**Features:**
- Automatic user assignment
- Tenant filtering through user relationship
- Enhanced QuerySet with user filtering
- Automatic tenant validation

### 4. FinancialModel

Base model for financial data with enhanced security and compliance features.

```python
from backend.enhanced_base_models import FinancialModel
from backend.data_encryption import EncryptedCharField, EncryptedDecimalField

class FinancialRecord(FinancialModel):
    account_number = EncryptedCharField(max_length=50)
    balance = EncryptedDecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    class Meta:
        db_table = 'financial_records'
```

**Features:**
- All TenantScopedModel features
- Data classification levels
- Compliance requirements
- Retention policies
- Sensitive data handling

### 5. AuditModel

Base model for audit and compliance data.

```python
from backend.enhanced_base_models import AuditModel

class AuditRecord(AuditModel):
    action = models.CharField(max_length=50)
    resource_type = models.CharField(max_length=100)
    details = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'audit_records'
```

**Features:**
- All TenantScopedModel features
- Automatic audit hash generation
- Compliance framework tracking
- Parent-child audit relationships

## Enhanced QuerySet and Manager

### EnhancedTenantQuerySet

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

### EnhancedTenantManager

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

## Field-Level Encryption

### Encrypted Fields

Automatic encryption/decryption for sensitive data.

```python
from backend.data_encryption import (
    EncryptedCharField, EncryptedTextField, EncryptedDecimalField,
    EncryptedEmailField, EncryptedJSONField
)

class SensitiveData(FinancialModel):
    # Encrypted text fields
    account_number = EncryptedCharField(max_length=50)
    routing_number = EncryptedCharField(max_length=20)
    notes = EncryptedTextField(blank=True)
    
    # Encrypted numeric fields
    balance = EncryptedDecimalField(max_digits=15, decimal_places=2)
    ssn = EncryptedCharField(max_length=11)
    
    # Encrypted email
    email = EncryptedEmailField(blank=True)
    
    # Encrypted JSON
    metadata = EncryptedJSONField(default=dict, blank=True)
```

### Encryption Manager

Centralized encryption management.

```python
from backend.data_encryption import get_encryption_manager

# Get encryption manager
manager = get_encryption_manager()

# Encrypt data
encrypted_data = manager.encrypt("sensitive data")

# Decrypt data
decrypted_data = manager.decrypt(encrypted_data)

# Key rotation
manager.rotate_key('new_key_id', 'new_encryption_key')
```

## PostgreSQL Row-Level Security (RLS)

### RLS Setup

Set up RLS policies for database-level security.

```bash
# Set up RLS environment
python manage.py setup_rls --setup

# Check RLS status
python manage.py setup_rls --status

# List RLS policies
python manage.py setup_rls --policies

# Drop RLS environment
python manage.py setup_rls --drop
```

### RLS Policies

Automatic tenant isolation policies.

```python
from backend.rls_policies import RLSPolicyManager

# Set up RLS policies
rls_manager = RLSPolicyManager()
policies_created = rls_manager.setup_rls_environment()

# Check RLS status
status = rls_manager.check_rls_status()

# Get RLS policies
policies = rls_manager.get_rls_policies()
```

## Usage Examples

### 1. Creating Models

```python
from backend.enhanced_base_models import FinancialModel
from backend.data_encryption import EncryptedCharField, EncryptedDecimalField

class BankAccount(FinancialModel):
    account_number = EncryptedCharField(max_length=50)
    routing_number = EncryptedCharField(max_length=20)
    balance = EncryptedDecimalField(max_digits=15, decimal_places=2)
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
from backend.enhanced_base_models import ensure_tenant_access

def list_bank_accounts(request):
    """List bank accounts for current tenant"""
    # Automatic tenant filtering
    accounts = BankAccount.objects.all()
    
    data = [
        {
            'id': str(account.id),
            'account_number': account.account_number,  # Automatically decrypted
            'balance': float(account.balance),  # Automatically decrypted
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
            'account_number': account.account_number,  # Automatically decrypted
            'balance': float(account.balance),  # Automatically decrypted
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

### 4. Using in Tests

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from tenants.models import Tenant
from backend.enhanced_base_models import get_current_tenant

User = get_user_model()

class BankAccountTestCase(TestCase):
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
        with patch('backend.enhanced_base_models.get_current_tenant', return_value=self.tenant):
            accounts = BankAccount.objects.all()
            self.assertEqual(accounts.count(), 1)
            self.assertEqual(accounts.first(), account1)
    
    def test_encryption(self):
        """Test that sensitive fields are encrypted"""
        account = BankAccount.objects.create(
            tenant=self.tenant,
            account_number='123456',
            balance=1000.00,
            bank_name='Test Bank'
        )
        
        # Check that encrypted fields are stored encrypted
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT account_number, balance FROM bank_accounts WHERE id = %s",
                [account.id]
            )
            row = cursor.fetchone()
            
            # These should be encrypted in the database
            self.assertNotEqual(row[0], '123456')
            self.assertNotEqual(row[1], 1000.00)
        
        # But should be decrypted when accessed
        self.assertEqual(account.account_number, '123456')
        self.assertEqual(account.balance, 1000.00)
```

## Configuration

### Django Settings

```python
# settings.py

# Enable RLS
ENABLE_ROW_LEVEL_SECURITY = True

# Encryption configuration
ENCRYPTION_CONFIG = {
    'current_key': 'default_key_1',
    'keys': {
        'default_key_1': 'your-encryption-key-here',
        'default_key_2': 'your-backup-encryption-key-here',
    }
}

# Compliance framework configuration
COMPLIANCE_FRAMEWORKS = {
    'SOX': {'enabled': True, 'retention_days': 2555, 'audit_required': True},
    'PCI_DSS': {'enabled': True, 'retention_days': 1095, 'audit_required': True},
    'GDPR': {'enabled': True, 'retention_days': 2555, 'audit_required': True},
    'HIPAA': {'enabled': True, 'retention_days': 2555, 'audit_required': True},
}

# Data classification levels
DATA_CLASSIFICATION_LEVELS = {
    'public': 1,
    'internal': 2,
    'confidential': 3,
    'restricted': 4,
    'top_secret': 5,
}

# Audit logging configuration
AUDIT_LOG_CONFIG = {
    'enabled': True,
    'retention_days': 2555,
    'log_level': 'INFO',
    'include_request_body': False,
    'include_response_body': False,
    'sensitive_fields': ['password', 'ssn', 'credit_card', 'bank_account'],
}
```

### Middleware Configuration

```python
# settings.py

MIDDLEWARE = [
    # Tenant identification and context (MUST be first)
    'backend.tenant_middleware.EnhancedTenantMiddleware',
    'backend.tenant_middleware.TenantQueryFilterMiddleware',
    'backend.tenant_middleware.ComplianceAuditMiddleware',
    
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
- Use encrypted fields for sensitive data
- Set appropriate data classification levels
- Include proper indexes for performance

### 2. Query Optimization

- Use automatic tenant filtering
- Avoid manual tenant filtering when possible
- Use select_related for foreign keys
- Use prefetch_related for many-to-many relationships

### 3. Security

- Never bypass tenant filtering
- Always validate tenant access
- Use encrypted fields for sensitive data
- Implement proper access controls

### 4. Compliance

- Enable audit logging for all operations
- Implement data retention policies
- Monitor compliance violations
- Maintain audit trails

### 5. Performance

- Use database indexes effectively
- Monitor query performance
- Use connection pooling
- Implement caching where appropriate

## Troubleshooting

### Common Issues

1. **Tenant Context Not Set**
   - Ensure middleware is properly configured
   - Check tenant identification logic
   - Verify thread-local storage

2. **Query Filtering Not Working**
   - Check model inheritance
   - Verify manager configuration
   - Test query filtering manually

3. **Encryption/Decryption Errors**
   - Check encryption key configuration
   - Verify key rotation logic
   - Test encryption manually

4. **RLS Policies Not Working**
   - Check RLS setup
   - Verify policy configuration
   - Test RLS manually

### Debug Tools

- Use Django debug toolbar for query analysis
- Enable SQL query logging for performance analysis
- Use audit log queries for compliance verification
- Monitor security logs for anomaly detection

## Conclusion

The enhanced base models provide comprehensive multi-tenant security with:

- **Automatic Tenant Filtering**: All queries are automatically scoped to the current tenant
- **PostgreSQL RLS**: Database-level security for additional protection
- **Field-Level Encryption**: Automatic encryption/decryption of sensitive data
- **Comprehensive Audit Logging**: Automatic audit trails for compliance
- **Role-Based Access Control**: Granular permissions with compliance awareness
- **Data Classification**: Automatic data classification and handling

This implementation ensures complete tenant isolation while maintaining performance and compliance requirements for fintech applications.
