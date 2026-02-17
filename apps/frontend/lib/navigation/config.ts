/**
 * Navigation Configuration System
 * 
 * This file defines the navigation structure for different roles and portals.
 * Each role/portal can have its own customized sidebar navigation.
 * Uses role-based access control with hierarchical role weights.
 */

import React from "react"
import { UserRole, hasAccess, getMinRole } from "./role-utils"
import {
  LayoutDashboard,
  Calculator,
  FileText,
  Building2,
  Package,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Settings,
  Users,
  Shield,
  Zap,
  Wallet,
  Coins,
  Globe,
  Plus,
  User,
  CreditCard,
  Receipt,
  PiggyBank,
  Truck,
  Tag,
  DollarSign,
  Percent,
  Calendar,
  RefreshCw,
  Eye,
  Upload,
  Download,
  Clock,
  Activity,
  Target,
  CheckCircle,
  Award,
  FileSpreadsheet,
  Link,
  Smartphone,
  Database,
  Lock,
  Key,
  Crown,
  Network,
  Cpu,
  Camera,
  AlertTriangle,
  Briefcase,
  Factory,
  Store,
} from "lucide-react"

export interface NavigationItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavigationItem[]
  description?: string
  // Role-based access control (minimum role required)
  minRole?: UserRole
  // Legacy support - will be converted to minRole
  requiresRole?: string[]
  requiresPermission?: string[]
  // Portal-specific visibility
  visibleInPortals?: string[]
  hiddenInPortals?: string[]
}

// Import missing icons
import { WifiOff } from "lucide-react"

/**
 * Base navigation items (shared across all roles)
 * These are the core modules available in the system
 * Uses minRole for hierarchical role-based access control
 */
export const baseNavigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview and analytics",
    minRole: 'staff', // HOME: staff
  },
  {
    title: "Finance",
    href: "/finance",
    icon: Calculator,
    description: "Financial management",
    minRole: 'accountant', // FINANCE: accountant
    children: [
      { title: "Accounting", href: "/accounting", icon: Calculator, minRole: 'accountant' },
      { title: "Banking", href: "/banking", icon: Building2, minRole: 'accountant' },
      { title: "Treasury", href: "/treasury", icon: Wallet, minRole: 'cfo' }, // Treasury: cfo
      { title: "Invoicing", href: "/invoicing", icon: FileText, minRole: 'accountant' },
    ]
  },
  {
    title: "Operations",
    href: "/operations",
    icon: ShoppingBag,
    description: "Business operations",
    minRole: 'accountant', // OPERATIONS: accountant
    children: [
      { title: "Sales", href: "/sales", icon: ShoppingCart, minRole: 'accountant' },
      { title: "Purchase", href: "/purchase", icon: ShoppingBag, minRole: 'accountant' },
    ]
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    description: "Stock management & tracking",
    minRole: 'staff', // INVENTORY: staff
    children: [
      { title: "Overview", href: "/inventory", icon: BarChart3, minRole: 'staff' },
      { title: "Items", href: "/inventory/items", icon: Package, minRole: 'staff' },
      { title: "Stock Movements", href: "/inventory/movements", icon: Truck, minRole: 'staff' },
      { title: "Categories", href: "/inventory/categories", icon: Tag, minRole: 'staff' },
      { title: "Valuation", href: "/inventory/valuation", icon: DollarSign, minRole: 'staff' },
      { title: "Reorder Points", href: "/inventory/reorder", icon: AlertTriangle, minRole: 'staff' },
      { title: "Barcode Scanning", href: "/inventory/barcode", icon: Camera, minRole: 'staff' },
      { title: "Settings", href: "/inventory/settings", icon: Settings, minRole: 'staff' },
    ]
  },
  {
    title: "Intelligence",
    href: "/intelligence",
    icon: Zap,
    description: "AI & advanced features",
    minRole: 'firm_admin', // INTELLIGENCE: firm_admin
    children: [
      { title: "AI Processing", href: "/ai-processing", icon: Zap, minRole: 'firm_admin' },
      { title: "Web3", href: "/web3", icon: Coins, minRole: 'tenant_admin' }, // Web3: tenant_admin
      { title: "Tax Optimization", href: "/tax-optimization", icon: Percent, minRole: 'firm_admin' },
    ]
  },
  {
    title: "Resources",
    href: "/resources",
    icon: FileText,
    description: "Documents & reports",
    minRole: 'staff', // RESOURCES: staff
    children: [
      { title: "Documents", href: "/documents", icon: FileText, minRole: 'staff' },
      { title: "Reports", href: "/reports", icon: BarChart3, minRole: 'accountant' }, // Reports: accountant
    ]
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
    description: "Administration",
    minRole: 'tenant_admin', // ADMIN: tenant_admin
    children: [
      { title: "User Management", href: "/admin/users", icon: Users, minRole: 'tenant_admin' },
      { title: "Tenant Settings", href: "/admin/tenant-settings", icon: Settings, minRole: 'tenant_admin' },
      { title: "Security", href: "/admin/security", icon: Lock, minRole: 'tenant_admin' },
      { title: "Audit Logs", href: "/admin/audit", icon: FileText, minRole: 'tenant_admin' },
      { title: "Platform Admin", href: "/platform-admin", icon: Shield, minRole: 'platform_admin' }, // Platform specific: platform_admin
      { title: "Super Admin", href: "/super-admin", icon: Crown, minRole: 'platform_admin' }, // Platform specific: platform_admin
      { title: "Tenant Management", href: "/admin/tenants", icon: Building2, minRole: 'platform_admin' }, // Platform specific: platform_admin
      { title: "System Settings", href: "/admin/settings", icon: Settings, minRole: 'platform_admin' }, // Platform specific: platform_admin
      { title: "Backup & Restore", href: "/admin/backup", icon: Database, minRole: 'platform_admin' }, // Platform specific: platform_admin
    ]
  },
]

/**
 * Platform Admin specific navigation items
 * Uses baseNavigationItems which already has the correct structure
 * Platform Admin has access to everything via role weights
 */
export const platformAdminNavigation: NavigationItem[] = [
  ...baseNavigationItems,
]

/**
 * Tenant Admin specific navigation items
 * Uses baseNavigationItems which already has the correct structure
 */
export const tenantAdminNavigation: NavigationItem[] = [
  ...baseNavigationItems,
]

/**
 * Firm Admin specific navigation items
 * Uses baseNavigationItems which already has the correct structure
 */
export const firmAdminNavigation: NavigationItem[] = [
  ...baseNavigationItems,
]

/**
 * CFO specific navigation items
 * CFO can access Finance, Resources (Reports), and Intelligence (Tax Optimization, Treasury)
 */
export const cfoNavigation: NavigationItem[] = [
  ...baseNavigationItems.filter(item => 
    ["Dashboard", "Finance", "Resources", "Intelligence"].includes(item.title)
  ),
]

/**
 * Accountant specific navigation items
 * Accountant can access Dashboard, Finance, Operations, Inventory, and Resources
 * Cannot access Intelligence (AI Processing, Web3) or Admin
 */
export const accountantNavigation: NavigationItem[] = [
  ...baseNavigationItems.filter(item => 
    ["Dashboard", "Finance", "Operations", "Inventory", "Resources"].includes(item.title)
  ),
]

/**
 * Staff/User specific navigation items (limited access)
 * Staff can access Dashboard, Inventory, and Resources (Documents only, not Reports)
 */
export const staffNavigation: NavigationItem[] = [
  ...baseNavigationItems.filter(item => 
    ["Dashboard", "Inventory", "Resources"].includes(item.title)
  ).map(item => {
    // For Resources, filter out Reports (requires accountant)
    if (item.title === "Resources" && item.children) {
      return {
        ...item,
        children: item.children.filter(child => child.title !== "Reports")
      }
    }
    return item
  }),
]

/**
 * Portal-specific navigation configurations
 * Portals can be: 'web', 'mobile', 'admin', 'api', etc.
 */
export const portalNavigationConfig: Record<string, Record<string, NavigationItem[]>> = {
  web: {
    platform_admin: platformAdminNavigation,
    tenant_admin: tenantAdminNavigation,
    firm_admin: firmAdminNavigation,
    cfo: cfoNavigation,
    accountant: accountantNavigation,
    staff: staffNavigation,
    user: staffNavigation,
  },
  mobile: {
    platform_admin: [
      { title: "Dashboard", href: "/mobile/dashboard", icon: LayoutDashboard },
      { title: "Admin", href: "/mobile/admin", icon: Settings },
    ],
    tenant_admin: [
      { title: "Dashboard", href: "/mobile/dashboard", icon: LayoutDashboard },
      { title: "Expenses", href: "/mobile/expenses", icon: Receipt },
      { title: "Invoices", href: "/mobile/invoices", icon: FileText },
      { title: "Approvals", href: "/mobile/approvals", icon: CheckCircle },
    ],
    accountant: [
      { title: "Dashboard", href: "/mobile/dashboard", icon: LayoutDashboard },
      { title: "Expenses", href: "/mobile/expenses", icon: Receipt },
      { title: "Invoices", href: "/mobile/invoices", icon: FileText },
      { title: "Approvals", href: "/mobile/approvals", icon: CheckCircle },
      { title: "Banking", href: "/mobile/banking", icon: Building2 },
    ],
    staff: staffNavigation.filter(item => item.title === "Mobile" || item.title === "Dashboard"),
    user: staffNavigation.filter(item => item.title === "Mobile" || item.title === "Dashboard"),
  },
  admin: {
    platform_admin: platformAdminNavigation.filter(item => item.title === "Admin" || item.title === "Dashboard"),
    tenant_admin: tenantAdminNavigation.filter(item => item.title === "Admin" || item.title === "Dashboard"),
  },
}

/**
 * Get navigation items for a specific role and portal
 */
export function getNavigationForRoleAndPortal(
  role: string,
  portal: string = 'web',
  userPermissions: string[] = []
): NavigationItem[] {
  // Map legacy 'user' role to 'staff' for compatibility
  if (role === 'user') {
    role = 'staff';
  }
  
  // Get portal-specific navigation or fallback to web
  const portalNav = portalNavigationConfig[portal] || portalNavigationConfig.web
  const roleNav = portalNav[role] || portalNav['staff'] || []

  // Filter navigation items based on role and permissions
  return filterNavigationByAccess(roleNav, role, userPermissions)
}

/**
 * Filter navigation items based on role and permissions
 */
/**
 * Filter navigation items based on role and permissions
 * Uses hierarchical role weights for access control
 * Key rule: If a menu item has children, only show the parent if the user has access to at least one child
 */
function filterNavigationByAccess(
  items: NavigationItem[],
  userRole: string,
  userPermissions: string[]
): NavigationItem[] {
  const filtered: NavigationItem[] = []
  
  // Map legacy 'user' role to 'staff' for compatibility
  if (userRole === 'user') {
    userRole = 'staff'
  }
  
  for (const item of items) {
    // Determine the minimum role required for this item
    let minRole: UserRole | undefined = item.minRole
    
    // Legacy support: Convert requiresRole array to minRole
    if (!minRole && item.requiresRole && item.requiresRole.length > 0) {
      minRole = getMinRole(item.requiresRole)
    }
    
    // If no role requirement specified, default to 'staff' (most permissive)
    if (!minRole) {
      minRole = 'staff'
    }

    // Check if user has access using role weights
    const userHasAccess = hasAccess(userRole, minRole)
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development' && !userHasAccess) {
      console.log(`[Navigation Filter] Item "${item.title}" filtered out: userRole=${userRole}, minRole=${minRole}, hasAccess=${userHasAccess}`)
    }
    
    // Check if item requires specific permission (legacy support)
    let hasPermission = true
    if (item.requiresPermission) {
      hasPermission = item.requiresPermission.some(perm => 
        userPermissions.includes(perm) || userPermissions.includes('*')
      )
    }

    if (!userHasAccess || !hasPermission) {
      continue
    }

    // Recursively filter children
    let filteredChildren: NavigationItem[] | undefined
    if (item.children) {
      filteredChildren = filterNavigationByAccess(item.children, userRole, userPermissions)
      
      // Key requirement: If item has children, only show parent if user has access to at least one child
      if (filteredChildren.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Navigation Filter] Parent "${item.title}" filtered out: no accessible children`)
        }
        continue // Skip parent if no children are accessible
      }
    }

    filtered.push({
      ...item,
      children: filteredChildren,
      // Remove legacy requiresRole after conversion
      requiresRole: undefined,
    })
  }
  
  return filtered
}

/**
 * Detect current portal based on pathname or user agent
 * 
 * Note: /admin/* routes are part of the web portal, not a separate admin portal.
 * The 'admin' portal is reserved for a separate admin interface if needed.
 */
export function detectPortal(pathname: string, userAgent?: string): string {
  // Check pathname first
  if (pathname.startsWith('/mobile')) {
    return 'mobile'
  }
  
  // Only detect 'admin' portal for specific admin portal routes (not module routes)
  // /admin/* routes are part of the web application, not a separate portal
  // If you have a separate admin portal, use a different path like /admin-portal/*
  // if (pathname.startsWith('/admin-portal') || pathname.startsWith('/platform-admin-portal')) {
  //   return 'admin'
  // }
  
  if (pathname.startsWith('/api')) {
    return 'api'
  }

  // Check user agent for mobile
  if (userAgent && /Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'mobile'
  }

  // Default to web (includes /admin/* routes as they're part of the web app)
  return 'web'
}

