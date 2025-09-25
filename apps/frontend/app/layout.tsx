import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OASYS - AI-Powered Business Finance Platform | Beta Launch",
  description: "Transform your financial operations with AI-powered automation, blockchain security, and real-time insights. Join our beta program for early access to the future of business finance.",
  keywords: [
    "AI accounting software",
    "business finance automation",
    "blockchain accounting",
    "digital identity verification",
    "smart contracts",
    "financial management platform",
    "beta program",
    "early access",
    "DID digital identity",
    "automated bookkeeping",
    "AI document processing",
    "financial forecasting",
    "compliance automation",
    "real-time financial insights"
  ],
  authors: [{ name: "OASYS Team" }],
  creator: "OASYS",
  publisher: "OASYS",
  generator: 'Next.js',
  manifest: '/manifest.json',
  metadataBase: new URL('https://oasys.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    title: 'OASYS - AI-Powered Business Finance Platform | Beta Launch',
    description: 'Transform your financial operations with AI-powered automation, blockchain security, and real-time insights. Join our beta program for early access.',
    url: 'https://oasys.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OASYS - AI-Powered Business Finance Platform',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@oasysfinance',
    creator: '@oasysfinance',
    title: 'OASYS - AI-Powered Business Finance Platform | Beta Launch',
    description: 'Transform your financial operations with AI-powered automation, blockchain security, and real-time insights. Join our beta program.',
    images: ['/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://oasys.com',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4A90E2',
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
