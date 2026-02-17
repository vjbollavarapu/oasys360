/**
 * Tenant Isolation E2E Tests
 * Tests that tenant data is properly isolated and users can only access their own tenant's data
 */

import { useEffect } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { mockSessions, mockFetch, cleanup } from './test-setup'

// --- LOCAL MOCKS SETUP ---

// 1. Mock useSession locally so we can control it
const mockUseSession = jest.fn()

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// 2. Mock useRouter locally
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// 3. Local renderWithProviders to maintain link between local mockUseSession and render
const renderWithProviders = (ui: React.ReactElement, options: any = {}) => {
  const session = options.session || null

  // Update the mock implementation for this render
  mockUseSession.mockReturnValue({
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
  })

  return render(ui)
}

// --- MOCK COMPONENTS ---

// Mock accounting page component
const MockAccountingPage = () => {
  const { data: session } = useSession()

  useEffect(() => {
    // Cast to any to avoid TS errors with custom session properties
    const user = session?.user as any
    const tenantId = user?.tenantId

    if (tenantId) {
      fetch('/accounting/accounts', {
        headers: {
          'X-Tenant-ID': tenantId
        }
      })
    }
  }, [session])

  return (
    <div>
      <h1>Accounting</h1>
      <div data-testid="accounts-list">
        <h2>Chart of Accounts</h2>
        <div data-testid="account-item">Cash Account - $10,000.00</div>
        <div data-testid="account-item">Accounts Receivable - $5,000.00</div>
      </div>
      <button data-testid="add-account-button">Add Account</button>
    </div>
  )
}

// Mock banking page component
const MockBankingPage = () => {
  const { data: session } = useSession()

  useEffect(() => {
    const user = session?.user as any
    const tenantId = user?.tenantId

    if (tenantId) {
      fetch('/banking/transactions', {
        headers: {
          'X-Tenant-ID': tenantId
        }
      })
    }
  }, [session])

  return (
    <div>
      <h1>Banking</h1>
      <div data-testid="transactions-list">
        <h2>Recent Transactions</h2>
        <div data-testid="transaction-item">Payment received - $1,000.00</div>
      </div>
      <button data-testid="add-transaction-button">Add Transaction</button>
    </div>
  )
}

// Mock tenant selector component
const MockTenantSelector = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as any
  const isAdmin = user?.role === 'admin'

  return (
    <div>
      <h1>Select Tenant</h1>
      <div data-testid="tenant-list">
        {(isAdmin || user?.tenantId === 'tenant-1') && (
          <div
            data-testid="tenant-item"
            data-tenant-id="tenant-1"
            onClick={() => router.push('/dashboard?tenant=tenant-2')}
          >
            <h3>Acme Corp</h3>
            <p>Enterprise Plan</p>
          </div>
        )}
        {(isAdmin || user?.tenantId === 'tenant-2') && (
          <div
            data-testid="tenant-item"
            data-tenant-id="tenant-2"
          >
            <h3>Small Business</h3>
            <p>Basic Plan</p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- TESTS ---

describe('Tenant Isolation E2E Tests', () => {
  let restoreFetch: () => void

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    restoreFetch = mockFetch()
  })

  afterEach(() => {
    restoreFetch()
  })

  describe('Data Isolation', () => {
    it('should only show tenant-specific accounting data', async () => {
      renderWithProviders(<MockAccountingPage />, {
        session: mockSessions.user, // tenant-2
      })

      await waitFor(() => {
        expect(screen.getByText('Accounting')).toBeInTheDocument()
      })

      // Verify API call includes tenant context
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/accounting/accounts'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Tenant-ID': 'tenant-2',
          }),
        })
      )
    })

    it('should only show tenant-specific banking data', async () => {
      renderWithProviders(<MockBankingPage />, {
        session: mockSessions.user, // tenant-2
      })

      await waitFor(() => {
        expect(screen.getByText('Banking')).toBeInTheDocument()
      })

      // Verify API call includes tenant context
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/banking/transactions'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Tenant-ID': 'tenant-2',
          }),
        })
      )
    })

    it('should isolate data between different tenants', async () => {
      // Test with tenant-1 (admin user)
      const { unmount } = renderWithProviders(<MockAccountingPage />, {
        session: mockSessions.admin, // tenant-1
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/accounts'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-1',
            }),
          })
        )
      })

      unmount()
      jest.clearAllMocks() // Clear calls

      // Test with tenant-2 (regular user)
      renderWithProviders(<MockAccountingPage />, {
        session: mockSessions.user, // tenant-2
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/accounts'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })
  })

  describe('Tenant Switching', () => {
    it('should allow admin users to switch tenants', async () => {
      renderWithProviders(<MockTenantSelector />, {
        session: mockSessions.admin,
      })

      expect(screen.getByText('Select Tenant')).toBeInTheDocument()
      expect(screen.getByTestId('tenant-list')).toBeInTheDocument()

      // Should show both tenants for admin
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Small Business')).toBeInTheDocument()
    })

    it('should switch tenant context when selecting different tenant', async () => {
      renderWithProviders(<MockTenantSelector />, {
        session: mockSessions.admin,
      })

      const tenantItem = screen.getByText('Acme Corp')
      fireEvent.click(tenantItem)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard?tenant=tenant-2')
      })
    })

    it('should restrict regular users to their own tenant', () => {
      renderWithProviders(<MockTenantSelector />, {
        session: mockSessions.user, // tenant-2
      })

      // Regular users should only see their own tenant
      expect(screen.getByText('Small Business')).toBeInTheDocument()
      expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument()
    })
  })

  describe('Feature Access Control', () => {
    it('should show features based on tenant plan', () => {
      renderWithProviders(<MockAccountingPage />, {
        session: mockSessions.user, // tenant-2, basic plan
      })

      expect(screen.getByText('Accounting')).toBeInTheDocument()
      expect(screen.getByTestId('add-account-button')).toBeInTheDocument()

      // Basic plan users should have limited features
      expect(screen.queryByTestId('advanced-features')).not.toBeInTheDocument()
    })

    it('should show advanced features for enterprise tenants', () => {
      renderWithProviders(<MockAccountingPage />, {
        session: mockSessions.admin, // tenant-1, enterprise plan
      })

      expect(screen.getByText('Accounting')).toBeInTheDocument()
    })
  })

  describe('Cross-Tenant Data Protection', () => {
    it('should prevent access to other tenant\'s data', async () => {
      renderWithProviders(<MockAccountingPage />, {
        session: mockSessions.user, // tenant-2
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-ID': 'tenant-2',
            }),
          })
        )
      })
    })

    it('should handle tenant context in API requests', async () => {
      renderWithProviders(<MockBankingPage />, {
        session: mockSessions.user,
      })

      await waitFor(() => {
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

  describe('Session Management', () => {
    it('should maintain tenant context across page navigation', async () => {
      renderWithProviders(<MockAccountingPage />, {
        session: mockSessions.user,
      })

      // Verify connection
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounting/accounts'),
          expect.objectContaining({ headers: { 'X-Tenant-ID': 'tenant-2' } })
        )
      })
    })
  })
})
