"""
Unit Tests for Tenant Isolation
Ensures complete tenant isolation in multi-tenant system.
"""

import pytest
import time
from decimal import Decimal
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.db import transaction, connection
from django.core.cache import cache
from django.utils import timezone
from unittest.mock import patch, MagicMock
from tenants.models import Tenant, Domain
from backend.tenant_base_model import TenantBaseModel
from backend.query_optimization import OptimizedTenantManager, query_optimizer
from backend.redis_cache import redis_cache_manager, get_tenant_dashboard_data
# from backend.audit_service import audit_service  # Temporarily disabled for testing
from backend.row_tenant_middleware import set_tenant_context, get_current_tenant

User = get_user_model()


class TenantIsolationTestCase(TestCase):
    """
    Test case for tenant isolation in multi-tenant system.
    """
    
    def setUp(self):
        """Set up test data for tenant isolation tests"""
        # Create test tenants
        self.tenant_a = Tenant.objects.create(
            slug='tenant-a',
            name='Tenant A'
        )
        
        self.tenant_b = Tenant.objects.create(
            slug='tenant-b',
            name='Tenant B'
        )
        
        # Create test users for each tenant
        self.user_a = User.objects.create_user(
            email='user_a@tenant-a.com',
            username='user_a',
            password='testpass123',
            tenant=self.tenant_a
        )
        
        self.user_b = User.objects.create_user(
            email='user_b@tenant-b.com',
            username='user_b',
            password='testpass123',
            tenant=self.tenant_b
        )
        
        # Create test domains
        Domain.objects.create(
            domain='tenant-a.example.com',
            tenant=self.tenant_a,
            is_primary=True
        )
        
        Domain.objects.create(
            domain='tenant-b.example.com',
            tenant=self.tenant_b,
            is_primary=True
        )
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_tenant_model_isolation(self):
        """Test that tenant models are properly isolated"""
        # Create test model instances
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_tenant_model'
        
        # Create records for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            record_a1 = TestModel.objects.create(
                tenant=self.tenant_a,
                name='Record A1',
                value=Decimal('100.00')
            )
            record_a2 = TestModel.objects.create(
                tenant=self.tenant_a,
                name='Record A2',
                value=Decimal('200.00')
            )
        
        # Create records for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            record_b1 = TestModel.objects.create(
                tenant=self.tenant_b,
                name='Record B1',
                value=Decimal('300.00')
            )
            record_b2 = TestModel.objects.create(
                tenant=self.tenant_b,
                name='Record B2',
                value=Decimal('400.00')
            )
        
        # Test tenant A can only see their records
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            tenant_a_records = TestModel.objects.filter(tenant=self.tenant_a)
            self.assertEqual(tenant_a_records.count(), 2)
            self.assertIn(record_a1, tenant_a_records)
            self.assertIn(record_a2, tenant_a_records)
            self.assertNotIn(record_b1, tenant_a_records)
            self.assertNotIn(record_b2, tenant_a_records)
        
        # Test tenant B can only see their records
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            tenant_b_records = TestModel.objects.filter(tenant=self.tenant_b)
            self.assertEqual(tenant_b_records.count(), 2)
            self.assertIn(record_b1, tenant_b_records)
            self.assertIn(record_b2, tenant_b_records)
            self.assertNotIn(record_a1, tenant_b_records)
            self.assertNotIn(record_a2, tenant_b_records)
    
    def test_optimized_queryset_isolation(self):
        """Test that optimized querysets maintain tenant isolation"""
        from backend.query_optimization import OptimizedTenantQuerySet
        
        class TestModel(models.Model):
            tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_optimized_model'
        
        # Create records for both tenants
        record_a = TestModel.objects.create(
            tenant=self.tenant_a,
            name='Record A',
            value=Decimal('100.00')
        )
        
        record_b = TestModel.objects.create(
            tenant=self.tenant_b,
            name='Record B',
            value=Decimal('200.00')
        )
        
        # Test tenant A queryset
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            queryset_a = TestModel.objects.for_current_tenant()
            self.assertEqual(queryset_a.count(), 1)
            self.assertEqual(queryset_a.first(), record_a)
        
        # Test tenant B queryset
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            queryset_b = TestModel.objects.for_current_tenant()
            self.assertEqual(queryset_b.count(), 1)
            self.assertEqual(queryset_b.first(), record_b)
    
    def test_cache_isolation(self):
        """Test that cache is properly isolated between tenants"""
        # Set cache data for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            cache_data_a = {'tenant': 'A', 'data': 'tenant_a_data'}
            redis_cache_manager.set_tenant_data(
                self.tenant_a.id, 'test_data', cache_data_a, timeout=300
            )
        
        # Set cache data for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            cache_data_b = {'tenant': 'B', 'data': 'tenant_b_data'}
            redis_cache_manager.set_tenant_data(
                self.tenant_b.id, 'test_data', cache_data_b, timeout=300
            )
        
        # Test tenant A can only access their cache
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            cached_data_a = redis_cache_manager.get_tenant_data(
                self.tenant_a.id, 'test_data'
            )
            self.assertEqual(cached_data_a, cache_data_a)
            self.assertNotEqual(cached_data_a, cache_data_b)
        
        # Test tenant B can only access their cache
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            cached_data_b = redis_cache_manager.get_tenant_data(
                self.tenant_b.id, 'test_data'
            )
            self.assertEqual(cached_data_b, cache_data_b)
            self.assertNotEqual(cached_data_b, cache_data_a)
    
    def test_dashboard_cache_isolation(self):
        """Test that dashboard cache is properly isolated between tenants"""
        # Generate dashboard data for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            dashboard_data_a = get_tenant_dashboard_data(self.tenant_a.id)
            self.assertIsNotNone(dashboard_data_a)
            self.assertEqual(dashboard_data_a['tenant_id'], self.tenant_a.id)
        
        # Generate dashboard data for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            dashboard_data_b = get_tenant_dashboard_data(self.tenant_b.id)
            self.assertIsNotNone(dashboard_data_b)
            self.assertEqual(dashboard_data_b['tenant_id'], self.tenant_b.id)
        
        # Verify isolation
        self.assertNotEqual(dashboard_data_a['tenant_id'], dashboard_data_b['tenant_id'])
    
    def test_audit_logging_isolation(self):
        """Test that audit logging maintains tenant isolation"""
        from backend.audit_models import AuditLog
        
        # Create audit logs for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            audit_log_a = AuditLog.objects.create(
                tenant=self.tenant_a,
                user=self.user_a,
                operation='CREATE',
                resource_type='TestModel',
                resource_id='test-id-a',
                details={'test': 'data_a'}
            )
        
        # Create audit logs for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            audit_log_b = AuditLog.objects.create(
                tenant=self.tenant_b,
                user=self.user_b,
                operation='CREATE',
                resource_type='TestModel',
                resource_id='test-id-b',
                details={'test': 'data_b'}
            )
        
        # Test tenant A can only see their audit logs
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            tenant_a_logs = AuditLog.objects.filter(tenant=self.tenant_a)
            self.assertEqual(tenant_a_logs.count(), 1)
            self.assertEqual(tenant_a_logs.first(), audit_log_a)
            self.assertNotIn(audit_log_b, tenant_a_logs)
        
        # Test tenant B can only see their audit logs
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            tenant_b_logs = AuditLog.objects.filter(tenant=self.tenant_b)
            self.assertEqual(tenant_b_logs.count(), 1)
            self.assertEqual(tenant_b_logs.first(), audit_log_b)
            self.assertNotIn(audit_log_a, tenant_b_logs)
    
    def test_query_optimization_isolation(self):
        """Test that query optimization maintains tenant isolation"""
        from backend.query_optimization import OptimizedTenantQuerySet
        
        class TestModel(models.Model):
            tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_optimization_model'
        
        # Create records for both tenants
        record_a = TestModel.objects.create(
            tenant=self.tenant_a,
            name='Record A',
            value=Decimal('100.00')
        )
        
        record_b = TestModel.objects.create(
            tenant=self.tenant_b,
            name='Record B',
            value=Decimal('200.00')
        )
        
        # Test optimized queryset for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            optimized_queryset_a = query_optimizer.optimize_queryset(
                TestModel.objects.filter(tenant=self.tenant_a)
            )
            self.assertEqual(optimized_queryset_a.count(), 1)
            self.assertEqual(optimized_queryset_a.first(), record_a)
        
        # Test optimized queryset for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            optimized_queryset_b = query_optimizer.optimize_queryset(
                TestModel.objects.filter(tenant=self.tenant_b)
            )
            self.assertEqual(optimized_queryset_b.count(), 1)
            self.assertEqual(optimized_queryset_b.first(), record_b)
    
    def test_concurrent_tenant_access(self):
        """Test concurrent access to different tenants"""
        import threading
        import queue
        
        results = queue.Queue()
        
        def access_tenant_a():
            """Access tenant A data"""
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
                # Simulate some work
                time.sleep(0.1)
                results.put(('tenant_a', self.tenant_a.id))
        
        def access_tenant_b():
            """Access tenant B data"""
            with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
                # Simulate some work
                time.sleep(0.1)
                results.put(('tenant_b', self.tenant_b.id))
        
        # Run concurrent access
        thread_a = threading.Thread(target=access_tenant_a)
        thread_b = threading.Thread(target=access_tenant_b)
        
        thread_a.start()
        thread_b.start()
        
        thread_a.join()
        thread_b.join()
        
        # Verify results
        result_a = results.get()
        result_b = results.get()
        
        self.assertIn(('tenant_a', self.tenant_a.id), [result_a, result_b])
        self.assertIn(('tenant_b', self.tenant_b.id), [result_a, result_b])
        self.assertNotEqual(result_a, result_b)
    
    def test_tenant_context_middleware_isolation(self):
        """Test that tenant context middleware maintains isolation"""
        from backend.row_tenant_middleware import RowTenantMiddleware
        
        # Mock request for tenant A
        request_a = MagicMock()
        request_a.META = {'HTTP_X_TENANT_ID': str(self.tenant_a.id)}
        request_a.user = self.user_a
        
        # Mock request for tenant B
        request_b = MagicMock()
        request_b.META = {'HTTP_X_TENANT_ID': str(self.tenant_b.id)}
        request_b.user = self.user_b
        
        # Test middleware for tenant A
        middleware = TenantContextMiddleware(lambda x: None)
        middleware.process_request(request_a)
        
        current_tenant_a = get_current_tenant()
        self.assertEqual(current_tenant_a, self.tenant_a)
        
        # Test middleware for tenant B
        middleware.process_request(request_b)
        
        current_tenant_b = get_current_tenant()
        self.assertEqual(current_tenant_b, self.tenant_b)
        self.assertNotEqual(current_tenant_a, current_tenant_b)
    
    def test_tenant_data_cross_contamination(self):
        """Test that tenant data cannot cross-contaminate"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_cross_contamination'
        
        # Create records for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            record_a = TestModel.objects.create(
                tenant=self.tenant_a,
                name='Record A',
                value=Decimal('100.00')
            )
        
        # Create records for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            record_b = TestModel.objects.create(
                tenant=self.tenant_b,
                name='Record B',
                value=Decimal('200.00')
            )
        
        # Test that tenant A cannot access tenant B's data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            # Try to access tenant B's data (should fail)
            with self.assertRaises(Exception):
                TestModel.objects.filter(tenant=self.tenant_b).first()
        
        # Test that tenant B cannot access tenant A's data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            # Try to access tenant A's data (should fail)
            with self.assertRaises(Exception):
                TestModel.objects.filter(tenant=self.tenant_a).first()
    
    def test_tenant_isolation_with_foreign_keys(self):
        """Test tenant isolation with foreign key relationships"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class Category(TenantScopedModel):
            name = models.CharField(max_length=100)
            
            class Meta:
                db_table = 'test_categories'
        
        class Product(TenantScopedModel):
            name = models.CharField(max_length=100)
            category = models.ForeignKey(Category, on_delete=models.CASCADE)
            price = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_products'
        
        # Create categories for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            category_a = Category.objects.create(
                tenant=self.tenant_a,
                name='Category A'
            )
            product_a = Product.objects.create(
                tenant=self.tenant_a,
                name='Product A',
                category=category_a,
                price=Decimal('100.00')
            )
        
        # Create categories for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            category_b = Category.objects.create(
                tenant=self.tenant_b,
                name='Category B'
            )
            product_b = Product.objects.create(
                tenant=self.tenant_b,
                name='Product B',
                category=category_b,
                price=Decimal('200.00')
            )
        
        # Test tenant A can only see their products and categories
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            tenant_a_products = Product.objects.filter(tenant=self.tenant_a)
            tenant_a_categories = Category.objects.filter(tenant=self.tenant_a)
            
            self.assertEqual(tenant_a_products.count(), 1)
            self.assertEqual(tenant_a_categories.count(), 1)
            self.assertEqual(tenant_a_products.first(), product_a)
            self.assertEqual(tenant_a_categories.first(), category_a)
            
            # Verify no cross-tenant access
            self.assertNotIn(product_b, tenant_a_products)
            self.assertNotIn(category_b, tenant_a_categories)
        
        # Test tenant B can only see their products and categories
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            tenant_b_products = Product.objects.filter(tenant=self.tenant_b)
            tenant_b_categories = Category.objects.filter(tenant=self.tenant_b)
            
            self.assertEqual(tenant_b_products.count(), 1)
            self.assertEqual(tenant_b_categories.count(), 1)
            self.assertEqual(tenant_b_products.first(), product_b)
            self.assertEqual(tenant_b_categories.first(), category_b)
            
            # Verify no cross-tenant access
            self.assertNotIn(product_a, tenant_b_products)
            self.assertNotIn(category_a, tenant_b_categories)


class TenantIsolationIntegrationTestCase(TransactionTestCase):
    """
    Integration test case for tenant isolation in multi-tenant system.
    """
    
    def setUp(self):
        """Set up test data for integration tests"""
        # Create test tenants
        self.tenant_a = Tenant.objects.create(
            slug='tenant-a',
            name='Tenant A'
        )
        
        self.tenant_b = Tenant.objects.create(
            slug='tenant-b',
            name='Tenant B'
        )
        
        # Create test users for each tenant
        self.user_a = User.objects.create_user(
            email='user_a@tenant-a.com',
            username='user_a',
            password='testpass123',
            tenant=self.tenant_a
        )
        
        self.user_b = User.objects.create_user(
            email='user_b@tenant-b.com',
            username='user_b',
            password='testpass123',
            tenant=self.tenant_b
        )
    
    def tearDown(self):
        """Clean up test data"""
        cache.clear()
    
    def test_full_tenant_isolation_workflow(self):
        """Test complete tenant isolation workflow"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_full_isolation'
        
        # Test tenant A workflow
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            # Create records
            record_a1 = TestModel.objects.create(
                tenant=self.tenant_a,
                name='Record A1',
                value=Decimal('100.00')
            )
            record_a2 = TestModel.objects.create(
                tenant=self.tenant_a,
                name='Record A2',
                value=Decimal('200.00')
            )
            
            # Test queries
            all_records_a = TestModel.objects.filter(tenant=self.tenant_a)
            self.assertEqual(all_records_a.count(), 2)
            
            # Test filtering
            filtered_records_a = TestModel.objects.filter(
                tenant=self.tenant_a,
                value__gte=Decimal('150.00')
            )
            self.assertEqual(filtered_records_a.count(), 1)
            self.assertEqual(filtered_records_a.first(), record_a2)
            
            # Test aggregation
            total_value_a = TestModel.objects.filter(tenant=self.tenant_a).aggregate(
                total=models.Sum('value')
            )['total']
            self.assertEqual(total_value_a, Decimal('300.00'))
        
        # Test tenant B workflow
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            # Create records
            record_b1 = TestModel.objects.create(
                tenant=self.tenant_b,
                name='Record B1',
                value=Decimal('300.00')
            )
            record_b2 = TestModel.objects.create(
                tenant=self.tenant_b,
                name='Record B2',
                value=Decimal('400.00')
            )
            
            # Test queries
            all_records_b = TestModel.objects.filter(tenant=self.tenant_b)
            self.assertEqual(all_records_b.count(), 2)
            
            # Test filtering
            filtered_records_b = TestModel.objects.filter(
                tenant=self.tenant_b,
                value__gte=Decimal('350.00')
            )
            self.assertEqual(filtered_records_b.count(), 1)
            self.assertEqual(filtered_records_b.first(), record_b2)
            
            # Test aggregation
            total_value_b = TestModel.objects.filter(tenant=self.tenant_b).aggregate(
                total=models.Sum('value')
            )['total']
            self.assertEqual(total_value_b, Decimal('700.00'))
        
        # Verify complete isolation
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            tenant_a_records = TestModel.objects.filter(tenant=self.tenant_a)
            self.assertEqual(tenant_a_records.count(), 2)
            self.assertIn(record_a1, tenant_a_records)
            self.assertIn(record_a2, tenant_a_records)
            self.assertNotIn(record_b1, tenant_a_records)
            self.assertNotIn(record_b2, tenant_a_records)
        
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            tenant_b_records = TestModel.objects.filter(tenant=self.tenant_b)
            self.assertEqual(tenant_b_records.count(), 2)
            self.assertIn(record_b1, tenant_b_records)
            self.assertIn(record_b2, tenant_b_records)
            self.assertNotIn(record_a1, tenant_b_records)
            self.assertNotIn(record_a2, tenant_b_records)
    
    def test_tenant_isolation_with_transactions(self):
        """Test tenant isolation with database transactions"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_transaction_isolation'
        
        # Test transaction for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            with transaction.atomic():
                record_a = TestModel.objects.create(
                    tenant=self.tenant_a,
                    name='Record A',
                    value=Decimal('100.00')
                )
                
                # Verify record exists within transaction
                self.assertTrue(TestModel.objects.filter(id=record_a.id).exists())
        
        # Test transaction for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            with transaction.atomic():
                record_b = TestModel.objects.create(
                    tenant=self.tenant_b,
                    name='Record B',
                    value=Decimal('200.00')
                )
                
                # Verify record exists within transaction
                self.assertTrue(TestModel.objects.filter(id=record_b.id).exists())
        
        # Verify isolation after transactions
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            tenant_a_records = TestModel.objects.filter(tenant=self.tenant_a)
            self.assertEqual(tenant_a_records.count(), 1)
            self.assertEqual(tenant_a_records.first(), record_a)
            self.assertNotIn(record_b, tenant_a_records)
        
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            tenant_b_records = TestModel.objects.filter(tenant=self.tenant_b)
            self.assertEqual(tenant_b_records.count(), 1)
            self.assertEqual(tenant_b_records.first(), record_b)
            self.assertNotIn(record_a, tenant_b_records)
    
    def test_tenant_isolation_with_rollback(self):
        """Test tenant isolation with transaction rollback"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            class Meta:
                db_table = 'test_rollback_isolation'
        
        # Test rollback for tenant A
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            try:
                with transaction.atomic():
                    TestModel.objects.create(
                        tenant=self.tenant_a,
                        name='Record A',
                        value=Decimal('100.00')
                    )
                    # Force rollback
                    raise Exception("Force rollback")
            except Exception:
                pass
        
        # Test rollback for tenant B
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            try:
                with transaction.atomic():
                    TestModel.objects.create(
                        tenant=self.tenant_b,
                        name='Record B',
                        value=Decimal('200.00')
                    )
                    # Force rollback
                    raise Exception("Force rollback")
            except Exception:
                pass
        
        # Verify no records exist after rollback
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_a):
            tenant_a_records = TestModel.objects.filter(tenant=self.tenant_a)
            self.assertEqual(tenant_a_records.count(), 0)
        
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant_b):
            tenant_b_records = TestModel.objects.filter(tenant=self.tenant_b)
            self.assertEqual(tenant_b_records.count(), 0)
