# Query Optimization Guide for Large Multi-Tenant Systems

## Overview

This guide explains how to optimize queries for large multi-tenant row-based systems with comprehensive indexing, caching strategies, and Redis integration for per-tenant dashboards.

## Key Features

- **Optimized Indexes**: Comprehensive indexing strategy for multi-tenant queries
- **Query Optimization**: Automatic query optimization with performance monitoring
- **Redis Caching**: Per-tenant caching with Redis for dashboards and statistics
- **Performance Monitoring**: Real-time performance monitoring and analysis
- **Cache Invalidation**: Intelligent cache invalidation strategies
- **Database Optimization**: Database-level optimizations for large datasets

## Database Indexes

### 1. Tenant-Specific Indexes

The most critical indexes for multi-tenant systems:

```python
# Primary tenant index (most important)
Index(fields=['tenant_id'], name='table_tenant_idx')

# Composite indexes for common queries
Index(fields=['tenant_id', 'created_at'], name='table_tenant_created_idx')
Index(fields=['tenant_id', 'is_active'], name='table_tenant_active_idx')
Index(fields=['tenant_id', 'status'], name='table_tenant_status_idx')
Index(fields=['tenant_id', 'account_type'], name='table_tenant_type_idx')
```

### 2. Common Lookup Field Indexes

```python
# Single field indexes for common lookups
Index(fields=['account_number'], name='table_account_number_idx')
Index(fields=['bank_name'], name='table_bank_name_idx')
Index(fields=['status'], name='table_status_idx')
Index(fields=['is_active'], name='table_active_idx')
```

### 3. Composite Indexes for Performance

```python
# Multi-column indexes for complex queries
Index(fields=['tenant_id', 'account_type', 'is_active'], name='table_tenant_type_active_idx')
Index(fields=['tenant_id', 'status', 'created_at'], name='table_tenant_status_created_idx')
Index(fields=['tenant_id', 'bank_name', 'account_number'], name='table_tenant_bank_account_idx')
```

## Query Optimization

### 1. OptimizedTenantQuerySet

```python
from backend.query_optimization import OptimizedTenantQuerySet

# Use optimized queryset with caching
accounts = BankAccount.objects.with_cache(
    timeout=300,  # 5 minutes
    key_prefix=f"accounts:{tenant.id}"
).select_related('tenant').filter(is_active=True)

# Apply additional optimizations
accounts = query_optimizer.optimize_queryset(accounts)
```

### 2. OptimizedTenantManager

```python
from backend.query_optimization import OptimizedTenantManager

class BankAccount(models.Model):
    # ... fields ...
    
    # Use optimized manager
    objects = OptimizedTenantManager()
    
    class Meta:
        indexes = [
            Index(fields=['tenant', 'is_active'], name='bank_accounts_tenant_active_idx'),
            Index(fields=['tenant', 'account_type'], name='bank_accounts_tenant_type_idx'),
            Index(fields=['tenant', 'status'], name='bank_accounts_tenant_status_idx'),
        ]
```

### 3. Query Performance Monitoring

```python
from backend.query_optimization import query_optimizer

# Monitor query performance
performance = query_optimizer.analyze_query_performance(queryset, operation="query")

# Get performance metrics
metrics = queryset.get_performance_metrics()
```

## Redis Caching Strategies

### 1. Per-Tenant Dashboard Caching

```python
from backend.redis_cache import get_tenant_dashboard_data, set_tenant_dashboard_data

# Get cached dashboard data
dashboard_data = get_tenant_dashboard_data(
    tenant_id, 
    force_refresh=request.GET.get('refresh') == 'true'
)

# Set dashboard data with caching
set_tenant_dashboard_data(tenant_id, data, date=None)
```

### 2. Per-Tenant Statistics Caching

```python
from backend.redis_cache import get_tenant_statistics_data, set_tenant_statistics_data

# Get cached statistics data
statistics_data = get_tenant_statistics_data(
    tenant_id,
    period="daily",
    force_refresh=request.GET.get('refresh') == 'true'
)

# Set statistics data with caching
set_tenant_statistics_data(tenant_id, data, period="daily")
```

### 3. Cache Invalidation Strategies

```python
from backend.redis_cache import invalidate_tenant_cache, invalidate_dashboard_cache

# Invalidate all cache for tenant
invalidate_tenant_cache(tenant_id)

# Invalidate specific cache pattern
invalidate_tenant_cache(tenant_id, pattern="dashboard:*")

# Invalidate dashboard cache
invalidate_dashboard_cache(tenant_id)
```

## Caching Strategies for Per-Tenant Dashboards

### 1. Dashboard Data Caching

```python
def get_tenant_dashboard_with_cache(tenant_id, force_refresh=False):
    """Get tenant dashboard with comprehensive caching"""
    # Try Redis cache first
    dashboard_data = redis_cache_manager.get_dashboard_data(
        tenant_id, force_refresh=force_refresh
    )
    
    if dashboard_data is not None:
        return dashboard_data
    
    # Generate fresh data
    dashboard_data = _generate_dashboard_data(tenant_id)
    
    # Cache in Redis
    redis_cache_manager.set_dashboard_data(tenant_id, dashboard_data)
    
    return dashboard_data
```

### 2. Statistics Data Caching

```python
def get_tenant_statistics_with_cache(tenant_id, period="daily", force_refresh=False):
    """Get tenant statistics with comprehensive caching"""
    # Try Redis cache first
    statistics_data = redis_cache_manager.get_statistics_data(
        tenant_id, period, force_refresh=force_refresh
    )
    
    if statistics_data is not None:
        return statistics_data
    
    # Generate fresh data
    statistics_data = _generate_statistics_data(tenant_id, period)
    
    # Cache in Redis
    redis_cache_manager.set_statistics_data(tenant_id, statistics_data, period)
    
    return statistics_data
```

### 3. Cache Key Strategies

```python
# Tenant-specific cache keys
cache_key = f"tenant:{tenant_id}:dashboard:{date}"
cache_key = f"tenant:{tenant_id}:statistics:{period}"
cache_key = f"tenant:{tenant_id}:accounts:list:{hash(filters)}"

# Time-based cache keys
cache_key = f"tenant:{tenant_id}:dashboard:{timezone.now().date()}"
cache_key = f"tenant:{tenant_id}:statistics:{timezone.now().strftime('%Y-%m-%d')}"
```

## Redis Integration with Django

### 1. Redis Configuration

```python
# settings.py

# Redis configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    },
    'tenant_cache': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/2',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Cache configuration
CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes
CACHE_TENANT_TIMEOUT = 3600  # 1 hour
CACHE_DASHBOARD_TIMEOUT = 1800  # 30 minutes
CACHE_STATISTICS_TIMEOUT = 3600  # 1 hour
```

### 2. Redis Cache Manager

```python
from backend.redis_cache import RedisCacheManager

# Initialize Redis cache manager
redis_manager = RedisCacheManager()

# Get tenant data with caching
data = redis_manager.get_tenant_data(tenant_id, "dashboard", default=None)

# Set tenant data with caching
redis_manager.set_tenant_data(tenant_id, "dashboard", data, timeout=3600)

# Invalidate tenant cache
redis_manager.invalidate_tenant_cache(tenant_id)
```

### 3. Dashboard Cache Integration

```python
from backend.redis_cache import dashboard_cache

# Get dashboard metrics
metrics = dashboard_cache.get_dashboard_metrics(tenant_id, metrics_type="overview")

# Invalidate dashboard cache
dashboard_cache.invalidate_dashboard_cache(tenant_id)
```

## Performance Monitoring

### 1. Query Performance Monitoring

```python
def monitor_query_performance(queryset, operation="query"):
    """Monitor query performance"""
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
    logger.info(
        f"Query performance: {operation} took {execution_time:.3f}s, "
        f"result_count: {len(result) if isinstance(result, list) else result}"
    )
    
    return {
        'execution_time': execution_time,
        'result_count': len(result) if isinstance(result, list) else result,
        'operation': operation,
        'timestamp': timezone.now().isoformat()
    }
```

### 2. Cache Performance Monitoring

```python
def monitor_cache_performance(cache_key, operation="get"):
    """Monitor cache performance"""
    start_time = time.time()
    
    if operation == "get":
        result = cache.get(cache_key)
    elif operation == "set":
        result = cache.set(cache_key, "test_data", 300)
    else:
        result = cache.delete(cache_key)
    
    execution_time = time.time() - start_time
    
    # Log cache performance
    logger.info(
        f"Cache performance: {operation} took {execution_time:.3f}s, "
        f"cache_key: {cache_key}"
    )
    
    return {
        'execution_time': execution_time,
        'operation': operation,
        'cache_key': cache_key,
        'timestamp': timezone.now().isoformat()
    }
```

## Usage Examples

### 1. Optimized Views

```python
def list_bank_accounts(request):
    """List bank accounts with optimization"""
    # Use optimized queryset with caching
    accounts = BankAccount.objects.with_cache(
        timeout=300,  # 5 minutes
        key_prefix=f"accounts:{request.user.tenant.id}"
    ).select_related('tenant').filter(is_active=True)
    
    # Apply additional optimizations
    accounts = query_optimizer.optimize_queryset(accounts)
    
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
```

### 2. Optimized ViewSets

```python
class BankAccountViewSet(viewsets.ModelViewSet):
    """Optimized ViewSet for bank accounts"""
    
    def get_queryset(self):
        """Get optimized queryset"""
        # Use optimized queryset with caching
        queryset = BankAccount.objects.select_related('tenant').filter(
            tenant=self.request.user.tenant
        )
        
        # Apply optimization
        queryset = query_optimizer.optimize_queryset(queryset)
        
        return queryset
    
    def list(self, request):
        """List with caching"""
        # Use caching for list operations
        queryset = self.get_queryset().with_cache(
            timeout=300,  # 5 minutes
            key_prefix=f"accounts_list:{request.user.tenant.id}"
        )
        
        # Apply filters
        if request.GET.get('active_only'):
            queryset = queryset.filter(is_active=True)
        
        if request.GET.get('account_type'):
            queryset = queryset.filter(account_type=request.GET.get('account_type'))
        
        # Paginate
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = self.get_serializer(page_obj, many=True)
        
        return JsonResponse({
            'results': serializer.data,
            'count': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
        })
```

### 3. Dashboard Data with Caching

```python
@action(detail=False, methods=['get'])
def dashboard(self, request):
    """Get dashboard data with caching"""
    tenant = request.user.tenant
    
    # Get cached dashboard data
    dashboard_data = get_tenant_dashboard_data(tenant.id)
    
    return JsonResponse(dashboard_data)
```

## Management Commands

### 1. Create Optimized Indexes

```bash
# Create indexes for all models
python manage.py create_optimized_indexes

# Create indexes for specific app
python manage.py create_optimized_indexes --app banking

# Create indexes for specific model
python manage.py create_optimized_indexes --model BankAccount

# Dry run to see what would be created
python manage.py create_optimized_indexes --dry-run
```

### 2. Analyze Index Performance

```python
from backend.management.commands.create_optimized_indexes import IndexAnalyzer

analyzer = IndexAnalyzer()

# Analyze indexes for BankAccount model
indexes = analyzer.analyze_indexes(BankAccount)
usage_stats = analyzer.get_index_usage_stats(BankAccount)
table_stats = analyzer.get_table_stats(BankAccount)
```

## Best Practices

### 1. Index Design

- **Tenant Index First**: Always include tenant_id in composite indexes
- **Common Queries**: Index fields that are frequently queried together
- **Selective Indexes**: Use partial indexes for common filters
- **Monitor Usage**: Regularly analyze index usage and performance

### 2. Caching Strategies

- **Cache Keys**: Use descriptive, hierarchical cache keys
- **Timeouts**: Set appropriate timeouts based on data freshness requirements
- **Invalidation**: Implement intelligent cache invalidation
- **Monitoring**: Monitor cache hit rates and performance

### 3. Query Optimization

- **Select Related**: Use select_related for foreign keys
- **Prefetch Related**: Use prefetch_related for many-to-many relationships
- **Filter Early**: Apply filters as early as possible
- **Limit Results**: Use pagination for large result sets

### 4. Performance Monitoring

- **Query Analysis**: Monitor query execution times
- **Cache Performance**: Track cache hit rates
- **Index Usage**: Analyze index usage statistics
- **Resource Usage**: Monitor memory and CPU usage

## Troubleshooting

### Common Issues

1. **Slow Queries**
   - Check if proper indexes exist
   - Analyze query execution plans
   - Monitor query performance

2. **Cache Misses**
   - Check cache key generation
   - Verify cache timeouts
   - Monitor cache invalidation

3. **Memory Usage**
   - Monitor cache size
   - Implement cache eviction policies
   - Use appropriate cache timeouts

4. **Index Issues**
   - Check index usage statistics
   - Remove unused indexes
   - Optimize index definitions

### Debug Tools

- Use Django debug toolbar for query analysis
- Enable SQL query logging for performance analysis
- Monitor Redis cache performance
- Analyze database index usage

## Conclusion

The comprehensive query optimization system provides:

- **Optimized Indexes**: Strategic indexing for multi-tenant queries
- **Query Optimization**: Automatic query optimization with performance monitoring
- **Redis Caching**: Per-tenant caching for dashboards and statistics
- **Performance Monitoring**: Real-time performance analysis
- **Cache Management**: Intelligent cache invalidation strategies
- **Database Optimization**: Database-level optimizations for large datasets

This implementation ensures optimal performance for large multi-tenant systems while maintaining data integrity and providing comprehensive monitoring capabilities.
