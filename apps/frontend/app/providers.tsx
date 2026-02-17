"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { OrganizationProvider } from "@/hooks/use-organization"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <OrganizationProvider>
          {children}
          <Toaster />
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}