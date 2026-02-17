"""
Tests for Query Optimization and Caching
Tests query optimization, caching strategies, and performance monitoring.
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
from backend.query_optimization import (
    OptimizedTenantQuerySet, OptimizedTenantManager,
    query_optimizer, tenant_cache_manager
)
from backend.redis_cache import (
    redis_cache_manager, dashboard_cache, statistics_cache,
    get_tenant_dashboard_data, get_tenant_statistics_data
)
from backend.row_tenant_middleware import set_tenant_context, get_current_tenant

User = get_user_model()


class QueryOptimizationTestCase(TestCase):
    """
    Test case for query optimization functionality.
    """
    
    def setUp(self):
        """Set up test data for query optimization tests"""
        # Create test tenant
        self.tenant = Tenant.objects.create(
            schema_name='test_tenant',
            name='Test Tenant',
            description='Test Tenant for Query Optimization'
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
    
    def test_optimized_queryset_caching(self):
        """Test that optimized querysets use caching"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_optimized_queryset'
        
        # Create test data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            for i in range(10):
                TestModel.objects.create(
                    tenant=self.tenant,
                    name=f'Record {i}',
                    value=Decimal(f'{100.00 + i}')
                )
        
        # Test queryset with caching
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            # First query (should cache)
            start_time = time.time()
            queryset = TestModel.objects.with_cache(timeout=300, key_prefix="test_query")
            result1 = list(queryset)
            first_query_time = time.time() - start_time
            
            # Second query (should use cache)
            start_time = time.time()
            queryset = TestModel.objects.with_cache(timeout=300, key_prefix="test_query")
            result2 = list(queryset)
            second_query_time = time.time() - start_time
        
        # Verify results are the same
        self.assertEqual(len(result1), 10)
        self.assertEqual(len(result2), 10)
        self.assertEqual(result1, result2)
        
        # Second query should be faster (cached)
        self.assertLess(second_query_time, first_query_time)
        
        print(f"First query time: {first_query_time:.3f}s")
        print(f"Second query time: {second_query_time:.3f}s")
    
    def test_query_optimization_performance(self):
        """Test query optimization performance"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            category = models.CharField(max_length=50)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_optimization_performance'
        
        # Create test data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            for i in range(100):
                TestModel.objects.create(
                    tenant=self.tenant,
                    name=f'Record {i}',
                    value=Decimal(f'{100.00 + i}'),
                    category=f'Category {i % 5}'  # 5 different categories
                )
        
        # Test query optimization
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            # Test without optimization
            start_time = time.time()
            queryset = TestModel.objects.filter(tenant=self.tenant)
            unoptimized_result = list(queryset)
            unoptimized_time = time.time() - start_time
            
            # Test with optimization
            start_time = time.time()
            optimized_queryset = query_optimizer.optimize_queryset(queryset)
            optimized_result = list(optimized_queryset)
            optimized_time = time.time() - start_time
        
        # Verify results are the same
        self.assertEqual(len(unoptimized_result), 100)
        self.assertEqual(len(optimized_result), 100)
        
        # Optimized query should be faster or at least as fast
        self.assertLessEqual(optimized_time, unoptimized_time * 1.1)  # Allow 10% tolerance
        
        print(f"Unoptimized query time: {unoptimized_time:.3f}s")
        print(f"Optimized query time: {optimized_time:.3f}s")
    
    def test_query_optimization_with_filters(self):
        """Test query optimization with various filters"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            category = models.CharField(max_length=50)
            is_active = models.BooleanField(default=True)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_optimization_filters'
        
        # Create test data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            for i in range(100):
                TestModel.objects.create(
                    tenant=self.tenant,
                    name=f'Record {i}',
                    value=Decimal(f'{100.00 + i}'),
                    category=f'Category {i % 5}',
                    is_active=i % 2 == 0  # Half are active
                )
        
        # Test various filter combinations
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            # Test basic filter
            start_time = time.time()
            basic_filter = TestModel.objects.filter(tenant=self.tenant, is_active=True)
            basic_result = list(basic_filter)
            basic_time = time.time() - start_time
            
            # Test value filter
            start_time = time.time()
            value_filter = TestModel.objects.filter(
                tenant=self.tenant,
                value__gte=Decimal('150.00')
            )
            value_result = list(value_filter)
            value_time = time.time() - start_time
            
            # Test category filter
            start_time = time.time()
            category_filter = TestModel.objects.filter(
                tenant=self.tenant,
                category='Category 0'
            )
            category_result = list(category_filter)
            category_time = time.time() - start_time
            
            # Test complex filter
            start_time = time.time()
            complex_filter = TestModel.objects.filter(
                tenant=self.tenant,
                is_active=True,
                value__gte=Decimal('150.00'),
                category='Category 0'
            )
            complex_result = list(complex_filter)
            complex_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(basic_result), 50)  # Half are active
        self.assertEqual(len(value_result), 50)  # Records with value >= 150.00
        self.assertEqual(len(category_result), 20)  # Records with category 'Category 0'
        self.assertEqual(len(complex_result), 10)  # Records meeting all criteria
        
        # Performance assertions
        self.assertLess(basic_time, 1.0)
        self.assertLess(value_time, 1.0)
        self.assertLess(category_time, 1.0)
        self.assertLess(complex_time, 1.0)
        
        print(f"Basic filter time: {basic_time:.3f}s")
        print(f"Value filter time: {value_time:.3f}s")
        print(f"Category filter time: {category_time:.3f}s")
        print(f"Complex filter time: {complex_time:.3f}s")
    
    def test_query_optimization_with_aggregation(self):
        """Test query optimization with aggregation"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            category = models.CharField(max_length=50)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_optimization_aggregation'
        
        # Create test data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            for i in range(100):
                TestModel.objects.create(
                    tenant=self.tenant,
                    name=f'Record {i}',
                    value=Decimal(f'{100.00 + i}'),
                    category=f'Category {i % 5}'
                )
        
        # Test aggregation queries
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            # Test count
            start_time = time.time()
            count = TestModel.objects.filter(tenant=self.tenant).count()
            count_time = time.time() - start_time
            
            # Test sum
            start_time = time.time()
            total_value = TestModel.objects.filter(tenant=self.tenant).aggregate(
                total=models.Sum('value')
            )['total']
            sum_time = time.time() - start_time
            
            # Test average
            start_time = time.time()
            avg_value = TestModel.objects.filter(tenant=self.tenant).aggregate(
                average=models.Avg('value')
            )['average']
            avg_time = time.time() - start_time
            
            # Test grouping
            start_time = time.time()
            category_counts = TestModel.objects.filter(tenant=self.tenant).values('category').annotate(
                count=models.Count('id')
            )
            group_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(count, 100)
        self.assertEqual(total_value, Decimal('14950.00'))  # Sum of 100 to 199
        self.assertEqual(avg_value, Decimal('149.50'))  # Average of 100 to 199
        self.assertEqual(len(category_counts), 5)  # 5 different categories
        
        # Performance assertions
        self.assertLess(count_time, 1.0)
        self.assertLess(sum_time, 1.0)
        self.assertLess(avg_time, 1.0)
        self.assertLess(group_time, 1.0)
        
        print(f"Count time: {count_time:.3f}s")
        print(f"Sum time: {sum_time:.3f}s")
        print(f"Average time: {avg_time:.3f}s")
        print(f"Group time: {group_time:.3f}s")
    
    def test_query_optimization_with_joins(self):
        """Test query optimization with joins"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class Category(TenantScopedModel):
            name = models.CharField(max_length=100)
            
            class Meta:
                db_table = 'test_categories'
        
        class Product(TenantScopedModel):
            name = models.CharField(max_length=100)
            category = models.ForeignKey(Category, on_delete=models.CASCADE)
            price = models.DecimalField(max_digits=10, decimal_places=2)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_products'
        
        # Create test data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            categories = []
            for i in range(5):
                category = Category.objects.create(
                    tenant=self.tenant,
                    name=f'Category {i}'
                )
                categories.append(category)
            
            for i in range(100):
                Product.objects.create(
                    tenant=self.tenant,
                    name=f'Product {i}',
                    category=categories[i % 5],
                    price=Decimal(f'{100.00 + i}')
                )
        
        # Test join queries
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            # Test select_related
            start_time = time.time()
            products_with_category = Product.objects.filter(tenant=self.tenant).select_related('category')
            products_list = list(products_with_category)
            select_related_time = time.time() - start_time
            
            # Test prefetch_related
            start_time = time.time()
            categories_with_products = Category.objects.filter(tenant=self.tenant).prefetch_related('product_set')
            categories_list = list(categories_with_products)
            prefetch_related_time = time.time() - start_time
        
        # Verify results
        self.assertEqual(len(products_list), 100)
        self.assertEqual(len(categories_list), 5)
        
        # Performance assertions
        self.assertLess(select_related_time, 1.0)
        self.assertLess(prefetch_related_time, 1.0)
        
        print(f"Select related time: {select_related_time:.3f}s")
        print(f"Prefetch related time: {prefetch_related_time:.3f}s")
    
    def test_query_optimization_performance_monitoring(self):
        """Test query optimization performance monitoring"""
        from backend.enhanced_base_models import TenantScopedModel
        
        class TestModel(TenantScopedModel):
            name = models.CharField(max_length=100)
            value = models.DecimalField(max_digits=10, decimal_places=2)
            
            objects = OptimizedTenantManager()
            
            class Meta:
                db_table = 'test_performance_monitoring'
        
        # Create test data
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            for i in range(50):
                TestModel.objects.create(
                    tenant=self.tenant,
                    name=f'Record {i}',
                    value=Decimal(f'{100.00 + i}')
                )
        
        # Test performance monitoring
        with patch('backend.row_tenant_middleware.get_current_tenant', return_value=self.tenant):
            queryset = TestModel.objects.filter(tenant=self.tenant)
            
            # Test count performance
            count_performance = query_optimizer.analyze_query_performance(queryset, operation="count")
            self.assertIn('execution_time', count_performance)
            self.assertIn('result_count', count_performance)
            self.assertIn('operation', count_performance)
            self.assertIn('timestamp', count_performance)
            
            # Test exists performance
            exists_performance = query_optimizer.analyze_query_performance(queryset, operation="exists")
            self.assertIn('execution_time', exists_performance)
            self.assertIn('result_count', exists_performance)
            self.assertIn('operation', exists_performance)
            self.assertIn('timestamp', exists_performance)
            
            # Test list performance
            list_performance = query_optimizer.analyze_query_performance(queryset, operation="list")
            self.assertIn('execution_time', list_performance)
            self.assertIn('result_count', list_performance)
            self.assertIn('operation', list_performance)
            self.assertIn('timestamp', list_performance)
        
        # Verify performance metrics
        self.assertGreater(count_performance['execution_time'], 0)
        self.assertGreater(exists_performance['execution_time'], 0)
        self.assertGreater(list_performance['execution_time'], 0)
        
        print(f"Count performance: {count_performance['execution_time']:.3f}s")
        print(f"Exists performance: {exists_performance['execution_time']:.3f}s")
        print(f"List performance: {list_performance['execution_time']:.3f}s")


class CachingTestCase(TestCase):
    """
    Test case for caching functionality.
    """
    
    def setUp(self):
        """Set up test data for caching tests"""
        # Create test tenant
        self.tenant = Tenant.objects.create(
            schema_name='test_tenant',
            name='Test Tenant',
            description='Test Tenant for Caching'
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
    
    def test_redis_cache_manager(self):
        """Test Redis cache manager functionality"""
        # Test setting cache data
        cache_data = {'test': 'data', 'timestamp': timezone.now().isoformat()}
        success = redis_cache_manager.set_tenant_data(
            self.tenant.id, 'test_key', cache_data, timeout=300
        )
        self.assertTrue(success)
        
        # Test getting cache data
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'test_key'
        )
        self.assertEqual(retrieved_data, cache_data)
        
        # Test deleting cache data
        success = redis_cache_manager.delete_tenant_data(
            self.tenant.id, 'test_key'
        )
        self.assertTrue(success)
        
        # Test getting deleted cache data
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'test_key'
        )
        self.assertIsNone(retrieved_data)
    
    def test_dashboard_cache(self):
        """Test dashboard cache functionality"""
        # Test getting dashboard data
        dashboard_data = get_tenant_dashboard_data(self.tenant.id)
        self.assertIsNotNone(dashboard_data)
        self.assertIn('tenant_id', dashboard_data)
        self.assertEqual(dashboard_data['tenant_id'], self.tenant.id)
        
        # Test getting cached dashboard data
        cached_dashboard_data = get_tenant_dashboard_data(self.tenant.id)
        self.assertEqual(dashboard_data, cached_dashboard_data)
        
        # Test getting fresh dashboard data
        fresh_dashboard_data = get_tenant_dashboard_data(
            self.tenant.id, force_refresh=True
        )
        self.assertIsNotNone(fresh_dashboard_data)
        self.assertIn('tenant_id', fresh_dashboard_data)
        self.assertEqual(fresh_dashboard_data['tenant_id'], self.tenant.id)
    
    def test_statistics_cache(self):
        """Test statistics cache functionality"""
        # Test getting statistics data
        statistics_data = get_tenant_statistics_data(self.tenant.id, period="daily")
        self.assertIsNotNone(statistics_data)
        self.assertIn('tenant_id', statistics_data)
        self.assertEqual(statistics_data['tenant_id'], self.tenant.id)
        
        # Test getting cached statistics data
        cached_statistics_data = get_tenant_statistics_data(self.tenant.id, period="daily")
        self.assertEqual(statistics_data, cached_statistics_data)
        
        # Test getting fresh statistics data
        fresh_statistics_data = get_tenant_statistics_data(
            self.tenant.id, period="daily", force_refresh=True
        )
        self.assertIsNotNone(fresh_statistics_data)
        self.assertIn('tenant_id', fresh_statistics_data)
        self.assertEqual(fresh_statistics_data['tenant_id'], self.tenant.id)
    
    def test_cache_invalidation(self):
        """Test cache invalidation functionality"""
        # Set cache data
        cache_data = {'test': 'data', 'timestamp': timezone.now().isoformat()}
        redis_cache_manager.set_tenant_data(
            self.tenant.id, 'test_key', cache_data, timeout=300
        )
        
        # Verify cache data exists
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'test_key'
        )
        self.assertEqual(retrieved_data, cache_data)
        
        # Invalidate cache
        redis_cache_manager.invalidate_tenant_cache(self.tenant.id)
        
        # Verify cache data is invalidated
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'test_key'
        )
        self.assertIsNone(retrieved_data)
    
    def test_cache_performance(self):
        """Test cache performance"""
        # Test cache set performance
        start_time = time.time()
        for i in range(100):
            cache_data = {'test': f'data_{i}', 'timestamp': timezone.now().isoformat()}
            redis_cache_manager.set_tenant_data(
                self.tenant.id, f'test_key_{i}', cache_data, timeout=300
            )
        set_time = time.time() - start_time
        
        # Test cache get performance
        start_time = time.time()
        for i in range(100):
            retrieved_data = redis_cache_manager.get_tenant_data(
                self.tenant.id, f'test_key_{i}'
            )
        get_time = time.time() - start_time
        
        # Performance assertions
        self.assertLess(set_time, 5.0)  # Should set 100 cache entries in less than 5 seconds
        self.assertLess(get_time, 2.0)  # Should get 100 cache entries in less than 2 seconds
        
        print(f"Cache set time for 100 entries: {set_time:.3f}s")
        print(f"Cache get time for 100 entries: {get_time:.3f}s")
    
    def test_cache_concurrent_access(self):
        """Test cache concurrent access"""
        import threading
        import queue
        
        results = queue.Queue()
        
        def cache_operation(operation_id):
            """Perform cache operation"""
            try:
                # Set cache data
                cache_data = {
                    'operation_id': operation_id,
                    'timestamp': timezone.now().isoformat()
                }
                redis_cache_manager.set_tenant_data(
                    self.tenant.id, f'concurrent_key_{operation_id}', cache_data, timeout=300
                )
                
                # Get cache data
                retrieved_data = redis_cache_manager.get_tenant_data(
                    self.tenant.id, f'concurrent_key_{operation_id}'
                )
                
                results.put({
                    'operation_id': operation_id,
                    'success': retrieved_data is not None,
                    'timestamp': timezone.now().isoformat()
                })
            except Exception as e:
                results.put({
                    'operation_id': operation_id,
                    'success': False,
                    'error': str(e),
                    'timestamp': timezone.now().isoformat()
                })
        
        # Test concurrent cache operations
        start_time = time.time()
        
        threads = []
        for i in range(10):
            thread = threading.Thread(target=cache_operation, args=(i,))
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
        
        print(f"Concurrent cache operations completed in {execution_time:.3f}s")
        print(f"Success rate: {success_count}/10")
    
    def test_cache_memory_usage(self):
        """Test cache memory usage"""
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Set large cache data
        large_data = 'x' * 10000  # 10KB per entry
        for i in range(1000):  # 1000 entries = 10MB
            cache_data = {
                'id': i,
                'data': large_data,
                'timestamp': timezone.now().isoformat()
            }
            redis_cache_manager.set_tenant_data(
                self.tenant.id, f'large_key_{i}', cache_data, timeout=300
            )
        
        # Get final memory usage
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Verify cache data exists
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'large_key_0'
        )
        self.assertIsNotNone(retrieved_data)
        self.assertEqual(retrieved_data['id'], 0)
        
        # Memory usage should be reasonable
        self.assertLess(memory_increase, 50.0)  # Should use less than 50MB
        
        print(f"Memory increase: {memory_increase:.2f} MB")
    
    def test_cache_timeout(self):
        """Test cache timeout functionality"""
        # Set cache data with short timeout
        cache_data = {'test': 'data', 'timestamp': timezone.now().isoformat()}
        redis_cache_manager.set_tenant_data(
            self.tenant.id, 'timeout_key', cache_data, timeout=1  # 1 second timeout
        )
        
        # Verify cache data exists immediately
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'timeout_key'
        )
        self.assertEqual(retrieved_data, cache_data)
        
        # Wait for timeout
        time.sleep(2)
        
        # Verify cache data has expired
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'timeout_key'
        )
        self.assertIsNone(retrieved_data)
    
    def test_cache_error_handling(self):
        """Test cache error handling"""
        # Test with invalid tenant ID
        cache_data = {'test': 'data', 'timestamp': timezone.now().isoformat()}
        success = redis_cache_manager.set_tenant_data(
            None, 'test_key', cache_data, timeout=300
        )
        self.assertFalse(success)
        
        # Test with invalid cache data
        success = redis_cache_manager.set_tenant_data(
            self.tenant.id, 'test_key', None, timeout=300
        )
        self.assertFalse(success)
        
        # Test with invalid timeout
        success = redis_cache_manager.set_tenant_data(
            self.tenant.id, 'test_key', cache_data, timeout=-1
        )
        self.assertFalse(success)
    
    def test_cache_statistics(self):
        """Test cache statistics functionality"""
        # Set multiple cache entries
        for i in range(100):
            cache_data = {
                'id': i,
                'data': f'data_{i}',
                'timestamp': timezone.now().isoformat()
            }
            redis_cache_manager.set_tenant_data(
                self.tenant.id, f'stats_key_{i}', cache_data, timeout=300
            )
        
        # Get cache statistics
        cache_stats = redis_cache_manager.get_cache_statistics()
        self.assertIsNotNone(cache_stats)
        self.assertIn('total_entries', cache_stats)
        self.assertIn('memory_usage', cache_stats)
        self.assertIn('hit_rate', cache_stats)
        
        print(f"Cache statistics: {cache_stats}")
    
    def test_cache_cleanup(self):
        """Test cache cleanup functionality"""
        # Set multiple cache entries
        for i in range(100):
            cache_data = {
                'id': i,
                'data': f'data_{i}',
                'timestamp': timezone.now().isoformat()
            }
            redis_cache_manager.set_tenant_data(
                self.tenant.id, f'cleanup_key_{i}', cache_data, timeout=300
            )
        
        # Verify cache entries exist
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'cleanup_key_0'
        )
        self.assertIsNotNone(retrieved_data)
        
        # Cleanup cache
        redis_cache_manager.cleanup_cache()
        
        # Verify cache entries are cleaned up
        retrieved_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'cleanup_key_0'
        )
        self.assertIsNone(retrieved_data)
    
    def test_cache_compression(self):
        """Test cache compression functionality"""
        # Set large cache data
        large_data = 'x' * 100000  # 100KB
        cache_data = {
            'large_data': large_data,
            'timestamp': timezone.now().isoformat()
        }
        
        # Test without compression
        start_time = time.time()
        redis_cache_manager.set_tenant_data(
            self.tenant.id, 'uncompressed_key', cache_data, timeout=300
        )
        uncompressed_time = time.time() - start_time
        
        # Test with compression
        start_time = time.time()
        redis_cache_manager.set_tenant_data(
            self.tenant.id, 'compressed_key', cache_data, timeout=300, compress=True
        )
        compressed_time = time.time() - start_time
        
        # Verify both cache entries exist
        uncompressed_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'uncompressed_key'
        )
        compressed_data = redis_cache_manager.get_tenant_data(
            self.tenant.id, 'compressed_key'
        )
        
        self.assertIsNotNone(uncompressed_data)
        self.assertIsNotNone(compressed_data)
        
        # Compression should be faster for large data
        self.assertLess(compressed_time, uncompressed_time * 1.5)  # Allow 50% tolerance
        
        print(f"Uncompressed time: {uncompressed_time:.3f}s")
        print(f"Compressed time: {compressed_time:.3f}s")
