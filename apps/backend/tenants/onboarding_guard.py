"""
Onboarding Guard - Enforces onboarding completion before dashboard access
"""
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import BasePermission
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)


class OnboardingRequired(BasePermission):
    """
    Permission class that requires onboarding to be completed
    """
    message = "Onboarding incomplete. Please complete onboarding to access this resource."
    code = "ONBOARDING_INCOMPLETE"

    def has_permission(self, request, view):
        # Skip check for public endpoints
        if hasattr(view, 'skip_onboarding_check') and view.skip_onboarding_check:
            return True
        
        # Skip check for onboarding endpoints themselves
        if request.path.startswith('/api/v1/onboarding/') or request.path.startswith('/api/v1/tenants/onboarding/'):
            return True
        
        # Skip check for auth endpoints
        if request.path.startswith('/api/v1/auth/'):
            return True
        
        # Get tenant from request
        tenant = getattr(request, 'tenant', None)
        if not tenant:
            # No tenant context - might be public endpoint
            return True
        
        # Check onboarding status
        if not tenant.is_onboarding_complete():
            logger.warning(
                f"Onboarding check failed for tenant {tenant.id} on path {request.path}"
            )
            return False
        
        return True


def require_onboarding_complete(view_func):
    """
    Decorator to require onboarding completion before accessing a view
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Skip check for onboarding endpoints
        if request.path.startswith('/api/v1/onboarding/') or request.path.startswith('/api/v1/tenants/onboarding/'):
            return view_func(request, *args, **kwargs)
        
        # Skip check for auth endpoints
        if request.path.startswith('/api/v1/auth/'):
            return view_func(request, *args, **kwargs)
        
        # Get tenant from request
        tenant = getattr(request, 'tenant', None)
        if not tenant:
            # No tenant context - might be public endpoint
            return view_func(request, *args, **kwargs)
        
        # Check onboarding status
        if not tenant.is_onboarding_complete():
            return JsonResponse(
                {
                    'error': 'Onboarding incomplete',
                    'message': 'Please complete onboarding to access this resource.',
                    'code': 'ONBOARDING_INCOMPLETE',
                    'onboarding_status': tenant.onboarding_status,
                    'onboarding_url': '/onboarding',
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


class OnboardingGuardMiddleware:
    """
    Middleware to enforce onboarding completion
    """
    # Paths that should bypass onboarding check
    BYPASS_PATHS = [
        '/api/v1/auth/',
        '/api/v1/onboarding/',  # Legacy path (if used)
        '/api/v1/tenants/onboarding/',  # Actual onboarding endpoints
        '/api/v1/tenants/me/',  # Allow fetching tenant info during onboarding
        '/api/health/',
        '/api/schema/',
        '/api/docs/',
        '/api/redoc/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Check if path should bypass onboarding check (including onboarding endpoints)
        if any(request.path.startswith(path) for path in self.BYPASS_PATHS):
            return self.get_response(request)
        
        # Explicitly allow onboarding endpoints (even if not in BYPASS_PATHS)
        if request.path.startswith('/api/v1/tenants/onboarding/'):
            return self.get_response(request)
        
        # Only check for authenticated API requests
        if not request.path.startswith('/api/v1/'):
            return self.get_response(request)
        
        # Get tenant from request (set by tenant middleware)
        tenant = getattr(request, 'tenant', None)
        
        # If no tenant is identified, allow the request (might be public endpoint or tenant will be set later)
        if not tenant:
            return self.get_response(request)
        
        # Only block if tenant exists and onboarding is incomplete
        if tenant and not tenant.is_onboarding_complete():
            # Check if user is authenticated
            if hasattr(request, 'user') and request.user.is_authenticated:
                return JsonResponse(
                    {
                        'error': 'Onboarding incomplete',
                        'message': 'Please complete onboarding to access this resource.',
                        'code': 'ONBOARDING_INCOMPLETE',
                        'onboarding_status': tenant.onboarding_status,
                        'onboarding_url': '/onboarding',
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return self.get_response(request)

