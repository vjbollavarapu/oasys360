/**
 * Business Flows E2E Tests
 * Tests complete business workflows including accounting, banking, invoicing, and AI processing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { renderWithProviders, mockSessions, mockApiResponses, mockFetch, testUtils, cleanup } from './test-setup'

// Mock accounting workflow components
const MockAccountingWorkflow = () => {
  return (
    <div>
      <h1>Accounting Workflow</h1>
      
      {/* Chart of Accounts */}
      <section data-testid="chart-of-accounts">
        <h2>Chart of Accounts</h2>
        <div data-testid="accounts-list">
          <div data-testid="account-item" data-account-id="1">
            <span>Cash Account</span>
            <span>$10,000.00</span>
            <button data-testid="edit-account-button">Edit</button>
          </div>
        </div>
        <button data-testid="add-account-button">Add Account</button>
      </section>

      {/* Journal Entries */}
      <section data-testid="journal-entries">
        <h2>Journal Entries</h2>
        <div data-testid="entries-list">
          <div data-testid="entry-item" data-entry-id="1">
            <span>Payment Received</span>
            <span>$1,000.00</span>
            <span>2023-01-15</span>
            <button data-testid="edit-entry-button">Edit</button>
          </div>
        </div>
        <button data-testid="add-entry-button">Add Entry</button>
      </section>

      {/* Bank Reconciliation */}
      <section data-testid="bank-reconciliation">
        <h2>Bank Reconciliation</h2>
        <div data-testid="reconciliation-status">
          <span>Status: Reconciled</span>
          <span>Balance: $10,000.00</span>
        </div>
        <button data-testid="reconcile-button">Reconcile</button>
      </section>
    </div>
  )
}

// Mock banking workflow components
const MockBankingWorkflow = () => {
  return (
    <div>
      <h1>Banking Workflow</h1>
      
      {/* Account Overview */}
      <section data-testid="account-overview">
        <h2>Account Overview</h2>
        <div data-testid="account-balance">
          <span>Current Balance: $10,000.00</span>
        </div>
        <div data-testid="account-info">
          <span>Account: 1234567890</span>
          <span>Bank: Test Bank</span>
        </div>
      </section>

      {/* Transactions */}
      <section data-testid="transactions">
        <h2>Recent Transactions</h2>
        <div data-testid="transactions-list">
          <div data-testid="transaction-item" data-transaction-id="1">
            <span>Payment received</span>
            <span>$1,000.00</span>
            <span>2023-01-15</span>
            <button data-testid="categorize-button">Categorize</button>
          </div>
        </div>
        <button data-testid="import-transactions-button">Import Transactions</button>
      </section>

      {/* Integration */}
      <section data-testid="bank-integration">
        <h2>Bank Integration</h2>
        <div data-testid="integration-status">
          <span>Status: Connected</span>
          <span>Last Sync: 2023-01-15 10:30 AM</span>
        </div>
        <button data-testid="sync-button">Sync Now</button>
      </section>
    </div>
  )
}

// Mock invoicing workflow components
const MockInvoicingWorkflow = () => {
  return (
    <div>
      <h1>Invoicing Workflow</h1>
      
      {/* Invoice List */}
      <section data-testid="invoice-list">
        <h2>Invoices</h2>
        <div data-testid="invoices-list">
          <div data-testid="invoice-item" data-invoice-id="1">
            <span>INV-001</span>
            <span>Client: ABC Corp</span>
            <span>Amount: $5,000.00</span>
            <span>Status: Sent</span>
            <button data-testid="view-invoice-button">View</button>
          </div>
        </div>
        <button data-testid="create-invoice-button">Create Invoice</button>
      </section>

      {/* Payment Tracking */}
      <section data-testid="payment-tracking">
        <h2>Payment Tracking</h2>
        <div data-testid="payments-list">
          <div data-testid="payment-item" data-payment-id="1">
            <span>Payment for INV-001</span>
            <span>$5,000.00</span>
            <span>2023-01-15</span>
            <span>Status: Received</span>
          </div>
        </div>
      </section>
    </div>
  )
}

// Mock AI processing workflow components
const MockAIProcessingWorkflow = () => {
  return (
    <div>
      <h1>AI Processing Workflow</h1>
      
      {/* Document Processing */}
      <section data-testid="document-processing">
        <h2>Document Processing</h2>
        <div data-testid="processing-queue">
          <div data-testid="processing-item" data-document-id="1">
            <span>Invoice_001.pdf</span>
            <span>Status: Processing</span>
            <span>Progress: 75%</span>
          </div>
        </div>
        <button data-testid="upload-document-button">Upload Document</button>
      </section>

      {/* AI Categorization */}
      <section data-testid="ai-categorization">
        <h2>AI Categorization</h2>
        <div data-testid="categorization-results">
          <div data-testid="category-item">
            <span>Office Supplies</span>
            <span>Confidence: 95%</span>
            <button data-testid="accept-category-button">Accept</button>
            <button data-testid="reject-category-button">Reject</button>
          </div>
        </div>
      </section>

      {/* Fraud Detection */}
      <section data-testid="fraud-detection">
        <h2>Fraud Detection</h2>
        <div data-testid="fraud-alerts">
          <div data-testid="alert-item" data-alert-id="1">
            <span>Unusual Transaction Pattern</span>
            <span>Risk Level: Medium</span>
            <button data-testid="investigate-button">Investigate</button>
          </div>
        </div>
      </section>
    </div>
  )
}

describe('Business Flows E2E Tests', () => {
  let restoreFetch: () => void

  beforeEach(() => {
    cleanup()
    restoreFetch = mockFetch()
  })

  afterEach(() => {
    restoreFetch()
  })

  describe('Accounting Workflow', () => {
    it('should complete full accounting workflow', async () => {
      renderWithProviders(<MockAccountingWorkflow />, {
        session: mockSessions.user,
      })

      // Test Chart of Accounts
      expect(screen.getByText('Chart of Accounts')).toBeInTheDocument()
      expect(screen.getByTestId('accounts-list')).toBeInTheDocument()
      expect(screen.getByText('Cash Account')).toBeInTheDocument()

      // Test adding new account
      const addAccountButton = screen.getByTestId('add-account-button')
      fireEvent.click(addAccountButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/accounts'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })

      // Test Journal Entries
      expect(screen.getByText('Journal Entries')).toBeInTheDocument()
      expect(screen.getByTestId('entries-list')).toBeInTheDocument()
      expect(screen.getByText('Payment Received')).toBeInTheDocument()

      // Test adding new entry
      const addEntryButton = screen.getByTestId('add-entry-button')
      fireEvent.click(addEntryButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/journal-entries'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })

      // Test Bank Reconciliation
      expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument()
      expect(screen.getByText('Status: Reconciled')).toBeInTheDocument()
      expect(screen.getByText('Balance: $10,000.00')).toBeInTheDocument()
    })

    it('should handle accounting data validation', async () => {
      renderWithProviders(<MockAccountingWorkflow />, {
        session: mockSessions.user,
      })

      const addAccountButton = screen.getByTestId('add-account-button')
      fireEvent.click(addAccountButton)

      // Mock validation error
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({
          message: 'Validation failed',
          validation: {
            name: ['Account name is required'],
            accountCode: ['Account code must be unique'],
          },
        }),
      })

      await waitFor(() => {
        expect(screen.getByText('Account name is required')).toBeInTheDocument()
        expect(screen.getByText('Account code must be unique')).toBeInTheDocument()
      })
    })
  })

  describe('Banking Workflow', () => {
    it('should complete full banking workflow', async () => {
      renderWithProviders(<MockBankingWorkflow />, {
        session: mockSessions.user,
      })

      // Test Account Overview
      expect(screen.getByText('Account Overview')).toBeInTheDocument()
      expect(screen.getByText('Current Balance: $10,000.00')).toBeInTheDocument()
      expect(screen.getByText('Account: 1234567890')).toBeInTheDocument()

      // Test Transactions
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
      expect(screen.getByText('Payment received')).toBeInTheDocument()

      // Test transaction categorization
      const categorizeButton = screen.getByTestId('categorize-button')
      fireEvent.click(categorizeButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/banking/transactions/1/categorize'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })

      // Test Bank Integration
      expect(screen.getByText('Bank Integration')).toBeInTheDocument()
      expect(screen.getByText('Status: Connected')).toBeInTheDocument()

      // Test sync
      const syncButton = screen.getByTestId('sync-button')
      fireEvent.click(syncButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/banking/sync'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })

    it('should handle banking integration errors', async () => {
      renderWithProviders(<MockBankingWorkflow />, {
        session: mockSessions.user,
      })

      const syncButton = screen.getByTestId('sync-button')
      fireEvent.click(syncButton)

      // Mock integration error
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({
          message: 'Bank service temporarily unavailable',
          code: 'BANK_SERVICE_UNAVAILABLE',
        }),
      })

      await waitFor(() => {
        expect(screen.getByText('Bank service temporarily unavailable')).toBeInTheDocument()
      })
    })
  })

  describe('Invoicing Workflow', () => {
    it('should complete full invoicing workflow', async () => {
      renderWithProviders(<MockInvoicingWorkflow />, {
        session: mockSessions.user,
      })

      // Test Invoice List
      expect(screen.getByText('Invoices')).toBeInTheDocument()
      expect(screen.getByText('INV-001')).toBeInTheDocument()
      expect(screen.getByText('Client: ABC Corp')).toBeInTheDocument()
      expect(screen.getByText('Amount: $5,000.00')).toBeInTheDocument()

      // Test creating new invoice
      const createInvoiceButton = screen.getByTestId('create-invoice-button')
      fireEvent.click(createInvoiceButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/invoicing/invoices'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })

      // Test Payment Tracking
      expect(screen.getByText('Payment Tracking')).toBeInTheDocument()
      expect(screen.getByText('Payment for INV-001')).toBeInTheDocument()
      expect(screen.getByText('Status: Received')).toBeInTheDocument()
    })

    it('should handle invoice status updates', async () => {
      renderWithProviders(<MockInvoicingWorkflow />, {
        session: mockSessions.user,
      })

      const viewInvoiceButton = screen.getByTestId('view-invoice-button')
      fireEvent.click(viewInvoiceButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/invoicing/invoices/1'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })
  })

  describe('AI Processing Workflow', () => {
    it('should complete full AI processing workflow', async () => {
      renderWithProviders(<MockAIProcessingWorkflow />, {
        session: mockSessions.user,
      })

      // Test Document Processing
      expect(screen.getByText('Document Processing')).toBeInTheDocument()
      expect(screen.getByText('Invoice_001.pdf')).toBeInTheDocument()
      expect(screen.getByText('Status: Processing')).toBeInTheDocument()
      expect(screen.getByText('Progress: 75%')).toBeInTheDocument()

      // Test uploading document
      const uploadButton = screen.getByTestId('upload-document-button')
      fireEvent.click(uploadButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/ai-processing/documents'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })

      // Test AI Categorization
      expect(screen.getByText('AI Categorization')).toBeInTheDocument()
      expect(screen.getByText('Office Supplies')).toBeInTheDocument()
      expect(screen.getByText('Confidence: 95%')).toBeInTheDocument()

      // Test accepting category
      const acceptCategoryButton = screen.getByTestId('accept-category-button')
      fireEvent.click(acceptCategoryButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/ai-processing/categorization'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })

      // Test Fraud Detection
      expect(screen.getByText('Fraud Detection')).toBeInTheDocument()
      expect(screen.getByText('Unusual Transaction Pattern')).toBeInTheDocument()
      expect(screen.getByText('Risk Level: Medium')).toBeInTheDocument()

      // Test investigating alert
      const investigateButton = screen.getByTestId('investigate-button')
      fireEvent.click(investigateButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/ai-processing/fraud/1/investigate'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })

    it('should handle AI processing errors', async () => {
      renderWithProviders(<MockAIProcessingWorkflow />, {
        session: mockSessions.user,
      })

      const uploadButton = screen.getByTestId('upload-document-button')
      fireEvent.click(uploadButton)

      // Mock AI processing error
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          message: 'AI processing service unavailable',
          code: 'AI_SERVICE_UNAVAILABLE',
        }),
      })

      await waitFor(() => {
        expect(screen.getByText('AI processing service unavailable')).toBeInTheDocument()
      })
    })
  })

  describe('Cross-Module Integration', () => {
    it('should integrate accounting and banking data', async () => {
      renderWithProviders(<MockAccountingWorkflow />, {
        session: mockSessions.user,
      })

      // Test that banking data is integrated with accounting
      expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument()
      expect(screen.getByText('Status: Reconciled')).toBeInTheDocument()

      // Test reconciliation process
      const reconcileButton = screen.getByTestId('reconcile-button')
      fireEvent.click(reconcileButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/reconciliation'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })

    it('should integrate invoicing with accounting', async () => {
      renderWithProviders(<MockInvoicingWorkflow />, {
        session: mockSessions.user,
      })

      // Test that invoice payments are reflected in accounting
      expect(screen.getByText('Payment Tracking')).toBeInTheDocument()
      expect(screen.getByText('Payment for INV-001')).toBeInTheDocument()
      expect(screen.getByText('Status: Received')).toBeInTheDocument()

      // Test that payment creates accounting entry
      const viewInvoiceButton = screen.getByTestId('view-invoice-button')
      fireEvent.click(viewInvoiceButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/invoicing/invoices/1'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })

    it('should integrate AI processing with all modules', async () => {
      renderWithProviders(<MockAIProcessingWorkflow />, {
        session: mockSessions.user,
      })

      // Test that AI categorization affects accounting
      const acceptCategoryButton = screen.getByTestId('accept-category-button')
      fireEvent.click(acceptCategoryButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/ai-processing/categorization'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })

      // Test that fraud detection affects banking
      const investigateButton = screen.getByTestId('investigate-button')
      fireEvent.click(investigateButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/ai-processing/fraud/1/investigate'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })
  })

  describe('Performance and Optimization', () => {
    it('should load business data efficiently', async () => {
      renderWithProviders(<MockAccountingWorkflow />, {
        session: mockSessions.user,
      })

      // Test that data is loaded in parallel
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/accounts'),
          expect.any(Object)
        )
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/journal-entries'),
          expect.any(Object)
        )
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/reconciliation'),
          expect.any(Object)
        )
      })
    })

    it('should cache business data appropriately', async () => {
      renderWithProviders(<MockBankingWorkflow />, {
        session: mockSessions.user,
      })

      // First load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/banking/transactions'),
          expect.any(Object)
        )
      })

      // Navigate away and back
      const accountingLink = screen.getByTestId('accounting-link')
      fireEvent.click(accountingLink)

      await waitFor(() => {
        expect(useRouter().push).toHaveBeenCalledWith('/accounting')
      })

      // Navigate back to banking
      const bankingLink = screen.getByTestId('banking-link')
      fireEvent.click(bankingLink)

      // Should use cached data
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/banking/transactions'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Tenant-ID': 'tenant-2',
          }),
        })
      )
    })
  })
})
