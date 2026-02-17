"""
Row-based Multi-Tenant Middleware
Handles tenant identification and context for row-based multi-tenancy.
"""

import logging
import threading
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils.deprecation import MiddlewareMixin
# Lazy imports to avoid circular import issues
# from tenants.models import Tenant, Domain
# from authentication.models import User

logger = logging.getLogger(__name__)

# Thread-local storage for tenant context
_thread_locals = threading.local()


def get_current_tenant():
    """Get the current tenant from thread-local storage"""
    return getattr(_thread_locals, 'tenant', None)


def get_current_user():
    """Get the current user from thread-local storage"""
    return getattr(_thread_locals, 'user', None)


def set_tenant_context(tenant, user=None):
    """Set tenant and user context in thread-local storage"""
    _thread_locals.tenant = tenant
    _thread_locals.user = user


def clear_tenant_context():
    """Clear tenant context from thread-local storage"""
    if hasattr(_thread_locals, 'tenant'):
        delattr(_thread_locals, 'tenant')
    if hasattr(_thread_locals, 'user'):
        delattr(_thread_locals, 'user')


class RowTenantMiddleware(MiddlewareMixin):
    """
    Middleware for row-based multi-tenancy.
    Identifies tenant from domain, subdomain, or header.
    """
    
    def process_request(self, request):
        """Process request to identify tenant"""
        # Skip tenant identification for certain paths
        skip_paths = [
            '/admin/',
            '/static/',
            '/media/',
            '/health/',
            '/api/health/',
            '/api/v1/auth/login/',
            '/api/v1/auth/register/',
            '/api/v1/auth/token/',
            '/api/v1/marketing/',
            '/api/schema/',
            '/api/docs/',
            '/api/redoc/',
            '/swagger/',
            '/redoc/',
        ]
        
        for path in skip_paths:
            if request.path.startswith(path):
                return None
        
        try:
            # Try to get tenant from request (will extract from JWT if available)
            tenant = self.get_tenant_from_request(request)
            if tenant:
                set_tenant_context(tenant)
                request.tenant = tenant
                logger.debug(f"Tenant identified: {tenant.name} ({tenant.slug})")
            else:
                # Don't log warning if:
                # 1. It's an auth/public endpoint
                # 2. There's an Authorization header (JWT middleware will handle tenant extraction)
                should_log_warning = (
                    not self._is_auth_endpoint(request) and 
                    not self._is_public_endpoint(request) and
                    not self._has_auth_header(request)
                )
                if should_log_warning:
                    logger.warning("No tenant identified for request")
                request.tenant = None
                
        except Exception as e:
            logger.error(f"Error in tenant middleware: {e}")
            request.tenant = None
    
    def _is_auth_endpoint(self, request):
        """Check if request is to an authentication endpoint"""
        auth_paths = ['/api/v1/auth/login/', '/api/v1/auth/register/', '/api/v1/auth/token/']
        return any(request.path.startswith(path) for path in auth_paths)
    
    def _is_public_endpoint(self, request):
        """Check if request is to a public endpoint"""
        public_paths = ['/health/', '/api/health/', '/api/schema/', '/api/docs/']
        return any(request.path.startswith(path) for path in public_paths)
    
    def _has_auth_header(self, request):
        """Check if request has an Authorization header (JWT middleware will handle tenant extraction)"""
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        return bool(auth_header and auth_header.startswith('Bearer '))
    
    def process_response(self, request, response):
        """Clear tenant context after request"""
        clear_tenant_context()
        return response
    
    def get_tenant_from_request(self, request):
        """Get tenant from request using multiple strategies"""
        from tenants.models import Tenant, Domain  # Lazy import
        # Strategy 1: Check X-Tenant-ID header
        tenant_id = request.META.get('HTTP_X_TENANT_ID')
        if tenant_id:
            try:
                return Tenant.objects.get(id=tenant_id, is_active=True)
            except Tenant.DoesNotExist:
                logger.warning(f"Tenant not found for ID: {tenant_id}")
        
        # Strategy 2: Extract tenant from JWT token (for API requests)
        tenant = self._get_tenant_from_jwt(request)
        if tenant:
            return tenant
        
        # Strategy 3: Check domain-based routing
        host = request.get_host().split(':')[0]  # Remove port if present
        
        # Check for subdomain pattern (tenant.domain.com or tenant.localhost)
        # Support both production (tenant.oasys360.com) and localhost (tenant.localhost)
        subdomain = None
        if '.' in host:
            parts = host.split('.')
            # Handle localhost with subdomain: tenant.localhost
            if len(parts) >= 2 and 'localhost' in parts[1]:
                subdomain = parts[0]
            # Handle production: tenant.domain.com
            elif len(parts) >= 2:
                subdomain = parts[0]
        
        # Skip reserved subdomains
        reserved_subdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp']
        if subdomain and subdomain not in reserved_subdomains:
            try:
                return Tenant.objects.get(slug=subdomain, is_active=True)
            except Tenant.DoesNotExist:
                logger.debug(f"Tenant not found for subdomain: {subdomain}")
        
        # Strategy 4: Check domain mapping
        try:
            domain = Domain.objects.get(domain=host, is_active=True)
            return domain.tenant
        except Domain.DoesNotExist:
            logger.debug(f"No domain mapping found for: {host}")
        
        # Strategy 5: Check for tenant in URL path
        path_parts = request.path.split('/')
        if len(path_parts) > 2 and path_parts[1] == 'api' and path_parts[2] == 'v1':
            # Check if there's a tenant identifier in the path
            # This could be extended based on your URL structure
            pass
        
        return None
    
    def _get_tenant_from_jwt(self, request):
        """Extract tenant from JWT token in Authorization header"""
        from tenants.models import Tenant  # Lazy import
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                return None
            
            # Extract token
            token = auth_header.split(' ')[1]
            
            # Decode JWT token
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
                
                access_token = AccessToken(token)
                payload = access_token.payload
            except (InvalidToken, TokenError):
                # Fallback to manual JWT decoding
                import jwt
                from django.conf import settings
                payload = jwt.decode(
                    token, 
                    settings.SECRET_KEY, 
                    algorithms=['HS256'],
                    options={'verify_exp': True}
                )
            
            # Extract tenant_id from JWT claims
            tenant_id = payload.get('tenant_id')
            if tenant_id:
                try:
                    return Tenant.objects.get(id=tenant_id, is_active=True)
                except Tenant.DoesNotExist:
                    logger.warning(f"Tenant not found for JWT tenant_id: {tenant_id}")
                    return None
            
            # If no tenant_id in token, try to get from authenticated user
            if hasattr(request, 'user') and request.user.is_authenticated:
                if hasattr(request.user, 'tenant') and request.user.tenant:
                    return request.user.tenant
            
            return None
            
        except Exception as e:
            logger.debug(f"Failed to extract tenant from JWT: {e}")
            return None


class TenantQueryFilterMiddleware(MiddlewareMixin):
    """
    Middleware to automatically filter queries by tenant.
    """
    
    def process_request(self, request):
        """Set up tenant filtering for the request"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            # Set tenant context for query filtering
            set_tenant_context(tenant)
        else:
            # Clear context if no tenant
            clear_tenant_context()
    
    def process_response(self, request, response):
        """Clear tenant context after request"""
        clear_tenant_context()
        return response


class TenantAuthMiddleware(MiddlewareMixin):
    """
    Middleware to handle tenant-specific authentication.
    """
    
    def process_request(self, request):
        """Process authentication with tenant context"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            tenant = getattr(request, 'tenant', None)
            if tenant:
                # Verify user belongs to tenant
                if not self.user_belongs_to_tenant(request.user, tenant):
                    logger.warning(f"User {request.user.id} does not belong to tenant {tenant.id}")
                    request.user = None
                    request.tenant = None
                    clear_tenant_context()
                else:
                    set_tenant_context(tenant, request.user)
    
    def user_belongs_to_tenant(self, user, tenant):
        """Check if user belongs to tenant"""
        return hasattr(user, 'tenant') and user.tenant == tenant


class TenantAuditMiddleware(MiddlewareMixin):
    """
    Middleware for tenant-specific audit logging.
    """
    
    def process_request(self, request):
        """Log request for audit purposes"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            logger.info(f"Request from tenant {tenant.name}: {request.method} {request.path}")
    
    def process_response(self, request, response):
        """Log response for audit purposes"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            logger.info(f"Response for tenant {tenant.name}: {response.status_code}")
        return response


class TenantRateLimitMiddleware(MiddlewareMixin):
    """
    Middleware for tenant-specific rate limiting.
    """
    
    def process_request(self, request):
        """Apply rate limiting based on tenant"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            # Apply tenant-specific rate limiting
            # This would integrate with your rate limiting solution
            pass
    
    def process_response(self, request, response):
        """Add rate limiting headers"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            # Add tenant-specific rate limiting headers
            response['X-Tenant-Rate-Limit'] = '1000/hour'
        return response


class TenantSecurityMiddleware(MiddlewareMixin):
    """
    Middleware for tenant-specific security measures.
    """
    
    def process_request(self, request):
        """Apply tenant-specific security measures"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            # Apply tenant-specific security policies
            self.apply_tenant_security(request, tenant)
    
    def apply_tenant_security(self, request, tenant):
        """Apply security measures for tenant"""
        # Add tenant-specific security headers
        request.META['HTTP_X_TENANT_SECURITY'] = 'enabled'
        
        # Apply tenant-specific CORS policies
        if hasattr(tenant, 'settings') and 'cors_origins' in tenant.settings:
            request.META['HTTP_X_TENANT_CORS'] = ','.join(tenant.settings['cors_origins'])
    
    def process_response(self, request, response):
        """Add tenant-specific security headers"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            # Add tenant-specific security headers
            response['X-Tenant-ID'] = str(tenant.id)
            response['X-Tenant-Name'] = tenant.name
            response['X-Tenant-Plan'] = tenant.plan
            
            # Add security headers based on tenant settings
            if hasattr(tenant, 'settings'):
                if tenant.settings.get('enable_csp', False):
                    response['Content-Security-Policy'] = tenant.settings.get('csp_policy', 'default-src self')
                
                if tenant.settings.get('enable_hsts', False):
                    response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response


# Utility functions for tenant context
def get_tenant_from_request(request):
    """Get tenant from request (utility function)"""
    return getattr(request, 'tenant', None)


def require_tenant(view_func):
    """Decorator to require tenant context for a view"""
    def wrapper(request, *args, **kwargs):
        tenant = get_tenant_from_request(request)
        if not tenant:
            raise Http404("Tenant not found")
        return view_func(request, *args, **kwargs)
    return wrapper


def get_tenant_or_404(request):
    """Get tenant from request or raise 404"""
    tenant = get_tenant_from_request(request)
    if not tenant:
        raise Http404("Tenant not found")
    return tenant


def filter_by_tenant(queryset, tenant=None):
    """Filter queryset by tenant"""
    if tenant is None:
        tenant = get_current_tenant()
    
    if tenant and hasattr(queryset.model, 'tenant'):
        return queryset.filter(tenant=tenant)
    
    return queryset


def ensure_tenant_context(view_func):
    """Decorator to ensure tenant context is set"""
    def wrapper(request, *args, **kwargs):
        tenant = get_tenant_from_request(request)
        if tenant:
            set_tenant_context(tenant)
        return view_func(request, *args, **kwargs)
    return wrapper
