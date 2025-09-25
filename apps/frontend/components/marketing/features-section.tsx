"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Zap, 
  Shield, 
  BarChart3, 
  FileText, 
  Globe, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Bot,
  Database,
  Lock,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Settings,
  Activity,
  Eye,
  Smartphone,
  Cloud,
  Network
} from "lucide-react"

export function FeaturesSection() {
  const aiFeatures = [
    {
      icon: Brain,
      title: "AI Document Processing",
      description: "99.5% accurate extraction from invoices, receipts, and financial documents using advanced OCR and machine learning.",
      benefits: ["Real-time processing", "Multi-format support", "Automatic validation", "Error detection"],
      metrics: "99.5% accuracy"
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "AI-powered forecasting that predicts cash flow, identifies trends, and provides actionable insights for business growth.",
      benefits: ["Cash flow prediction", "Trend analysis", "Risk assessment", "Growth opportunities"],
      metrics: "85% better predictions"
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Automated categorization of transactions using natural language processing and pattern recognition.",
      benefits: ["Auto-categorization", "Rule-based processing", "Workflow automation", "Exception handling"],
      metrics: "95% automation rate"
    },
    {
      icon: Shield,
      title: "Fraud Detection",
      description: "Real-time monitoring with AI algorithms that detect anomalies and potential fraudulent activities instantly.",
      benefits: ["Real-time monitoring", "Pattern recognition", "Risk scoring", "Alert system"],
      metrics: "99.9% detection rate"
    }
  ]

  const web3Features = [
    {
      icon: Database,
      title: "Blockchain Integration",
      description: "Seamless integration with multiple blockchain networks for transparent and immutable financial records.",
      benefits: ["Multi-chain support", "Immutable records", "Transparent audits", "Smart contracts"]
    },
    {
      icon: Lock,
      title: "Digital Identity (DID)",
      description: "Self-sovereign identity management for secure, privacy-preserving business verification and compliance.",
      benefits: ["Self-sovereign identity", "Privacy protection", "Compliance ready", "Verification system"]
    },
    {
      icon: Globe,
      title: "Global Compliance",
      description: "Built-in compliance with international financial regulations and multi-country tax requirements.",
      benefits: ["Multi-country support", "Tax compliance", "Regulatory updates", "Audit trails"]
    }
  ]

  const platformFeatures = [
    {
      icon: Users,
      title: "Multi-User Collaboration",
      description: "Role-based access control with team collaboration features for seamless workflow management.",
      benefits: ["Role management", "Team collaboration", "Permission controls", "Activity tracking"]
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Responsive mobile application with offline capabilities and real-time synchronization.",
      benefits: ["Mobile app", "Offline mode", "Real-time sync", "Push notifications"]
    },
    {
      icon: Cloud,
      title: "Cloud Infrastructure",
      description: "Enterprise-grade cloud hosting with 99.9% uptime and automatic scaling capabilities.",
      benefits: ["High availability", "Auto-scaling", "Data backup", "Disaster recovery"]
    },
    {
      icon: Settings,
      title: "Custom Integrations",
      description: "Flexible API and integration options to connect with your existing business tools and systems.",
      benefits: ["RESTful APIs", "Webhook support", "Third-party integrations", "Custom connectors"]
    }
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Finance
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the comprehensive suite of features that make OASYS the most advanced 
              AI-powered business finance platform available today.
            </p>
          </div>

          {/* AI Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Intelligence</h3>
              <p className="text-lg text-gray-600">Advanced artificial intelligence that transforms your financial operations</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {aiFeatures.map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                          {feature.title}
                        </CardTitle>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-sm">
                          {feature.metrics}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed text-base mb-4">
                      {feature.description}
                    </CardDescription>
                    <div className="grid grid-cols-2 gap-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Web3 & Blockchain */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Blockchain & Digital Identity</h3>
              <p className="text-lg text-gray-600">Secure, transparent, and verifiable business processes</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {web3Features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Platform Capabilities</h3>
              <p className="text-lg text-gray-600">Enterprise-grade infrastructure and collaboration tools</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white text-center">
                Compare AI vs Traditional Methods
              </h3>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    With OASYS AI
                  </h4>
                  <div className="space-y-3">
                    {[
                      "99.5% document processing accuracy",
                      "Real-time fraud detection",
                      "Automated categorization in seconds",
                      "Predictive analytics for cash flow",
                      "24/7 AI monitoring",
                      "Blockchain audit trails"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-gray-400" />
                    Traditional Methods
                  </h4>
                  <div className="space-y-3">
                    {[
                      "Manual data entry with errors",
                      "Reactive fraud detection",
                      "Hours of manual categorization",
                      "Basic reporting and analysis",
                      "Limited monitoring capabilities",
                      "Paper-based audit trails"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                        <span className="text-gray-500">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Experience the Future of Business Finance?
                </h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Join thousands of businesses already using OASYS AI to automate their financial operations 
                  and gain unprecedented insights into their business performance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold shadow-lg"
                    onClick={() => {
                      const element = document.querySelector('#pricing')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold"
                    onClick={() => window.open('/demo', '_blank')}
                  >
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
