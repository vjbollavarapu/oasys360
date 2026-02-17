# Database Schema Documentation - OASYS360

## Overview
This document provides a comprehensive list of all database tables, their relationships, and whether they are tenant-specific or platform-wide.

**Legend:**
- **Tenant-Specific (True)**: Table contains a `tenant_id` foreign key and data is isolated per tenant
- **Tenant-Specific (False)**: Table is platform-wide and shared across all tenants
- **Relations**: Foreign key relationships to other tables

---

## Authentication Module

### 1. `users`
- **Tenant-Specific**: True (but nullable for platform admins)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
- **Explanation**: Users belong to tenants, but platform admins may have `tenant_id = NULL`

### 2. `user_profiles`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users` (OneToOne)
- **Explanation**: User profiles are tenant-scoped

### 3. `social_accounts`
- **Tenant-Specific**: True (via user)
- **Relations**:
  - `user_id` → `authentication.users` (which has `tenant_id`)
- **Explanation**: Social accounts are tenant-scoped through the user relationship

### 4. `account_conversions`
- **Tenant-Specific**: True (via user)
- **Relations**:
  - `user_id` → `authentication.users` (OneToOne, which has `tenant_id`)
- **Explanation**: Account conversions are tenant-scoped through the user relationship

---

## Tenants Module

### 5. `tenants`
- **Tenant-Specific**: **False**
- **Relations**: None (root table)
- **Explanation**: This is the tenant table itself - it defines tenants and is platform-wide. Each row represents a separate tenant/organization.

### 6. `domains`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Domains belong to specific tenants

### 7. `companies`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Companies belong to specific tenants (multi-company per tenant)

### 8. `tenant_invitations`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Invitations are sent within tenant context

### 9. `tenant_onboarding_progress`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants` (OneToOne)
- **Explanation**: Onboarding progress is tracked per tenant

### 10. `tenant_presets`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Presets are provisioned per tenant

---

## Accounting Module

### 11. `gl_account_types`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Account types are defined per tenant

### 12. `chart_of_accounts`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `account_type_id` → `accounting.gl_account_types` (nullable)
  - `parent_id` → `accounting.chart_of_accounts` (self-referential, nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Chart of accounts is tenant-specific

### 13. `journal_entries`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `created_by` → `authentication.users`
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Journal entries are tenant and company-scoped

### 14. `journal_entry_lines`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `journal_entry_id` → `accounting.journal_entries`
  - `account_id` → `accounting.chart_of_accounts`
- **Explanation**: Journal entry lines are tenant-scoped

### 15. `bank_reconciliations`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `bank_account_id` → `banking.bank_accounts`
  - `created_by` → `authentication.users`
  - `completed_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Bank reconciliations are tenant and company-scoped

### 16. `fiscal_years`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Fiscal years are tenant and company-scoped

### 17. `fiscal_periods`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `fiscal_year_id` → `accounting.fiscal_years`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Fiscal periods are tenant-scoped

### 18. `petty_cash_accounts`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `custodian_id` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Petty cash accounts are tenant and company-scoped

### 19. `petty_cash_transactions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `account_id` → `accounting.petty_cash_accounts`
  - `created_by` → `authentication.users`
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Petty cash transactions are tenant-scoped

### 20. `credit_debit_notes`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `customer_id` → `sales.customers` (nullable)
  - `supplier_id` → `purchase.suppliers` (nullable)
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Credit/debit notes are tenant and company-scoped

### 21. `accounting_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Accounting settings are tenant and optionally company-scoped

---

## Invoicing Module

### 22. `invoices`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `customer_id` → `sales.customers`
  - `template_id` → `invoicing.invoice_templates` (nullable)
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
- **Explanation**: Invoices are tenant and company-scoped

### 23. `invoice_lines`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `invoice_id` → `invoicing.invoices`
  - `created_by` → `authentication.users` (nullable)
  - `updated_by` → `authentication.users` (nullable)
- **Explanation**: Invoice lines are tenant-scoped

### 24. `invoice_templates`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Invoice templates are tenant-scoped

### 25. `invoice_payments`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `invoice_id` → `invoicing.invoices`
  - `created_by` → `authentication.users`
- **Explanation**: Invoice payments are tenant-scoped

### 26. `e_invoice_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: E-invoice settings are tenant-scoped

### 27. `e_invoice_submissions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `invoice_id` → `invoicing.invoices`
  - `created_by` → `authentication.users` (nullable)
- **Explanation**: E-invoice submissions are tenant-scoped

### 28. `invoice_compliance_rules`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Compliance rules are tenant-scoped

### 29. `compliance_violations`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `invoice_id` → `invoicing.invoices`
  - `rule_id` → `invoicing.invoice_compliance_rules`
  - `resolved_by` → `authentication.users` (nullable)
- **Explanation**: Compliance violations are tenant-scoped

### 30. `digital_certificates`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Digital certificates are tenant-scoped

### 31. `invoice_signatures`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `invoice_id` → `invoicing.invoices`
  - `certificate_id` → `invoicing.digital_certificates`
  - `signed_by` → `authentication.users`
- **Explanation**: Invoice signatures are tenant-scoped

### 32. `tax_codes`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Tax codes are tenant-scoped

### 33. `tax_rates`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `tax_code_id` → `invoicing.tax_codes` (nullable)
  - `created_by` → `authentication.users`
- **Explanation**: Tax rates are tenant-scoped

### 34. `tax_categories`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Tax categories are tenant-scoped

### 35. `invoicing_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
  - `default_template_id` → `invoicing.invoice_templates` (nullable)
- **Explanation**: Invoicing settings are tenant and optionally company-scoped

---

## Banking Module

### 36. `bank_accounts`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `gl_account_id` → `accounting.chart_of_accounts` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Bank accounts are tenant and company-scoped

### 37. `bank_transactions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `bank_account_id` → `banking.bank_accounts` (nullable)
  - `journal_entry_id` → `accounting.journal_entries` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Bank transactions are tenant-scoped

### 38. `bank_statements`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `bank_account_id` → `banking.bank_accounts` (nullable)
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Bank statements are tenant-scoped

### 39. `bank_integrations`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `bank_account_id` → `banking.bank_accounts`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Bank integrations are tenant-scoped

### 40. `plaid_connections`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `bank_account_id` → `banking.bank_accounts`
  - `integration_id` → `banking.bank_integrations` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Plaid connections are tenant-scoped

### 41. `import_export_jobs`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `bank_account_id` → `banking.bank_accounts` (nullable)
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Import/export jobs are tenant-scoped

### 42. `banking_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Banking settings are tenant and optionally company-scoped

---

## Sales Module

### 43. `customers`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Customers are tenant and company-scoped

### 44. `sales_orders`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `customer_id` → `sales.customers`
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Sales orders are tenant and company-scoped

### 45. `sales_order_lines`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `sales_order_id` → `sales.sales_orders`
  - `created_by` → `authentication.users` (nullable)
  - `updated_by` → `authentication.users` (nullable)
- **Explanation**: Sales order lines are tenant-scoped

### 46. `sales_quotes`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `customer_id` → `sales.customers`
  - `converted_to_order_id` → `sales.sales_orders` (nullable)
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Sales quotes are tenant and company-scoped

### 47. `sales_quote_lines`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `sales_quote_id` → `sales.sales_quotes`
  - `created_by` → `authentication.users` (nullable)
  - `updated_by` → `authentication.users` (nullable)
- **Explanation**: Sales quote lines are tenant-scoped

### 48. `sales_opportunities`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `customer_id` → `sales.customers`
  - `sales_person_id` → `authentication.users`
  - `assigned_to_id` → `authentication.users` (nullable)
  - `converted_to_quote_id` → `sales.sales_quotes` (nullable)
  - `converted_to_order_id` → `sales.sales_orders` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Sales opportunities are tenant and company-scoped

### 49. `sales_commissions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `sales_person_id` → `authentication.users`
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Sales commissions are tenant and company-scoped

### 50. `sales_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Sales settings are tenant and optionally company-scoped

---

## Purchase Module

### 51. `suppliers`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `created_by` → `authentication.users`
- **Explanation**: Suppliers are tenant and company-scoped

### 52. `purchase_orders`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `supplier_id` → `purchase.suppliers`
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Purchase orders are tenant and company-scoped

### 53. `purchase_order_lines`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `purchase_order_id` → `purchase.purchase_orders`
  - `item_id` → `inventory.items`
  - `created_by` → `authentication.users` (nullable)
  - `updated_by` → `authentication.users` (nullable)
- **Explanation**: Purchase order lines are tenant-scoped

### 54. `purchase_receipts`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `purchase_order_id` → `purchase.purchase_orders`
  - `warehouse_id` → `inventory.warehouses`
  - `supplier_id` → `purchase.suppliers`
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
- **Explanation**: Purchase receipts are tenant and company-scoped

### 55. `purchase_receipt_lines`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `purchase_receipt_id` → `purchase.purchase_receipts`
  - `purchase_order_line_id` → `purchase.purchase_order_lines`
  - `item_id` → `inventory.items`
  - `created_by` → `authentication.users` (nullable)
  - `updated_by` → `authentication.users` (nullable)
- **Explanation**: Purchase receipt lines are tenant-scoped

### 56. `purchase_payments`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `purchase_order_id` → `purchase.purchase_orders`
  - `supplier_id` → `purchase.suppliers`
  - `company_id` → `tenants.companies`
  - `created_by` → `authentication.users`
- **Explanation**: Purchase payments are tenant and company-scoped

### 57. `vendor_wallet_addresses`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `supplier_id` → `purchase.suppliers`
  - `verified_by` → `authentication.users` (nullable)
- **Explanation**: Vendor wallet addresses are tenant-scoped

### 58. `vendor_verification_logs`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `supplier_id` → `purchase.suppliers`
  - `verified_by` → `authentication.users` (nullable)
- **Explanation**: Vendor verification logs are tenant-scoped

### 59. `payment_blocks`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `supplier_id` → `purchase.suppliers`
  - `purchase_order_id` → `purchase.purchase_orders` (nullable)
  - `invoice_id` → `invoicing.invoices` (nullable)
  - `blocked_by` → `authentication.users` (nullable)
  - `resolved_by` → `authentication.users` (nullable)
- **Explanation**: Payment blocks are tenant-scoped

### 60. `purchase_approval_requests`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `purchase_order_id` → `purchase.purchase_orders`
  - `requested_by` → `authentication.users`
  - `approver_id` → `authentication.users` (nullable)
  - `approved_by` → `authentication.users` (nullable)
- **Explanation**: Purchase approval requests are tenant-scoped

### 61. `purchase_contracts`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `supplier_id` → `purchase.suppliers`
  - `approved_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
- **Explanation**: Purchase contracts are tenant and company-scoped

### 62. `purchase_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
  - `default_warehouse_id` → `inventory.warehouses` (nullable)
- **Explanation**: Purchase settings are tenant and optionally company-scoped

---

## FX Conversion Module

### 63. `currencies`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Currencies are tenant-scoped (each tenant has their own currency configuration)

### 64. `exchange_rates`
- **Tenant-Specific**: True (nullable)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
- **Explanation**: Exchange rates can be tenant-specific or global (when `tenant_id` is NULL)

### 65. `currency_conversions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `exchange_rate_id` → `fx_conversion.exchange_rates` (nullable)
  - `created_by` → `authentication.users` (nullable)
- **Explanation**: Currency conversions are tenant-scoped

### 66. `currency_configs`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants` (OneToOne)
- **Explanation**: Currency configuration is tenant-scoped (one config per tenant)

---

## Inventory Module

### 67. `item_categories`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `parent_id` → `inventory.item_categories` (self-referential, nullable)
- **Explanation**: Item categories are tenant-scoped

### 68. `items`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `category_id` → `inventory.item_categories` (nullable)
  - `gl_account_id` → `accounting.chart_of_accounts` (nullable)
- **Explanation**: Items are tenant and company-scoped

### 69. `inventory_movements`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `item_id` → `inventory.items`
  - `created_by` → `authentication.users`
- **Explanation**: Inventory movements are tenant and company-scoped

### 70. `warehouses`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `manager_id` → `authentication.users` (nullable)
- **Explanation**: Warehouses are tenant and company-scoped

### 71. `warehouse_stock`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `warehouse_id` → `inventory.warehouses`
  - `item_id` → `inventory.items`
- **Explanation**: Warehouse stock is tenant-scoped

### 72. `inventory_valuations`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `calculated_by` → `authentication.users`
- **Explanation**: Inventory valuations are tenant and company-scoped

### 73. `inventory_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
  - `default_warehouse_id` → `inventory.warehouses` (nullable)
- **Explanation**: Inventory settings are tenant and optionally company-scoped

---

## Documents Module

### 74. `document_files`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `folder_id` → `documents.document_folders` (nullable)
  - `uploaded_by` → `authentication.users`
- **Explanation**: Document files are tenant and company-scoped

### 75. `document_folders`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `parent_id` → `documents.document_folders` (self-referential, nullable)
  - `created_by` → `authentication.users`
- **Explanation**: Document folders are tenant-scoped

### 76. `document_templates`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Document templates are tenant-scoped

### 77. `document_versions`
- **Tenant-Specific**: True (via document)
- **Relations**:
  - `document_id` → `documents.document_files` (which has `tenant_id`)
  - `created_by` → `authentication.users`
- **Explanation**: Document versions are tenant-scoped through document relationship

### 78. `document_shares`
- **Tenant-Specific**: True (via document)
- **Relations**:
  - `document_id` → `documents.document_files` (which has `tenant_id`)
  - `shared_by` → `authentication.users`
  - `shared_with` → `authentication.users` (nullable)
- **Explanation**: Document shares are tenant-scoped through document relationship

### 79. `document_comments`
- **Tenant-Specific**: True (via document)
- **Relations**:
  - `document_id` → `documents.document_files` (which has `tenant_id`)
  - `user_id` → `authentication.users`
  - `parent_id` → `documents.document_comments` (self-referential, nullable)
- **Explanation**: Document comments are tenant-scoped through document relationship

### 80. `document_audit_logs`
- **Tenant-Specific**: True (via document)
- **Relations**:
  - `document_id` → `documents.document_files` (which has `tenant_id`)
  - `user_id` → `authentication.users`
- **Explanation**: Document audit logs are tenant-scoped through document relationship

### 81. `document_workflows`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Document workflows are tenant-scoped

### 82. `document_workflow_instances`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `workflow_id` → `documents.document_workflows`
  - `document_id` → `documents.document_files`
  - `started_by` → `authentication.users`
- **Explanation**: Document workflow instances are tenant-scoped

### 83. `document_workflow_steps`
- **Tenant-Specific**: True (via workflow instance)
- **Relations**:
  - `workflow_instance_id` → `documents.document_workflow_instances` (which has `tenant_id`)
  - `assigned_to` → `authentication.users` (nullable)
- **Explanation**: Document workflow steps are tenant-scoped through workflow instance

### 84. `document_storages`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users` (nullable)
- **Explanation**: Document storages are tenant-scoped

### 85. `document_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
  - `default_storage_id` → `documents.document_storages` (nullable)
  - `default_workflow_id` → `documents.document_workflows` (nullable)
- **Explanation**: Document settings are tenant and optionally company-scoped

---

## Reporting Module

### 86. `reports`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `created_by` → `authentication.users`
- **Explanation**: Reports are tenant and company-scoped

### 87. `report_templates`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Report templates are tenant-scoped

### 88. `scheduled_reports`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Scheduled reports are tenant-scoped

### 89. `report_executions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `scheduled_report_id` → `reporting.scheduled_reports` (nullable)
  - `report_id` → `reporting.reports` (nullable)
- **Explanation**: Report executions are tenant-scoped

### 90. `dashboards`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
- **Explanation**: Dashboards are tenant and user-scoped

### 91. `widgets`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Widgets are tenant-scoped

### 92. `tax_reports`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `created_by` → `authentication.users`
- **Explanation**: Tax reports are tenant and company-scoped

### 93. `compliance_reports`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `reviewed_by` → `authentication.users` (nullable)
  - `created_by` → `authentication.users`
- **Explanation**: Compliance reports are tenant and company-scoped

### 94. `report_exports`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `report_id` → `reporting.reports` (nullable)
  - `tax_report_id` → `reporting.tax_reports` (nullable)
  - `compliance_report_id` → `reporting.compliance_reports` (nullable)
  - `created_by` → `authentication.users`
- **Explanation**: Report exports are tenant-scoped

### 95. `reporting_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies` (nullable)
- **Explanation**: Reporting settings are tenant and optionally company-scoped

---

## Tax Optimization Module

### 96. `tax_events`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
  - `updated_by` → `authentication.users`
- **Explanation**: Tax events are tenant-scoped

### 97. `tax_optimization_strategies`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `applicable_events` → `tax_optimization.tax_events` (ManyToMany)
  - `created_by` → `authentication.users` (nullable)
  - `approved_by` → `authentication.users` (nullable)
- **Explanation**: Tax optimization strategies are tenant-scoped

### 98. `tax_year_summaries`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users` (nullable)
- **Explanation**: Tax year summaries are tenant-scoped

### 99. `tax_alerts`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `related_event_id` → `tax_optimization.tax_events` (nullable)
  - `related_strategy_id` → `tax_optimization.tax_optimization_strategies` (nullable)
- **Explanation**: Tax alerts are tenant-scoped

### 100. `tax_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants` (OneToOne)
- **Explanation**: Tax settings are tenant-scoped (one config per tenant)

---

## ERP Integration Module

### 101. `erp_connections`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users` (nullable)
- **Explanation**: ERP connections are tenant-scoped

### 102. `erp_sync_logs`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `connection_id` → `erp_integration.erp_connections`
  - `created_by` → `authentication.users` (nullable)
- **Explanation**: ERP sync logs are tenant-scoped

### 103. `erp_mappings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `connection_id` → `erp_integration.erp_connections`
- **Explanation**: ERP mappings are tenant-scoped

---

## Web3 Integration Module

### 104. `crypto_wallets`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
- **Explanation**: Crypto wallets are tenant and user-scoped

### 105. `crypto_transactions`
- **Tenant-Specific**: True (via wallet)
- **Relations**:
  - `wallet_id` → `web3_integration.crypto_wallets` (which has `tenant_id`)
- **Explanation**: Crypto transactions are tenant-scoped through wallet relationship

### 106. `smart_contracts`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `created_by` → `authentication.users`
- **Explanation**: Smart contracts are tenant-scoped

### 107. `defi_protocols`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: DeFi protocols are tenant-scoped

### 108. `defi_positions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
  - `protocol_id` → `web3_integration.defi_protocols`
  - `wallet_id` → `web3_integration.crypto_wallets`
- **Explanation**: DeFi positions are tenant and user-scoped

### 109. `token_prices`
- **Tenant-Specific**: **False**
- **Relations**: None
- **Explanation**: Token prices are global market data shared across all tenants. Prices are fetched from external APIs and are not tenant-specific.

### 110. `web3_integration_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Web3 integration settings are tenant-scoped

---

## AI Processing Module

### 111. `documents` (AI Processing)
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `company_id` → `tenants.companies`
  - `uploaded_by` → `authentication.users`
  - `processed_by` → `authentication.users` (nullable)
- **Explanation**: Documents are tenant and company-scoped

### 112. `ai_categorizations`
- **Tenant-Specific**: True (via document)
- **Relations**:
  - `document_id` → `ai_processing.documents` (which has `tenant_id`)
- **Explanation**: AI categorizations are tenant-scoped through document relationship

### 113. `ai_extraction_results`
- **Tenant-Specific**: True (via document)
- **Relations**:
  - `document_id` → `ai_processing.documents` (which has `tenant_id`)
- **Explanation**: AI extraction results are tenant-scoped through document relationship

### 114. `ai_processing_jobs`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `documents` → `ai_processing.documents` (ManyToMany, which have `tenant_id`)
  - `created_by` → `authentication.users`
- **Explanation**: AI processing jobs are tenant-scoped

### 115. `ai_models`
- **Tenant-Specific**: **False**
- **Relations**: None
- **Explanation**: AI models are platform-wide configurations. These are the available AI models (OpenAI, Google, etc.) that can be used by any tenant. Model definitions are shared across the platform.

### 116. `ai_processing_logs`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `job_id` → `ai_processing.ai_processing_jobs` (nullable)
  - `document_id` → `ai_processing.documents` (nullable)
- **Explanation**: AI processing logs are tenant-scoped

---

## Marketing Forms Module

### 117. `beta_program_applications`
- **Tenant-Specific**: True (nullable)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
  - `assigned_to` → `authentication.users` (nullable)
- **Explanation**: Beta applications can be created before tenant signup (nullable tenant_id), but once assigned to a tenant, they become tenant-scoped

### 118. `early_access_requests`
- **Tenant-Specific**: True (nullable)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
  - `assigned_to` → `authentication.users` (nullable)
- **Explanation**: Early access requests can be created before tenant signup (nullable tenant_id), but once assigned to a tenant, they become tenant-scoped

### 119. `founder_feedback`
- **Tenant-Specific**: True (nullable)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
  - `assigned_to` → `authentication.users` (nullable)
- **Explanation**: Founder feedback can be submitted before tenant signup (nullable tenant_id), but once assigned to a tenant, they become tenant-scoped

---

## Contact Sales Module

### 120. `sales_inquiries`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `assigned_to` → `authentication.users` (nullable)
- **Explanation**: Sales inquiries are tenant-scoped

### 121. `sales_inquiry_responses`
- **Tenant-Specific**: True (via inquiry)
- **Relations**:
  - `inquiry_id` → `contact_sales.sales_inquiries` (which has `tenant_id`)
  - `responded_by` → `authentication.users`
- **Explanation**: Sales inquiry responses are tenant-scoped through inquiry relationship

### 122. `sales_inquiry_attachments`
- **Tenant-Specific**: True (via inquiry)
- **Relations**:
  - `inquiry_id` → `contact_sales.sales_inquiries` (which has `tenant_id`)
  - `uploaded_by` → `authentication.users` (nullable)
- **Explanation**: Sales inquiry attachments are tenant-scoped through inquiry relationship

---

## Platform Admin Module

### 123. `system_settings`
- **Tenant-Specific**: **False**
- **Relations**: None
- **Explanation**: System settings are platform-wide configurations that apply to all tenants. Examples include platform features, global limits, and system-wide preferences.

### 124. `audit_logs`
- **Tenant-Specific**: True (nullable)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
  - `user_id` → `authentication.users` (nullable)
- **Explanation**: Audit logs can be tenant-specific (when `tenant_id` is set) or platform-wide (when `tenant_id` is NULL for system-level events)

### 125. `backups`
- **Tenant-Specific**: **False**
- **Relations**:
  - `created_by` → `authentication.users`
- **Explanation**: Backups are platform-wide operations. While backups may contain tenant-specific data, the backup records themselves are managed at the platform level.

### 126. `maintenance_windows`
- **Tenant-Specific**: **False**
- **Relations**:
  - `created_by` → `authentication.users`
- **Explanation**: Maintenance windows are platform-wide. When maintenance is scheduled, it affects all tenants on the platform.

### 127. `system_health`
- **Tenant-Specific**: **False**
- **Relations**: None
- **Explanation**: System health monitoring is platform-wide. It tracks the health of shared infrastructure, services, and resources that all tenants depend on.

### 128. `security_events`
- **Tenant-Specific**: True (nullable)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
  - `user_id` → `authentication.users` (nullable)
  - `resolved_by` → `authentication.users` (nullable)
- **Explanation**: Security events can be tenant-specific (when `tenant_id` is set) or platform-wide (when `tenant_id` is NULL for system-level security events)

### 129. `system_metrics`
- **Tenant-Specific**: **False**
- **Relations**: None
- **Explanation**: System metrics are platform-wide performance and resource metrics. These track overall system health, not per-tenant metrics.

### 130. `api_keys`
- **Tenant-Specific**: True (nullable)
- **Relations**:
  - `tenant_id` → `tenants.tenants` (nullable)
  - `user_id` → `authentication.users`
- **Explanation**: API keys can be tenant-specific (when `tenant_id` is set) or platform-wide (when `tenant_id` is NULL for platform admin API keys)

### 131. `admin_settings`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Admin settings are tenant-scoped configurations for tenant administrators

---

## Mobile Module

### 132. `mobile_devices`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
- **Explanation**: Mobile devices are tenant and user-scoped

### 133. `mobile_notifications`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
  - `device_id` → `mobile.mobile_devices` (nullable)
- **Explanation**: Mobile notifications are tenant and user-scoped

### 134. `mobile_sessions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
  - `device_id` → `mobile.mobile_devices`
- **Explanation**: Mobile sessions are tenant and user-scoped

### 135. `mobile_app_versions`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Mobile app versions are tenant-scoped (allows different tenants to have different app version requirements)

### 136. `mobile_feature_flags`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
- **Explanation**: Mobile feature flags are tenant-scoped (allows feature rollouts per tenant)

### 137. `mobile_analytics`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
  - `device_id` → `mobile.mobile_devices`
- **Explanation**: Mobile analytics are tenant and user-scoped

### 138. `mobile_offline_data`
- **Tenant-Specific**: True
- **Relations**:
  - `tenant_id` → `tenants.tenants`
  - `user_id` → `authentication.users`
  - `device_id` → `mobile.mobile_devices`
- **Explanation**: Mobile offline data is tenant and user-scoped

---

## Summary Statistics

- **Total Tables**: 138
- **Tenant-Specific Tables**: 133
- **Platform-Wide Tables**: 5
  - `tenants` (defines tenants)
  - `token_prices` (global market data)
  - `ai_models` (platform-wide AI model definitions)
  - `system_settings` (platform-wide settings)
  - `system_health` (platform-wide health monitoring)
  - `system_metrics` (platform-wide metrics)
  - `backups` (platform-wide backup operations)
  - `maintenance_windows` (platform-wide maintenance)

- **Tables with Nullable Tenant ID**: 4
  - `users` (platform admins may have NULL tenant)
  - `audit_logs` (can be platform-wide or tenant-specific)
  - `security_events` (can be platform-wide or tenant-specific)
  - `api_keys` (can be platform-wide or tenant-specific)
  - `exchange_rates` (can be global or tenant-specific)
  - `beta_program_applications` (nullable before tenant assignment)
  - `early_access_requests` (nullable before tenant assignment)
  - `founder_feedback` (nullable before tenant assignment)

---

## Notes

1. **Tenant Isolation**: All tenant-specific tables enforce data isolation through the `tenant_id` foreign key. Queries are automatically filtered by tenant through middleware and model managers.

2. **Company-Scoped Data**: Many tables have both `tenant_id` and `company_id` foreign keys, allowing multi-company support within a single tenant.

3. **User-Scoped Data**: Some tables are scoped through the `user` relationship, which itself has a `tenant_id`, ensuring tenant isolation.

4. **Platform-Wide Tables**: The few platform-wide tables are necessary for:
   - Tenant management (`tenants`)
   - Global market data (`token_prices`)
   - Platform infrastructure (`system_settings`, `system_health`, `system_metrics`, `backups`, `maintenance_windows`)
   - Shared AI model definitions (`ai_models`)

5. **Nullable Tenant ID**: Some tables allow `tenant_id` to be NULL to support:
   - Platform administrators who don't belong to a specific tenant
   - Platform-wide audit logs and security events
   - Global exchange rates
   - Pre-signup marketing forms

---

## Database Relationships Diagram

```
tenants (platform-wide)
  ├── users (tenant_id nullable for platform admins)
  ├── companies
  ├── domains
  ├── tenant_invitations
  ├── tenant_onboarding_progress (OneToOne)
  ├── tenant_presets
  │
  ├── accounting.* (all tenant-scoped)
  ├── invoicing.* (all tenant-scoped)
  ├── banking.* (all tenant-scoped)
  ├── sales.* (all tenant-scoped)
  ├── purchase.* (all tenant-scoped)
  ├── fx_conversion.* (all tenant-scoped)
  ├── inventory.* (all tenant-scoped)
  ├── documents.* (all tenant-scoped)
  ├── reporting.* (all tenant-scoped)
  ├── tax_optimization.* (all tenant-scoped)
  ├── erp_integration.* (all tenant-scoped)
  ├── web3_integration.* (mostly tenant-scoped, except token_prices)
  ├── ai_processing.* (mostly tenant-scoped, except ai_models)
  ├── marketing_forms.* (tenant_id nullable)
  ├── contact_sales.* (all tenant-scoped)
  ├── platform_admin.* (mixed: some platform-wide, some tenant-scoped)
  └── mobile.* (all tenant-scoped)
```

---

*Last Updated: 2024*
*Document Version: 1.0*

