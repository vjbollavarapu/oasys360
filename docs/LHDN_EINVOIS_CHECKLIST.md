# LHDN e-Invois Implementation Checklist

This checklist is based on Malaysia's LHDN (Lembaga Hasil Dalam Negeri) e-Invoicing requirements and cross-referenced with the current codebase implementation status.

## Implementation Phases

| Phase | Effective Date | Annual Revenue Threshold | Status |
|-------|----------------|-------------------------|--------|
| Phase 1 | 1 Aug 2024 | > RM 100 million | ✅ Active |
| Phase 2 | 1 Jan 2025 | RM 25M - RM 100M | ⚠️ Upcoming |
| Phase 3 | 1 Jul 2025 | RM 5M - RM 25M | ⚠️ Upcoming |
| Phase 4 | 1 Jan 2026 | RM 1M - RM 5M | ⚠️ Upcoming |
| Phase 5 | 1 Jul 2026 | < RM 1M | ⚠️ Upcoming |

---

## 1. Registration & Setup Requirements

### 1.1 MyInvois Portal Registration
- [ ] **Backend**: API client registration with MyInvois portal
- [ ] **Backend**: Store API credentials securely (encrypted)
- [ ] **Backend**: OAuth2/API key authentication mechanism
- [ ] **Frontend**: UI for registering/configuring MyInvois credentials
- [ ] **Frontend**: Settings page for e-invoicing configuration
- [ ] **Status**: ⚠️ Partially implemented (EInvoiceSettings model exists)

### 1.2 Company/Tenant Configuration
- [ ] **Backend**: Store company registration number (SSM/ROC number)
- [ ] **Backend**: Store business address and contact information
- [ ] **Backend**: Store GST/SST registration number if applicable
- [ ] **Frontend**: UI for company registration details
- [ ] **Status**: ⚠️ Needs verification (Company model exists)

### 1.3 Phase Determination
- [ ] **Backend**: Calculate/configure implementation phase based on revenue
- [ ] **Backend**: Store phase eligibility and compliance date
- [ ] **Frontend**: Display current phase and compliance status
- [ ] **Status**: ❌ Not implemented

---

## 2. Data Format & Structure Requirements

### 2.1 UBL 2.1 Format Support
- [ ] **Backend**: Generate UBL 2.1 XML format
- [ ] **Backend**: Generate UBL 2.1 JSON format (alternative)
- [ ] **Backend**: Validate UBL 2.1 schema compliance
- [ ] **Frontend**: Option to export/view UBL format
- [ ] **Status**: ❌ Not implemented

### 2.2 Mandatory Invoice Fields

#### Seller/Supplier Information
- [ ] **Backend**: Company name (mandatory)
- [ ] **Backend**: Registration number (SSM/ROC) (mandatory)
- [ ] **Backend**: Business address (mandatory)
- [ ] **Backend**: Contact person and phone/email (mandatory)
- [ ] **Backend**: GST/SST registration number (if applicable)
- [ ] **Status**: ⚠️ Partially implemented (Company model has basic fields)

#### Buyer/Customer Information
- [ ] **Backend**: Customer name (mandatory)
- [ ] **Backend**: Customer registration number (if business) (mandatory for B2B)
- [ ] **Backend**: Customer address (mandatory)
- [ ] **Backend**: Customer contact information (mandatory)
- [ ] **Backend**: Customer GST/SST number (if applicable)
- [ ] **Status**: ⚠️ Partially implemented (Customer model exists)

#### Invoice Header Information
- [ ] **Backend**: Invoice number (mandatory, unique)
- [ ] **Backend**: Invoice date (mandatory)
- [ ] **Backend**: Due date (mandatory)
- [ ] **Backend**: Currency code (mandatory, default: MYR)
- [ ] **Backend**: Exchange rate (if foreign currency)
- [ ] **Backend**: Payment terms
- [ ] **Status**: ✅ Implemented (Invoice model has these fields)

#### Invoice Line Items
- [ ] **Backend**: Item description (mandatory)
- [ ] **Backend**: Quantity (mandatory)
- [ ] **Backend**: Unit price (mandatory)
- [ ] **Backend**: Line total (mandatory)
- [ ] **Backend**: Tax rate (SST/GST) per line item (mandatory if applicable)
- [ ] **Backend**: Discount per line item (optional)
- [ ] **Status**: ✅ Implemented (InvoiceLine model has these fields)

#### Tax Information
- [ ] **Backend**: SST/GST rate (mandatory if applicable)
- [ ] **Backend**: Taxable amount (mandatory)
- [ ] **Backend**: Tax amount (mandatory if applicable)
- [ ] **Backend**: Tax exemption code (if applicable)
- [ ] **Backend**: Tax category (standard rate, zero-rated, exempt)
- [ ] **Status**: ⚠️ Partially implemented (tax_rate exists, but SST/GST specific fields missing)

#### Totals
- [ ] **Backend**: Subtotal (before tax and discount) (mandatory)
- [ ] **Backend**: Total discount amount (optional)
- [ ] **Backend**: Total tax amount (mandatory if applicable)
- [ ] **Backend**: Grand total (mandatory)
- [ ] **Status**: ✅ Implemented (Invoice model has these fields)

---

## 3. API Integration Requirements

### 3.1 MyInvois API Client
- [ ] **Backend**: HTTP client for MyInvois API endpoints
- [ ] **Backend**: Authentication token management (OAuth2)
- [ ] **Backend**: API endpoint configuration (sandbox/production)
- [ ] **Backend**: Rate limiting and retry logic
- [ ] **Backend**: Error handling and logging
- [ ] **Status**: ❌ Not implemented (needs to be created)

### 3.2 Invoice Submission
- [ ] **Backend**: Submit invoice to MyInvois API (POST /invoices)
- [ ] **Backend**: Handle synchronous submission (real-time)
- [ ] **Backend**: Handle asynchronous submission (batch)
- [ ] **Backend**: Track submission status
- [ ] **Backend**: Store submission reference number
- [ ] **Status**: ❌ Not implemented

### 3.3 Real-time Validation Response
- [ ] **Backend**: Receive validation response from LHDN
- [ ] **Backend**: Parse accepted/rejected status
- [ ] **Backend**: Store LHDN reference number (QRID)
- [ ] **Backend**: Store validation timestamp
- [ ] **Backend**: Handle validation errors and warnings
- [ ] **Status**: ❌ Not implemented

### 3.4 Invoice Status Tracking
- [ ] **Backend**: Store invoice e-invoicing status (pending, submitted, accepted, rejected)
- [ ] **Backend**: Query invoice status from MyInvois
- [ ] **Backend**: Handle status updates via webhooks
- [ ] **Backend**: Store rejection reasons if rejected
- [ ] **Frontend**: Display e-invoicing status on invoice
- [ ] **Status**: ❌ Not implemented

### 3.5 Invoice Cancellation
- [ ] **Backend**: Submit cancellation request to MyInvois
- [ ] **Backend**: Handle cancellation reasons (mandatory)
- [ ] **Backend**: Track cancellation status
- [ ] **Backend**: Update invoice status after cancellation
- [ ] **Status**: ❌ Not implemented

### 3.6 Invoice Correction (Credit/Debit Note)
- [ ] **Backend**: Create credit note for corrections
- [ ] **Backend**: Link credit note to original invoice
- [ ] **Backend**: Submit credit note to MyInvois
- [ ] **Backend**: Handle debit note scenarios
- [ ] **Status**: ⚠️ Partially implemented (credit/debit notes may exist in accounting module)

---

## 4. Data Validation & Compliance

### 4.1 Pre-submission Validation
- [ ] **Backend**: Validate all mandatory fields are present
- [ ] **Backend**: Validate field formats (dates, amounts, etc.)
- [ ] **Backend**: Validate business rules (e.g., invoice date not in future)
- [ ] **Backend**: Validate totals match line items
- [ ] **Backend**: Validate registration numbers format
- [ ] **Status**: ⚠️ Partially implemented (basic validation exists)

### 4.2 Business Rule Validation
- [ ] **Backend**: Validate invoice number uniqueness
- [ ] **Backend**: Validate customer information completeness
- [ ] **Backend**: Validate tax calculations
- [ ] **Backend**: Validate currency and exchange rates
- [ ] **Backend**: Validate date ranges (invoice date, due date)
- [ ] **Status**: ⚠️ Partially implemented

### 4.3 LHDN Compliance Rules
- [ ] **Backend**: Validate against LHDN e-Invoicing guidelines
- [ ] **Backend**: Check for required fields based on transaction type
- [ ] **Backend**: Validate SST/GST rules and exemptions
- [ ] **Backend**: Handle B2B vs B2C differences
- [ ] **Status**: ❌ Not implemented

---

## 5. Frontend Requirements

### 5.1 Invoice Creation/Edit UI
- [ ] **Frontend**: Form fields for all mandatory e-invoicing fields
- [ ] **Frontend**: Customer registration number field
- [ ] **Frontend**: SST/GST configuration per line item
- [ ] **Frontend**: Validation feedback before submission
- [ ] **Frontend**: Preview of e-invoice format
- [ ] **Status**: ⚠️ Partially implemented (invoice creation form exists)

### 5.2 E-Invoicing Status Display
- [ ] **Frontend**: Show e-invoicing status badge (pending, submitted, accepted, rejected)
- [ ] **Frontend**: Display LHDN reference number (QRID)
- [ ] **Frontend**: Show submission timestamp
- [ ] **Frontend**: Display validation errors/warnings
- [ ] **Frontend**: Show QR code for validated invoices
- [ ] **Status**: ❌ Not implemented

### 5.3 E-Invoice Submission UI
- [ ] **Frontend**: Button to submit invoice to MyInvois
- [ ] **Frontend**: Loading state during submission
- [ ] **Frontend**: Success/error notifications
- [ ] **Frontend**: Batch submission option
- [ ] **Frontend**: Submission history/log
- [ ] **Status**: ❌ Not implemented

### 5.4 Settings & Configuration UI
- [ ] **Frontend**: MyInvois API credentials configuration
- [ ] **Frontend**: Sandbox/Production environment toggle
- [ ] **Frontend**: Company registration details form
- [ ] **Frontend**: SST/GST settings configuration
- [ ] **Frontend**: Default tax rates configuration
- [ ] **Status**: ⚠️ Partially implemented (EInvoiceSettings UI exists but incomplete)

### 5.5 Reports & Compliance
- [ ] **Frontend**: E-invoice submission report
- [ ] **Frontend**: Compliance status dashboard
- [ ] **Frontend**: Failed submissions report
- [ ] **Frontend**: Export submission history
- [ ] **Status**: ❌ Not implemented

---

## 6. Data Storage & Database

### 6.1 Invoice Model Extensions
- [ ] **Backend**: Add `e_invoice_status` field (pending, submitted, accepted, rejected)
- [ ] **Backend**: Add `lhdn_reference_number` field (QRID)
- [ ] **Backend**: Add `submitted_to_lhdn_at` timestamp
- [ ] **Backend**: Add `lhdn_validated_at` timestamp
- [ ] **Backend**: Add `e_invoice_xml` or `e_invoice_json` field (store generated format)
- [ ] **Backend**: Add `e_invoice_errors` field (store validation errors)
- [ ] **Status**: ⚠️ Partially implemented (EInvoiceSettings model exists, but Invoice model needs extension)

### 6.2 E-Invoice Submission Log
- [ ] **Backend**: Create EInvoiceSubmission model to track submissions
- [ ] **Backend**: Store request/response payloads
- [ ] **Backend**: Store API response status and errors
- [ ] **Backend**: Store retry attempts
- [ ] **Status**: ❌ Not implemented

---

## 7. Security & Compliance

### 7.1 Data Security
- [ ] **Backend**: Encrypt API credentials at rest
- [ ] **Backend**: Secure transmission (HTTPS only)
- [ ] **Backend**: Audit logging for e-invoice submissions
- [ ] **Backend**: Access control for e-invoicing features
- [ ] **Status**: ⚠️ Partially implemented (audit logging exists)

### 7.2 Data Retention
- [ ] **Backend**: Retain e-invoice data as per LHDN requirements (7 years)
- [ ] **Backend**: Archive mechanism for old invoices
- [ ] **Backend**: Backup and recovery procedures
- [ ] **Status**: ❌ Not implemented

---

## 8. Testing Requirements

### 8.1 Integration Testing
- [ ] **Backend**: Test MyInvois API integration (sandbox)
- [ ] **Backend**: Test invoice submission flow
- [ ] **Backend**: Test error handling scenarios
- [ ] **Backend**: Test cancellation flow
- [ ] **Status**: ❌ Not implemented

### 8.2 Validation Testing
- [ ] **Backend**: Test UBL 2.1 format generation
- [ ] **Backend**: Test mandatory field validation
- [ ] **Backend**: Test business rule validation
- [ ] **Backend**: Test tax calculation accuracy
- [ ] **Status**: ❌ Not implemented

### 8.3 User Acceptance Testing
- [ ] **Frontend**: Test invoice creation with e-invoicing fields
- [ ] **Frontend**: Test submission workflow
- [ ] **Frontend**: Test status tracking and display
- [ ] **Status**: ❌ Not implemented

---

## 9. Documentation & Training

### 9.1 Technical Documentation
- [ ] **Docs**: API integration guide
- [ ] **Docs**: UBL format specification reference
- [ ] **Docs**: Error codes and troubleshooting
- [ ] **Docs**: Configuration guide
- [ ] **Status**: ❌ Not implemented

### 9.2 User Documentation
- [ ] **Docs**: User guide for e-invoicing features
- [ ] **Docs**: Step-by-step submission process
- [ ] **Docs**: Troubleshooting common issues
- [ ] **Status**: ❌ Not implemented

---

## Implementation Priority

### High Priority (Must Have)
1. MyInvois API client and integration
2. Invoice model extensions for e-invoicing fields
3. UBL 2.1 format generation
4. Invoice submission to MyInvois
5. Real-time validation response handling
6. Frontend submission UI

### Medium Priority (Should Have)
1. Pre-submission validation
2. Status tracking and display
3. Invoice cancellation
4. Settings/configuration UI
5. Error handling and logging

### Low Priority (Nice to Have)
1. Batch submission
2. Reports and dashboards
3. Advanced compliance features
4. User documentation

---

## Current Implementation Status Summary

| Category | Status | Completion |
|----------|--------|------------|
| **Backend Models** | ⚠️ Partial | ~30% |
| **Backend API Integration** | ❌ Not Started | 0% |
| **Backend Validation** | ⚠️ Partial | ~20% |
| **Frontend UI** | ⚠️ Partial | ~40% |
| **Testing** | ❌ Not Started | 0% |
| **Documentation** | ❌ Not Started | 0% |

**Overall Progress: ~18%**

---

## Next Steps

1. ✅ **Review this checklist** with stakeholders
2. ⚠️ **Prioritize features** based on phase requirements
3. ⚠️ **Set up MyInvois sandbox** account for testing
4. ⚠️ **Extend Invoice model** with e-invoicing fields
5. ⚠️ **Create MyInvois API client** in backend
6. ⚠️ **Implement UBL 2.1 generator**
7. ⚠️ **Build submission workflow**

---

## References

- [LHDN e-Invoicing Guidelines](https://www.hasil.gov.my/media/zzvbvmdq/garis-panduan-e-invois-lhdnm.pdf)
- [MyInvois Portal](https://myinvois.hasil.gov.my)
- UBL 2.1 Specification
- API Documentation (requires MyInvois portal access)

---

**Last Updated**: 2025-01-27
**Maintained By**: Development Team

