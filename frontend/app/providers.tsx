"use client"

import type { ReactNode } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { OrganizationProvider } from "@/hooks/use-organization"
import { ServiceWorkerRegistration, PWAInstallPrompt } from "@/components/service-worker-registration"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          {children}
        </ThemeProvider>
      </OrganizationProvider>
    </AuthProvider>
  )
}
