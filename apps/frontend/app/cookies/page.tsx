import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - OASYS',
  description: 'Learn about how OASYS uses cookies and similar technologies to improve your experience.',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cookie <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              This Cookie Policy explains how OASYS uses cookies and similar technologies 
              when you visit our website and use our services.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p className="text-gray-600 leading-relaxed">
                OASYS uses cookies and similar technologies to enhance your experience, analyze site usage, 
                and assist in our marketing efforts.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    These cookies are necessary for the website to function properly and cannot be disabled.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Authentication and security</li>
                    <li>Session management</li>
                    <li>Load balancing</li>
                    <li>User preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Page views and user behavior</li>
                    <li>Performance monitoring</li>
                    <li>Error tracking</li>
                    <li>Usage statistics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    These cookies enable enhanced functionality and personalization.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Language preferences</li>
                    <li>Theme settings</li>
                    <li>Customized content</li>
                    <li>User interface preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    These cookies are used to deliver relevant advertisements and marketing content.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Ad targeting</li>
                    <li>Campaign tracking</li>
                    <li>Social media integration</li>
                    <li>Retargeting</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Duration</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-900">Session Cookies</span>
                  <span className="text-gray-600">Deleted when you close your browser</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-900">Persistent Cookies</span>
                  <span className="text-gray-600">Remain on your device for a set period</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-gray-900">Maximum Duration</span>
                  <span className="text-gray-600">24 months</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                You can control and manage cookies in various ways. Please note that removing or blocking 
                cookies can impact your user experience and parts of our website may no longer function properly.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
                  <p className="text-gray-600 text-sm">
                    Most web browsers allow you to control cookies through their settings preferences. 
                    You can set your browser to refuse cookies or delete certain cookies.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookie Consent</h3>
                  <p className="text-gray-600 text-sm">
                    When you first visit our website, you'll see a cookie consent banner where you can 
                    choose which types of cookies to accept.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preference Center</h3>
                  <p className="text-gray-600 text-sm">
                    You can update your cookie preferences at any time through our preference center.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our website may contain third-party cookies from trusted partners who provide services on our behalf:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Google Analytics:</strong> Website analytics and performance monitoring</li>
                <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                <li><strong>Intercom:</strong> Customer support and communication</li>
                <li><strong>Hotjar:</strong> User experience and website optimization</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We will notify you of any material changes by posting the new Cookie Policy on this page 
                and updating the "Last Updated" date below.
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  <strong>Last Updated:</strong> January 15, 2024
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Contact:</strong> For questions about this Cookie Policy, please contact us at 
                  <a href="mailto:privacy@oasys360.com" className="text-blue-600 hover:underline"> privacy@oasys360.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
