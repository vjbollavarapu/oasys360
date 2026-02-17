"""
Tenant Metrics Exporter for Multi-Tenant System
Exports Prometheus metrics for tenant-level performance tracking.
"""

import os
import time
import logging
import psycopg2
import redis
from prometheus_client import start_http_server, Counter, Histogram, Gauge, Summary
from prometheus_client.core import CollectorRegistry, REGISTRY
import threading
from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
registry = CollectorRegistry()

# Tenant-specific metrics
tenant_request_total = Counter(
    'tenant_http_requests_total',
    'Total HTTP requests per tenant',
    ['tenant_id', 'method', 'endpoint', 'status'],
    registry=registry
)

tenant_response_time = Histogram(
    'tenant_response_time_seconds',
    'HTTP response time per tenant',
    ['tenant_id', 'endpoint'],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    registry=registry
)

tenant_active_users = Gauge(
    'tenant_active_users',
    'Number of active users per tenant',
    ['tenant_id'],
    registry=registry
)

tenant_database_queries = Counter(
    'tenant_database_queries_total',
    'Total database queries per tenant',
    ['tenant_id', 'operation', 'table'],
    registry=registry
)

tenant_database_query_time = Histogram(
    'tenant_database_query_time_seconds',
    'Database query time per tenant',
    ['tenant_id', 'operation', 'table'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
    registry=registry
)

tenant_cache_hits = Counter(
    'tenant_cache_hits_total',
    'Total cache hits per tenant',
    ['tenant_id', 'cache_type'],
    registry=registry
)

tenant_cache_misses = Counter(
    'tenant_cache_misses_total',
    'Total cache misses per tenant',
    ['tenant_id', 'cache_type'],
    registry=registry
)

tenant_resource_usage = Gauge(
    'tenant_resource_usage_percent',
    'Resource usage percentage per tenant',
    ['tenant_id', 'resource_type'],
    registry=registry
)

tenant_error_rate = Gauge(
    'tenant_error_rate',
    'Error rate per tenant',
    ['tenant_id'],
    registry=registry
)

tenant_data_size = Gauge(
    'tenant_data_size_bytes',
    'Data size per tenant',
    ['tenant_id', 'data_type'],
    registry=registry
)

# System metrics
system_cpu_usage = Gauge(
    'system_cpu_usage_percent',
    'System CPU usage percentage',
    registry=registry
)

system_memory_usage = Gauge(
    'system_memory_usage_percent',
    'System memory usage percentage',
    registry=registry
)

system_disk_usage = Gauge(
    'system_disk_usage_percent',
    'System disk usage percentage',
    registry=registry
)

database_connections = Gauge(
    'database_connections_total',
    'Total database connections',
    registry=registry
)

redis_memory_usage = Gauge(
    'redis_memory_usage_bytes',
    'Redis memory usage in bytes',
    registry=registry
)

redis_connections = Gauge(
    'redis_connections_total',
    'Total Redis connections',
    registry=registry
)


class TenantMetricsExporter:
    """
    Exports tenant-specific metrics for monitoring and alerting.
    """
    
    def __init__(self):
        self.db_connection = None
        self.redis_connection = None
        self.running = False
        self.metrics_interval = int(os.getenv('METRICS_INTERVAL', '60'))
        
        # Database configuration
        self.db_config = {
            'host': os.getenv('DATABASE_HOST', 'localhost'),
            'port': int(os.getenv('DATABASE_PORT', '5432')),
            'database': os.getenv('DATABASE_NAME', 'oasys360'),
            'user': os.getenv('DATABASE_USER', 'postgres'),
            'password': os.getenv('DATABASE_PASSWORD', 'password')
        }
        
        # Redis configuration
        self.redis_config = {
            'host': os.getenv('REDIS_HOST', 'localhost'),
            'port': int(os.getenv('REDIS_PORT', '6379')),
            'password': os.getenv('REDIS_PASSWORD', ''),
            'db': int(os.getenv('REDIS_DB', '0'))
        }
    
    def connect_database(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_connection = psycopg2.connect(**self.db_config)
            logger.info("Connected to PostgreSQL database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def connect_redis(self):
        """Connect to Redis"""
        try:
            self.redis_connection = redis.Redis(**self.redis_config)
            self.redis_connection.ping()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    def get_tenant_list(self) -> List[str]:
        """Get list of all tenants"""
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT schema_name FROM tenants_tenant WHERE is_active = true")
            tenants = [row[0] for row in cursor.fetchall()]
            cursor.close()
            return tenants
        except Exception as e:
            logger.error(f"Failed to get tenant list: {e}")
            return []
    
    def get_tenant_metrics(self, tenant_id: str) -> Dict:
        """Get metrics for a specific tenant"""
        metrics = {}
        
        try:
            cursor = self.db_connection.cursor()
            
            # Get tenant request metrics
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_requests,
                    AVG(response_time) as avg_response_time,
                    COUNT(CASE WHEN status >= 400 THEN 1 END) as error_count
                FROM audit.audit_logs 
                WHERE tenant_id = %s 
                AND timestamp > NOW() - INTERVAL '1 hour'
            """, (tenant_id,))
            
            result = cursor.fetchone()
            if result:
                metrics['total_requests'] = result[0]
                metrics['avg_response_time'] = result[1] or 0
                metrics['error_count'] = result[2]
                metrics['error_rate'] = (result[2] / result[0]) if result[0] > 0 else 0
            
            # Get tenant database metrics
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_queries,
                    AVG(execution_time) as avg_query_time
                FROM monitoring.tenant_metrics 
                WHERE tenant_id = %s 
                AND metric_name = 'query_time'
                AND timestamp > NOW() - INTERVAL '1 hour'
            """, (tenant_id,))
            
            result = cursor.fetchone()
            if result:
                metrics['total_queries'] = result[0]
                metrics['avg_query_time'] = result[1] or 0
            
            # Get tenant resource usage
            cursor.execute("""
                SELECT 
                    metric_name,
                    AVG(metric_value) as avg_value
                FROM monitoring.tenant_metrics 
                WHERE tenant_id = %s 
                AND metric_name IN ('cpu_usage', 'memory_usage', 'disk_usage')
                AND timestamp > NOW() - INTERVAL '1 hour'
                GROUP BY metric_name
            """, (tenant_id,))
            
            for row in cursor.fetchall():
                metrics[f"{row[0]}_percent"] = row[1] or 0
            
            # Get tenant data size
            cursor.execute("""
                SELECT 
                    COUNT(*) as record_count,
                    pg_size_pretty(pg_total_relation_size(tenant_id::regclass)) as table_size
                FROM information_schema.tables 
                WHERE table_schema = %s
            """, (tenant_id,))
            
            result = cursor.fetchone()
            if result:
                metrics['record_count'] = result[0]
                metrics['table_size'] = result[1]
            
            cursor.close()
            
        except Exception as e:
            logger.error(f"Failed to get metrics for tenant {tenant_id}: {e}")
        
        return metrics
    
    def get_system_metrics(self) -> Dict:
        """Get system-level metrics"""
        metrics = {}
        
        try:
            # Get database connection count
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM pg_stat_activity")
            metrics['database_connections'] = cursor.fetchone()[0]
            cursor.close()
            
            # Get Redis metrics
            if self.redis_connection:
                info = self.redis_connection.info()
                metrics['redis_memory_usage'] = info.get('used_memory', 0)
                metrics['redis_connections'] = info.get('connected_clients', 0)
            
        except Exception as e:
            logger.error(f"Failed to get system metrics: {e}")
        
        return metrics
    
    def update_tenant_metrics(self, tenant_id: str, metrics: Dict):
        """Update Prometheus metrics for a tenant"""
        try:
            # Update request metrics
            if 'total_requests' in metrics:
                tenant_request_total.labels(
                    tenant_id=tenant_id,
                    method='GET',
                    endpoint='all',
                    status='200'
                ).inc(metrics['total_requests'])
            
            # Update response time
            if 'avg_response_time' in metrics:
                tenant_response_time.labels(
                    tenant_id=tenant_id,
                    endpoint='all'
                ).observe(metrics['avg_response_time'])
            
            # Update error rate
            if 'error_rate' in metrics:
                tenant_error_rate.labels(tenant_id=tenant_id).set(metrics['error_rate'])
            
            # Update database metrics
            if 'total_queries' in metrics:
                tenant_database_queries.labels(
                    tenant_id=tenant_id,
                    operation='SELECT',
                    table='all'
                ).inc(metrics['total_queries'])
            
            if 'avg_query_time' in metrics:
                tenant_database_query_time.labels(
                    tenant_id=tenant_id,
                    operation='SELECT',
                    table='all'
                ).observe(metrics['avg_query_time'])
            
            # Update resource usage
            for resource_type in ['cpu_usage', 'memory_usage', 'disk_usage']:
                if f"{resource_type}_percent" in metrics:
                    tenant_resource_usage.labels(
                        tenant_id=tenant_id,
                        resource_type=resource_type
                    ).set(metrics[f"{resource_type}_percent"])
            
            # Update data size
            if 'record_count' in metrics:
                tenant_data_size.labels(
                    tenant_id=tenant_id,
                    data_type='records'
                ).set(metrics['record_count'])
            
        except Exception as e:
            logger.error(f"Failed to update metrics for tenant {tenant_id}: {e}")
    
    def update_system_metrics(self, metrics: Dict):
        """Update system-level Prometheus metrics"""
        try:
            if 'database_connections' in metrics:
                database_connections.set(metrics['database_connections'])
            
            if 'redis_memory_usage' in metrics:
                redis_memory_usage.set(metrics['redis_memory_usage'])
            
            if 'redis_connections' in metrics:
                redis_connections.set(metrics['redis_connections'])
            
        except Exception as e:
            logger.error(f"Failed to update system metrics: {e}")
    
    def collect_metrics(self):
        """Collect metrics from all sources"""
        try:
            # Get system metrics
            system_metrics = self.get_system_metrics()
            self.update_system_metrics(system_metrics)
            
            # Get tenant metrics
            tenants = self.get_tenant_list()
            for tenant_id in tenants:
                tenant_metrics = self.get_tenant_metrics(tenant_id)
                self.update_tenant_metrics(tenant_id, tenant_metrics)
            
            logger.info(f"Collected metrics for {len(tenants)} tenants")
            
        except Exception as e:
            logger.error(f"Failed to collect metrics: {e}")
    
    def start_metrics_collection(self):
        """Start metrics collection in a separate thread"""
        def collect_loop():
            while self.running:
                try:
                    self.collect_metrics()
                    time.sleep(self.metrics_interval)
                except Exception as e:
                    logger.error(f"Error in metrics collection loop: {e}")
                    time.sleep(60)  # Wait before retrying
        
        self.running = True
        thread = threading.Thread(target=collect_loop, daemon=True)
        thread.start()
        logger.info("Started metrics collection thread")
    
    def stop_metrics_collection(self):
        """Stop metrics collection"""
        self.running = False
        logger.info("Stopped metrics collection")
    
    def health_check(self) -> bool:
        """Check if the exporter is healthy"""
        try:
            # Check database connection
            if not self.db_connection or self.db_connection.closed:
                return False
            
            # Check Redis connection
            if not self.redis_connection:
                return False
            
            self.redis_connection.ping()
            return True
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False


def main():
    """Main function"""
    # Get configuration
    metrics_port = int(os.getenv('METRICS_PORT', '8001'))
    
    # Create exporter
    exporter = TenantMetricsExporter()
    
    try:
        # Connect to databases
        exporter.connect_database()
        exporter.connect_redis()
        
        # Start metrics collection
        exporter.start_metrics_collection()
        
        # Start Prometheus HTTP server
        start_http_server(metrics_port, registry=registry)
        logger.info(f"Started metrics server on port {metrics_port}")
        
        # Keep running
        while True:
            if not exporter.health_check():
                logger.error("Health check failed, reconnecting...")
                try:
                    exporter.connect_database()
                    exporter.connect_redis()
                except Exception as e:
                    logger.error(f"Failed to reconnect: {e}")
                    time.sleep(30)
            else:
                time.sleep(10)
    
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        exporter.stop_metrics_collection()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise


if __name__ == '__main__':
    main()
