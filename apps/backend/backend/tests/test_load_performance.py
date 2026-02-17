"""
Load Tests for Multi-Tenant System
Tests performance with 10,000 tenants and 1,000 records each.
"""

import pytest
import time
import threading
import multiprocessing
from decimal import Decimal
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.db import transaction, connection
from django.core.cache import cache
from django.utils import timezone
from unittest.mock import patch, MagicMock
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from tenants.models import Tenant, Domain
from backend.tenant_base_model import TenantBaseModel
from backend.query_optimization import OptimizedTenantManager, query_optimizer
from backend.redis_cache import redis_cache_manager, get_tenant_dashboard_data
from backend.audit_service import audit_service
from backend.row_tenant_middleware import set_tenant_context, get_current_tenant

User = get_user_model()


class LoadPerformanceTestCase(TestCase):
    """
    Load test case for multi-tenant system performance.
    """
    
    def setUp(self):
        """Set up test data for load tests"""
        # Create test tenants (limited for testing)
        self.tenants = []
        for i in range(10):  # Create 10 tenants for testing
            tenant = Tenant.objects.create(
                schema_name=f'tenant_{i}',
                name=f'Tenant {i}',
                description=f'Test Tenant {i}'
            )
            self.tenants.append(tenant)
            
            # Create domain for tenant
            Domain.objects.create(
                domain=f'tenant-{i}.example.com',
                tenant=tenant,
                is_primary=True
            )
        
        # Create test users for each tenant
        self.users = []
        for i, tenant in enumerate(self.tenants):
            user = User.objects.create_user(
                email=f'user_{i}@tenant-{i}.com',
                username=f'user_{i}',
                password='testpass123',
                tenant=tenant
            )
            self.users.append(user)
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_tenant_creation_performance(self):
        """Test performance of creating multiple tenants"""
        start_time = time.time()
        
        # Create additional tenants
        additional_tenants = []
        for i in range(100):  # Create 100 additional tenants
            tenant = Tenant.objects.create(
                schema_name=f'load_tenant_{i}',
                name=f'Load Tenant {i}',
                description=f'Load Test Tenant {i}'
            )
            additional_tenants.append(tenant)
        
        creation_time = time.time() - start_time
        
        # Verify tenants were created
        self.assertEqual(len(additional_tenants), 100)
        
        # Performance assertion (should create 100 tenants in reasonable time)
        self.assertLess(creation_time, 10.0)  # Should take less than 10 seconds
        
        print(f"Created 100 tenants in {creation_time:.3f} seconds")
    
    def test_concurrent_tenant_access(self):
        """Test concurrent access to different tenants"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_load_model'
        
        # Create test data for each tenant
        for i, tenant in enumerate(self.tenants):
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                for j in range(10):  # Create 10 records per tenant
                    TestModel.objects.create(
                        tenant=tenant,
                        name=f'Record {j} for Tenant {i}',
                        value=Decimal(f'{100.00 + j}')
                    )
        
        def access_tenant_data(tenant_index):
            """Access tenant data concurrently"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Simulate some work
                records = TestModel.objects.filter(tenant=tenant)
                count = records.count()
                
                # Test filtering
                filtered_records = TestModel.objects.filter(
                    tenant=tenant,
                    value__gte=Decimal('105.00')
                )
                filtered_count = filtered_records.count()
                
                return {
                    'tenant_id': tenant.id,
                    'total_records': count,
                    'filtered_records': filtered_count,
                    'timestamp': timezone.now().isoformat()
                }
        
        # Test concurrent access
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(access_tenant_data, i) for i in range(10)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 10)
        for result in results:
            self.assertEqual(result['total_records'], 10)
            self.assertEqual(result['filtered_records'], 5)  # Records with value >= 105.00
        
        # Performance assertion
        self.assertLess(execution_time, 5.0)  # Should complete in less than 5 seconds
        
        print(f"Concurrent access to 10 tenants completed in {execution_time:.3f} seconds")
    
    def test_large_dataset_performance(self):
        """Test performance with large datasets"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            category = models.CharField(max_length=50)
            
            class Meta:
                db_table = 'test_large_dataset'
        
        # Create large dataset for one tenant
        tenant = self.tenants[0]
        
        start_time = time.time()
        
        with patch('backend.tenant_context_middleware.get_current_tenant', return_value=tenant):
            # Create 1000 records
            records = []
            for i in range(1000):
                record = TestModel.objects.create(
                    tenant=tenant,
                    name=f'Record {i}',
                    value=Decimal(f'{100.00 + i}'),
                    category=f'Category {i % 10}'  # 10 different categories
                )
                records.append(record)
        
        creation_time = time.time() - start_time
        
        # Test query performance
        query_start_time = time.time()
        
        with patch('backend.tenant_context_middleware.get_current_tenant', return_value=tenant):
            # Test basic query
            all_records = TestModel.objects.filter(tenant=tenant)
            total_count = all_records.count()
            
            # Test filtered query
            filtered_records = TestModel.objects.filter(
                tenant=tenant,
                value__gte=Decimal('500.00')
            )
            filtered_count = filtered_records.count()
            
            # Test aggregation
            total_value = TestModel.objects.filter(tenant=tenant).aggregate(
                total=models.Sum('value')
            )['total']
            
            # Test grouping
            category_counts = TestModel.objects.filter(tenant=tenant).values('category').annotate(
                count=models.Count('id')
            )
            category_count = len(category_counts)
        
        query_time = time.time() - query_start_time
        
        # Verify results
        self.assertEqual(total_count, 1000)
        self.assertEqual(filtered_count, 500)  # Records with value >= 500.00
        self.assertEqual(category_count, 10)  # 10 different categories
        
        # Performance assertions
        self.assertLess(creation_time, 30.0)  # Should create 1000 records in less than 30 seconds
        self.assertLess(query_time, 5.0)  # Should query in less than 5 seconds
        
        print(f"Created 1000 records in {creation_time:.3f} seconds")
        print(f"Queried 1000 records in {query_time:.3f} seconds")
    
    def test_cache_performance_under_load(self):
        """Test cache performance under load"""
        # Test cache performance with multiple tenants
        start_time = time.time()
        
        def cache_tenant_data(tenant_index):
            """Cache data for tenant"""
            tenant = self.tenants[tenant_index]
            
            # Generate dashboard data
            dashboard_data = {
                'tenant_id': tenant.id,
                'data': f'Dashboard data for tenant {tenant_index}',
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache the data
            redis_cache_manager.set_tenant_data(
                tenant.id, 'dashboard', dashboard_data, timeout=300
            )
            
            # Retrieve the data
            cached_data = redis_cache_manager.get_tenant_data(
                tenant.id, 'dashboard'
            )
            
            return {
                'tenant_id': tenant.id,
                'cached': cached_data is not None,
                'timestamp': timezone.now().isoformat()
            }
        
        # Test concurrent cache operations
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(cache_tenant_data, i) for i in range(10)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 10)
        for result in results:
            self.assertTrue(result['cached'])
        
        # Performance assertion
        self.assertLess(execution_time, 3.0)  # Should complete in less than 3 seconds
        
        print(f"Cache operations for 10 tenants completed in {execution_time:.3f} seconds")
    
    def test_query_optimization_under_load(self):
        """Test query optimization under load"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_optimization_load'
        
        # Create test data for each tenant
        for i, tenant in enumerate(self.tenants):
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                for j in range(100):  # Create 100 records per tenant
                    TestModel.objects.create(
                        tenant=tenant,
                        name=f'Record {j} for Tenant {i}',
                        value=Decimal(f'{100.00 + j}')
                    )
        
        def optimize_tenant_queries(tenant_index):
            """Optimize queries for tenant"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Test optimized queryset
                queryset = TestModel.objects.filter(tenant=tenant)
                optimized_queryset = query_optimizer.optimize_queryset(queryset)
                
                # Test performance
                start_time = time.time()
                
                # Test count
                count = optimized_queryset.count()
                
                # Test filtering
                filtered_queryset = optimized_queryset.filter(value__gte=Decimal('150.00'))
                filtered_count = filtered_queryset.count()
                
                # Test aggregation
                total_value = optimized_queryset.aggregate(
                    total=models.Sum('value')
                )['total']
                
                execution_time = time.time() - start_time
                
                return {
                    'tenant_id': tenant.id,
                    'count': count,
                    'filtered_count': filtered_count,
                    'total_value': float(total_value),
                    'execution_time': execution_time
                }
        
        # Test concurrent optimization
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(optimize_tenant_queries, i) for i in range(10)]
            results = [future.result() for future in futures]
        
        total_execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 10)
        for result in results:
            self.assertEqual(result['count'], 100)
            self.assertEqual(result['filtered_count'], 50)  # Records with value >= 150.00
            self.assertLess(result['execution_time'], 1.0)  # Each query should be fast
        
        # Performance assertion
        self.assertLess(total_execution_time, 10.0)  # Should complete in less than 10 seconds
        
        print(f"Query optimization for 10 tenants completed in {total_execution_time:.3f} seconds")
    
    def test_audit_logging_under_load(self):
        """Test audit logging performance under load"""
        from backend.audit_models import AuditLog
        
        def log_audit_events(tenant_index):
            """Log audit events for tenant"""
            tenant = self.tenants[tenant_index]
            user = self.users[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Log multiple audit events
                for i in range(50):  # Log 50 events per tenant
                    AuditLog.objects.create(
                        tenant=tenant,
                        user=user,
                        operation='CREATE',
                        resource_type='TestModel',
                        resource_id=f'test-id-{i}',
                        details={'test': f'data_{i}'}
                    )
                
                # Query audit logs
                audit_logs = AuditLog.objects.filter(tenant=tenant)
                count = audit_logs.count()
                
                return {
                    'tenant_id': tenant.id,
                    'audit_count': count,
                    'timestamp': timezone.now().isoformat()
                }
        
        # Test concurrent audit logging
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(log_audit_events, i) for i in range(10)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 10)
        for result in results:
            self.assertEqual(result['audit_count'], 50)
        
        # Performance assertion
        self.assertLess(execution_time, 15.0)  # Should complete in less than 15 seconds
        
        print(f"Audit logging for 10 tenants (500 events total) completed in {execution_time:.3f} seconds")


class LoadPerformanceIntegrationTestCase(TransactionTestCase):
    """
    Integration test case for load performance in multi-tenant system.
    """
    
    def setUp(self):
        """Set up test data for integration load tests"""
        # Create test tenants
        self.tenants = []
        for i in range(5):  # Create 5 tenants for integration testing
            tenant = Tenant.objects.create(
                schema_name=f'load_tenant_{i}',
                name=f'Load Tenant {i}',
                description=f'Load Test Tenant {i}'
            )
            self.tenants.append(tenant)
            
            # Create domain for tenant
            Domain.objects.create(
                domain=f'load-tenant-{i}.example.com',
                tenant=tenant,
                is_primary=True
            )
        
        # Create test users for each tenant
        self.users = []
        for i, tenant in enumerate(self.tenants):
            user = User.objects.create_user(
                email=f'load_user_{i}@load-tenant-{i}.com',
                username=f'load_user_{i}',
                password='testpass123',
                tenant=tenant
            )
            self.users.append(user)
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_full_workflow_under_load(self):
        """Test complete workflow under load"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            category = models.CharField(max_length=50)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_full_workflow'
        
        def tenant_workflow(tenant_index):
            """Complete workflow for tenant"""
            tenant = self.tenants[tenant_index]
            user = self.users[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Create records
                records = []
                for i in range(100):  # Create 100 records per tenant
                    record = TestModel.objects.create(
                        tenant=tenant,
                        name=f'Record {i} for Tenant {tenant_index}',
                        value=Decimal(f'{100.00 + i}'),
                        category=f'Category {i % 5}'  # 5 different categories
                    )
                    records.append(record)
                
                # Test queries
                all_records = TestModel.objects.filter(tenant=tenant)
                total_count = all_records.count()
                
                # Test filtering
                filtered_records = TestModel.objects.filter(
                    tenant=tenant,
                    value__gte=Decimal('150.00')
                )
                filtered_count = filtered_records.count()
                
                # Test aggregation
                total_value = TestModel.objects.filter(tenant=tenant).aggregate(
                    total=models.Sum('value')
                )['total']
                
                # Test grouping
                category_counts = TestModel.objects.filter(tenant=tenant).values('category').annotate(
                    count=models.Count('id')
                )
                category_count = len(category_counts)
                
                # Test caching
                dashboard_data = {
                    'tenant_id': tenant.id,
                    'total_records': total_count,
                    'filtered_records': filtered_count,
                    'total_value': float(total_value),
                    'category_count': category_count
                }
                
                redis_cache_manager.set_tenant_data(
                    tenant.id, 'workflow_dashboard', dashboard_data, timeout=300
                )
                
                cached_data = redis_cache_manager.get_tenant_data(
                    tenant.id, 'workflow_dashboard'
                )
                
                # Test audit logging
                from backend.audit_models import AuditLog
                AuditLog.objects.create(
                    tenant=tenant,
                    user=user,
                    operation='WORKFLOW_COMPLETE',
                    resource_type='TestModel',
                    resource_id=f'workflow-{tenant_index}',
                    details={'workflow': 'complete', 'record_count': total_count}
                )
                
                return {
                    'tenant_id': tenant.id,
                    'total_count': total_count,
                    'filtered_count': filtered_count,
                    'total_value': float(total_value),
                    'category_count': category_count,
                    'cached': cached_data is not None,
                    'timestamp': timezone.now().isoformat()
                }
        
        # Test concurrent workflows
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(tenant_workflow, i) for i in range(5)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 5)
        for result in results:
            self.assertEqual(result['total_count'], 100)
            self.assertEqual(result['filtered_count'], 50)  # Records with value >= 150.00
            self.assertEqual(result['category_count'], 5)  # 5 different categories
            self.assertTrue(result['cached'])
        
        # Performance assertion
        self.assertLess(execution_time, 20.0)  # Should complete in less than 20 seconds
        
        print(f"Full workflow for 5 tenants (500 records total) completed in {execution_time:.3f} seconds")
    
    def test_database_connection_pooling(self):
        """Test database connection pooling under load"""
        def database_operation(tenant_index):
            """Perform database operations"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Test database connection
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                
                # Test transaction
                with transaction.atomic():
                    # Create a simple record
                    from backend.enhanced_base_models import TenantScopedModel
                    
                    class TestModel(TenantScopedModel):
                        name = models.CharField(max_length=100)
                        
                        class Meta:
                            db_table = 'test_connection_pooling'
                    
                    record = TestModel.objects.create(
                        tenant=tenant,
                        name=f'Connection test {tenant_index}'
                    )
                    
                    # Verify record exists
                    exists = TestModel.objects.filter(id=record.id).exists()
                
                return {
                    'tenant_id': tenant.id,
                    'connection_ok': result[0] == 1,
                    'transaction_ok': exists,
                    'timestamp': timezone.now().isoformat()
                }
        
        # Test concurrent database operations
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(database_operation, i) for i in range(5)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 5)
        for result in results:
            self.assertTrue(result['connection_ok'])
            self.assertTrue(result['transaction_ok'])
        
        # Performance assertion
        self.assertLess(execution_time, 10.0)  # Should complete in less than 10 seconds
        
        print(f"Database connection pooling test completed in {execution_time:.3f} seconds")
    
    def test_memory_usage_under_load(self):
        """Test memory usage under load"""
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        def memory_intensive_operation(tenant_index):
            """Perform memory intensive operations"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Create large dataset in memory
                large_data = []
                for i in range(1000):  # Create 1000 items per tenant
                    large_data.append({
                        'id': i,
                        'name': f'Item {i} for Tenant {tenant_index}',
                        'value': 100.00 + i,
                        'data': 'x' * 1000  # 1KB of data per item
                    })
                
                # Process the data
                total_value = sum(item['value'] for item in large_data)
                item_count = len(large_data)
                
                # Clear the data
                del large_data
                
                return {
                    'tenant_id': tenant.id,
                    'total_value': total_value,
                    'item_count': item_count,
                    'timestamp': timezone.now().isoformat()
                }
        
        # Test concurrent memory operations
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(memory_intensive_operation, i) for i in range(5)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Get final memory usage
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Verify results
        self.assertEqual(len(results), 5)
        for result in results:
            self.assertEqual(result['item_count'], 1000)
        
        # Performance assertions
        self.assertLess(execution_time, 15.0)  # Should complete in less than 15 seconds
        self.assertLess(memory_increase, 100.0)  # Memory increase should be less than 100MB
        
        print(f"Memory intensive operations completed in {execution_time:.3f} seconds")
        print(f"Memory increase: {memory_increase:.2f} MB")
    
    def test_error_handling_under_load(self):
        """Test error handling under load"""
        def error_prone_operation(tenant_index):
            """Perform operations that might cause errors"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                try:
                    # Simulate some operations that might fail
                    if tenant_index % 3 == 0:  # Every third tenant fails
                        raise Exception(f"Simulated error for tenant {tenant_index}")
                    
                    # Normal operation
                    return {
                        'tenant_id': tenant.id,
                        'status': 'success',
                        'timestamp': timezone.now().isoformat()
                    }
                
                except Exception as e:
                    return {
                        'tenant_id': tenant.id,
                        'status': 'error',
                        'error': str(e),
                        'timestamp': timezone.now().isoformat()
                    }
        
        # Test concurrent operations with errors
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(error_prone_operation, i) for i in range(5)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 5)
        
        success_count = sum(1 for result in results if result['status'] == 'success')
        error_count = sum(1 for result in results if result['status'] == 'error')
        
        self.assertEqual(success_count, 3)  # 3 tenants should succeed
        self.assertEqual(error_count, 2)  # 2 tenants should fail
        
        # Performance assertion
        self.assertLess(execution_time, 5.0)  # Should complete in less than 5 seconds
        
        print(f"Error handling test completed in {execution_time:.3f} seconds")
        print(f"Success: {success_count}, Errors: {error_count}")


class LoadPerformanceStressTestCase(TransactionTestCase):
    """
    Stress test case for extreme load scenarios.
    """
    
    def setUp(self):
        """Set up test data for stress tests"""
        # Create test tenants for stress testing
        self.tenants = []
        for i in range(20):  # Create 20 tenants for stress testing
            tenant = Tenant.objects.create(
                schema_name=f'stress_tenant_{i}',
                name=f'Stress Tenant {i}',
                description=f'Stress Test Tenant {i}'
            )
            self.tenants.append(tenant)
            
            # Create domain for tenant
            Domain.objects.create(
                domain=f'stress-tenant-{i}.example.com',
                tenant=tenant,
                is_primary=True
            )
        
        # Create test users for each tenant
        self.users = []
        for i, tenant in enumerate(self.tenants):
            user = User.objects.create_user(
                email=f'stress_user_{i}@stress-tenant-{i}.com',
                username=f'stress_user_{i}',
                password='testpass123',
                tenant=tenant
            )
            self.users.append(user)
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_extreme_concurrent_access(self):
        """Test extreme concurrent access to multiple tenants"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_extreme_load'
        
        # Create test data for each tenant
        for i, tenant in enumerate(self.tenants):
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                for j in range(50):  # Create 50 records per tenant
                    TestModel.objects.create(
                        tenant=tenant,
                        name=f'Record {j} for Tenant {i}',
                        value=Decimal(f'{100.00 + j}')
                    )
        
        def extreme_tenant_access(tenant_index):
            """Extreme access to tenant data"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Perform multiple operations
                operations = []
                
                for _ in range(10):  # 10 operations per tenant
                    # Query all records
                    all_records = TestModel.objects.filter(tenant=tenant)
                    count = all_records.count()
                    
                    # Query filtered records
                    filtered_records = TestModel.objects.filter(
                        tenant=tenant,
                        value__gte=Decimal('125.00')
                    )
                    filtered_count = filtered_records.count()
                    
                    # Test aggregation
                    total_value = TestModel.objects.filter(tenant=tenant).aggregate(
                        total=models.Sum('value')
                    )['total']
                    
                    operations.append({
                        'count': count,
                        'filtered_count': filtered_count,
                        'total_value': float(total_value)
                    })
                
                return {
                    'tenant_id': tenant.id,
                    'operations': len(operations),
                    'timestamp': timezone.now().isoformat()
                }
        
        # Test extreme concurrent access
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(extreme_tenant_access, i) for i in range(20)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 20)
        for result in results:
            self.assertEqual(result['operations'], 10)
        
        # Performance assertion
        self.assertLess(execution_time, 30.0)  # Should complete in less than 30 seconds
        
        print(f"Extreme concurrent access to 20 tenants completed in {execution_time:.3f} seconds")
    
    def test_database_deadlock_handling(self):
        """Test database deadlock handling under load"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_deadlock_handling'
        
        # Create test data
        for i, tenant in enumerate(self.tenants):
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                TestModel.objects.create(
                    tenant=tenant,
                    name=f'Record for Tenant {i}',
                    value=Decimal('100.00')
                )
        
        def deadlock_prone_operation(tenant_index):
            """Perform operations that might cause deadlocks"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                try:
                    # Perform operations that might cause deadlocks
                    with transaction.atomic():
                        # Update record
                        record = TestModel.objects.filter(tenant=tenant).first()
                        if record:
                            record.value = Decimal('200.00')
                            record.save()
                        
                        # Create new record
                        TestModel.objects.create(
                            tenant=tenant,
                            name=f'New Record for Tenant {tenant_index}',
                            value=Decimal('300.00')
                        )
                    
                    return {
                        'tenant_id': tenant.id,
                        'status': 'success',
                        'timestamp': timezone.now().isoformat()
                    }
                
                except Exception as e:
                    return {
                        'tenant_id': tenant.id,
                        'status': 'error',
                        'error': str(e),
                        'timestamp': timezone.now().isoformat()
                    }
        
        # Test concurrent operations that might cause deadlocks
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(deadlock_prone_operation, i) for i in range(20)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 20)
        
        success_count = sum(1 for result in results if result['status'] == 'success')
        error_count = sum(1 for result in results if result['status'] == 'error')
        
        # Performance assertion
        self.assertLess(execution_time, 20.0)  # Should complete in less than 20 seconds
        
        print(f"Deadlock handling test completed in {execution_time:.3f} seconds")
        print(f"Success: {success_count}, Errors: {error_count}")
    
    def test_cache_eviction_under_load(self):
        """Test cache eviction under load"""
        def cache_intensive_operation(tenant_index):
            """Perform cache intensive operations"""
            tenant = self.tenants[tenant_index]
            
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=tenant):
                # Set multiple cache entries
                for i in range(100):  # 100 cache entries per tenant
                    cache_key = f'tenant_{tenant.id}_entry_{i}'
                    cache_data = {
                        'tenant_id': tenant.id,
                        'entry_id': i,
                        'data': 'x' * 1000,  # 1KB of data per entry
                        'timestamp': timezone.now().isoformat()
                    }
                    
                    cache.set(cache_key, cache_data, timeout=300)
                
                # Retrieve cache entries
                retrieved_count = 0
                for i in range(100):
                    cache_key = f'tenant_{tenant.id}_entry_{i}'
                    cached_data = cache.get(cache_key)
                    if cached_data:
                        retrieved_count += 1
                
                return {
                    'tenant_id': tenant.id,
                    'retrieved_count': retrieved_count,
                    'timestamp': timezone.now().isoformat()
                }
        
        # Test concurrent cache operations
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(cache_intensive_operation, i) for i in range(10)]
            results = [future.result() for future in futures]
        
        execution_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(results), 10)
        for result in results:
            # Some cache entries might be evicted due to memory pressure
            self.assertGreaterEqual(result['retrieved_count'], 50)  # At least 50% should be retrieved
        
        # Performance assertion
        self.assertLess(execution_time, 15.0)  # Should complete in less than 15 seconds
        
        print(f"Cache eviction test completed in {execution_time:.3f} seconds")
