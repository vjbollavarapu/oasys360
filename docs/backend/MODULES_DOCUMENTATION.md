# OASYS360 - Modules Documentation

This document provides a comprehensive list of all modules available in the OASYS360 application, including backend APIs and frontend pages.

## Overview

OASYS360 is organized into multiple modules, each serving a specific business function. Modules are accessible based on user roles and permissions.

---

## Core Modules

### 1. Dashboard
**Path:** `/`  
**Backend API:** N/A (aggregates data from other modules)  
**Description:** Main dashboard providing overview and analytics  
**Access:** All authenticated users  
**Features:**
- Overview and analytics
- Quick actions
- Recent activities
- Key metrics

---

### 2. Accounting
**Path:** `/accounting`  
**Backend API:** `/api/v1/accounting/`  
**Description:** Financial management and accounting operations  
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/accounting`) - Accounting dashboard
- **Chart of Accounts** (`/accounting/gl-accounts`) - General ledger accounts management
- **Journal Entries** (`/accounting/journal-entries`) - Manual journal entry creation
- **Bank Reconciliation** (`/accounting/bank-reconciliation`) - Bank statement reconciliation
- **Fiscal Year** (`/accounting/fiscal-year`) - Fiscal year management
- **Petty Cash** (`/accounting/petty-cash`) - Petty cash management
- **Credit/Debit Notes** (`/accounting/credit-debit-notes`) - Credit and debit note management
- **Settings** (`/accounting/settings`) - Accounting module settings

**Backend Models:**
- `ChartOfAccounts`
- `GLAccountType`
- `GLAccount`
- `JournalEntry`
- `JournalEntryLine`
- `BankReconciliation`
- `FiscalYear`
- `PettyCash`
- `CreditDebitNote`

---

### 3. Invoicing
**Path:** `/invoicing`  
**Backend API:** `/api/v1/invoicing/`  
**Description:** Invoice management and compliance  
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/invoicing`) - Invoicing dashboard
- **Create Invoice** (`/invoicing/create`) - Create new invoices
- **Invoice Templates** (`/invoicing/templates`) - Invoice template management
- **E-Invoicing** (`/invoicing/e-invoicing`) - Electronic invoicing compliance
- **Compliance Rules** (`/invoicing/compliance`) - Tax and compliance rule management
- **Digital Signatures** (`/invoicing/signatures`) - Digital signature management
- **Tax Management** (`/invoicing/tax`) - Tax calculation and management
- **Settings** (`/invoicing/settings`) - Invoicing module settings

**Backend Models:**
- `Invoice`
- `InvoiceLine`
- `InvoiceTemplate`
- `EInvoice`
- `ComplianceRule`
- `DigitalSignature`
- `TaxRate`
- `TaxCode`

---

### 4. Banking
**Path:** `/banking`  
**Backend API:** `/api/v1/banking/`  
**Description:** Bank integration and transaction management  
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/banking`) - Banking dashboard
- **Bank Accounts** (`/banking/accounts`) - Bank account management
- **Transactions** (`/banking/transactions`) - Transaction listing and management
- **Reconciliation** (`/banking/reconciliation`) - Bank reconciliation
- **Bank Integration** (`/banking/integration`) - Third-party bank integrations
- **Plaid Connect** (`/banking/plaid`) - Plaid integration for bank connections
- **Import/Export** (`/banking/import-export`) - Transaction import/export
- **Settings** (`/banking/settings`) - Banking module settings

**Backend Models:**
- `BankAccount`
- `BankTransaction`
- `BankReconciliation`
- `BankIntegration`
- `PlaidConnection`

---

### 5. Inventory
**Path:** `/inventory`  
**Backend API:** `/api/v1/inventory/`  
**Description:** Stock management and tracking  
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/inventory`) - Inventory dashboard
- **Items** (`/inventory/items`) - Product/item management
- **Stock Movements** (`/inventory/movements`) - Stock movement tracking
- **Categories** (`/inventory/categories`) - Product category management
- **Valuation** (`/inventory/valuation`) - Inventory valuation methods
- **Reorder Points** (`/inventory/reorder`) - Reorder point management
- **Barcode Scanning** (`/inventory/barcode`) - Barcode scanning functionality
- **Settings** (`/inventory/settings`) - Inventory module settings

**Backend Models:**
- `Item`
- `ItemCategory`
- `StockMovement`
- `Warehouse`
- `WarehouseStock`
- `InventoryValuation`

---

### 6. Sales
**Path:** `/sales`  
**Backend API:** `/api/v1/sales/`  
**Description:** Sales management and CRM  
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/sales`) - Sales dashboard
- **Customers** (`/sales/customers`) - Customer management
- **Sales Orders** (`/sales/orders`) - Sales order management
- **Quotes** (`/sales/quotes`) - Sales quote management
- **Sales Analytics** (`/sales/analytics`) - Sales analytics and reporting
- **Commission Tracking** (`/sales/commission`) - Sales commission management
- **Sales Pipeline** (`/sales/pipeline`) - Sales opportunity pipeline
- **Settings** (`/sales/settings`) - Sales module settings

**Backend Models:**
- `Customer`
- `SalesOrder`
- `SalesOrderLine`
- `SalesQuote`
- `SalesQuoteLine`
- `SalesOpportunity`
- `SalesCommission`

---

### 7. Purchase
**Path:** `/purchase`  
**Backend API:** `/api/v1/purchase/`  
**Description:** Procurement and vendor management  
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/purchase`) - Purchase dashboard
- **Vendors** (`/purchase/vendors`) - Vendor/supplier management
- **Purchase Orders** (`/purchase/orders`) - Purchase order management
- **Receiving** (`/purchase/receiving`) - Goods receipt management
- **Approvals** (`/purchase/approvals`) - Purchase approval workflow
- **Vendor Verification** (`/vendor-verification`) - Vendor verification (Web3)
- **Vendor Analytics** (`/purchase/analytics`) - Vendor analytics
- **Contract Management** (`/purchase/contracts`) - Vendor contract management
- **Settings** (`/purchase/settings`) - Purchase module settings

**Backend Models:**
- `Supplier`
- `PurchaseOrder`
- `PurchaseOrderLine`
- `PurchaseReceipt`
- `PurchaseReceiptLine`
- `PurchaseSettings`

---

### 8. Reports
**Path:** `/reports`  
**Backend API:** `/api/v1/reporting/`  
**Description:** Analytics and reporting  
**Required Roles:** `accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/reports`) - Reports dashboard
- **Financial Reports** (`/reports/financial`) - Financial statement reports
- **Tax Reports** (`/reports/tax`) - Tax-related reports
- **Compliance Reports** (`/reports/compliance`) - Compliance reports
- **Custom Reports** (`/reports/custom`) - Custom report builder
- **Scheduled Reports** (`/reports/scheduled`) - Automated report scheduling
- **Export Options** (`/reports/export`) - Report export formats
- **Settings** (`/reports/settings`) - Reporting module settings

**Backend Models:**
- `Report`
- `ReportTemplate`
- `ReportExport`
- `ReportingSettings`

---

### 9. Documents
**Path:** `/documents`  
**Backend API:** `/api/v1/documents/`  
**Description:** Document management system  
**Required Roles:** All authenticated users (`accountant`, `cfo`, `firm_admin`, `tenant_admin`, `platform_admin`, `staff`, `user`)  
**Sub-modules:**
- **Overview** (`/documents`) - Documents dashboard
- **All Documents** (`/documents/all`) - Document listing
- **Upload Documents** (`/documents/upload`) - Document upload interface
- **Document Templates** (`/documents/templates`) - Document template management
- **OCR Processing** (`/documents/ocr`) - OCR document processing
- **Document Workflow** (`/documents/workflow`) - Document approval workflows
- **Storage Management** (`/documents/storage`) - Document storage management
- **Settings** (`/documents/settings`) - Document module settings

**Backend Models:**
- `Document`
- `DocumentCategory`
- `DocumentTemplate`
- `DocumentWorkflow`
- `DocumentAuditLog`

---

## Advanced Modules

### 10. AI Processing
**Path:** `/ai-processing`  
**Backend API:** `/api/v1/ai_processing/`  
**Description:** AI-powered automation and intelligence  
**Required Roles:** `platform_admin`, `tenant_admin`, `firm_admin`  
**Sub-modules:**
- **Overview** (`/ai-processing`) - AI processing dashboard
- **Document Processing** (`/ai-processing/documents`) - AI document processing
- **Transaction Categorization** (`/ai-processing/categorization`) - Automatic transaction categorization
- **Fraud Detection** (`/ai-processing/fraud`) - Fraud detection and prevention
- **Financial Forecasting** (`/ai-processing/forecasting`) - AI-powered financial forecasting
- **AI Models** (`/ai-processing/models`) - AI model management
- **Processing Jobs** (`/ai-processing/jobs`) - AI processing job management
- **Settings** (`/ai-processing/settings`) - AI processing settings

**Backend Models:**
- `AIProcessingJob`
- `DocumentProcessing`
- `TransactionCategorization`
- `FraudDetection`
- `FinancialForecast`
- `AIModel`

---

### 11. Web3 Integration
**Path:** `/web3`  
**Backend API:** `/api/v1/web3_integration/`  
**Description:** Blockchain and cryptocurrency integration  
**Required Roles:** `platform_admin`, `tenant_admin`  
**Sub-modules:**
- **Overview** (`/web3`) - Web3 dashboard
- **Crypto Wallets** (`/web3/wallets`) - Cryptocurrency wallet management
- **Transactions** (`/web3/transactions`) - Blockchain transaction tracking
- **DeFi Positions** (`/web3/defi`) - DeFi position management
- **Token Management** (`/web3/tokens`) - Token and cryptocurrency management
- **Gnosis Safe** (`/gnosis-safe`) - Gnosis Safe integration
- **Coinbase Prime** (`/coinbase-prime`) - Coinbase Prime integration
- **Blockchain Networks** (`/web3/networks`) - Blockchain network configuration
- **Smart Contracts** (`/web3/contracts`) - Smart contract management
- **Settings** (`/web3/settings`) - Web3 module settings

**Backend Models:**
- `CryptoWallet`
- `BlockchainTransaction`
- `DeFiPosition`
- `TokenPrice`
- `VendorWalletAddress`
- `VendorVerificationLog`
- `Web3IntegrationSettings`

---

### 12. Tax Optimization
**Path:** `/tax-optimization`  
**Backend API:** `/api/v1/tax_optimization/`  
**Description:** Tax planning and optimization  
**Required Roles:** `platform_admin`, `tenant_admin`, `cfo`, `firm_admin`  
**Sub-modules:**
- **Dashboard** (`/tax-optimization`) - Tax optimization dashboard

**Backend Models:**
- `TaxYearSummary`
- `TaxReport`
- `TaxSettings`
- `TaxOptimizationStrategy`

---

### 13. Treasury
**Path:** `/treasury`  
**Backend API:** `/api/v1/treasury/`  
**Description:** Unified fiat and crypto treasury management  
**Required Roles:** `platform_admin`, `tenant_admin`, `cfo`, `firm_admin`  
**Sub-modules:**
- **Dashboard** (`/treasury`) - Treasury dashboard
- **FX Conversion** (`/fx-conversion`) - Foreign exchange conversion

**Backend Models:**
- `TreasuryAccount`
- `TreasuryTransaction`
- `Currency`
- `ExchangeRate`

---

### 14. ERP Integration
**Path:** `/erp-integration`  
**Backend API:** `/api/v1/erp_integration/` (if implemented)  
**Description:** Third-party ERP system integrations  
**Required Roles:** `platform_admin`, `tenant_admin`, `firm_admin`  
**Sub-modules:**
- **ERP Integration** (`/erp-integration`) - ERP integration management

**Backend Models:**
- `ERPConnection`
- `ERPSyncLog`
- `ERPIntegrationSettings`

---

## Administrative Modules

### 15. Admin
**Path:** `/admin`  
**Backend API:** `/api/v1/platform_admin/`  
**Description:** Platform and tenant administration  
**Required Roles:** 
- **Platform Admin:** `platform_admin` only
- **Tenant Admin:** `tenant_admin`, `platform_admin`  
**Sub-modules:**

#### Platform Admin Only:
- **Platform Admin** (`/platform-admin`) - Platform administration dashboard
- **Super Admin** (`/super-admin`) - Super admin dashboard
- **User Management** (`/admin/users`) - User management across all tenants
- **Tenant Management** (`/admin/tenants`) - Tenant management
- **System Settings** (`/admin/settings`) - System-wide settings
- **Security** (`/admin/security`) - Security settings and monitoring
- **Audit Logs** (`/admin/audit`) - System audit logs
- **Backup & Restore** (`/admin/backup`) - Backup and restore management

#### Tenant Admin:
- **User Management** (`/admin/users`) - User management within tenant
- **Tenant Settings** (`/admin/tenant-settings`) - Tenant-specific settings
- **Security** (`/admin/security`) - Tenant security settings
- **Audit Logs** (`/admin/audit`) - Tenant audit logs

**Backend Models:**
- `User`
- `Tenant`
- `TenantInvitation`
- `AuditLog`
- `SecurityEvent`
- `BackupRestore`

---

### 16. Firm Management
**Path:** `/firm`  
**Backend API:** N/A (uses tenant APIs)  
**Description:** Firm-level administration (for accounting firms)  
**Required Roles:** `firm_admin`, `tenant_admin`, `platform_admin`  
**Sub-modules:**
- **Overview** (`/firm`) - Firm dashboard
- **Clients** (`/firm/clients`) - Client management
- **Firm Settings** (`/firm/settings`) - Firm-level settings

---

## Mobile Module

### 17. Mobile
**Path:** `/mobile`  
**Backend API:** `/api/v1/mobile/`  
**Description:** Mobile app features and API  
**Required Roles:** All authenticated users  
**Sub-modules:**
- **Dashboard** (`/mobile/dashboard`) - Mobile dashboard
- **Expenses** (`/mobile/expenses`) - Expense management
- **Invoices** (`/mobile/invoices`) - Invoice viewing and management
- **Approvals** (`/mobile/approvals`) - Approval workflow
- **Notifications** (`/mobile/notifications`) - Push notifications

**Backend Models:**
- `MobileDevice`
- `MobileNotification`
- `MobileSyncLog`

---

## Authentication & Tenant Management

### 18. Authentication
**Path:** `/auth/*`  
**Backend API:** `/api/v1/auth/`  
**Description:** User authentication and authorization  
**Access:** Public (for login/register), Protected (for profile)  
**Endpoints:**
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/logout` - User logout
- `/auth/verify-email` - Email verification
- `/auth/reset-password` - Password reset
- `/auth/profile` - User profile management

**Backend Models:**
- `User`
- `UserProfile`
- `SocialAccount`
- `AccountConversion`

---

### 19. Tenants
**Path:** `/tenants/*` (API only)  
**Backend API:** `/api/v1/tenants/`  
**Description:** Tenant management and onboarding  
**Access:** Protected  
**Endpoints:**
- `/api/v1/tenants/me/` - Get current tenant info
- `/api/v1/tenants/onboarding/status/` - Get onboarding status
- `/api/v1/tenants/onboarding/progress/` - Get onboarding progress
- `/api/v1/tenants/onboarding/step/{1-5}/` - Onboarding steps

**Backend Models:**
- `Tenant`
- `Company`
- `TenantInvitation`
- `TenantOnboardingProgress`
- `TenantPreset`

---

## Marketing & Public

### 20. Marketing Forms
**Path:** `/marketing/*` (API only)  
**Backend API:** `/api/v1/marketing/`  
**Description:** Public marketing forms and inquiries  
**Access:** Public  
**Endpoints:**
- `/api/v1/marketing/inquiries/` - Sales inquiries
- `/api/v1/marketing/contact/` - Contact form submissions

**Backend Models:**
- `SalesInquiry`
- `SalesInquiryResponse`
- `SalesInquiryAttachment`

---

## Module Access Summary

| Module | Platform Admin | Tenant Admin | Firm Admin | CFO | Accountant | Staff |
|--------|---------------|--------------|------------|-----|------------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accounting | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Invoicing | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Banking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Sales | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Purchase | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI Processing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Web3 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tax Optimization | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Treasury | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| ERP Integration | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ (Limited) | ❌ | ❌ | ❌ | ❌ |
| Firm Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Mobile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Backend API Endpoints Summary

All modules are accessible via REST API at `/api/v1/{module}/`:

1. `/api/v1/auth/` - Authentication
2. `/api/v1/tenants/` - Tenant management
3. `/api/v1/accounting/` - Accounting operations
4. `/api/v1/ai_processing/` - AI processing
5. `/api/v1/banking/` - Banking operations
6. `/api/v1/contact_sales/` - Sales inquiries
7. `/api/v1/documents/` - Document management
8. `/api/v1/inventory/` - Inventory management
9. `/api/v1/invoicing/` - Invoicing operations
10. `/api/v1/mobile/` - Mobile API
11. `/api/v1/platform_admin/` - Platform administration
12. `/api/v1/purchase/` - Purchase operations
13. `/api/v1/reporting/` - Reporting
14. `/api/v1/sales/` - Sales operations
15. `/api/v1/tax_optimization/` - Tax optimization
16. `/api/v1/treasury/` - Treasury management
17. `/api/v1/fx_conversion/` - FX conversion
18. `/api/v1/web3_integration/` - Web3 integration
19. `/api/v1/marketing/` - Marketing forms

---

## Module Dependencies

### Core Dependencies
- **Authentication** → Required by all modules
- **Tenants** → Required by all tenant-scoped modules
- **Documents** → Used by Accounting, Invoicing, Banking, Sales, Purchase

### Feature Dependencies
- **AI Processing** → Enhances Documents, Banking, Accounting
- **Web3 Integration** → Enhances Banking, Treasury, Purchase (vendor verification)
- **Tax Optimization** → Uses Accounting, Invoicing data
- **Treasury** → Uses Banking, FX Conversion data
- **Reports** → Aggregates data from all financial modules

---

## Related Documentation

- **Roles Documentation:** `apps/backend/ROLES_DOCUMENTATION.md`
- **Roles and Permissions:** `apps/backend/ROLES_AND_PERMISSIONS.md`
- **Navigation Configuration:** `apps/frontend/lib/navigation/config.ts`
- **Backend URLs:** `apps/backend/backend/urls.py`

---

**Last Updated:** 2024  
**Version:** 1.0.0

