/**
 * API Configuration for OASYS Platform
 * Centralized configuration for all API endpoints and settings
 */

import { getApiBaseUrl } from './get-api-url'

// Environment-based API configuration
// For row-based multi-tenancy, we use a single backend URL.
// Tenant identification is handled via JWT token/session, not subdomain.
const baseUrl = getApiBaseUrl()

const API_CONFIG = {
  // Base URLs - OASYS Main Application API
  // For local development, defaults to http://localhost:8000
  // Override with NEXT_PUBLIC_API_BASE_URL in .env.local if needed
  BASE_URL: baseUrl,
  API_URL: process.env.NEXT_PUBLIC_API_URL || `${baseUrl}/api/v1`,
  
  // API Version
  VERSION: 'v1',
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Authentication
  AUTH: {
    TOKEN_KEY: 'oasys_access_token',
    REFRESH_TOKEN_KEY: 'oasys_refresh_token',
    TOKEN_EXPIRY_KEY: 'oasys_token_expiry',
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login/',
      LOGOUT: '/auth/logout/',
      REGISTER: '/auth/register/',
      REFRESH: '/auth/token/refresh/',  // Fixed: was /auth/refresh/
      ME: '/auth/me/',
      FORGOT_PASSWORD: '/auth/forgot-password/',
      RESET_PASSWORD: '/auth/reset-password/',
      VERIFY_EMAIL: '/auth/verify-email/',
      WEB3_LOGIN: '/auth/web3-login/',
      SSO_LOGIN: '/auth/sso-login/',
      MFA_LOGIN: '/auth/mfa-login/',
    },
    
    // User Management
    USERS: {
      LIST: '/auth/users/',
      CREATE: '/auth/users/',
      DETAIL: (id: string) => `/auth/users/${id}/`,
      UPDATE: (id: string) => `/auth/users/${id}/`,
      DELETE: (id: string) => `/auth/users/${id}/`,
      PROFILE: '/auth/profile/',
      CHANGE_PASSWORD: '/auth/password/change/',
      PREFERENCES: (id: string) => `/auth/users/${id}/preferences/`,
    },
    
    // Tenant Management
    TENANTS: {
      LIST: '/tenants/',
      CREATE: '/tenants/',
      DETAIL: (id: string) => `/tenants/${id}/`,
      UPDATE: (id: string) => `/tenants/${id}/`,
      DELETE: (id: string) => `/tenants/${id}/`,
      SWITCH: (id: string) => `/tenants/${id}/switch/`,
      USERS: (id: string) => `/tenants/${id}/users/`,
    },
    
    // Accounting
    ACCOUNTING: {
      CHART_OF_ACCOUNTS: {
        LIST: '/accounting/accounts/',
        CREATE: '/accounting/accounts/',
        DETAIL: (id: string) => `/accounting/accounts/${id}/`,
        UPDATE: (id: string) => `/accounting/accounts/${id}/`,
        DELETE: (id: string) => `/accounting/accounts/${id}/`,
        BALANCE: (id: string) => `/accounting/accounts/${id}/balance/`,
      },
      JOURNAL_ENTRIES: {
        LIST: '/accounting/journal-entries/',
        CREATE: '/accounting/journal-entries/',
        DETAIL: (id: string) => `/accounting/journal-entries/${id}/`,
        UPDATE: (id: string) => `/accounting/journal-entries/${id}/`,
        DELETE: (id: string) => `/accounting/journal-entries/${id}/`,
        POST: (id: string) => `/accounting/journal-entries/${id}/post/`,
        UNPOST: (id: string) => `/accounting/journal-entries/${id}/unpost/`,
      },
      REPORTS: {
        TRIAL_BALANCE: '/accounting/reports/trial-balance/',
        PROFIT_LOSS: '/accounting/reports/profit-loss/',
        BALANCE_SHEET: '/accounting/reports/balance-sheet/',
        CASH_FLOW: '/accounting/reports/cash-flow/',
      },
    },
    
    // Invoicing
    INVOICING: {
      INVOICES: {
        LIST: '/invoicing/invoices/',
        CREATE: '/invoicing/invoices/',
        DETAIL: (id: string) => `/invoicing/invoices/${id}/`,
        UPDATE: (id: string) => `/invoicing/invoices/${id}/`,
        DELETE: (id: string) => `/invoicing/invoices/${id}/`,
        SEND: (id: string) => `/invoicing/invoices/${id}/send/`,
        MARK_PAID: (id: string) => `/invoicing/invoices/${id}/mark-paid/`,
        DOWNLOAD: (id: string) => `/invoicing/invoices/${id}/download/`,
      },
      TEMPLATES: {
        LIST: '/invoicing/templates/',
        CREATE: '/invoicing/templates/',
        DETAIL: (id: string) => `/invoicing/templates/${id}/`,
        UPDATE: (id: string) => `/invoicing/templates/${id}/`,
        DELETE: (id: string) => `/invoicing/templates/${id}/`,
      },
      E_INVOICE: {
        SETTINGS: {
          LIST: '/invoicing/e-invoice/settings/',
          CREATE: '/invoicing/e-invoice/settings/',
          DETAIL: (id: string) => `/invoicing/e-invoice/settings/${id}/`,
          UPDATE: (id: string) => `/invoicing/e-invoice/settings/${id}/`,
          DELETE: (id: string) => `/invoicing/e-invoice/settings/${id}/`,
          TEST_CONNECTION: (id: string) => `/invoicing/e-invoice/settings/${id}/test-connection/`,
          TEST_CONNECTION_DEFAULT: '/invoicing/e-invoice/test-connection/',
        },
        SUBMIT: (id: string) => `/invoicing/invoices/${id}/e-invoice/submit/`,
        STATUS: (id: string) => `/invoicing/invoices/${id}/e-invoice/status/`,
        CANCEL: (id: string) => `/invoicing/invoices/${id}/e-invoice/cancel/`,
        UBL: (id: string) => `/invoicing/invoices/${id}/e-invoice/ubl/`,
        SUBMISSIONS: {
          LIST: (id: string) => `/invoicing/invoices/${id}/e-invoice/submissions/`,
          DETAIL: (submissionId: string) => `/invoicing/e-invoice/submissions/${submissionId}/`,
        },
      },
    },
    
    // Banking
    BANKING: {
      ACCOUNTS: {
        LIST: '/banking/accounts/',
        CREATE: '/banking/accounts/',
        DETAIL: (id: string) => `/banking/accounts/${id}/`,
        UPDATE: (id: string) => `/banking/accounts/${id}/`,
        DELETE: (id: string) => `/banking/accounts/${id}/`,
        BALANCE: (id: string) => `/banking/accounts/${id}/balance/`,
      },
      TRANSACTIONS: {
        LIST: '/banking/transactions/',
        CREATE: '/banking/transactions/',
        DETAIL: (id: string) => `/banking/transactions/${id}/`,
        UPDATE: (id: string) => `/banking/transactions/${id}/`,
        DELETE: (id: string) => `/banking/transactions/${id}/`,
        IMPORT: '/banking/transactions/import/',
        RECONCILE: '/banking/transactions/reconcile/',
      },
      INTEGRATIONS: {
        LIST: '/banking/integrations/',
        CREATE: '/banking/integrations/',
        DETAIL: (id: string) => `/banking/integrations/${id}/`,
        UPDATE: (id: string) => `/banking/integrations/${id}/`,
        DELETE: (id: string) => `/banking/integrations/${id}/`,
        SYNC: (id: string) => `/banking/integrations/${id}/sync/`,
        TEST: (id: string) => `/banking/integrations/${id}/test/`,
      },
      RECONCILIATIONS: {
        LIST: '/banking/reconciliations/',
        CREATE: '/banking/reconciliations/',
        DETAIL: (id: string) => `/banking/reconciliations/${id}/`,
        UPDATE: (id: string) => `/banking/reconciliations/${id}/`,
        DELETE: (id: string) => `/banking/reconciliations/${id}/`,
        ACCOUNT: (accountId: string) => `/banking/accounts/${accountId}/reconciliation/`,
      },
      CATEGORIES: {
        LIST: '/banking/categories/',
        CREATE: '/banking/categories/',
        DETAIL: (id: string) => `/banking/categories/${id}/`,
        UPDATE: (id: string) => `/banking/categories/${id}/`,
        DELETE: (id: string) => `/banking/categories/${id}/`,
      },
    },
    
    // Sales
    SALES: {
      CUSTOMERS: {
        LIST: '/sales/customers/',
        CREATE: '/sales/customers/',
        DETAIL: (id: string) => `/sales/customers/${id}/`,
        UPDATE: (id: string) => `/sales/customers/${id}/`,
        DELETE: (id: string) => `/sales/customers/${id}/`,
        SEARCH: '/sales/customers/search/',
        SUMMARY: '/sales/customers/summary/',
      },
      ORDERS: {
        LIST: '/sales/orders/',
        CREATE: '/sales/orders/',
        DETAIL: (id: string) => `/sales/orders/${id}/`,
        UPDATE: (id: string) => `/sales/orders/${id}/`,
        DELETE: (id: string) => `/sales/orders/${id}/`,
        CONVERT_TO_INVOICE: (id: string) => `/sales/orders/${id}/convert-to-invoice/`,
      },
      QUOTES: {
        LIST: '/sales/quotes/',
        CREATE: '/sales/quotes/',
        DETAIL: (id: string) => `/sales/quotes/${id}/`,
        UPDATE: (id: string) => `/sales/quotes/${id}/`,
        DELETE: (id: string) => `/sales/quotes/${id}/`,
        CONVERT_TO_ORDER: (id: string) => `/sales/quotes/${id}/convert-to-order/`,
      },
    },
    
    // Purchase
    PURCHASE: {
      ORDERS: {
        LIST: '/purchase/orders/',
        CREATE: '/purchase/orders/',
        DETAIL: (id: string) => `/purchase/orders/${id}/`,
        UPDATE: (id: string) => `/purchase/orders/${id}/`,
        DELETE: (id: string) => `/purchase/orders/${id}/`,
        APPROVE: (id: string) => `/purchase/orders/${id}/approve/`,
        RECEIVE: (id: string) => `/purchase/orders/${id}/receive/`,
      },
      VENDORS: {
        LIST: '/purchase/vendors/',
        CREATE: '/purchase/vendors/',
        DETAIL: (id: string) => `/purchase/vendors/${id}/`,
        UPDATE: (id: string) => `/purchase/vendors/${id}/`,
        DELETE: (id: string) => `/purchase/vendors/${id}/`,
      },
    },
    
    // Inventory
    INVENTORY: {
      ITEMS: {
        LIST: '/inventory/items/',
        CREATE: '/inventory/items/',
        DETAIL: (id: string) => `/inventory/items/${id}/`,
        UPDATE: (id: string) => `/inventory/items/${id}/`,
        DELETE: (id: string) => `/inventory/items/${id}/`,
        STOCK: (id: string) => `/inventory/items/${id}/stock/`,
      },
      CATEGORIES: {
        LIST: '/inventory/categories/',
        CREATE: '/inventory/categories/',
        DETAIL: (id: string) => `/inventory/categories/${id}/`,
        UPDATE: (id: string) => `/inventory/categories/${id}/`,
        DELETE: (id: string) => `/inventory/categories/${id}/`,
      },
      MOVEMENTS: {
        LIST: '/inventory/movements/',
        CREATE: '/inventory/movements/',
        DETAIL: (id: string) => `/inventory/movements/${id}/`,
        UPDATE: (id: string) => `/inventory/movements/${id}/`,
        DELETE: (id: string) => `/inventory/movements/${id}/`,
      },
    },
    
    // AI Processing (matches backend: /api/v1/ai_processing/)
    AI_PROCESSING: {
      // Documents
      DOCUMENTS: {
        LIST: '/ai_processing/documents/',
        UPLOAD: '/ai_processing/documents/upload/',
        PROCESS: '/ai_processing/documents/process/',
        DETAIL: (id: string) => `/ai_processing/documents/${id}/`,
        SEARCH: '/ai_processing/documents/search/',
        CATEGORIZATION: (id: string) => `/ai_processing/documents/${id}/categorization/`,
        EXTRACTION: (id: string) => `/ai_processing/documents/${id}/extraction/`,
      },
      // Categorization
      CATEGORIZATION: {
        LIST: '/ai_processing/categorization/',
        DETAIL: (id: string) => `/ai_processing/categorization/${id}/`,
      },
      // Extraction
      EXTRACTION: {
        LIST: '/ai_processing/extraction/',
        DETAIL: (id: string) => `/ai_processing/extraction/${id}/`,
      },
      // Jobs
      JOBS: {
        LIST: '/ai_processing/jobs/',
        CREATE: '/ai_processing/jobs/',
        DETAIL: (id: string) => `/ai_processing/jobs/${id}/`,
      },
      // Models
      MODELS: {
        LIST: '/ai_processing/models/',
        DETAIL: (id: string) => `/ai_processing/models/${id}/`,
        RETRAIN: (id: string) => `/ai_processing/models/${id}/retrain/`,
      },
      // Fraud Detection
      FRAUD: {
        DETECT: '/ai_processing/fraud/',
      },
      // Financial Forecasting
      FORECASTING: {
        FORECAST: '/ai_processing/forecasting/',
        MODELS: '/ai_processing/forecasting/models/',
      },
      // Settings
      SETTINGS: '/ai_processing/settings/',
      // Statistics
      STATS: '/ai_processing/stats/',
    },
    
    // Web3 Integration
    WEB3: {
      BALANCE: (address: string) => `/web3/balance/${address}/`,
      SEND: '/web3/send/',
      GAS_ESTIMATE: '/web3/gas-estimate/',
      NETWORK_STATUS: '/web3/network-status/',
      WALLETS: {
        LIST: '/web3/wallets/',
        CREATE: '/web3/wallets/',
        DETAIL: (id: string) => `/web3/wallets/${id}/`,
        UPDATE: (id: string) => `/web3/wallets/${id}/`,
        DELETE: (id: string) => `/web3/wallets/${id}/`,
        BALANCE: (id: string) => `/web3/wallets/${id}/balance/`,
      },
      TRANSACTIONS: {
        LIST: '/web3/transactions/',
        CREATE: '/web3/transactions/',
        DETAIL: (id: string) => `/web3/transactions/${id}/`,
        STATUS: (id: string) => `/web3/transactions/${id}/status/`,
        BY_ADDRESS: (address: string) => `/web3/transactions/${address}/`,
      },
      TOKENS: {
        LIST: '/web3/tokens/',
        CREATE: '/web3/tokens/',
        DETAIL: (id: string) => `/web3/tokens/${id}/`,
        UPDATE: (id: string) => `/web3/tokens/${id}/`,
        DELETE: (id: string) => `/web3/tokens/${id}/`,
      },
    },
    
    // Reports
    REPORTS: {
      LIST: '/reports/',
      CREATE: '/reports/',
      DETAIL: (id: string) => `/reports/${id}/`,
      UPDATE: (id: string) => `/reports/${id}/`,
      DELETE: (id: string) => `/reports/${id}/`,
      GENERATE: (id: string) => `/reports/${id}/generate/`,
      DOWNLOAD: (id: string) => `/reports/${id}/download/`,
      SCHEDULE: (id: string) => `/reports/${id}/schedule/`,
    },
    
    // Documents
    DOCUMENTS: {
      LIST: '/documents/',
      UPLOAD: '/documents/upload/',
      DETAIL: (id: string) => `/documents/${id}/`,
      UPDATE: (id: string) => `/documents/${id}/`,
      DELETE: (id: string) => `/documents/${id}/`,
      DOWNLOAD: (id: string) => `/documents/${id}/download/`,
      SHARE: (id: string) => `/documents/${id}/share/`,
    },
    
    // Tax Optimization
    TAX_OPTIMIZATION: {
      EVENTS: {
        LIST: '/tax_optimization/events/',
        CREATE: '/tax_optimization/events/',
        DETAIL: (id: string) => `/tax_optimization/events/${id}/`,
        UPDATE: (id: string) => `/tax_optimization/events/${id}/`,
        DELETE: (id: string) => `/tax_optimization/events/${id}/`,
        DETECT: '/tax_optimization/events/detect/',
      },
      STRATEGIES: {
        LIST: '/tax_optimization/strategies/',
        CREATE: '/tax_optimization/strategies/',
        DETAIL: (id: string) => `/tax_optimization/strategies/${id}/`,
        UPDATE: (id: string) => `/tax_optimization/strategies/${id}/`,
        DELETE: (id: string) => `/tax_optimization/strategies/${id}/`,
        APPROVE: (id: string) => `/tax_optimization/strategies/${id}/approve/`,
        GENERATE: '/tax_optimization/strategies/generate/',
      },
      YEAR_SUMMARIES: {
        LIST: '/tax_optimization/year-summaries/',
        CREATE: '/tax_optimization/year-summaries/',
        DETAIL: (id: string) => `/tax_optimization/year-summaries/${id}/`,
        CALCULATE: (taxYear: number) => `/tax_optimization/year-summaries/${taxYear}/calculate/`,
      },
      ALERTS: {
        LIST: '/tax_optimization/alerts/',
        MARK_READ: (id: string) => `/tax_optimization/alerts/${id}/read/`,
        DISMISS: (id: string) => `/tax_optimization/alerts/${id}/dismiss/`,
        GENERATE: '/tax_optimization/alerts/generate/',
      },
      SETTINGS: {
        GET: '/tax_optimization/settings/',
        UPDATE: '/tax_optimization/settings/',
      },
      STATS: '/tax_optimization/stats/',
    },
    
    // Treasury
    TREASURY: {
      UNIFIED: '/treasury/unified/',
      HISTORICAL: '/treasury/historical/',
      RUNWAY: '/treasury/runway/',
    },
    
    // FX Conversion
    FX_CONVERSION: {
      RATE: '/fx_conversion/rate/',
      CONVERT: '/fx_conversion/convert/',
      CURRENCIES: '/fx_conversion/currencies/',
      RATES: {
        LIST: '/fx_conversion/rates/',
        UPDATE: '/fx_conversion/rates/update/',
      },
      CONVERSIONS: {
        LIST: '/fx_conversion/conversions/',
      },
      CONFIG: '/fx_conversion/config/',
    },
    
    // Vendor Verification (in purchase app)
    VENDOR_VERIFICATION: {
      VERIFY_WALLET: (supplierId: string) => `/purchase/suppliers/${supplierId}/verify-wallet/`,
      REGISTER_WALLET: (supplierId: string) => `/purchase/suppliers/${supplierId}/register-wallet/`,
      WALLETS: {
        LIST: '/purchase/vendor-wallets/',
        CREATE: '/purchase/vendor-wallets/',
        DETAIL: (id: string) => `/purchase/vendor-wallets/${id}/`,
        UPDATE: (id: string) => `/purchase/vendor-wallets/${id}/`,
        DELETE: (id: string) => `/purchase/vendor-wallets/${id}/`,
        VERIFY: (id: string) => `/purchase/vendor-wallets/${id}/verify/`,
      },
      CHECK_PAYMENT: '/purchase/payments/check-before-processing/',
      VERIFICATION_LOGS: {
        LIST: '/purchase/verification-logs/',
      },
      PAYMENT_BLOCKS: {
        LIST: '/purchase/payment-blocks/',
        DETAIL: (id: string) => `/purchase/payment-blocks/${id}/`,
        UPDATE: (id: string) => `/purchase/payment-blocks/${id}/`,
        RESOLVE: (id: string) => `/purchase/payment-blocks/${id}/resolve/`,
      },
    },
    
    // ERP Integration
    ERP_INTEGRATION: {
      CONNECTIONS: {
        LIST: '/erp_integration/connections/',
        CREATE: '/erp_integration/connections/',
        DETAIL: (id: string) => `/erp_integration/connections/${id}/`,
        UPDATE: (id: string) => `/erp_integration/connections/${id}/`,
        DELETE: (id: string) => `/erp_integration/connections/${id}/`,
        SYNC: (id: string) => `/erp_integration/connections/${id}/sync/`,
      },
      SYNC_LOGS: {
        LIST: '/erp_integration/sync-logs/',
        DETAIL: (id: string) => `/erp_integration/sync-logs/${id}/`,
      },
      MAPPINGS: {
        LIST: '/erp_integration/mappings/',
        CREATE: '/erp_integration/mappings/',
        DETAIL: (id: string) => `/erp_integration/mappings/${id}/`,
        DELETE: (id: string) => `/erp_integration/mappings/${id}/`,
      },
    },
    
    // Gnosis Safe
    GNOSIS_SAFE: {
      SAFES: {
        LIST: '/web3/gnosis/safes/',
        CREATE: '/web3/gnosis/safes/',
        DETAIL: (id: string) => `/web3/gnosis/safes/${id}/`,
        UPDATE: (id: string) => `/web3/gnosis/safes/${id}/`,
      },
      TRANSACTIONS: {
        LIST: '/web3/gnosis/transactions/',
        CREATE: '/web3/gnosis/transactions/',
        DETAIL: (id: string) => `/web3/gnosis/transactions/${id}/`,
        CONFIRM: (id: string) => `/web3/gnosis/transactions/${id}/confirm/`,
        EXECUTE: (id: string) => `/web3/gnosis/transactions/${id}/execute/`,
      },
      OWNERS: {
        LIST: (safeId: string) => `/web3/gnosis/safes/${safeId}/owners/`,
        ADD: (safeId: string) => `/web3/gnosis/safes/${safeId}/owners/`,
        REMOVE: (safeId: string, ownerId: string) => `/web3/gnosis/safes/${safeId}/owners/${ownerId}/`,
      },
    },
    
    // Coinbase Prime
    COINBASE_PRIME: {
      CONNECTIONS: {
        LIST: '/web3/coinbase/connections/',
        CREATE: '/web3/coinbase/connections/',
        DETAIL: (id: string) => `/web3/coinbase/connections/${id}/`,
        UPDATE: (id: string) => `/web3/coinbase/connections/${id}/`,
        DELETE: (id: string) => `/web3/coinbase/connections/${id}/`,
      },
      ACCOUNTS: {
        LIST: '/web3/coinbase/accounts/',
        DETAIL: (id: string) => `/web3/coinbase/accounts/${id}/`,
      },
      ORDERS: {
        LIST: '/web3/coinbase/orders/',
        CREATE: '/web3/coinbase/orders/',
        DETAIL: (id: string) => `/web3/coinbase/orders/${id}/`,
        STATUS: (id: string) => `/web3/coinbase/orders/${id}/status/`,
      },
    },
  },
  
  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
  },
} as const;

export default API_CONFIG;
export { API_CONFIG };

// Type definitions for better TypeScript support
export type ApiEndpoint = typeof API_CONFIG.ENDPOINTS;
export type ApiConfig = typeof API_CONFIG;
