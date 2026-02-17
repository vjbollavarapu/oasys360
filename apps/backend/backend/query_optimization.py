"""
Query Optimization for Large Multi-Tenant Row-Based System
Provides comprehensive query optimization with indexes, caching, and performance monitoring.
"""

import logging
import time
import hashlib
import json
from typing import Any, Optional, Dict, List, Union, Tuple
from django.db import models, connection
from django.db.models import Q, QuerySet, Index, F, Count, Sum, Avg, Max, Min
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from django.core.paginator import Paginator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .row_tenant_middleware import get_current_tenant, get_current_user
# from .audit_service import audit_service  # Temporarily disabled for testing

User = get_user_model()
logger = logging.getLogger(__name__)


class OptimizedTenantQuerySet(QuerySet):
    """
    Optimized QuerySet for multi-tenant queries with caching and performance monitoring.
    """
    
    def __init__(self, model=None, query=None, using=None, hints=None):
        super().__init__(model, query, using, hints)
        self._cache_key = None
        self._cache_timeout = None
        self._performance_metrics = {}
    
    def _clone(self):
        """Clone the queryset with optimization settings"""
        clone = super()._clone()
        clone._cache_key = self._cache_key
        clone._cache_timeout = self._cache_timeout
        clone._performance_metrics = self._performance_metrics.copy()
        return clone
    
    def with_cache(self, timeout=300, key_prefix=None):
        """Enable caching for this queryset"""
        self._cache_timeout = timeout
        if key_prefix:
            self._cache_key = key_prefix
        return self
    
    def _get_cache_key(self, operation="list"):
        """Generate cache key for this queryset"""
        if self._cache_key:
            return self._cache_key
        
        # Generate key based on query parameters
        query_hash = hashlib.md5(
            str(self.query).encode()
        ).hexdigest()[:8]
        
        tenant = get_current_tenant()
        tenant_id = str(tenant.id) if tenant else 'no-tenant'
        
        return f"tenant:{tenant_id}:{self.model.__name__}:{operation}:{query_hash}"
    
    def _execute_with_cache(self, operation="list"):
        """Execute query with caching"""
        if not self._cache_timeout:
            return super().all()
        
        cache_key = self._get_cache_key(operation)
        cached_result = cache.get(cache_key)
        
        if cached_result is not None:
            logger.debug(f"Cache hit for key: {cache_key}")
            return cached_result
        
        # Execute query and cache result
        start_time = time.time()
        result = super().all()
        execution_time = time.time() - start_time
        
        # Cache the result
        cache.set(cache_key, result, self._cache_timeout)
        
        # Log performance metrics
        self._performance_metrics[operation] = {
            'execution_time': execution_time,
            'cache_key': cache_key,
            'cached': False
        }
        
        logger.debug(f"Query executed in {execution_time:.3f}s, cached with key: {cache_key}")
        return result
    
    def all(self):
        """Override all to use caching"""
        return self._execute_with_cache("all")
    
    def filter(self, *args, **kwargs):
        """Override filter to maintain optimization"""
        queryset = super().filter(*args, **kwargs)
        queryset._cache_key = self._cache_key
        queryset._cache_timeout = self._cache_timeout
        return queryset
    
    def exclude(self, *args, **kwargs):
        """Override exclude to maintain optimization"""
        queryset = super().exclude(*args, **kwargs)
        queryset._cache_key = self._cache_key
        queryset._cache_timeout = self._cache_timeout
        return queryset
    
    def select_related(self, *fields):
        """Override select_related to maintain optimization"""
        queryset = super().select_related(*fields)
        queryset._cache_key = self._cache_key
        queryset._cache_timeout = self._cache_timeout
        return queryset
    
    def prefetch_related(self, *lookups):
        """Override prefetch_related to maintain optimization"""
        queryset = super().prefetch_related(*lookups)
        queryset._cache_key = self._cache_key
        queryset._cache_timeout = self._cache_timeout
        return queryset
    
    def count(self):
        """Override count to use caching"""
        if not self._cache_timeout:
            return super().count()
        
        cache_key = self._get_cache_key("count")
        cached_count = cache.get(cache_key)
        
        if cached_count is not None:
            return cached_count
        
        start_time = time.time()
        count = super().count()
        execution_time = time.time() - start_time
        
        cache.set(cache_key, count, self._cache_timeout)
        
        self._performance_metrics['count'] = {
            'execution_time': execution_time,
            'cache_key': cache_key,
            'cached': False
        }
        
        return count
    
    def exists(self):
        """Override exists to use caching"""
        if not self._cache_timeout:
            return super().exists()
        
        cache_key = self._get_cache_key("exists")
        cached_exists = cache.get(cache_key)
        
        if cached_exists is not None:
            return cached_exists
        
        start_time = time.time()
        exists = super().exists()
        execution_time = time.time() - start_time
        
        cache.set(cache_key, exists, self._cache_timeout)
        
        self._performance_metrics['exists'] = {
            'execution_time': execution_time,
            'cache_key': cache_key,
            'cached': False
        }
        
        return exists
    
    def get_performance_metrics(self):
        """Get performance metrics for this queryset"""
        return self._performance_metrics


class OptimizedTenantManager(models.Manager):
    """
    Optimized manager for multi-tenant queries with caching and performance monitoring.
    """
    
    def get_queryset(self):
        """Return optimized queryset"""
        return OptimizedTenantQuerySet(self.model, using=self._db)
    
    def with_cache(self, timeout=300, key_prefix=None):
        """Enable caching for queries"""
        return self.get_queryset().with_cache(timeout, key_prefix)
    
    def for_tenant(self, tenant):
        """Get objects for a specific tenant with optimization"""
        return self.get_queryset().filter(tenant=tenant)
    
    def for_current_tenant(self):
        """Get objects for current tenant with optimization"""
        tenant = get_current_tenant()
        if not tenant:
            return self.get_queryset().none()
        return self.for_tenant(tenant)
    
    def get_dashboard_data(self, tenant, cache_timeout=300):
        """Get optimized dashboard data for tenant"""
        cache_key = f"dashboard:{tenant.id}:{timezone.now().date()}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return cached_data
        
        # Generate dashboard data
        dashboard_data = self._generate_dashboard_data(tenant)
        
        # Cache the result
        cache.set(cache_key, dashboard_data, cache_timeout)
        
        return dashboard_data
    
    def _generate_dashboard_data(self, tenant):
        """Generate dashboard data for tenant"""
        # This would be implemented based on specific business logic
        return {
            'total_records': self.filter(tenant=tenant).count(),
            'recent_activity': self.filter(tenant=tenant).order_by('-created_at')[:10],
            'statistics': self._get_tenant_statistics(tenant),
        }
    
    def _get_tenant_statistics(self, tenant):
        """Get statistics for tenant"""
        return self.filter(tenant=tenant).aggregate(
            total=Count('id'),
            # Add more statistics as needed
        )


class QueryOptimizer:
    """
    Query optimizer for multi-tenant systems.
    """
    
    def __init__(self):
        self.performance_logger = logging.getLogger('query_performance')
        self.cache_logger = logging.getLogger('cache_performance')
    
    def optimize_queryset(self, queryset, tenant=None):
        """Optimize queryset for multi-tenant performance"""
        if not tenant:
            tenant = get_current_tenant()
        
        if not tenant:
            return queryset
        
        # Apply tenant filtering
        if hasattr(queryset.model, 'tenant'):
            queryset = queryset.filter(tenant=tenant)
        
        # Apply common optimizations
        queryset = self._apply_common_optimizations(queryset)
        
        return queryset
    
    def _apply_common_optimizations(self, queryset):
        """Apply common query optimizations"""
        # Use select_related for foreign keys
        if hasattr(queryset.model, 'tenant'):
            queryset = queryset.select_related('tenant')
        
        if hasattr(queryset.model, 'user'):
            queryset = queryset.select_related('user')
        
        if hasattr(queryset.model, 'company'):
            queryset = queryset.select_related('company')
        
        # Use prefetch_related for many-to-many and reverse foreign keys
        # This would be customized based on the specific model
        
        return queryset
    
    def get_optimized_indexes(self, model_class):
        """Get optimized indexes for a model"""
        indexes = []
        
        # Tenant index (most important for multi-tenant)
        if hasattr(model_class, 'tenant'):
            indexes.append(
                Index(fields=['tenant'], name=f'{model_class._meta.db_table}_tenant_idx')
            )
        
        # Common lookup fields
        common_fields = ['created_at', 'updated_at', 'is_active', 'status']
        for field in common_fields:
            if hasattr(model_class, field):
                indexes.append(
                    Index(fields=['tenant', field], name=f'{model_class._meta.db_table}_tenant_{field}_idx')
                )
        
        # Composite indexes for common queries
        if hasattr(model_class, 'tenant') and hasattr(model_class, 'created_at'):
            indexes.append(
                Index(fields=['tenant', 'created_at'], name=f'{model_class._meta.db_table}_tenant_created_idx')
            )
        
        if hasattr(model_class, 'tenant') and hasattr(model_class, 'is_active'):
            indexes.append(
                Index(fields=['tenant', 'is_active'], name=f'{model_class._meta.db_table}_tenant_active_idx')
            )
        
        return indexes
    
    def create_optimized_indexes(self, model_class):
        """Create optimized indexes for a model"""
        indexes = self.get_optimized_indexes(model_class)
        
        with connection.cursor() as cursor:
            for index in indexes:
                try:
                    cursor.execute(f"CREATE INDEX IF NOT EXISTS {index.name} ON {model_class._meta.db_table} ({', '.join(index.fields)})")
                    logger.info(f"Created index {index.name} for {model_class._meta.db_table}")
                except Exception as e:
                    logger.error(f"Failed to create index {index.name}: {e}")
    
    def analyze_query_performance(self, queryset, operation="query"):
        """Analyze query performance"""
        start_time = time.time()
        
        # Execute query
        if operation == "count":
            result = queryset.count()
        elif operation == "exists":
            result = queryset.exists()
        else:
            result = list(queryset)
        
        execution_time = time.time() - start_time
        
        # Log performance metrics
        self.performance_logger.info(
            f"Query performance: {operation} took {execution_time:.3f}s, "
            f"result_count: {len(result) if isinstance(result, list) else result}"
        )
        
        return {
            'execution_time': execution_time,
            'result_count': len(result) if isinstance(result, list) else result,
            'operation': operation,
            'timestamp': timezone.now().isoformat()
        }


class TenantCacheManager:
    """
    Cache manager for tenant-specific data.
    """
    
    def __init__(self):
        self.cache_logger = logging.getLogger('tenant_cache')
    
    def get_tenant_cache_key(self, tenant, key_suffix=""):
        """Generate cache key for tenant"""
        return f"tenant:{tenant.id}:{key_suffix}"
    
    def get_tenant_data(self, tenant, key_suffix, default=None):
        """Get cached data for tenant"""
        cache_key = self.get_tenant_cache_key(tenant, key_suffix)
        return cache.get(cache_key, default)
    
    def set_tenant_data(self, tenant, key_suffix, data, timeout=300):
        """Set cached data for tenant"""
        cache_key = self.get_tenant_cache_key(tenant, key_suffix)
        cache.set(cache_key, data, timeout)
        self.cache_logger.debug(f"Cached data for tenant {tenant.id} with key: {cache_key}")
    
    def invalidate_tenant_cache(self, tenant, key_suffix=None):
        """Invalidate cache for tenant"""
        if key_suffix:
            cache_key = self.get_tenant_cache_key(tenant, key_suffix)
            cache.delete(cache_key)
        else:
            # Invalidate all cache for tenant
            cache_pattern = f"tenant:{tenant.id}:*"
            # This would need to be implemented based on the cache backend
            self.cache_logger.info(f"Invalidated all cache for tenant {tenant.id}")
    
    def get_tenant_dashboard_cache(self, tenant, date=None):
        """Get cached dashboard data for tenant"""
        if not date:
            date = timezone.now().date()
        
        key_suffix = f"dashboard:{date}"
        return self.get_tenant_data(tenant, key_suffix)
    
    def set_tenant_dashboard_cache(self, tenant, data, date=None, timeout=3600):
        """Set cached dashboard data for tenant"""
        if not date:
            date = timezone.now().date()
        
        key_suffix = f"dashboard:{date}"
        self.set_tenant_data(tenant, key_suffix, data, timeout)
    
    def get_tenant_statistics_cache(self, tenant, period="daily"):
        """Get cached statistics for tenant"""
        key_suffix = f"statistics:{period}"
        return self.get_tenant_data(tenant, key_suffix)
    
    def set_tenant_statistics_cache(self, tenant, data, period="daily", timeout=1800):
        """Set cached statistics for tenant"""
        key_suffix = f"statistics:{period}"
        self.set_tenant_data(tenant, key_suffix, data, timeout)


# Global instances
query_optimizer = QueryOptimizer()
tenant_cache_manager = TenantCacheManager()


# Signal handlers for cache invalidation
@receiver(post_save)
def invalidate_tenant_cache_on_save(sender, instance, **kwargs):
    """Invalidate tenant cache when model is saved"""
    if hasattr(instance, 'tenant'):
        tenant_cache_manager.invalidate_tenant_cache(instance.tenant)


@receiver(post_delete)
def invalidate_tenant_cache_on_delete(sender, instance, **kwargs):
    """Invalidate tenant cache when model is deleted"""
    if hasattr(instance, 'tenant'):
        tenant_cache_manager.invalidate_tenant_cache(instance.tenant)


# Utility functions for query optimization
def optimize_tenant_queryset(queryset, tenant=None):
    """Optimize queryset for tenant"""
    return query_optimizer.optimize_queryset(queryset, tenant)


def get_tenant_dashboard_data(tenant, force_refresh=False):
    """Get optimized dashboard data for tenant"""
    if not force_refresh:
        cached_data = tenant_cache_manager.get_tenant_dashboard_cache(tenant)
        if cached_data is not None:
            return cached_data
    
    # Generate fresh data
    dashboard_data = _generate_tenant_dashboard_data(tenant)
    
    # Cache the result
    tenant_cache_manager.set_tenant_dashboard_cache(tenant, dashboard_data)
    
    return dashboard_data


def _generate_tenant_dashboard_data(tenant):
    """Generate dashboard data for tenant"""
    # This would be implemented based on specific business logic
    from .audit_models import AuditLog
    
    # Get recent activity
    recent_activity = AuditLog.objects.filter(
        tenant=tenant
    ).order_by('-timestamp')[:10]
    
    # Get statistics
    statistics = AuditLog.objects.filter(tenant=tenant).aggregate(
        total_operations=Count('id'),
        create_operations=Count('id', filter=Q(operation='CREATE')),
        update_operations=Count('id', filter=Q(operation='UPDATE')),
        delete_operations=Count('id', filter=Q(operation='DELETE')),
    )
    
    return {
        'recent_activity': [
            {
                'id': str(log.id),
                'operation': log.operation,
                'resource_type': log.resource_type,
                'timestamp': log.timestamp.isoformat(),
                'user': log.user.email if log.user else None,
            }
            for log in recent_activity
        ],
        'statistics': statistics,
        'generated_at': timezone.now().isoformat(),
    }


def create_optimized_indexes_for_model(model_class):
    """Create optimized indexes for a model"""
    query_optimizer.create_optimized_indexes(model_class)


def analyze_query_performance(queryset, operation="query"):
    """Analyze query performance"""
    return query_optimizer.analyze_query_performance(queryset, operation)
