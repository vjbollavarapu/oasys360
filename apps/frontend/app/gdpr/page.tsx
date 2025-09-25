import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR Compliance - OASYS',
  description: 'Learn about OASYS commitment to GDPR compliance and data protection regulations.',
}

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              GDPR <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Compliance</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              OASYS is committed to full compliance with the General Data Protection Regulation (GDPR) 
              and protecting your personal data.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our GDPR Commitment</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                The General Data Protection Regulation (GDPR) is a comprehensive data protection law that 
                came into effect on May 25, 2018. OASYS is fully committed to GDPR compliance and has 
                implemented robust data protection measures to safeguard your personal information.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe in transparency, accountability, and giving you control over your personal data.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights Under GDPR</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Right to Access</h3>
                  <p className="text-gray-600 text-sm">You can request access to all personal data we hold about you.</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Right to Rectification</h3>
                  <p className="text-gray-600 text-sm">You can request correction of inaccurate or incomplete personal data.</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Right to Erasure</h3>
                  <p className="text-gray-600 text-sm">You can request deletion of your personal data in certain circumstances.</p>
                </div>
                <div className="border-l-4 border-orange-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Right to Restrict Processing</h3>
                  <p className="text-gray-600 text-sm">You can request limitation of how we process your personal data.</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Right to Data Portability</h3>
                  <p className="text-gray-600 text-sm">You can request your data in a structured, machine-readable format.</p>
                </div>
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Right to Object</h3>
                  <p className="text-gray-600 text-sm">You can object to processing of your personal data for certain purposes.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Protect Your Data</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Safeguards</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      End-to-end encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Secure data centers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Regular security audits
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Access controls and monitoring
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Organizational Measures</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Data protection training
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Privacy by design
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Data minimization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Regular compliance reviews
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Processing Lawful Basis</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Contract Performance</h3>
                  <p className="text-gray-600 text-sm">
                    We process your data to provide our AI-powered financial services and fulfill our contractual obligations.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Legitimate Interest</h3>
                  <p className="text-gray-600 text-sm">
                    We process data for legitimate business interests such as improving our services and preventing fraud.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Consent</h3>
                  <p className="text-gray-600 text-sm">
                    We obtain explicit consent for marketing communications and non-essential data processing.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Obligation</h3>
                  <p className="text-gray-600 text-sm">
                    We process data to comply with legal requirements and regulatory obligations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Exercising Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                To exercise any of your GDPR rights, please contact our Data Protection Officer:
              </p>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h3>
                <p className="text-gray-600 mb-2">Email: <a href="mailto:dpo@oasys.com" className="text-blue-600 hover:underline">dpo@oasys.com</a></p>
                <p className="text-gray-600 mb-2">Phone: +1 (555) 123-4567</p>
                <p className="text-gray-600">Response Time: Within 30 days</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Breach Notification</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                In the unlikely event of a data breach, we have procedures in place to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Immediately assess and contain the breach</li>
                <li>Notify the relevant supervisory authority within 72 hours</li>
                <li>Inform affected individuals without undue delay</li>
                <li>Document all breach incidents and remedial actions</li>
              </ul>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  <strong>Last Updated:</strong> January 15, 2024
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Supervisory Authority:</strong> Information Commissioner's Office (ICO)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
