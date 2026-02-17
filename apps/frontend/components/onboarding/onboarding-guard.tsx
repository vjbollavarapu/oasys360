"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface OnboardingGuardProps {
  children: React.ReactNode
}

// Global flag to prevent multiple simultaneous checks
let isCheckingGlobal = false
let lastCheckTime = 0
const CHECK_COOLDOWN = 2000 // 2 seconds between checks

/**
 * OnboardingGuard - Protects routes by checking onboarding status
 * Redirects to /onboarding if incomplete
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [canAccess, setCanAccess] = useState(false)
  const hasRedirected = useRef(false)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingGlobal) {
      console.log('OnboardingGuard - Check already in progress, skipping')
      return
    }

    // Rate limiting - don't check too frequently
    const now = Date.now()
    if (now - lastCheckTime < CHECK_COOLDOWN) {
      console.log('OnboardingGuard - Rate limited, skipping')
      setIsChecking(false)
      return
    }

    // Prevent redirect loops
    if (hasRedirected.current) {
      console.log('OnboardingGuard - Already redirected, skipping')
      setIsChecking(false)
      return
    }

    isCheckingGlobal = true
    lastCheckTime = now

    try {
      // Get API base URL (fixed for row-based multi-tenancy)
      const { getApiBaseUrl } = await import('@/lib/get-api-url')
      const API_BASE_URL = getApiBaseUrl()
      const token = localStorage.getItem('oasys_access_token')
      
      if (!token) {
        if (!hasRedirected.current) {
          hasRedirected.current = true
          router.push('/auth/login')
        }
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/tenants/onboarding/status/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401 || response.status === 403) {
        // Clear invalid tokens immediately
        localStorage.removeItem('oasys_access_token')
        localStorage.removeItem('oasys_refresh_token')
        localStorage.removeItem('oasys_user_data')
        localStorage.removeItem('oasys_tenant_data')
        
        if (!hasRedirected.current) {
          hasRedirected.current = true
          router.push('/auth/login')
        }
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log('OnboardingGuard - Status check:', data)
        
        // Redirect to onboarding if incomplete
        if (data.onboarding_status !== 'COMPLETED' || !data.can_access_dashboard) {
          console.log('OnboardingGuard - Incomplete, redirecting to onboarding')
          if (!hasRedirected.current) {
            hasRedirected.current = true
            router.push('/onboarding')
          }
          return
        }
        
        // Onboarding complete - allow access
        console.log('OnboardingGuard - Complete, allowing access')
        setCanAccess(true)
      } else {
        // API returned error - assume incomplete for safety
        console.error('OnboardingGuard - API error:', response.status, response.statusText)
        if (response.status === 401 || response.status === 403) {
          // Clear invalid tokens and redirect to login
          localStorage.removeItem('oasys_access_token')
          localStorage.removeItem('oasys_refresh_token')
          localStorage.removeItem('oasys_user_data')
          localStorage.removeItem('oasys_tenant_data')
          
          if (!hasRedirected.current) {
            hasRedirected.current = true
            router.push('/auth/login')
          }
          return
        }
        // For other errors, redirect to onboarding (safer than allowing access)
        if (!hasRedirected.current) {
          hasRedirected.current = true
          router.push('/onboarding')
        }
      }
    } catch (error) {
      console.error('OnboardingGuard - Failed to check onboarding status:', error)
      // On error, redirect to onboarding (safer than allowing access)
      // This ensures users complete onboarding even if API is temporarily unavailable
      if (!hasRedirected.current) {
        hasRedirected.current = true
        router.push('/onboarding')
      }
    } finally {
      isCheckingGlobal = false
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking access...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!canAccess) {
    return null // Redirect is happening
  }

  return <>{children}</>
}

