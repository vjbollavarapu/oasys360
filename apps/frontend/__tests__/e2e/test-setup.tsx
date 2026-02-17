/**
 * E2E Test Setup
 * Provides comprehensive test utilities for end-to-end testing of the multi-tenant application
 */

import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReactElement } from 'react'
import { SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoginForm from './components/LoginForm'

// Mock SessionProvider
const MockSessionProvider = ({ children, session }: { children: React.ReactNode; session: any }) => (
  <div data-testid="session-provider" data-session={JSON.stringify(session)}>
    {children}
  </div>
)

// Mock useSession hook
const mockUseSession = jest.fn()

jest.mock('next-auth/react', () => ({
  SessionProvider: MockSessionProvider,
  useSession: mockUseSession,
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock useRouter
export const mockUseRouter = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock session data for different user types
export const mockSessions = {
  admin: {
    user: {
      id: '1',
      email: 'admin@oasys360.com',
      name: 'Admin User',
      role: 'admin',
      tenantId: 'tenant-1',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  user: {
    user: {
      id: '2',
      email: 'user@company.com',
      name: 'Regular User',
      role: 'user',
      tenantId: 'tenant-2',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  unauthenticated: null,
}

// Mock tenant data
export const mockTenants = {
  'tenant-1': {
    id: 'tenant-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    plan: 'enterprise',
    isActive: true,
    maxUsers: 100,
    maxStorageGb: 1000,
    features: ['accounting', 'banking', 'invoicing', 'ai_processing'],
  },
  'tenant-2': {
    id: 'tenant-2',
    name: 'Small Business',
    slug: 'small-business',
    plan: 'basic',
    isActive: true,
    maxUsers: 10,
    maxStorageGb: 10,
    features: ['accounting', 'invoicing'],
  },
}

// Mock API responses
export const mockApiResponses = {
  // Authentication
  login: {
    success: {
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      expires_in: 3600,
      user: mockSessions.user.user,
    },
    error: {
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
    },
  },
  
  // User profile
  userProfile: {
    success: {
      id: '2',
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@company.com',
      role: 'user',
      tenantId: 'tenant-2',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
    },
  },
  
  // Accounting data
  accounts: {
    success: [
      {
        id: '1',
        name: 'Cash Account',
        accountType: 'asset',
        accountCode: '1000',
        balance: 10000.00,
        isActive: true,
        tenantId: 'tenant-2',
      },
      {
        id: '2',
        name: 'Accounts Receivable',
        accountType: 'asset',
        accountCode: '1200',
        balance: 5000.00,
        isActive: true,
        tenantId: 'tenant-2',
      },
    ],
  },
  
  // Banking data
  transactions: {
    success: [
      {
        id: '1',
        amount: 1000.00,
        description: 'Payment received',
        type: 'credit',
        accountId: '1',
        date: '2023-01-15T00:00:00.000Z',
        tenantId: 'tenant-2',
      },
    ],
  },
}

// Mock router functions
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

// Enhanced test render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: {
    session?: typeof mockSessions[keyof typeof mockSessions]
    router?: Partial<typeof mockRouter>
  } & Omit<RenderOptions, 'wrapper'>
) => {
  // Extract options safely
  const session = options?.session ?? null
  const router = options?.router ?? mockRouter
  
  // Create render options without session and router
  const renderOptions: Partial<RenderOptions> = {}
  if (options) {
    Object.keys(options).forEach(key => {
      if (key !== 'session' && key !== 'router') {
        (renderOptions as any)[key] = (options as any)[key]
      }
    })
  }
  
  // Mock useRouter - only if not already set
  if (!mockUseRouter.mock.calls.length) {
    mockUseRouter.mockReturnValue({
      ...mockRouter,
      ...router,
    })
  }
  
  // Mock useSession
  console.log('Setting up useSession mock with session:', session)
  mockUseSession.mockReturnValue({
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
  })
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockSessionProvider session={session}>
      {children}
    </MockSessionProvider>
  )
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock fetch with tenant-aware responses
export const mockFetch = (tenantId?: string) => {
  const originalFetch = global.fetch
  
  global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    // Extract tenant from URL or headers
    const urlObj = new URL(url, 'http://localhost:3000')
    const pathTenant = urlObj.pathname.split('/')[1] // Assuming /tenant-slug/...
    const headerTenant = (options?.headers as Record<string, string>)?.['X-Tenant-ID']
    const currentTenant = tenantId || pathTenant || headerTenant || 'tenant-2'
    
    // Mock different responses based on endpoint
    if (url.includes('/auth/login')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponses.login.success),
      })
    }
    
    if (url.includes('/users/me')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: mockApiResponses.userProfile.success,
          success: true,
        }),
      })
    }
    
    if (url.includes('/accounting/accounts')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: mockApiResponses.accounts.success,
          success: true,
        }),
      })
    }
    
    if (url.includes('/banking/transactions')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: mockApiResponses.transactions.success,
          success: true,
        }),
      })
    }
    
    // Default response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: {}, success: true }),
    })
  })
  
  return () => {
    global.fetch = originalFetch
  }
}

// Test utilities for common actions
export const testUtils = {
  // Login user
  login: async (email: string = 'user@company.com', password: string = 'password123') => {
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: email } })
    fireEvent.change(passwordInput, { target: { value: password } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  },
  
  // Navigate to a page
  navigateTo: (path: string) => {
    mockRouter.push(path)
  },
  
  // Wait for API call
  waitForApiCall: async (endpoint: string) => {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(endpoint),
        expect.any(Object)
      )
    })
  },
  
  // Check tenant isolation
  checkTenantIsolation: (expectedTenantId: string) => {
    const calls = (global.fetch as jest.Mock).mock.calls
    const lastCall = calls[calls.length - 1]
    const headers = lastCall[1]?.headers as Record<string, string>
    
    expect(headers?.['X-Tenant-ID']).toBe(expectedTenantId)
  },
}

// Cleanup function
export const cleanup = () => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
}

// Export testing library utilities
export * from '@testing-library/react'
export { renderWithProviders as render }
