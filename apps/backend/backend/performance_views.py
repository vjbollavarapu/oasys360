# backend/performance_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.db import connection
from django.conf import settings
import time
import psutil
import os
from .redis_config import redis_cache, get_cache_stats
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def performance_metrics(request):
    """Get system performance metrics"""
    try:
        # Database performance
        db_queries = len(connection.queries)
        db_time = sum(float(query['time']) for query in connection.queries)
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Cache statistics
        cache_stats = get_cache_stats()
        
        # Redis statistics
        redis_stats = {}
        if redis_cache.is_connected():
            try:
                redis_info = redis_cache.redis_client.info()
                redis_stats = {
                    'connected': True,
                    'used_memory': redis_info.get('used_memory_human', '0B'),
                    'connected_clients': redis_info.get('connected_clients', 0),
                    'total_commands_processed': redis_info.get('total_commands_processed', 0),
                    'keyspace_hits': redis_info.get('keyspace_hits', 0),
                    'keyspace_misses': redis_info.get('keyspace_misses', 0),
                    'hit_rate': (
                        redis_info.get('keyspace_hits', 0) / 
                        max(redis_info.get('keyspace_hits', 0) + redis_info.get('keyspace_misses', 0), 1) * 100
                    )
                }
            except Exception as e:
                logger.error(f"Error getting Redis stats: {e}")
                redis_stats = {'connected': False, 'error': str(e)}
        
        # Application metrics
        app_stats = {
            'debug_mode': settings.DEBUG,
            'database_engine': settings.DATABASES['default']['ENGINE'],
            'cache_backend': settings.CACHES['default']['BACKEND'],
            'timezone': str(settings.TIME_ZONE),
        }
        
        metrics = {
            'timestamp': time.time(),
            'database': {
                'queries_count': db_queries,
                'total_time': round(db_time, 4),
                'average_query_time': round(db_time / max(db_queries, 1), 4),
            },
            'system': {
                'cpu_percent': cpu_percent,
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent,
                    'used': memory.used,
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': (disk.used / disk.total) * 100,
                },
            },
            'cache': cache_stats,
            'redis': redis_stats,
            'application': app_stats,
        }
        
        return Response(metrics, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        return Response(
            {'error': 'Failed to get performance metrics', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def cache_status(request):
    """Get cache status and statistics"""
    try:
        # Test cache operations
        test_key = 'performance_test_key'
        test_value = {'test': True, 'timestamp': time.time()}
        
        # Test set
        cache.set(test_key, test_value, 60)
        
        # Test get
        cached_value = cache.get(test_key)
        
        # Test delete
        cache.delete(test_key)
        
        # Get cache statistics
        cache_stats = get_cache_stats()
        
        status_data = {
            'cache_working': cached_value == test_value,
            'cache_backend': settings.CACHES['default']['BACKEND'],
            'cache_location': settings.CACHES['default']['LOCATION'],
            'cache_timeout': settings.CACHES['default']['TIMEOUT'],
            'statistics': cache_stats,
        }
        
        return Response(status_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error checking cache status: {e}")
        return Response(
            {'error': 'Cache not working', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def clear_cache(request):
    """Clear application cache"""
    try:
        cache_type = request.data.get('type', 'all')
        
        if cache_type == 'all':
            cache.clear()
            message = 'All cache cleared successfully'
        elif cache_type == 'user':
            user_id = request.user.id
            redis_cache.delete_pattern(f"user:{user_id}:*")
            message = f'User cache cleared for user {user_id}'
        elif cache_type == 'tenant':
            tenant_id = getattr(request, 'tenant', None)
            if tenant_id:
                redis_cache.delete_pattern(f"tenant:{tenant_id}:*")
                message = f'Tenant cache cleared for tenant {tenant_id}'
            else:
                return Response(
                    {'error': 'No tenant context available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif cache_type == 'api':
            redis_cache.delete_pattern("api:*")
            message = 'API cache cleared successfully'
        else:
            return Response(
                {'error': 'Invalid cache type. Use: all, user, tenant, or api'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'message': message}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return Response(
            {'error': 'Failed to clear cache', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def database_health(request):
    """Check database health and performance"""
    try:
        start_time = time.time()
        
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        
        connection_time = time.time() - start_time
        
        # Get database statistics
        with connection.cursor() as cursor:
            # Get table count
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            table_count = cursor.fetchone()[0]
            
            # Get database size
            cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database()))")
            db_size = cursor.fetchone()[0]
        
        health_data = {
            'status': 'healthy',
            'connection_time': round(connection_time, 4),
            'table_count': table_count,
            'database_size': db_size,
            'database_engine': settings.DATABASES['default']['ENGINE'],
            'database_name': settings.DATABASES['default']['NAME'],
        }
        
        return Response(health_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return Response(
            {
                'status': 'unhealthy',
                'error': 'Database connection failed',
                'detail': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def system_health(request):
    """Comprehensive system health check"""
    try:
        health_data = {
            'timestamp': time.time(),
            'status': 'healthy',
            'checks': {}
        }
        
        # Database health
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_data['checks']['database'] = {'status': 'healthy'}
        except Exception as e:
            health_data['checks']['database'] = {'status': 'unhealthy', 'error': str(e)}
            health_data['status'] = 'degraded'
        
        # Cache health
        try:
            cache.set('health_check', 'ok', 60)
            cache_result = cache.get('health_check')
            cache.delete('health_check')
            health_data['checks']['cache'] = {
                'status': 'healthy' if cache_result == 'ok' else 'unhealthy'
            }
        except Exception as e:
            health_data['checks']['cache'] = {'status': 'unhealthy', 'error': str(e)}
            health_data['status'] = 'degraded'
        
        # Redis health
        try:
            if redis_cache.is_connected():
                redis_cache.redis_client.ping()
                health_data['checks']['redis'] = {'status': 'healthy'}
            else:
                health_data['checks']['redis'] = {'status': 'unhealthy', 'error': 'Not connected'}
                health_data['status'] = 'degraded'
        except Exception as e:
            health_data['checks']['redis'] = {'status': 'unhealthy', 'error': str(e)}
            health_data['status'] = 'degraded'
        
        # System resources
        try:
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            health_data['checks']['system'] = {
                'status': 'healthy',
                'memory_usage': memory.percent,
                'disk_usage': (disk.used / disk.total) * 100,
            }
            
            # Check if resources are critically low
            if memory.percent > 90 or (disk.used / disk.total) > 90:
                health_data['status'] = 'degraded'
                health_data['checks']['system']['status'] = 'warning'
                
        except Exception as e:
            health_data['checks']['system'] = {'status': 'unhealthy', 'error': str(e)}
            health_data['status'] = 'degraded'
        
        return Response(health_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        return Response(
            {
                'status': 'unhealthy',
                'error': 'System health check failed',
                'detail': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
