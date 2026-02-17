"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')
  const [loginUrl, setLoginUrl] = useState('')
  
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''
  const redirectUrl = searchParams.get('redirect') || ''

  useEffect(() => {
    // If token is provided, verify immediately
    if (token && email) {
      verifyEmail()
    } else if (email) {
      // Just show the message
      setStatus('pending')
      setMessage('Please check your email for the verification link.')
      
      // Extract subdomain from redirect URL to build login URL
      if (redirectUrl) {
        try {
          const url = new URL(redirectUrl)
          const hostname = url.hostname
          const protocol = url.protocol
          const port = url.port ? `:${url.port}` : ''
          
          // Extract subdomain
          const parts = hostname.split('.')
          if (parts.length > 1 && parts[0] !== 'www') {
            const subdomain = parts[0]
            setLoginUrl(`${protocol}//${subdomain}.${parts.slice(1).join('.')}${port}/auth/login`)
          } else {
            setLoginUrl(`${protocol}//${hostname}${port}/auth/login`)
          }
        } catch (e) {
          // Fallback
          const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          setLoginUrl(isLocalhost ? 'http://localhost:3000/auth/login' : 'https://app.oasys360.com/auth/login')
        }
      }
    }
  }, [token, email, redirectUrl])

  const verifyEmail = async () => {
    setStatus('verifying')
    setMessage('Verifying your email...')

    try {
      // Get API base URL (fixed for row-based multi-tenancy)
      const { getApiBaseUrl } = await import('@/lib/get-api-url')
      const API_BASE_URL = getApiBaseUrl()
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/account/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage('Email verified successfully! You can now log in to your account.')
        
        // Extract login URL from redirect URL
        if (redirectUrl) {
          try {
            const url = new URL(redirectUrl)
            const hostname = url.hostname
            const protocol = url.protocol
            const port = url.port ? `:${url.port}` : ''
            
            const parts = hostname.split('.')
            if (parts.length > 1 && parts[0] !== 'www') {
              const subdomain = parts[0]
              setLoginUrl(`${protocol}//${subdomain}.${parts.slice(1).join('.')}${port}/auth/login`)
            } else {
              setLoginUrl(`${protocol}//${hostname}${port}/auth/login`)
            }
          } catch (e) {
            const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            setLoginUrl(isLocalhost ? 'http://localhost:3000/auth/login' : 'https://app.oasys360.com/auth/login')
          }
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed. Please try again or request a new verification email.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {status === 'success' ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : status === 'error' ? (
              <AlertCircle className="w-8 h-8 text-red-600" />
            ) : status === 'verifying' ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <Mail className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'success' ? 'Email Verified!' : status === 'error' ? 'Verification Failed' : status === 'verifying' ? 'Verifying...' : 'Check Your Email'}
          </CardTitle>
          <CardDescription className="mt-2">
            {status === 'success' 
              ? 'Your email has been verified successfully.'
              : status === 'error'
              ? 'There was an issue verifying your email.'
              : status === 'verifying'
              ? 'Please wait while we verify your email...'
              : 'We\'ve sent a verification link to your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Email:</strong> {email}
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'pending' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Please check your inbox and click the verification link. After verification, you can log in using the link provided in the email.
              </p>
              {loginUrl && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-1">Your login URL:</p>
                  <p className="text-xs text-blue-700 break-all">{loginUrl}</p>
                </div>
              )}
            </div>
          )}

          {status === 'success' && loginUrl && (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                You can now log in to your account using the credentials you created during signup.
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = loginUrl}
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={verifyEmail}
              >
                Try Again
              </Button>
              <Link href="/auth/login" className="block text-center text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          )}

          {!token && status === 'pending' && (
            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Already verified? Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

