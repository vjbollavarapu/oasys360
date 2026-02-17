# 🔍 Swagger UI Blank Page Troubleshooting Guide

**Issue**: Swagger UI at `http://localhost:8000/swagger/` shows a blank page.

---

## 🎯 Quick Checks

### 1. Try Alternative URL
Instead of `/swagger/`, try:
- `http://localhost:8000/api/docs/` (Swagger UI via drf-spectacular)
- `http://localhost:8000/api/redoc/` (ReDoc alternative)

### 2. Check Schema Endpoint
```bash
curl http://localhost:8000/api/schema/
```
If this returns valid JSON, the schema is working. If not, that's the root cause.

---

## 🔧 Common Fixes

### Fix 1: Verify drf-spectacular Configuration

Check `apps/backend/backend/settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'drf_spectacular',  # Must be included
]

REST_FRAMEWORK = {
    # ... other settings
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Add SPECTACULAR_SETTINGS if missing
SPECTACULAR_SETTINGS = {
    'TITLE': 'OASYS API',
    'DESCRIPTION': 'OASYS Backend API Documentation',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}
```

### Fix 2: Check URL Configuration

In `apps/backend/backend/urls.py`:

```python
# Make sure schema is defined BEFORE swagger
path('api/schema/', SpectacularAPIView.as_view(
    patterns=[path('api/v1/', include(api_patterns))]
), name='schema'),

# Then swagger references the schema
path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
```

The `url_name='schema'` must match the `name='schema'` above.

### Fix 3: Verify Installation

```bash
cd apps/backend
pip install drf-spectacular
pip install --upgrade drf-spectacular
```

### Fix 4: Check Static Files

```python
# In settings.py, ensure static files are configured
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# In urls.py, ensure static files are served in DEBUG mode
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

### Fix 5: Check CORS/CSRF Settings

Swagger UI might be blocked. Temporarily disable CSRF for schema endpoints:

```python
# In urls.py, use csrf_exempt for schema views if needed
from django.views.decorators.csrf import csrf_exempt

# Or ensure CSRF_TRUSTED_ORIGINS includes localhost
CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000']
```

---

## 🐛 Debug Steps

### Step 1: Check Django Logs
```bash
cd apps/backend
python manage.py runserver
# Watch for errors when accessing /swagger/
```

### Step 2: Check Browser Console
1. Open `http://localhost:8000/swagger/`
2. Open Developer Tools (F12)
3. Check Console tab for JavaScript errors
4. Check Network tab for failed requests

### Step 3: Test Schema Endpoint
```bash
# Should return valid OpenAPI JSON
curl http://localhost:8000/api/schema/ | jq .

# If it returns HTML or error, schema generation is failing
```

### Step 4: Verify API Patterns
```python
# Check that api_patterns in urls.py is not empty
api_patterns = [
    # Should have at least one path
    path('marketing/', include('marketing_forms.urls')),
    # ... other paths
]
```

### Step 5: Check for Import Errors
```bash
cd apps/backend
python manage.py shell
>>> from drf_spectacular.views import SpectacularSwaggerView
# Should not raise ImportError
```

---

## 🔄 Alternative Solutions

### Solution 1: Use /api/docs/ Instead
The `drf-spectacular` package typically serves Swagger at `/api/docs/`:

```python
# This is already configured in backend/urls.py
path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
```

Try: `http://localhost:8000/api/docs/`

### Solution 2: Manual Schema Generation
```bash
cd apps/backend
python manage.py spectacular --file schema.yml
# Then check if schema.yml is generated correctly
```

### Solution 3: Use ReDoc Instead
ReDoc is often more reliable:
```
http://localhost:8000/api/redoc/
```

---

## 📝 Recommended URL Structure

Based on your setup, these URLs should work:

1. **Swagger UI (Primary)**: `http://localhost:8000/api/docs/`
2. **ReDoc**: `http://localhost:8000/api/redoc/`
3. **OpenAPI Schema**: `http://localhost:8000/api/schema/`
4. **Legacy Swagger**: `http://localhost:8000/swagger/` (might be blank)

---

## ✅ Expected Behavior

When working correctly:
- `/api/schema/` returns OpenAPI 3.0 JSON
- `/api/docs/` shows interactive Swagger UI
- `/api/redoc/` shows ReDoc documentation
- All three reference the same schema

---

## 🚨 If Still Not Working

1. **Clear Django Cache**
   ```bash
   python manage.py clear_cache
   ```

2. **Restart Django Server**
   ```bash
   # Stop server (Ctrl+C)
   python manage.py runserver
   ```

3. **Check Requirements**
   ```bash
   pip install -r requirements.txt
   ```

4. **Check for Conflicting Packages**
   ```bash
   pip list | grep -i swagger
   pip list | grep -i spectacular
   ```

5. **Try Fresh Django Project Test**
   Create a minimal test to verify drf-spectacular works

---

**Note**: The `/swagger/` endpoint might be using a different Swagger implementation. The `/api/docs/` endpoint is the standard drf-spectacular Swagger UI endpoint.

