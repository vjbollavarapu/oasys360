# 🔄 API URL Migration Guide

**Date**: 2025-12-08  
**Status**: ✅ Complete

---

## 📊 Overview

All API URLs have been migrated from `https://site.bollavarapu.com` to the new domain structure:
- **Backend API**: `https://api.oasys360.com`
- **AI Engine**: `https://ai.oasys360.com`

---

## ✅ Frontend Updates (Landing Page)

### Files Updated

1. **`lib/api-config.ts`**
   - `BASE_URL`: `https://api.oasys360.com`
   - `API_URL`: `https://api.oasys360.com/api`

2. **`env.example`**
   - Updated default API URLs
   - Added AI Engine URL placeholder

3. **`app/docs/page.tsx`**
   - Updated Swagger UI link: `https://api.oasys360.com/api/docs/`
   - Updated ReDoc link: `https://api.oasys360.com/api/redoc/`
   - Updated Schema link: `https://api.oasys360.com/api/schema/`
   - Updated base URL display

4. **`scripts/test-production-api.ts`**
   - Updated test script URLs

5. **`scripts/test-api.sh`**
   - Updated shell script URLs

6. **Documentation Files**
   - `PRODUCTION_API_INTEGRATION.md`
   - `PRODUCTION_SETUP_COMPLETE.md`
   - `PRODUCTION_TESTING_GUIDE.md`

---

## 🔧 Backend Configuration Required

### Django Backend (`apps/backend`)

**Environment Variables to Update** (`.env` file):

```env
# Update AI Engine URL
AI_ENGINE_URL=https://ai.oasys360.com
AI_ENGINE_API_KEY=your-ai-engine-api-key-here

# Update CORS settings if needed
CORS_ALLOWED_ORIGINS=https://oasys360.com,https://www.oasys360.com
ALLOWED_HOSTS=api.oasys360.com,oasys360.com,www.oasys360.com
```

**Settings File** (`apps/backend/backend/settings.py`):
- Line 645: `AI_ENGINE_URL` will use environment variable
- Update CORS settings if needed

### AI Engine Service (`apps/ai_engine`)

**Environment Variables to Update** (`.env` file):

```env
# Update Django Backend URL
DJANGO_BACKEND_URL=https://api.oasys360.com

# Update allowed origins
ALLOWED_ORIGINS=https://api.oasys360.com,https://oasys360.com
```

---

## 🔍 Swagger UI Blank Page Issue

### Problem
Swagger UI at `localhost:8000/swagger/` shows a blank page.

### Potential Causes

1. **Schema Generation Issue**
   - `drf-spectacular` might not be generating the schema correctly
   - Check if `/api/schema/` endpoint returns valid JSON

2. **URL Configuration Issue**
   - In `backend/urls.py`, line 72: `path('swagger/', ...)`
   - This references `url_name='schema'` which should be defined at line 69
   - Verify the URL name matches

3. **Missing Static Files**
   - Swagger UI requires static files to be served
   - Check if `STATIC_URL` and `STATIC_ROOT` are configured

4. **CORS/Content Security Policy**
   - Swagger UI might be blocked by CSP headers
   - Check browser console for errors

### Troubleshooting Steps

1. **Check Schema Endpoint**
   ```bash
   curl http://localhost:8000/api/schema/
   ```
   Should return valid OpenAPI JSON. If it fails, that's the issue.

2. **Check Swagger UI Directly**
   ```bash
   curl http://localhost:8000/swagger/
   ```
   Should return HTML. If blank, check Django logs.

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

4. **Verify drf-spectacular Installation**
   ```bash
   cd apps/backend
   pip list | grep drf-spectacular
   ```

5. **Check Django Settings**
   ```python
   # Should include in INSTALLED_APPS
   'drf_spectacular',
   
   # Should have REST_FRAMEWORK configuration
   REST_FRAMEWORK = {
       'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
   }
   ```

### Quick Fix Suggestions

1. **Try Alternative Swagger URL**
   - Use `/api/docs/` instead of `/swagger/`
   - This is configured in `backend/urls.py` at line 72
   - Alternative: `http://localhost:8000/api/docs/`

2. **Regenerate Schema**
   ```bash
   cd apps/backend
   python manage.py spectacular --file schema.yml
   ```
   This generates the schema file and might reveal issues.

3. **Check drf-spectacular Version**
   ```bash
   pip install --upgrade drf-spectacular
   ```

4. **Check Django REST Framework Version**
   ```bash
   pip install --upgrade djangorestframework
   ```

---

## 📝 Vercel Environment Variables

Update Vercel environment variables for production:

```bash
vercel env add NEXT_PUBLIC_API_BASE_URL production
# Enter: https://api.oasys360.com

vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.oasys360.com/api
```

Or update via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_BASE_URL` to `https://api.oasys360.com`
3. Update `NEXT_PUBLIC_API_URL` to `https://api.oasys360.com/api`
4. Redeploy

---

## 🔄 Migration Checklist

### Frontend (Landing Page) ✅
- [x] `api-config.ts` updated
- [x] `env.example` updated
- [x] `docs/page.tsx` updated
- [x] Test scripts updated
- [x] Documentation files updated

### Backend (Django) ⚠️ Manual Action Required
- [ ] Update `.env` file with `AI_ENGINE_URL=https://ai.oasys360.com`
- [ ] Update CORS settings if needed
- [ ] Update ALLOWED_HOSTS
- [ ] Restart Django server

### AI Engine ⚠️ Manual Action Required
- [ ] Update `.env` file with `DJANGO_BACKEND_URL=https://api.oasys360.com`
- [ ] Update ALLOWED_ORIGINS
- [ ] Restart AI Engine service

### Vercel ⚠️ Manual Action Required
- [ ] Update environment variables in Vercel dashboard
- [ ] Redeploy landing page

### Swagger UI 🔍 Investigation Needed
- [ ] Check `/api/schema/` endpoint
- [ ] Check browser console for errors
- [ ] Verify drf-spectacular installation
- [ ] Try `/api/docs/` as alternative

---

## 🧪 Testing After Migration

1. **Test API Health**
   ```bash
   curl https://api.oasys360.com/health/
   ```

2. **Test Waitlist Endpoint**
   ```bash
   curl -X POST https://api.oasys360.com/api/waitlist/join/ \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

3. **Test Swagger Schema**
   ```bash
   curl https://api.oasys360.com/api/schema/
   ```

4. **Test Landing Page**
   - Navigate to landing page
   - Submit waitlist form
   - Check Network tab for API calls to `api.oasys360.com`

---

## 📊 Summary

**Frontend**: ✅ All URLs updated to `api.oasys360.com`  
**Backend**: ⚠️ Requires manual `.env` update for AI Engine URL  
**AI Engine**: ⚠️ Requires manual `.env` update for Django Backend URL  
**Swagger**: 🔍 Needs investigation (try `/api/docs/` as alternative)

---

**Last Updated**: 2025-12-08

