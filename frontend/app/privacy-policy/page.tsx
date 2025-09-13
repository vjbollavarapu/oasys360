import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Globe, 
  Mail, 
  Calendar,
  Download,
  ExternalLink
} from 'lucide-react'

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 15, 2024"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              How we collect, use, and protect your personal information
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last updated: {lastUpdated}
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                GDPR Compliant
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a href="#overview" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    1. Overview
                  </a>
                  <a href="#information-we-collect" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    2. Information We Collect
                  </a>
                  <a href="#how-we-use-information" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    3. How We Use Information
                  </a>
                  <a href="#information-sharing" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    4. Information Sharing
                  </a>
                  <a href="#data-security" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    5. Data Security
                  </a>
                  <a href="#your-rights" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    6. Your Rights
                  </a>
                  <a href="#cookies" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    7. Cookies & Tracking
                  </a>
                  <a href="#international-transfers" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    8. International Transfers
                  </a>
                  <a href="#contact" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    9. Contact Us
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <section id="overview">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800">
                  <p className="mb-4">
                    At OASYS, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered accounting and Web3 finance platform.
                  </p>
                  <p className="mb-4">
                    By using our services, you agree to the collection and use of information in accordance with this policy. We are committed to protecting your personal data and maintaining transparency about our data practices.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2">Key Principles:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>We only collect data necessary for our services</li>
                      <li>We never sell your personal information</li>
                      <li>We use industry-standard security measures</li>
                      <li>You have control over your data</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Information We Collect */}
            <section id="information-we-collect">
              <Card>
                <CardHeader>
                  <CardTitle>Information We Collect</CardTitle>
                  <CardDescription>
                    The types of personal information we may collect from you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Personal Information</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Name, email address, and contact information</li>
                        <li>Company name and business details</li>
                        <li>Billing and payment information</li>
                        <li>Profile photo and preferences</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Financial Data</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Bank account information and transactions</li>
                        <li>Invoices, receipts, and financial documents</li>
                        <li>Tax identification numbers</li>
                        <li>Cryptocurrency wallet addresses and transactions</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Technical Information</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>IP address, browser type, and device information</li>
                        <li>Usage data and analytics</li>
                        <li>Log files and error reports</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Communication Data</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Support requests and correspondence</li>
                        <li>Feedback and survey responses</li>
                        <li>Marketing communication preferences</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* How We Use Information */}
            <section id="how-we-use-information">
              <Card>
                <CardHeader>
                  <CardTitle>How We Use Your Information</CardTitle>
                  <CardDescription>
                    The purposes for which we process your personal data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Service Provision</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Provide and maintain our accounting services</li>
                        <li>Process financial data with AI algorithms</li>
                        <li>Generate reports and analytics</li>
                        <li>Enable Web3 and cryptocurrency features</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Account Management</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Create and manage your account</li>
                        <li>Process payments and billing</li>
                        <li>Provide customer support</li>
                        <li>Send service-related notifications</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Improvement & Analytics</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Analyze usage patterns and trends</li>
                        <li>Improve our AI models and algorithms</li>
                        <li>Develop new features and services</li>
                        <li>Conduct research and development</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Legal & Security</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Comply with legal obligations</li>
                        <li>Prevent fraud and abuse</li>
                        <li>Ensure platform security</li>
                        <li>Protect our rights and interests</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Information Sharing */}
            <section id="information-sharing">
              <Card>
                <CardHeader>
                  <CardTitle>Information Sharing and Disclosure</CardTitle>
                  <CardDescription>
                    When and how we may share your information with third parties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">We DO NOT sell your personal information</h4>
                      <p className="text-sm text-green-700">
                        OASYS never sells, rents, or trades your personal information to third parties for marketing purposes.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">We may share information in these limited circumstances:</h4>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-medium">Service Providers</h5>
                          <p className="text-sm text-gray-600">Trusted third-party companies that help us operate our services (cloud hosting, payment processing, customer support)</p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-4">
                          <h5 className="font-medium">Legal Requirements</h5>
                          <p className="text-sm text-gray-600">When required by law, court order, or to protect our rights and safety</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h5 className="font-medium">Business Transfers</h5>
                          <p className="text-sm text-gray-600">In connection with mergers, acquisitions, or asset sales (with user notification)</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h5 className="font-medium">With Your Consent</h5>
                          <p className="text-sm text-gray-600">When you explicitly authorize us to share information with specific third parties</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Security */}
            <section id="data-security">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-green-800">
                  <p className="mb-4">
                    We implement robust security measures to protect your personal and financial data:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-2">Encryption</h4>
                      <ul className="text-sm space-y-1">
                        <li>• TLS 1.3 encryption in transit</li>
                        <li>• AES-256 encryption at rest</li>
                        <li>• End-to-end encryption for sensitive data</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-2">Access Controls</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Multi-factor authentication</li>
                        <li>• Role-based access controls</li>
                        <li>• Regular access reviews</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-2">Infrastructure</h4>
                      <ul className="text-sm space-y-1">
                        <li>• SOC 2 Type II certified data centers</li>
                        <li>• Regular security audits</li>
                        <li>• Intrusion detection systems</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-2">Monitoring</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 24/7 security monitoring</li>
                        <li>• Automated threat detection</li>
                        <li>• Incident response procedures</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Your Rights */}
            <section id="your-rights">
              <Card>
                <CardHeader>
                  <CardTitle>Your Privacy Rights</CardTitle>
                  <CardDescription>
                    Your rights regarding your personal data under GDPR and other privacy laws
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Access</h4>
                        <p className="text-sm text-gray-600">Request a copy of your personal data we hold</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Rectification</h4>
                        <p className="text-sm text-gray-600">Correct inaccurate or incomplete information</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Erasure</h4>
                        <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Portability</h4>
                        <p className="text-sm text-gray-600">Export your data in a machine-readable format</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Restriction</h4>
                        <p className="text-sm text-gray-600">Limit how we process your data</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Objection</h4>
                        <p className="text-sm text-gray-600">Object to processing for marketing purposes</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">How to Exercise Your Rights</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Contact our privacy team at privacy@oasys.com or use the form in your account settings.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Privacy Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Contact */}
            <section id="contact">
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
                  <p className="mb-6 opacity-90">
                    Our privacy team is here to help you understand and exercise your rights.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Email Us</h4>
                      <p className="text-sm opacity-90">privacy@oasys.com</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                      <p className="text-sm opacity-90">dpo@oasys.com</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <Link href="/contact">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        Contact Support
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 