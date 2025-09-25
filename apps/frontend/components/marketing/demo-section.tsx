"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  ArrowRight, 
  Bot, 
  Brain, 
  Zap, 
  Shield, 
  CheckCircle,
  TrendingUp,
  FileText,
  BarChart3,
  Clock,
  Sparkles
} from "lucide-react"

export function DemoSection() {
  const demoFeatures = [
    {
      icon: Brain,
      title: "AI Document Processing",
      description: "Watch our AI automatically extract data from invoices with 99.5% accuracy",
      time: "2 min demo"
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "See how AI predicts cash flow and identifies business opportunities",
      time: "3 min demo"
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Experience automated categorization and reconciliation in real-time",
      time: "2 min demo"
    },
    {
      icon: Shield,
      title: "Fraud Detection",
      description: "Witness AI detecting anomalies and preventing fraudulent transactions",
      time: "2 min demo"
    }
  ]

  const aiCapabilities = [
    {
      metric: "99.5%",
      label: "Document Processing Accuracy",
      icon: FileText,
      color: "blue"
    },
    {
      metric: "95%",
      label: "Transaction Automation",
      icon: Zap,
      color: "purple"
    },
    {
      metric: "85%",
      label: "Better Predictions",
      icon: TrendingUp,
      color: "green"
    },
    {
      metric: "99.9%",
      label: "Fraud Detection Rate",
      icon: Shield,
      color: "orange"
    }
  ]

  return (
    <section id="demo" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              Interactive AI Demo
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Experience the Power of
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Finance
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how our AI transforms complex financial operations into simple, 
              automated processes that save time and improve accuracy.
            </p>
          </div>

          {/* Main Demo CTA */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Live AI Demo
                  </h3>
                  <p className="text-blue-100">
                    Interactive demonstration of our AI capabilities
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-white">
                    <div className="text-sm text-blue-100">Ready to start</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Live</span>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold shadow-lg"
                    onClick={() => window.open('/demo', '_blank')}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Demo Preview */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Demo Video Placeholder */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-video shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Play className="w-8 h-8 text-gray-800" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2 text-white">AI in Action</h4>
                      <p className="text-blue-100 font-medium">Click to start interactive demo</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg font-semibold">
                    LIVE
                  </div>
                </div>

                {/* Demo Features List */}
                <div className="space-y-4">
                  {demoFeatures.map((feature, index) => (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {feature.time}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Capabilities Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {aiCapabilities.map((capability, index) => {
              const colors = {
                blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-900",
                purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-900",
                green: "from-green-50 to-green-100 border-green-200 text-green-900",
                orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-900"
              }
              
              return (
                <Card key={index} className={`bg-gradient-to-br ${colors[capability.color as keyof typeof colors]} border-2 hover:shadow-xl transition-all duration-300 group`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 bg-${capability.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <capability.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-3xl font-bold ${colors[capability.color as keyof typeof colors].split(' ')[2]} mb-2`}>
                      {capability.metric}
                    </div>
                    <div className={`text-sm ${colors[capability.color as keyof typeof colors].split(' ')[2]} opacity-80`}>
                      {capability.label}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Interactive Features */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Try AI Features Yourself
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience our AI capabilities with these interactive demos. 
                No signup required - just click and explore.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Document Upload Demo
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-4">
                    Upload a sample invoice and watch our AI extract data automatically
                  </CardDescription>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open('/documents/upload', '_blank')}
                  >
                    Try Document AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Analytics Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-4">
                    Explore AI-generated insights and financial predictions
                  </CardDescription>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => window.open('/reports/financial', '_blank')}
                  >
                    View Analytics
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Security Demo
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-4">
                    See how our AI detects and prevents fraudulent activities
                  </CardDescription>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open('/ai-processing/fraud', '_blank')}
                  >
                    Test Security
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="max-w-3xl mx-auto">
                <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Transform Your Business with AI?
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
                    onClick={() => window.open('/contact', '_blank')}
                  >
                    Schedule Demo Call
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