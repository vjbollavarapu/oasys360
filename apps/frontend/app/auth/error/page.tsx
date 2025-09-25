"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Zap } from "lucide-react"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

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

        {/* Error Card */}
        <Card className="bg-[#1B1D23]/50 border-red-500/30 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Authentication Error
            </CardTitle>
            <CardDescription className="text-[#F3F4F6]/70">There was a problem signing you in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm">
              {errorMessage}
            </div>

            <div className="space-y-2">
              <Link href="/auth/login">
                <Button className="w-full bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90 font-semibold">
                  Try Again
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full border-[#4B0082]/50 text-[#F3F4F6] hover:bg-[#4B0082]/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
