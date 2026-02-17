/**
 * E2E Test Configuration
 * Comprehensive configuration for end-to-end testing of the multi-tenant application
 */

module.exports = {
  // Test environments
  environments: {
    development: {
      name: 'Development',
      baseUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:8000',
      database: {
        host: 'localhost',
        port: 5432,
        name: 'oasys_test',
        user: 'postgres',
        password: 'password'
      },
      redis: {
        host: 'localhost',
        port: 6379,
        db: 1
      },
      features: {
        aiProcessing: true,
        bankIntegration: true,
        web3Integration: true,
        fraudDetection: true
      }
    },
    
    staging: {
      name: 'Staging',
      baseUrl: 'https://staging.oasys360.com',
      apiUrl: 'https://api-staging.oasys360.com',
      database: {
        host: 'staging-db.oasys360.com',
        port: 5432,
        name: 'oasys_staging',
        user: process.env.STAGING_DB_USER,
        password: process.env.STAGING_DB_PASSWORD
      },
      redis: {
        host: 'staging-redis.oasys360.com',
        port: 6379,
        db: 0
      },
      features: {
        aiProcessing: true,
        bankIntegration: true,
        web3Integration: true,
        fraudDetection: true
      }
    },
    
    production: {
      name: 'Production',
      baseUrl: 'https://app.oasys360.com',
      apiUrl: 'https://api.oasys360.com',
      database: {
        host: 'prod-db.oasys360.com',
        port: 5432,
        name: 'oasys_production',
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD
      },
      redis: {
        host: 'prod-redis.oasys360.com',
        port: 6379,
        db: 0
      },
      features: {
        aiProcessing: true,
        bankIntegration: true,
        web3Integration: true,
        fraudDetection: true
      }
    }
  },

  // Test data
  testData: {
    // Test tenants
    tenants: {
      enterprise: {
        id: 'tenant-enterprise',
        name: 'Enterprise Corp',
        slug: 'enterprise-corp',
        plan: 'enterprise',
        isActive: true,
        maxUsers: 1000,
        maxStorageGb: 10000,
        features: ['accounting', 'banking', 'invoicing', 'ai_processing', 'web3', 'fraud_detection']
      },
      
      professional: {
        id: 'tenant-professional',
        name: 'Professional LLC',
        slug: 'professional-llc',
        plan: 'professional',
        isActive: true,
        maxUsers: 50,
        maxStorageGb: 1000,
        features: ['accounting', 'banking', 'invoicing', 'ai_processing']
      },
      
      basic: {
        id: 'tenant-basic',
        name: 'Small Business',
        slug: 'small-business',
        plan: 'basic',
        isActive: true,
        maxUsers: 10,
        maxStorageGb: 100,
        features: ['accounting', 'invoicing']
      }
    },

    // Test users
    users: {
      admin: {
        id: 'user-admin',
        email: 'admin@enterprise-corp.com',
        name: 'Admin User',
        role: 'admin',
        tenantId: 'tenant-enterprise',
        isActive: true,
        permissions: ['*']
      },
      
      manager: {
        id: 'user-manager',
        email: 'manager@professional-llc.com',
        name: 'Manager User',
        role: 'manager',
        tenantId: 'tenant-professional',
        isActive: true,
        permissions: ['accounting.read', 'accounting.write', 'banking.read', 'invoicing.read', 'invoicing.write']
      },
      
      user: {
        id: 'user-regular',
        email: 'user@small-business.com',
        name: 'Regular User',
        role: 'user',
        tenantId: 'tenant-basic',
        isActive: true,
        permissions: ['accounting.read', 'invoicing.read']
      }
    },

    // Test business data
    businessData: {
      accounts: [
        {
          id: 'account-1',
          name: 'Cash Account',
          accountType: 'asset',
          accountCode: '1000',
          balance: 10000.00,
          tenantId: 'tenant-enterprise'
        },
        {
          id: 'account-2',
          name: 'Accounts Receivable',
          accountType: 'asset',
          accountCode: '1200',
          balance: 5000.00,
          tenantId: 'tenant-enterprise'
        }
      ],
      
      transactions: [
        {
          id: 'transaction-1',
          amount: 1000.00,
          description: 'Payment received',
          type: 'credit',
          accountId: 'account-1',
          date: '2023-01-15T00:00:00.000Z',
          tenantId: 'tenant-enterprise'
        }
      ],
      
      invoices: [
        {
          id: 'invoice-1',
          number: 'INV-001',
          client: 'ABC Corp',
          amount: 5000.00,
          status: 'sent',
          dueDate: '2023-02-15T00:00:00.000Z',
          tenantId: 'tenant-enterprise'
        }
      ]
    }
  },

  // Test scenarios
  scenarios: {
    // Authentication scenarios
    auth: {
      login: {
        valid: {
          email: 'user@small-business.com',
          password: 'password123',
          expectedResult: 'success'
        },
        invalid: {
          email: 'wrong@email.com',
          password: 'wrongpassword',
          expectedResult: 'error'
        },
        locked: {
          email: 'locked@email.com',
          password: 'password123',
          expectedResult: 'locked'
        }
      },
      
      logout: {
        immediate: {
          action: 'logout',
          expectedResult: 'redirect_to_login'
        },
        sessionTimeout: {
          action: 'wait_for_timeout',
          expectedResult: 'auto_logout'
        }
      }
    },

    // Tenant isolation scenarios
    tenant: {
      dataIsolation: {
        crossTenantAccess: {
          user: 'user@small-business.com',
          targetTenant: 'tenant-enterprise',
          expectedResult: 'access_denied'
        },
        sameTenantAccess: {
          user: 'user@small-business.com',
          targetTenant: 'tenant-basic',
          expectedResult: 'access_granted'
        }
      },
      
      featureAccess: {
        basicPlan: {
          tenant: 'tenant-basic',
          features: ['accounting', 'invoicing'],
          expectedResult: 'features_available'
        },
        enterprisePlan: {
          tenant: 'tenant-enterprise',
          features: ['accounting', 'banking', 'invoicing', 'ai_processing', 'web3', 'fraud_detection'],
          expectedResult: 'all_features_available'
        }
      }
    },

    // Business flow scenarios
    business: {
      accounting: {
        createAccount: {
          name: 'New Account',
          accountType: 'asset',
          accountCode: '1500',
          expectedResult: 'account_created'
        },
        createJournalEntry: {
          description: 'Test Entry',
          amount: 100.00,
          expectedResult: 'entry_created'
        },
        reconcile: {
          accountId: 'account-1',
          expectedResult: 'reconciliation_completed'
        }
      },
      
      banking: {
        importTransactions: {
          file: 'transactions.csv',
          expectedResult: 'transactions_imported'
        },
        categorizeTransaction: {
          transactionId: 'transaction-1',
          category: 'office_supplies',
          expectedResult: 'transaction_categorized'
        },
        syncWithBank: {
          bankId: 'bank-1',
          expectedResult: 'sync_completed'
        }
      },
      
      invoicing: {
        createInvoice: {
          client: 'New Client',
          amount: 1000.00,
          expectedResult: 'invoice_created'
        },
        sendInvoice: {
          invoiceId: 'invoice-1',
          expectedResult: 'invoice_sent'
        },
        trackPayment: {
          invoiceId: 'invoice-1',
          amount: 1000.00,
          expectedResult: 'payment_recorded'
        }
      },
      
      aiProcessing: {
        processDocument: {
          file: 'invoice.pdf',
          expectedResult: 'document_processed'
        },
        categorizeTransaction: {
          transactionId: 'transaction-1',
          expectedResult: 'transaction_categorized'
        },
        detectFraud: {
          transactionId: 'transaction-1',
          expectedResult: 'fraud_analysis_completed'
        }
      }
    }
  },

  // Performance thresholds
  performance: {
    pageLoad: {
      max: 3000, // 3 seconds
      warning: 2000 // 2 seconds
    },
    
    apiResponse: {
      max: 1000, // 1 second
      warning: 500 // 500ms
    },
    
    databaseQuery: {
      max: 500, // 500ms
      warning: 200 // 200ms
    }
  },

  // Test coverage requirements
  coverage: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  },

  // Test timeouts
  timeouts: {
    default: 30000, // 30 seconds
    api: 10000, // 10 seconds
    database: 5000, // 5 seconds
    fileUpload: 60000 // 60 seconds
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 1000, // 1 second
    backoff: 'exponential'
  },

  // Screenshot and video recording
  recording: {
    screenshots: {
      onFailure: true,
      onSuccess: false,
      path: './test-results/screenshots'
    },
    
    videos: {
      enabled: false,
      path: './test-results/videos'
    }
  },

  // Test reporting
  reporting: {
    formats: ['json', 'html', 'junit'],
    output: {
      json: './test-results/e2e-results.json',
      html: './test-results/e2e-report.html',
      junit: './test-results/e2e-results.xml'
    }
  }
}
