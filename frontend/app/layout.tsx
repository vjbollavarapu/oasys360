import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OASYS - Online Accounting System",
  description: "Next-generation financial management platform with AI and Web3 capabilities",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OASYS'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'OASYS',
    title: 'OASYS - Online Accounting System',
    description: 'Next-generation financial management platform with AI and Web3 capabilities'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OASYS - Online Accounting System',
    description: 'Next-generation financial management platform with AI and Web3 capabilities'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  )
}
