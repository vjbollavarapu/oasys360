import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security Policy - OASYS',
  description: 'Learn about OASYS comprehensive security measures and policies to protect your data.',
}

export default function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Security <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              OASYS implements comprehensive security measures to protect your financial data 
              and ensure the highest levels of security and compliance.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Security Commitment</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Security is at the core of everything we do at OASYS. We understand that financial data 
                requires the highest level of protection, and we have implemented enterprise-grade security 
                measures to safeguard your information.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our security framework is built on industry best practices and continuous monitoring 
                to ensure your data remains secure at all times.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection Measures</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Encryption</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      AES-256 encryption at rest
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      TLS 1.3 encryption in transit
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      End-to-end encryption for sensitive data
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Key management and rotation
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Access Controls</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Multi-factor authentication
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Role-based access control
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Privileged access management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Regular access reviews
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Infrastructure Security</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cloud Security</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Our infrastructure is hosted on enterprise-grade cloud platforms with comprehensive security controls.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>SOC 2 Type II certified data centers</li>
                    <li>24/7 physical security and monitoring</li>
                    <li>Redundant systems and disaster recovery</li>
                    <li>Network segmentation and firewalls</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Security</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Our applications are built with security-first principles and undergo regular security testing.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Secure coding practices and code reviews</li>
                    <li>Automated vulnerability scanning</li>
                    <li>Penetration testing by third parties</li>
                    <li>Regular security updates and patches</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Monitoring & Incident Response</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Continuous Monitoring</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      24/7 security monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Real-time threat detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Automated alerting systems
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Security information management
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Incident Response</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      Dedicated security team
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      Incident response procedures
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      Forensic analysis capabilities
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      Customer notification process
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance & Certifications</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Industry Standards</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">SOC 2 Type II</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">ISO 27001</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">PCI DSS Level 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">GDPR Compliant</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Regular Audits</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">Annual security assessments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">Third-party penetration testing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">Compliance reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">Risk assessments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporting Security Issues</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you discover a security vulnerability or have concerns about our security practices, 
                please report it to our security team immediately.
              </p>
              <div className="bg-red-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Security Contact</h3>
                <p className="text-gray-600 mb-2">Email: <a href="mailto:security@oasys360.com" className="text-blue-600 hover:underline">security@oasys360.com</a></p>
                <p className="text-gray-600 mb-2">Phone: +1 (555) 123-4567 (Emergency only)</p>
                <p className="text-gray-600">Response Time: Within 24 hours</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  <strong>Last Updated:</strong> January 15, 2024
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Security Team:</strong> Available 24/7 for critical security issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
