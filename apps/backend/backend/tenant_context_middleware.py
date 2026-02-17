"""
Tenant Context Middleware for Automatic Tenant Filtering
Extracts tenant_id from request headers or JWT claims and integrates with Django ORM.
"""

import logging
import json
import jwt
from typing import Optional, Dict, Any
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import threading

logger = logging.getLogger(__name__)

# Thread-local storage for tenant context
_thread_locals = threading.local()


class TenantContextMiddleware(MiddlewareMixin):
    """
    Middleware that extracts tenant_id from request headers or JWT claims
    and sets up automatic tenant filtering for Django ORM queries.
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        self.audit_logger = logging.getLogger('tenant_context')
        self.security_logger = logging.getLogger('tenant_security')
    
    def process_request(self, request):
        """Extract tenant_id and set up tenant context"""
        start_time = timezone.now()
        
        try:
            # Extract tenant_id from various sources
            tenant_id = self._extract_tenant_id(request)
            
            if not tenant_id:
                # No tenant context - allow public endpoints
                if self._is_public_endpoint(request):
                    return None
                else:
                    return self._handle_no_tenant(request)
            
            # Validate tenant_id
            tenant = self._validate_tenant(tenant_id)
            if not tenant:
                return self._handle_invalid_tenant(request, tenant_id)
            
            # Set tenant context
            self._set_tenant_context(request, tenant)
            
            # Configure database connection for tenant filtering
            self._configure_database_connection(tenant)
            
            # Log tenant access
            self._log_tenant_access(request, tenant, start_time)
            
            return None
            
        except Exception as e:
            logger.error(f"Tenant context middleware error: {e}")
            return self._handle_error(request, str(e))
    
    def process_response(self, request, response):
        """Clean up tenant context after request"""
        try:
            # Clear thread-local context
            self._clear_tenant_context()
            
            # Add tenant-specific headers
            response = self._add_tenant_headers(request, response)
            
        except Exception as e:
            logger.error(f"Error in tenant context middleware response: {e}")
        
        return response
    
    def _extract_tenant_id(self, request: HttpRequest) -> Optional[str]:
        """Extract tenant_id from request headers or JWT claims"""
        # 1. Check for explicit tenant header
        tenant_id = request.META.get('HTTP_X_TENANT_ID')
        if tenant_id:
            return tenant_id
        
        # 2. Check for tenant in JWT token
        tenant_id = self._extract_tenant_from_jwt(request)
        if tenant_id:
            return tenant_id
        
        # 3. Check for tenant in session
        tenant_id = request.session.get('tenant_id')
        if tenant_id:
            return tenant_id
        
        # 4. Check for tenant in subdomain
        tenant_id = self._extract_tenant_from_subdomain(request)
        if tenant_id:
            return tenant_id
        
        # 5. Check for tenant in URL path
        tenant_id = self._extract_tenant_from_path(request)
        if tenant_id:
            return tenant_id
        
        return None
    
    def _extract_tenant_from_jwt(self, request: HttpRequest) -> Optional[str]:
        """Extract tenant_id from JWT token"""
        try:
            # Get authorization header
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                return None
            
            # Extract token
            token = auth_header.split(' ')[1]
            
            # Decode JWT token
            try:
                # Try with simplejwt first
                access_token = AccessToken(token)
                payload = access_token.payload
            except (InvalidToken, TokenError):
                # Fallback to manual JWT decoding
                payload = jwt.decode(
                    token, 
                    settings.SECRET_KEY, 
                    algorithms=['HS256'],
                    options={'verify_exp': True}
                )
            
            # Extract tenant_id from JWT claims
            tenant_id = payload.get('tenant_id')
            if tenant_id:
                return str(tenant_id)
            
            # Check for tenant in user_id claim (if user_id contains tenant info)
            user_id = payload.get('user_id')
            if user_id and '_' in str(user_id):
                # Assume format: tenant_id_user_id
                parts = str(user_id).split('_', 1)
                if len(parts) == 2:
                    return parts[0]
            
            return None
            
        except Exception as e:
            logger.warning(f"Failed to extract tenant from JWT: {e}")
            return None
    
    def _extract_tenant_from_subdomain(self, request: HttpRequest) -> Optional[str]:
        """Extract tenant_id from subdomain"""
        try:
            host = request.get_host()
            if '.' in host:
                subdomain = host.split('.')[0]
                # Validate subdomain format (UUID or slug)
                if self._is_valid_tenant_identifier(subdomain):
                    return subdomain
            return None
        except Exception:
            return None
    
    def _extract_tenant_from_path(self, request: HttpRequest) -> Optional[str]:
        """Extract tenant_id from URL path"""
        try:
            path = request.path
            # Check for /tenant/{tenant_id}/ pattern
            if path.startswith('/tenant/'):
                parts = path.split('/')
                if len(parts) >= 3:
                    tenant_id = parts[2]
                    if self._is_valid_tenant_identifier(tenant_id):
                        return tenant_id
            return None
        except Exception:
            return None
    
    def _is_valid_tenant_identifier(self, identifier: str) -> bool:
        """Validate tenant identifier format"""
        if not identifier:
            return False
        
        # Check if it's a UUID
        try:
            import uuid
            uuid.UUID(identifier)
            return True
        except ValueError:
            pass
        
        # Check if it's a valid slug (alphanumeric with hyphens)
        if identifier.replace('-', '').replace('_', '').isalnum():
            return True
        
        return False
    
    def _validate_tenant(self, tenant_id: str):
        """Validate tenant_id and return tenant object"""
        try:
            # Check cache first
            cache_key = f"tenant:{tenant_id}"
            tenant = cache.get(cache_key)
            
            if tenant:
                return tenant
            
            # Query database
            from tenants.models import Tenant
            tenant = Tenant.objects.filter(
                id=tenant_id,
                is_active=True
            ).first()
            
            if tenant:
                # Cache tenant for 5 minutes
                cache.set(cache_key, tenant, 300)
                return tenant
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to validate tenant {tenant_id}: {e}")
            return None
    
    def _set_tenant_context(self, request: HttpRequest, tenant):
        """Set tenant context in thread-local storage"""
        _thread_locals.tenant = tenant
        _thread_locals.user = getattr(request, 'user', None)
        _thread_locals.request_id = self._generate_request_id(request)
        _thread_locals.tenant_id = str(tenant.id)
        
        # Also set in request for easy access
        request.tenant = tenant
        request.tenant_id = str(tenant.id)
    
    def _configure_database_connection(self, tenant):
        """Configure database connection for tenant filtering"""
        try:
            with connection.cursor() as cursor:
                # Set tenant context for RLS
                cursor.execute("SET LOCAL app.current_tenant_id = %s", [str(tenant.id)])
                
                # Set user context if available
                user = getattr(_thread_locals, 'user', None)
                if user and not isinstance(user, AnonymousUser):
                    cursor.execute("SET LOCAL app.current_user_id = %s", [str(user.id)])
                    cursor.execute("SET LOCAL app.current_user_role = %s", [user.role])
                
                # Enable RLS if configured
                if getattr(settings, 'ENABLE_ROW_LEVEL_SECURITY', False):
                    cursor.execute("SET LOCAL row_security = on")
                
        except Exception as e:
            logger.error(f"Failed to configure database connection: {e}")
    
    def _log_tenant_access(self, request: HttpRequest, tenant, start_time):
        """Log tenant access for audit purposes"""
        access_data = {
            'timestamp': start_time.isoformat(),
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'user_id': getattr(request.user, 'id', None) if hasattr(request, 'user') else None,
            'user_email': getattr(request.user, 'email', None) if hasattr(request, 'user') else None,
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
            'client_ip': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'request_id': getattr(_thread_locals, 'request_id', None),
        }
        
        self.audit_logger.info(f"Tenant Access: {json.dumps(access_data)}")
    
    def _add_tenant_headers(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """Add tenant-specific headers to response"""
        if hasattr(_thread_locals, 'tenant'):
            tenant = _thread_locals.tenant
            response['X-Tenant-ID'] = str(tenant.id)
            response['X-Tenant-Name'] = tenant.name
            response['X-Request-ID'] = getattr(_thread_locals, 'request_id', '')
        
        return response
    
    def _clear_tenant_context(self):
        """Clear tenant context from thread-local storage"""
        if hasattr(_thread_locals, 'tenant'):
            delattr(_thread_locals, 'tenant')
        if hasattr(_thread_locals, 'user'):
            delattr(_thread_locals, 'user')
        if hasattr(_thread_locals, 'request_id'):
            delattr(_thread_locals, 'request_id')
        if hasattr(_thread_locals, 'tenant_id'):
            delattr(_thread_locals, 'tenant_id')
    
    def _is_public_endpoint(self, request: HttpRequest) -> bool:
        """Check if endpoint is public (doesn't require tenant)"""
        public_paths = [
            '/admin/',
            '/health/',
            '/api/health/',
            '/static/',
            '/media/',
            '/api/auth/',
            '/api/public/',
        ]
        
        path = request.path
        return any(path.startswith(public_path) for public_path in public_paths)
    
    def _handle_no_tenant(self, request: HttpRequest) -> JsonResponse:
        """Handle requests without tenant context"""
        self.security_logger.warning(
            f"No tenant context for request: {request.method} {request.path} from {self._get_client_ip(request)}"
        )
        return JsonResponse(
            {'error': 'Tenant context required', 'code': 'TENANT_REQUIRED'}, 
            status=400
        )
    
    def _handle_invalid_tenant(self, request: HttpRequest, tenant_id: str) -> JsonResponse:
        """Handle requests with invalid tenant"""
        self.security_logger.warning(
            f"Invalid tenant access attempt: {tenant_id} for {request.method} {request.path} from {self._get_client_ip(request)}"
        )
        return JsonResponse(
            {'error': 'Invalid tenant', 'code': 'INVALID_TENANT'}, 
            status=403
        )
    
    def _handle_error(self, request: HttpRequest, error_message: str) -> JsonResponse:
        """Handle middleware errors"""
        self.security_logger.error(
            f"Tenant context middleware error: {error_message} for {request.method} {request.path}"
        )
        return JsonResponse(
            {'error': 'Internal server error', 'code': 'TENANT_MIDDLEWARE_ERROR'}, 
            status=500
        )
    
    def _generate_request_id(self, request: HttpRequest) -> str:
        """Generate unique request ID for tracking"""
        import time
        import hashlib
        
        timestamp = str(int(time.time() * 1000))
        client_ip = self._get_client_ip(request)
        path_hash = hashlib.md5(request.path.encode()).hexdigest()[:8]
        return f"{timestamp}-{path_hash}-{client_ip.replace('.', '')}"
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


class TenantQueryFilterMiddleware(MiddlewareMixin):
    """
    Middleware that automatically applies tenant filtering to Django ORM queries.
    Works in conjunction with TenantContextMiddleware.
    """
    
    def process_request(self, request):
        """Set up tenant context for query filtering"""
        if hasattr(request, 'tenant') and request.tenant:
            _thread_locals.tenant = request.tenant
            _thread_locals.user = getattr(request, 'user', None)
            _thread_locals.tenant_id = str(request.tenant.id)
    
    def process_response(self, request, response):
        """Clear tenant context after request"""
        if hasattr(_thread_locals, 'tenant'):
            delattr(_thread_locals, 'tenant')
        if hasattr(_thread_locals, 'user'):
            delattr(_thread_locals, 'user')
        if hasattr(_thread_locals, 'tenant_id'):
            delattr(_thread_locals, 'tenant_id')
        return response


# Utility functions for accessing tenant context
def get_current_tenant():
    """Get current tenant from thread-local storage"""
    return getattr(_thread_locals, 'tenant', None)


def get_current_user():
    """Get current user from thread-local storage"""
    return getattr(_thread_locals, 'user', None)


def get_current_tenant_id():
    """Get current tenant ID from thread-local storage"""
    return getattr(_thread_locals, 'tenant_id', None)


def get_current_request_id():
    """Get current request ID from thread-local storage"""
    return getattr(_thread_locals, 'request_id', None)


def set_tenant_context(tenant, user=None, request_id=None):
    """Set tenant context in thread-local storage"""
    _thread_locals.tenant = tenant
    _thread_locals.tenant_id = str(tenant.id)
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
    if hasattr(_thread_locals, 'tenant_id'):
        delattr(_thread_locals, 'tenant_id')
    if hasattr(_thread_locals, 'request_id'):
        delattr(_thread_locals, 'request_id')


def require_tenant_context():
    """Decorator to require tenant context"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            tenant = get_current_tenant()
            if not tenant:
                raise PermissionDenied("Tenant context required")
            return func(*args, **kwargs)
        return wrapper
    return decorator
