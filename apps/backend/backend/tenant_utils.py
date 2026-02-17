"""
Utility functions for tenant handling in views
"""

from typing import Optional
from django.http import HttpRequest
from tenants.models import Tenant


def get_request_tenant(request: HttpRequest) -> Optional[Tenant]:
    """
    Get tenant from request with multiple fallback strategies.
    
    Priority:
    1. request.tenant (set by middleware from JWT)
    2. request.user.tenant (if user is authenticated)
    3. None
    
    Args:
        request: Django HttpRequest object
        
    Returns:
        Tenant object or None
    """
    # Strategy 1: Get tenant set by middleware (from JWT token)
    if hasattr(request, 'tenant') and request.tenant:
        return request.tenant
    
    # Strategy 2: Get tenant from authenticated user
    if hasattr(request, 'user') and request.user.is_authenticated:
        if hasattr(request.user, 'tenant') and request.user.tenant:
            return request.user.tenant
    
    return None


def require_tenant(view_func):
    """
    Decorator to require tenant context for a view.
    Returns 401 if no tenant is found.
    """
    def wrapper(request, *args, **kwargs):
        tenant = get_request_tenant(request)
        if not tenant:
            from rest_framework.response import Response
            from rest_framework import status
            return Response(
                {'error': 'Tenant context required', 'code': 'NO_TENANT'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        request.tenant = tenant
        return view_func(request, *args, **kwargs)
    return wrapper

