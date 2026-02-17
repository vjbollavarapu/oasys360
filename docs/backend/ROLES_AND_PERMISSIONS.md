# OASYS360 - Roles and Permissions Guide

This document provides a comprehensive overview of all features, modules, and their required roles and permissions in the OASYS360 system.

## Table of Contents
1. [Role Hierarchy](#role-hierarchy)
2. [Permission Classes](#permission-classes)
3. [Modules and Features](#modules-and-features)
4. [Quick Reference](#quick-reference)
5. [Testing Guide](#testing-guide)

---

## Role Hierarchy

Roles are organized in a hierarchy from highest to lowest privilege:

1. **platform_admin** - Highest level, full system access
2. **tenant_admin** - Full tenant management access
3. **firm_admin** - Firm-level administrative access
4. **cfo** - Chief Financial Officer level access
5. **accountant** - Standard accounting access
6. **staff** - Basic staff access
7. **user** - Basic user access (limited)

### Role Inheritance

Higher roles inherit permissions from lower roles:
- `platform_admin` → Has access to everything
- `tenant_admin` → Has access to all tenant features
- `firm_admin` → Has access to firm-level features
- `cfo` → Has access to CFO and accountant features
- `accountant` → Has access to accounting features

---

## Permission Classes

### IsPlatformAdmin
**Required Role:** `platform_admin` only

**Description:** Full system access across all tenants and features.

---

### IsTenantAdmin
**Required Roles:** `tenant_admin`, `platform_admin`

**Description:** Full access to tenant management, user management, and all tenant features.

---

### IsFirmAdmin
**Required Roles:** `firm_admin`, `tenant_admin`, `platform_admin`

**Description:** Access to firm-level administrative features, user management, and financial data.

---

### IsCFO
**Required Roles:** `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

**Description:** Access to financial data, approvals, and high-level financial operations.

---

### IsAccountant
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

**Description:** Access to accounting, financial, and operational features. This is the most commonly used permission class.

---

### IsTenantMember
**Required:** Any authenticated user with a tenant

**Description:** Basic access to tenant resources. Most read-only or basic operations.

---

## Modules and Features

### 1. Authentication (`/auth/`)
**Permission:** `IsAuthenticated` (any logged-in user)

**Features:**
- Login/Logout
- User Registration
- Password Reset
- Token Refresh
- Current User Profile
- Profile Update

**Required Role:** Any authenticated user

---

### 2. Sales Module (`/sales/`)
**Permission:** `IsAccountant` (most endpoints)

**Features:**

#### Customers (`/sales/customers/`)
- List Customers
- Create Customer
- View Customer Details
- Update Customer
- Delete Customer
- Search Customers

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Sales Orders (`/sales/orders/`)
- List Sales Orders
- Create Sales Order
- View Sales Order Details
- Update Sales Order
- Delete Sales Order
- Sales Order Lines Management

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Sales Quotes (`/sales/quotes/`)
- List Sales Quotes
- Create Sales Quote
- View Sales Quote Details
- Update Sales Quote
- Delete Sales Quote
- Convert Quote to Order

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Sales Opportunities (`/sales/opportunities/`)
- List Sales Opportunities
- Create Sales Opportunity
- View Sales Opportunity Details
- Update Sales Opportunity
- Delete Sales Opportunity

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Sales Statistics (`/sales/stats/`)
- Customer Summary
- Sales Statistics
- Sales Order Summary

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 3. Purchase Module (`/purchase/`)
**Permission:** `IsAccountant` (most endpoints)

**Features:**

#### Suppliers/Vendors (`/purchase/suppliers/`)
- List Suppliers
- Create Supplier
- View Supplier Details
- Update Supplier
- Delete Supplier
- Search Suppliers

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Purchase Orders (`/purchase/orders/`)
- List Purchase Orders
- Create Purchase Order
- View Purchase Order Details
- Update Purchase Order
- Delete Purchase Order
- Purchase Order Lines Management

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Purchase Receipts (`/purchase/receipts/`)
- List Purchase Receipts
- Create Purchase Receipt
- View Purchase Receipt Details
- Update Purchase Receipt
- Delete Purchase Receipt

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Purchase Payments (`/purchase/payments/`)
- List Purchase Payments
- Create Purchase Payment
- View Purchase Payment Details
- Update Purchase Payment
- Delete Purchase Payment

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Purchase Approval Requests (`/purchase/approvals/`)
- List Approval Requests
- Create Approval Request
- Approve/Reject Requests
- View Approval History

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Purchase Statistics (`/purchase/stats/`)
- Supplier Summary
- Purchase Statistics
- Purchase Order Summary

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 4. Banking Module (`/banking/`)
**Permission:** `IsAccountant` (all endpoints)

**Features:**

#### Bank Accounts (`/banking/accounts/`)
- List Bank Accounts
- Create Bank Account
- View Bank Account Details
- Update Bank Account
- Delete Bank Account

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Bank Transactions (`/banking/transactions/`)
- List Bank Transactions
- Create Bank Transaction
- View Bank Transaction Details
- Update Bank Transaction
- Delete Bank Transaction
- Search/Filter Transactions

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Bank Statements (`/banking/statements/`)
- List Bank Statements
- Create Bank Statement
- View Bank Statement Details
- Update Bank Statement
- Delete Bank Statement
- Import Bank Statements

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Bank Integrations (`/banking/integrations/`)
- List Bank Integrations
- Create Bank Integration
- View Bank Integration Details
- Update Bank Integration
- Delete Bank Integration
- Sync Bank Data

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Banking Statistics (`/banking/stats/`)
- Account Balance Summary
- Transaction Statistics
- Cash Flow Analysis

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 5. Invoicing Module (`/invoicing/`)
**Permission:** `IsAccountant` (all endpoints)

**Features:**

#### Invoices (`/invoicing/invoices/`)
- List Invoices
- Create Invoice
- View Invoice Details
- Update Invoice
- Delete Invoice
- Send Invoice
- Mark Invoice as Paid

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Invoice Lines (`/invoicing/invoices/{id}/lines/`)
- List Invoice Lines
- Create Invoice Line
- View Invoice Line Details
- Update Invoice Line
- Delete Invoice Line

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Invoice Templates (`/invoicing/templates/`)
- List Invoice Templates
- Create Invoice Template
- View Invoice Template Details
- Update Invoice Template
- Delete Invoice Template

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Invoice Payments (`/invoicing/payments/`)
- List Invoice Payments
- Create Invoice Payment
- View Invoice Payment Details
- Update Invoice Payment
- Delete Invoice Payment

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Invoice Actions
- Generate PDF
- Send via Email
- Export to UBL Format

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 6. Accounting Module (`/accounting/`)
**Permission:** `IsAccountant` (all endpoints)

**Features:**

#### Chart of Accounts (`/accounting/chart-of-accounts/`)
- List Chart of Accounts
- Create Account
- View Account Details
- Update Account
- Delete Account
- Account Hierarchy

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Journal Entries (`/accounting/journal-entries/`)
- List Journal Entries
- Create Journal Entry
- View Journal Entry Details
- Update Journal Entry
- Delete Journal Entry
- Post Journal Entry

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Journal Entry Lines (`/accounting/journal-entries/{id}/lines/`)
- List Journal Entry Lines
- Create Journal Entry Line
- View Journal Entry Line Details
- Update Journal Entry Line
- Delete Journal Entry Line

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Accounting Reports (`/accounting/reports/`)
- Trial Balance
- General Ledger
- Balance Sheet
- Income Statement
- Cash Flow Statement

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 7. Inventory Module (`/inventory/`)
**Permission:** `IsTenantMember` (most endpoints)

**Features:**

#### Items (`/inventory/items/`)
- List Items
- Create Item
- View Item Details
- Update Item
- Delete Item
- Search Items

**Required Roles:** Any authenticated tenant member

#### Item Categories (`/inventory/categories/`)
- List Categories
- Create Category
- View Category Details
- Update Category
- Delete Category

**Required Roles:** Any authenticated tenant member

#### Inventory Movements (`/inventory/movements/`)
- List Inventory Movements
- Create Inventory Movement
- View Movement Details
- Stock Adjustments
- Stock Transfers

**Required Roles:** Any authenticated tenant member

#### Warehouses (`/inventory/warehouses/`)
- List Warehouses
- Create Warehouse
- View Warehouse Details
- Update Warehouse
- Delete Warehouse

**Required Roles:** Any authenticated tenant member

#### Warehouse Stock (`/inventory/warehouses/{id}/stock/`)
- List Warehouse Stock
- View Stock Levels
- Stock Valuation

**Required Roles:** Any authenticated tenant member

#### Inventory Reports (`/inventory/reports/`)
- Inventory Summary
- Stock Valuation
- Movement History

**Required Roles:** Any authenticated tenant member

---

### 8. Reporting Module (`/reporting/`)
**Permission:** `IsTenantMember` (most endpoints)

**Features:**

#### Financial Reports
- Financial Summary
- Revenue Reports
- Expense Reports
- Profit & Loss
- Balance Sheet

**Required Roles:** Any authenticated tenant member

#### Operational Reports
- Sales Reports
- Purchase Reports
- Inventory Reports
- Customer Reports
- Vendor Reports

**Required Roles:** Any authenticated tenant member

#### Custom Reports
- Create Custom Report
- Schedule Reports
- Export Reports

**Required Roles:** Any authenticated tenant member

---

### 9. Documents Module (`/documents/`)
**Permission:** `IsTenantMember` (all endpoints)

**Features:**

#### Document Management
- List Documents
- Upload Document
- View Document
- Download Document
- Delete Document
- Document Categories

**Required Roles:** Any authenticated tenant member

#### Document Templates
- List Templates
- Create Template
- View Template
- Update Template
- Delete Template

**Required Roles:** Any authenticated tenant member

---

### 10. AI Processing Module (`/ai_processing/`)
**Permission:** `IsAccountant` (all endpoints)

**Features:**

#### Receipt Processing
- Upload Receipt
- Process Receipt
- Extract Receipt Data
- Review Extracted Data

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Invoice Processing
- Upload Invoice
- Process Invoice
- Extract Invoice Data
- Review Extracted Data

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

#### Document OCR
- Upload Document
- Extract Text
- Process Document

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 11. Dashboard (`/api/v1/dashboard/`)
**Permission:** `IsAuthenticated`

**Features:**
- Role-Based Dashboard
- Financial Overview
- Recent Activity
- Quick Stats
- Charts and Graphs

**Required Roles:** Any authenticated user (dashboard content varies by role)

**Dashboard Types:**
- **Super Administrator Dashboard** - System-wide statistics
- **Admin Dashboard** - Tenant-level statistics
- **Finance Dashboard** - Financial metrics (for `accountant`, `cfo`, `finance_manager`, `accounts_receivable`, `accounts_payable`)
- **IT Admin Dashboard** - System health and performance
- **Support Team Dashboard** - Support metrics

---

### 12. Platform Admin Module (`/platform_admin/`)
**Permission:** `IsTenantMember` (most endpoints)

**Features:**

#### Tenant Management
- List Tenants
- Create Tenant
- View Tenant Details
- Update Tenant
- Delete Tenant

**Required Roles:** Any authenticated tenant member (but typically `tenant_admin` or `platform_admin`)

#### User Management
- List Users
- Create User
- View User Details
- Update User
- Delete User
- Assign Roles

**Required Roles:** Any authenticated tenant member (but typically `tenant_admin` or `platform_admin`)

#### System Configuration
- System Settings
- Feature Flags
- Integration Settings

**Required Roles:** Typically `tenant_admin` or `platform_admin`

---

### 13. Notifications (`/api/v1/notifications/`)
**Permission:** `IsAuthenticated`

**Features:**
- List Notifications
- Mark as Read
- Mark All as Read
- Delete Notification
- Notification Settings

**Required Roles:** Any authenticated user

---

### 14. Tax Optimization (`/tax_optimization/`)
**Permission:** `IsAccountant` (typically)

**Features:**
- Tax Calculations
- Tax Reports
- Tax Optimization Suggestions

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 15. Treasury (`/treasury/`)
**Permission:** `IsAccountant` (typically)

**Features:**
- Cash Management
- Treasury Operations
- Liquidity Management

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

### 16. FX Conversion (`/fx_conversion/`)
**Permission:** `IsAccountant` (typically)

**Features:**
- Currency Conversion
- Exchange Rate Management
- Multi-Currency Transactions

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

---

## Quick Reference

### Most Common Permission: IsAccountant
**Applies to:**
- Sales (Customers, Orders, Quotes)
- Purchase (Suppliers, Orders, Receipts)
- Banking (Accounts, Transactions, Statements)
- Invoicing (Invoices, Payments, Templates)
- Accounting (Chart of Accounts, Journal Entries)
- AI Processing (Receipt/Invoice Processing)
- Tax Optimization
- Treasury
- FX Conversion

**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`

### Basic Access: IsTenantMember
**Applies to:**
- Inventory (Items, Categories, Movements)
- Reporting (Most reports)
- Documents (Document Management)
- Platform Admin (Basic operations)

**Required Roles:** Any authenticated tenant member

### Universal Access: IsAuthenticated
**Applies to:**
- Authentication (Login, Profile)
- Dashboard (Role-based content)
- Notifications

**Required Roles:** Any authenticated user

---

## Testing Guide

### Recommended Test Users by Role

#### 1. Platform Admin User
**Role:** `platform_admin`
**Use For:**
- Testing all features
- System administration
- Tenant management
- Full system access

**Access:**
- ✅ All modules
- ✅ All features
- ✅ System configuration
- ✅ Tenant management

---

#### 2. Tenant Admin User
**Role:** `tenant_admin`
**Use For:**
- Testing tenant-level features
- User management
- Tenant configuration

**Access:**
- ✅ All accounting features
- ✅ All financial features
- ✅ User management
- ✅ Tenant settings
- ❌ Platform-level features

---

#### 3. CFO User
**Role:** `cfo`
**Use For:**
- Testing financial approvals
- High-level financial operations
- Financial reporting

**Access:**
- ✅ All accounting features
- ✅ Financial approvals
- ✅ Financial reports
- ✅ Banking operations
- ❌ System administration

---

#### 4. Accountant User
**Role:** `accountant`
**Use For:**
- Testing standard accounting operations
- Day-to-day financial tasks
- Most common use case

**Access:**
- ✅ Sales module
- ✅ Purchase module
- ✅ Banking module
- ✅ Invoicing module
- ✅ Accounting module
- ✅ AI Processing
- ❌ System administration
- ❌ User management

---

#### 5. Staff User
**Role:** `staff`
**Use For:**
- Testing basic operations
- Limited access scenarios

**Access:**
- ✅ Inventory (read/write)
- ✅ Documents (read/write)
- ✅ Reports (view)
- ✅ Notifications
- ❌ Financial operations
- ❌ Accounting features

---

#### 6. Basic User
**Role:** `user`
**Use For:**
- Testing minimal access
- Basic user scenarios

**Access:**
- ✅ Own profile
- ✅ Notifications
- ✅ Dashboard (limited)
- ❌ Most business features

---

## Common Testing Scenarios

### Scenario 1: Full Financial Operations
**Recommended Role:** `accountant` or `cfo`
**Modules to Test:**
- Sales (Customers, Orders)
- Purchase (Suppliers, Orders)
- Banking (Accounts, Transactions)
- Invoicing (Invoices, Payments)
- Accounting (Chart of Accounts, Journal Entries)

---

### Scenario 2: Inventory Management
**Recommended Role:** `staff` or `accountant`
**Modules to Test:**
- Inventory (Items, Categories, Movements)
- Warehouses
- Stock Management

---

### Scenario 3: Document Management
**Recommended Role:** Any authenticated user
**Modules to Test:**
- Documents (Upload, View, Download)
- Document Templates

---

### Scenario 4: Reporting and Analytics
**Recommended Role:** `accountant` or `cfo`
**Modules to Test:**
- Reporting (Financial, Operational)
- Dashboard
- Custom Reports

---

### Scenario 5: System Administration
**Recommended Role:** `tenant_admin` or `platform_admin`
**Modules to Test:**
- Platform Admin (User Management, Tenant Management)
- System Configuration
- Feature Flags

---

## Notes

1. **Role Hierarchy:** Higher roles automatically have access to features available to lower roles.

2. **Tenant Context:** All operations are scoped to the user's tenant. Users can only access data from their own tenant.

3. **Permission Override:** `platform_admin` has access to everything, regardless of specific permission classes.

4. **Mobile App:** The mobile app uses the same permission system. Ensure your test user has the appropriate role for the features you want to test.

5. **API Endpoints:** All endpoints follow the pattern `/api/v1/{module}/{resource}/`. Check the Swagger documentation at `/swagger/` for detailed endpoint information.

---

## Support

If you encounter permission errors:
1. Check the user's role in the database
2. Verify the user is assigned to a tenant
3. Ensure the user's role matches the required permission class
4. Check the error message in the mobile app - it now shows your current role and required roles

---

**Last Updated:** December 2024
**Version:** 1.0

