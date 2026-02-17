# Role-Based Module Access & Permissions

This document lists each application role with the **modules** it can access and the **permissions** granted to that role.  
Scope: OASYS backend (row-based multi-tenancy). Roles are defined on the User model.

---

## 1. Platform Admin

**Role value:** `platform_admin`  
**Scope:** Platform-wide (all tenants).

### Modules & access

| Module | Access level | Notes |
|--------|--------------|--------|
| **Tenants** | Full | List all tenants, create/update/delete any tenant, tenant settings |
| **Companies** | Full | List/create/update/delete companies for any tenant (via firm admin–level access) |
| **Tenant invitations** | Full | List/create/revoke invitations for any tenant (via tenant admin–level access) |
| **Accounting** | Full | Chart of accounts, journal entries, reports (trial balance, P&amp;L, balance sheet), fiscal year, petty cash, credit/debit notes |
| **Banking** | Full | Accounts, transactions, reconciliation, summary |
| **Invoicing** | Full | Invoices, credit notes, templates, e-invoicing |
| **Sales** | Full | Quotes, orders, customers, sales settings |
| **Purchase** | Full | POs, vendors, purchase settings |
| **Inventory** | Full | Items, stock, warehouses, movements |
| **Documents** | Full | Upload, list, download, delete (tenant-scoped) |
| **Reporting** | Full | All reports and analytics (tenant-scoped) |
| **Web3 integration** | Full | Wallets, transactions, Web3 settings (tenant-scoped) |
| **AI processing** | Full | AI features and settings (tenant-scoped) |
| **Platform admin** | Full | Platform dashboard, tenant overview, system-level views |

### Permissions (granted to this role)

- `view_all_data`, `edit_all_data`, `delete_all_data`
- `manage_users`, `manage_tenants`, `configure_system`
- `view_audit_data`, `export_data`, `import_data`
- `manage_compliance`, `view_sensitive_data`

---

## 2. Tenant Admin

**Role value:** `tenant_admin`  
**Scope:** Single tenant (own tenant only, unless also platform_admin).

### Modules & access

| Module | Access level | Notes |
|--------|--------------|--------|
| **Tenants** | Manage own | View/update own tenant; cannot create tenants (platform_admin only) |
| **Companies** | Full | List/create/update/delete companies for own tenant |
| **Tenant invitations** | Full | List/create/revoke invitations for own tenant |
| **Accounting** | Full | Same as Platform Admin, scoped to tenant |
| **Banking** | Full | Same as Platform Admin, scoped to tenant |
| **Invoicing** | Full | Same as Platform Admin, scoped to tenant |
| **Sales** | Full | Same as Platform Admin, scoped to tenant |
| **Purchase** | Full | Same as Platform Admin, scoped to tenant |
| **Inventory** | Full | Same as Platform Admin, scoped to tenant |
| **Documents** | Full | Same as Platform Admin, scoped to tenant |
| **Reporting** | Full | Same as Platform Admin, scoped to tenant |
| **Web3 integration** | Full | Same as Platform Admin, scoped to tenant |
| **AI processing** | Full | Same as Platform Admin, scoped to tenant |
| **Onboarding** | Full | Tenant onboarding wizard and status (own tenant) |

### Permissions (granted to this role)

- `view_tenant_data`, `edit_tenant_data`, `delete_tenant_data`
- `manage_tenant_users`, `configure_tenant`
- `view_tenant_audit_data`, `export_tenant_data`
- `manage_tenant_compliance`

---

## 3. Firm Admin

**Role value:** `firm_admin`  
**Scope:** Single tenant (e.g. accounting firm).

### Modules & access

| Module | Access level | Notes |
|--------|--------------|--------|
| **Companies** | Full | List/create/update/delete companies for own tenant |
| **Accounting** | Full | Same as Tenant Admin, scoped to tenant |
| **Banking** | Full | Same as Tenant Admin, scoped to tenant |
| **Invoicing** | Full | Same as Tenant Admin, scoped to tenant |
| **Sales** | Full | Same as Tenant Admin, scoped to tenant |
| **Purchase** | Full | Same as Tenant Admin, scoped to tenant |
| **Inventory** | Full | Same as Tenant Admin, scoped to tenant |
| **Documents** | Full | Same as Tenant Admin, scoped to tenant |
| **Reporting** | Full | Same as Tenant Admin, scoped to tenant |
| **Web3 integration** | Full | Same as Tenant Admin, scoped to tenant |
| **AI processing** | Full | Same as Tenant Admin, scoped to tenant |

**No access:** Tenant settings (name, plan, slug), tenant invitations (those require Tenant Admin).

### Permissions (granted to this role)

- `view_firm_data`, `edit_firm_data`, `delete_firm_data`
- `manage_firm_users`, `view_firm_audit_data`, `export_firm_data`

---

## 4. CFO

**Role value:** `cfo`  
**Scope:** Single tenant.

### Modules & access

| Module | Access level | Notes |
|--------|--------------|--------|
| **Accounting** | Full | Chart of accounts, journal entries, reports, fiscal year, petty cash, credit/debit notes |
| **Banking** | Full | Accounts, transactions, reconciliation, summary |
| **Invoicing** | Full | Invoices, credit notes, templates, e-invoicing |
| **Sales** | Full | Quotes, orders, customers, sales settings |
| **Purchase** | Full | POs, vendors, purchase settings |
| **Inventory** | Full | Items, stock, warehouses, movements |
| **Documents** | Full | Upload, list, download, delete (tenant-scoped) |
| **Reporting** | Full | All reports (tenant-scoped) |
| **Web3 integration** | Full | Web3 features (tenant-scoped) |
| **AI processing** | Full | AI features (tenant-scoped) |

**No access:** Tenant/company management, tenant invitations (Firm Admin / Tenant Admin only).

### Permissions (granted to this role)

- `view_financial_data`, `edit_financial_data`
- `view_financial_audit_data`, `export_financial_data`
- `approve_financial_transactions`

---

## 5. Accountant

**Role value:** `accountant`  
**Scope:** Single tenant.

### Modules & access

| Module | Access level | Notes |
|--------|--------------|--------|
| **Accounting** | Full | Chart of accounts, journal entries, reports, fiscal year, petty cash, credit/debit notes |
| **Banking** | Full | Accounts, transactions, reconciliation, summary |
| **Invoicing** | Full | Invoices, credit notes, templates, e-invoicing |
| **Sales** | Full | Quotes, orders, customers, sales settings |
| **Purchase** | Full | POs, vendors, purchase settings |
| **Inventory** | Full | Items, stock, warehouses, movements |
| **Documents** | Full | Upload, list, download, delete (tenant-scoped) |
| **Reporting** | Full | All reports (tenant-scoped) |
| **Web3 integration** | Full | Web3 features (tenant-scoped) |
| **AI processing** | Full | AI features (tenant-scoped) |

**No access:** Tenant/company management, tenant invitations; no explicit “approve financial transactions” permission (CFO-level).

### Permissions (granted to this role)

- `view_financial_data`, `edit_financial_data`
- `view_financial_audit_data`, `export_financial_data`

---

## 6. Staff

**Role value:** `staff`  
**Scope:** Single tenant.

### Modules & access

| Module | Access level | Notes |
|--------|--------------|--------|
| **Accounting** | View + basic edit | Dashboard, chart of accounts, journal entries, reports (e.g. trial balance); same API as Accountant for these modules |
| **Banking** | View + basic edit | Same as Accountant for banking APIs |
| **Invoicing** | View + basic edit | Same as Accountant for invoicing APIs |
| **Sales** | View + basic edit | Same as Accountant for sales APIs |
| **Purchase** | View + basic edit | Same as Accountant for purchase APIs |
| **Inventory** | Full (tenant member) | Items, stock, warehouses, movements |
| **Documents** | Full | Upload, list, download, delete (tenant-scoped) |
| **Reporting** | Full | All reports (tenant-scoped) |
| **Web3 integration** | Full | Web3 features (tenant-scoped) |
| **AI processing** | Full | AI features (tenant-scoped) |
| **Onboarding** | Own user | Can complete onboarding for own tenant (authenticated member) |

**No access:** Tenant/company management, tenant invitations.

### Permissions (granted to this role)

- `view_basic_data`, `edit_basic_data`

---

## Summary matrix (roles × modules)

| Module | Platform Admin | Tenant Admin | Firm Admin | CFO | Accountant | Staff |
|--------|----------------|--------------|------------|-----|------------|-------|
| Tenants (create/list all) | ✅ Full | Own only | — | — | — | — |
| Companies | ✅ | ✅ | ✅ | — | — | — |
| Tenant invitations | ✅ | ✅ | — | — | — | — |
| Accounting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Banking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invoicing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sales | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Purchase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reporting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Web3 integration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI processing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Platform admin UI | ✅ | — | — | — | — | — |
| Onboarding (tenant) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Permission classes used in the API

- **IsPlatformAdmin** — `platform_admin` only.
- **IsTenantAdmin** — `tenant_admin` or `platform_admin`; tenant context required.
- **IsFirmAdmin** — `firm_admin`, `tenant_admin`, or `platform_admin`; tenant context required.
- **IsCFO** — `cfo`, `firm_admin`, `tenant_admin`, or `platform_admin`; tenant context required.
- **IsAccountant** — `staff`, `accountant`, `cfo`, `firm_admin`, `tenant_admin`, or `platform_admin`; tenant context required.
- **IsTenantMember** — Any authenticated user with a tenant (request.tenant or user.tenant set).

All tenant-scoped modules enforce that the user’s tenant matches the resource’s tenant (or JWT tenant context).

---

*Generated from backend permission classes and role_permissions. Last updated: 2026-02.*
