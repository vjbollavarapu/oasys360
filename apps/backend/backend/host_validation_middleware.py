"""
Custom middleware to validate ALLOWED_HOSTS with subdomain and port support
Django's ALLOWED_HOSTS doesn't support wildcards with ports, so we validate manually
"""

import logging
from django.http import HttpResponseBadRequest
from django.conf import settings

logger = logging.getLogger(__name__)


class HostValidationMiddleware:
    """
    Middleware to validate request host against ALLOWED_HOSTS with subdomain and port support
    This runs before Django's CommonMiddleware which also validates ALLOWED_HOSTS
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Validate host before processing request
        host = request.get_host()
        
        # Skip validation for certain paths (health checks, etc.)
        skip_paths = ['/health/', '/api/health/']
        if any(request.path.startswith(path) for path in skip_paths):
            return self.get_response(request)
        
        # Check if host is allowed
        if not self.is_host_allowed(host):
            logger.warning(f"Disallowed host: {host}")
            return HttpResponseBadRequest(f"Invalid host header: {host}")
        
        return self.get_response(request)
    
    def is_host_allowed(self, host):
        """Check if host is allowed, supporting subdomains and ports"""
        # Split hostname and port
        if ':' in host:
            hostname, port = host.split(':', 1)
        else:
            hostname = host
            port = None
        
        # Check exact matches first (including port)
        if host in settings.ALLOWED_HOSTS:
            return True
        
        # Check hostname matches (ignoring port)
        if hostname in settings.ALLOWED_HOSTS:
            return True
        
        # Check for subdomain patterns (e.g., .localhost)
        for allowed_host in settings.ALLOWED_HOSTS:
            # Skip entries with ports for pattern matching
            if ':' in allowed_host:
                # Check exact match with port
                if allowed_host == host:
                    return True
                continue
            
            # Check for leading dot pattern (e.g., .localhost matches *.localhost)
            if allowed_host.startswith('.'):
                domain = allowed_host[1:]  # Remove leading dot
                # Check if hostname ends with this domain or equals it
                if hostname == domain or hostname.endswith('.' + domain):
                    # In development, allow any port for localhost subdomains
                    if settings.DEBUG and 'localhost' in domain:
                        return True
                    # In production, if no port specified, allow
                    elif not port:
                        return True
        
        # In development mode, be more permissive for localhost subdomains
        if settings.DEBUG:
            if hostname.endswith('.localhost') or hostname == 'localhost':
                # Allow any port for localhost subdomains in development
                return True
            if hostname == '127.0.0.1':
                return True
        
        return False

