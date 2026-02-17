"""
Example Usage of Enhanced Base Models with Automatic Tenant Filtering
Demonstrates how to use the enhanced base models for multi-tenant applications.
"""

from django.db import models
from backend.enhanced_base_models import (
    TenantScopedModel, CompanyScopedModel, UserScopedModel, 
    FinancialModel, AuditModel
)
from backend.data_encryption import EncryptedCharField, EncryptedDecimalField


class ExampleFinancialRecord(FinancialModel):
    """
    Example financial record using enhanced base model.
    Automatically enforces tenant isolation and includes financial compliance features.
    """
    
    # Financial data fields
    account_number = EncryptedCharField(max_length=50, help_text="Encrypted account number")
    balance = EncryptedDecimalField(max_digits=15, decimal_places=2, help_text="Encrypted balance")
    currency = models.CharField(max_length=3, default='USD')
    
    # Business fields
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'example_financial_records'
        verbose_name = 'Financial Record'
        verbose_name_plural = 'Financial Records'
        indexes = [
            models.Index(fields=['tenant', 'name']),
            models.Index(fields=['tenant', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.currency})"


class ExampleCompanyDocument(CompanyScopedModel):
    """
    Example company document using company-scoped model.
    Automatically filtered by company (and therefore tenant).
    """
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    file_path = models.CharField(max_length=500, blank=True)
    document_type = models.CharField(max_length=50, choices=[
        ('contract', 'Contract'),
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('statement', 'Statement'),
    ])
    
    class Meta:
        db_table = 'example_company_documents'
        verbose_name = 'Company Document'
        verbose_name_plural = 'Company Documents'
    
    def __str__(self):
        return f"{self.title} ({self.document_type})"


class ExampleUserPreference(UserScopedModel):
    """
    Example user preference using user-scoped model.
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
        db_table = 'example_user_preferences'
        verbose_name = 'User Preference'
        verbose_name_plural = 'User Preferences'
        unique_together = ['user', 'setting_name']
    
    def __str__(self):
        return f"{self.setting_name} = {self.setting_value}"


class ExampleAuditRecord(AuditModel):
    """
    Example audit record using audit model.
    Includes automatic audit trail and compliance features.
    """
    
    action = models.CharField(max_length=50, choices=[
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
    ])
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100)
    details = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'example_audit_records'
        verbose_name = 'Audit Record'
        verbose_name_plural = 'Audit Records'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.action} {self.resource_type} {self.resource_id}"


# Example usage in views
def example_view_usage():
    """
    Example of how to use the enhanced models in views.
    """
    from django.shortcuts import render
    from django.http import JsonResponse
    from backend.enhanced_base_models import get_tenant_queryset, ensure_tenant_access
    
    def list_financial_records(request):
        """List financial records for current tenant"""
        # Automatic tenant filtering - no need to manually filter
        records = ExampleFinancialRecord.objects.all()  # Automatically filtered by tenant
        
        # Convert to list for JSON response
        data = [
            {
                'id': str(record.id),
                'name': record.name,
                'balance': float(record.balance),  # Automatically decrypted
                'currency': record.currency,
                'is_active': record.is_active,
            }
            for record in records
        ]
        
        return JsonResponse({'records': data})
    
    def get_financial_record(request, record_id):
        """Get specific financial record"""
        try:
            # Automatic tenant filtering - will only return records for current tenant
            record = ExampleFinancialRecord.objects.get(id=record_id)
            
            # Additional security check (redundant but good practice)
            ensure_tenant_access(record)
            
            data = {
                'id': str(record.id),
                'name': record.name,
                'account_number': record.account_number,  # Automatically decrypted
                'balance': float(record.balance),  # Automatically decrypted
                'currency': record.currency,
                'description': record.description,
                'is_active': record.is_active,
            }
            
            return JsonResponse({'record': data})
            
        except ExampleFinancialRecord.DoesNotExist:
            return JsonResponse({'error': 'Record not found'}, status=404)
    
    def create_financial_record(request):
        """Create new financial record"""
        if request.method == 'POST':
            data = request.json
            
            # Create record - tenant is automatically assigned
            record = ExampleFinancialRecord.objects.create(
                name=data['name'],
                account_number=data['account_number'],  # Automatically encrypted
                balance=data['balance'],  # Automatically encrypted
                currency=data.get('currency', 'USD'),
                description=data.get('description', ''),
            )
            
            return JsonResponse({
                'id': str(record.id),
                'message': 'Record created successfully'
            })
        
        return JsonResponse({'error': 'Method not allowed'}, status=405)


# Example usage in serializers
def example_serializer_usage():
    """
    Example of how to use the enhanced models in serializers.
    """
    from rest_framework import serializers
    
    class FinancialRecordSerializer(serializers.ModelSerializer):
        """Serializer for financial records"""
        
        class Meta:
            model = ExampleFinancialRecord
            fields = [
                'id', 'name', 'account_number', 'balance', 'currency',
                'description', 'is_active', 'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']
        
        def create(self, validated_data):
            """Create financial record with automatic tenant assignment"""
            # Tenant is automatically assigned by the model
            return ExampleFinancialRecord.objects.create(**validated_data)
        
        def update(self, instance, validated_data):
            """Update financial record with automatic tenant validation"""
            # Tenant access is automatically validated by the model
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
    
    class CompanyDocumentSerializer(serializers.ModelSerializer):
        """Serializer for company documents"""
        
        class Meta:
            model = ExampleCompanyDocument
            fields = [
                'id', 'title', 'content', 'file_path', 'document_type',
                'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']
    
    class UserPreferenceSerializer(serializers.ModelSerializer):
        """Serializer for user preferences"""
        
        class Meta:
            model = ExampleUserPreference
            fields = [
                'id', 'setting_name', 'setting_value', 'setting_type',
                'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']


# Example usage in management commands
def example_management_command_usage():
    """
    Example of how to use the enhanced models in management commands.
    """
    from django.core.management.base import BaseCommand
    from backend.enhanced_base_models import get_tenant_queryset
    
    class Command(BaseCommand):
        help = 'Example management command using enhanced models'
        
        def add_arguments(self, parser):
            parser.add_argument('--tenant-id', type=str, help='Tenant ID to process')
            parser.add_argument('--action', type=str, choices=['list', 'cleanup'], help='Action to perform')
        
        def handle(self, *args, **options):
            tenant_id = options.get('tenant_id')
            action = options.get('action', 'list')
            
            if action == 'list':
                self.list_records(tenant_id)
            elif action == 'cleanup':
                self.cleanup_records(tenant_id)
        
        def list_records(self, tenant_id):
            """List records for tenant"""
            # Get records for specific tenant
            records = get_tenant_queryset(ExampleFinancialRecord, tenant_id)
            
            self.stdout.write(f'Found {records.count()} financial records')
            for record in records:
                self.stdout.write(f'  - {record.name}: {record.balance} {record.currency}')
        
        def cleanup_records(self, tenant_id):
            """Cleanup inactive records for tenant"""
            # Get inactive records for tenant
            records = get_tenant_queryset(ExampleFinancialRecord, tenant_id)
            inactive_records = records.filter(is_active=False)
            
            count = inactive_records.count()
            inactive_records.delete()
            
            self.stdout.write(f'Deleted {count} inactive records')


# Example usage in tests
def example_test_usage():
    """
    Example of how to test the enhanced models.
    """
    from django.test import TestCase
    from django.contrib.auth import get_user_model
    from tenants.models import Tenant, Company
    from backend.enhanced_base_models import get_current_tenant, get_current_user
    
    User = get_user_model()
    
    class EnhancedModelTestCase(TestCase):
        """Test case for enhanced models"""
        
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
            # Create records for different tenants
            tenant2 = Tenant.objects.create(
                schema_name='test_tenant_2',
                name='Test Tenant 2'
            )
            
            # Create record for current tenant
            record1 = ExampleFinancialRecord.objects.create(
                tenant=self.tenant,
                name='Record 1',
                account_number='123456',
                balance=1000.00
            )
            
            # Create record for different tenant
            record2 = ExampleFinancialRecord.objects.create(
                tenant=tenant2,
                name='Record 2',
                account_number='789012',
                balance=2000.00
            )
            
            # Test automatic tenant filtering
            with patch('backend.enhanced_base_models.get_current_tenant', return_value=self.tenant):
                records = ExampleFinancialRecord.objects.all()
                self.assertEqual(records.count(), 1)
                self.assertEqual(records.first(), record1)
        
        def test_automatic_tenant_assignment(self):
            """Test that tenant is automatically assigned"""
            with patch('backend.enhanced_base_models.get_current_tenant', return_value=self.tenant):
                record = ExampleFinancialRecord.objects.create(
                    name='Test Record',
                    account_number='123456',
                    balance=1000.00
                )
                
                self.assertEqual(record.tenant, self.tenant)
        
        def test_encryption(self):
            """Test that sensitive fields are encrypted"""
            record = ExampleFinancialRecord.objects.create(
                tenant=self.tenant,
                name='Test Record',
                account_number='123456',
                balance=1000.00
            )
            
            # Check that encrypted fields are stored encrypted
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT account_number, balance FROM example_financial_records WHERE id = %s",
                    [record.id]
                )
                row = cursor.fetchone()
                
                # These should be encrypted in the database
                self.assertNotEqual(row[0], '123456')
                self.assertNotEqual(row[1], 1000.00)
            
            # But should be decrypted when accessed
            self.assertEqual(record.account_number, '123456')
            self.assertEqual(record.balance, 1000.00)
        
        def test_audit_logging(self):
            """Test that audit logging works"""
            with patch('backend.enhanced_base_models.get_current_user', return_value=self.user):
                record = ExampleFinancialRecord.objects.create(
                    tenant=self.tenant,
                    name='Test Record',
                    account_number='123456',
                    balance=1000.00
                )
                
                # Check that audit fields are set
                self.assertEqual(record.created_by, self.user)
                self.assertIsNotNone(record.created_at)
        
        def test_company_scoped_model(self):
            """Test company-scoped model"""
            document = ExampleCompanyDocument.objects.create(
                company=self.company,
                title='Test Document',
                content='Test content',
                document_type='contract'
            )
            
            # Should be automatically filtered by company
            documents = ExampleCompanyDocument.objects.all()
            self.assertEqual(documents.count(), 1)
            self.assertEqual(documents.first(), document)
        
        def test_user_scoped_model(self):
            """Test user-scoped model"""
            preference = ExampleUserPreference.objects.create(
                user=self.user,
                setting_name='theme',
                setting_value='dark',
                setting_type='string'
            )
            
            # Should be automatically filtered by user
            preferences = ExampleUserPreference.objects.all()
            self.assertEqual(preferences.count(), 1)
            self.assertEqual(preferences.first(), preference)


# Example usage in migrations
def example_migration_usage():
    """
    Example of how to create migrations for enhanced models.
    """
    from django.db import migrations, models
    from backend.enhanced_base_models import TenantScopedModel
    
    class Migration(migrations.Migration):
        """Example migration for enhanced model"""
        
        initial = True
        
        dependencies = [
            ('tenants', '0001_initial'),
            ('authentication', '0001_initial'),
        ]
        
        operations = [
            migrations.CreateModel(
                name='ExampleFinancialRecord',
                fields=[
                    ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
                    ('tenant', models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)),
                    ('created_at', models.DateTimeField(auto_now_add=True)),
                    ('updated_at', models.DateTimeField(auto_now=True)),
                    ('created_by', models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)),
                    ('updated_by', models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)),
                    ('name', models.CharField(max_length=255)),
                    ('account_number', models.TextField()),  # Encrypted field
                    ('balance', models.TextField()),  # Encrypted field
                    ('currency', models.CharField(max_length=3, default='USD')),
                    ('description', models.TextField(blank=True)),
                    ('is_active', models.BooleanField(default=True)),
                    ('data_classification', models.CharField(max_length=20, default='confidential')),
                    ('requires_audit', models.BooleanField(default=True)),
                    ('retention_period_days', models.PositiveIntegerField(default=2555)),
                    ('is_sensitive', models.BooleanField(default=True)),
                ],
                options={
                    'db_table': 'example_financial_records',
                    'verbose_name': 'Financial Record',
                    'verbose_name_plural': 'Financial Records',
                },
            ),
            migrations.AddIndex(
                model_name='examplefinancialrecord',
                index=models.Index(fields=['tenant', 'created_at'], name='example_financial_records_tenant_created_idx'),
            ),
            migrations.AddIndex(
                model_name='examplefinancialrecord',
                index=models.Index(fields=['tenant', 'is_active'], name='example_financial_records_tenant_active_idx'),
            ),
        ]
