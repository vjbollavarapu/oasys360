import React, { createContext, useContext, ReactNode } from 'react'

// Mock auth context
interface AuthContextType {
  user: any
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  userRole: string | null
  tenant: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock auth provider
export const MockAuthProvider = ({ 
  children, 
  value 
}: { 
  children: ReactNode
  value?: Partial<AuthContextType>
}) => {
  const defaultValue: AuthContextType = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    userRole: null,
    tenant: null,
    ...value,
  }

  return (
    <AuthContext.Provider value={defaultValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Mock useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock user data for testing
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenant: {
    id: 'tenant-1',
    name: 'Test Tenant',
    domain: 'test-tenant',
  },
}

export const mockTenantUser = {
  id: '2',
  email: 'tenant@example.com',
  name: 'Tenant User',
  role: 'accountant',
  tenant: {
    id: 'tenant-2',
    name: 'Business Tenant',
    domain: 'business-tenant',
  },
}

export const mockPlatformAdmin = {
  id: '3',
  email: 'admin@example.com',
  name: 'Platform Admin',
  role: 'platform_admin',
  tenant: null,
}
