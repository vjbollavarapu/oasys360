/**
 * Role-Based Access Control (RBAC) for OASYS Platform
 * Defines permissions and access control logic
 */

import React, { useState, useEffect } from 'react';

// Define user roles
export const ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  SUPER_ADMIN: 'super_admin',
  FIRM_ADMIN: 'firm_admin',
  FIRM_STAFF: 'firm_staff',
  TENANT_ADMIN: 'tenant_admin',
  CFO: 'cfo',
  ACCOUNTANT: 'accountant',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define permissions
export const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Tenant Management
  CREATE_TENANT: 'create_tenant',
  READ_TENANT: 'read_tenant',
  UPDATE_TENANT: 'update_tenant',
  DELETE_TENANT: 'delete_tenant',
  
  // Accounting
  CREATE_ACCOUNT: 'create_account',
  READ_ACCOUNT: 'read_account',
  UPDATE_ACCOUNT: 'update_account',
  DELETE_ACCOUNT: 'delete_account',
  POST_JOURNAL_ENTRY: 'post_journal_entry',
  UNPOST_JOURNAL_ENTRY: 'unpost_journal_entry',
  
  // Invoicing
  CREATE_INVOICE: 'create_invoice',
  READ_INVOICE: 'read_invoice',
  UPDATE_INVOICE: 'update_invoice',
  DELETE_INVOICE: 'delete_invoice',
  SEND_INVOICE: 'send_invoice',
  MARK_INVOICE_PAID: 'mark_invoice_paid',
  
  // Banking
  CREATE_TRANSACTION: 'create_transaction',
  READ_TRANSACTION: 'read_transaction',
  UPDATE_TRANSACTION: 'update_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  RECONCILE_TRANSACTION: 'reconcile_transaction',
  
  // Reports
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  VIEW_TAX_REPORTS: 'view_tax_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // AI Features
  USE_AI_PROCESSING: 'use_ai_processing',
  CONFIGURE_AI_MODELS: 'configure_ai_models',
  
  // Web3 Features
  USE_WEB3_FEATURES: 'use_web3_features',
  MANAGE_WEB3_WALLETS: 'manage_web3_wallets',
  
  // Tax Optimization
  READ_TAX_OPTIMIZATION: 'read_tax_optimization',
  CREATE_TAX_OPTIMIZATION: 'create_tax_optimization',
  UPDATE_TAX_OPTIMIZATION: 'update_tax_optimization',
  DELETE_TAX_OPTIMIZATION: 'delete_tax_optimization',
  APPROVE_TAX_STRATEGY: 'approve_tax_strategy',
  
  // Treasury
  READ_TREASURY: 'read_treasury',
  MANAGE_TREASURY: 'manage_treasury',
  
  // FX Conversion
  READ_FX_CONVERSION: 'read_fx_conversion',
  CONVERT_CURRENCY: 'convert_currency',
  MANAGE_FX_RATES: 'manage_fx_rates',
  
  // Vendor Verification
  READ_VENDOR_VERIFICATION: 'read_vendor_verification',
  VERIFY_VENDOR_WALLET: 'verify_vendor_wallet',
  MANAGE_PAYMENT_BLOCKS: 'manage_payment_blocks',
  
  // ERP Integration
  READ_ERP_INTEGRATION: 'read_erp_integration',
  CREATE_ERP_CONNECTION: 'create_erp_connection',
  UPDATE_ERP_CONNECTION: 'update_erp_connection',
  DELETE_ERP_CONNECTION: 'delete_erp_connection',
  SYNC_ERP_DATA: 'sync_erp_data',
  
  // Gnosis Safe
  READ_GNOSIS_SAFE: 'read_gnosis_safe',
  CREATE_GNOSIS_SAFE: 'create_gnosis_safe',
  UPDATE_GNOSIS_SAFE: 'update_gnosis_safe',
  CONFIRM_GNOSIS_TRANSACTION: 'confirm_gnosis_transaction',
  EXECUTE_GNOSIS_TRANSACTION: 'execute_gnosis_transaction',
  
  // Coinbase Prime
  READ_COINBASE_PRIME: 'read_coinbase_prime',
  CREATE_COINBASE_CONNECTION: 'create_coinbase_connection',
  MANAGE_COINBASE_ORDERS: 'manage_coinbase_orders',
  
  // System Administration
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_INTEGRATIONS: 'manage_integrations',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [ROLES.PLATFORM_ADMIN]: 100,
  [ROLES.SUPER_ADMIN]: 90,
  [ROLES.FIRM_ADMIN]: 80,
  [ROLES.FIRM_STAFF]: 70,
  [ROLES.TENANT_ADMIN]: 60,
  [ROLES.CFO]: 50,
  [ROLES.ACCOUNTANT]: 40,
  [ROLES.STAFF]: 30,
  [ROLES.VIEWER]: 10,
} as const;

// Define role permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.PLATFORM_ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
  
  [ROLES.SUPER_ADMIN]: [
    // All permissions except platform-specific
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CREATE_TENANT,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.UPDATE_TENANT,
    PERMISSIONS.DELETE_TENANT,
    PERMISSIONS.CREATE_ACCOUNT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.UPDATE_ACCOUNT,
    PERMISSIONS.DELETE_ACCOUNT,
    PERMISSIONS.POST_JOURNAL_ENTRY,
    PERMISSIONS.UNPOST_JOURNAL_ENTRY,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    PERMISSIONS.SEND_INVOICE,
    PERMISSIONS.MARK_INVOICE_PAID,
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.UPDATE_TRANSACTION,
    PERMISSIONS.DELETE_TRANSACTION,
    PERMISSIONS.RECONCILE_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.USE_AI_PROCESSING,
    PERMISSIONS.CONFIGURE_AI_MODELS,
    PERMISSIONS.USE_WEB3_FEATURES,
    PERMISSIONS.MANAGE_WEB3_WALLETS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_INTEGRATIONS,
  ],
  
  [ROLES.FIRM_ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.UPDATE_TENANT,
    PERMISSIONS.CREATE_ACCOUNT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.UPDATE_ACCOUNT,
    PERMISSIONS.DELETE_ACCOUNT,
    PERMISSIONS.POST_JOURNAL_ENTRY,
    PERMISSIONS.UNPOST_JOURNAL_ENTRY,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    PERMISSIONS.SEND_INVOICE,
    PERMISSIONS.MARK_INVOICE_PAID,
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.UPDATE_TRANSACTION,
    PERMISSIONS.DELETE_TRANSACTION,
    PERMISSIONS.RECONCILE_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.USE_AI_PROCESSING,
    PERMISSIONS.USE_WEB3_FEATURES,
    PERMISSIONS.MANAGE_WEB3_WALLETS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  
  [ROLES.FIRM_STAFF]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.CREATE_ACCOUNT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.UPDATE_ACCOUNT,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.SEND_INVOICE,
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.UPDATE_TRANSACTION,
    PERMISSIONS.RECONCILE_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.USE_AI_PROCESSING,
    PERMISSIONS.USE_WEB3_FEATURES,
  ],
  
  [ROLES.TENANT_ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.UPDATE_TENANT,
    PERMISSIONS.CREATE_ACCOUNT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.UPDATE_ACCOUNT,
    PERMISSIONS.DELETE_ACCOUNT,
    PERMISSIONS.POST_JOURNAL_ENTRY,
    PERMISSIONS.UNPOST_JOURNAL_ENTRY,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    PERMISSIONS.SEND_INVOICE,
    PERMISSIONS.MARK_INVOICE_PAID,
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.UPDATE_TRANSACTION,
    PERMISSIONS.DELETE_TRANSACTION,
    PERMISSIONS.RECONCILE_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.USE_AI_PROCESSING,
    PERMISSIONS.USE_WEB3_FEATURES,
    PERMISSIONS.MANAGE_WEB3_WALLETS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
  ],
  
  [ROLES.CFO]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.POST_JOURNAL_ENTRY,
    PERMISSIONS.UNPOST_JOURNAL_ENTRY,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.MARK_INVOICE_PAID,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.USE_AI_PROCESSING,
    PERMISSIONS.USE_WEB3_FEATURES,
  ],
  
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.CREATE_ACCOUNT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.UPDATE_ACCOUNT,
    PERMISSIONS.POST_JOURNAL_ENTRY,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.SEND_INVOICE,
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.UPDATE_TRANSACTION,
    PERMISSIONS.RECONCILE_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_TAX_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.USE_AI_PROCESSING,
  ],
  
  [ROLES.STAFF]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.CREATE_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.USE_AI_PROCESSING,
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_TENANT,
    PERMISSIONS.READ_ACCOUNT,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.READ_TRANSACTION,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
  ],
};

// Utility functions
export function hasPermission(userRole: Role | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(userRole: Role | undefined, permissions: Permission[]): boolean {
  if (!userRole) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return permissions.some(permission => rolePermissions.includes(permission));
}

export function hasAllPermissions(userRole: Role | undefined, permissions: Permission[]): boolean {
  if (!userRole) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return permissions.every(permission => rolePermissions.includes(permission));
}

export function hasHigherRole(userRole: Role | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  
  return userLevel >= requiredLevel;
}

export function canAccessTenant(userRole: Role | undefined, userTenantId: string | undefined, targetTenantId: string): boolean {
  if (!userRole || !userTenantId) return false;
  
  // Platform admins can access any tenant
  if (userRole === ROLES.PLATFORM_ADMIN || userRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // Firm admins can access their firm's tenants
  if (userRole === ROLES.FIRM_ADMIN || userRole === ROLES.FIRM_STAFF) {
    // This would need to be implemented based on firm-tenant relationships
    return true; // Simplified for now
  }
  
  // Regular users can only access their own tenant
  return userTenantId === targetTenantId;
}

// React hook for RBAC
export function useRBAC() {
  const [userRole, setUserRole] = useState<Role | undefined>(undefined);
  const [userTenant, setUserTenant] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage (stored during login)
    const token = typeof window !== 'undefined' ? localStorage.getItem('oasys_access_token') : null;
    
    if (token && typeof window !== 'undefined') {
      // Try to get user data from localStorage
      const userDataStr = localStorage.getItem('oasys_user_data');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUserRole(userData.role as Role | undefined);
          setUserTenant(userData.tenant || null);
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      } else {
        // If no user data in localStorage, try to fetch from backend
        // Use /api/v1/auth/current-user/ endpoint (not /me/)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        fetch(`${API_BASE_URL}/api/v1/auth/current-user/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            if (data.role) {
              setUserRole(data.role as Role);
              setUserTenant(data.tenant || null);
              // Store in localStorage for future use
              localStorage.setItem('oasys_user_data', JSON.stringify({
                role: data.role,
                tenant: data.tenant,
                id: data.id,
                email: data.email,
                permissions: data.permissions || [],
              }));
            }
          })
          .catch(err => {
            console.warn('Could not fetch user data from API (this is OK if user data is in localStorage):', err);
            // Silently fail - user data might not be available yet
          });
      }
    }
  }, []);

  return {
    userRole,
    userTenant,
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    hasHigherRole: (requiredRole: Role) => hasHigherRole(userRole, requiredRole),
    canAccessTenant: (targetTenantId: string) => canAccessTenant(userRole, userTenant?.id, targetTenantId),
    isAdmin: userRole === ROLES.PLATFORM_ADMIN || userRole === ROLES.SUPER_ADMIN,
    isFirmAdmin: userRole === ROLES.FIRM_ADMIN,
    isTenantAdmin: userRole === ROLES.TENANT_ADMIN,
    isCFO: userRole === ROLES.CFO,
    isAccountant: userRole === ROLES.ACCOUNTANT,
    isStaff: userRole === ROLES.STAFF,
    isViewer: userRole === ROLES.VIEWER,
  };
}

// Component wrapper for permission-based rendering
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: React.ComponentType
) {
  return function PermissionWrapper(props: P) {
    const { hasPermission } = useRBAC();
    
    if (!hasPermission(permission)) {
      if (fallback) {
        return React.createElement(fallback, props);
      }
      return null;
    }
    
    return React.createElement(Component, props);
  };
}

// Higher-order component for role-based access
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: Role,
  fallback?: React.ComponentType
) {
  return function RoleWrapper(props: P) {
    const { hasHigherRole } = useRBAC();
    
    if (!hasHigherRole(requiredRole)) {
      if (fallback) {
        return React.createElement(fallback, props);
      }
      return null;
    }
    
    return React.createElement(Component, props);
  };
}
