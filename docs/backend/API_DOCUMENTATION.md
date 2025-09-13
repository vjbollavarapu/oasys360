# OASYS Platform - API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Multi-tenancy](#multi-tenancy)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

## 🌟 Overview

OASYS Platform is a comprehensive business management system that provides:

- **Multi-tenant Architecture**: Complete data isolation between organizations
- **Financial Management**: Advanced accounting, invoicing, and banking
- **Sales & Purchase Management**: Complete CRM and procurement workflows
- **AI-Powered Document Processing**: OCR, categorization, and data extraction
- **Web3 Integration**: Cryptocurrency wallets, DeFi protocols, and blockchain
- **Advanced Reporting**: Real-time analytics and financial reports

### Base URL
```
Production: https://api.oasys-platform.com
Development: http://localhost:8000
```

### API Version
All endpoints are prefixed with `/api/v1/`

## 🔐 Authentication

OASYS Platform uses JWT (JSON Web Tokens) for authentication.

### Login
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
    "username": "user@example.com",
    "email": "user@example.com",
    "password": "your_password"
}
```

**Response:**
```json
{
    "tokens": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    },
    "user": {
        "id": "uuid",
        "username": "user@example.com",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "accountant",
        "tenant": "tenant_uuid"
    }
}
```

### Using JWT Token
Include the token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

## 🏢 Multi-tenancy

All data is automatically scoped to the authenticated user's tenant. Users can only access data within their organization.

### Tenant Isolation
- All API responses are filtered by tenant
- Cross-tenant data access is prevented
- Each tenant has isolated storage and configurations

## 📡 API Endpoints

### Authentication Endpoints

#### Login
- **POST** `/api/v1/auth/login/`
- **Description**: Authenticate user and get JWT tokens
- **Permissions**: Public

#### Register
- **POST** `/api/v1/auth/register/`
- **Description**: Register new user account
- **Permissions**: Public

#### User Profile
- **GET** `/api/v1/auth/profile/`
- **Description**: Get current user profile
- **Permissions**: Authenticated

#### Update Profile
- **PATCH** `/api/v1/auth/profile/`
- **Description**: Update user profile
- **Permissions**: Authenticated

#### Password Change
- **POST** `/api/v1/auth/password/change/`
- **Description**: Change user password
- **Permissions**: Authenticated

#### Logout
- **POST** `/api/v1/auth/logout/`
- **Description**: Logout and invalidate tokens
- **Permissions**: Authenticated

### Tenant Management Endpoints

#### Tenant Dashboard
- **GET** `/api/v1/tenants/dashboard/`
- **Description**: Get tenant dashboard with statistics
- **Permissions**: Authenticated

#### Tenant Statistics
- **GET** `/api/v1/tenants/stats/`
- **Description**: Get tenant statistics
- **Permissions**: Authenticated

#### Company Management
- **GET** `/api/v1/tenants/companies/`
- **POST** `/api/v1/tenants/companies/`
- **GET** `/api/v1/tenants/companies/{id}/`
- **PATCH** `/api/v1/tenants/companies/{id}/`
- **DELETE** `/api/v1/tenants/companies/{id}/`
- **Description**: Manage tenant companies
- **Permissions**: Firm Admin, Tenant Admin

### Accounting Endpoints

#### Chart of Accounts
- **GET** `/api/v1/accounting/accounts/`
- **POST** `/api/v1/accounting/accounts/`
- **GET** `/api/v1/accounting/accounts/{id}/`
- **PATCH** `/api/v1/accounting/accounts/{id}/`
- **DELETE** `/api/v1/accounting/accounts/{id}/`
- **Description**: Manage chart of accounts
- **Permissions**: Accountant, CFO

#### Journal Entries
- **GET** `/api/v1/accounting/journal-entries/`
- **POST** `/api/v1/accounting/journal-entries/`
- **GET** `/api/v1/accounting/journal-entries/{id}/`
- **PATCH** `/api/v1/accounting/journal-entries/{id}/`
- **DELETE** `/api/v1/accounting/journal-entries/{id}/`
- **Description**: Manage journal entries
- **Permissions**: Accountant, CFO

#### Post Journal Entry
- **POST** `/api/v1/accounting/journal-entries/{id}/post/`
- **Description**: Post a journal entry
- **Permissions**: Accountant, CFO

#### Financial Reports
- **GET** `/api/v1/accounting/trial-balance/`
- **GET** `/api/v1/accounting/income-statement/`
- **GET** `/api/v1/accounting/balance-sheet/`
- **Description**: Generate financial reports
- **Permissions**: Accountant, CFO

### Invoicing Endpoints

#### Invoices
- **GET** `/api/v1/invoicing/invoices/`
- **POST** `/api/v1/invoicing/invoices/`
- **GET** `/api/v1/invoicing/invoices/{id}/`
- **PATCH** `/api/v1/invoicing/invoices/{id}/`
- **DELETE** `/api/v1/invoicing/invoices/{id}/`
- **Description**: Manage invoices
- **Permissions**: Accountant, Staff

#### Invoice Templates
- **GET** `/api/v1/invoicing/templates/`
- **POST** `/api/v1/invoicing/templates/`
- **GET** `/api/v1/invoicing/templates/{id}/`
- **PATCH** `/api/v1/invoicing/templates/{id}/`
- **DELETE** `/api/v1/invoicing/templates/{id}/`
- **Description**: Manage invoice templates
- **Permissions**: Accountant

#### Invoice Payments
- **GET** `/api/v1/invoicing/payments/`
- **POST** `/api/v1/invoicing/payments/`
- **GET** `/api/v1/invoicing/payments/{id}/`
- **PATCH** `/api/v1/invoicing/payments/{id}/`
- **DELETE** `/api/v1/invoicing/payments/{id}/`
- **Description**: Manage invoice payments
- **Permissions**: Accountant

#### Invoice Workflows
- **POST** `/api/v1/invoicing/invoices/{id}/approve/`
- **POST** `/api/v1/invoicing/invoices/{id}/send/`
- **Description**: Invoice approval and sending workflows
- **Permissions**: Accountant, Firm Admin

#### Invoice Statistics
- **GET** `/api/v1/invoicing/stats/`
- **Description**: Get invoice statistics
- **Permissions**: Accountant, CFO

### Banking Endpoints

#### Bank Accounts
- **GET** `/api/v1/banking/accounts/`
- **POST** `/api/v1/banking/accounts/`
- **GET** `/api/v1/banking/accounts/{id}/`
- **PATCH** `/api/v1/banking/accounts/{id}/`
- **DELETE** `/api/v1/banking/accounts/{id}/`
- **Description**: Manage bank accounts
- **Permissions**: Accountant

#### Bank Transactions
- **GET** `/api/v1/banking/transactions/`
- **POST** `/api/v1/banking/transactions/`
- **GET** `/api/v1/banking/transactions/{id}/`
- **PATCH** `/api/v1/banking/transactions/{id}/`
- **DELETE** `/api/v1/banking/transactions/{id}/`
- **Description**: Manage bank transactions
- **Permissions**: Accountant

#### Bank Reconciliation
- **GET** `/api/v1/banking/reconciliation/`
- **POST** `/api/v1/banking/reconciliation/`
- **Description**: Bank reconciliation
- **Permissions**: Accountant

#### Banking Statistics
- **GET** `/api/v1/banking/stats/`
- **Description**: Get banking statistics
- **Permissions**: Accountant, CFO

### Sales Endpoints

#### Customers
- **GET** `/api/v1/sales/customers/`
- **POST** `/api/v1/sales/customers/`
- **GET** `/api/v1/sales/customers/{id}/`
- **PATCH** `/api/v1/sales/customers/{id}/`
- **DELETE** `/api/v1/sales/customers/{id}/`
- **Description**: Manage customers
- **Permissions**: Staff, Accountant

#### Sales Orders
- **GET** `/api/v1/sales/orders/`
- **POST** `/api/v1/sales/orders/`
- **GET** `/api/v1/sales/orders/{id}/`
- **PATCH** `/api/v1/sales/orders/{id}/`
- **DELETE** `/api/v1/sales/orders/{id}/`
- **Description**: Manage sales orders
- **Permissions**: Staff, Accountant

#### Sales Quotes
- **GET** `/api/v1/sales/quotes/`
- **POST** `/api/v1/sales/quotes/`
- **GET** `/api/v1/sales/quotes/{id}/`
- **PATCH** `/api/v1/sales/quotes/{id}/`
- **DELETE** `/api/v1/sales/quotes/{id}/`
- **Description**: Manage sales quotes
- **Permissions**: Staff, Accountant

#### Sales Workflows
- **POST** `/api/v1/sales/orders/{id}/approve/`
- **POST** `/api/v1/sales/orders/{id}/ship/`
- **POST** `/api/v1/sales/quotes/{id}/approve/`
- **POST** `/api/v1/sales/quotes/{id}/convert/`
- **Description**: Sales order and quote workflows
- **Permissions**: Staff, Accountant

#### Sales Statistics
- **GET** `/api/v1/sales/stats/`
- **Description**: Get sales statistics
- **Permissions**: Staff, Accountant, CFO

### Purchase Endpoints

#### Suppliers
- **GET** `/api/v1/purchase/suppliers/`
- **POST** `/api/v1/purchase/suppliers/`
- **GET** `/api/v1/purchase/suppliers/{id}/`
- **PATCH** `/api/v1/purchase/suppliers/{id}/`
- **DELETE** `/api/v1/purchase/suppliers/{id}/`
- **Description**: Manage suppliers
- **Permissions**: Staff, Accountant

#### Purchase Orders
- **GET** `/api/v1/purchase/orders/`
- **POST** `/api/v1/purchase/orders/`
- **GET** `/api/v1/purchase/orders/{id}/`
- **PATCH** `/api/v1/purchase/orders/{id}/`
- **DELETE** `/api/v1/purchase/orders/{id}/`
- **Description**: Manage purchase orders
- **Permissions**: Staff, Accountant

#### Purchase Receipts
- **GET** `/api/v1/purchase/receipts/`
- **POST** `/api/v1/purchase/receipts/`
- **GET** `/api/v1/purchase/receipts/{id}/`
- **PATCH** `/api/v1/purchase/receipts/{id}/`
- **DELETE** `/api/v1/purchase/receipts/{id}/`
- **Description**: Manage purchase receipts
- **Permissions**: Staff, Accountant

#### Purchase Workflows
- **POST** `/api/v1/purchase/orders/{id}/approve/`
- **POST** `/api/v1/purchase/orders/{id}/receive/`
- **POST** `/api/v1/purchase/receipts/{id}/approve/`
- **Description**: Purchase order and receipt workflows
- **Permissions**: Staff, Accountant

#### Purchase Statistics
- **GET** `/api/v1/purchase/stats/`
- **Description**: Get purchase statistics
- **Permissions**: Staff, Accountant, CFO

### AI Processing Endpoints

#### Documents
- **GET** `/api/v1/ai/documents/`
- **POST** `/api/v1/ai/documents/`
- **GET** `/api/v1/ai/documents/{id}/`
- **PATCH** `/api/v1/ai/documents/{id}/`
- **DELETE** `/api/v1/ai/documents/{id}/`
- **Description**: Manage documents
- **Permissions**: Staff, Accountant

#### Document Upload
- **POST** `/api/v1/ai/upload/`
- **Description**: Upload document for AI processing
- **Permissions**: Staff, Accountant

#### Document Processing
- **POST** `/api/v1/ai/process/{id}/`
- **Description**: Process document with AI
- **Permissions**: Staff, Accountant

#### AI Categorization
- **GET** `/api/v1/ai/categorization/`
- **POST** `/api/v1/ai/categorization/`
- **GET** `/api/v1/ai/categorization/{id}/`
- **Description**: AI document categorization
- **Permissions**: Staff, Accountant

#### AI Extraction
- **GET** `/api/v1/ai/extraction/`
- **POST** `/api/v1/ai/extraction/`
- **GET** `/api/v1/ai/extraction/{id}/`
- **Description**: AI data extraction
- **Permissions**: Staff, Accountant

#### AI Models
- **GET** `/api/v1/ai/models/`
- **POST** `/api/v1/ai/models/`
- **GET** `/api/v1/ai/models/{id}/`
- **PATCH** `/api/v1/ai/models/{id}/`
- **DELETE** `/api/v1/ai/models/{id}/`
- **Description**: Manage AI models
- **Permissions**: Platform Admin

#### AI Statistics
- **GET** `/api/v1/ai/stats/`
- **Description**: Get AI processing statistics
- **Permissions**: Staff, Accountant

### Web3 Integration Endpoints

#### Crypto Wallets
- **GET** `/api/v1/web3/wallets/`
- **POST** `/api/v1/web3/wallets/`
- **GET** `/api/v1/web3/wallets/{id}/`
- **PATCH** `/api/v1/web3/wallets/{id}/`
- **DELETE** `/api/v1/web3/wallets/{id}/`
- **Description**: Manage cryptocurrency wallets
- **Permissions**: Accountant, CFO

#### Crypto Transactions
- **GET** `/api/v1/web3/transactions/`
- **POST** `/api/v1/web3/transactions/`
- **GET** `/api/v1/web3/transactions/{id}/`
- **PATCH** `/api/v1/web3/transactions/{id}/`
- **DELETE** `/api/v1/web3/transactions/{id}/`
- **Description**: Manage cryptocurrency transactions
- **Permissions**: Accountant, CFO

#### Smart Contracts
- **GET** `/api/v1/web3/contracts/`
- **POST** `/api/v1/web3/contracts/`
- **GET** `/api/v1/web3/contracts/{id}/`
- **PATCH** `/api/v1/web3/contracts/{id}/`
- **DELETE** `/api/v1/web3/contracts/{id}/`
- **Description**: Manage smart contracts
- **Permissions**: Accountant, CFO

#### DeFi Protocols
- **GET** `/api/v1/web3/defi/protocols/`
- **POST** `/api/v1/web3/defi/protocols/`
- **GET** `/api/v1/web3/defi/protocols/{id}/`
- **PATCH** `/api/v1/web3/defi/protocols/{id}/`
- **DELETE** `/api/v1/web3/defi/protocols/{id}/`
- **Description**: Manage DeFi protocols
- **Permissions**: Accountant, CFO

#### DeFi Positions
- **GET** `/api/v1/web3/defi/positions/`
- **POST** `/api/v1/web3/defi/positions/`
- **GET** `/api/v1/web3/defi/positions/{id}/`
- **PATCH** `/api/v1/web3/defi/positions/{id}/`
- **DELETE** `/api/v1/web3/defi/positions/{id}/`
- **Description**: Manage DeFi positions
- **Permissions**: Accountant, CFO

#### Token Prices
- **GET** `/api/v1/web3/prices/`
- **POST** `/api/v1/web3/prices/`
- **GET** `/api/v1/web3/prices/{id}/`
- **Description**: Manage token prices
- **Permissions**: Accountant, CFO

#### Web3 Workflows
- **POST** `/api/v1/web3/wallets/create/`
- **POST** `/api/v1/web3/transactions/send/`
- **POST** `/api/v1/web3/contracts/deploy/`
- **POST** `/api/v1/web3/defi/positions/open/`
- **POST** `/api/v1/web3/defi/positions/close/`
- **Description**: Web3 workflow operations
- **Permissions**: Accountant, CFO

#### Web3 Statistics
- **GET** `/api/v1/web3/stats/`
- **Description**: Get Web3 statistics
- **Permissions**: Accountant, CFO

## ❌ Error Handling

The API returns standard HTTP status codes and detailed error messages.

### Common Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format
```json
{
    "error": "Error message",
    "detail": "Detailed error description",
    "code": "ERROR_CODE"
}
```

### Validation Errors
```json
{
    "field_name": [
        "This field is required.",
        "This field must be unique."
    ]
}
```

## 🚦 Rate Limiting

API requests are rate-limited to ensure system stability:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute
- **Report generation**: 20 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 Examples

### Creating an Invoice
```bash
curl -X POST "https://api.oasys-platform.com/api/v1/invoicing/invoices/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "customer_uuid",
    "invoice_number": "INV-001",
    "invoice_date": "2024-01-15",
    "due_date": "2024-02-15",
    "subtotal": "1000.00",
    "tax_amount": "100.00",
    "total_amount": "1100.00",
    "currency": "USD",
    "lines": [
      {
        "description": "Consulting Services",
        "quantity": "10.00",
        "unit_price": "100.00",
        "tax_rate": "10.00",
        "line_total": "1100.00"
      }
    ]
  }'
```

### Creating a Journal Entry
```bash
curl -X POST "https://api.oasys-platform.com/api/v1/accounting/journal-entries/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entry_date": "2024-01-15",
    "reference": "JE-001",
    "description": "Cash sale",
    "lines": [
      {
        "account": "account_uuid",
        "description": "Cash received",
        "debit_amount": "1000.00",
        "credit_amount": "0.00"
      },
      {
        "account": "revenue_account_uuid",
        "description": "Revenue earned",
        "debit_amount": "0.00",
        "credit_amount": "1000.00"
      }
    ]
  }'
```

### Uploading a Document for AI Processing
```bash
curl -X POST "https://api.oasys-platform.com/api/v1/ai/upload/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "document_type=invoice" \
  -F "description=Sample invoice for processing"
```

### Creating a Crypto Wallet
```bash
curl -X POST "https://api.oasys-platform.com/api/v1/web3/wallets/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Trading Wallet",
    "network": "ethereum",
    "wallet_type": "metamask",
    "is_primary": true
  }'
```

## 🔗 Interactive Documentation

- **Swagger UI**: `/swagger/`
- **ReDoc**: `/redoc/`
- **OpenAPI Schema**: `/api-docs/`

## 📞 Support

For technical support:
- **Email**: support@oasys-platform.com
- **Documentation**: https://docs.oasys-platform.com
- **API Status**: https://status.oasys-platform.com
