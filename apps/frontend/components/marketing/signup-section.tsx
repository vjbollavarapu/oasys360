"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  CheckCircle, 
  Bot, 
  Sparkles,
  Shield,
  Zap,
  Brain,
  Star
} from "lucide-react"

export function SignupSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const benefits = [
    {
      icon: Bot,
      title: "AI-Powered Automation",
      description: "99.5% accurate document processing and smart categorization"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and blockchain-based audit trails"
    },
    {
      icon: Zap,
      title: "Real-time Insights",
      description: "Instant financial analytics and predictive forecasting"
    },
    {
      icon: Brain,
      title: "Smart Compliance",
      description: "Automated regulatory compliance across 45+ countries"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CFO, TechCorp",
      content: "OASYS AI reduced our invoice processing time by 90%. The predictive analytics helped us identify $2M in cost savings.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Finance Director, GlobalRetail",
      content: "The Web3 integration and smart contracts have revolutionized our supply chain transparency and reduced disputes by 75%.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "CEO, StartupInc",
      content: "As a growing business, OASYS scaled with us perfectly. The AI insights helped us make data-driven decisions that increased revenue by 40%.",
      rating: 5
    }
  ]

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Reset form
    setEmail("")
    setIsSubmitting(false)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Beta Launch - Limited Early Access
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Be Among the First to Experience
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered Finance
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              We're building the future of business finance. Join our beta program and help shape 
              the next generation of AI-powered financial tools with blockchain security and founder-level support.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Signup Form */}
            <div>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Join Our Beta Program
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Free beta access • Early adopter pricing • Direct founder feedback
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handleWaitlistSignup} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your business email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 focus:bg-white/30 focus:border-white/50"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Joining Waitlist...
                        </>
                      ) : (
                        <>
                          Join Beta Program
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-blue-200">
                      By signing up, you agree to our{" "}
                      <a href="/terms" className="text-white hover:underline">Terms of Service</a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-white hover:underline">Privacy Policy</a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Beta Benefits */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">Beta</div>
                  <div className="text-sm text-blue-200">Early Access</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">AI</div>
                  <div className="text-sm text-blue-200">Powered</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">Founder</div>
                  <div className="text-sm text-blue-200">Access</div>
                </div>
              </div>
            </div>

            {/* Right Column - Benefits & Testimonials */}
            <div className="space-y-8">
              {/* Benefits */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  What You Get with OASYS AI
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                        <p className="text-sm text-blue-200 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beta Invitation */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Help Shape the Future
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h4 className="text-white font-semibold mb-2">Early Adopter Benefits</h4>
                    <ul className="text-blue-100 text-sm space-y-1">
                      <li>• Free beta access for 6 months</li>
                      <li>• Early adopter pricing (50% off)</li>
                      <li>• Direct feedback channel to founders</li>
                      <li>• Feature request priority</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h4 className="text-white font-semibold mb-2">What We're Building</h4>
                    <ul className="text-blue-100 text-sm space-y-1">
                      <li>• AI-powered document processing</li>
                      <li>• Smart transaction categorization</li>
                      <li>• Blockchain security integration</li>
                      <li>• Real-time financial insights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Help Build the Future?
              </h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                We're looking for forward-thinking businesses to join our beta program and help us create 
                the next generation of AI-powered financial tools. Your feedback will shape our product.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold shadow-lg"
                  onClick={() => window.open('/contact', '_blank')}
                >
                  Contact Founders
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold"
                  onClick={() => window.open('/contact', '_blank')}
                >
                  Schedule Beta Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}