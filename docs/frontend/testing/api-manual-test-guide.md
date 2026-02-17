# API Manual Testing Guide

**Date**: 2025-01-27  
**Purpose**: Manual testing checklist for all new feature API endpoints

---

## 🧪 Pre-Testing Setup

1. **Start Backend Server**
   ```bash
   cd apps/backend
   python manage.py runserver
   ```

2. **Start Frontend Server**
   ```bash
   cd apps/frontend
   npm run dev
   ```

3. **Authentication**
   - Login through the frontend
   - Verify access token is set in localStorage
   - Token should be included in API requests

---

## 📋 Testing Checklist

### 1. Tax Optimization API

#### Test Cases:

- [ ] **GET /tax_optimization/events/**
  - Test with no filters
  - Test with tax_year filter
  - Test with event_type filter
  - Test pagination (page, limit)
  - Verify response structure

- [ ] **POST /tax_optimization/events/**
  - Create a new tax event
  - Verify all required fields
  - Test validation errors
  - Verify event appears in list

- [ ] **GET /tax_optimization/events/{id}/**
  - Retrieve specific event
  - Test with invalid ID (404)

- [ ] **PUT /tax_optimization/events/{id}/**
  - Update existing event
  - Verify changes persist

- [ ] **DELETE /tax_optimization/events/{id}/**
  - Delete event
  - Verify deletion

- [ ] **POST /tax_optimization/events/detect/**
  - Test auto-detection
  - Verify events are created

- [ ] **GET /tax_optimization/strategies/**
  - List strategies
  - Test filters (tax_year, status)
  - Test pagination

- [ ] **POST /tax_optimization/strategies/**
  - Create strategy
  - Test all strategy types
  - Verify priority settings

- [ ] **POST /tax_optimization/strategies/{id}/approve/**
  - Approve strategy
  - Verify status change

- [ ] **GET /tax_optimization/alerts/**
  - List alerts
  - Test is_read filter
  - Verify alert structure

- [ ] **POST /tax_optimization/alerts/{id}/read/**
  - Mark alert as read
  - Verify status update

- [ ] **GET /tax_optimization/stats/**
  - Get statistics
  - Verify data structure

---

### 2. Treasury API

#### Test Cases:

- [ ] **GET /treasury/unified/**
  - Fetch unified balances
  - Verify fiat + crypto aggregation
  - Check total_usd_value calculation

- [ ] **GET /treasury/historical/**
  - Test date range filtering
  - Test interval parameter
  - Verify historical data structure

- [ ] **GET /treasury/runway/**
  - Calculate runway
  - Test with different burn rates
  - Verify calculation accuracy

---

### 3. FX Conversion API

#### Test Cases:

- [ ] **GET /fx_conversion/rate/**
  - Get exchange rate
  - Test with different currency pairs
  - Verify rate freshness

- [ ] **POST /fx_conversion/convert/**
  - Convert currency
  - Test with different amounts
  - Verify conversion accuracy

- [ ] **GET /fx_conversion/currencies/**
  - List supported currencies
  - Verify currency list

- [ ] **GET /fx_conversion/rates/**
  - Get multiple rates
  - Test with base currency
  - Test target currencies filter

- [ ] **POST /fx_conversion/rates/update/**
  - Update rates
  - Verify rates refresh

---

### 4. Vendor Verification API

#### Test Cases:

- [ ] **POST /purchase/suppliers/{id}/register-wallet/**
  - Register wallet for supplier
  - Test with valid address
  - Test with invalid address format

- [ ] **POST /purchase/suppliers/{id}/verify-wallet/**
  - Verify wallet address
  - Check risk score calculation
  - Verify transaction history check

- [ ] **GET /purchase/vendor-wallets/**
  - List vendor wallets
  - Test filters (supplier_id, status)
  - Test pagination

- [ ] **POST /purchase/vendor-wallets/{id}/verify/**
  - Verify specific wallet
  - Check verification status update

- [ ] **POST /purchase/payments/check-before-processing/**
  - Check payment eligibility
  - Test with high-risk vendor
  - Test with low-risk vendor

- [ ] **GET /purchase/verification-logs/**
  - Get verification history
  - Test supplier filter

- [ ] **GET /purchase/payment-blocks/**
  - List payment blocks
  - Test status filter

- [ ] **POST /purchase/payment-blocks/{id}/resolve/**
  - Resolve payment block
  - Test approve action
  - Test dismiss action

---

### 5. ERP Integration API

#### Test Cases:

- [ ] **GET /erp_integration/connections/**
  - List ERP connections
  - Test provider filter

- [ ] **POST /erp_integration/connections/**
  - Create connection
  - Test all providers (QuickBooks, Xero, NetSuite)
  - Verify connection config

- [ ] **GET /erp_integration/connections/{id}/**
  - Get connection details
  - Verify all fields

- [ ] **PUT /erp_integration/connections/{id}/**
  - Update connection
  - Verify changes

- [ ] **DELETE /erp_integration/connections/{id}/**
  - Delete connection
  - Verify deletion

- [ ] **POST /erp_integration/connections/{id}/sync/**
  - Trigger sync
  - Test different sync types
  - Verify sync status

- [ ] **GET /erp_integration/sync-logs/**
  - Get sync history
  - Test connection filter
  - Verify log details

- [ ] **GET /erp_integration/mappings/**
  - List field mappings
  - Verify mapping structure

---

### 6. Gnosis Safe API

#### Test Cases:

- [ ] **GET /web3/gnosis/safes/**
  - List all safes
  - Test pagination

- [ ] **POST /web3/gnosis/safes/**
  - Create new safe
  - Test with multiple owners
  - Verify threshold validation

- [ ] **GET /web3/gnosis/safes/{id}/**
  - Get safe details
  - Verify owner list
  - Check threshold

- [ ] **GET /web3/gnosis/transactions/**
  - List transactions
  - Test safe_id filter
  - Test status filter

- [ ] **POST /web3/gnosis/transactions/**
  - Create transaction
  - Verify transaction structure

- [ ] **POST /web3/gnosis/transactions/{id}/confirm/**
  - Confirm transaction
  - Verify confirmation count

- [ ] **POST /web3/gnosis/transactions/{id}/execute/**
  - Execute transaction
  - Test when threshold met

- [ ] **GET /web3/gnosis/safes/{id}/owners/**
  - List safe owners
  - Verify owner addresses

---

### 7. Coinbase Prime API

#### Test Cases:

- [ ] **GET /web3/coinbase/connections/**
  - List connections
  - Verify connection status

- [ ] **POST /web3/coinbase/connections/**
  - Create connection
  - Test sandbox mode
  - Test production mode

- [ ] **GET /web3/coinbase/accounts/**
  - List accounts
  - Test connection filter
  - Verify balance data

- [ ] **GET /web3/coinbase/orders/**
  - List orders
  - Test status filter
  - Test pagination

- [ ] **POST /web3/coinbase/orders/**
  - Create order
  - Test buy order
  - Test sell order
  - Test different order types

- [ ] **GET /web3/coinbase/orders/{id}/status/**
  - Get order status
  - Verify status updates

---

## 🔍 Common Test Scenarios

### Authentication Tests
- [ ] Test without authentication token (401)
- [ ] Test with expired token (401 + refresh)
- [ ] Test with invalid token (401)
- [ ] Test token refresh flow

### Validation Tests
- [ ] Test required fields
- [ ] Test field format validation
- [ ] Test field length limits
- [ ] Test enum value validation

### Pagination Tests
- [ ] Test page parameter
- [ ] Test limit parameter
- [ ] Test total_pages calculation
- [ ] Test empty results

### Error Handling Tests
- [ ] Test 400 Bad Request
- [ ] Test 401 Unauthorized
- [ ] Test 403 Forbidden
- [ ] Test 404 Not Found
- [ ] Test 500 Server Error
- [ ] Test network errors
- [ ] Test timeout scenarios

### Data Transformation Tests
- [ ] Verify snake_case to camelCase conversion
- [ ] Verify date format handling
- [ ] Verify number format handling
- [ ] Verify boolean conversion

---

## 📊 Test Results Template

```
Feature: [Feature Name]
Endpoint: [Endpoint Path]
Method: [GET/POST/PUT/DELETE]
Status: [✅ Pass / ❌ Fail]
Notes: [Any observations]

Request:
{
  ...
}

Response:
{
  ...
}
```

---

## 🐛 Known Issues

Document any bugs or issues found during testing:
- [ ] Issue 1: ...
- [ ] Issue 2: ...

---

**Testing Started**: ___________  
**Testing Completed**: ___________

