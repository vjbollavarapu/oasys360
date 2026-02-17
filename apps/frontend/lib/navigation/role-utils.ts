/**
 * Role Utilities
 * 
 * Provides role hierarchy and access control functions for navigation
 */

export type UserRole = 
  | 'platform_admin' 
  | 'tenant_admin' 
  | 'firm_admin' 
  | 'cfo' 
  | 'accountant' 
  | 'staff';

// Assign numeric weights to roles for easy comparison
export const RoleWeights: Record<UserRole, number> = {
  platform_admin: 100,
  tenant_admin: 80,
  firm_admin: 60,
  cfo: 40,
  accountant: 20,
  staff: 10,
};

/**
 * Checks if a user has sufficient privileges
 * @param userRole The role of the logged-in user
 * @param requiredRole The minimum role required for the menu item
 * @returns true if user has access, false otherwise
 */
export const hasAccess = (userRole: UserRole | string, requiredRole: UserRole): boolean => {
  // Platform Admin always has access to everything
  if (userRole === 'platform_admin') return true;
  
  // Map legacy 'user' role to 'staff' for compatibility
  if (userRole === 'user') {
    userRole = 'staff';
  }
  
  const userWeight = RoleWeights[userRole as UserRole] || 0;
  const requiredWeight = RoleWeights[requiredRole];
  
  // If user role is not recognized, deny access
  if (userWeight === 0 && userRole !== 'staff') {
    console.warn(`Unknown user role: ${userRole}, denying access`);
    return false;
  }
  
  return userWeight >= requiredWeight;
};

/**
 * Get the minimum role from a list of roles
 * @param roles Array of role strings
 * @returns The role with the lowest weight
 */
export const getMinRole = (roles: string[]): UserRole => {
  if (roles.length === 0) return 'staff';
  
  let minRole: UserRole = 'staff';
  let minWeight = RoleWeights.staff;
  
  for (const role of roles) {
    const weight = RoleWeights[role as UserRole] || 0;
    if (weight < minWeight) {
      minWeight = weight;
      minRole = role as UserRole;
    }
  }
  
  return minRole;
};

/**
 * Check if a role string is a valid UserRole
 */
export const isValidRole = (role: string): role is UserRole => {
  return role in RoleWeights;
};

