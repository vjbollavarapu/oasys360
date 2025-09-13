# Multi-Tenant Application - Cursor.AI Quick Reference

## 🎯 Key Patterns for Multi-Tenant Applications

### 1. **User Classification Pattern**
```python
# Always use Django Groups for user classification
def detect_user_type(user, tenant=None):
    if not user.is_authenticated:
        return {'user_type': 'guest', 'group': None}
    
    # Multi-Tenant users can access any tenant
    if user.groups.filter(name='Multi-Tenant').exists():
        return {'user_type': 'multi_tenant', 'group': 'Multi-Tenant'}
    
    # Tenant users belong to specific tenant
    if user.groups.filter(name='Tenant').exists() and tenant:
        return {'user_type': 'tenant_user', 'group': 'Tenant'}
    
    return {'user_type': 'guest', 'group': None}
```

### 2. **Navigation Configuration Pattern**
```python
# Use JSON files for navigation configuration
class TenantNavigation:
    def __init__(self, user=None, tenant=None):
        self.user = user
        self.tenant = tenant
        self.config = self._load_config()
    
    def get_navigation_by_domain_and_role(self, domain, role=None):
        # Check user groups first
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

### 3. **URL Routing Pattern**
```python
# Separate URLs for public and tenant domains
# backend/public_urls.py (for public domain)
urlpatterns = [
    path('api/v1/tenant/', include('tenant.urls')),  # Tenant registration
    path('api/v1/user/', include('user.urls')),      # User auth
]

# backend/tenant_urls.py (for tenant domains)
urlpatterns = [
    path('api/v1/', include('tenant.urls')),         # Tenant-specific APIs
    path('api/v1/user/', include('user.urls')),      # User auth
]
```

### 4. **API Response Pattern**
```python
# Always include navigation data in login response
def auth_login(request):
    # ... authentication logic ...
    
    # Get navigation data
    nav = TenantNavigation(user, tenant)
    navigation_items = nav.get_navigation_by_domain_and_role(domain)
    user_info = detect_user_type(user, tenant)
    
    return Response({
        'success': True,
        'user': {...},
        'tenant': {...},
        'navigation': {
            'role': user_info['role'],
            'navigation': navigation_items,
            'domain': domain,
            'user_type': user_info['user_type'],
            'group': user_info['group'].name if user_info['group'] else None,
            'permissions': user_info['permissions']
        }
    })
```

### 5. **Swagger Documentation Pattern**
```python
# Always document API endpoints with @extend_schema
@extend_schema(
    summary="Endpoint Name",
    description="What this endpoint does",
    request=YourSerializer,
    responses={
        200: OpenApiResponse(description="Success"),
        400: OpenApiResponse(description="Validation error")
    }
)
class YourAPIView(APIView):
    def post(self, request):
        # Implementation
        pass
```

## 🔧 Essential Files Structure

```
project/
├── backend/
│   ├── public_urls.py      # Public domain URLs
│   ├── tenant_urls.py      # Tenant domain URLs
│   └── settings.py         # Django settings
├── tenant/
│   ├── models.py           # Tenant model
│   ├── views.py            # Tenant APIs
│   ├── navigation.py       # Navigation logic
│   └── utils.py            # Utility functions
├── user/
│   ├── auth_views.py       # Login/logout views
│   └── views.py            # User management
└── navigation_config.json  # Navigation menus
```

## 🚀 Implementation Checklist

### Phase 1: Setup
- [ ] Install `django-tenants` and `drf-spectacular`
- [ ] Configure database for multi-tenancy
- [ ] Set up `PUBLIC_SCHEMA_URLCONF` and `ROOT_URLCONF`
- [ ] Create Tenant and Domain models

### Phase 2: User System
- [ ] Create "Multi-Tenant" and "Tenant" groups
- [ ] Implement `detect_user_type()` function
- [ ] Create user authentication views
- [ ] Add group assignment logic

### Phase 3: Navigation
- [ ] Create `navigation_config.json`
- [ ] Implement `TenantNavigation` class
- [ ] Add navigation to login response
- [ ] Create navigation API endpoints

### Phase 4: API Documentation
- [ ] Add `@extend_schema` decorators
- [ ] Configure Swagger UI
- [ ] Document all endpoints
- [ ] Test API documentation

### Phase 5: Testing
- [ ] Test tenant registration
- [ ] Test user login (both types)
- [ ] Test navigation generation
- [ ] Validate Swagger UI

## 🎯 Key Success Patterns

### 1. **Always Check User Groups First**
```python
# ✅ Good
if user.groups.filter(name='Multi-Tenant').exists():
    # Multi-tenant logic

# ❌ Bad
if user.is_superuser:
    # This doesn't work for group-based classification
```

### 2. **Use JSON for Configuration**
```python
# ✅ Good
navigation_items = config.get('multi_tenant_navigation', {}).get('admin', [])

# ❌ Bad
navigation_items = hardcoded_list
```

### 3. **Handle Exceptions Properly**
```python
# ✅ Good
try:
    user_info = detect_user_type(user, tenant)
except Exception as e:
    user_info = {'user_type': 'unknown', 'group': None}

# ❌ Bad
user_info = detect_user_type(user, tenant)  # May crash
```

### 4. **Document Everything**
```python
# ✅ Good
@extend_schema(
    summary="User Login",
    description="Authenticate user and return navigation data",
    responses={200: LoginResponseSerializer}
)

# ❌ Bad
# No documentation
```

## 🔍 Common Pitfalls to Avoid

1. **Don't use `is_superuser` for classification** - Use groups instead
2. **Don't hardcode navigation** - Use JSON configuration
3. **Don't forget exception handling** - Always catch and handle errors
4. **Don't skip API documentation** - Always use `@extend_schema`
5. **Don't mix public and tenant URLs** - Keep them separate

## 📝 Quick Commands

```bash
# Create groups
python manage.py shell -c "from django.contrib.auth.models import Group; Group.objects.get_or_create(name='Multi-Tenant'); Group.objects.get_or_create(name='Tenant')"

# Test navigation
python manage.py shell -c "from tenant.navigation import TenantNavigation; from django.contrib.auth.models import User; user = User.objects.get(username='superadmin'); nav = TenantNavigation(user, None); print(nav.get_navigation_by_domain_and_role('localhost'))"

# Test user detection
python manage.py shell -c "from tenant.utils import detect_user_type; from django.contrib.auth.models import User; user = User.objects.get(username='superadmin'); print(detect_user_type(user, None))"
```

## 🎯 Remember

- **Groups are key** for user classification
- **JSON configuration** for navigation
- **Separate URLs** for public vs tenant domains
- **Always document** API endpoints
- **Handle exceptions** gracefully
- **Test thoroughly** with different user types

This pattern works for any multi-tenant application! 🚀
