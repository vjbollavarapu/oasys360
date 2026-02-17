# 🔧 Swagger UI Additional Fixes

**Issue**: Swagger UI at `http://localhost:8000/api/docs/` still shows blank page after initial fixes

**Additional Root Causes Identified**:
1. Authentication required by default REST_FRAMEWORK permissions
2. CSRF protection blocking requests
3. STATIC_URL missing leading slash
4. Tenant middleware potentially interfering

---

## ✅ Additional Fixes Applied

### 1. Explicit Permission Override
**Location**: `apps/backend/backend/urls.py`

**Change**: Added explicit `permission_classes=[AllowAny]` and `authentication_classes=[]` to all Swagger/Schema views

**Why**: The default REST_FRAMEWORK setting requires `IsAuthenticated`, which blocks unauthenticated access to Swagger UI.

```python
# Before
path('api/schema/', SpectacularAPIView.as_view(
    patterns=[path('api/v1/', include(api_patterns))]
), name='schema'),

# After
path('api/schema/', SpectacularAPIView.as_view(
    patterns=[path('api/v1/', include(api_patterns))],
    permission_classes=[AllowAny],
    authentication_classes=[],
), name='schema'),
```

### 2. CSRF Trusted Origins
**Location**: `apps/backend/backend/settings.py` (lines 266-271 and 652)

**Change**: Added `localhost:8000` to `CSRF_TRUSTED_ORIGINS`

**Why**: CSRF protection was blocking requests from localhost:8000

```python
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",  # Added for Swagger UI
    "http://127.0.0.1:8000",  # Added for Swagger UI
]
```

### 3. STATIC_URL Fix
**Location**: `apps/backend/backend/settings.py` (line 223)

**Change**: `STATIC_URL = 'static/'` → `STATIC_URL = '/static/'`

**Why**: Missing leading slash can cause static files to not load correctly

---

## 🧪 Testing After Fixes

1. **Restart Django Server**:
   ```bash
   cd apps/backend
   python manage.py runserver
   ```

2. **Clear Browser Cache**:
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
   - Or open in incognito/private window

3. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any JavaScript errors
   - Go to Network tab
   - Refresh page and check for failed requests (red)

4. **Test Schema Endpoint Directly**:
   ```bash
   curl http://localhost:8000/api/schema/ | python -m json.tool | head -50
   ```
   Should return valid OpenAPI JSON without authentication.

5. **Test Swagger UI**:
   - `http://localhost:8000/swagger/`
   - `http://localhost:8000/api/docs/`

6. **Check Static Files**:
   - In browser DevTools → Network tab
   - Look for requests to `/static/` paths
   - Verify they return 200 status codes

---

## 🔍 Debugging Checklist

If still not working:

- [ ] Django server restarted after changes
- [ ] Browser cache cleared or incognito mode
- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for failed requests
- [ ] Verify `/api/schema/` returns JSON (not HTML)
- [ ] Check Django logs for errors
- [ ] Verify `drf_spectacular` is installed: `pip list | grep drf-spectacular`
- [ ] Check if static files are being collected: `python manage.py collectstatic`

---

## 📝 Common Errors to Look For

### Error 1: 403 Forbidden
**Cause**: CSRF or permission issue
**Fix**: Already applied (AllowAny permissions, CSRF_TRUSTED_ORIGINS)

### Error 2: 404 Not Found
**Cause**: URL not matching or middleware redirecting
**Fix**: Verify URL patterns in `urls.py`

### Error 3: Blank Page with No Errors
**Cause**: JavaScript failing to load or schema endpoint returning empty
**Fix**: 
- Check Network tab for failed `/api/schema/` request
- Verify static files are loading
- Check browser console for JavaScript errors

### Error 4: "Schema not found"
**Cause**: Schema endpoint not accessible or returning error
**Fix**: 
- Test `/api/schema/` directly with curl
- Check Django logs for schema generation errors

---

## 🚨 If Still Blank

1. **Check Django Logs**:
   ```bash
   tail -f logs/django.log
   ```
   Then refresh `/api/docs/` and watch for errors

2. **Test Schema Generation**:
   ```bash
   cd apps/backend
   python manage.py spectacular --file schema.yml
   ```
   If this fails, there's an issue with schema generation

3. **Try ReDoc Instead**:
   - `http://localhost:8000/api/redoc/`
   - If ReDoc works but Swagger doesn't, it's a Swagger UI specific issue

4. **Check drf-spectacular Version**:
   ```bash
   pip show drf-spectacular
   ```
   Ensure you have a recent version (0.27.0 as per requirements.txt)

5. **Temporary Workaround**:
   - Use ReDoc at `/api/redoc/` which is often more reliable
   - Or use the schema JSON directly in an external Swagger UI tool

---

**Status**: ✅ Additional fixes applied - Restart server and test

