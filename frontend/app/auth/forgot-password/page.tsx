"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Zap, ArrowLeft, Mail, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#1B1D23] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#F3F4F6]">OASYS</span>
            </div>
          </div>

          {/* Success Card */}
          <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#00FFC6]/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-[#00FFC6]" />
              </div>
              <CardTitle className="text-[#F3F4F6]">Check Your Email</CardTitle>
              <CardDescription className="text-[#F3F4F6]/70">
                We've sent a password reset link to <strong className="text-[#00FFC6]">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#4B0082]/10 border border-[#4B0082]/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#FFC700] mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#F3F4F6]">What's next?</p>
                    <ul className="text-xs text-[#F3F4F6]/70 space-y-1">
                      <li>• Check your email inbox (and spam folder)</li>
                      <li>• Click the reset link within 15 minutes</li>
                      <li>• Create a new secure password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="border-[#4B0082]/50 text-[#F3F4F6] hover:bg-[#4B0082]/20"
                >
                  Try Different Email
                </Button>

                <Link href="/auth/login">
                  <Button className="w-full bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">Back to Sign In</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1B1D23] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-2 text-[#F3F4F6] hover:text-[#00FFC6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>

          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#F3F4F6]">OASYS</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#F3F4F6]">Reset Your Password</h1>
            <p className="text-[#F3F4F6]/70">Enter your email to receive a reset link</p>
          </div>
        </div>

        {/* Reset Form */}
        <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Password Reset
            </CardTitle>
            <CardDescription className="text-[#F3F4F6]/70">
              We'll send you a secure link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#F3F4F6]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1B1D23] border-[#4B0082]/30 text-[#F3F4F6] placeholder:text-[#F3F4F6]/50 focus:border-[#00FFC6] focus:ring-[#00FFC6]"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90 font-semibold py-6"
              >
                {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#F3F4F6]/70">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-[#00FFC6] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <Badge className="bg-[#4B0082]/20 text-[#FFC700] border-[#FFC700]/30">
            🔒 Reset links expire in 15 minutes for security
          </Badge>
        </div>
      </div>
    </div>
  )
}
