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
    email: "platform@oasys.com", 
    password: "Platform123!",
    role: "platform_admin",
    organization: "OASYS Platform",
    tenantId: undefined,
    permissions: ["*"]
  },
  // Business Tenant Users
  {
    id: "1",
    name: "TechFlow Admin",
    email: "admin@techflow.com",
    password: "Admin123!",
    role: "tenant_admin",
    organization: "TechFlow Corp",
    tenantId: "techflow",
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
    email: "cfo@techflow.com",
    password: "CFO123!",
    role: "cfo",
    organization: "TechFlow Corp",
    tenantId: "techflow",
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
    email: "admin@oasys.com",
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
    // Check for existing session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setTenant(data.tenant)
          setSubscriptionPlan(data.subscriptionPlan)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Fallback to demo mode for development
        const demoUser = DEMO_USERS.find(u => u.email === "admin@oasys.com")
        if (demoUser) {
          setUser({
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            organization: demoUser.organization,
            permissions: demoUser.permissions || []
          })
        }
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      setTenant(data.tenant)
      setSubscriptionPlan(data.subscriptionPlan)
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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setTenant(null)
      setSubscriptionPlan(null)
      setError(null)
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
