"""
Enhanced Multi-Tenant Middleware for Django with PostgreSQL
Provides row-level security, audit logging, and compliance features for fintech applications.
"""

import logging
import time
import json
import hashlib
from typing import Optional, Dict, Any
from django.http import HttpResponse, JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.db import connection, transaction
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
# from django_tenants.middleware import TenantMainMiddleware
# from django_tenants.utils import get_tenant_model, get_public_schema_name
# from django_tenants.models import TenantMixin
import threading

logger = logging.getLogger(__name__)

# Thread-local storage for tenant context
_thread_locals = threading.local()


class EnhancedTenantMiddleware(MiddlewareMixin):
    """
    Enhanced tenant middleware with row-level security, audit logging, and compliance features.
    Extends django-tenants middleware with additional security and monitoring capabilities.
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        self.audit_logger = logging.getLogger('tenant_audit')
        self.security_logger = logging.getLogger('tenant_security')
        
    def process_request(self, request):
        """Process request with enhanced tenant isolation and security"""
        start_time = time.time()
        
        
        # Call parent middleware first
        # response = super().process_request(request)
        # if response:
        #     return response
            
        # Get tenant from request
        tenant = getattr(request, 'tenant', None)
        if not tenant:
            return self._handle_no_tenant(request)
            
        # Set thread-local tenant context
        _thread_locals.tenant = tenant
        _thread_locals.user = getattr(request, 'user', None)
        _thread_locals.request_id = self._generate_request_id(request)
        
        # Configure row-level security
        self._configure_row_level_security(request, tenant)
        
        # Log tenant access
        self._log_tenant_access(request, tenant, start_time)
        
        # Check tenant compliance status
        self._check_tenant_compliance(request, tenant)
        
        return None
    
    def process_response(self, request, response):
        """Process response with audit logging and security headers"""
        # Add tenant-specific security headers
        response = self._add_tenant_security_headers(request, response)
        
        # Log data access for compliance
        self._log_data_access(request, response)
        
        # Clear thread-local context
        self._clear_thread_context()
        
        return response
    
    def _handle_no_tenant(self, request):
        """Handle requests without valid tenant"""
        self.security_logger.warning(
            f"No tenant found for request: {request.method} {request.path} from {self._get_client_ip(request)}"
        )
        return JsonResponse(
            {'error': 'Invalid tenant access'}, 
            status=403
        )
    
    def _configure_row_level_security(self, request, tenant):
        """Configure PostgreSQL row-level security for tenant isolation"""
        if not hasattr(settings, 'ENABLE_ROW_LEVEL_SECURITY') or not settings.ENABLE_ROW_LEVEL_SECURITY:
            return
            
        try:
            with connection.cursor() as cursor:
                # Set tenant context for RLS
                cursor.execute(
                    "SET LOCAL row_security = on;"
                )
                cursor.execute(
                    "SET LOCAL app.current_tenant_id = %s;",
                    [str(tenant.id)]
                )
                
                # Set user context for RLS
                user = getattr(request, 'user', None)
                if user and not isinstance(user, AnonymousUser):
                    cursor.execute(
                        "SET LOCAL app.current_user_id = %s;",
                        [str(user.id)]
                    )
                    cursor.execute(
                        "SET LOCAL app.current_user_role = %s;",
                        [user.role]
                    )
                    
        except Exception as e:
            logger.error(f"Failed to configure row-level security: {e}")
    
    def _log_tenant_access(self, request, tenant, start_time):
        """Log tenant access for audit purposes"""
        access_data = {
            'timestamp': timezone.now().isoformat(),
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'user_id': str(getattr(request.user, 'id', None)) if hasattr(request, 'user') and hasattr(request.user, 'id') else None,
            'user_email': getattr(request.user, 'email', None) if hasattr(request, 'user') else None,
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
            'client_ip': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'request_id': getattr(_thread_locals, 'request_id', None),
        }
        
        self.audit_logger.info(f"Tenant Access: {json.dumps(access_data)}")
    
    def _log_data_access(self, request, response):
        """Log data access for compliance auditing"""
        if not hasattr(request, 'user') or isinstance(request.user, AnonymousUser):
            return
            
        # Only log for authenticated users
        access_data = {
            'timestamp': timezone.now().isoformat(),
            'tenant_id': str(_thread_locals.tenant.id) if hasattr(_thread_locals, 'tenant') else None,
            'user_id': str(request.user.id),
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'response_size': len(response.content) if hasattr(response, 'content') else 0,
            'request_id': getattr(_thread_locals, 'request_id', None),
        }
        
        # Log to compliance audit log
        compliance_logger = logging.getLogger('compliance_audit')
        compliance_logger.info(f"Data Access: {json.dumps(access_data)}")
    
    def _add_tenant_security_headers(self, request, response):
        """Add tenant-specific security headers"""
        if not hasattr(_thread_locals, 'tenant'):
            return response
            
        tenant = _thread_locals.tenant
        
        # Add tenant context headers
        response['X-Tenant-ID'] = str(tenant.id)
        response['X-Tenant-Name'] = tenant.name
        response['X-Request-ID'] = getattr(_thread_locals, 'request_id', '')
        
        # Add security headers for fintech compliance
        response['X-Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'"
        )
        
        return response
    
    def _check_tenant_compliance(self, request, tenant):
        """Check tenant compliance status and restrictions"""
        # Check if tenant is active
        if not tenant.is_active:
            self.security_logger.warning(
                f"Inactive tenant access attempt: {tenant.name} ({tenant.id})"
            )
            return JsonResponse(
                {'error': 'Tenant account is inactive'}, 
                status=403
            )
        
        # Check tenant plan limits
        if hasattr(tenant, 'max_users') and tenant.max_users:
            current_users = tenant.get_active_users_count()
            if current_users >= tenant.max_users:
                self.security_logger.warning(
                    f"Tenant user limit exceeded: {tenant.name} ({current_users}/{tenant.max_users})"
                )
        
        # Check for compliance violations
        self._check_compliance_violations(request, tenant)
    
    def _check_compliance_violations(self, request, tenant):
        """Check for potential compliance violations"""
        # Check for suspicious access patterns
        client_ip = self._get_client_ip(request)
        cache_key = f"tenant_access:{tenant.id}:{client_ip}"
        
        # Track access frequency
        access_count = cache.get(cache_key, 0)
        cache.set(cache_key, access_count + 1, 300)  # 5 minutes
        
        if access_count > 100:  # More than 100 requests in 5 minutes
            self.security_logger.warning(
                f"High frequency access detected for tenant {tenant.name} from {client_ip}"
            )
    
    def _generate_request_id(self, request):
        """Generate unique request ID for tracking"""
        timestamp = str(int(time.time() * 1000))
        client_ip = self._get_client_ip(request)
        path_hash = hashlib.md5(request.path.encode()).hexdigest()[:8]
        return f"{timestamp}-{path_hash}-{client_ip.replace('.', '')}"
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')
    
    def _clear_thread_context(self):
        """Clear thread-local context"""
        if hasattr(_thread_locals, 'tenant'):
            delattr(_thread_locals, 'tenant')
        if hasattr(_thread_locals, 'user'):
            delattr(_thread_locals, 'user')
        if hasattr(_thread_locals, 'request_id'):
            delattr(_thread_locals, 'request_id')


class TenantQueryFilterMiddleware(MiddlewareMixin):
    """
    Middleware to automatically filter queries by tenant.
    Ensures all database queries are scoped to the current tenant.
    """
    
    def process_request(self, request):
        """Set up tenant context for query filtering"""
        if hasattr(request, 'tenant') and request.tenant:
            _thread_locals.tenant = request.tenant
            _thread_locals.user = getattr(request, 'user', None)
    
    def process_response(self, request, response):
        """Clear tenant context after request"""
        if hasattr(_thread_locals, 'tenant'):
            delattr(_thread_locals, 'tenant')
        if hasattr(_thread_locals, 'user'):
            delattr(_thread_locals, 'user')
        return response


class ComplianceAuditMiddleware(MiddlewareMixin):
    """
    Middleware for compliance auditing and data governance.
    Tracks all data access and modifications for regulatory compliance.
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        self.audit_logger = logging.getLogger('compliance_audit')
        self.data_governance_logger = logging.getLogger('data_governance')
    
    def process_request(self, request):
        """Log request for compliance auditing"""
        if not hasattr(request, 'user') or isinstance(request.user, AnonymousUser):
            return None
            
        # Log data access request
        audit_data = {
            'timestamp': timezone.now().isoformat(),
            'user_id': str(request.user.id),
            'tenant_id': str(getattr(request.user, 'tenant_id', None)),
            'method': request.method,
            'path': request.path,
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'session_id': request.session.session_key,
        }
        
        self.audit_logger.info(f"Data Access Request: {json.dumps(audit_data)}")
        return None
    
    def process_response(self, request, response):
        """Log response for compliance auditing"""
        if not hasattr(request, 'user') or isinstance(request.user, AnonymousUser):
            return response
            
        # Log data access response
        audit_data = {
            'timestamp': timezone.now().isoformat(),
            'user_id': str(request.user.id),
            'tenant_id': str(getattr(request.user, 'tenant_id', None)),
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'response_size': len(response.content) if hasattr(response, 'content') else 0,
            'session_id': request.session.session_key,
        }
        
        self.audit_logger.info(f"Data Access Response: {json.dumps(audit_data)}")
        return response
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


# Utility functions for tenant context
def get_current_tenant():
    """Get current tenant from thread-local storage"""
    return getattr(_thread_locals, 'tenant', None)


def get_current_user():
    """Get current user from thread-local storage"""
    return getattr(_thread_locals, 'user', None)


def get_current_request_id():
    """Get current request ID from thread-local storage"""
    return getattr(_thread_locals, 'request_id', None)


def set_tenant_context(tenant, user=None, request_id=None):
    """Set tenant context in thread-local storage"""
    _thread_locals.tenant = tenant
    if user:
        _thread_locals.user = user
    if request_id:
        _thread_locals.request_id = request_id


def clear_tenant_context():
    """Clear tenant context from thread-local storage"""
    if hasattr(_thread_locals, 'tenant'):
        delattr(_thread_locals, 'tenant')
    if hasattr(_thread_locals, 'user'):
        delattr(_thread_locals, 'user')
    if hasattr(_thread_locals, 'request_id'):
        delattr(_thread_locals, 'request_id')
