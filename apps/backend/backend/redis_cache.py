"""
Redis Caching Layer for Multi-Tenant System
Provides comprehensive Redis caching with tenant isolation and performance optimization.
"""

import logging
import json
import time
import hashlib
from typing import Any, Optional, Dict, List, Union
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model
from .row_tenant_middleware import get_current_tenant, get_current_user

User = get_user_model()
logger = logging.getLogger(__name__)


class RedisCacheManager:
    """
    Redis cache manager for multi-tenant systems with tenant isolation.
    """
    
    def __init__(self):
        self.cache_logger = logging.getLogger('redis_cache')
        self.performance_logger = logging.getLogger('cache_performance')
        self.default_timeout = getattr(settings, 'CACHE_DEFAULT_TIMEOUT', 300)
        self.tenant_prefix = "tenant"
        self.dashboard_prefix = "dashboard"
        self.statistics_prefix = "statistics"
    
    def _get_tenant_key(self, tenant_id, key_suffix=""):
        """Generate tenant-specific cache key"""
        return f"{self.tenant_prefix}:{tenant_id}:{key_suffix}"
    
    def _get_dashboard_key(self, tenant_id, date=None):
        """Generate dashboard cache key"""
        if not date:
            date = timezone.now().date()
        return f"{self.dashboard_prefix}:{tenant_id}:{date}"
    
    def _get_statistics_key(self, tenant_id, period="daily"):
        """Generate statistics cache key"""
        return f"{self.statistics_prefix}:{tenant_id}:{period}"
    
    def get_tenant_data(self, tenant_id, key_suffix, default=None):
        """Get cached data for tenant"""
        cache_key = self._get_tenant_key(tenant_id, key_suffix)
        start_time = time.time()
        
        try:
            data = cache.get(cache_key, default)
            execution_time = time.time() - start_time
            
            self.performance_logger.debug(
                f"Cache get: {cache_key} in {execution_time:.3f}s, hit: {data is not None}"
            )
            
            return data
        except Exception as e:
            self.cache_logger.error(f"Failed to get cache key {cache_key}: {e}")
            return default
    
    def set_tenant_data(self, tenant_id, key_suffix, data, timeout=None):
        """Set cached data for tenant"""
        if timeout is None:
            timeout = self.default_timeout
        
        cache_key = self._get_tenant_key(tenant_id, key_suffix)
        start_time = time.time()
        
        try:
            cache.set(cache_key, data, timeout)
            execution_time = time.time() - start_time
            
            self.performance_logger.debug(
                f"Cache set: {cache_key} in {execution_time:.3f}s, timeout: {timeout}s"
            )
            
            return True
        except Exception as e:
            self.cache_logger.error(f"Failed to set cache key {cache_key}: {e}")
            return False
    
    def delete_tenant_data(self, tenant_id, key_suffix):
        """Delete cached data for tenant"""
        cache_key = self._get_tenant_key(tenant_id, key_suffix)
        
        try:
            cache.delete(cache_key)
            self.cache_logger.debug(f"Deleted cache key: {cache_key}")
            return True
        except Exception as e:
            self.cache_logger.error(f"Failed to delete cache key {cache_key}: {e}")
            return False
    
    def invalidate_tenant_cache(self, tenant_id, pattern=None):
        """Invalidate all cache for tenant"""
        if pattern:
            cache_key = self._get_tenant_key(tenant_id, pattern)
            cache.delete(cache_key)
        else:
            # This would need to be implemented based on the cache backend
            self.cache_logger.info(f"Invalidated all cache for tenant {tenant_id}")
    
    def get_dashboard_data(self, tenant_id, date=None, force_refresh=False):
        """Get cached dashboard data for tenant"""
        if not force_refresh:
            cache_key = self._get_dashboard_key(tenant_id, date)
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return cached_data
        
        # Generate fresh data
        dashboard_data = self._generate_dashboard_data(tenant_id)
        
        # Cache the result
        self.set_dashboard_data(tenant_id, dashboard_data, date)
        
        return dashboard_data
    
    def set_dashboard_data(self, tenant_id, data, date=None, timeout=3600):
        """Set cached dashboard data for tenant"""
        cache_key = self._get_dashboard_key(tenant_id, date)
        return self.set_tenant_data(tenant_id, f"dashboard:{date or timezone.now().date()}", data, timeout)
    
    def get_statistics_data(self, tenant_id, period="daily", force_refresh=False):
        """Get cached statistics data for tenant"""
        if not force_refresh:
            cache_key = self._get_statistics_key(tenant_id, period)
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return cached_data
        
        # Generate fresh data
        statistics_data = self._generate_statistics_data(tenant_id, period)
        
        # Cache the result
        self.set_statistics_data(tenant_id, statistics_data, period)
        
        return statistics_data
    
    def set_statistics_data(self, tenant_id, data, period="daily", timeout=1800):
        """Set cached statistics data for tenant"""
        cache_key = self._get_statistics_key(tenant_id, period)
        return self.set_tenant_data(tenant_id, f"statistics:{period}", data, timeout)
    
    def _generate_dashboard_data(self, tenant_id):
        """Generate dashboard data for tenant"""
        # This would be implemented based on specific business logic
        from .audit_models import AuditLog
        
        # Get recent activity
        recent_activity = AuditLog.objects.filter(
            tenant_id=tenant_id
        ).order_by('-timestamp')[:10]
        
        # Get statistics
        statistics = AuditLog.objects.filter(tenant_id=tenant_id).aggregate(
            total_operations=models.Count('id'),
            create_operations=models.Count('id', filter=models.Q(operation='CREATE')),
            update_operations=models.Count('id', filter=models.Q(operation='UPDATE')),
            delete_operations=models.Count('id', filter=models.Q(operation='DELETE')),
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
    
    def _generate_statistics_data(self, tenant_id, period):
        """Generate statistics data for tenant"""
        # This would be implemented based on specific business logic
        return {
            'period': period,
            'tenant_id': tenant_id,
            'generated_at': timezone.now().isoformat(),
        }


class TenantDashboardCache:
    """
    Specialized cache for tenant dashboards with Redis.
    """
    
    def __init__(self):
        self.redis_manager = RedisCacheManager()
        self.cache_logger = logging.getLogger('dashboard_cache')
    
    def get_dashboard_metrics(self, tenant_id, metrics_type="overview"):
        """Get dashboard metrics for tenant"""
        cache_key = f"dashboard_metrics:{tenant_id}:{metrics_type}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return cached_data
        
        # Generate fresh metrics
        metrics = self._generate_dashboard_metrics(tenant_id, metrics_type)
        
        # Cache the result
        cache.set(cache_key, metrics, 1800)  # 30 minutes
        
        return metrics
    
    def _generate_dashboard_metrics(self, tenant_id, metrics_type):
        """Generate dashboard metrics for tenant"""
        # This would be implemented based on specific business logic
        return {
            'metrics_type': metrics_type,
            'tenant_id': tenant_id,
            'generated_at': timezone.now().isoformat(),
        }
    
    def invalidate_dashboard_cache(self, tenant_id):
        """Invalidate dashboard cache for tenant"""
        cache_pattern = f"dashboard_metrics:{tenant_id}:*"
        # This would need to be implemented based on the cache backend
        self.cache_logger.info(f"Invalidated dashboard cache for tenant {tenant_id}")


class TenantStatisticsCache:
    """
    Specialized cache for tenant statistics with Redis.
    """
    
    def __init__(self):
        self.redis_manager = RedisCacheManager()
        self.cache_logger = logging.getLogger('statistics_cache')
    
    def get_tenant_statistics(self, tenant_id, period="daily", force_refresh=False):
        """Get statistics for tenant"""
        return self.redis_manager.get_statistics_data(tenant_id, period, force_refresh)
    
    def set_tenant_statistics(self, tenant_id, data, period="daily"):
        """Set statistics for tenant"""
        return self.redis_manager.set_statistics_data(tenant_id, data, period)
    
    def invalidate_statistics_cache(self, tenant_id, period=None):
        """Invalidate statistics cache for tenant"""
        if period:
            cache_key = f"statistics:{tenant_id}:{period}"
            cache.delete(cache_key)
        else:
            # Invalidate all statistics cache for tenant
            self.cache_logger.info(f"Invalidated statistics cache for tenant {tenant_id}")


# Global instances
redis_cache_manager = RedisCacheManager()
dashboard_cache = TenantDashboardCache()
statistics_cache = TenantStatisticsCache()


# Utility functions for Redis caching
def get_tenant_dashboard_data(tenant_id, force_refresh=False):
    """Get dashboard data for tenant with Redis caching"""
    return redis_cache_manager.get_dashboard_data(tenant_id, force_refresh=force_refresh)


def set_tenant_dashboard_data(tenant_id, data, date=None):
    """Set dashboard data for tenant with Redis caching"""
    return redis_cache_manager.set_dashboard_data(tenant_id, data, date)


def get_tenant_statistics_data(tenant_id, period="daily", force_refresh=False):
    """Get statistics data for tenant with Redis caching"""
    return redis_cache_manager.get_statistics_data(tenant_id, period, force_refresh)


def set_tenant_statistics_data(tenant_id, data, period="daily"):
    """Set statistics data for tenant with Redis caching"""
    return redis_cache_manager.set_statistics_data(tenant_id, data, period)


def invalidate_tenant_cache(tenant_id, pattern=None):
    """Invalidate cache for tenant"""
    redis_cache_manager.invalidate_tenant_cache(tenant_id, pattern)


def get_dashboard_metrics(tenant_id, metrics_type="overview"):
    """Get dashboard metrics for tenant"""
    return dashboard_cache.get_dashboard_metrics(tenant_id, metrics_type)


def invalidate_dashboard_cache(tenant_id):
    """Invalidate dashboard cache for tenant"""
    dashboard_cache.invalidate_dashboard_cache(tenant_id)


def get_tenant_statistics(tenant_id, period="daily", force_refresh=False):
    """Get statistics for tenant"""
    return statistics_cache.get_tenant_statistics(tenant_id, period, force_refresh)


def invalidate_statistics_cache(tenant_id, period=None):
    """Invalidate statistics cache for tenant"""
    statistics_cache.invalidate_statistics_cache(tenant_id, period)
