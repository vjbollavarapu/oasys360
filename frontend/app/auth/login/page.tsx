"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Zap, ArrowLeft, Mail, Shield, Smartphone, AlertCircle, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useErrorHandler } from "@/hooks/use-error-handler"

export default function LoginPage() {
  const router = useRouter()
  const { error, handleError, clearError } = useErrorHandler()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    twoFactorCode: "",
  })

  // Test user accounts for easy testing
  const testUsers = [
    { id: "demo", email: "demo@company.com", password: "Demo123!", role: "Staff", description: "Demo User - Basic Access", tenant: "Demo Corp" },
    { id: "techflow-admin", email: "admin@techflow.com", password: "Admin123!", role: "Tenant Admin", description: "Business Admin - Full Web3", tenant: "TechFlow Solutions" },
    { id: "cfo", email: "cfo@techflow.com", password: "CFO123!", role: "CFO", description: "Chief Financial Officer", tenant: "TechFlow Solutions" },
    { id: "firm-admin", email: "admin@globalaccounting.com", password: "Firm123!", role: "Firm Admin", description: "Accounting Firm - Enterprise", tenant: "Global Accounting Firm" },
    { id: "firm-staff", email: "accountant@globalaccounting.com", password: "Account123!", role: "Firm Staff", description: "Firm Accountant", tenant: "Global Accounting Firm" },
    { id: "platform-admin", email: "platform@oasys.com", password: "Platform123!", role: "Platform Admin", description: "Platform Administrator", tenant: "OASYS Platform" },
    { id: "legacy", email: "admin@oasys.com", password: "Admin123!", role: "Legacy Admin", description: "Legacy Administrator", tenant: "Legacy System" }
  ]

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/accounting")
      }
    }
    checkSession()
  }, [router])

  const handleUserSelect = (userId: string) => {
    const selectedUser = testUsers.find(user => user.id === userId)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        email: selectedUser.email,
        password: selectedUser.password
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    // Basic validation
    if (!formData.email || !formData.password) {
      setLoginError("Please fill in all required fields")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setLoginError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // For demo purposes, simulate 2FA step
      if (!show2FA) {
        setShow2FA(true)
        setIsLoading(false)
        return
      }

      // Validate 2FA code for demo
      if (formData.twoFactorCode !== "123456") {
        setLoginError("Invalid authentication code. Use: 123456")
        setIsLoading(false)
        return
      }

      // Attempt authentication with NextAuth.js
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError("Invalid credentials. Please check your email and password.")
        setShow2FA(false)
      } else if (result?.ok) {
        // Success - redirect to dashboard
        router.push("/accounting")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Network error. Please check your connection and try again.")
      setShow2FA(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (loginError) {
      setLoginError("")
    }
  }

  const isFormValid = () => {
    if (show2FA) {
      return formData.twoFactorCode.length === 6
    }
    return formData.email.length > 0 && formData.password.length > 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">

          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">OASYS</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {show2FA ? (
                <>
                  <Smartphone className="w-5 h-5" />
                  Two-Factor Authentication
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In
                </>
              )}
            </CardTitle>
            <CardDescription>
              {show2FA ? "Enter the 6-digit code: 123456" : "Enter your credentials to access your account"}
            </CardDescription>

            {show2FA && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span><strong>Testing:</strong> Use code <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">123456</code> for all test accounts</span>
              </div>
            )}

            {loginError && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {loginError}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!show2FA ? (
                <>
                  {/* Test User Selection Dropdown */}
                  <div className="space-y-3">
                    <Label htmlFor="testUser" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Quick Test Login
                    </Label>
                    <Select onValueChange={handleUserSelect}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a test user account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {testUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.role}</span>
                              <span className="text-xs text-muted-foreground">{user.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.email && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {testUsers.find(u => u.email === formData.email)?.role || 'User'}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              {formData.email}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Test Account
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="demo@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="rounded-xl"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="rounded-xl pr-10"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 rounded-r-xl"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">Remember me for 30 days</Label>
                  </div>
                </>
              ) : (
                /* 2FA Code */
                <div className="space-y-3">
                  <Label htmlFor="twoFactorCode" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Authentication Code
                  </Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    placeholder="123456"
                    value={formData.twoFactorCode}
                    onChange={(e) => handleInputChange("twoFactorCode", e.target.value)}
                    className="rounded-xl text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>{show2FA ? "Verifying..." : "Signing in..."}</span>
                  </div>
                ) : (
                  <span>{show2FA ? "Verify & Sign In" : "Sign In"}</span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Alternative Sign-in Options */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-full" disabled={isLoading}>
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
            </div>

            {/* Links */}
            <div className="text-center space-y-2">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot your password?
              </Link>
              <div className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
