"""
Tests for Audit Logging and Compliance
Tests audit logging functionality, compliance reporting, and data governance.
"""

import pytest
import time
import threading
from decimal import Decimal
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.db import transaction, connection
from django.core.cache import cache
from django.utils import timezone
from unittest.mock import patch, MagicMock
from tenants.models import Tenant, Domain
from backend.audit_models import AuditLog, AuditQuery, AuditExport, AuditViolation
from backend.audit_service import audit_service
from backend.audit_api import AuditAPIView
from backend.audit_signals import audit_logger
from backend.row_tenant_middleware import set_tenant_context, get_current_tenant

User = get_user_model()


class AuditLoggingTestCase(TestCase):
    """
    Test case for audit logging functionality.
    """
    
    def setUp(self):
        """Set up test data for audit logging tests"""
        # Create test tenant
        self.tenant = Tenant.objects.create(
            schema_name='test_tenant',
            name='Test Tenant',
            description='Test Tenant for Audit Logging'
        )
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@tenant.com',
            username='testuser',
            password='testpass123',
            tenant=self.tenant
        )
        
        # Create test domain
        Domain.objects.create(
            domain='test.example.com',
            tenant=self.tenant,
            is_primary=True
        )
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_audit_log_creation(self):
        """Test audit log creation"""
        # Create audit log
        audit_log = AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-1',
            details={'test': 'data'}
        )
        
        # Verify audit log was created
        self.assertIsNotNone(audit_log.id)
        self.assertEqual(audit_log.tenant, self.tenant)
        self.assertEqual(audit_log.user, self.user)
        self.assertEqual(audit_log.operation, 'CREATE')
        self.assertEqual(audit_log.resource_type, 'TestModel')
        self.assertEqual(audit_log.resource_id, 'test-id-1')
        self.assertEqual(audit_log.details, {'test': 'data'})
        self.assertIsNotNone(audit_log.timestamp)
    
    def test_audit_log_tenant_isolation(self):
        """Test audit log tenant isolation"""
        # Create another tenant
        other_tenant = Tenant.objects.create(
            schema_name='other_tenant',
            name='Other Tenant',
            description='Other Tenant for Audit Logging'
        )
        
        # Create audit logs for both tenants
        audit_log_1 = AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-1',
            details={'test': 'data_1'}
        )
        
        audit_log_2 = AuditLog.objects.create(
            tenant=other_tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-2',
            details={'test': 'data_2'}
        )
        
        # Test tenant isolation
        tenant_1_logs = AuditLog.objects.filter(tenant=self.tenant)
        tenant_2_logs = AuditLog.objects.filter(tenant=other_tenant)
        
        self.assertEqual(tenant_1_logs.count(), 1)
        self.assertEqual(tenant_2_logs.count(), 1)
        self.assertIn(audit_log_1, tenant_1_logs)
        self.assertIn(audit_log_2, tenant_2_logs)
        self.assertNotIn(audit_log_1, tenant_2_logs)
        self.assertNotIn(audit_log_2, tenant_1_logs)
    
    def test_audit_log_operations(self):
        """Test different audit log operations"""
        operations = ['CREATE', 'UPDATE', 'DELETE', 'READ', 'EXPORT', 'IMPORT']
        
        for operation in operations:
            audit_log = AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation=operation,
                resource_type='TestModel',
                resource_id=f'test-id-{operation.lower()}',
                details={'operation': operation}
            )
            
            self.assertEqual(audit_log.operation, operation)
            self.assertEqual(audit_log.resource_type, 'TestModel')
            self.assertEqual(audit_log.resource_id, f'test-id-{operation.lower()}')
            self.assertEqual(audit_log.details, {'operation': operation})
    
    def test_audit_log_filtering(self):
        """Test audit log filtering"""
        # Create audit logs with different operations
        AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-1',
            details={'test': 'data_1'}
        )
        
        AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='UPDATE',
            resource_type='TestModel',
            resource_id='test-id-2',
            details={'test': 'data_2'}
        )
        
        AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='DELETE',
            resource_type='TestModel',
            resource_id='test-id-3',
            details={'test': 'data_3'}
        )
        
        # Test filtering by operation
        create_logs = AuditLog.objects.filter(tenant=self.tenant, operation='CREATE')
        update_logs = AuditLog.objects.filter(tenant=self.tenant, operation='UPDATE')
        delete_logs = AuditLog.objects.filter(tenant=self.tenant, operation='DELETE')
        
        self.assertEqual(create_logs.count(), 1)
        self.assertEqual(update_logs.count(), 1)
        self.assertEqual(delete_logs.count(), 1)
        
        # Test filtering by resource type
        test_model_logs = AuditLog.objects.filter(tenant=self.tenant, resource_type='TestModel')
        self.assertEqual(test_model_logs.count(), 3)
        
        # Test filtering by user
        user_logs = AuditLog.objects.filter(tenant=self.tenant, user=self.user)
        self.assertEqual(user_logs.count(), 3)
    
    def test_audit_log_aggregation(self):
        """Test audit log aggregation"""
        # Create audit logs with different operations
        for i in range(10):
            operation = ['CREATE', 'UPDATE', 'DELETE'][i % 3]
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation=operation,
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Test aggregation by operation
        operation_counts = AuditLog.objects.filter(tenant=self.tenant).values('operation').annotate(
            count=models.Count('id')
        )
        
        self.assertEqual(len(operation_counts), 3)
        
        # Test aggregation by resource type
        resource_counts = AuditLog.objects.filter(tenant=self.tenant).values('resource_type').annotate(
            count=models.Count('id')
        )
        
        self.assertEqual(len(resource_counts), 1)
        self.assertEqual(resource_counts[0]['count'], 10)
    
    def test_audit_log_timestamp_filtering(self):
        """Test audit log timestamp filtering"""
        # Create audit logs with different timestamps
        now = timezone.now()
        
        for i in range(5):
            audit_log = AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
            
            # Manually set timestamp to test filtering
            audit_log.timestamp = now - timezone.timedelta(hours=i)
            audit_log.save()
        
        # Test filtering by timestamp range
        recent_logs = AuditLog.objects.filter(
            tenant=self.tenant,
            timestamp__gte=now - timezone.timedelta(hours=2)
        )
        self.assertEqual(recent_logs.count(), 3)
        
        # Test filtering by specific timestamp
        specific_logs = AuditLog.objects.filter(
            tenant=self.tenant,
            timestamp__date=now.date()
        )
        self.assertEqual(specific_logs.count(), 5)
    
    def test_audit_log_details_filtering(self):
        """Test audit log details filtering"""
        # Create audit logs with different details
        AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-1',
            details={'category': 'financial', 'amount': 100.00}
        )
        
        AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-2',
            details={'category': 'personal', 'amount': 50.00}
        )
        
        AuditLog.objects.create(
            tenant=self.tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-3',
            details={'category': 'financial', 'amount': 200.00}
        )
        
        # Test filtering by details (using JSON field queries)
        financial_logs = AuditLog.objects.filter(
            tenant=self.tenant,
            details__category='financial'
        )
        self.assertEqual(financial_logs.count(), 2)
        
        high_amount_logs = AuditLog.objects.filter(
            tenant=self.tenant,
            details__amount__gte=150.00
        )
        self.assertEqual(high_amount_logs.count(), 1)
    
    def test_audit_log_export(self):
        """Test audit log export functionality"""
        # Create audit logs
        for i in range(10):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Test export creation
        export = AuditExport.objects.create(
            tenant=self.tenant,
            user=self.user,
            export_type='CSV',
            filters={'operation': 'CREATE'},
            status='PENDING'
        )
        
        self.assertIsNotNone(export.id)
        self.assertEqual(export.tenant, self.tenant)
        self.assertEqual(export.user, self.user)
        self.assertEqual(export.export_type, 'CSV')
        self.assertEqual(export.filters, {'operation': 'CREATE'})
        self.assertEqual(export.status, 'PENDING')
    
    def test_audit_log_violation(self):
        """Test audit log violation functionality"""
        # Create audit violation
        violation = AuditViolation.objects.create(
            tenant=self.tenant,
            user=self.user,
            violation_type='UNAUTHORIZED_ACCESS',
            severity='HIGH',
            description='Unauthorized access attempt',
            details={'ip_address': '192.168.1.1', 'user_agent': 'Mozilla/5.0'}
        )
        
        self.assertIsNotNone(violation.id)
        self.assertEqual(violation.tenant, self.tenant)
        self.assertEqual(violation.user, self.user)
        self.assertEqual(violation.violation_type, 'UNAUTHORIZED_ACCESS')
        self.assertEqual(violation.severity, 'HIGH')
        self.assertEqual(violation.description, 'Unauthorized access attempt')
        self.assertEqual(violation.details, {'ip_address': '192.168.1.1', 'user_agent': 'Mozilla/5.0'})
    
    def test_audit_log_query(self):
        """Test audit log query functionality"""
        # Create audit query
        query = AuditQuery.objects.create(
            tenant=self.tenant,
            user=self.user,
            query_type='OPERATION_COUNT',
            parameters={'operation': 'CREATE', 'days': 30},
            status='PENDING'
        )
        
        self.assertIsNotNone(query.id)
        self.assertEqual(query.tenant, self.tenant)
        self.assertEqual(query.user, self.user)
        self.assertEqual(query.query_type, 'OPERATION_COUNT')
        self.assertEqual(query.parameters, {'operation': 'CREATE', 'days': 30})
        self.assertEqual(query.status, 'PENDING')


class AuditServiceTestCase(TestCase):
    """
    Test case for audit service functionality.
    """
    
    def setUp(self):
        """Set up test data for audit service tests"""
        # Create test tenant
        self.tenant = Tenant.objects.create(
            schema_name='test_tenant',
            name='Test Tenant',
            description='Test Tenant for Audit Service'
        )
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@tenant.com',
            username='testuser',
            password='testpass123',
            tenant=self.tenant
        )
        
        # Create test domain
        Domain.objects.create(
            domain='test.example.com',
            tenant=self.tenant,
            is_primary=True
        )
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_audit_service_log_operation(self):
        """Test audit service log operation"""
        # Log operation
        audit_service.log_operation(
            tenant=self.tenant,
            user=self.user,
            operation='CREATE',
            resource_type='TestModel',
            resource_id='test-id-1',
            details={'test': 'data'}
        )
        
        # Verify audit log was created
        audit_logs = AuditLog.objects.filter(tenant=self.tenant)
        self.assertEqual(audit_logs.count(), 1)
        
        audit_log = audit_logs.first()
        self.assertEqual(audit_log.tenant, self.tenant)
        self.assertEqual(audit_log.user, self.user)
        self.assertEqual(audit_log.operation, 'CREATE')
        self.assertEqual(audit_log.resource_type, 'TestModel')
        self.assertEqual(audit_log.resource_id, 'test-id-1')
        self.assertEqual(audit_log.details, {'test': 'data'})
    
    def test_audit_service_log_violation(self):
        """Test audit service log violation"""
        # Log violation
        audit_service.log_violation(
            tenant=self.tenant,
            user=self.user,
            violation_type='UNAUTHORIZED_ACCESS',
            severity='HIGH',
            description='Unauthorized access attempt',
            details={'ip_address': '192.168.1.1'}
        )
        
        # Verify audit violation was created
        violations = AuditViolation.objects.filter(tenant=self.tenant)
        self.assertEqual(violations.count(), 1)
        
        violation = violations.first()
        self.assertEqual(violation.tenant, self.tenant)
        self.assertEqual(violation.user, self.user)
        self.assertEqual(violation.violation_type, 'UNAUTHORIZED_ACCESS')
        self.assertEqual(violation.severity, 'HIGH')
        self.assertEqual(violation.description, 'Unauthorized access attempt')
        self.assertEqual(violation.details, {'ip_address': '192.168.1.1'})
    
    def test_audit_service_get_audit_logs(self):
        """Test audit service get audit logs"""
        # Create audit logs
        for i in range(10):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Get audit logs
        audit_logs = audit_service.get_audit_logs(
            tenant=self.tenant,
            operation='CREATE',
            limit=5
        )
        
        self.assertEqual(len(audit_logs), 5)
        for audit_log in audit_logs:
            self.assertEqual(audit_log.tenant, self.tenant)
            self.assertEqual(audit_log.operation, 'CREATE')
    
    def test_audit_service_get_compliance_report(self):
        """Test audit service get compliance report"""
        # Create audit logs for compliance report
        operations = ['CREATE', 'UPDATE', 'DELETE']
        for i in range(30):
            operation = operations[i % 3]
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation=operation,
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Get compliance report
        report = audit_service.get_compliance_report(
            tenant=self.tenant,
            start_date=timezone.now() - timezone.timedelta(days=30),
            end_date=timezone.now()
        )
        
        self.assertIsNotNone(report)
        self.assertIn('total_operations', report)
        self.assertIn('operations_by_type', report)
        self.assertIn('operations_by_user', report)
        self.assertIn('operations_by_resource', report)
        
        self.assertEqual(report['total_operations'], 30)
        self.assertEqual(len(report['operations_by_type']), 3)
    
    def test_audit_service_get_user_activity(self):
        """Test audit service get user activity"""
        # Create audit logs for user activity
        for i in range(20):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Get user activity
        activity = audit_service.get_user_activity(
            tenant=self.tenant,
            user=self.user,
            days=30
        )
        
        self.assertIsNotNone(activity)
        self.assertIn('total_operations', activity)
        self.assertIn('operations_by_type', activity)
        self.assertIn('operations_by_resource', activity)
        self.assertIn('recent_operations', activity)
        
        self.assertEqual(activity['total_operations'], 20)
    
    def test_audit_service_get_resource_audit_trail(self):
        """Test audit service get resource audit trail"""
        # Create audit logs for resource audit trail
        resource_id = 'test-resource-1'
        for i in range(10):
            operation = ['CREATE', 'UPDATE', 'DELETE'][i % 3]
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation=operation,
                resource_type='TestModel',
                resource_id=resource_id,
                details={'test': f'data_{i}'}
            )
        
        # Get resource audit trail
        trail = audit_service.get_resource_audit_trail(
            tenant=self.tenant,
            resource_type='TestModel',
            resource_id=resource_id
        )
        
        self.assertIsNotNone(trail)
        self.assertIn('resource_type', trail)
        self.assertIn('resource_id', trail)
        self.assertIn('operations', trail)
        self.assertIn('total_operations', trail)
        
        self.assertEqual(trail['resource_type'], 'TestModel')
        self.assertEqual(trail['resource_id'], resource_id)
        self.assertEqual(trail['total_operations'], 10)
        self.assertEqual(len(trail['operations']), 10)
    
    def test_audit_service_export_audit_logs(self):
        """Test audit service export audit logs"""
        # Create audit logs
        for i in range(10):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Export audit logs
        export = audit_service.export_audit_logs(
            tenant=self.tenant,
            user=self.user,
            export_type='CSV',
            filters={'operation': 'CREATE'}
        )
        
        self.assertIsNotNone(export)
        self.assertEqual(export.tenant, self.tenant)
        self.assertEqual(export.user, self.user)
        self.assertEqual(export.export_type, 'CSV')
        self.assertEqual(export.filters, {'operation': 'CREATE'})
    
    def test_audit_service_performance(self):
        """Test audit service performance"""
        # Test logging performance
        start_time = time.time()
        
        for i in range(100):
            audit_service.log_operation(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        logging_time = time.time() - start_time
        
        # Test query performance
        start_time = time.time()
        
        audit_logs = audit_service.get_audit_logs(
            tenant=self.tenant,
            operation='CREATE',
            limit=50
        )
        
        query_time = time.time() - start_time
        
        # Performance assertions
        self.assertLess(logging_time, 5.0)  # Should log 100 operations in less than 5 seconds
        self.assertLess(query_time, 2.0)  # Should query in less than 2 seconds
        
        print(f"Logging 100 operations took: {logging_time:.3f}s")
        print(f"Querying 50 operations took: {query_time:.3f}s")
    
    def test_audit_service_concurrent_access(self):
        """Test audit service concurrent access"""
        import threading
        import queue
        
        results = queue.Queue()
        
        def audit_operation(operation_id):
            """Perform audit operation"""
            try:
                audit_service.log_operation(
                    tenant=self.tenant,
                    user=self.user,
                    operation='CREATE',
                    resource_type='TestModel',
                    resource_id=f'concurrent-id-{operation_id}',
                    details={'test': f'data_{operation_id}'}
                )
                
                results.put({
                    'operation_id': operation_id,
                    'success': True,
                    'timestamp': timezone.now().isoformat()
                })
            except Exception as e:
                results.put({
                    'operation_id': operation_id,
                    'success': False,
                    'error': str(e),
                    'timestamp': timezone.now().isoformat()
                })
        
        # Test concurrent audit operations
        start_time = time.time()
        
        threads = []
        for i in range(10):
            thread = threading.Thread(target=audit_operation, args=(i,))
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        execution_time = time.time() - start_time
        
        # Verify results
        result_list = []
        while not results.empty():
            result_list.append(results.get())
        
        self.assertEqual(len(result_list), 10)
        success_count = sum(1 for result in result_list if result['success'])
        self.assertEqual(success_count, 10)
        
        # Performance assertion
        self.assertLess(execution_time, 5.0)  # Should complete in less than 5 seconds
        
        print(f"Concurrent audit operations completed in {execution_time:.3f}s")
        print(f"Success rate: {success_count}/10")


class AuditComplianceTestCase(TestCase):
    """
    Test case for audit compliance functionality.
    """
    
    def setUp(self):
        """Set up test data for audit compliance tests"""
        # Create test tenant
        self.tenant = Tenant.objects.create(
            schema_name='test_tenant',
            name='Test Tenant',
            description='Test Tenant for Audit Compliance'
        )
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@tenant.com',
            username='testuser',
            password='testpass123',
            tenant=self.tenant
        )
        
        # Create test domain
        Domain.objects.create(
            domain='test.example.com',
            tenant=self.tenant,
            is_primary=True
        )
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_sox_compliance(self):
        """Test SOX compliance reporting"""
        # Create audit logs for SOX compliance
        operations = ['CREATE', 'UPDATE', 'DELETE', 'READ', 'EXPORT']
        for i in range(100):
            operation = operations[i % 5]
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation=operation,
                resource_type='FinancialModel',
                resource_id=f'financial-id-{i}',
                details={'amount': 100.00 + i, 'category': 'revenue'}
            )
        
        # Get SOX compliance report
        sox_report = audit_service.get_sox_compliance_report(
            tenant=self.tenant,
            start_date=timezone.now() - timezone.timedelta(days=30),
            end_date=timezone.now()
        )
        
        self.assertIsNotNone(sox_report)
        self.assertIn('total_operations', sox_report)
        self.assertIn('financial_operations', sox_report)
        self.assertIn('access_controls', sox_report)
        self.assertIn('data_integrity', sox_report)
        
        self.assertEqual(sox_report['total_operations'], 100)
        self.assertEqual(sox_report['financial_operations'], 100)
    
    def test_pci_compliance(self):
        """Test PCI compliance reporting"""
        # Create audit logs for PCI compliance
        for i in range(50):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='PaymentModel',
                resource_id=f'payment-id-{i}',
                details={'card_number': '****1234', 'amount': 50.00 + i}
            )
        
        # Get PCI compliance report
        pci_report = audit_service.get_pci_compliance_report(
            tenant=self.tenant,
            start_date=timezone.now() - timezone.timedelta(days=30),
            end_date=timezone.now()
        )
        
        self.assertIsNotNone(pci_report)
        self.assertIn('total_operations', pci_report)
        self.assertIn('payment_operations', pci_report)
        self.assertIn('data_protection', pci_report)
        self.assertIn('access_controls', pci_report)
        
        self.assertEqual(pci_report['total_operations'], 50)
        self.assertEqual(pci_report['payment_operations'], 50)
    
    def test_gdpr_compliance(self):
        """Test GDPR compliance reporting"""
        # Create audit logs for GDPR compliance
        for i in range(75):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='PersonalDataModel',
                resource_id=f'personal-id-{i}',
                details={'data_type': 'personal', 'consent': True}
            )
        
        # Get GDPR compliance report
        gdpr_report = audit_service.get_gdpr_compliance_report(
            tenant=self.tenant,
            start_date=timezone.now() - timezone.timedelta(days=30),
            end_date=timezone.now()
        )
        
        self.assertIsNotNone(gdpr_report)
        self.assertIn('total_operations', gdpr_report)
        self.assertIn('personal_data_operations', gdpr_report)
        self.assertIn('consent_management', gdpr_report)
        self.assertIn('data_retention', gdpr_report)
        
        self.assertEqual(gdpr_report['total_operations'], 75)
        self.assertEqual(gdpr_report['personal_data_operations'], 75)
    
    def test_hipaa_compliance(self):
        """Test HIPAA compliance reporting"""
        # Create audit logs for HIPAA compliance
        for i in range(60):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='HealthDataModel',
                resource_id=f'health-id-{i}',
                details={'data_type': 'health', 'sensitivity': 'high'}
            )
        
        # Get HIPAA compliance report
        hipaa_report = audit_service.get_hipaa_compliance_report(
            tenant=self.tenant,
            start_date=timezone.now() - timezone.timedelta(days=30),
            end_date=timezone.now()
        )
        
        self.assertIsNotNone(hipaa_report)
        self.assertIn('total_operations', hipaa_report)
        self.assertIn('health_data_operations', hipaa_report)
        self.assertIn('access_controls', hipaa_report)
        self.assertIn('data_encryption', hipaa_report)
        
        self.assertEqual(hipaa_report['total_operations'], 60)
        self.assertEqual(hipaa_report['health_data_operations'], 60)
    
    def test_basel_iii_compliance(self):
        """Test Basel III compliance reporting"""
        # Create audit logs for Basel III compliance
        for i in range(80):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='RiskModel',
                resource_id=f'risk-id-{i}',
                details={'risk_type': 'credit', 'amount': 1000.00 + i}
            )
        
        # Get Basel III compliance report
        basel_report = audit_service.get_basel_iii_compliance_report(
            tenant=self.tenant,
            start_date=timezone.now() - timezone.timedelta(days=30),
            end_date=timezone.now()
        )
        
        self.assertIsNotNone(basel_report)
        self.assertIn('total_operations', basel_report)
        self.assertIn('risk_operations', basel_report)
        self.assertIn('capital_adequacy', basel_report)
        self.assertIn('risk_management', basel_report)
        
        self.assertEqual(basel_report['total_operations'], 80)
        self.assertEqual(basel_report['risk_operations'], 80)
    
    def test_compliance_violations(self):
        """Test compliance violations"""
        # Create compliance violations
        violations = [
            {
                'violation_type': 'UNAUTHORIZED_ACCESS',
                'severity': 'HIGH',
                'description': 'Unauthorized access to financial data'
            },
            {
                'violation_type': 'DATA_BREACH',
                'severity': 'CRITICAL',
                'description': 'Potential data breach detected'
            },
            {
                'violation_type': 'COMPLIANCE_VIOLATION',
                'severity': 'MEDIUM',
                'description': 'Compliance policy violation'
            }
        ]
        
        for violation in violations:
            AuditViolation.objects.create(
                tenant=self.tenant,
                user=self.user,
                violation_type=violation['violation_type'],
                severity=violation['severity'],
                description=violation['description'],
                details={'test': 'data'}
            )
        
        # Get compliance violations
        compliance_violations = audit_service.get_compliance_violations(
            tenant=self.tenant,
            severity='HIGH'
        )
        
        self.assertIsNotNone(compliance_violations)
        self.assertIn('total_violations', compliance_violations)
        self.assertIn('violations_by_severity', compliance_violations)
        self.assertIn('violations_by_type', compliance_violations)
        
        self.assertEqual(compliance_violations['total_violations'], 3)
        self.assertEqual(len(compliance_violations['violations_by_severity']), 3)
        self.assertEqual(len(compliance_violations['violations_by_type']), 3)
    
    def test_compliance_reporting_performance(self):
        """Test compliance reporting performance"""
        # Create large dataset for compliance reporting
        for i in range(1000):
            operation = ['CREATE', 'UPDATE', 'DELETE', 'READ'][i % 4]
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation=operation,
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Test compliance report performance
        start_time = time.time()
        
        compliance_report = audit_service.get_compliance_report(
            tenant=self.tenant,
            start_date=timezone.now() - timezone.timedelta(days=30),
            end_date=timezone.now()
        )
        
        execution_time = time.time() - start_time
        
        # Performance assertion
        self.assertLess(execution_time, 5.0)  # Should complete in less than 5 seconds
        
        print(f"Compliance report generation took: {execution_time:.3f}s")
    
    def test_compliance_export(self):
        """Test compliance export functionality"""
        # Create audit logs for compliance export
        for i in range(50):
            AuditLog.objects.create(
                tenant=self.tenant,
                user=self.user,
                operation='CREATE',
                resource_type='TestModel',
                resource_id=f'test-id-{i}',
                details={'test': f'data_{i}'}
            )
        
        # Export compliance data
        export = audit_service.export_compliance_data(
            tenant=self.tenant,
            user=self.user,
            export_type='CSV',
            compliance_framework='SOX'
        )
        
        self.assertIsNotNone(export)
        self.assertEqual(export.tenant, self.tenant)
        self.assertEqual(export.user, self.user)
        self.assertEqual(export.export_type, 'CSV')
        self.assertIn('compliance_framework', export.filters)
        self.assertEqual(export.filters['compliance_framework'], 'SOX')
