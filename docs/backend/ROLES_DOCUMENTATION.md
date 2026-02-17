# OASYS360 - Roles Documentation

This document provides a comprehensive list of all user roles defined in the OASYS360 application.

## Overview

OASYS360 uses a hierarchical role-based access control (RBAC) system. Roles are defined in the `User` model and determine what features and modules a user can access.

## Role Hierarchy

Roles are organized from highest to lowest privilege:

1. **platform_admin** - Platform Administrator
2. **tenant_admin** - Tenant Administrator
3. **firm_admin** - Firm Administrator
4. **cfo** - Chief Financial Officer
5. **accountant** - Accountant
6. **staff** - Staff Member

---

## Role Definitions

### 1. Platform Admin (`platform_admin`)

**Display Name:** Platform Admin

**Description:** 
- Highest level of access in the system
- Full system access across all tenants
- Can manage platform-wide settings
- Can create, update, and delete tenants
- Can access all features and modules
- Can manage all users across all tenants

**Use Cases:**
- System administrators
- Platform owners
- Super users who need full system access

**Default Permissions:**
- ✅ All modules and features
- ✅ Tenant management
- ✅ User management (all tenants)
- ✅ Platform configuration
- ✅ System administration
- ✅ Audit logs and security events
- ✅ Bypasses all permission checks

**Database Model:**
- Defined in: `apps/backend/authentication/models.py`
- Field: `role = models.CharField(choices=[('platform_admin', 'Platform Admin'), ...])`

---

### 2. Tenant Admin (`tenant_admin`)

**Display Name:** Tenant Admin

**Description:**
- Full access to a specific tenant
- Can manage all tenant-level features
- Can manage users within their tenant
- Can configure tenant settings
- Cannot access other tenants' data
- Cannot access platform-wide settings

**Use Cases:**
- Company owners
- Business administrators
- Primary account holders who signed up

**Default Permissions:**
- ✅ All tenant features and modules
- ✅ User management (within tenant)
- ✅ Tenant configuration
- ✅ Financial operations
- ✅ Accounting operations
- ✅ All business modules (Sales, Purchase, Banking, etc.)
- ❌ Platform-wide features
- ❌ Other tenants' data

**Database Model:**
- Defined in: `apps/backend/authentication/models.py`
- Field: `role = models.CharField(choices=[('tenant_admin', 'Tenant Admin'), ...])`
- Also defined in: `apps/backend/tenants/models.py` (for tenant invitations)

**Special Notes:**
- Automatically assigned when a user signs up and creates a tenant
- Can invite other users to the tenant
- Can assign roles to other users within the tenant

---

### 3. Firm Admin (`firm_admin`)

**Display Name:** Firm Admin

**Description:**
- Administrative access at the firm/company level
- Can manage firm-level settings and users
- Can access financial and accounting features
- Typically used in multi-company scenarios
- Cannot manage tenant-level settings

**Use Cases:**
- Firm administrators
- Multi-company managers
- Regional administrators

**Default Permissions:**
- ✅ Firm-level administrative features
- ✅ User management (firm level)
- ✅ Financial operations
- ✅ Accounting operations
- ✅ All business modules
- ✅ Reports and analytics
- ❌ Tenant-level configuration
- ❌ Platform-wide features

**Database Model:**
- Defined in: `apps/backend/authentication/models.py`
- Field: `role = models.CharField(choices=[('firm_admin', 'Firm Admin'), ...])`
- Also defined in: `apps/backend/tenants/models.py` (for tenant invitations)

---

### 4. CFO (`cfo`)

**Display Name:** CFO

**Description:**
- Chief Financial Officer level access
- Can access all financial and accounting features
- Can approve financial transactions
- Can view financial reports and analytics
- Typically has read/write access to financial data
- Cannot manage users or system settings

**Use Cases:**
- Chief Financial Officers
- Finance directors
- Senior financial managers
- Users who need financial approval authority

**Default Permissions:**
- ✅ Financial operations
- ✅ Accounting operations
- ✅ Financial approvals
- ✅ Banking operations
- ✅ Financial reports and analytics
- ✅ Tax management
- ✅ Treasury management
- ✅ All business modules (Sales, Purchase, Invoicing, etc.)
- ❌ User management
- ❌ System configuration

**Database Model:**
- Defined in: `apps/backend/authentication/models.py`
- Field: `role = models.CharField(choices=[('cfo', 'CFO'), ...])`
- Also defined in: `apps/backend/tenants/models.py` (for tenant invitations)

---

### 5. Accountant (`accountant`)

**Display Name:** Accountant

**Description:**
- Standard accounting and financial access
- Most commonly used role for day-to-day operations
- Can perform accounting transactions
- Can manage financial records
- Can access most business modules
- Cannot approve high-value transactions (unless configured)
- Cannot manage users

**Use Cases:**
- Accountants
- Bookkeepers
- Financial analysts
- Day-to-day financial operations staff

**Default Permissions:**
- ✅ Sales module (Customers, Orders, Quotes)
- ✅ Purchase module (Suppliers, Orders, Receipts)
- ✅ Banking module (Accounts, Transactions)
- ✅ Invoicing module (Invoices, Payments)
- ✅ Accounting module (Chart of Accounts, Journal Entries)
- ✅ Inventory management
- ✅ Documents management
- ✅ Reports (view and generate)
- ✅ AI Processing features
- ❌ User management
- ❌ System configuration
- ❌ High-level approvals (unless specifically granted)

**Database Model:**
- Defined in: `apps/backend/authentication/models.py`
- Field: `role = models.CharField(choices=[('accountant', 'Accountant'), ...])`
- Also defined in: `apps/backend/tenants/models.py` (for tenant invitations)

**Special Notes:**
- This is the most commonly used role
- Most endpoints use `IsAccountant` permission class
- Default role for most business operations

---

### 6. Staff (`staff`)

**Display Name:** Staff

**Description:**
- Basic staff access
- Limited to operational features
- Can perform basic data entry and viewing
- Cannot access financial or accounting features
- Cannot manage users or settings

**Use Cases:**
- General staff members
- Data entry operators
- Support staff
- Users who need basic system access

**Default Permissions:**
- ✅ Inventory management (read/write)
- ✅ Documents management (read/write)
- ✅ Reports (view only)
- ✅ Notifications
- ✅ Basic dashboard access
- ✅ Own profile management
- ❌ Financial operations
- ❌ Accounting features
- ❌ User management
- ❌ System configuration

**Database Model:**
- Defined in: `apps/backend/authentication/models.py`
- Field: `role = models.CharField(choices=[('staff', 'Staff'), ...], default='staff')`
- Also defined in: `apps/backend/tenants/models.py` (for tenant invitations)

**Special Notes:**
- This is the default role when creating new users
- Minimum access level for authenticated users
- Can be upgraded to higher roles by tenant admins

---

## Role Assignment

### During Signup
- When a user signs up and creates a tenant, they are automatically assigned the `tenant_admin` role
- The role is set in `apps/backend/authentication/serializers.py` in the `CorporateRegisterSerializer.create()` method

### Via Invitations
- Tenant admins can invite users with specific roles
- Available invitation roles: `tenant_admin`, `firm_admin`, `cfo`, `accountant`, `staff`
- Defined in `apps/backend/tenants/models.py` in the `TenantInvitation` model

### Manual Assignment
- Platform admins can assign any role to any user
- Tenant admins can assign roles to users within their tenant
- Roles can be changed via the admin interface or API

---

## Permission Classes

Roles are enforced through permission classes defined in `apps/backend/authentication/permissions.py`:

### IsPlatformAdmin
- **Required Role:** `platform_admin` only
- **Description:** Full system access

### IsTenantAdmin
- **Required Roles:** `tenant_admin`, `platform_admin`
- **Description:** Full tenant management access

### IsFirmAdmin
- **Required Roles:** `firm_admin`, `tenant_admin`, `platform_admin`
- **Description:** Firm-level administrative access

### IsCFO
- **Required Roles:** `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`
- **Description:** CFO-level financial access

### IsAccountant
- **Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`
- **Description:** Standard accounting access (most common)

### IsTenantMember
- **Required:** Any authenticated user with a tenant
- **Description:** Basic tenant access

---

## Role Inheritance

Higher roles inherit permissions from lower roles:

```
platform_admin
  └─> Has access to everything

tenant_admin
  └─> Has access to all tenant features
      └─> Inherits from: (none, but platform_admin can access tenant features)

firm_admin
  └─> Has access to firm-level features
      └─> Inherits from: (none, but tenant_admin and platform_admin can access)

cfo
  └─> Has access to CFO and accountant features
      └─> Inherits from: accountant permissions

accountant
  └─> Has access to accounting features
      └─> Base level for most business operations

staff
  └─> Has access to basic operational features
      └─> Minimum access level
```

---

## Database Schema

### User Model
**File:** `apps/backend/authentication/models.py`

```python
role = models.CharField(
    max_length=50,
    choices=[
        ('platform_admin', 'Platform Admin'),
        ('tenant_admin', 'Tenant Admin'),
        ('firm_admin', 'Firm Admin'),
        ('cfo', 'CFO'),
        ('accountant', 'Accountant'),
        ('staff', 'Staff'),
    ],
    default='staff'
)
```

### TenantInvitation Model
**File:** `apps/backend/tenants/models.py`

```python
role = models.CharField(
    max_length=50,
    choices=[
        ('tenant_admin', 'Tenant Admin'),
        ('firm_admin', 'Firm Admin'),
        ('cfo', 'CFO'),
        ('accountant', 'Accountant'),
        ('staff', 'Staff'),
    ]
)
```

**Note:** `platform_admin` is not available in tenant invitations, as it's a platform-level role.

---

## API Serializers

Roles are exposed in API responses through serializers:

**File:** `apps/backend/authentication/serializers.py`

- `role`: The role code (e.g., `'accountant'`)
- `role_display`: The human-readable role name (e.g., `'Accountant'`)

---

## Frontend Usage

Roles are used in the frontend to:
- Control navigation menu visibility
- Control feature access
- Display role-specific dashboards
- Control UI elements and actions

**File:** `apps/frontend/lib/navigation/config.ts`

The navigation configuration uses roles to determine which menu items to show.

---

## Testing Roles

For testing purposes, you can create users with different roles:

```python
from authentication.models import User
from tenants.models import Tenant

# Create a tenant admin
user = User.objects.create_user(
    email='admin@example.com',
    password='password',
    role='tenant_admin',
    tenant=tenant
)

# Create an accountant
user = User.objects.create_user(
    email='accountant@example.com',
    password='password',
    role='accountant',
    tenant=tenant
)
```

---

## Summary Table

| Role Code | Display Name | Hierarchy Level | Default Access | Use Case |
|-----------|--------------|-----------------|----------------|----------|
| `platform_admin` | Platform Admin | 1 (Highest) | Full system | System administrators |
| `tenant_admin` | Tenant Admin | 2 | Full tenant | Business owners, primary users |
| `firm_admin` | Firm Admin | 3 | Firm level | Firm administrators |
| `cfo` | CFO | 4 | Financial | Chief Financial Officers |
| `accountant` | Accountant | 5 | Accounting | Accountants, bookkeepers |
| `staff` | Staff | 6 (Lowest) | Basic | General staff |

---

## Related Documentation

- **Roles and Permissions Guide:** `apps/backend/ROLES_AND_PERMISSIONS.md`
- **Permission Classes:** `apps/backend/authentication/permissions.py`
- **User Model:** `apps/backend/authentication/models.py`
- **Tenant Invitations:** `apps/backend/tenants/models.py`

---

**Last Updated:** 2024
**Version:** 1.0.0

