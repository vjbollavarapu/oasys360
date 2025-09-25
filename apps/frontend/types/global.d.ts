interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
  };
}

interface OrganizationSettings {
  id: string;
  name: string;
  code: string;
  fiscal: {
    currency: string;
    yearStart: string;
    periodType: "monthly" | "quarterly" | "annual";
    timezone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  taxInfo: {
    taxId: string;
    taxRegime: string;
  };
  logo: string;
  isActive: boolean;
}

// Multi-tenant SaaS type definitions
export interface PlatformAdmin {
  id: string
  name: string
  email: string
  role: 'platform_admin' | 'platform_support'
  permissions: PlatformPermission[]
  lastLogin: string
  status: 'active' | 'suspended'
}

export interface PlatformPermission {
  id: string
  name: string
  description: string
  scope: 'tenants' | 'subscriptions' | 'users' | 'system' | 'billing'
}

export interface Tenant {
  id: string
  name: string
  domain: string // subdomain.oasys.com
  type: 'business' | 'firm'
  subscriptionPlan: SubscriptionPlan
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  createdAt: string
  trialEndsAt?: string
  billingEmail: string
  maxUsers: number
  currentUsers: number
  enabledModules: ModuleAccess[]
  customBranding?: TenantBranding
  settings: TenantSettings
}

export interface SubscriptionPlan {
  id: string
  name: string
  type: 'ai_core' | 'ai_basic_web3' | 'ai_full_web3' | 'complete_platform' | 'firm_enterprise'
  price: number
  billingCycle: 'monthly' | 'annual'
  features: PlanFeature[]
  moduleAccess: ModuleAccess[]
  userLimits: {
    maxUsers: number
    maxClients?: number // For firm plans
  }
  supportLevel: 'basic' | 'premium' | 'enterprise' | 'email' | 'chat' | 'priority' | 'dedicated' | 'firm_priority' | 'dedicated_firm'
}

export interface PlanFeature {
  id: string
  name: string
  description: string
  enabled: boolean
  limit?: number
}

export interface ModuleAccess {
  module: 'accounting' | 'inventory' | 'sales' | 'purchase' | 'banking' | 'reports' | 'documents' | 'web3' | 'mobile' | 'multi_client' | 'security'
  enabled: boolean
  features: string[]
}

export interface TenantBranding {
  logo?: string
  primaryColor: string
  secondaryColor: string
  companyName: string
}

export interface TenantSettings {
  timezone: string
  currency: string
  dateFormat: string
  fiscalYearStart: string
  multiCurrency: boolean
  approvalWorkflow: boolean
}

// Tenant User Management
export interface TenantUser {
  id: string
  tenantId: string
  name: string
  email: string
  role: TenantRole
  status: 'active' | 'invited' | 'suspended'
  permissions: TenantPermission[]
  lastLogin?: string
  invitedBy?: string
  invitedAt?: string
  clientAccess?: string[] // For firm users - which clients they can access
}

export interface TenantRole {
  id: string
  name: 'tenant_admin' | 'cfo' | 'manager' | 'accountant' | 'staff' | 'auditor' | 'client_viewer'
  displayName: string
  description: string
  permissions: TenantPermission[]
  isSystemRole: boolean
}

export interface TenantPermission {
  module: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve' | 'export')[]
}

// Firm-specific types
export interface FirmClient {
  id: string
  firmId: string
  name: string
  email: string
  company: string
  subscriptionPlan: SubscriptionPlan
  status: 'active' | 'inactive' | 'pending'
  assignedUsers: string[] // Firm users who can access this client
  enabledModules: ModuleAccess[]
  createdAt: string
  lastActivity: string
}

export interface FirmSubscription extends SubscriptionPlan {
  clientLimits: {
    maxClients: number
    currentClients: number
  }
  firmFeatures: {
    multiClientDashboard: boolean
    clientReporting: boolean
    firmBranding: boolean
    clientPortal: boolean
    auditTrail: boolean
  }
}

// Platform Analytics
export interface PlatformMetrics {
  totalTenants: number
  activeTenants: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  churnRate: number
  averageRevenuePerUser: number
  supportTickets: number
  systemUptime: number
}

// API and Integration types
export interface TenantApiKey {
  id: string
  tenantId: string
  name: string
  key: string
  permissions: string[]
  status: 'active' | 'revoked'
  lastUsed?: string
  expiresAt?: string
}

export interface WebhookEndpoint {
  id: string
  tenantId: string
  url: string
  events: string[]
  status: 'active' | 'disabled'
  secret: string
} 