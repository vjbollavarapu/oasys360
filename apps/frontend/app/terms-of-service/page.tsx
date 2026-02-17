import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Mail, 
  Calendar,
  Download,
  ExternalLink
} from 'lucide-react'

export default function TermsOfServicePage() {
  const lastUpdated = "March 15, 2024"
  const effectiveDate = "January 1, 2024"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Terms of Service
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              The legal terms and conditions for using the OASYS platform
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last updated: {lastUpdated}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Effective: {effectiveDate}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-white shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <nav className="space-y-2">
                  <a href="#acceptance" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    1. Acceptance of Terms
                  </a>
                  <a href="#description" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    2. Service Description
                  </a>
                  <a href="#user-accounts" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    3. User Accounts
                  </a>
                  <a href="#acceptable-use" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    4. Acceptable Use
                  </a>
                  <a href="#payment-terms" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    5. Payment Terms
                  </a>
                  <a href="#intellectual-property" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    6. Intellectual Property
                  </a>
                  <a href="#data-security" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    7. Data & Security
                  </a>
                  <a href="#limitation-liability" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    8. Limitation of Liability
                  </a>
                  <a href="#termination" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    9. Termination
                  </a>
                  <a href="#governing-law" className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    10. Governing Law
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Important Notice */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-800">
                <p className="mb-4">
                  Please read these Terms of Service carefully before using the OASYS platform. By accessing or using our services, you agree to be bound by these terms.
                </p>
                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>These terms constitute a legally binding agreement</li>
                    <li>We may update these terms from time to time</li>
                    <li>Continued use indicates acceptance of changes</li>
                    <li>Some features may have additional terms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Acceptance of Terms */}
            <section id="acceptance">
              <Card>
                <CardHeader>
                  <CardTitle>1. Acceptance of Terms</CardTitle>
                  <CardDescription>
                    Your agreement to these terms and conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      By accessing, browsing, or using the OASYS platform ("Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.
                    </p>
                    <p>
                      If you do not agree to these Terms, you may not access or use our Service. These Terms apply to all visitors, users, and others who access or use the Service.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Who Can Use OASYS</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                        <li>Businesses and organizations</li>
                        <li>Individual professionals and freelancers</li>
                        <li>Accounting firms and service providers</li>
                        <li>Users must be 18 years or older</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Service Description */}
            <section id="description">
              <Card>
                <CardHeader>
                  <CardTitle>2. Service Description</CardTitle>
                  <CardDescription>
                    What OASYS provides and service limitations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">OASYS Platform Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-green-700">✅ What We Provide</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li>AI-powered accounting automation</li>
                            <li>Web3 and cryptocurrency support</li>
                            <li>Financial reporting and analytics</li>
                            <li>Document processing and storage</li>
                            <li>Multi-currency transaction management</li>
                            <li>E-invoicing and compliance tools</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-red-700">❌ What We Don't Provide</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li>Legal or tax advice</li>
                            <li>Investment recommendations</li>
                            <li>Audit or assurance services</li>
                            <li>Financial planning advice</li>
                            <li>Regulatory compliance guarantees</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Service Availability</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Planned maintenance will be communicated in advance.
                      </p>
                      <p className="text-sm text-gray-600">
                        Service features may vary by subscription plan and geographic location.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* User Accounts */}
            <section id="user-accounts">
              <Card>
                <CardHeader>
                  <CardTitle>3. User Accounts and Security</CardTitle>
                  <CardDescription>
                    Account creation, security, and user responsibilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Account Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Notify us immediately of unauthorized access</li>
                        <li>Use a valid email address for communications</li>
                        <li>Comply with password security requirements</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Your Responsibilities</h4>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Keep login credentials secure</li>
                          <li>• Report security incidents promptly</li>
                          <li>• Update account information as needed</li>
                          <li>• Use two-factor authentication</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Our Responsibilities</h4>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Protect your data with encryption</li>
                          <li>• Monitor for suspicious activity</li>
                          <li>• Provide security notifications</li>
                          <li>• Maintain secure infrastructure</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Acceptable Use */}
            <section id="acceptable-use">
              <Card>
                <CardHeader>
                  <CardTitle>4. Acceptable Use Policy</CardTitle>
                  <CardDescription>
                    Rules and restrictions for using our platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-3">Prohibited Activities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Illegal or fraudulent activities</li>
                          <li>Money laundering or terrorist financing</li>
                          <li>Violation of intellectual property rights</li>
                          <li>Unauthorized access or hacking attempts</li>
                          <li>Spreading malware or viruses</li>
                        </ul>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Harassment or abusive behavior</li>
                          <li>False or misleading information</li>
                          <li>Excessive or disruptive usage</li>
                          <li>Reverse engineering or copying</li>
                          <li>Violation of export controls</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Permitted Uses</h4>
                      <p className="text-sm text-green-700">
                        Use OASYS for legitimate business accounting, financial management, and compliance purposes in accordance with applicable laws and regulations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Payment Terms */}
            <section id="payment-terms">
              <Card>
                <CardHeader>
                  <CardTitle>5. Payment Terms and Billing</CardTitle>
                  <CardDescription>
                    Subscription fees, billing cycles, and refund policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Billing</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>Subscription fees are billed in advance</li>
                          <li>Monthly or annual billing cycles available</li>
                          <li>Automatic renewal unless cancelled</li>
                          <li>Taxes may apply based on location</li>
                          <li>Price changes with 30 days notice</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Payment Methods</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>Credit and debit cards</li>
                          <li>Bank transfers (for annual plans)</li>
                          <li>PayPal and digital wallets</li>
                          <li>Cryptocurrency (for Web3 plans)</li>
                          <li>Invoice billing (Enterprise)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Refund Policy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Badge className="bg-green-100 text-green-700 mb-2">Free Trial</Badge>
                          <p className="text-gray-600">14-day free trial for new users</p>
                        </div>
                        <div>
                          <Badge className="bg-blue-100 text-blue-700 mb-2">Monthly Plans</Badge>
                          <p className="text-gray-600">No refunds, cancel anytime</p>
                        </div>
                        <div>
                          <Badge className="bg-purple-100 text-purple-700 mb-2">Annual Plans</Badge>
                          <p className="text-gray-600">Pro-rated refunds within 30 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Intellectual Property */}
            <section id="intellectual-property">
              <Card>
                <CardHeader>
                  <CardTitle>6. Intellectual Property Rights</CardTitle>
                  <CardDescription>
                    Ownership of content, software, and user data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">OASYS Owns</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>The OASYS platform and software</li>
                          <li>AI models and algorithms</li>
                          <li>Trademarks and brand assets</li>
                          <li>Documentation and content</li>
                          <li>Platform improvements and features</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">You Own</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>Your business data and files</li>
                          <li>Financial records and documents</li>
                          <li>Customer information</li>
                          <li>Reports you generate</li>
                          <li>Your account content</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">License Grant</h4>
                      <p className="text-sm text-blue-700">
                        We grant you a limited, non-exclusive, non-transferable license to use OASYS during your subscription period. 
                        You grant us permission to process your data to provide our services.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Limitation of Liability */}
            <section id="limitation-liability">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-900">8. Limitation of Liability</CardTitle>
                  <CardDescription className="text-orange-600">
                    Important limitations on our legal liability
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-orange-800">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold mb-2">Service Disclaimer</h4>
                      <p className="text-sm text-orange-700">
                        OASYS is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free, secure, or available at all times.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold mb-2">Liability Limits</h4>
                      <p className="text-sm text-orange-700">
                        Our total liability for any claim shall not exceed the amount you paid for the service in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold mb-2">Professional Advice</h4>
                      <p className="text-sm text-orange-700">
                        OASYS does not provide legal, tax, or financial advice. Always consult with qualified professionals for specific business decisions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
                <p className="mb-6 opacity-90">
                  Our legal team is available to clarify any questions about these Terms of Service.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Legal Department</h4>
                    <p className="text-sm opacity-90">legal@oasys360.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">General Support</h4>
                    <p className="text-sm opacity-90">support@oasys360.com</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Contact Legal Team
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 