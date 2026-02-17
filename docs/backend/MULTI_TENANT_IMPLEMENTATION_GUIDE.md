# Multi-Tenant Application Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [System Architecture](#system-architecture)
4. [User Classification System](#user-classification-system)
5. [Navigation System](#navigation-system)
6. [API Documentation (Swagger)](#api-documentation-swagger)
7. [Implementation Steps](#implementation-steps)
8. [Testing & Validation](#testing--validation)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Best Practices](#best-practices)

---

## 🎯 Overview

This guide explains how to implement a **multi-tenant application** using Django and Django REST Framework. A multi-tenant application allows multiple organizations (tenants) to use the same application while keeping their data separate.

### What is Multi-Tenancy?
- **Single Application**: One codebase serves multiple organizations
- **Data Isolation**: Each organization's data is completely separate
- **Shared Resources**: All organizations share the same application features
- **Customization**: Each organization can have its own branding and settings

---

## 🧠 Core Concepts

### 1. **Tenant**
- An organization that uses your application
- Has its own domain (e.g., `clinic1.yourapp.com`)
- Contains its own users, data, and settings

### 2. **User Types**
- **Multi-Tenant Users**: Can access multiple tenants (system administrators)
- **Tenant Users**: Belong to a specific tenant (regular users)
- **Guest Users**: No specific tenant access

### 3. **Domain-Based Routing**
- **Public Domain**: `yourapp.com` (for registration, login, public pages)
- **Tenant Domains**: `tenant1.yourapp.com`, `tenant2.yourapp.com` (tenant-specific features)

---

## 🏗️ System Architecture

### Technology Stack
```
Frontend: React/TypeScript
Backend: Django + Django REST Framework
Database: PostgreSQL (with django-tenants)
Authentication: Django's built-in auth + JWT tokens
Documentation: Swagger/OpenAPI (drf-spectacular)
```

### Key Components
```
├── Django App Structure
│   ├── tenant/           # Tenant management
│   ├── user/            # User authentication
│   ├── navigation/      # Dynamic navigation
│   └── backend/         # Core settings & URLs
├── Configuration Files
│   ├── navigation_config.json  # Navigation menus
│   └── settings.py             # Django settings
└── API Endpoints
    ├── /api/v1/tenant/register/    # Tenant registration
    ├── /api/v1/user/auth/login/    # User login
    └── /api/v1/navigation/         # Navigation data
```

---

## 👥 User Classification System

### Group-Based Classification
We use Django's built-in **Groups** to classify users:

#### 1. **Multi-Tenant Group**
```python
# Users who can access multiple tenants
Group.objects.get_or_create(name='Multi-Tenant')
```
- **Purpose**: System administrators, support staff
- **Access**: Can switch between tenants
- **Navigation**: Multi-tenant specific menu

#### 2. **Tenant Group**
```python
# Users who belong to specific tenants
Group.objects.get_or_create(name='Tenant')
```
- **Purpose**: Regular users within a tenant
- **Access**: Limited to their specific tenant
- **Navigation**: Role-based menu within tenant

### User Detection Logic
```python
def detect_user_type(user, tenant=None):
    if not user.is_authenticated:
        return {'user_type': 'guest', 'group': None}
    
    # Check Multi-Tenant group
    if user.groups.filter(name='Multi-Tenant').exists():
        return {'user_type': 'multi_tenant', 'group': 'Multi-Tenant'}
    
    # Check Tenant group
    if user.groups.filter(name='Tenant').exists() and tenant:
        return {'user_type': 'tenant_user', 'group': 'Tenant'}
    
    return {'user_type': 'guest', 'group': None}
```

---

## 🧭 Navigation System

### JSON-Based Configuration
All navigation menus are stored in `navigation_config.json`:

```json
{
  "public_navigation": {
    "main": [
      {"label": "Home", "icon": "home", "url": "/"},
      {"label": "About", "icon": "info", "url": "/about"}
    ]
  },
  "multi_tenant_navigation": {
    "admin": [
      {"label": "System Dashboard", "url": "/system/dashboard"},
      {"label": "All Tenants", "url": "/system/tenants"}
    ]
  },
  "tenant_navigation": {
    "admin": [
      {"label": "Dashboard", "url": "/dashboard"},
      {"label": "Users", "url": "/users"}
    ],
    "user": [
      {"label": "Profile", "url": "/profile"}
    ]
  }
}
```

### Navigation Logic
```python
def get_navigation_by_domain_and_role(self, domain, role=None):
    # Check user groups
    multi_tenant_group = self.user.groups.filter(name='Multi-Tenant').first()
    tenant_group = self.user.groups.filter(name='Tenant').first()
    
    if multi_tenant_group:
        # Multi-tenant users get multi-tenant navigation
        return self.config.get('multi_tenant_navigation', {}).get('admin', [])
    elif tenant_group and self.tenant_user:
        # Tenant users get role-based navigation
        return self.config.get('tenant_navigation', {}).get(role, [])
    else:
        return []
```

---

## 📚 API Documentation (Swagger)

### Swagger UI Setup
```python
# settings.py
INSTALLED_APPS = [
    'drf_spectacular',
]

SPECTACULAR_SETTINGS = {
    'TITLE': 'Multi-Tenant API',
    'DESCRIPTION': 'API for multi-tenant application',
    'VERSION': '1.0.0',
}

# urls.py
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

### API Endpoint Documentation
```python
from drf_spectacular.utils import extend_schema, OpenApiResponse

@extend_schema(
    summary="Tenant Registration",
    description="Register a new tenant with admin user",
    request=TenantRegistrationSerializer,
    responses={
        201: OpenApiResponse(description="Tenant created successfully"),
        400: OpenApiResponse(description="Validation error")
    }
)
class TenantCreationView(APIView):
    def post(self, request):
        # Implementation
        pass
```

### Key API Endpoints

#### 1. **Tenant Registration**
```
POST /api/v1/tenant/register/
Content-Type: application/json

{
  "organization_name": "My Clinic",
  "organization_type": "healthcare",
  "admin_username": "admin",
  "admin_email": "admin@clinic.com",
  "admin_password": "secure123",
  "domain": "myclinic"
}
```

#### 2. **User Login**
```
POST /api/v1/user/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "secure123"
}

Response:
{
  "success": true,
  "user": {...},
  "tenant": {...},
  "navigation": {
    "role": "admin",
    "navigation": [...],
    "user_type": "multi_tenant",
    "group": "Multi-Tenant"
  }
}
```

#### 3. **Navigation Data**
```
GET /api/v1/navigation/
Authorization: Bearer <token>

Response:
{
  "role": "admin",
  "navigation": [...],
  "domain": "localhost",
  "user_type": "multi_tenant"
}
```

---

## 🚀 Implementation Steps

### Step 1: Setup Django Project
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install django djangorestframework django-tenants drf-spectacular

# Create Django project
django-admin startproject backend
cd backend
```

### Step 2: Configure Multi-Tenancy
```python
# settings.py
INSTALLED_APPS = [
    'django_tenants',
    'tenant',
    'user',
    # ... other apps
]

DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': 'your_db_name',
    }
}

DATABASE_ROUTERS = (
    'django_tenants.routers.TenantSyncRouter',
)

MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',
    # ... other middleware
]

PUBLIC_SCHEMA_URLCONF = 'backend.public_urls'
ROOT_URLCONF = 'backend.tenant_urls'
```

### Step 3: Create Tenant Model
```python
# tenant/models.py
from django_tenants.models import TenantMixin, DomainMixin

class Tenant(TenantMixin):
    name = models.CharField(max_length=100)
    organization_type = models.CharField(max_length=50)
    organization_email = models.EmailField()
    organization_phone = models.CharField(max_length=20)
    organization_address = models.TextField()
    organization_website = models.URLField(blank=True)
    
    auto_create_schema = True

class Domain(DomainMixin):
    pass
```

### Step 4: Create User Groups
```python
# management/commands/setup_groups.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

class Command(BaseCommand):
    def handle(self, *args, **options):
        Group.objects.get_or_create(name='Multi-Tenant')
        Group.objects.get_or_create(name='Tenant')
        print("Groups created successfully!")
```

### Step 5: Implement Navigation System
```python
# tenant/navigation.py
class TenantNavigation:
    def __init__(self, user=None, tenant=None):
        self.user = user
        self.tenant = tenant
        self.config = self._load_config()
    
    def get_navigation_by_domain_and_role(self, domain, role=None):
        # Navigation logic implementation
        pass
```

### Step 6: Create API Views
```python
# tenant/views.py
class TenantCreationView(APIView):
    def post(self, request):
        # Tenant creation logic
        pass

class TenantNavigationAPIView(APIView):
    def get(self, request):
        # Navigation data logic
        pass
```

### Step 7: Configure URLs
```python
# backend/public_urls.py (for public domain)
urlpatterns = [
    path('api/v1/tenant/', include('tenant.urls')),
    path('api/v1/user/', include('user.urls')),
]

# backend/tenant_urls.py (for tenant domains)
urlpatterns = [
    path('api/v1/', include('tenant.urls')),
    path('api/v1/user/', include('user.urls')),
]
```

---

## 🧪 Testing & Validation

### 1. **Test Tenant Registration**
```bash
curl -X POST "http://localhost:8000/api/v1/tenant/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "Test Clinic",
    "organization_type": "healthcare",
    "admin_username": "testadmin",
    "admin_email": "admin@testclinic.com",
    "admin_password": "Password123",
    "domain": "testclinic"
  }'
```

### 2. **Test User Login**
```bash
# Multi-Tenant User
curl -X POST "http://localhost:8000/api/v1/user/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "Password123"}'

# Tenant User
curl -X POST "http://testclinic.localhost:8000/api/v1/user/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "testadmin", "password": "Password123"}'
```

### 3. **Test Navigation**
```bash
curl -X GET "http://localhost:8000/api/v1/navigation/" \
  -H "Authorization: Bearer <token>"
```

### 4. **Validate Swagger UI**
- Visit: `http://localhost:8000/api/docs/`
- Check all endpoints are documented
- Test endpoints directly from Swagger UI

---

## 🔧 Common Issues & Solutions

### Issue 1: Import Errors
**Problem**: `ImportError: cannot import name 'get_current_tenant'`
**Solution**: Remove incorrect imports from `django_tenants.utils`

### Issue 2: Empty Navigation
**Problem**: Users get empty navigation menu
**Solution**: 
- Check user groups are assigned correctly
- Verify navigation configuration in JSON file
- Check exception handling in login view

### Issue 3: Tenant Not Found
**Problem**: `Tenant.DoesNotExist` errors
**Solution**: Ensure tenant creation process creates both Tenant and Domain objects

### Issue 4: Swagger Not Showing Endpoints
**Problem**: Endpoints not visible in Swagger UI
**Solution**:
- Use `@extend_schema` decorators
- Ensure proper serializer classes
- Check URL routing configuration

### Issue 5: Domain Routing Issues
**Problem**: Requests not routing to correct tenant
**Solution**:
- Verify DNS/hosts file configuration
- Check `PUBLIC_SCHEMA_URLCONF` and `ROOT_URLCONF` settings
- Ensure proper middleware order

---

## 📋 Best Practices

### 1. **Security**
- Always validate tenant access in views
- Use proper authentication and authorization
- Implement rate limiting for API endpoints
- Sanitize user inputs

### 2. **Performance**
- Use database indexes for tenant lookups
- Implement caching for navigation data
- Optimize database queries
- Use connection pooling

### 3. **Maintainability**
- Keep navigation configuration in JSON files
- Use clear naming conventions
- Document all API endpoints
- Implement comprehensive logging

### 4. **Scalability**
- Design for horizontal scaling
- Use microservices architecture if needed
- Implement proper database sharding
- Use CDN for static assets

### 5. **Testing**
- Write unit tests for all components
- Implement integration tests
- Use automated testing pipelines
- Test multi-tenant scenarios thoroughly

---

## 🎯 Summary

This multi-tenant implementation provides:

1. **Clear User Classification**: Group-based system for Multi-Tenant vs Tenant users
2. **Dynamic Navigation**: JSON-based configuration with role-based menus
3. **Comprehensive API**: Well-documented endpoints with Swagger UI
4. **Scalable Architecture**: Easy to extend and maintain
5. **Robust Testing**: Multiple validation methods

### Key Success Factors:
- ✅ Proper group-based user classification
- ✅ JSON-based navigation configuration
- ✅ Comprehensive API documentation
- ✅ Exception handling and error management
- ✅ Clear separation of public vs tenant domains

This implementation serves as a solid foundation for any multi-tenant application and can be easily adapted for different use cases.

---

## 📞 Support

For questions or issues:
1. Check the common issues section above
2. Review the testing examples
3. Consult the Django and django-tenants documentation
4. Test with the provided curl commands

**Happy coding! 🚀**
