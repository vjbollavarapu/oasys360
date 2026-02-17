# Roles and Permitted Modules

This document lists all user roles and their permitted modules in the OASYS360 application.

## Role Hierarchy

Roles are organized hierarchically with numeric weights. Higher roles automatically have access to all modules available to lower roles.

| Role | Weight | Description |
|------|--------|-------------|
| `platform_admin` | 100 | Platform administrator with full system access |
| `tenant_admin` | 80 | Tenant administrator with full tenant access |
| `firm_admin` | 60 | Firm-level administrator |
| `cfo` | 40 | Chief Financial Officer |
| `accountant` | 20 | Accountant with financial management access |
| `staff` | 10 | Basic staff member with limited access |

**Hierarchy Rule:** A role with a higher weight can access all modules available to roles with lower weights. For example, `tenant_admin` (80) can access everything that `accountant` (20) and `staff` (10) can access.

---

## Module Structure

The application is organized into the following main modules:

1. **Dashboard** - Overview and analytics
2. **Finance** - Financial management modules
3. **Operations** - Business operations
4. **Inventory** - Stock management & tracking
5. **Intelligence** - AI & advanced features
6. **Resources** - Documents & reports
7. **Admin** - Administration

---

## Role Permissions by Module

### 1. Dashboard

**Minimum Role:** `staff` (weight 10)

**Accessible By:**
- ✅ `platform_admin`
- ✅ `tenant_admin`
- ✅ `firm_admin`
- ✅ `cfo`
- ✅ `accountant`
- ✅ `staff`

**Description:** Overview and analytics dashboard available to all users.

---

### 2. Finance

**Minimum Role:** `accountant` (weight 20)

**Sub-modules:**
- **Accounting** (`accountant`) - Financial management
- **Banking** (`accountant`) - Bank integration & transactions
- **Treasury** (`cfo`) - Unified fiat & crypto treasury
- **Invoicing** (`accountant`) - Invoice management & compliance

**Accessible By:**
- ✅ `platform_admin` - Full access to all sub-modules
- ✅ `tenant_admin` - Full access to all sub-modules
- ✅ `firm_admin` - Full access to all sub-modules
- ✅ `cfo` - Full access to all sub-modules (including Treasury)
- ✅ `accountant` - Access to Accounting, Banking, and Invoicing (Treasury requires CFO)
- ❌ `staff` - No access

**Notes:**
- Treasury sub-module requires `cfo` role or higher
- All other Finance sub-modules require `accountant` role or higher

---

### 3. Operations

**Minimum Role:** `accountant` (weight 20)

**Sub-modules:**
- **Sales** (`accountant`) - Sales management & CRM
- **Purchase** (`accountant`) - Procurement & vendor management

**Accessible By:**
- ✅ `platform_admin` - Full access
- ✅ `tenant_admin` - Full access
- ✅ `firm_admin` - Full access
- ✅ `cfo` - Full access
- ✅ `accountant` - Full access
- ❌ `staff` - No access

---

### 4. Inventory

**Minimum Role:** `staff` (weight 10)

**Sub-modules:**
- **Overview** (`staff`)
- **Items** (`staff`)
- **Stock Movements** (`staff`)
- **Categories** (`staff`)
- **Valuation** (`staff`)
- **Reorder Points** (`staff`)
- **Barcode Scanning** (`staff`)
- **Settings** (`staff`)

**Accessible By:**
- ✅ `platform_admin` - Full access
- ✅ `tenant_admin` - Full access
- ✅ `firm_admin` - Full access
- ✅ `cfo` - Full access
- ✅ `accountant` - Full access
- ✅ `staff` - Full access

**Description:** Stock management & tracking available to all users.

---

### 5. Intelligence

**Minimum Role:** `firm_admin` (weight 60)

**Sub-modules:**
- **AI Processing** (`firm_admin`) - AI-powered automation
- **Web3** (`tenant_admin`) - Blockchain & crypto integration
- **Tax Optimization** (`firm_admin`) - Tax planning & optimization

**Accessible By:**
- ✅ `platform_admin` - Full access to all sub-modules
- ✅ `tenant_admin` - Access to Web3 only (AI Processing and Tax Optimization require firm_admin)
- ✅ `firm_admin` - Full access to all sub-modules
- ❌ `cfo` - No access (unless also has firm_admin or higher)
- ❌ `accountant` - No access
- ❌ `staff` - No access

**Notes:**
- Web3 sub-module requires `tenant_admin` role or higher
- AI Processing and Tax Optimization require `firm_admin` role or higher

---

### 6. Resources

**Minimum Role:** `staff` (weight 10)

**Sub-modules:**
- **Documents** (`staff`) - Document management
- **Reports** (`accountant`) - Analytics & reporting

**Accessible By:**
- ✅ `platform_admin` - Full access to Documents and Reports
- ✅ `tenant_admin` - Full access to Documents and Reports
- ✅ `firm_admin` - Full access to Documents and Reports
- ✅ `cfo` - Full access to Documents and Reports
- ✅ `accountant` - Full access to Documents and Reports
- ✅ `staff` - Access to Documents only (Reports requires accountant)

**Notes:**
- Documents sub-module requires `staff` role or higher
- Reports sub-module requires `accountant` role or higher

---

### 7. Admin

**Minimum Role:** `tenant_admin` (weight 80)

**Sub-modules:**
- **User Management** (`tenant_admin`) - Manage users within tenant
- **Tenant Settings** (`tenant_admin`) - Configure tenant settings
- **Security** (`tenant_admin`) - Security settings
- **Audit Logs** (`tenant_admin`) - View audit logs
- **Platform Admin** (`platform_admin`) - Platform administration (platform_admin only)
- **Super Admin** (`platform_admin`) - Super admin functions (platform_admin only)
- **Tenant Management** (`platform_admin`) - Manage all tenants (platform_admin only)
- **System Settings** (`platform_admin`) - System-wide settings (platform_admin only)
- **Backup & Restore** (`platform_admin`) - System backup/restore (platform_admin only)

**Accessible By:**
- ✅ `platform_admin` - Full access to all sub-modules (including platform-specific)
- ✅ `tenant_admin` - Access to User Management, Tenant Settings, Security, and Audit Logs only
- ❌ `firm_admin` - No access
- ❌ `cfo` - No access
- ❌ `accountant` - No access
- ❌ `staff` - No access

**Notes:**
- Tenant admin sub-modules require `tenant_admin` role or higher
- Platform-specific sub-modules require `platform_admin` role only

---

## Complete Role Summary

### Platform Admin (weight 100)
**Full Access to:**
- ✅ Dashboard
- ✅ Finance (Accounting, Banking, Treasury, Invoicing)
- ✅ Operations (Sales, Purchase)
- ✅ Inventory (all sub-modules)
- ✅ Intelligence (AI Processing, Web3, Tax Optimization)
- ✅ Resources (Documents, Reports)
- ✅ Admin (all sub-modules including platform-specific)

**Special Permissions:**
- Can manage all tenants
- Can access platform-wide settings
- Can perform system backups/restores
- Can access super admin functions

---

### Tenant Admin (weight 80)
**Full Access to:**
- ✅ Dashboard
- ✅ Finance (Accounting, Banking, Treasury, Invoicing)
- ✅ Operations (Sales, Purchase)
- ✅ Inventory (all sub-modules)
- ✅ Intelligence (Web3 only; AI Processing and Tax Optimization require firm_admin)
- ✅ Resources (Documents, Reports)
- ✅ Admin (User Management, Tenant Settings, Security, Audit Logs)

**Special Permissions:**
- Can manage users within their tenant
- Can configure tenant settings
- Can view audit logs
- Can access Web3 features

**Cannot Access:**
- ❌ Platform Admin functions
- ❌ System-wide settings
- ❌ Tenant Management (other tenants)
- ❌ AI Processing (requires firm_admin)
- ❌ Tax Optimization (requires firm_admin)

---

### Firm Admin (weight 60)
**Full Access to:**
- ✅ Dashboard
- ✅ Finance (Accounting, Banking, Treasury, Invoicing)
- ✅ Operations (Sales, Purchase)
- ✅ Inventory (all sub-modules)
- ✅ Intelligence (AI Processing, Web3, Tax Optimization)
- ✅ Resources (Documents, Reports)
- ❌ Admin (no access)

**Special Permissions:**
- Can access all Intelligence features
- Can manage firm-level operations

**Cannot Access:**
- ❌ Admin functions
- ❌ Platform Admin functions

---

### CFO (weight 40)
**Full Access to:**
- ✅ Dashboard
- ✅ Finance (Accounting, Banking, Treasury, Invoicing)
- ✅ Operations (Sales, Purchase)
- ✅ Inventory (all sub-modules)
- ✅ Resources (Documents, Reports)
- ❌ Intelligence (no access)
- ❌ Admin (no access)

**Special Permissions:**
- Can access Treasury module
- Can view financial reports

**Cannot Access:**
- ❌ Intelligence features
- ❌ Admin functions

---

### Accountant (weight 20)
**Full Access to:**
- ✅ Dashboard
- ✅ Finance (Accounting, Banking, Invoicing; Treasury requires CFO)
- ✅ Operations (Sales, Purchase)
- ✅ Inventory (all sub-modules)
- ✅ Resources (Documents, Reports)
- ❌ Intelligence (no access)
- ❌ Admin (no access)

**Special Permissions:**
- Can manage accounting operations
- Can access banking features
- Can generate reports

**Cannot Access:**
- ❌ Treasury (requires CFO)
- ❌ Intelligence features
- ❌ Admin functions

---

### Staff (weight 10)
**Full Access to:**
- ✅ Dashboard
- ✅ Inventory (all sub-modules)
- ✅ Resources (Documents only; Reports requires accountant)
- ❌ Finance (no access)
- ❌ Operations (no access)
- ❌ Intelligence (no access)
- ❌ Admin (no access)

**Special Permissions:**
- Can manage inventory
- Can upload/view documents

**Cannot Access:**
- ❌ Financial modules
- ❌ Operations modules
- ❌ Reports (requires accountant)
- ❌ Intelligence features
- ❌ Admin functions

---

## Quick Reference Matrix

| Module | Staff | Accountant | CFO | Firm Admin | Tenant Admin | Platform Admin |
|--------|:-----:|:----------:|:---:|:----------:|:------------:|:--------------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Finance - Accounting | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Finance - Banking | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Finance - Treasury | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Finance - Invoicing | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Operations - Sales | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Operations - Purchase | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Intelligence - AI Processing | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Intelligence - Web3 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Intelligence - Tax Optimization | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Resources - Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Resources - Reports | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin - User Management | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin - Tenant Settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin - Security | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin - Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin - Platform Functions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Notes

1. **Hierarchical Access:** Higher roles automatically inherit access to modules available to lower roles. For example, `tenant_admin` can access everything `accountant` and `staff` can access.

2. **Sub-module Access:** Some parent modules may be visible but certain sub-modules may require higher roles. For example, Finance is visible to `accountant`, but Treasury requires `cfo`.

3. **Parent Visibility Rule:** If a parent module has children, the parent is only shown if the user has access to at least one child. For example, if a `staff` user cannot access any Finance sub-modules, the Finance parent will not be shown.

4. **Platform Admin Override:** `platform_admin` always has access to everything, regardless of role requirements.

5. **Role Assignment:** During signup, the first user of a tenant is automatically assigned the `tenant_admin` role.

---

## Implementation Details

- Role weights are defined in `apps/frontend/lib/navigation/role-utils.ts`
- Navigation configuration is in `apps/frontend/lib/navigation/config.ts`
- Access control is enforced in `apps/frontend/lib/navigation/config.ts` via `filterNavigationByAccess()`
- Role hierarchy is enforced via `hasAccess()` function using numeric weights

---

*Last Updated: Based on navigation configuration refactoring*

