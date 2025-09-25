"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, CheckCircle, BarChart3, Brain, Shield } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#1B1D23] text-[#F3F4F6]">
      {/* Header */}
      <header className="border-b border-[#4B0082]/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-[#00FFC6] hover:text-[#00FFC6]/80">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#4B0082] to-[#00FFC6] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">OASYS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge className="bg-[#4B0082]/20 text-[#00FFC6] border-[#00FFC6]/30 mb-4">🎥 Interactive Demo</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">See OASYS in Action</h1>
          <p className="text-xl text-[#F3F4F6]/80 max-w-3xl mx-auto">
            Watch how OASYS transforms accounting and inventory management with AI-powered automation and blockchain
            security.
          </p>
        </div>

        {/* Video Demo Section */}
        <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30 mb-12">
          <CardContent className="p-8">
            <div className="aspect-video bg-gradient-to-br from-[#4B0082]/20 to-[#00FFC6]/10 rounded-lg flex items-center justify-center mb-6">
              <Button size="lg" className="bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">
                <Play className="w-6 h-6 mr-2" />
                Play Demo Video (5:30)
              </Button>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Complete Platform Walkthrough</h3>
              <p className="text-[#F3F4F6]/70">
                See how finance teams save 15+ hours per week with automated categorization, blockchain audit trails,
                and AI-powered insights.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
            <CardHeader>
              <Brain className="w-12 h-12 text-[#00FFC6] mb-4" />
              <CardTitle>AI Categorization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#F3F4F6]/70 mb-4">
                Watch transactions get automatically categorized with 99.7% accuracy in real-time.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm">Smart pattern recognition</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm">Learning from corrections</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
            <CardHeader>
              <Shield className="w-12 h-12 text-[#4B0082] mb-4" />
              <CardTitle>Blockchain Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#F3F4F6]/70 mb-4">
                See how blockchain creates immutable audit trails for complete transparency.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm">Tamper-proof records</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm">Instant verification</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-[#FFC700] mb-4" />
              <CardTitle>Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#F3F4F6]/70 mb-4">Explore predictive analytics and automated compliance reporting.</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm">Demand forecasting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm">Compliance automation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-[#4B0082]/20 to-[#00FFC6]/10 border-[#00FFC6]/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Finance Operations?</h3>
            <p className="text-[#F3F4F6]/80 mb-6">
              Start your free 14-day trial and see the difference OASYS can make for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90" asChild>
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#4B0082] text-[#F3F4F6] hover:bg-[#4B0082]/20"
                asChild
              >
                <Link href="/contact">Schedule Live Demo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
