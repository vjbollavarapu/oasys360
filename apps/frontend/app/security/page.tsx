"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { SecurityOverview } from "@/components/pages/security/overview"
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  Server, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Download,
  ExternalLink,
  Zap,
  FileText,
  Users,
  Clock
} from 'lucide-react'

export default function SecurityPage() {
  const certifications = [
    {
      name: "SOC 2 Type II",
      description: "System and Organization Controls audit for security, availability, and confidentiality",
      status: "Certified",
      icon: Shield
    },
    {
      name: "ISO 27001",
      description: "International standard for information security management systems",
      status: "Certified",
      icon: Globe
    },
    {
      name: "GDPR Compliant",
      description: "Full compliance with European General Data Protection Regulation",
      status: "Compliant",
      icon: Eye
    },
    {
      name: "PCI DSS Level 1",
      description: "Payment Card Industry Data Security Standard for payment processing",
      status: "Certified",
      icon: Lock
    }
  ]

  const securityFeatures = [
    {
      category: "Data Encryption",
      icon: Lock,
      features: [
        "AES-256 encryption at rest",
        "TLS 1.3 encryption in transit",
        "End-to-end encryption for sensitive data",
        "Hardware security modules (HSM)",
        "Key rotation and management"
      ]
    },
    {
      category: "Access Control",
      icon: Key,
      features: [
        "Multi-factor authentication (MFA)",
        "Role-based access control (RBAC)",
        "Single sign-on (SSO) integration",
        "Session management and timeout",
        "API key authentication"
      ]
    },
    {
      category: "Network Security",
      icon: Globe,
      features: [
        "Web application firewall (WAF)",
        "DDoS protection and mitigation",
        "Network segmentation",
        "Intrusion detection systems",
        "VPN access for administrators"
      ]
    },
    {
      category: "Monitoring & Auditing",
      icon: Eye,
      features: [
        "24/7 security monitoring",
        "Real-time threat detection",
        "Comprehensive audit logs",
        "Security incident response",
        "Vulnerability scanning"
      ]
    }
  ]

  const threatProtection = [
    {
      threat: "Data Breaches",
      protection: "Multi-layered encryption, access controls, and continuous monitoring",
      status: "Protected"
    },
    {
      threat: "Malware & Viruses",
      protection: "Advanced threat detection, file scanning, and sandboxing",
      status: "Protected"
    },
    {
      threat: "Phishing Attacks",
      protection: "Email security, user training, and multi-factor authentication",
      status: "Protected"
    },
    {
      threat: "Insider Threats",
      protection: "Role-based access, activity monitoring, and background checks",
      status: "Monitored"
    },
    {
      threat: "DDoS Attacks",
      protection: "Traffic filtering, rate limiting, and CDN protection",
      status: "Protected"
    },
    {
      threat: "API Abuse",
      protection: "Rate limiting, authentication, and request validation",
      status: "Protected"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Security & Compliance
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Enterprise-grade security protecting your financial data and business operations
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                SOC 2 Certified
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                ISO 27001
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                GDPR Compliant
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Security Overview */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="text-blue-900 text-2xl">Security First Approach</CardTitle>
            <CardDescription className="text-blue-600 text-lg">
              Every aspect of OASYS is built with security and compliance at its core
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <Lock className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Bank-Level Encryption</h3>
                <p className="text-sm text-blue-700">
                  Military-grade AES-256 encryption protects your data at rest and in transit
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <Shield className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Continuous Monitoring</h3>
                <p className="text-sm text-blue-700">
                  24/7 security operations center monitoring for threats and vulnerabilities
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <CheckCircle className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Compliance Ready</h3>
                <p className="text-sm text-blue-700">
                  Built-in compliance features for GDPR, SOX, PCI DSS, and regional regulations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="features" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-white rounded-2xl shadow-sm">
            <TabsTrigger value="features" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Lock className="w-4 h-4 mr-2" />
              Security Features
            </TabsTrigger>
            <TabsTrigger value="compliance" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Server className="w-4 h-4 mr-2" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="threats" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Threat Protection
            </TabsTrigger>
          </TabsList>

          {/* Security Features */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityFeatures.map((category, idx) => {
                const IconComponent = category.icon
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.features.map((feature, fidx) => (
                          <li key={fidx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Additional Security Measures */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Additional Security Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <Users className="w-6 h-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-900 mb-1">Security Team</h4>
                    <p className="text-sm text-green-700">Dedicated security professionals with deep expertise</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <Clock className="w-6 h-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-900 mb-1">Incident Response</h4>
                    <p className="text-sm text-green-700">24/7 incident response with defined SLAs</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <Zap className="w-6 h-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-900 mb-1">Bug Bounty</h4>
                    <p className="text-sm text-green-700">Responsible disclosure program with security researchers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications.map((cert, idx) => {
                const IconComponent = cert.icon
                return (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{cert.name}</h3>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              {cert.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{cert.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Regional Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Compliance</CardTitle>
                <CardDescription>
                  We maintain compliance with financial regulations across multiple jurisdictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">🇪🇺 European Union</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• GDPR Data Protection</li>
                      <li>• MiFID II Financial Services</li>
                      <li>• PSD2 Payment Services</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">🇺🇸 United States</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• SOX Sarbanes-Oxley</li>
                      <li>• CCPA California Privacy</li>
                      <li>• GLBA Financial Privacy</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">🇲🇾 Southeast Asia</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Malaysia PDPA</li>
                      <li>• Singapore PDPC</li>
                      <li>• MyInvois E-invoicing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Infrastructure */}
          <TabsContent value="infrastructure" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">Cloud Infrastructure Security</CardTitle>
                <CardDescription className="text-purple-600">
                  Built on enterprise-grade cloud infrastructure with multiple layers of security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-purple-200">
                    <Server className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold text-purple-900 mb-2">Data Centers</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• SOC 2 Type II certified facilities</li>
                      <li>• 24/7 physical security</li>
                      <li>• Biometric access controls</li>
                      <li>• Environmental monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-purple-200">
                    <Globe className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold text-purple-900 mb-2">Global Redundancy</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Multi-region deployment</li>
                      <li>• Automatic failover systems</li>
                      <li>• Real-time data replication</li>
                      <li>• 99.99% uptime SLA</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Backup & Recovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Automated daily backups
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Point-in-time recovery
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Cross-region replication
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Disaster recovery testing
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Network Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Web Application Firewall
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      DDoS protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Network segmentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Intrusion detection
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Global CDN deployment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Auto-scaling infrastructure
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Load balancing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Performance monitoring
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Threat Protection */}
          <TabsContent value="threats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Protection Matrix</CardTitle>
                <CardDescription>
                  How we protect against common cybersecurity threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatProtection.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{item.threat}</h4>
                        <Badge className={
                          item.status === 'Protected' 
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.protection}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900">Security Incident Response</CardTitle>
              </CardHeader>
              <CardContent className="text-red-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">Detection</h4>
                    <p className="text-sm">Automated monitoring and alerting systems</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">Analysis</h4>
                    <p className="text-sm">Immediate threat assessment and impact analysis</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">Containment</h4>
                    <p className="text-sm">Rapid isolation and threat neutralization</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">Recovery</h4>
                    <p className="text-sm">System restoration and security improvements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Security Team */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Security Questions or Concerns?</h2>
            <p className="mb-6 opacity-90">
              Our security team is available to address any questions about our security practices and compliance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Security Team</h4>
                <p className="text-sm opacity-90">security@oasys360.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Vulnerability Reports</h4>
                <p className="text-sm opacity-90">security-reports@oasys360.com</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Contact Security Team
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Download className="w-5 h-5 mr-2" />
                Download Security Whitepaper
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
