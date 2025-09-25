"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Brain, 
  Shield, 
  Star,
  ArrowRight,
  Sparkles,
  Bot,
  Database,
  Lock,
  Users,
  Globe,
  Building2,
  Rocket
} from "lucide-react"

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      id: "ai-starter",
      name: "AI Starter",
      description: "Perfect for small businesses getting started with AI-powered accounting",
      monthlyPrice: 99,
      yearlyPrice: 84,
      badge: "Most Popular",
      popular: true,
      icon: Brain,
      color: "blue",
      targetAudience: "Small Businesses",
      targetIcon: Users,
      features: [
        "AI document processing (99.5% accuracy)",
        "Automated transaction categorization",
        "Basic financial forecasting",
        "Real-time expense tracking",
        "Mobile app access",
        "Email support",
        "Up to 1,000 transactions/month",
        "Basic reporting & analytics"
      ],
      limitations: [
        "Limited Web3 features",
        "Basic compliance automation"
      ]
    },
    {
      id: "ai-professional",
      name: "AI Professional",
      description: "Advanced AI features with Web3 integration for growing businesses",
      monthlyPrice: 249,
      yearlyPrice: 211,
      badge: "Best Value",
      popular: false,
      icon: Zap,
      color: "purple",
      targetAudience: "Growing Businesses",
      targetIcon: Globe,
      features: [
        "Everything in AI Starter",
        "Advanced AI financial insights",
        "Cryptocurrency accounting",
        "Web3 wallet connections",
        "Team collaboration (up to 15 users)",
        "Custom reporting & analytics",
        "Priority support",
        "API access",
        "Multi-currency support",
        "Up to 10,000 transactions/month"
      ],
      limitations: [
        "Limited smart contract features"
      ]
    },
    {
      id: "ai-enterprise",
      name: "AI Enterprise",
      description: "Complete AI + Web3 solution for large organizations",
      monthlyPrice: 449,
      yearlyPrice: 381,
      badge: "Enterprise",
      popular: false,
      icon: Crown,
      color: "green",
      targetAudience: "Large Organizations",
      targetIcon: Building2,
      features: [
        "Everything in AI Professional",
        "Smart contract automation",
        "Advanced digital asset management",
        "Blockchain transparency features",
        "Multi-blockchain support",
        "Advanced compliance automation",
        "Dedicated support manager",
        "Custom integrations",
        "Advanced security protocols",
        "Unlimited transactions",
        "Multi-location support"
      ],
      limitations: []
    },
    {
      id: "ai-platform",
      name: "AI Platform",
      description: "Complete platform with custom AI models and white-label solutions",
      monthlyPrice: 899,
      yearlyPrice: 764,
      badge: "Custom",
      popular: false,
      icon: Sparkles,
      color: "orange",
      targetAudience: "Platform Partners",
      targetIcon: Rocket,
      features: [
        "Everything in AI Enterprise",
        "Custom AI models & training",
        "White-label blockchain solutions",
        "Custom smart contract development",
        "Advanced blockchain analytics",
        "24/7 dedicated support team",
        "SLA guarantees (99.9% uptime)",
        "On-premise deployment options",
        "Unlimited users & transactions",
        "Custom compliance frameworks"
      ],
      limitations: []
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "from-blue-50 to-blue-100",
        border: "border-blue-200",
        icon: "bg-blue-600",
        text: "text-blue-900",
        badge: "bg-blue-600"
      },
      purple: {
        bg: "from-purple-50 to-purple-100",
        border: "border-purple-200",
        icon: "bg-purple-600",
        text: "text-purple-900",
        badge: "bg-purple-600"
      },
      green: {
        bg: "from-green-50 to-green-100",
        border: "border-green-200",
        icon: "bg-green-600",
        text: "text-green-900",
        badge: "bg-green-600"
      },
      orange: {
        bg: "from-orange-50 to-orange-100",
        border: "border-orange-200",
        icon: "bg-orange-600",
        text: "text-orange-900",
        badge: "bg-orange-600"
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-6 py-2 text-sm font-medium shadow-lg">
              <Bot className="w-4 h-4 mr-2" />
              Beta Launch Pricing
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Choose Your
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered Plan
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join our exclusive beta program and help shape the future of AI-powered financial management. 
              Get early access with special founder pricing and direct feedback channels.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-6 mb-16">
            <div className="flex items-center gap-4">
              <span className={`text-lg font-semibold transition-colors ${!isYearly ? "text-gray-900" : "text-gray-400"}`}>
                Monthly
              </span>
              <div className="relative">
                <Switch 
                  checked={isYearly} 
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                />
              </div>
              <span className={`text-lg font-semibold transition-colors ${isYearly ? "text-gray-900" : "text-gray-400"}`}>
                Yearly
              </span>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2 shadow-lg">
              Save 15% Annually
            </Badge>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-20">
            {plans.map((plan) => {
              const colors = getColorClasses(plan.color)
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative group transition-all duration-500 hover:shadow-2xl ${
                    plan.popular 
                      ? `ring-2 ring-blue-500 shadow-2xl scale-105 bg-white` 
                      : "hover:scale-105 bg-white hover:shadow-xl"
                  } overflow-hidden`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 shadow-xl border-0">
                        <Star className="w-4 h-4 mr-2" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  {/* Header with gradient background */}
                  <div className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-b-2 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <CardHeader className="relative pb-8 pt-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-16 h-16 ${colors.icon} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <plan.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2 text-xs font-medium">
                            <plan.targetIcon className="w-3 h-3 mr-1" />
                            {plan.targetAudience}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardTitle className={`text-2xl font-bold ${colors.text} mb-3`}>
                        {plan.name}
                      </CardTitle>
                      
                      <CardDescription className="text-gray-600 leading-relaxed text-sm">
                        {plan.description}
                      </CardDescription>

                      <div className="mt-6">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-5xl font-bold text-gray-900">${price}</span>
                          <span className="text-gray-600 font-medium">/month</span>
                        </div>
                        {isYearly && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </div>

                  <CardContent className="p-8">
                    <div className="space-y-6 mb-8">
                      <div className="space-y-4">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {plan.limitations.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Limitations
                          </p>
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <Lock className="w-2.5 h-2.5 text-gray-400" />
                              </div>
                              <span className="text-xs text-gray-500 font-medium">
                                {limitation}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button 
                      className={`w-full py-4 font-semibold text-base transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl"
                      }`}
                      onClick={() => window.open('/contact', '_blank')}
                    >
                      {plan.popular ? "Join Beta Program" : "Request Early Access"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500 font-medium">
                        Free beta access • Founder feedback • Early adopter pricing
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Enterprise CTA */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <h3 className="text-4xl font-bold">
                  Ready to Shape the Future?
                </h3>
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join our exclusive beta program and work directly with our founders to build custom AI models 
                and blockchain integrations tailored to your specific business requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 font-semibold text-lg shadow-2xl"
                  onClick={() => window.open('/contact', '_blank')}
                >
                  Contact Founders
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 font-semibold text-lg backdrop-blur-sm"
                  onClick={() => window.open('/contact', '_blank')}
                >
                  Join Beta Program
                </Button>
              </div>
            </div>
          </div>

          {/* AI Features Comparison */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Features
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the cutting-edge AI capabilities that set our platform apart
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-blue-900 mb-3">Document Processing</h4>
                <p className="text-blue-700 leading-relaxed">99.5% accurate AI document processing across all plans with real-time data extraction and validation</p>
              </div>
              <div className="group text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-purple-900 mb-3">Predictive Analytics</h4>
                <p className="text-purple-700 leading-relaxed">Advanced forecasting and insights available in Professional and Enterprise plans</p>
              </div>
              <div className="group text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-3">Blockchain Security</h4>
                <p className="text-green-700 leading-relaxed">Full blockchain integration and Web3 features in Professional and Enterprise plans</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}