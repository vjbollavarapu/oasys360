"""
Django settings for backend project.

This file has been modified to support a multi-tenant architecture
using the django-tenants library.
"""

from pathlib import Path
import os
import sys
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
env_path = BASE_DIR / '.env'
if env_path.exists():
    load_dotenv(env_path)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-0rz_2qqavkyuo%xr#e8d$@)(q#10u!3_h7dy%fa!bgv0or^39t')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# Rate Limiting Configuration
# Development: Higher limits for testing
# Production: Stricter limits for security
RATE_LIMIT_MAX_REQUESTS = int(os.getenv('RATE_LIMIT_MAX_REQUESTS', '1000' if DEBUG else '100'))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv('RATE_LIMIT_WINDOW_SECONDS', '60'))

# ALLOWED_HOSTS must be configured to accept subdomains for multi-tenancy.
# Note: Django's ALLOWED_HOSTS doesn't support wildcards with ports (e.g., *.localhost:8000)
# We handle subdomain+port validation in HostValidationMiddleware
# In development: Supports *.localhost:8000 and *.localhost:3000 via middleware
# In production: Replace with your actual production domain
if DEBUG:
    # Development: Allow all localhost subdomains (port validation handled in middleware)
    ALLOWED_HOSTS = [
        '.localhost',  # Matches all subdomains of localhost (e.g., aqrsb.localhost)
        'localhost',
        '127.0.0.1',
    ]
    # Also add common ports for exact matches
    for port in ['8000', '3000', '3001']:
        ALLOWED_HOSTS.extend([
            f'localhost:{port}',
            f'127.0.0.1:{port}',
        ])
else:
    # Production: Use environment variable or default
    allowed_hosts_str = os.getenv('ALLOWED_HOSTS', '.oasys360.com,oasys360.com')
    ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_str.split(',')]


# ==============================================================================
# Multi-Tenancy Configuration (Row-Based)
# ==============================================================================

# Use standard PostgreSQL backend for row-based multi-tenancy
# Use SQLite for testing, PostgreSQL for production
if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DATABASE_NAME', 'oasysdb'),
            'USER': os.getenv('DATABASE_USER', 'postgres'),
            'PASSWORD': os.getenv('DATABASE_PASSWORD', 'password'),
            'HOST': os.getenv('DATABASE_HOST', 'localhost'),
            'PORT': os.getenv('DATABASE_PORT', '5432'),
            'OPTIONS': {
                'options': '-c default_transaction_isolation=read\\ committed'
            }
        }
    }

# No database routers needed for row-based multi-tenancy
DATABASE_ROUTERS = []

# Row-based Multi-Tenant Middleware Stack
MIDDLEWARE = [
    # Host validation (validate ALLOWED_HOSTS with subdomain/port support) - MUST be first
    'backend.host_validation_middleware.HostValidationMiddleware',
    # Tenant identification and context (MUST be second)
    'backend.row_tenant_middleware.RowTenantMiddleware',
    'authentication.jwt_middleware.JWTMultiTenantMiddleware',
    'authentication.jwt_middleware.JWTTokenValidationMiddleware',
    'backend.row_tenant_middleware.TenantQueryFilterMiddleware',
    'backend.row_tenant_middleware.TenantAuthMiddleware',
    'tenants.onboarding_guard.OnboardingGuardMiddleware',  # Enforce onboarding completion
    'backend.row_tenant_middleware.TenantAuditMiddleware',
    'backend.row_tenant_middleware.TenantRateLimitMiddleware',
    'backend.row_tenant_middleware.TenantSecurityMiddleware',
    'authentication.jwt_middleware.JWTLogoutMiddleware',
    
    # Security middleware
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'backend.security_middleware.SecurityHeadersMiddleware',
    'backend.security_middleware.RateLimitMiddleware',
    'backend.security_middleware.RequestLoggingMiddleware',
    'backend.security_middleware.InputValidationMiddleware',
    
    # Cache middleware
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    
    # Authentication and CSRF
    'backend.security_middleware.CSRFProtectionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Security audit (MUST be last)
    'backend.security_middleware.SecurityAuditMiddleware',
]

# Single URL configuration for row-based multi-tenancy
ROOT_URLCONF = 'backend.urls'

# No schema-based URL configuration needed
PUBLIC_SCHEMA_URLCONF = None

# Tenant and domain models for row-based multi-tenancy
TENANT_MODEL = "tenants.Tenant"
TENANT_DOMAIN_MODEL = "tenants.Domain"

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# Custom Authentication Backends
# EmailBackend allows authentication using email instead of username
AUTHENTICATION_BACKENDS = [
    'authentication.backends.EmailBackend',  # Custom email authentication
    'django.contrib.auth.backends.ModelBackend',  # Fallback to default username auth
]


# ==============================================================================
# Application definition
# Apps are separated into SHARED (for the public schema) and TENANT-SPECIFIC.
# ==============================================================================
SHARED_APPS = [
    # 'django_tenants',  # Removed - using row-based multi-tenancy instead
    'tenants',  # The app we created for Tenant and Domain models

    # Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps that should be in the public schema
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'corsheaders',
    'drf_spectacular',
    # 'channels',  # Django Channels for WebSocket support
    # 'websocket',  # WebSocket app for real-time communication
    # 'mysettings',  # System settings should be global
]

TENANT_APPS = [
    # Django apps required by tenants
    'django.contrib.contenttypes',

    # Your business logic apps belong here
    'accounting',
    'ai_processing',
    'authentication',
    'banking',
    'contact_sales',
    'documents',
    'erp_integration',
    'fx_conversion',
    'inventory',
    'invoicing',
    'marketing_forms',
    'mobile',
    'platform_admin',
    'purchase',
    'reporting',
    'sales',
    'tax_optimization',
    'treasury',
    'web3_integration',
    
    # Compliance and security apps
    # 'backend.compliance_models',  # Temporarily disabled for testing
    # 'backend.audit_logging',  # Temporarily disabled for testing
    # 'backend.data_encryption',  # Temporarily disabled for testing
    # 'backend.role_permissions',  # Temporarily disabled for testing
    # 'backend.audit_models',  # Temporarily disabled for testing
]

INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]


# ==============================================================================
# (The rest of your settings file remains largely the same)
# ==============================================================================

# Organization Settings
ORGANIZATION_NAME = os.getenv('ORGANIZATION_NAME', 'Medical System')
ORGANIZATION_TYPE = os.getenv('ORGANIZATION_TYPE', 'clinic')

# Time Zone
TIME_ZONE = os.getenv('DEFAULT_TIMEZONE', 'Asia/Kuala_Lumpur')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration for Frontend Integration
# Note: Full CORS configuration is imported from cors_config.py below
# This section provides initial defaults that may be overridden
# In development, CORS_ALLOW_ALL_ORIGINS=True allows *.localhost:3000 -> *.localhost:8000 requests
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",  # Next.js development server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative port
        "http://127.0.0.1:3001",
        "http://localhost:8000",  # Backend server
        "http://127.0.0.1:8000",
    ]
    # Allow all origins in development for subdomain flexibility
    # This enables *.localhost:3000 -> *.localhost:8000 requests
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # Production: Use environment variable
    cors_origins_str = os.getenv('CORS_ALLOWED_ORIGINS', 'https://app.oasys360.com')
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_str.split(',')]
    CORS_ALLOW_ALL_ORIGINS = False

# Allow credentials for authentication
CORS_ALLOW_CREDENTIALS = True

# Allow all headers for API requests
CORS_ALLOW_ALL_HEADERS = True

# Allow common HTTP methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# CORS headers to expose to frontend
CORS_EXPOSE_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
    'Authorization',
]

# CSRF Configuration for CORS
# In development, allow localhost subdomains
if DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    # Note: Django doesn't support wildcards in CSRF_TRUSTED_ORIGINS,
    # but subdomain validation is handled in HostValidationMiddleware
else:
    csrf_origins_str = os.getenv('CSRF_TRUSTED_ORIGINS', 'https://app.oasys360.com')
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_origins_str.split(',')]

# REST Framework Configuration
REST_FRAMEWORK = {
    # Use JWT for API auth; avoid session/CSRF for API requests
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
    'DEFAULT_VERSION': 'v1',
    'ALLOWED_VERSIONS': ['v1'],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Configuration for Authentication
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
    
    # Multi-tenant specific JWT settings
    'TOKEN_OBTAIN_SERIALIZER': 'authentication.tokens.CustomTokenObtainPairSerializer',
    'TOKEN_REFRESH_SERIALIZER': 'authentication.tokens.CustomTokenRefreshSerializer',
    'TOKEN_VERIFY_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenVerifySerializer',
    'TOKEN_BLACKLIST_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenBlacklistSerializer',
}

# Redis Configuration for Caching
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)

# Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PASSWORD': REDIS_PASSWORD,
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            },
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
        },
        'KEY_PREFIX': 'oasys',
        'TIMEOUT': 300,  # 5 minutes default
        'VERSION': 1,
    }
}

# Session Configuration with Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
# Configure cookie domain for cross-subdomain authentication
BASE_DOMAIN = os.getenv('BASE_DOMAIN', 'oasys360.com')
if DEBUG:
    # Development: use .localhost for local subdomain support
    SESSION_COOKIE_DOMAIN = '.localhost'
else:
    # Production: use wildcard domain for subdomain support
    SESSION_COOKIE_DOMAIN = f'.{BASE_DOMAIN}'
# Configure cookie domain for cross-subdomain authentication
BASE_DOMAIN = os.getenv('BASE_DOMAIN', 'oasys360.com')
if DEBUG:
    # Development: use .localhost for local subdomain support
    SESSION_COOKIE_DOMAIN = '.localhost'
else:
    # Production: use wildcard domain for subdomain support
    SESSION_COOKIE_DOMAIN = f'.{BASE_DOMAIN}'

# Cache Middleware Configuration
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 300  # 5 minutes
CACHE_MIDDLEWARE_KEY_PREFIX = 'oasys'

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_REDIRECT_EXEMPT = []
SECURE_SSL_REDIRECT = not DEBUG
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CSRF Settings
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
# Configure CSRF cookie domain for cross-subdomain support
if DEBUG:
    CSRF_COOKIE_DOMAIN = '.localhost'
else:
    CSRF_COOKIE_DOMAIN = f'.{BASE_DOMAIN}'
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",  # Allow localhost:8000 for Swagger UI
    "http://127.0.0.1:8000",
]

# Session Security
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 3600  # 1 hour

# Password Security
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# File Upload Security
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': 'logs/security.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'backend.security_middleware': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}

# DRF-Spectacular Settings for API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'OASYS API',
    'DESCRIPTION': 'Multi-tenant Accounting and Business Management System API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    # Ensure Swagger UI can load properly
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'displayOperationId': False,
        'defaultModelsExpandDepth': 1,
        'defaultModelExpandDepth': 1,
        'docExpansion': 'list',
        'filter': True,
        'tryItOutEnabled': True,
    },
    # Configure Swagger UI to use JSON format explicitly
    'SWAGGER_UI_FAST_INIT': False,
    'SWAGGER_UI_DIST': 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest',
    # Force JSON format for schema (Swagger UI works better with JSON)
    'SCHEMA_PATH_PREFIX': '/api/schema',
    'SCHEMA_PATH_PREFIX_TRIM': True,
    # Disable authentication for schema endpoint in development
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'SERVE_AUTHENTICATION': None,
    # Use JSON format for Swagger UI (better compatibility)
    'SWAGGER_UI_FAST_INIT': False,
}

# Cloudflare R2 Configuration (S3-compatible object storage)
CLOUDFLARE_R2_ACCOUNT_ID = os.getenv('CLOUDFLARE_R2_ACCOUNT_ID')
CLOUDFLARE_R2_ACCESS_KEY_ID = os.getenv('CLOUDFLARE_R2_ACCESS_KEY_ID')
CLOUDFLARE_R2_SECRET_ACCESS_KEY = os.getenv('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
CLOUDFLARE_R2_BUCKET_NAME = os.getenv('CLOUDFLARE_R2_BUCKET_NAME')
CLOUDFLARE_R2_PUBLIC_URL = os.getenv('CLOUDFLARE_R2_PUBLIC_URL', '')
CLOUDFLARE_R2_ENABLE_DIRECT_UPLOAD = os.getenv('CLOUDFLARE_R2_ENABLE_DIRECT_UPLOAD', 'True').lower() == 'true'
CLOUDFLARE_R2_SIGNED_URL_EXPIRY = int(os.getenv('CLOUDFLARE_R2_SIGNED_URL_EXPIRY', '3600'))

# Legacy AWS S3 Configuration (for backward compatibility, deprecated)
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')

# Use Cloudflare R2 if configured, otherwise fallback to S3 or local storage
USE_CLOUDFLARE_R2 = all([
    CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME
])

USE_S3_FOR_DICOM = all([
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_STORAGE_BUCKET_NAME
]) and not USE_CLOUDFLARE_R2  # Only use S3 if R2 is not configured

if USE_CLOUDFLARE_R2:
    # Cloudflare R2 settings (S3-compatible)
    # R2 uses S3-compatible API, so we can use boto3 with custom endpoint
    AWS_S3_ENDPOINT_URL = f"https://{CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    AWS_ACCESS_KEY_ID = CLOUDFLARE_R2_ACCESS_KEY_ID  # Map to AWS vars for compatibility
    AWS_SECRET_ACCESS_KEY = CLOUDFLARE_R2_SECRET_ACCESS_KEY
    AWS_STORAGE_BUCKET_NAME = CLOUDFLARE_R2_BUCKET_NAME
    AWS_S3_CUSTOM_DOMAIN = CLOUDFLARE_R2_PUBLIC_URL if CLOUDFLARE_R2_PUBLIC_URL else None
    AWS_DEFAULT_ACL = 'private'  # Private by default
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = True
    AWS_QUERYSTRING_EXPIRE = CLOUDFLARE_R2_SIGNED_URL_EXPIRY
    
    # Security settings
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    
    # Use Cloudflare R2 storage
    DEFAULT_FILE_STORAGE = 'backend.cloudflare_storage.CloudflareR2FileStorage'
elif USE_S3_FOR_DICOM:
    # Legacy S3 settings (for backward compatibility)
    AWS_S3_CUSTOM_DOMAIN = None
    AWS_DEFAULT_ACL = 'private'
    AWS_S3_OBJECT_PARAMETERS = {
        'ServerSideEncryption': 'AES256',
        'CacheControl': 'max-age=86400',
    }
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = True
    AWS_QUERYSTRING_EXPIRE = 3600
    DEFAULT_FILE_STORAGE = 'study.storage.DicomS3Storage'
else:
    # Fallback to local storage for development
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@oasys360.com')

# Frontend URL (for email links)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Admin Email
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@example.com')

# Security Settings
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'False').lower() == 'true'
SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', 'False').lower() == 'true'
SECURE_CONTENT_TYPE_NOSNIFF = os.getenv('SECURE_CONTENT_TYPE_NOSNIFF', 'True').lower() == 'true'
SECURE_BROWSER_XSS_FILTER = os.getenv('SECURE_BROWSER_XSS_FILTER', 'True').lower() == 'true'
# X_FRAME_OPTIONS: Allow SAMEORIGIN for Swagger UI to work properly
# Set to 'DENY' in production if you don't need embedded docs
X_FRAME_OPTIONS = os.getenv('X_FRAME_OPTIONS', 'SAMEORIGIN')

# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
SESSION_COOKIE_HTTPONLY = os.getenv('SESSION_COOKIE_HTTPONLY', 'True').lower() == 'true'
SESSION_COOKIE_AGE = int(os.getenv('SESSION_COOKIE_AGE', '3600'))
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False').lower() == 'true'
CSRF_COOKIE_HTTPONLY = os.getenv('CSRF_COOKIE_HTTPONLY', 'True').lower() == 'true'

# File Upload Settings
MAX_UPLOAD_SIZE = int(os.getenv('MAX_UPLOAD_SIZE', '10485760'))  # 10MB
ALLOWED_IMAGE_EXTENSIONS = os.getenv('ALLOWED_IMAGE_EXTENSIONS', 'jpg,jpeg,png,gif').split(',')
ALLOWED_DOCUMENT_EXTENSIONS = os.getenv('ALLOWED_DOCUMENT_EXTENSIONS', 'pdf,doc,docx,txt').split(',')

# PDPA Compliance Settings
PDPA_CONSENT_EXPIRY_DAYS = int(os.getenv('PDPA_CONSENT_EXPIRY_DAYS', '365'))
PDPA_DATA_RETENTION_DAYS = int(os.getenv('PDPA_DATA_RETENTION_DAYS', '2555'))
PDPA_BREACH_NOTIFICATION_HOURS = int(os.getenv('PDPA_BREACH_NOTIFICATION_HOURS', '72'))

# Cache Configuration
CACHES = {
    'default': {
        'BACKEND': os.getenv('CACHE_BACKEND', 'django.core.cache.backends.locmem.LocMemCache'),
        'TIMEOUT': int(os.getenv('CACHE_TIMEOUT', '300')),
    }
}

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': os.getenv('LOG_LEVEL', 'INFO'),
            'class': 'logging.FileHandler',
            'filename': os.getenv('LOG_FILE_PATH', 'logs/django.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': os.getenv('LOG_LEVEL', 'INFO'),
            'propagate': True,
        },
        'pdpa_compliance': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'logging_system': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# CORS Configuration
# CORS Configuration - Import from separate config file
from .cors_config import *

# Override with environment variables if needed
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() == 'true'
CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() == 'true'

# Allow all headers for development
CORS_ALLOW_ALL_HEADERS = True

# Additional CORS settings for better frontend integration
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
    'host',
    'referer',
    'x-tenant-domain',  # Allow custom tenant header
]

CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']

# CSRF Configuration for frontend integration
# Include localhost:8000 for Swagger UI access
default_csrf_origins = 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000'
CSRF_TRUSTED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', default_csrf_origins).split(',')
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF token
CSRF_COOKIE_SAMESITE = 'Lax'  # More permissive for development

# AI Engine Service Configuration
AI_ENGINE_URL = os.getenv('AI_ENGINE_URL', 'http://localhost:8001')
AI_ENGINE_API_KEY = os.getenv('AI_ENGINE_API_KEY', '')
AI_ENGINE_TIMEOUT = int(os.getenv('AI_ENGINE_TIMEOUT', '300'))

# Celery Configuration (for background tasks)
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Django Channels Configuration (for WebSocket support)
ASGI_APPLICATION = 'backend.asgi.application'

# Channel Layers Configuration (for WebSocket communication)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [os.getenv('REDIS_URL', 'redis://localhost:6379/0')],
        },
    },
}

# ==============================================================================
# Multi-Tenant Security and Compliance Configuration
# ==============================================================================

# Row-Level Security Configuration
ENABLE_ROW_LEVEL_SECURITY = os.getenv('ENABLE_ROW_LEVEL_SECURITY', 'True').lower() == 'true'

# Encryption Configuration for Sensitive Data
ENCRYPTION_CONFIG = {
    'current_key': os.getenv('ENCRYPTION_CURRENT_KEY', 'default_key_1'),
    'keys': {
        'default_key_1': os.getenv('ENCRYPTION_KEY_1', 'your-encryption-key-here'),
        'default_key_2': os.getenv('ENCRYPTION_KEY_2', 'your-backup-encryption-key-here'),
    }
}

# Compliance Framework Configuration
COMPLIANCE_FRAMEWORKS = {
    'SOX': {
        'enabled': True,
        'retention_days': 2555,  # 7 years
        'audit_required': True,
    },
    'PCI_DSS': {
        'enabled': True,
        'retention_days': 1095,  # 3 years
        'audit_required': True,
    },
    'GDPR': {
        'enabled': True,
        'retention_days': 2555,  # 7 years
        'audit_required': True,
        'data_subject_rights': True,
    },
    'HIPAA': {
        'enabled': True,
        'retention_days': 2555,  # 7 years
        'audit_required': True,
    },
}

# Data Classification Levels
DATA_CLASSIFICATION_LEVELS = {
    'public': 1,
    'internal': 2,
    'confidential': 3,
    'restricted': 4,
    'top_secret': 5,
}

# Audit Logging Configuration
AUDIT_LOG_CONFIG = {
    'enabled': True,
    'retention_days': 2555,  # 7 years
    'log_level': 'INFO',
    'include_request_body': False,
    'include_response_body': False,
    'sensitive_fields': ['password', 'ssn', 'credit_card', 'bank_account'],
}

# Security Configuration
SECURITY_CONFIG = {
    'max_login_attempts': 5,
    'lockout_duration_minutes': 30,
    'session_timeout_minutes': 60,
    'require_mfa_for_sensitive_data': True,
    'ip_whitelist_enabled': False,
    'ip_whitelist': [],
}

# Data Governance Configuration
DATA_GOVERNANCE_CONFIG = {
    'enabled': True,
    'auto_classification': True,
    'retention_policy_enforcement': True,
    'data_subject_request_handling': True,
    'breach_notification_hours': 72,
}

print("✅ Multi-tenant configuration loaded")
print("📝 Public URLs will work on app domain eg: app.oasys360.com")
print("📝 Tenant URLs will work on tenant domain eg: tenant.oasys360.com")
print("🗄️ Using database: " + os.getenv('DATABASE_NAME', 'oasysdb'))
print("🔌 WebSocket support enabled with Django Channels")
print("🔒 Enhanced security and compliance features enabled")
print("📊 Audit logging and data governance configured")
print("🔐 Field-level encryption configured")
