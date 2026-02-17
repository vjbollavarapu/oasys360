"""
JWT Authentication Middleware for Multi-Tenant Application
Ensures proper tenant context handling with JWT tokens
"""

from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class JWTMultiTenantMiddleware(MiddlewareMixin):
    """
    Middleware to handle JWT authentication with tenant context
    """
    
    def process_request(self, request):
        """
        Process JWT token and set tenant context
        """
        # Skip for certain paths
        if self._should_skip_middleware(request):
            return None
        
        # Get JWT token from request
        jwt_auth = JWTAuthentication()
        try:
            # Authenticate user with JWT
            auth_result = jwt_auth.authenticate(request)
            if auth_result:
                user, token = auth_result
                request.user = user
                request.jwt_token = token
                
                # Ensure user.tenant is set from token or user object
                # This helps views that use request.user.tenant
                if not hasattr(user, 'tenant') or not user.tenant:
                    # Try to get tenant from token first
                    payload = token.payload
                    if 'tenant_id' in payload and payload['tenant_id']:
                        try:
                            from tenants.models import Tenant
                            tenant = Tenant.objects.get(id=payload['tenant_id'], is_active=True)
                            # Set tenant on user object for backward compatibility
                            user.tenant = tenant
                        except Tenant.DoesNotExist:
                            pass
                
                # Set tenant context from token
                self._set_tenant_context(request, user, token)
                
        except (InvalidToken, TokenError) as e:
            logger.warning(f"JWT authentication failed: {e}")
            # Don't raise exception, let other authentication methods handle it
            pass
        except Exception as e:
            logger.error(f"JWT middleware error: {e}")
            # Don't raise exception, let other authentication methods handle it
            pass
        
        return None
    
    def _should_skip_middleware(self, request):
        """
        Determine if middleware should be skipped for this request
        """
        skip_paths = [
            '/admin/',
            '/static/',
            '/media/',
            '/health/',
            '/api/health/',
            '/api/v1/auth/login/',
            '/api/v1/auth/register/',
            '/api/v1/auth/token/',
            '/api/schema/',
            '/api/docs/',
            '/api/redoc/',
        ]
        
        for path in skip_paths:
            if request.path.startswith(path):
                return True
        
        return False
    
    def _set_tenant_context(self, request, user, token):
        """
        Set tenant context from JWT token
        """
        try:
            # Get tenant information from token payload
            payload = token.payload
            
            # Get or load Tenant object
            tenant = None
            if 'tenant_id' in payload and payload['tenant_id']:
                try:
                    from tenants.models import Tenant
                    tenant = Tenant.objects.get(id=payload['tenant_id'], is_active=True)
                except Tenant.DoesNotExist:
                    logger.warning(f"Tenant not found for JWT tenant_id: {payload['tenant_id']}")
            
            # Fallback to user's tenant if not in token
            if not tenant and hasattr(user, 'tenant') and user.tenant:
                tenant = user.tenant
            
            # Set tenant object and IDs in request
            if tenant:
                request.tenant = tenant
                request.tenant_id = str(tenant.id)
                request.tenant_slug = tenant.slug
                request.tenant_plan = tenant.plan
            else:
                request.tenant = None
                request.tenant_id = None
                request.tenant_slug = None
                request.tenant_plan = None
            
            # Set user role and permissions
            request.user_role = payload.get('role', user.role)
            request.user_permissions = payload.get('permissions', user.permissions)
            
        except Exception as e:
            logger.error(f"Error setting tenant context: {e}")
            # Set defaults
            request.tenant = None
            request.tenant_id = None
            request.tenant_slug = None
            request.tenant_plan = None
            request.user_role = user.role if hasattr(user, 'role') else None
            request.user_permissions = user.permissions if hasattr(user, 'permissions') else []
    
    def process_response(self, request, response):
        """
        Process response to add tenant context headers if needed
        """
        # Add tenant context to response headers for debugging
        if hasattr(request, 'tenant_id') and request.tenant_id:
            response['X-Tenant-ID'] = request.tenant_id
            response['X-Tenant-Slug'] = getattr(request, 'tenant_slug', '')
        
        return response


class JWTTokenValidationMiddleware(MiddlewareMixin):
    """
    Middleware to validate JWT tokens and handle token errors
    """
    
    def process_request(self, request):
        """
        Validate JWT token and handle errors
        """
        # Skip for certain paths
        if self._should_skip_validation(request):
            return None
        
        # Check if request has Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        # Validate token format
        try:
            token = auth_header.split(' ')[1]
            if not token:
                return JsonResponse({
                    'error': 'Invalid token format',
                    'code': 'INVALID_TOKEN_FORMAT'
                }, status=401)
        except IndexError:
            return JsonResponse({
                'error': 'Invalid authorization header format',
                'code': 'INVALID_AUTH_HEADER'
            }, status=401)
        
        return None
    
    def _should_skip_validation(self, request):
        """
        Determine if validation should be skipped for this request
        """
        skip_paths = [
            '/admin/',
            '/static/',
            '/media/',
            '/health/',
            '/api/health/',
            '/api/v1/auth/login/',
            '/api/v1/auth/register/',
            '/api/v1/auth/token/',
        ]
        
        for path in skip_paths:
            if request.path.startswith(path):
                return True
        
        return False


class JWTLogoutMiddleware(MiddlewareMixin):
    """
    Middleware to handle JWT token blacklisting on logout
    """
    
    def process_request(self, request):
        """
        Handle logout requests and blacklist tokens
        """
        if request.path == '/api/v1/auth/logout/' and request.method == 'POST':
            # Get token from request
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                try:
                    token = auth_header.split(' ')[1]
                    # Token will be blacklisted by the logout view
                    pass
                except IndexError:
                    pass
        
        return None
