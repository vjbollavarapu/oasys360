"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Zap, ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"
import { WalletConnect } from "@/components/web3/wallet-connect"

export default function Web3LoginPage() {
  useEffect(() => {
    // Check if MetaMask is installed
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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
            <h1 className="text-2xl font-bold">Web3 Authentication</h1>
            <p className="text-[#F3F4F6]/70">Connect your wallet to access OASYS</p>
          </div>
        </div>

        {/* Web3 Connection Card */}
        <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </CardTitle>
            <CardDescription className="text-[#F3F4F6]/70">
              Use your Web3 wallet to securely access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <WalletConnect
              onConnect={(address) => {
                console.log("Wallet connected:", address)
                // Handle successful connection - redirect to dashboard
              }}
              onDisconnect={() => {
                console.log("Wallet disconnected")
              }}
            />

            <div className="mt-6">
              <Separator className="bg-[#4B0082]/30" />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#4B0082]/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1B1D23] px-2 text-[#F3F4F6]/60">Or use traditional login</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-[#4B0082]/50 text-[#F3F4F6] hover:bg-[#4B0082]/20">
                  Sign in with Email
                </Button>
              </Link>

              <div className="text-center">
                <p className="text-sm text-[#F3F4F6]/70">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-[#00FFC6] hover:underline font-medium">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <Badge className="bg-[#4B0082]/20 text-[#00FFC6] border-[#00FFC6]/30">
            🔐 Your wallet signature is used for secure authentication
          </Badge>
        </div>
      </div>
    </div>
  )
}
