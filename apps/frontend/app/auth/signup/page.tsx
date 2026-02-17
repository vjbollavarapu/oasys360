"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Zap, ArrowLeft, Shield, Building2, Mail, Phone, DollarSign, User, UserPlus, AlertCircle, Globe } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    domain: "",
    password: "",
    confirmPassword: "",
    terms: false,
    newsletter: false,
  })

  const [signupError, setSignupError] = useState("")

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CHF", label: "CHF - Swiss Franc" },
    { value: "CNY", label: "CNY - Chinese Yuan" },
  ]

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.company.trim() !== "" &&
      formData.domain.trim() !== "" &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.terms
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError("")

    // Validation
    if (!isFormValid()) {
      setSignupError("Please fill in all required fields and ensure passwords match")
      return
    }

    setIsLoading(true)

    try {
      // Get API base URL (fixed for row-based multi-tenancy)
      const { getApiBaseUrl } = await import('@/lib/get-api-url')
      const API_BASE_URL = getApiBaseUrl()
      
      // Prepare registration data
      const registrationData = {
        username: formData.email.split('@')[0], // Use email prefix as username
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        tenant_name: formData.company || undefined,
        company_name: formData.company || undefined,
        domain: formData.domain || undefined,
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors
        const errorMessage = data.detail || data.error || 
          (data.email && (Array.isArray(data.email) ? data.email[0] : data.email)) ||
          (data.password && (Array.isArray(data.password) ? data.password[0] : data.password)) ||
          (data.non_field_errors && (Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors)) ||
          'Registration failed. Please check your details and try again.'
        setSignupError(errorMessage)
        return
      }

      // Store tokens if provided
      if (data.tokens?.access) {
        localStorage.setItem('oasys_access_token', data.tokens.access)
      }
      if (data.tokens?.refresh) {
        localStorage.setItem('oasys_refresh_token', data.tokens.refresh)
      }

      // Store user data
      if (data.user) {
        localStorage.setItem('oasys_user_data', JSON.stringify({
          role: data.user.role,
          tenant: data.tenant,
          id: data.user.id,
          email: data.user.email,
          account_type: data.user.account_type,
          account_tier: data.user.account_tier,
        }))
      }

      console.log("Account created successfully!", data)

      // Determine redirect URL
      let redirectUrl = data.redirect_url
      
      // If no redirect_url provided, construct from tenant slug
      if (!redirectUrl && data.tenant?.slug) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        if (isLocalhost) {
          redirectUrl = `http://${data.tenant.slug}.localhost:3000/onboarding`
        } else {
          const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'oasys360.com'
          redirectUrl = `https://${data.tenant.slug}.${baseDomain}/onboarding`
        }
      }
      
      // Fallback to onboarding on current domain if no tenant
      if (!redirectUrl) {
        redirectUrl = '/onboarding'
      }

      // Show verification message instead of redirecting immediately
      // User must verify email first, then login via subdomain link in email
      if (data.requires_verification) {
        // Show verification message page
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(redirectUrl || '')}`
      } else {
        // If already verified (shouldn't happen), redirect to onboarding
        window.location.href = redirectUrl
      }
    } catch (error) {
      console.error("Signup error:", error)
      const errorMessage = error instanceof Error ? error.message : 'Account creation failed. Please try again.'
      setSignupError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-blue-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">OASYS</span>
          </div>
        </div>

        {/* Main Content - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Form */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="w-5 h-5" />
                Create Your Account
              </CardTitle>
              <CardDescription className="text-sm">
                Fill in your details to create your account
              </CardDescription>

              {signupError && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-xl text-xs flex items-center gap-2 mt-2">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {signupError}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name Fields - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="rounded-xl h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="rounded-xl h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email and Company - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="rounded-xl h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-xs flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" />
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Your Company Inc."
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="rounded-xl h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Domain Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="domain" className="text-xs flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    Domain / Subdomain
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="domain"
                      type="text"
                      placeholder="yourcompany"
                      value={formData.domain}
                      onChange={(e) => handleInputChange("domain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="rounded-xl h-9 text-sm flex-1"
                      required
                      disabled={isLoading}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                        ? '.localhost:3000'
                        : '.oasys360.com'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be your unique subdomain for accessing your account
                  </p>
                </div>

                {/* Passwords - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="rounded-xl h-9 text-sm pr-8"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-2 rounded-r-xl"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="rounded-xl h-9 text-sm pr-8"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-2 rounded-r-xl"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Password Requirements - Compact */}
                <div className="text-xs text-muted-foreground -mt-1">
                  Min 8 chars with uppercase, lowercase, number, and special character
                </div>

                {/* Terms and Newsletter - Compact */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => handleInputChange("terms", checked)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link href="https://www.oasys360.com/terms" target="_blank" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="https://www.oasys360.com/privacy" target="_blank" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange("newsletter", checked)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <Label htmlFor="newsletter" className="text-xs cursor-pointer">
                      Send me product updates and news (optional)
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full rounded-full h-10 text-sm"
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <span>Create Account</span>
                  )}
                </Button>
              </form>

              {/* Links - Compact */}
              <div className="text-center pt-2">
                <div className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Social Sign-up & Info */}
          <div className="flex flex-col space-y-4">
            {/* Social Sign-up Card */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Sign Up</CardTitle>
                <CardDescription className="text-xs">
                  Use your social account to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full rounded-full h-10 text-sm" 
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
                
                <div className="text-xs text-muted-foreground text-center pt-2">
                  <p className="mb-1">Corporate email required for</p>
                  <p className="font-medium">full business features</p>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Secure & Compliant</h3>
                      <p className="text-xs text-muted-foreground">
                        Enterprise-grade security for your financial data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Business Ready</h3>
                      <p className="text-xs text-muted-foreground">
                        Full features for accounting, invoicing, and banking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Quick Setup</h3>
                      <p className="text-xs text-muted-foreground">
                        Automatic country presets and configurations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
