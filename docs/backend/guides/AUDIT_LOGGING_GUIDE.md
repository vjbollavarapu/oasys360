# Comprehensive Audit Logging System Guide

## Overview

This guide explains how to use the comprehensive audit logging system for multi-tenant database operations. The system provides automatic audit logging for compliance, security, and compliance requirements.

## Key Features

- **Automatic Audit Logging**: All database operations are automatically logged
- **Comprehensive Data Capture**: Stores tenant_id, user_id, operation, timestamp, and more
- **Compliance Support**: Built-in support for SOX, PCI DSS, GDPR, HIPAA, and other frameworks
- **Security Monitoring**: Tracks security violations and compliance breaches
- **Query API**: REST API for fetching audit trails and compliance reports
- **Data Classification**: Automatic classification of sensitive data
- **Retention Management**: Automatic retention and archival of audit logs

## Audit Models

### 1. AuditLog

Main audit log model for all database operations.

```python
from backend.audit_models import AuditLog

# Fields:
# - tenant: Tenant that owns the record
# - user: User who performed the operation
# - operation: Type of operation (CREATE, READ, UPDATE, DELETE, etc.)
# - resource_type: Type of resource (model name)
# - resource_id: ID of the resource
# - resource_name: Human-readable name of the resource
# - old_data: Data before the operation
# - new_data: Data after the operation
# - changed_fields: List of fields that were changed
# - compliance_framework: Compliance framework (SOX, PCI_DSS, etc.)
# - data_classification: Data classification level
# - is_sensitive: Whether this operation involved sensitive data
# - audit_hash: Hash for audit integrity verification
# - timestamp: When the operation occurred
```

### 2. AuditQuery

Audit log for query operations (READ operations).

```python
from backend.audit_models import AuditQuery

# Fields:
# - tenant: Tenant that owns the record
# - user: User who performed the query
# - query_type: Type of query (SELECT, COUNT, AGGREGATE, etc.)
# - model_name: Name of the model being queried
# - filters_applied: Filters that were applied
# - fields_accessed: Fields that were accessed
# - record_count: Number of records returned
```

### 3. AuditExport

Audit log for data export operations.

```python
from backend.audit_models import AuditExport

# Fields:
# - tenant: Tenant that owns the record
# - user: User who performed the export
# - export_type: Type of export (CSV, EXCEL, PDF, etc.)
# - model_name: Name of the model being exported
# - filters_applied: Filters that were applied
# - record_count: Number of records exported
# - file_path: Path to the exported file
# - file_size: Size of the exported file
```

### 4. AuditViolation

Audit log for security violations and compliance breaches.

```python
from backend.audit_models import AuditViolation

# Fields:
# - tenant: Tenant that owns the record
# - user: User who caused the violation
# - violation_type: Type of violation
# - severity: Severity level (LOW, MEDIUM, HIGH, CRITICAL)
# - description: Description of the violation
# - details: Additional details about the violation
# - status: Resolution status (OPEN, INVESTIGATING, RESOLVED, CLOSED)
```

## Audit Service

### AuditService

Main service for audit logging operations.

```python
from backend.audit_service import audit_service

# Log a database operation
audit_service.log_operation(
    operation='CREATE',
    resource_type='BankAccount',
    resource_id='account-123',
    resource_name='Test Bank Account',
    old_data={},
    new_data={'balance': 1000.00},
    compliance_framework='SOX',
    data_classification='CONFIDENTIAL',
    is_sensitive=True
)

# Log a query operation
audit_service.log_query(
    query_type='SELECT',
    model_name='BankAccount',
    filters_applied={'is_active': True},
    fields_accessed=['account_number', 'balance'],
    record_count=5
)

# Log a data export
audit_service.log_export(
    export_type='CSV',
    model_name='BankAccount',
    filters_applied={'is_active': True},
    record_count=10,
    file_path='/tmp/export.csv',
    file_size=1024
)

# Log a security violation
audit_service.log_violation(
    violation_type='UNAUTHORIZED_ACCESS',
    description='Unauthorized access attempt',
    severity='HIGH'
)
```

### Utility Functions

```python
from backend.audit_service import (
    log_operation, log_query, log_export, log_violation,
    get_audit_trail, get_compliance_report, get_user_activity
)

# Log operations
log_operation(operation='CREATE', resource_type='BankAccount', resource_id='123')
log_query(query_type='SELECT', model_name='BankAccount', record_count=5)
log_export(export_type='CSV', model_name='BankAccount', record_count=10)
log_violation(violation_type='UNAUTHORIZED_ACCESS', description='Access denied')

# Get audit trails
audit_trail = get_audit_trail(operation='CREATE', resource_type='BankAccount')
compliance_report = get_compliance_report(compliance_framework='SOX')
user_activity = get_user_activity(user=user, limit=100)
```

## Automatic Audit Logging

### Signal Handlers

The system automatically logs all database operations through Django signals.

```python
# Automatic logging happens through:
# - pre_save signal: Stores old data
# - post_save signal: Logs CREATE and UPDATE operations
# - pre_delete signal: Stores data before deletion
# - post_delete signal: Logs DELETE operations
```

### AuditableManager

Use the AuditableManager for automatic query logging.

```python
from backend.audit_signals import AuditableManager

class BankAccount(models.Model):
    account_number = models.CharField(max_length=50)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Use auditable manager for automatic query logging
    objects = AuditableManager()
    
    class Meta:
        db_table = 'bank_accounts'
```

### Manual Audit Logging

```python
from backend.audit_signals import log_manual_operation, log_security_violation

# Log manual operations
log_manual_operation(
    operation='TRANSFER',
    resource_type='BankTransfer',
    resource_id='transfer-123',
    resource_name='Money Transfer',
    old_data={'from_balance': 1000.00, 'to_balance': 500.00},
    new_data={'from_balance': 900.00, 'to_balance': 600.00},
    changed_fields=['from_balance', 'to_balance'],
    compliance_framework='SOX',
    data_classification='CONFIDENTIAL',
    is_sensitive=True
)

# Log security violations
log_security_violation(
    violation_type='UNAUTHORIZED_ACCESS',
    description='Unauthorized access attempt to bank account',
    details={'ip_address': '192.168.1.1', 'user_agent': 'Mozilla/5.0'},
    severity='HIGH'
)
```

## REST API Endpoints

### Audit Logs

```python
# Get audit logs
GET /api/audit/audit-logs/
GET /api/audit/audit-logs/?operation=CREATE&resource_type=BankAccount
GET /api/audit/audit-logs/?start_date=2024-01-01&end_date=2024-12-31
GET /api/audit/audit-logs/?page=1&page_size=50

# Get audit log details
GET /api/audit/audit-logs/{id}/
GET /api/audit/audit-logs/{id}/details/
GET /api/audit/audit-logs/{id}/related/

# Get audit log summary
GET /api/audit/audit-logs/summary/
```

### Compliance Reports

```python
# Get compliance report
GET /api/audit/compliance/report/
GET /api/audit/compliance/report/?compliance_framework=SOX
GET /api/audit/compliance/report/?start_date=2024-01-01&end_date=2024-12-31

# Export audit data
POST /api/audit/compliance/export/
{
    "export_type": "CSV",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "filters": {
        "operation": "CREATE",
        "resource_type": "BankAccount"
    }
}
```

### User Activity

```python
# Get user activity
GET /api/audit/user-activity/
GET /api/audit/user-activity/{user_id}/
GET /api/audit/user-activity/?start_date=2024-01-01&end_date=2024-12-31
```

### Resource Audit Trails

```python
# Get resource audit trail
GET /api/audit/resource/{resource_type}/{resource_id}/
GET /api/audit/resource/BankAccount/account-123/
```

### Audit Violations

```python
# Get audit violations
GET /api/audit/audit-violations/
GET /api/audit/audit-violations/?violation_type=UNAUTHORIZED_ACCESS
GET /api/audit/audit-violations/?severity=HIGH&status=OPEN

# Resolve violation
POST /api/audit/audit-violations/{id}/resolve/
{
    "notes": "Violation resolved by security team"
}
```

### Audit Management

```python
# Clean up old audit logs
POST /api/audit/management/
{
    "action": "cleanup",
    "days": 2555
}

# Archive old audit logs
POST /api/audit/management/
{
    "action": "archive",
    "days": 365
}
```

## Usage Examples

### 1. Basic Model with Audit Logging

```python
from django.db import models
from backend.audit_signals import AuditableManager
from backend.tenant_base_model import TenantBaseModel

class BankAccount(TenantBaseModel):
    account_number = models.CharField(max_length=50)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    bank_name = models.CharField(max_length=255)
    
    # Use auditable manager for automatic query logging
    objects = AuditableManager()
    
    class Meta:
        db_table = 'bank_accounts'
```

### 2. Using in Views

```python
from django.shortcuts import render
from django.http import JsonResponse
from backend.audit_service import log_manual_operation

def list_bank_accounts(request):
    """List bank accounts with automatic audit logging"""
    # Automatic audit logging through AuditableManager
    accounts = BankAccount.objects.all()  # Automatically logged
    
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

def transfer_money(request, from_account_id, to_account_id, amount):
    """Transfer money with manual audit logging"""
    try:
        from_account = BankAccount.objects.get(id=from_account_id)
        to_account = BankAccount.objects.get(id=to_account_id)
        
        # Log the transfer operation
        log_manual_operation(
            operation='TRANSFER',
            resource_type='BankTransfer',
            resource_id=f"{from_account_id}-{to_account_id}",
            resource_name=f"Transfer from {from_account.bank_name} to {to_account.bank_name}",
            old_data={
                'from_account_balance': float(from_account.balance),
                'to_account_balance': float(to_account.balance),
            },
            new_data={
                'from_account_balance': float(from_account.balance - amount),
                'to_account_balance': float(to_account.balance + amount),
            },
            changed_fields=['from_account_balance', 'to_account_balance'],
            compliance_framework='SOX',
            data_classification='CONFIDENTIAL',
            is_sensitive=True
        )
        
        # Perform the transfer
        from_account.balance -= amount
        to_account.balance += amount
        from_account.save()
        to_account.save()
        
        return JsonResponse({'message': 'Transfer completed successfully'})
        
    except Exception as e:
        # Log the error
        log_security_violation(
            violation_type='TRANSFER_FAILED',
            description=f"Money transfer failed: {str(e)}",
            details={'from_account_id': from_account_id, 'to_account_id': to_account_id, 'amount': float(amount)},
            severity='HIGH'
        )
        raise
```

### 3. Using in Serializers

```python
from rest_framework import serializers

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'account_number', 'balance', 'bank_name']
    
    def create(self, validated_data):
        """Create bank account with automatic audit logging"""
        # Automatic audit logging through post_save signal
        return BankAccount.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update bank account with automatic audit logging"""
        # Automatic audit logging through post_save signal
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
from unittest.mock import patch

User = get_user_model()

class AuditLoggingTestCase(TestCase):
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
    
    def test_automatic_audit_logging(self):
        """Test that audit logging works automatically"""
        with patch('backend.audit_signals.get_current_tenant', return_value=self.tenant):
            with patch('backend.audit_signals.get_current_user', return_value=self.user):
                # Create account - should trigger audit logging
                account = BankAccount.objects.create(
                    tenant=self.tenant,
                    account_number='123456',
                    balance=1000.00,
                    bank_name='Test Bank'
                )
                
                # Check that audit log was created
                audit_logs = AuditLog.objects.filter(
                    tenant=self.tenant,
                    resource_type='BankAccount',
                    resource_id=str(account.id)
                )
                
                self.assertEqual(audit_logs.count(), 1)
                self.assertEqual(audit_logs.first().operation, 'CREATE')
    
    def test_manual_audit_logging(self):
        """Test manual audit logging"""
        with patch('backend.audit_signals.get_current_tenant', return_value=self.tenant):
            with patch('backend.audit_signals.get_current_user', return_value=self.user):
                # Log manual operation
                log_manual_operation(
                    operation='MANUAL_OPERATION',
                    resource_type='TestResource',
                    resource_id='test-123',
                    resource_name='Test Resource',
                    old_data={'value': 'old'},
                    new_data={'value': 'new'},
                    compliance_framework='SOX',
                    data_classification='CONFIDENTIAL',
                    is_sensitive=True
                )
                
                # Check that audit log was created
                audit_logs = AuditLog.objects.filter(
                    tenant=self.tenant,
                    operation='MANUAL_OPERATION'
                )
                
                self.assertEqual(audit_logs.count(), 1)
                self.assertEqual(audit_logs.first().resource_type, 'TestResource')
```

## Configuration

### Django Settings

```python
# settings.py

# Audit logging configuration
AUDIT_LOG_CONFIG = {
    'enabled': True,
    'log_tenant_access': True,
    'log_tenant_errors': True,
    'log_tenant_validation': True,
    'retention_days': 2555,  # 7 years
    'archive_days': 365,  # 1 year
    'sensitive_fields': ['password', 'ssn', 'credit_card', 'bank_account'],
    'compliance_frameworks': ['SOX', 'PCI_DSS', 'GDPR', 'HIPAA'],
    'data_classifications': ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'],
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
    'PUBLIC': 1,
    'INTERNAL': 2,
    'CONFIDENTIAL': 3,
    'RESTRICTED': 4,
    'TOP_SECRET': 5,
}
```

### URL Configuration

```python
# urls.py
from django.urls import path, include
from backend.audit_urls import audit_api_urls

urlpatterns = [
    path('api/', include(audit_api_urls)),
    # ... other URL patterns
]
```

## Best Practices

### 1. Model Design

- Use AuditableManager for automatic query logging
- Include audit fields in models
- Set appropriate data classification levels
- Use proper compliance frameworks

### 2. View Design

- Use automatic audit logging where possible
- Log manual operations explicitly
- Handle audit logging errors gracefully
- Use appropriate compliance frameworks

### 3. Security

- Never log sensitive data in plain text
- Use data classification levels
- Monitor security violations
- Implement proper access controls

### 4. Compliance

- Enable audit logging for all operations
- Use appropriate compliance frameworks
- Implement data retention policies
- Monitor compliance violations

### 5. Performance

- Use database indexes effectively
- Monitor audit log size
- Implement archival strategies
- Use pagination for large datasets

## Troubleshooting

### Common Issues

1. **Audit Logging Not Working**
   - Check signal handlers are registered
   - Verify tenant context is set
   - Check audit service configuration

2. **Performance Issues**
   - Monitor audit log size
   - Implement archival strategies
   - Use database indexes effectively

3. **Compliance Issues**
   - Verify compliance frameworks
   - Check data classification levels
   - Monitor retention policies

4. **API Issues**
   - Check URL configuration
   - Verify authentication
   - Test API endpoints

### Debug Tools

- Use Django debug toolbar for query analysis
- Enable SQL query logging for performance analysis
- Use audit log queries for compliance verification
- Monitor security logs for anomaly detection

## Conclusion

The comprehensive audit logging system provides:

- **Automatic Audit Logging**: All database operations are automatically logged
- **Comprehensive Data Capture**: Complete audit trails for compliance
- **Compliance Support**: Built-in support for major compliance frameworks
- **Security Monitoring**: Tracks security violations and breaches
- **Query API**: REST API for fetching audit trails and reports
- **Data Classification**: Automatic classification of sensitive data
- **Retention Management**: Automatic retention and archival

This implementation ensures complete audit trails for compliance and security requirements while maintaining performance and usability for multi-tenant applications.
