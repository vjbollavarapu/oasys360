# OASYS360 Database Schema Documentation

## Overview
This document provides a comprehensive overview of the OASYS360 database schema, including all tables, their structure, foreign keys, and indexes. The database implements a row-based multi-tenant architecture with 50 tables.

## Database Architecture

### Multi-Tenancy Model
- **Row-based Multi-tenancy**: All business logic tables include a `tenant_id` foreign key
- **Tenant Isolation**: Data is isolated at the row level using tenant-specific filtering
- **Global Models**: Core system models (tenants, users, domains, companies) are shared across the platform

### Key Design Principles
1. **Tenant Isolation**: Every business record belongs to a specific tenant
2. **Audit Trail**: All models include created_by, updated_by, and timestamp fields
3. **Data Classification**: Sensitive data includes classification and retention policies
4. **UUID Primary Keys**: All business models use UUID primary keys for security
5. **Comprehensive Indexing**: Optimized indexes for tenant-based queries

## Core System Tables

### 1. Tenants & Authentication
- **tenants**: Core tenant information
- **domains**: Tenant domain mappings
- **companies**: Business entities within tenants
- **users**: System users with tenant association
- **user_profiles**: Extended user information
- **tenant_invitations**: User invitation system

### 2. Business Logic Tables

#### Accounting Module
- **chart_of_accounts**: General ledger accounts
- **journal_entries**: Financial transaction records
- **journal_entry_lines**: Individual journal entry line items
- **bank_reconciliations**: Bank statement reconciliation

#### Banking Module
- **bank_accounts**: Bank account information
- **bank_transactions**: Individual bank transactions
- **bank_statements**: Bank statement imports
- **bank_integrations**: Bank API connections

#### Inventory Module
- **item_categories**: Product/service categories
- **items**: Inventory items/products
- **inventory_movements**: Stock movement tracking
- **warehouses**: Storage locations
- **warehouse_stock**: Stock levels by warehouse

#### Sales Module
- **customers**: Customer information
- **sales_orders**: Sales order records
- **sales_order_lines**: Sales order line items
- **sales_quotes**: Sales quote records
- **sales_quote_lines**: Sales quote line items

#### Purchase Module
- **suppliers**: Supplier information
- **purchase_orders**: Purchase order records
- **purchase_order_lines**: Purchase order line items
- **purchase_receipts**: Goods received records
- **purchase_receipt_lines**: Receipt line items
- **purchase_payments**: Supplier payments

#### Invoicing Module
- **invoices**: Invoice records
- **invoice_lines**: Invoice line items
- **invoice_templates**: Invoice templates
- **invoice_payments**: Invoice payments
- **e_invoice_settings**: Electronic invoicing configuration

#### Reporting Module
- **reports**: Generated reports
- **report_templates**: Report templates
- **scheduled_reports**: Automated report scheduling
- **report_executions**: Report execution history
- **dashboards**: User dashboards
- **widgets**: Dashboard widgets

## Table Structure Details

### Core Tenant Tables

#### tenants
- **Primary Key**: id (UUID)
- **Unique Fields**: slug
- **Key Fields**: name, slug, plan, is_active, max_users, max_storage_gb
- **Indexes**: slug (unique), is_active
- **Purpose**: Core tenant information and configuration

#### users
- **Primary Key**: id (UUID)
- **Foreign Keys**: tenant_id → tenants.id
- **Unique Fields**: username, email
- **Key Fields**: email, role, permissions, is_active
- **Indexes**: username (unique), email (unique), tenant_id
- **Purpose**: System users with tenant association

#### companies
- **Primary Key**: id (bigint)
- **Foreign Keys**: tenant_id → tenants.id
- **Key Fields**: name, legal_name, tax_id, address, currency, timezone
- **Indexes**: tenant_id, is_primary
- **Purpose**: Business entities within tenants

### Business Logic Tables

#### Accounting Tables

##### chart_of_accounts
- **Primary Key**: id (UUID)
- **Foreign Keys**: tenant_id → tenants.id, parent_id → chart_of_accounts.id
- **Key Fields**: code, name, type, normal_balance, is_active
- **Indexes**: tenant_id, parent_id
- **Purpose**: General ledger chart of accounts

##### journal_entries
- **Primary Key**: id (UUID)
- **Foreign Keys**: tenant_id → tenants.id, company_id → companies.id
- **Key Fields**: date, reference, description, status, entry_type
- **Indexes**: tenant_id, company_id, created_by_id
- **Purpose**: Financial transaction journal entries

#### Sales Tables

##### customers
- **Primary Key**: id (UUID)
- **Foreign Keys**: tenant_id → tenants.id, company_id → companies.id
- **Key Fields**: name, email, phone, address, credit_limit, payment_terms
- **Indexes**: tenant_id, company_id
- **Purpose**: Customer information and credit management

##### sales_orders
- **Primary Key**: id (UUID)
- **Foreign Keys**: tenant_id → tenants.id, customer_id → customers.id
- **Key Fields**: order_number, order_date, status, total_amount, currency
- **Indexes**: order_number (unique), tenant_id, customer_id
- **Purpose**: Sales order management

#### Inventory Tables

##### items
- **Primary Key**: id (UUID)
- **Foreign Keys**: tenant_id → tenants.id, category_id → item_categories.id
- **Key Fields**: sku, name, description, cost_price, selling_price, current_stock
- **Indexes**: sku (unique), tenant_id, category_id
- **Purpose**: Inventory item management

##### warehouses
- **Primary Key**: id (UUID)
- **Foreign Keys**: tenant_id → tenants.id, company_id → companies.id
- **Key Fields**: name, code, address, is_primary, is_active
- **Indexes**: tenant_id, company_id, code (unique per tenant)
- **Purpose**: Warehouse and storage location management

## Foreign Key Relationships

### Tenant Relationships
All business logic tables include:
- `tenant_id` → `tenants.id` (required for multi-tenancy)
- `company_id` → `companies.id` (business entity association)
- `created_by_id` → `users.id` (audit trail)
- `updated_by_id` → `users.id` (audit trail)

### Business Logic Relationships
- **Sales**: customers → sales_orders → sales_order_lines
- **Purchase**: suppliers → purchase_orders → purchase_order_lines
- **Inventory**: items → inventory_movements, warehouse_stock
- **Accounting**: chart_of_accounts → journal_entries → journal_entry_lines
- **Invoicing**: customers → invoices → invoice_lines

## Indexing Strategy

### Primary Indexes
- **Primary Keys**: All tables have UUID or bigint primary keys
- **Unique Constraints**: Business keys (order numbers, SKUs, emails)
- **Tenant Indexes**: Every business table has tenant_id index

### Performance Indexes
- **Composite Indexes**: tenant_id + company_id for multi-tenant queries
- **Foreign Key Indexes**: All foreign keys are indexed
- **Search Indexes**: Text fields have pattern matching indexes
- **Audit Indexes**: created_by_id, updated_by_id for audit queries

### Multi-Tenant Optimization
- **Tenant-First Indexing**: tenant_id is the first column in composite indexes
- **Isolation Indexes**: tenant_id + is_active for active record queries
- **Business Key Indexes**: tenant_id + business_key for unique constraints

## Data Classification & Security

### Audit Fields
All business tables include:
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp
- `created_by_id`: User who created the record
- `updated_by_id`: User who last modified the record

### Data Classification
Sensitive tables include:
- `data_classification`: Data sensitivity level
- `requires_audit`: Audit requirement flag
- `retention_period_days`: Data retention policy
- `is_sensitive`: Sensitive data flag

### Security Features
- **Row-Level Security**: Tenant isolation at database level
- **Audit Logging**: Complete audit trail for all changes
- **Data Retention**: Configurable retention policies
- **Access Control**: Role-based permissions system

## Database Statistics

- **Total Tables**: 50
- **Business Logic Tables**: 35
- **System Tables**: 15
- **Total Indexes**: 200+
- **Foreign Key Relationships**: 100+

## Migration History

The database has been migrated from schema-based to row-based multi-tenancy:
- **Initial Migration**: Core tenant and authentication tables
- **Business Logic Migration**: All business modules with tenant_id
- **Index Optimization**: Performance indexes for multi-tenant queries
- **Audit Enhancement**: Complete audit trail implementation

## Performance Considerations

### Query Optimization
- **Tenant-First Queries**: Always filter by tenant_id first
- **Composite Indexes**: Optimized for common query patterns
- **Pagination**: Efficient pagination for large datasets
- **Caching**: Redis caching for frequently accessed data

### Scalability
- **Horizontal Scaling**: Tenant-based data partitioning
- **Index Maintenance**: Regular index optimization
- **Query Monitoring**: Performance monitoring and optimization
- **Backup Strategy**: Tenant-aware backup and recovery

## Recent Schema Improvements

### Tenant-Scoped Uniqueness ✅ COMPLETED
All business models now enforce **per-tenant uniqueness**:

- **Users model**  
  - `email` remains globally unique (required for USERNAME_FIELD)
  - `username` is now tenant-scoped: `(tenant_id, username)`

- **SalesOrders**  
  - `order_number` is now tenant-scoped: `(tenant_id, order_number)`

- **SalesQuotes**  
  - `quote_number` is now tenant-scoped: `(tenant_id, quote_number)`

- **PurchaseOrders**  
  - `order_number` is now tenant-scoped: `(tenant_id, order_number)`

- **PurchaseReceipts**  
  - `receipt_number` is now tenant-scoped: `(tenant_id, receipt_number)`

- **Invoices**  
  - `invoice_number` is now tenant-scoped: `(tenant_id, invoice_number)`

- **Items**  
  - `sku` is now tenant-scoped: `(tenant_id, company_id, sku)`

### Index Optimization ✅ COMPLETED
- Composite indexes are optimized for tenant-based queries
- Single-column indexes are maintained where needed for performance
- All foreign key relationships are properly indexed

### Audit Consistency ✅ COMPLETED
All models now include comprehensive audit fields:

- **Base Models** (TenantScopedModel, FinancialModel):
  ```python
  created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, related_name='created_%(class)s_set')
  updated_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, related_name='updated_%(class)s_set')
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  ```

- **Line Item Models** (SalesOrderLine, PurchaseOrderLine, InvoiceLine, etc.):
  - Added `created_by` and `updated_by` fields for complete audit trail
  - All line items now have full audit tracking

### Migration History
The database has been updated with the following migrations:
- **authentication.0002**: Added tenant-scoped username uniqueness
- **inventory.0002**: Removed global SKU uniqueness constraint
- **sales.0002**: Added tenant-scoped order_number and quote_number constraints
- **sales.0003**: Added audit fields to line item models
- **purchase.0002**: Added tenant-scoped order_number and receipt_number constraints
- **purchase.0003**: Added audit fields to line item models
- **invoicing.0003**: Added tenant-scoped invoice_number constraint
- **invoicing.0004**: Added audit fields to line item models

This database schema provides a robust foundation for a multi-tenant business management platform with comprehensive audit trails, security, and performance optimization.

