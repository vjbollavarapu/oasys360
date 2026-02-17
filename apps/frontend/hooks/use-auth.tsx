"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Tenant, TenantUser, SubscriptionPlan, ModuleAccess } from "@/types/global"

interface User {
  id: string
  name: string
  email: string
  role: string
  organization: string
  permissions: string[]
  tenantId?: string
  tenant?: Tenant
  subscriptionPlan?: SubscriptionPlan
  image?: string
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  subscriptionPlan: SubscriptionPlan | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, organization?: string) => Promise<void>
  logout: () => Promise<void>
  hasModuleAccess: (module: string, feature?: string) => boolean
  hasPermission: (permission: string) => boolean
  isPlatformAdmin: () => boolean
  isTenantAdmin: () => boolean
  clearError: () => void
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Enhanced demo users with tenant context
const DEMO_USERS = [
  // Platform Admin
  {
    id: "platform-1",
    name: "Platform Admin",
    email: "platform@oasys360.com", 
    password: "Platform123!",
    role: "platform_admin",
    organization: "OASYS Platform",
    tenantId: undefined,
    permissions: ["*"]
  },
  // Business Tenant Users
  {
    id: "1",
    name: "oasys360 Admin",
    email: "admin@oasys360.com",
    password: "Admin123!",
    role: "tenant_admin",
    organization: "oasys360 Corp",
    tenantId: "oasys360",
    permissions: ["*"]
  },
  {
    id: "2",
    name: "Demo User",
    email: "demo@company.com",
    password: "Demo123!",
    role: "staff",
    organization: "Demo Corp",
    tenantId: "democorp",
    permissions: ["accounting.read", "reports.read"]
  },
  {
    id: "3",
    name: "CFO User", 
    email: "cfo@oasys360.com",
    password: "CFO123!",
    role: "cfo",
    organization: "oasys360 Corp",
    tenantId: "oasys360",
    permissions: ["accounting.*", "reports.*", "banking.*"]
  },
  // Firm Users
  {
    id: "firm-1",
    name: "Firm Admin",
    email: "admin@globalaccounting.com",
    password: "Firm123!",
    role: "firm_admin", 
    organization: "Global Accounting",
    tenantId: "globalaccounting",
    permissions: ["*", "multi_client.*"]
  },
  {
    id: "firm-2",
    name: "Firm Accountant",
    email: "accountant@globalaccounting.com",
    password: "Account123!",
    role: "firm_staff",
    organization: "Global Accounting",
    tenantId: "globalaccounting", 
    permissions: ["accounting.*", "reports.read", "client.assigned"]
  },
  // Legacy users for backward compatibility
  {
    id: "legacy-1",
    name: "Admin User",
    email: "admin@oasys360.com",
    password: "Admin123!",
    role: "admin",
    organization: "OASYS Corp",
    tenantId: "legacy",
    permissions: ["*"]
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session from localStorage (JWT-based auth)
    const checkAuth = () => {
      try {
        // Get user data from localStorage (stored during login)
        const userDataStr = localStorage.getItem('oasys_user_data')
        const accessToken = localStorage.getItem('oasys_access_token')
        
        if (userDataStr && accessToken) {
          const userData = JSON.parse(userDataStr)
          setUser({
            id: userData.id,
            name: userData.name || userData.email,
            email: userData.email,
            role: userData.role || 'staff', // Ensure role is set, default to 'staff'
            organization: userData.tenant?.name || userData.organization || '',
            permissions: userData.permissions || [],
            tenantId: userData.tenant?.id || userData.tenantId,
            tenant: userData.tenant || null,
          })
          setTenant(userData.tenant || null)
          setSubscriptionPlan(userData.subscriptionPlan || null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get API base URL (fixed for row-based multi-tenancy)
      const { getApiBaseUrl } = await import('@/lib/get-api-url')
      const API_BASE_URL = getApiBaseUrl()
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed')
      }

      // Store tokens (backend returns tokens in data.tokens.access and data.tokens.refresh)
      const accessToken = data.tokens?.access || data.access
      const refreshToken = data.tokens?.refresh || data.refresh
      
      if (accessToken) {
        localStorage.setItem('oasys_access_token', accessToken)
      }
      if (refreshToken) {
        localStorage.setItem('oasys_refresh_token', refreshToken)
      }

      // Get user profile from login response (no need to call /api/auth/me)
      let userData = null
      
      if (data.user) {
        // Use user data from login response
        userData = {
          id: data.user.id || data.user_id || '1',
          name: data.user.name || data.user.username || data.user.first_name + ' ' + data.user.last_name || email,
          email: data.user.email || email,
          role: data.user.role || 'staff', // This should be 'tenant_admin' for new signups
          organization: data.user.organization || data.tenant?.name || '',
          permissions: data.user.permissions || [],
          tenantId: data.tenant?.id || data.user.tenant?.id,
          tenant: data.tenant || data.user.tenant || null,
        }
      } else {
        // Fallback to basic user data
        userData = {
          id: data.user_id || '1',
          name: data.name || email,
          email: email,
          role: data.role || 'staff',
          organization: data.organization || '',
          permissions: data.permissions || []
        }
      }

      // Set user state
      setUser(userData)
      setTenant(data.tenant || null)
      setSubscriptionPlan(data.subscriptionPlan || null)
      
      // Store user data in localStorage for RBAC and DashboardLayout
      localStorage.setItem('oasys_user_data', JSON.stringify({
        ...userData,
        tenant: data.tenant || null,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, organization?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, organization }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setUser(data.user)
      setTenant(data.tenant)
      setSubscriptionPlan(data.subscriptionPlan)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear localStorage tokens
      localStorage.removeItem('oasys_access_token')
      localStorage.removeItem('oasys_refresh_token')
      localStorage.removeItem('oasys_user_data')
      
      // Optionally call backend logout endpoint
      // Get API base URL (fixed for row-based multi-tenancy)
      const { getApiBaseUrl } = await import('@/lib/get-api-url')
      const API_BASE_URL = getApiBaseUrl()
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout/`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch (error) {
        // Ignore logout API errors
        console.error('Logout API error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setTenant(null)
      setSubscriptionPlan(null)
      setError(null)
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }

  const hasModuleAccess = (module: string, feature?: string): boolean => {
    if (!user) return false
    
    // Platform admin has access to everything
    if (user.role === 'platform_admin') return true
    
    // Check specific permissions
    const permission = feature ? `${module}.${feature}` : `${module}.*`
    return user.permissions?.some(p => p === permission || p === '*') || false
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions?.some(p => p === permission || p === '*') || false
  }

  const isPlatformAdmin = (): boolean => {
    return user?.role === 'platform_admin'
  }

  const isTenantAdmin = (): boolean => {
    return user?.role === 'tenant_admin' || user?.role === 'firm_admin'
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      tenant, 
      subscriptionPlan, 
      isLoading, 
      error,
      login, 
      signup, 
      logout, 
      hasModuleAccess, 
      hasPermission, 
      isPlatformAdmin, 
      isTenantAdmin,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // During SSR or when context is not available, return safe defaults
    if (typeof window === 'undefined') {
      return {
        user: null,
        tenant: null,
        subscriptionPlan: null,
        isLoading: true,
        error: null,
        login: async () => {},
        signup: async () => {},
        logout: async () => {},
        hasModuleAccess: () => false,
        hasPermission: () => false,
        isPlatformAdmin: () => false,
        isTenantAdmin: () => false,
        clearError: () => {},
      }
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
