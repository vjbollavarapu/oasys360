/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */

"use client";

import { ReactNode } from 'react';
import { useRBAC } from '@/lib/rbac';
import { PERMISSIONS } from '@/lib/rbac';

interface PermissionGateProps {
  children: ReactNode;
  permission: keyof typeof PERMISSIONS;
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function PermissionGate({ 
  children, 
  permission, 
  fallback = null, 
  requireAll = false 
}: PermissionGateProps) {
  const { hasPermission } = useRBAC();

  if (hasPermission(PERMISSIONS[permission])) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface MultiplePermissionsGateProps {
  children: ReactNode;
  permissions: (keyof typeof PERMISSIONS)[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function MultiplePermissionsGate({ 
  children, 
  permissions, 
  fallback = null, 
  requireAll = false 
}: MultiplePermissionsGateProps) {
  const { hasAnyPermission, hasAllPermissions } = useRBAC();
  
  const permissionValues = permissions.map(p => PERMISSIONS[p]);
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissionValues)
    : hasAnyPermission(permissionValues);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface RoleGateProps {
  children: ReactNode;
  requiredRole: string;
  fallback?: ReactNode;
  allowHigher?: boolean;
}

export function RoleGate({ 
  children, 
  requiredRole, 
  fallback = null, 
  allowHigher = true 
}: RoleGateProps) {
  const { hasHigherRole, userRole } = useRBAC();

  const hasAccess = allowHigher 
    ? hasHigherRole(requiredRole as any)
    : userRole === requiredRole;

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface TenantGateProps {
  children: ReactNode;
  targetTenantId: string;
  fallback?: ReactNode;
}

export function TenantGate({ 
  children, 
  targetTenantId, 
  fallback = null 
}: TenantGateProps) {
  const { canAccessTenant } = useRBAC();

  if (canAccessTenant(targetTenantId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export default PermissionGate;
