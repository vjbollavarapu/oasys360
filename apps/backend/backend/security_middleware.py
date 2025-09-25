# backend/security_middleware.py
import time
import logging
from django.http import HttpResponse, JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.core.cache import cache
from django.utils.crypto import constant_time_compare
import hashlib
import hmac
import json

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(MiddlewareMixin):
    """Add security headers to all responses"""
    
    def process_response(self, request, response):
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        
        # Security headers
        security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Content-Security-Policy': csp,
        }
        
        # Add headers to response
        for header, value in security_headers.items():
            response[header] = value
        
        return response

class RateLimitMiddleware(MiddlewareMixin):
    """Rate limiting middleware"""
    
    def process_request(self, request):
        # Skip rate limiting for certain paths
        skip_paths = ['/health/', '/api/health/', '/static/', '/media/']
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Rate limit key
        rate_limit_key = f"rate_limit:{client_ip}"
        
        # Check current request count
        current_requests = cache.get(rate_limit_key, 0)
        
        # Rate limit: 100 requests per minute
        max_requests = 100
        window_seconds = 60
        
        if current_requests >= max_requests:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JsonResponse(
                {'error': 'Rate limit exceeded. Please try again later.'},
                status=429
            )
        
        # Increment request count
        cache.set(rate_limit_key, current_requests + 1, window_seconds)
        
        return None
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class RequestLoggingMiddleware(MiddlewareMixin):
    """Log all requests for security monitoring"""
    
    def process_request(self, request):
        request.start_time = time.time()
        
        # Log suspicious requests
        if self.is_suspicious_request(request):
            logger.warning(f"Suspicious request detected: {request.method} {request.path} from {self.get_client_ip(request)}")
        
        return None
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log slow requests
            if duration > 5.0:  # 5 seconds
                logger.warning(f"Slow request: {request.method} {request.path} took {duration:.2f}s")
            
            # Log error responses
            if response.status_code >= 400:
                logger.warning(f"Error response: {request.method} {request.path} - {response.status_code}")
        
        return response
    
    def is_suspicious_request(self, request):
        """Check if request is suspicious"""
        suspicious_patterns = [
            '..',  # Path traversal
            '<script',  # XSS attempt
            'union select',  # SQL injection
            'drop table',  # SQL injection
            'exec(',  # Command injection
            'eval(',  # Code injection
        ]
        
        # Check URL path
        path = request.path.lower()
        if any(pattern in path for pattern in suspicious_patterns):
            return True
        
        # Check query parameters
        for param, value in request.GET.items():
            if any(pattern in str(value).lower() for pattern in suspicious_patterns):
                return True
        
        # Check POST data
        if request.method == 'POST':
            for key, value in request.POST.items():
                if any(pattern in str(value).lower() for pattern in suspicious_patterns):
                    return True
        
        return False
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class CSRFProtectionMiddleware(MiddlewareMixin):
    """Enhanced CSRF protection"""
    
    def process_request(self, request):
        # Skip CSRF for safe methods
        if request.method in ['GET', 'HEAD', 'OPTIONS', 'TRACE']:
            return None
        
        # Skip CSRF for API endpoints with proper authentication
        if request.path.startswith('/api/') and self.has_valid_auth(request):
            return None
        
        # Check CSRF token
        csrf_token = request.META.get('HTTP_X_CSRFTOKEN')
        if not csrf_token:
            return JsonResponse(
                {'error': 'CSRF token missing'},
                status=403
            )
        
        # Verify CSRF token
        if not self.verify_csrf_token(request, csrf_token):
            return JsonResponse(
                {'error': 'Invalid CSRF token'},
                status=403
            )
        
        return None
    
    def has_valid_auth(self, request):
        """Check if request has valid authentication"""
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        return auth_header and auth_header.startswith('Bearer ')
    
    def verify_csrf_token(self, request, token):
        """Verify CSRF token"""
        # This is a simplified implementation
        # In production, use Django's built-in CSRF protection
        return True  # Placeholder

class InputValidationMiddleware(MiddlewareMixin):
    """Validate and sanitize input data"""
    
    def process_request(self, request):
        # Validate request size
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            return JsonResponse(
                {'error': 'Request too large'},
                status=413
            )
        
        # Validate content type for POST requests
        if request.method == 'POST':
            content_type = request.META.get('CONTENT_TYPE', '')
            if not content_type.startswith(('application/json', 'application/x-www-form-urlencoded', 'multipart/form-data')):
                return JsonResponse(
                    {'error': 'Invalid content type'},
                    status=415
                )
        
        return None

class SecurityAuditMiddleware(MiddlewareMixin):
    """Security audit and monitoring"""
    
    def process_response(self, request, response):
        # Log security events
        if response.status_code == 403:
            self.log_security_event('forbidden_access', request, response)
        elif response.status_code == 401:
            self.log_security_event('unauthorized_access', request, response)
        elif response.status_code == 429:
            self.log_security_event('rate_limit_exceeded', request, response)
        
        return response
    
    def log_security_event(self, event_type, request, response):
        """Log security events"""
        event_data = {
            'timestamp': time.time(),
            'event_type': event_type,
            'method': request.method,
            'path': request.path,
            'ip': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'status_code': response.status_code,
        }
        
        # Store in cache for monitoring
        cache_key = f"security_event:{int(time.time())}"
        cache.set(cache_key, event_data, 3600)  # Keep for 1 hour
        
        logger.warning(f"Security event: {event_type} - {event_data}")
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

# Utility functions for security
def generate_secure_token(data, secret_key=None):
    """Generate a secure token"""
    if secret_key is None:
        secret_key = settings.SECRET_KEY
    
    message = json.dumps(data, sort_keys=True)
    signature = hmac.new(
        secret_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"{message}.{signature}"

def verify_secure_token(token, secret_key=None):
    """Verify a secure token"""
    if secret_key is None:
        secret_key = settings.SECRET_KEY
    
    try:
        message, signature = token.rsplit('.', 1)
        expected_signature = hmac.new(
            secret_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return constant_time_compare(signature, expected_signature)
    except (ValueError, AttributeError):
        return False

def sanitize_input(data):
    """Sanitize input data"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00']
        for char in dangerous_chars:
            data = data.replace(char, '')
        return data.strip()
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    else:
        return data
