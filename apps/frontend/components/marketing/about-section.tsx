"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Lock
} from "lucide-react"

export function AboutSection() {
  const aiFeatures = [
    {
      icon: Brain,
      title: "Intelligent Document Processing",
      description: "99.5% accuracy in extracting data from invoices, receipts, and financial documents using advanced OCR and machine learning.",
      metrics: "99.5% accuracy"
    },
    {
      icon: BarChart3,
      title: "Predictive Financial Analytics",
      description: "AI-powered forecasting that predicts cash flow, identifies trends, and provides actionable insights for business growth.",
      metrics: "85% better predictions"
    },
    {
      icon: Zap,
      title: "Automated Transaction Categorization",
      description: "Smart categorization of transactions using natural language processing and pattern recognition.",
      metrics: "95% automation rate"
    },
    {
      icon: Shield,
      title: "Fraud Detection & Risk Management",
      description: "Real-time monitoring with AI algorithms that detect anomalies and potential fraudulent activities instantly.",
      metrics: "99.9% detection rate"
    }
  ]

  const web3Features = [
    {
      icon: Database,
      title: "Blockchain Integration",
      description: "Seamless integration with multiple blockchain networks for transparent and immutable financial records."
    },
    {
      icon: Lock,
      title: "Cryptocurrency Accounting",
      description: "Complete crypto asset management with real-time valuation and tax optimization across 1000+ tokens."
    },
    {
      icon: Globe,
      title: "Smart Contract Automation",
      description: "Automated execution of financial contracts with built-in compliance and regulatory adherence."
    }
  ]

  return (
    <section id="about" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50" role="main" aria-labelledby="about-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              AI-Powered Platform
            </Badge>
            <h2 id="about-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Business Finance with
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI & Blockchain Technology
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              OASYS combines cutting-edge AI technology with blockchain innovation to deliver 
              the most advanced financial management platform for modern businesses.
            </p>
          </div>

          {/* AI Features Grid */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Features</h3>
              <p className="text-lg text-gray-600">Intelligent automation that transforms your financial operations</p>
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
                    <CardDescription className="text-gray-600 leading-relaxed text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Blockchain Integration Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Blockchain & Digital Identity</h3>
              <p className="text-lg text-gray-600">Secure, transparent, and verifiable business processes</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Immutable Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Tamper-proof financial records with blockchain technology for complete audit trails.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Digital Identity (DID)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Self-sovereign identity management for secure, privacy-preserving business verification.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Smart Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Automated contract execution with built-in compliance and regulatory adherence.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Process Flow */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white text-center">
                How Our AI Transforms Your Financial Operations
              </h3>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">1. Data Ingestion</h4>
                  <p className="text-sm text-gray-600">AI automatically processes documents, emails, and transactions</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">2. AI Analysis</h4>
                  <p className="text-sm text-gray-600">Machine learning algorithms categorize and validate data</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">3. Insights Generation</h4>
                  <p className="text-sm text-gray-600">Predictive analytics provide actionable business insights</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">4. Automated Actions</h4>
                  <p className="text-sm text-gray-600">Smart automation executes tasks and maintains compliance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Vision */}
          <div className="mt-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Our Vision for the Future
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                We believe that AI and blockchain technologies will fundamentally transform how businesses 
                manage their finances. Our mission is to make these cutting-edge technologies accessible 
                and practical for businesses of all sizes.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">AI</div>
                  <div className="text-gray-600">Intelligent Automation</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">DID</div>
                  <div className="text-gray-600">Digital Identity</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">Global</div>
                  <div className="text-gray-600">Multi-Country Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}