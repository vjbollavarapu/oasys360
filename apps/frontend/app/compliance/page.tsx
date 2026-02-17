import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Scale, 
  Shield, 
  Globe, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  ExternalLink,
  Building,
  Gavel,
  Search,
  Clock
} from 'lucide-react'

export default function CompliancePage() {
  const complianceFrameworks = [
    {
      name: "GDPR",
      fullName: "General Data Protection Regulation",
      region: "European Union",
      status: "Compliant",
      description: "Comprehensive data protection and privacy regulation",
      features: [
        "Data subject rights management",
        "Consent management systems",
        "Data breach notification",
        "Privacy by design principles",
        "Data portability features"
      ]
    },
    {
      name: "SOX",
      fullName: "Sarbanes-Oxley Act",
      region: "United States",
      status: "Compliant",
      description: "Financial reporting and corporate governance standards",
      features: [
        "Internal controls documentation",
        "Audit trail maintenance",
        "Financial reporting accuracy",
        "Executive certification",
        "Whistleblower protection"
      ]
    },
    {
      name: "PCI DSS",
      fullName: "Payment Card Industry Data Security Standard",
      region: "Global",
      status: "Level 1",
      description: "Security standards for payment card processing",
      features: [
        "Secure payment processing",
        "Cardholder data protection",
        "Network security monitoring",
        "Access control management",
        "Regular security testing"
      ]
    },
    {
      name: "PDPA",
      fullName: "Personal Data Protection Act",
      region: "Malaysia/Singapore",
      status: "Compliant",
      description: "Data protection laws for Southeast Asia",
      features: [
        "Personal data consent",
        "Data subject access rights",
        "Cross-border data transfer",
        "Data breach notification",
        "Privacy impact assessments"
      ]
    }
  ]

  const industryCompliance = [
    {
      industry: "Banking & Finance",
      icon: Building,
      regulations: [
        "Basel III capital requirements",
        "MiFID II investor protection",
        "PSD2 payment services",
        "Anti-Money Laundering (AML)",
        "Know Your Customer (KYC)"
      ],
      features: [
        "Regulatory reporting automation",
        "Risk management frameworks",
        "Transaction monitoring",
        "Customer due diligence",
        "Stress testing capabilities"
      ]
    },
    {
      industry: "Healthcare",
      icon: Shield,
      regulations: [
        "HIPAA privacy and security",
        "HITECH Act requirements",
        "FDA regulatory compliance",
        "Clinical trial regulations",
        "Medical device standards"
      ],
      features: [
        "PHI data protection",
        "Access control systems",
        "Audit log management",
        "Breach notification",
        "Business associate agreements"
      ]
    },
    {
      industry: "E-commerce",
      icon: Globe,
      regulations: [
        "Consumer protection laws",
        "E-commerce directives",
        "Digital services act",
        "Payment regulations",
        "Tax compliance requirements"
      ],
      features: [
        "Transaction monitoring",
        "Customer data protection",
        "Cross-border compliance",
        "Tax calculation automation",
        "Dispute resolution tracking"
      ]
    }
  ]

  const auditFeatures = [
    {
      title: "Comprehensive Audit Trails",
      description: "Complete logging of all system activities and data changes",
      icon: FileText,
      capabilities: [
        "User activity tracking",
        "Data modification logs",
        "System access records",
        "API call monitoring",
        "Administrative actions"
      ]
    },
    {
      title: "Automated Compliance Reporting",
      description: "Generate compliance reports automatically for various frameworks",
      icon: Download,
      capabilities: [
        "Regulatory report generation",
        "Custom reporting templates",
        "Scheduled report delivery",
        "Multi-format exports",
        "Compliance dashboards"
      ]
    },
    {
      title: "Risk Assessment Tools",
      description: "Built-in tools for identifying and managing compliance risks",
      icon: AlertCircle,
      capabilities: [
        "Risk identification",
        "Impact assessment",
        "Mitigation strategies",
        "Control effectiveness",
        "Continuous monitoring"
      ]
    },
    {
      title: "Policy Management",
      description: "Centralized management of compliance policies and procedures",
      icon: Gavel,
      capabilities: [
        "Policy documentation",
        "Version control",
        "Training materials",
        "Acknowledgment tracking",
        "Policy updates notification"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Compliance & Governance
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Meet regulatory requirements and industry standards with built-in compliance features
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                GDPR Ready
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                SOX Compliant
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                PCI DSS Level 1
              </Badge>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                ISO 27001
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Compliance Overview */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="text-blue-900 text-2xl">Built for Compliance</CardTitle>
            <CardDescription className="text-blue-600 text-lg">
              OASYS is designed from the ground up to meet the most stringent regulatory requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <Globe className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Global Standards</h3>
                <p className="text-sm text-blue-700">
                  Compliance with international regulations across 50+ countries
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <FileText className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Automated Reporting</h3>
                <p className="text-sm text-blue-700">
                  Generate compliance reports automatically for audits and reviews
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <Clock className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Real-time Monitoring</h3>
                <p className="text-sm text-blue-700">
                  Continuous compliance monitoring with instant alerts
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <Shield className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Data Protection</h3>
                <p className="text-sm text-blue-700">
                  Advanced data protection meeting the highest security standards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="frameworks" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-white rounded-2xl shadow-sm">
            <TabsTrigger value="frameworks" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Scale className="w-4 h-4 mr-2" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="industry" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Building className="w-4 h-4 mr-2" />
              Industry
            </TabsTrigger>
            <TabsTrigger value="features" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="auditing" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Auditing
            </TabsTrigger>
          </TabsList>

          {/* Compliance Frameworks */}
          <TabsContent value="frameworks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {complianceFrameworks.map((framework, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Scale className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold">{framework.name}</h3>
                          <p className="text-sm text-gray-600">{framework.fullName}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {framework.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{framework.region}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{framework.description}</p>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {framework.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Regional Compliance */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Regional Compliance Coverage</CardTitle>
                <CardDescription className="text-green-600">
                  Comprehensive compliance support across major markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">🇺🇸 North America</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• SOX Sarbanes-Oxley</li>
                      <li>• GAAP accounting standards</li>
                      <li>• CCPA privacy rights</li>
                      <li>• SEC reporting requirements</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">🇪🇺 European Union</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• GDPR data protection</li>
                      <li>• IFRS accounting standards</li>
                      <li>• MiFID II financial services</li>
                      <li>• VAT reporting requirements</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">🌏 Asia Pacific</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Malaysia PDPA</li>
                      <li>• Singapore PDPC</li>
                      <li>• MyInvois e-invoicing</li>
                      <li>• Local tax regulations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industry Compliance */}
          <TabsContent value="industry" className="space-y-6">
            <div className="space-y-6">
              {industryCompliance.map((industry, idx) => {
                const IconComponent = industry.icon
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                        {industry.industry}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Regulatory Requirements</h4>
                          <ul className="space-y-2">
                            {industry.regulations.map((regulation, ridx) => (
                              <li key={ridx} className="flex items-center gap-2 text-sm">
                                <Gavel className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                {regulation}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Compliance Features</h4>
                          <ul className="space-y-2">
                            {industry.features.map((feature, fidx) => (
                              <li key={fidx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Compliance Features */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {auditFeatures.map((feature, idx) => {
                const IconComponent = feature.icon
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.capabilities.map((capability, cidx) => (
                          <li key={cidx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            {capability}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Automated Compliance */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">Automated Compliance Management</CardTitle>
                <CardDescription className="text-purple-600">
                  Reduce manual effort with intelligent compliance automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-purple-200">
                    <FileText className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold text-purple-900 mb-2">Smart Documentation</h4>
                    <p className="text-sm text-purple-700">
                      AI-powered documentation generation and policy management
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-purple-200">
                    <AlertCircle className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold text-purple-900 mb-2">Risk Monitoring</h4>
                    <p className="text-sm text-purple-700">
                      Continuous risk assessment with proactive alerts and notifications
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-purple-200">
                    <Download className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold text-purple-900 mb-2">Report Generation</h4>
                    <p className="text-sm text-purple-700">
                      Automated compliance reports ready for auditors and regulators
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auditing & Reporting */}
          <TabsContent value="auditing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail Management</CardTitle>
                <CardDescription>
                  Comprehensive audit trails for all system activities and data changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">What We Track</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        User login and logout activities
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Data creation, modification, and deletion
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        System configuration changes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Report generation and access
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Administrative actions
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Audit Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Immutable audit logs
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Detailed timestamp records
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        User identification and IP tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Advanced search and filtering
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Export capabilities for auditors
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Regulatory Reports</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Pre-built templates for common regulatory requirements
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• GDPR compliance reports</li>
                        <li>• SOX internal controls</li>
                        <li>• PCI DSS security reports</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Custom Reports</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Build custom compliance reports for specific requirements
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Flexible report builder</li>
                        <li>• Multiple export formats</li>
                        <li>• Scheduled delivery</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Real-time Status</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Monitor compliance status across all frameworks
                      </p>
                      <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-700">Compliant</Badge>
                        <Badge className="bg-yellow-100 text-yellow-700">Review Required</Badge>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Risk Alerts</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Proactive notifications for compliance risks
                      </p>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-100 text-blue-700">Low Risk</Badge>
                        <Badge className="bg-orange-100 text-orange-700">Medium Risk</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Compliance Team */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Compliance Support?</h2>
            <p className="mb-6 opacity-90">
              Our compliance experts can help you navigate regulatory requirements and implement best practices.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Compliance Team</h4>
                <p className="text-sm opacity-90">compliance@oasys360.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Regulatory Updates</h4>
                <p className="text-sm opacity-90">regulations@oasys360.com</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Contact Compliance Team
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Download className="w-5 h-5 mr-2" />
                Download Compliance Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 