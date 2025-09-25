"""
Simple CORS configuration for development
This allows all origins for development purposes
"""

# CORS Configuration for Development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOW_ALL_METHODS = True

# Specific origins for reference (not used when CORS_ALLOW_ALL_ORIGINS = True)
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://tenant.localhost:3000',
]

# Allowed headers
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-tenant-domain',
    'host',
    'referer',
]

# Exposed headers
CORS_EXPOSE_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
]

# CSRF trusted origins (should match CORS origins)
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://tenant.localhost:3000',
    'http://gdvisionx.localhost:3000',
    'http://clinic1.localhost:3000',
    'http://clinic2.localhost:3000',
    'http://test.localhost:3000',
    'http://demo.localhost:3000',
]
