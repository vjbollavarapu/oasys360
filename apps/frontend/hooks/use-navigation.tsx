"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "./use-auth"
import {
  getNavigationForRoleAndPortal,
  detectPortal,
  type NavigationItem,
} from "@/lib/navigation/config"

/**
 * Hook to get navigation items based on user role and portal
 * 
 * @returns Navigation items filtered by role, permissions, and portal
 */
export function useNavigation(): {
  navigationItems: NavigationItem[]
  portal: string
  isLoading: boolean
} {
  const { user, tenant, isLoading } = useAuth()
  const pathname = usePathname()

  const { navigationItems, portal } = useMemo(() => {
    if (isLoading || !user) {
      return {
        navigationItems: [],
        portal: 'web',
      }
    }

    // Detect current portal
    const currentPortal = detectPortal(pathname, typeof window !== 'undefined' ? window.navigator.userAgent : undefined)

    // Get user role (default to 'staff' if not set, map 'user' to 'staff')
    // Map legacy 'user' role to 'staff' for compatibility
    let userRole = user.role || 'staff'
    if (userRole === 'user') {
      userRole = 'staff'
    }
    
    // Debug: Log user role for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('[Navigation Debug] User object:', { role: user.role, email: user.email, id: user.id })
      console.log('[Navigation Debug] Mapped role:', userRole)
    }

    // Get user permissions
    const userPermissions = user.permissions || []

    // Get navigation items for this role and portal
    const items = getNavigationForRoleAndPortal(
      userRole,
      currentPortal,
      userPermissions
    )

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Navigation] User role:', userRole, 'Portal:', currentPortal, 'Items:', items.length)
    }

    return {
      navigationItems: items,
      portal: currentPortal,
    }
  }, [user, tenant, pathname, isLoading])

  return {
    navigationItems,
    portal,
    isLoading,
  }
}

