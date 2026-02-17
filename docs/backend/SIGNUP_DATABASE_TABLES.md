# Database Tables Affected During User Signup

This document lists all database tables that are **created, updated, or populated** when a user signs up through the corporate registration flow.

---

## Signup Flow Overview

When a user signs up via `/api/v1/auth/register/`, the following sequence occurs:

1. **User & Tenant Creation** (Always)
2. **Company Creation** (If company_name provided)
3. **Preset Provisioning** (If country_code provided)
4. **Onboarding Progress Tracking** (Automatic)

---

## Tables Affected (In Order)

### 1. **Core User & Tenant Tables** (Always Created)

#### `users` (authentication app)
- **Action:** `INSERT`
- **When:** User record is created via `User.objects.create_user()`
- **Fields Set:**
  - `username`, `email`, `password` (hashed)
  - `first_name`, `last_name`
  - `role` = `'tenant_admin'` (if tenant created)
  - `account_type` = `'corporate'`
  - `account_tier` = `'business'`
  - `email_verified` = `False`
  - `email_verification_token` = Generated random string
  - `email_verification_expires` = Now + 7 days
  - `tenant_id` = Foreign key to tenant

#### `tenants` (tenants app)
- **Action:** `INSERT`
- **When:** Tenant record is created via `Tenant.objects.create()`
- **Fields Set:**
  - `name` = Company name from form
  - `slug` = Slugified domain or tenant name
  - `primary_domain` = Domain from form or generated slug
  - `domain_status` = `'active'`
  - `plan` = `'basic'`
  - `max_users` = `10`
  - `max_storage_gb` = `10`
  - `features` = `['accounting', 'invoicing']`
  - `onboarding_status` = `'INCOMPLETE'`
  - `country_code` = From form (if provided)
  - `industry_code` = From form (if provided)

#### `companies` (tenants app)
- **Action:** `INSERT`
- **When:** Company record is created if `company_name` is provided
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `name` = Company name from form
  - `is_primary` = `True`
  - `country` = Country code from form or `'US'`

---

### 2. **Preset Provisioning Tables** (Created if `country_code` provided)

These tables are populated by `PresetLoaderService` when `country_code` is provided during signup.

#### `currencies` (fx_conversion app)
- **Action:** `INSERT` (Multiple records)
- **When:** Currency preset is loaded
- **Records Created:**
  - Base currency (e.g., MYR for Malaysia, USD for others)
  - Additional enabled currencies from JSON preset
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `code` = ISO 4217 currency code (e.g., 'MYR', 'USD', 'SGD')
  - `name` = Currency name
  - `symbol` = Currency symbol
  - `is_base_currency` = `True` for base currency only
  - `decimal_places` = Default 2
  - `is_active` = `True`

#### `exchange_rates` (fx_conversion app)
- **Action:** `INSERT` (Multiple records)
- **When:** Exchange rates are calculated after currencies are created
- **Records Created:**
  - One record per non-base currency (from currency → to base currency)
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `from_currency` = Source currency code
  - `to_currency` = Base currency code
  - `rate` = Calculated via triangulation (`base_rate_to_usd / currency_rate_to_usd`)
  - `source` = `'preset'`
  - `provider` = `'default'`
  - `is_active` = `True`
  - `valid_from` = Current timestamp

#### `tax_categories` (invoicing app)
- **Action:** `INSERT` (Multiple records)
- **When:** Tax categories preset is loaded
- **Records Created:**
  - Tax categories from JSON preset (e.g., 'SERVICE_TAX', 'SALES_TAX' for Malaysia)
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `code` = Category code (e.g., 'SERVICE_TAX')
  - `name` = Category name
  - `description` = Category description
  - `is_active` = `True`

#### `tax_codes` (invoicing app)
- **Action:** `INSERT` (Multiple records)
- **When:** Tax codes preset is loaded (after tax categories)
- **Records Created:**
  - Tax codes from JSON preset (e.g., 'SV-6', 'SV-8' for Malaysia)
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `code` = Tax code (e.g., 'SV-6')
  - `name` = Tax code name
  - `tax_type` = 'gst', 'sales', or 'service'
  - `description` = Tax code description
  - `is_system` = `True`
  - `is_active` = `True`

#### `tax_rates` (invoicing app)
- **Action:** `INSERT` (Multiple records)
- **When:** Tax rates are created after tax codes
- **Records Created:**
  - One tax rate per tax code
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `tax_code_id` = Foreign key to tax_code
  - `name` = Tax rate name
  - `code` = Tax code code
  - `rate` = Tax rate percentage (Decimal)
  - `tax_type` = 'gst', 'sales', or 'service'
  - `region` = Country code
  - `is_default` = Based on JSON preset
  - `is_active` = `True`
  - `created_by_id` = User ID

#### `gl_account_types` (accounting app)
- **Action:** `INSERT` (Multiple records)
- **When:** Account types preset is loaded
- **Records Created:**
  - Account types from JSON preset (e.g., 'asset', 'liability', 'equity', 'revenue', 'expense')
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `code` = Account type code (e.g., 'asset')
  - `name` = Account type name (e.g., 'Assets')
  - `normal_balance` = 'debit' or 'credit'
  - `description` = Account type description
  - `is_system` = `True`
  - `is_active` = `True`
  - `display_order` = Based on code

#### `chart_of_accounts` (accounting app)
- **Action:** `INSERT` (Multiple records)
- **When:** Chart of accounts preset is loaded (after account types)
- **Records Created:**
  - Chart of accounts entries from JSON preset
  - Hierarchical structure (parent-child relationships)
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `code` = Account code (e.g., '1100', '1101')
  - `name` = Account name
  - `type` = Account type code (e.g., 'asset')
  - `account_type_id` = Foreign key to gl_account_types
  - `parent_id` = Foreign key to parent account (if hierarchical)
  - `description` = Account description
  - `is_active` = `True`
  - `is_system` = Based on `is_selectable` from JSON
  - `normal_balance` = 'debit' or 'credit'
  - `created_by_id` = User ID

---

### 3. **Onboarding Progress Tracking Tables** (Always Created/Updated)

#### `tenant_onboarding_progress` (tenants app)
- **Action:** `INSERT` or `UPDATE`
- **When:** Created/updated during preset loading
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant (OneToOne relationship)
  - `current_step` = `1` (default)
  - `completed_steps` = `[]` (empty array initially)
  - `step_data` = `{}` (empty dict initially)
  - `preset_progress` = Updated with preset completion status

#### `tenant_presets` (tenants app)
- **Action:** `INSERT` (Multiple records, optional)
- **When:** Created by `PresetEngine` if used (alternative to PresetLoaderService)
- **Records Created:**
  - One record per preset type provisioned
- **Fields Set:**
  - `tenant_id` = Foreign key to tenant
  - `preset_type` = Preset type (e.g., 'chart_of_accounts', 'tax_rates')
  - `payload` = JSON data of preset
  - `source_country` = Country code
  - `source_industry` = Industry code (if provided)
  - `is_active` = `True`

---

## Summary Table

| Table Name | App | Action | When | Records Created |
|------------|-----|--------|------|-----------------|
| `users` | authentication | INSERT | Always | 1 |
| `tenants` | tenants | INSERT | Always | 1 |
| `companies` | tenants | INSERT | If company_name provided | 1 |
| `currencies` | fx_conversion | INSERT | If country_code provided | 2-10+ |
| `exchange_rates` | fx_conversion | INSERT | If country_code provided | 1-9+ |
| `tax_categories` | invoicing | INSERT | If country_code provided | 1-5+ |
| `tax_codes` | invoicing | INSERT | If country_code provided | 2-10+ |
| `tax_rates` | invoicing | INSERT | If country_code provided | 2-10+ |
| `gl_account_types` | accounting | INSERT | If country_code provided | 5+ |
| `chart_of_accounts` | accounting | INSERT | If country_code provided | 10-100+ |
| `tenant_onboarding_progress` | tenants | INSERT/UPDATE | Always | 1 |
| `tenant_presets` | tenants | INSERT | If PresetEngine used | 0-8 |

---

## Notes

1. **Preset Loading is Optional:** If `country_code` is not provided during signup, preset tables are not populated. Presets can be loaded later during onboarding Step 4.

2. **Transaction Safety:** All preset loading operations are wrapped in `transaction.atomic()` to ensure data consistency.

3. **Tenant Isolation:** All records include `tenant_id` foreign key to ensure strict tenant isolation.

4. **Email Verification:** User record is created with `email_verified = False` and verification token. Email is sent separately (not a database operation).

5. **Onboarding Status:** Tenant starts with `onboarding_status = 'INCOMPLETE'` and must complete onboarding before accessing dashboard.

---

## Database Impact Estimate

**Minimum (No country_code):**
- 3 tables: `users`, `tenants`, `tenant_onboarding_progress`
- ~3-4 records total

**Typical (With country_code, no company_name):**
- 11 tables
- ~50-150 records total (depending on preset JSON size)

**Maximum (With country_code and company_name, large preset):**
- 12 tables
- ~150-300 records total

