"""
Health check views for RaynAI backend
Provides comprehensive health monitoring for both multi-tenant and tenant-specific scenarios
"""
import time
import psutil
import os
from datetime import datetime, timezone
from django.http import JsonResponse
from django.db import connection, DatabaseError
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone as django_timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import logging

logger = logging.getLogger(__name__)


class HealthCheckMixin:
    """Mixin providing health check utilities"""
    
    def check_database_connection(self):
        """Check database connectivity"""
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                return {'status': 'healthy', 'message': 'Database connection successful'}
        except DatabaseError as e:
            logger.error(f"Database connection failed: {e}")
            return {'status': 'error', 'message': f'Database connection failed: {str(e)}'}
        except Exception as e:
            logger.error(f"Database check error: {e}")
            return {'status': 'error', 'message': f'Database check error: {str(e)}'}
    
    def check_cache_connection(self):
        """Check cache connectivity"""
        try:
            cache.set('health_check', 'test_value', 10)
            test_value = cache.get('health_check')
            if test_value == 'test_value':
                return {'status': 'healthy', 'message': 'Cache connection successful'}
            else:
                return {'status': 'warning', 'message': 'Cache read/write test failed'}
        except Exception as e:
            logger.error(f"Cache connection failed: {e}")
            return {'status': 'error', 'message': f'Cache connection failed: {str(e)}'}
    
    def check_storage_access(self):
        """Check file storage accessibility"""
        try:
            # Check if media directory is writable
            media_root = getattr(settings, 'MEDIA_ROOT', None)
            if media_root and os.path.exists(media_root):
                test_file = os.path.join(media_root, 'health_check_test.txt')
                with open(test_file, 'w') as f:
                    f.write('test')
                os.remove(test_file)
                return {'status': 'healthy', 'message': 'Storage access successful'}
            else:
                return {'status': 'warning', 'message': 'MEDIA_ROOT not configured or not accessible'}
        except Exception as e:
            logger.error(f"Storage check failed: {e}")
            return {'status': 'error', 'message': f'Storage check failed: {str(e)}'}
    
    def check_system_resources(self):
        """Check system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Define thresholds
            cpu_threshold = 80
            memory_threshold = 85
            disk_threshold = 90
            
            checks = {
                'cpu': {
                    'usage': cpu_percent,
                    'status': 'healthy' if cpu_percent < cpu_threshold else 'warning',
                    'threshold': cpu_threshold
                },
                'memory': {
                    'usage': memory.percent,
                    'available_gb': round(memory.available / (1024**3), 2),
                    'status': 'healthy' if memory.percent < memory_threshold else 'warning',
                    'threshold': memory_threshold
                },
                'disk': {
                    'usage': disk.percent,
                    'free_gb': round(disk.free / (1024**3), 2),
                    'status': 'healthy' if disk.percent < disk_threshold else 'warning',
                    'threshold': disk_threshold
                }
            }
            
            return {'status': 'healthy', 'details': checks}
        except Exception as e:
            logger.error(f"System resources check failed: {e}")
            return {'status': 'error', 'message': f'System resources check failed: {str(e)}'}
    
    def check_tenant_specific_health(self, request):
        """Check tenant-specific health metrics"""
        try:
            # Get tenant information if available
            tenant_info = {}
            if hasattr(request, 'tenant'):
                tenant_info = {
                    'schema_name': getattr(request.tenant, 'schema_name', 'unknown'),
                    'name': getattr(request.tenant, 'name', 'unknown'),
                    'status': getattr(request.tenant, 'status', 'unknown'),
                }
            
            # Check tenant-specific database tables
            tenant_checks = {}
            try:
                with connection.cursor() as cursor:
                    # Check if key tenant tables exist and are accessible
                    tables_to_check = ['user_user', 'patient_patient', 'study_study']
                    for table in tables_to_check:
                        try:
                            cursor.execute(f'SELECT COUNT(*) FROM {table}')
                            count = cursor.fetchone()[0]
                            tenant_checks[table] = {
                                'status': 'healthy',
                                'record_count': count
                            }
                        except Exception as e:
                            tenant_checks[table] = {
                                'status': 'error',
                                'message': f'Table {table} not accessible: {str(e)}'
                            }
            except Exception as e:
                tenant_checks['database'] = {
                    'status': 'error',
                    'message': f'Tenant database check failed: {str(e)}'
                }
            
            return {
                'status': 'healthy',
                'tenant_info': tenant_info,
                'tenant_checks': tenant_checks
            }
        except Exception as e:
            logger.error(f"Tenant-specific health check failed: {e}")
            return {'status': 'error', 'message': f'Tenant-specific health check failed: {str(e)}'}


class MultiTenantHealthView(APIView, HealthCheckMixin):
    """
    Health check endpoint for multi-tenant system (public schema)
    Accessible at: /api/health/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Comprehensive health check for multi-tenant system"""
        start_time = time.time()
        
        # Perform all health checks
        checks = {
            'timestamp': django_timezone.now().isoformat(),
            'service': 'raynai-multi-tenant',
            'version': getattr(settings, 'VERSION', '1.0.0'),
            'environment': getattr(settings, 'ENVIRONMENT', 'development'),
            'database': self.check_database_connection(),
            'cache': self.check_cache_connection(),
            'storage': self.check_storage_access(),
            'system_resources': self.check_system_resources(),
        }
        
        # Check multi-tenant specific components
        try:
            from tenant.models import Tenant, Domain
            tenant_count = Tenant.objects.count()
            domain_count = Domain.objects.count()
            
            checks['multi_tenant'] = {
                'status': 'healthy',
                'total_tenants': tenant_count,
                'total_domains': domain_count,
                'active_tenants': Tenant.objects.filter(is_active=True).count(),
            }
        except Exception as e:
            logger.error(f"Multi-tenant health check failed: {e}")
            checks['multi_tenant'] = {
                'status': 'error',
                'message': f'Multi-tenant check failed: {str(e)}'
            }
        
        # Calculate overall status
        critical_checks = ['database', 'cache']
        warning_checks = ['storage', 'system_resources']
        
        overall_status = 'healthy'
        for check_name in critical_checks:
            if checks.get(check_name, {}).get('status') == 'error':
                overall_status = 'error'
                break
        
        if overall_status == 'healthy':
            for check_name in warning_checks:
                if checks.get(check_name, {}).get('status') == 'error':
                    overall_status = 'warning'
                    break
        
        # Add response time
        checks['response_time_ms'] = round((time.time() - start_time) * 1000, 2)
        checks['overall_status'] = overall_status
        
        # Set appropriate HTTP status code
        status_code = status.HTTP_200_OK
        if overall_status == 'error':
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        elif overall_status == 'warning':
            status_code = status.HTTP_200_OK  # Still 200 but with warning status
        
        return Response(checks, status=status_code)


class TenantHealthView(APIView, HealthCheckMixin):
    """
    Health check endpoint for tenant-specific system
    Accessible at: /api/health/ (within tenant context)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Comprehensive health check for tenant-specific system"""
        start_time = time.time()
        
        # Perform basic health checks
        checks = {
            'timestamp': django_timezone.now().isoformat(),
            'service': 'raynai-tenant',
            'version': getattr(settings, 'VERSION', '1.0.0'),
            'environment': getattr(settings, 'ENVIRONMENT', 'development'),
            'database': self.check_database_connection(),
            'cache': self.check_cache_connection(),
            'storage': self.check_storage_access(),
            'system_resources': self.check_system_resources(),
        }
        
        # Add tenant-specific health checks
        tenant_health = self.check_tenant_specific_health(request)
        checks['tenant_health'] = tenant_health
        
        # Check tenant-specific services
        try:
            # Check if key tenant apps are working
            tenant_services = {}
            
            # Check user service
            try:
                from user.models import User
                user_count = User.objects.count()
                tenant_services['user_service'] = {
                    'status': 'healthy',
                    'user_count': user_count
                }
            except Exception as e:
                tenant_services['user_service'] = {
                    'status': 'error',
                    'message': f'User service check failed: {str(e)}'
                }
            
            # Check patient service
            try:
                from patient.models import Patient
                patient_count = Patient.objects.count()
                tenant_services['patient_service'] = {
                    'status': 'healthy',
                    'patient_count': patient_count
                }
            except Exception as e:
                tenant_services['patient_service'] = {
                    'status': 'error',
                    'message': f'Patient service check failed: {str(e)}'
                }
            
            # Check study service
            try:
                from study.models import Study
                study_count = Study.objects.count()
                tenant_services['study_service'] = {
                    'status': 'healthy',
                    'study_count': study_count
                }
            except Exception as e:
                tenant_services['study_service'] = {
                    'status': 'error',
                    'message': f'Study service check failed: {str(e)}'
                }
            
            checks['tenant_services'] = tenant_services
            
        except Exception as e:
            logger.error(f"Tenant services health check failed: {e}")
            checks['tenant_services'] = {
                'status': 'error',
                'message': f'Tenant services check failed: {str(e)}'
            }
        
        # Calculate overall status
        critical_checks = ['database', 'cache']
        warning_checks = ['storage', 'system_resources', 'tenant_health', 'tenant_services']
        
        overall_status = 'healthy'
        for check_name in critical_checks:
            if checks.get(check_name, {}).get('status') == 'error':
                overall_status = 'error'
                break
        
        if overall_status == 'healthy':
            for check_name in warning_checks:
                if checks.get(check_name, {}).get('status') == 'error':
                    overall_status = 'warning'
                    break
        
        # Add response time
        checks['response_time_ms'] = round((time.time() - start_time) * 1000, 2)
        checks['overall_status'] = overall_status
        
        # Set appropriate HTTP status code
        status_code = status.HTTP_200_OK
        if overall_status == 'error':
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        elif overall_status == 'warning':
            status_code = status.HTTP_200_OK  # Still 200 but with warning status
        
        return Response(checks, status=status_code)


class SimpleHealthView(APIView):
    """
    Simple health check endpoint for basic connectivity
    Accessible at: /health/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Simple health check - just confirms the service is running"""
        return Response({
            'status': 'ok',
            'timestamp': django_timezone.now().isoformat(),
            'service': 'raynai-backend',
            'message': 'Service is running'
        }, status=status.HTTP_200_OK)


# Legacy function-based views for backward compatibility
def simple_health_check(request):
    """Simple health check function for backward compatibility"""
    return JsonResponse({
        'status': 'ok',
        'timestamp': django_timezone.now().isoformat(),
        'service': 'raynai-backend',
        'message': 'Service is running'
    })


def detailed_health_check(request):
    """Detailed health check function for backward compatibility"""
    health_view = MultiTenantHealthView()
    return health_view.get(request)
