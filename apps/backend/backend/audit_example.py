"""
Example Usage of Audit Logging System
Demonstrates how to use the comprehensive audit logging for compliance.
"""

from django.db import models
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action
from backend.audit_service import audit_service, log_operation, log_violation, log_export
from backend.audit_models import AuditLog, AuditViolation
from backend.audit_signals import AuditableManager, log_manual_operation, log_security_violation
from backend.tenant_base_model import TenantBaseModel

User = get_user_model()


# Example model with audit logging
class BankAccount(TenantBaseModel):
    """
    Example bank account model with automatic audit logging.
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
    
    # Use auditable manager for automatic query logging
    objects = AuditableManager()
    
    class Meta:
        db_table = 'bank_accounts'
        verbose_name = 'Bank Account'
        verbose_name_plural = 'Bank Accounts'
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


# Example views using audit logging
def example_view_usage():
    """
    Example of how to use audit logging in views.
    """
    
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
                'account_type': account.account_type,
                'is_active': account.is_active,
            }
            for account in accounts
        ]
        
        return JsonResponse({'accounts': data})
    
    def get_bank_account(request, account_id):
        """Get specific bank account with audit logging"""
        try:
            # Automatic audit logging through AuditableManager
            account = BankAccount.objects.get(id=account_id)  # Automatically logged
            
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
        """Create new bank account with audit logging"""
        if request.method == 'POST':
            data = request.json
            
            # Automatic audit logging through post_save signal
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
    
    def update_bank_account(request, account_id):
        """Update bank account with audit logging"""
        if request.method == 'PUT':
            try:
                account = BankAccount.objects.get(id=account_id)
                data = request.json
                
                # Automatic audit logging through post_save signal
                account.account_number = data.get('account_number', account.account_number)
                account.routing_number = data.get('routing_number', account.routing_number)
                account.balance = data.get('balance', account.balance)
                account.bank_name = data.get('bank_name', account.bank_name)
                account.account_type = data.get('account_type', account.account_type)
                account.is_active = data.get('is_active', account.is_active)
                account.save()
                
                return JsonResponse({
                    'id': str(account.id),
                    'message': 'Account updated successfully'
                })
                
            except BankAccount.DoesNotExist:
                return JsonResponse({'error': 'Account not found'}, status=404)
        
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    def delete_bank_account(request, account_id):
        """Delete bank account with audit logging"""
        if request.method == 'DELETE':
            try:
                account = BankAccount.objects.get(id=account_id)
                
                # Automatic audit logging through post_delete signal
                account.delete()
                
                return JsonResponse({'message': 'Account deleted successfully'})
                
            except BankAccount.DoesNotExist:
                return JsonResponse({'error': 'Account not found'}, status=404)
        
        return JsonResponse({'error': 'Method not allowed'}, status=405)


# Example of manual audit logging
def example_manual_audit_logging():
    """
    Example of how to use manual audit logging.
    """
    
    def transfer_money(from_account_id, to_account_id, amount):
        """Transfer money between accounts with manual audit logging"""
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
            
            return True
            
        except Exception as e:
            # Log the error
            log_security_violation(
                violation_type='TRANSFER_FAILED',
                description=f"Money transfer failed: {str(e)}",
                details={'from_account_id': from_account_id, 'to_account_id': to_account_id, 'amount': float(amount)},
                severity='HIGH'
            )
            raise
    
    def export_account_data(account_id, export_type='CSV'):
        """Export account data with audit logging"""
        try:
            account = BankAccount.objects.get(id=account_id)
            
            # Log the export operation
            log_export(
                export_type=export_type,
                model_name='BankAccount',
                filters_applied={'id': account_id},
                record_count=1,
                file_path=f'/tmp/account_export_{account_id}.{export_type.lower()}',
                file_size=1024,  # Example size
            )
            
            # Perform the export (simplified)
            export_data = {
                'account_number': account.account_number,
                'balance': float(account.balance),
                'bank_name': account.bank_name,
            }
            
            return export_data
            
        except Exception as e:
            # Log the error
            log_security_violation(
                violation_type='EXPORT_FAILED',
                description=f"Data export failed: {str(e)}",
                details={'account_id': account_id, 'export_type': export_type},
                severity='MEDIUM'
            )
            raise


# Example of using audit service directly
def example_audit_service_usage():
    """
    Example of how to use the audit service directly.
    """
    
    def get_audit_trail_for_tenant(tenant_id, start_date=None, end_date=None):
        """Get audit trail for a specific tenant"""
        from tenants.models import Tenant
        
        tenant = Tenant.objects.get(id=tenant_id)
        
        # Get audit trail
        audit_logs = audit_service.get_audit_trail(
            tenant=tenant,
            start_date=start_date,
            end_date=end_date,
            limit=100
        )
        
        return audit_logs
    
    def get_compliance_report(tenant_id, compliance_framework='SOX'):
        """Get compliance report for a tenant"""
        from tenants.models import Tenant
        
        tenant = Tenant.objects.get(id=tenant_id)
        
        # Get compliance report
        report = audit_service.get_compliance_report(
            tenant=tenant,
            compliance_framework=compliance_framework
        )
        
        return report
    
    def get_user_activity(user_id, start_date=None, end_date=None):
        """Get user activity audit trail"""
        user = User.objects.get(id=user_id)
        
        # Get user activity
        activity = audit_service.get_user_activity(
            user=user,
            start_date=start_date,
            end_date=end_date,
            limit=100
        )
        
        return activity
    
    def get_resource_audit_trail(resource_type, resource_id):
        """Get audit trail for a specific resource"""
        # Get resource audit trail
        audit_trail = audit_service.get_resource_audit_trail(
            resource_type=resource_type,
            resource_id=resource_id
        )
        
        return audit_trail


# Example of using audit API
def example_audit_api_usage():
    """
    Example of how to use the audit API endpoints.
    """
    
    def get_audit_logs_api():
        """Example API call to get audit logs"""
        import requests
        
        # Get audit logs for current tenant
        response = requests.get('/api/audit/audit-logs/', params={
            'operation': 'CREATE',
            'resource_type': 'BankAccount',
            'start_date': '2024-01-01T00:00:00Z',
            'end_date': '2024-12-31T23:59:59Z',
            'page': 1,
            'page_size': 50
        })
        
        return response.json()
    
    def get_compliance_report_api():
        """Example API call to get compliance report"""
        import requests
        
        # Get compliance report
        response = requests.get('/api/audit/compliance/report/', params={
            'compliance_framework': 'SOX',
            'start_date': '2024-01-01T00:00:00Z',
            'end_date': '2024-12-31T23:59:59Z'
        })
        
        return response.json()
    
    def get_user_activity_api(user_id):
        """Example API call to get user activity"""
        import requests
        
        # Get user activity
        response = requests.get(f'/api/audit/user-activity/{user_id}/', params={
            'start_date': '2024-01-01T00:00:00Z',
            'end_date': '2024-12-31T23:59:59Z',
            'limit': 100
        })
        
        return response.json()
    
    def get_resource_audit_trail_api(resource_type, resource_id):
        """Example API call to get resource audit trail"""
        import requests
        
        # Get resource audit trail
        response = requests.get(f'/api/audit/resource/{resource_type}/{resource_id}/')
        
        return response.json()
    
    def export_audit_data_api():
        """Example API call to export audit data"""
        import requests
        
        # Export audit data
        response = requests.post('/api/audit/compliance/export/', json={
            'export_type': 'CSV',
            'start_date': '2024-01-01T00:00:00Z',
            'end_date': '2024-12-31T23:59:59Z',
            'filters': {
                'operation': 'CREATE',
                'resource_type': 'BankAccount'
            }
        })
        
        return response.json()
    
    def manage_audit_data_api():
        """Example API call to manage audit data"""
        import requests
        
        # Clean up old audit logs
        response = requests.post('/api/audit/management/', json={
            'action': 'cleanup',
            'days': 2555  # 7 years
        })
        
        return response.json()


# Example of using audit logging in tests
def example_test_usage():
    """
    Example of how to test audit logging.
    """
    from django.test import TestCase
    from django.contrib.auth import get_user_model
    from tenants.models import Tenant
    from unittest.mock import patch
    
    User = get_user_model()
    
    class AuditLoggingTestCase(TestCase):
        """Test case for audit logging"""
        
        def setUp(self):
            """Set up test data"""
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
        
        def test_security_violation_logging(self):
            """Test security violation logging"""
            with patch('backend.audit_signals.get_current_tenant', return_value=self.tenant):
                with patch('backend.audit_signals.get_current_user', return_value=self.user):
                    # Log security violation
                    log_security_violation(
                        violation_type='UNAUTHORIZED_ACCESS',
                        description='Unauthorized access attempt',
                        details={'ip_address': '192.168.1.1'},
                        severity='HIGH'
                    )
                    
                    # Check that violation was logged
                    violations = AuditViolation.objects.filter(
                        tenant=self.tenant,
                        violation_type='UNAUTHORIZED_ACCESS'
                    )
                    
                    self.assertEqual(violations.count(), 1)
                    self.assertEqual(violations.first().severity, 'HIGH')
        
        def test_audit_trail_query(self):
            """Test audit trail querying"""
            with patch('backend.audit_signals.get_current_tenant', return_value=self.tenant):
                with patch('backend.audit_signals.get_current_user', return_value=self.user):
                    # Create some audit logs
                    for i in range(5):
                        BankAccount.objects.create(
                            tenant=self.tenant,
                            account_number=f'12345{i}',
                            balance=1000.00 + i,
                            bank_name=f'Test Bank {i}'
                        )
                    
                    # Get audit trail
                    audit_trail = audit_service.get_audit_trail(
                        tenant=self.tenant,
                        operation='CREATE',
                        resource_type='BankAccount'
                    )
                    
                    self.assertEqual(audit_trail.count(), 5)
        
        def test_compliance_report(self):
            """Test compliance report generation"""
            with patch('backend.audit_signals.get_current_tenant', return_value=self.tenant):
                with patch('backend.audit_signals.get_current_user', return_value=self.user):
                    # Create some audit logs
                    for i in range(3):
                        BankAccount.objects.create(
                            tenant=self.tenant,
                            account_number=f'12345{i}',
                            balance=1000.00 + i,
                            bank_name=f'Test Bank {i}'
                        )
                    
                    # Get compliance report
                    report = audit_service.get_compliance_report(
                        tenant=self.tenant,
                        compliance_framework='SOX'
                    )
                    
                    self.assertIn('total_operations', report)
                    self.assertIn('operations_by_type', report)
                    self.assertIn('operations_by_user', report)
                    self.assertEqual(report['total_operations'], 3)


# Example of using audit logging in management commands
def example_management_command_usage():
    """
    Example of how to use audit logging in management commands.
    """
    from django.core.management.base import BaseCommand
    from backend.audit_service import audit_service
    
    class Command(BaseCommand):
        help = 'Example management command using audit logging'
        
        def add_arguments(self, parser):
            parser.add_argument('--tenant-id', type=str, help='Tenant ID to process')
            parser.add_argument('--action', type=str, choices=['cleanup', 'archive', 'report'], help='Action to perform')
        
        def handle(self, *args, **options):
            tenant_id = options.get('tenant_id')
            action = options.get('action', 'report')
            
            if not tenant_id:
                self.stdout.write(self.style.ERROR('Tenant ID is required'))
                return
            
            # Set tenant context
            from tenants.models import Tenant
            tenant = Tenant.objects.get(id=tenant_id)
            
            if action == 'cleanup':
                self.cleanup_audit_logs(tenant)
            elif action == 'archive':
                self.archive_audit_logs(tenant)
            elif action == 'report':
                self.generate_compliance_report(tenant)
        
        def cleanup_audit_logs(self, tenant):
            """Clean up old audit logs"""
            deleted_count = audit_service.cleanup_old_audit_logs(days=2555)
            self.stdout.write(f'Cleaned up {deleted_count} old audit logs for tenant {tenant.name}')
        
        def archive_audit_logs(self, tenant):
            """Archive old audit logs"""
            archived_count = audit_service.archive_audit_logs(days=365)
            self.stdout.write(f'Archived {archived_count} audit logs for tenant {tenant.name}')
        
        def generate_compliance_report(self, tenant):
            """Generate compliance report"""
            report = audit_service.get_compliance_report(tenant=tenant)
            self.stdout.write(f'Compliance report for tenant {tenant.name}:')
            self.stdout.write(f'  Total operations: {report["total_operations"]}')
            self.stdout.write(f'  Sensitive operations: {report["sensitive_operations"]}')
            self.stdout.write(f'  Violations: {report["violations"]}')
