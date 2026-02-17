"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { Card } from "@/components/ui/card"
import { Zap, Loader2 } from "lucide-react"

// Global flag to prevent multiple simultaneous checks
let isCheckingOnboardingPage = false
let lastCheckOnboardingPage = 0
const CHECK_COOLDOWN_ONBOARDING = 3000 // 3 seconds between checks

export default function OnboardingPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null)
  const hasRedirected = useRef(false)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingOnboardingPage) {
      console.log('OnboardingPage - Check already in progress, skipping')
      setIsLoading(false)
      return
    }

    // Rate limiting - don't check too frequently
    const now = Date.now()
    if (now - lastCheckOnboardingPage < CHECK_COOLDOWN_ONBOARDING) {
      console.log('OnboardingPage - Rate limited, skipping')
      setIsLoading(false)
      return
    }

    // Prevent redirect loops
    if (hasRedirected.current) {
      console.log('OnboardingPage - Already redirected, skipping')
      setIsLoading(false)
      return
    }

    isCheckingOnboardingPage = true
    lastCheckOnboardingPage = now

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
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        // Clear invalid token and redirect to login immediately
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

      if (!response.ok) {
        let errorMessage = `Failed to check onboarding status (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        console.error('Onboarding status check failed:', errorMessage)
        // Don't redirect on error - let user see the onboarding page
        setOnboardingStatus({
          onboarding_status: 'INCOMPLETE',
          current_step: 1,
          completed_steps: [],
          can_access_dashboard: false,
        })
        return
      }

      const data = await response.json()
      setOnboardingStatus(data)

      // If already completed, redirect to dashboard
      if (data.onboarding_status === 'COMPLETED' && data.can_access_dashboard) {
        router.push('/accounting')
        return
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
      // On network error, set default status so wizard can still be shown
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error: Backend server may not be running at', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000')
      }
      setOnboardingStatus({
        onboarding_status: 'INCOMPLETE',
        current_step: 1,
        completed_steps: [],
        can_access_dashboard: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading onboarding...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">OASYS</span>
          </div>
        </div>

        {/* Onboarding Wizard */}
        <OnboardingWizard 
          initialStatus={onboardingStatus}
          onComplete={async () => {
            // Clear all local storage
            localStorage.removeItem('oasys_access_token')
            localStorage.removeItem('oasys_refresh_token')
            localStorage.removeItem('oasys_user_data')
            localStorage.removeItem('oasys_tenant_data')
            localStorage.removeItem('oasys_subscription_plan')
            
            // Clear any other onboarding-related storage
            const keysToRemove: string[] = []
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.startsWith('oasys_')) {
                keysToRemove.push(key)
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))
            
            // Call logout to clear auth state
            try {
              await logout()
            } catch (error) {
              console.error('Logout error:', error)
            }
            
            // Redirect to login page
            router.push('/auth/login')
          }}
        />
      </div>
    </div>
  )
}

