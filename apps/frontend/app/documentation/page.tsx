import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen,
  Code,
  Play,
  Download,
  ExternalLink,
  Search,
  ArrowRight,
  CheckCircle,
  FileText,
  Zap,
  Brain,
  Shield,
  Globe
} from 'lucide-react'

export default function DocumentationPage() {
  const quickStartSteps = [
    {
      step: 1,
      title: "Sign Up & Setup",
      description: "Create your OASYS account and complete the initial setup wizard",
      time: "5 minutes"
    },
    {
      step: 2,
      title: "Connect Your Bank",
      description: "Securely link your business bank accounts for automatic transaction import",
      time: "10 minutes"
    },
    {
      step: 3,
      title: "Configure Chart of Accounts",
      description: "Set up your accounting structure with AI-suggested categories",
      time: "15 minutes"
    },
    {
      step: 4,
      title: "Start Processing Documents",
      description: "Upload your first invoices and let AI process them automatically",
      time: "Ongoing"
    }
  ]

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/v1/transactions",
      description: "Retrieve all transactions with filtering options"
    },
    {
      method: "POST",
      endpoint: "/api/v1/invoices",
      description: "Create a new invoice with AI processing"
    },
    {
      method: "GET",
      endpoint: "/api/v1/reports/financial",
      description: "Generate financial reports in various formats"
    },
    {
      method: "POST",
      endpoint: "/api/v1/documents/process",
      description: "Process documents using AI extraction"
    }
  ]

  const guides = [
    {
      title: "Setting Up AI Automation",
      description: "Learn how to configure AI rules for automatic transaction categorization",
      category: "AI Features",
      readTime: "10 min",
      level: "Beginner"
    },
    {
      title: "Web3 Wallet Integration",
      description: "Connect cryptocurrency wallets and track digital assets",
      category: "Web3",
      readTime: "15 min",
      level: "Intermediate"
    },
    {
      title: "E-invoicing Compliance",
      description: "Set up e-invoicing for Malaysia, Singapore, and other regions",
      category: "Compliance",
      readTime: "20 min",
      level: "Advanced"
    },
    {
      title: "Multi-Currency Setup",
      description: "Configure multi-currency accounting and automatic exchange rates",
      category: "Accounting",
      readTime: "12 min",
      level: "Intermediate"
    },
    {
      title: "API Integration Guide",
      description: "Integrate OASYS with your existing systems using our REST API",
      category: "Development",
      readTime: "25 min",
      level: "Advanced"
    },
    {
      title: "Mobile App Usage",
      description: "Maximize productivity with the OASYS mobile application",
      category: "Mobile",
      readTime: "8 min",
      level: "Beginner"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              OASYS Documentation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to know about using OASYS for AI-powered accounting and Web3 finance
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-5 h-5 mr-2" />
                Quick Start Guide
              </Button>
              <Button variant="outline" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
              <Button variant="ghost" size="lg">
                <Search className="w-5 h-5 mr-2" />
                Search Docs
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="getting-started" className="space-y-8">
          {/* Navigation */}
          <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-white rounded-2xl shadow-sm">
            <TabsTrigger value="getting-started" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="api-reference" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Code className="w-4 h-4 mr-2" />
              API Reference
            </TabsTrigger>
            <TabsTrigger value="guides" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Tutorials
            </TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Quick Start Guide</CardTitle>
                    <CardDescription className="text-blue-600">
                      Get up and running with OASYS in under 30 minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {quickStartSteps.map((step) => (
                      <div key={step.step} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900 mb-1">{step.title}</h3>
                          <p className="text-blue-700 text-sm mb-2">{step.description}</p>
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                            {step.time}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* System Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Modern web browser (Chrome, Firefox, Safari, Edge)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Stable internet connection
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Business bank account access
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Mobile device for 2FA (recommended)
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/contact">
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                      </Link>
                      <Link href="/demo">
                        <Button variant="outline" className="w-full justify-start">
                          <Play className="w-4 h-4 mr-2" />
                          Watch Demo
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* API Reference */}
          <TabsContent value="api-reference" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-900">REST API Overview</CardTitle>
                    <CardDescription className="text-green-600">
                      Integrate OASYS with your existing systems using our RESTful API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">Base URL</h4>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">https://api.oasys.com/v1</code>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-3">Authentication</h4>
                        <p className="text-sm text-green-700 mb-2">Include your API key in the header:</p>
                        <code className="text-xs bg-gray-100 p-2 rounded block">
                          Authorization: Bearer YOUR_API_KEY
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* API Endpoints */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Popular Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apiEndpoints.map((endpoint, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={
                              endpoint.method === 'GET' ? "bg-blue-100 text-blue-700" :
                              endpoint.method === 'POST' ? "bg-green-100 text-green-700" :
                              "bg-orange-100 text-orange-700"
                            }>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.endpoint}</code>
                          </div>
                          <p className="text-sm text-gray-600">{endpoint.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SDK Downloads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Code className="w-4 h-4 mr-2" />
                        JavaScript/Node.js
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Code className="w-4 h-4 mr-2" />
                        Python
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Code className="w-4 h-4 mr-2" />
                        PHP
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Code className="w-4 h-4 mr-2" />
                        Ruby
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rate Limits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Starter Plan:</span>
                        <span className="font-semibold">1,000/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth Plan:</span>
                        <span className="font-semibold">5,000/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enterprise:</span>
                        <span className="font-semibold">Unlimited</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Guides */}
          <TabsContent value="guides" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{guide.category}</Badge>
                      <Badge className={
                        guide.level === 'Beginner' ? "bg-green-100 text-green-700" :
                        guide.level === 'Intermediate' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {guide.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{guide.readTime} read</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tutorials */}
          <TabsContent value="tutorials" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Features Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-sm font-medium">Setting up AI Document Processing</span>
                      <Play className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-sm font-medium">Training Custom AI Models</span>
                      <Play className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-sm font-medium">AI-Powered Fraud Detection</span>
                      <Play className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Web3 Integration Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-sm font-medium">Connecting MetaMask Wallet</span>
                      <Play className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-sm font-medium">Setting up DeFi Tracking</span>
                      <Play className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-sm font-medium">Smart Contract Integration</span>
                      <Play className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="mb-6 opacity-90">
              Join thousands of businesses already using OASYS for their AI-powered accounting needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 