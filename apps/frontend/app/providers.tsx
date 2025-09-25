"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}