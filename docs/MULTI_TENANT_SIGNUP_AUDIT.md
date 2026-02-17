# Multi-Tenant Signup Flow Audit Report

## Executive Summary

Your multi-tenant SaaS signup flow has **5 critical issues** preventing the required flow:
**Signup → Data Build → Redirect to {subdomain}.{domain} → Setup Profile**

## Issues Found

### ❌ Issue 1: Tenant Resolution Middleware - Localhost Support Missing
**Location:** `apps/backend/backend/row_tenant_middleware.py:134-144`

**Problem:**
- Middleware only checks for subdomain pattern with `.` (production domains)
- Does not handle `tenant.localhost:3000` format for local development
- Missing support for localhost subdomain resolution

**Impact:** Users cannot access their subdomain during local development

---

### ❌ Issue 2: Signup Response Missing Redirect URL
**Location:** `apps/backend/authentication/views.py:147-157`

**Problem:**
- Signup endpoint returns 201 with user data and tokens
- **Missing:** `redirect_url` or `subdomain_url` field in response
- Frontend has no way to know where to redirect after signup

**Impact:** Frontend cannot redirect to tenant subdomain after signup

---

### ❌ Issue 3: Industry-Based Seeding Not Triggered During Signup
**Location:** `apps/backend/authentication/serializers.py:128-137`

**Problem:**
- Signup only calls `load_all_presets(tenant, country_code, user)` 
- This function **only uses country_code**, not industry_code
- Industry-specific JSON files are never loaded during signup
- Industry code is only set during onboarding Step 3, but seeding happens at signup

**Impact:** Industry-specific data (Chart of Accounts, Tax Rates) is not seeded during signup

---

### ❌ Issue 4: Session Cookie Domain Not Configured for Wildcard
**Location:** `apps/backend/backend/settings.py:375-416`

**Problem:**
- `SESSION_COOKIE_DOMAIN` is **not set** in settings
- Without wildcard domain (`.oasys360.com`), cookies won't persist across subdomains
- User will be logged out when redirected from main domain to subdomain

**Impact:** Session/tokens lost when redirecting to subdomain

---

### ❌ Issue 5: Frontend Not Redirecting to Subdomain
**Location:** `apps/frontend/app/auth/signup/page.tsx:126-132`

**Problem:**
- After successful signup, frontend redirects to `/auth/login`
- Does not check for `redirect_url` or `subdomain_url` in response
- Does not construct subdomain URL from tenant slug

**Impact:** User never reaches their tenant subdomain

---

## Required Flow (Not Working)

```
1. User signs up at oasys360.com/signup
   ❌ Missing: Industry code not passed to seeding
   
2. Backend creates tenant + user
   ❌ Missing: Redirect URL not returned
   
3. Backend seeds industry-specific data
   ❌ Missing: Industry code not used in seeding
   
4. Frontend receives response
   ❌ Missing: No redirect URL to use
   
5. Frontend redirects to {subdomain}.oasys360.com
   ❌ Missing: Redirect logic not implemented
   
6. User lands on subdomain
   ❌ Missing: Cookies not configured for cross-subdomain
   
7. User completes onboarding
   ✅ This part works
```

---

## Fixes Required

### Fix 1: Update Tenant Resolution Middleware
- Add localhost subdomain support
- Handle `tenant.localhost:port` format

### Fix 2: Add Redirect URL to Signup Response
- Include `redirect_url` field with subdomain URL
- Include `tenant_slug` for frontend to construct URL

### Fix 3: Pass Industry Code to Seeding
- Accept `industry_code` in signup serializer
- Store in tenant during creation
- Pass to `load_all_presets` or use PresetEngine with industry_code

### Fix 4: Configure Session Cookie Domain
- Set `SESSION_COOKIE_DOMAIN = '.oasys360.com'` (production)
- Set `SESSION_COOKIE_DOMAIN = '.localhost'` (development)
- Configure JWT token domain similarly

### Fix 5: Update Frontend Redirect Logic
- Check for `redirect_url` in signup response
- If missing, construct from `tenant_slug`
- Redirect to subdomain instead of login page
- Store tokens before redirect

---

## Additional Recommendations

1. **Domain Model Integration**: Create Domain record during signup with subdomain
2. **Environment-Based URLs**: Use env vars for base domain (localhost vs production)
3. **Error Handling**: Handle subdomain conflicts gracefully
4. **Testing**: Add integration tests for subdomain redirect flow

