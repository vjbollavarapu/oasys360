# 🔍 Swagger UI Blank Page - Root Cause Found & Fixed

**Date**: 2025-12-08

---

## 🎯 Root Cause Identified

The schema endpoint (`/api/schema/`) was returning a **500 Internal Server Error** with:
```
ImproperlyConfigured: Field name `bank_account` is not valid for model `BankStatement`.
```

This was causing Swagger UI to show a blank page because it couldn't load the schema JSON.

---

## 🐛 The Problem

**File**: `apps/backend/banking/models.py`

The `BankStatement` model was **missing the `bank_account` field**, but:

1. **Serializer** (`BankStatementSerializer`) references `bank_account` in its fields list
2. **`__str__` method** references `self.bank_account.name`
3. **Views** filter by `bank_account__tenant`

This inconsistency caused drf-spectacular to fail when generating the OpenAPI schema.

---

## ✅ Fix Applied

### 1. Added Missing Field to BankStatement Model

**File**: `apps/backend/banking/models.py` (line 141)

```python
# Added this line:
bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='bank_statements')
```

**Full model now**:
```python
class BankStatement(FinancialModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='bank_statements')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='bank_statements')  # ← ADDED
    statement_date = models.DateField()
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = models.DecimalField(max_digits=15, decimal_places=2)
    # ... rest of fields
```

### 2. Updated Middleware to Skip Schema Endpoints

**File**: `apps/backend/backend/row_tenant_middleware.py` (line 54)

Added schema/documentation endpoints to skip_paths to prevent tenant middleware from interfering:

```python
skip_paths = [
    '/admin/',
    '/static/',
    '/media/',
    '/health/',
    '/api/health/',
    '/api/v1/auth/',
    '/api/v1/marketing/',
    '/api/schema/',      # ← ADDED
    '/api/docs/',        # ← ADDED
    '/api/redoc/',       # ← ADDED
    '/swagger/',         # ← ADDED
    '/redoc/',           # ← ADDED
]
```

---

## 📝 Next Steps

### 1. Create and Run Migration

```bash
cd apps/backend
python manage.py makemigrations banking
python manage.py migrate banking
```

### 2. Restart Django Server

```bash
python manage.py runserver
```

### 3. Test Schema Endpoint

```bash
curl http://localhost:8000/api/schema/ | python -m json.tool | head -50
```

Should now return valid OpenAPI JSON instead of HTML error page.

### 4. Test Swagger UI

- `http://localhost:8000/swagger/`
- `http://localhost:8000/api/docs/`
- `http://localhost:8000/api/redoc/`

---

## 🔧 Additional Fixes Already Applied

1. ✅ `X_FRAME_OPTIONS`: Changed from `DENY` to `SAMEORIGIN`
2. ✅ `SPECTACULAR_SETTINGS`: Enhanced with UI settings and permissions
3. ✅ Explicit permissions: `AllowAny` on all Swagger views
4. ✅ CSRF: Added `localhost:8000` to trusted origins
5. ✅ STATIC_URL: Fixed leading slash

---

## 📊 Summary

**Root Cause**: Missing `bank_account` field in `BankStatement` model  
**Impact**: Schema generation failed → Swagger UI blank  
**Fix**: Added `bank_account` ForeignKey field to model  
**Status**: ✅ Fixed - Ready for migration and restart

---

**After running migration and restarting server, Swagger UI should work!**

