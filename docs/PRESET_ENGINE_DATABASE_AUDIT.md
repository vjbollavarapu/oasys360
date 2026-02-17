# PresetEngine and Database Schema Audit Report

## Executive Summary

Your PresetEngine and database schema have **4 critical gaps** that need to be addressed for proper multi-tenant preset provisioning.

---

## 1. Table Existence Audit

### ✅ Tables That Exist

| Table Name | Model Class | Database Table | Status |
|------------|-------------|----------------|--------|
| ChartOfAccounts | `ChartOfAccounts` | `chart_of_accounts` | ✅ EXISTS |
| TaxCategories | `TaxCategory` | `tax_categories` | ✅ EXISTS |
| TaxRates | `TaxRate` | `tax_rates` | ✅ EXISTS |
| CurrencyConfig | `CurrencyConfig` | `currency_configs` | ✅ EXISTS |
| TenantOnboardingProgress | `TenantOnboardingProgress` | `tenant_onboarding_progress` | ✅ EXISTS |

### ❌ Tables That Are MISSING

| Table Name | Expected Purpose | Current State | Impact |
|------------|------------------|---------------|--------|
| **GLAccountTypes** | Separate table for account type definitions | **DOES NOT EXIST** | ChartOfAccounts uses CharField for type instead of FK |
| **TaxCodes** | Separate table for tax code definitions | **DOES NOT EXIST** | TaxRate has `code` field but no separate TaxCode table |

### ⚠️ Naming Clarification

- **ChartOfAccounts = GLAccounts**: These are the same thing. `ChartOfAccounts` model represents GL (General Ledger) accounts.
- **CurrencySettings = CurrencyConfig**: The table is named `currency_configs`, model is `CurrencyConfig`.

---

## 2. Dependency Mapping Audit

### ✅ Tenant Isolation (All Tables)

**All tables correctly have tenant ForeignKey:**

```python
# ChartOfAccounts
tenant = models.ForeignKey('tenants.Tenant', ...)  ✅

# TaxRate
tenant = models.ForeignKey('tenants.Tenant', ...)  ✅

# TaxCategory
tenant = models.ForeignKey('tenants.Tenant', ...)  ✅

# CurrencyConfig
tenant = models.OneToOneField('tenants.Tenant', ...)  ✅
```

**All tables have `unique_together` constraints with tenant:**
- `ChartOfAccounts`: `unique_together = ['tenant', 'code']` ✅
- `TaxRate`: `unique_together = ['tenant', 'code', 'region', 'effective_from']` ✅
- `TaxCategory`: `unique_together = ['tenant', 'code']` ✅

### ❌ Missing Foreign Key Relationships

**Issue: GLAccountTypes Table Missing**

- `ChartOfAccounts.type` is a **CharField** with choices, not a ForeignKey
- **Current Implementation:**
  ```python
  type = models.CharField(max_length=50, choices=[
      ('asset', 'Asset'),
      ('liability', 'Liability'),
      ('equity', 'Equity'),
      ('revenue', 'Revenue'),
      ('expense', 'Expense'),
  ])
  ```
- **Expected:** Should have a ForeignKey to `GLAccountType` table for extensibility

**Issue: TaxCodes Table Missing**

- `TaxRate.code` is a **CharField**, not a ForeignKey to `TaxCode` table
- **Current Implementation:**
  ```python
  code = models.CharField(max_length=50, help_text='Tax code (e.g., GST, VAT, SALES_TAX)')
  ```
- **Expected:** Should have a ForeignKey to `TaxCode` table for standardization

---

## 3. JSON Structure Audit

### ✅ Tax Rates JSON Files

**Malaysia (MY.json):**
```json
{
  "country_code": "MY",
  "tax_rates": [
    {
      "code": "SST_SALES",  ✅ Correct SST code
      "tax_type": "sales",   ✅ Correct type
      "rate": 10.00
    },
    {
      "code": "SST_SERVICE", ✅ Correct SST code
      "tax_type": "service", ✅ Correct type
      "rate": 6.00
    }
  ]
}
```
✅ **Contains SST (Sales and Service Tax) for Malaysia**

**Singapore (SG.json):**
```json
{
  "country_code": "SG",
  "tax_rates": [
    {
      "code": "GST_STANDARD", ✅ Correct GST code
      "tax_type": "gst",       ✅ Correct type
      "rate": 9.00
    }
  ]
}
```
✅ **Contains GST (Goods and Services Tax) for Singapore**

### ⚠️ JSON Structure Issues

1. **Missing Industry-Specific Presets:**
   - JSON files are only country-specific (`MY.json`, `SG.json`)
   - No industry-specific files (e.g., `chart_of_accounts/manufacturing.json`)
   - PresetEngine tries to load industry files but they don't exist

2. **Tax Code Standardization:**
   - Tax codes are hardcoded in JSON (e.g., "SST_SALES", "GST_STANDARD")
   - No centralized `TaxCode` table for validation
   - Risk of typos or inconsistencies

---

## 4. Progress Tracking Audit

### ✅ TenantOnboardingProgress Table Exists

**Current Structure:**
```python
class TenantOnboardingProgress(models.Model):
    tenant = models.OneToOneField(Tenant, ...)
    current_step = models.IntegerField(default=1)  # 1-5
    completed_steps = models.JSONField(default=list)  # [1, 2, 3, 4]
    step_data = models.JSONField(default=dict)  # Step-specific data
```

### ❌ Missing: Preset Module Completion Tracking

**Current State:**
- Only tracks **onboarding steps** (1-5), not individual preset modules
- Step 4 data includes `presets_provisioned` dict, but no granular tracking

**What's Missing:**
- No field to track completion percentage for each preset module
- No field to track which preset modules succeeded/failed
- No field to track record counts per module in progress table

**Expected Structure:**
```python
preset_progress = models.JSONField(default=dict, help_text='Preset module completion status')
# Example:
# {
#   'chart_of_accounts': {'status': 'completed', 'records_created': 45, 'percentage': 100},
#   'tax_rates': {'status': 'completed', 'records_created': 3, 'percentage': 100},
#   'tax_categories': {'status': 'in_progress', 'records_created': 1, 'percentage': 50},
# }
```

---

## 5. PresetEngine Implementation Audit

### ✅ What Works

1. **Industry Code Support:** PresetEngine accepts `industry_code` parameter
2. **Country Code Support:** PresetEngine uses country-specific JSON files
3. **Progress Callback:** Supports progress callback for real-time updates
4. **Record Counting:** Returns detailed results with record counts
5. **Idempotent:** Checks for existing records before creating

### ⚠️ Issues Found

1. **Industry JSON Files Missing:**
   - PresetEngine tries to load `chart_of_accounts/{industry_code}.json`
   - These files don't exist in `apps/backend/presets/chart_of_accounts/`
   - Falls back to country-specific files, which is acceptable but not ideal

2. **Tax Code Validation Missing:**
   - No validation that tax codes from JSON match a `TaxCode` table
   - Tax codes are created directly from JSON without standardization

3. **Progress Tracking Not Persisted:**
   - Progress callback is used but results aren't stored in `TenantOnboardingProgress`
   - Only final results are stored in `step_data[4]`

---

## Recommendations

### Priority 1: Add Missing Tables

1. **Create GLAccountType Model:**
   ```python
   class GLAccountType(models.Model):
       tenant = models.ForeignKey('tenants.Tenant', ...)
       code = models.CharField(max_length=50)  # 'asset', 'liability', etc.
       name = models.CharField(max_length=255)
       normal_balance = models.CharField(...)  # 'debit' or 'credit'
       description = models.TextField()
   ```
   - Update `ChartOfAccounts` to use `ForeignKey('accounting.GLAccountType')` instead of CharField

2. **Create TaxCode Model:**
   ```python
   class TaxCode(models.Model):
       tenant = models.ForeignKey('tenants.Tenant', ...)
       code = models.CharField(max_length=50)  # 'GST_STANDARD', 'SST_SALES', etc.
       name = models.CharField(max_length=255)
       tax_type = models.CharField(...)  # 'gst', 'vat', 'sales', etc.
       description = models.TextField()
   ```
   - Update `TaxRate` to use `ForeignKey('invoicing.TaxCode')` instead of CharField

### Priority 2: Enhance Progress Tracking

1. **Add Preset Progress Field to TenantOnboardingProgress:**
   ```python
   preset_progress = models.JSONField(default=dict)
   ```

2. **Update PresetEngine to Store Progress:**
   - Store progress in `TenantOnboardingProgress.preset_progress` during provisioning
   - Include status, record counts, and percentage for each module

### Priority 3: Create Industry-Specific Presets

1. Create industry-specific JSON files:
   - `chart_of_accounts/manufacturing.json`
   - `chart_of_accounts/retail.json`
   - `chart_of_accounts/services.json`
   - etc.

### Priority 4: Standardize Tax Codes

1. Create `TaxCode` records during preset provisioning
2. Validate JSON tax codes against `TaxCode` table
3. Use ForeignKey relationship instead of CharField

---

## Summary

| Category | Status | Action Required |
|----------|--------|-----------------|
| ChartOfAccounts table | ✅ EXISTS | None |
| GLAccountTypes table | ❌ MISSING | **CREATE** |
| TaxCategories table | ✅ EXISTS | None |
| TaxCodes table | ❌ MISSING | **CREATE** |
| CurrencyConfig table | ✅ EXISTS | None |
| Tenant isolation | ✅ CORRECT | None |
| Foreign key relationships | ⚠️ INCOMPLETE | **ADD FK to GLAccountType and TaxCode** |
| JSON structure (SST/GST) | ✅ CORRECT | None |
| Industry-specific JSON | ❌ MISSING | **CREATE** |
| Progress tracking (steps) | ✅ EXISTS | None |
| Progress tracking (presets) | ❌ MISSING | **ENHANCE** |

