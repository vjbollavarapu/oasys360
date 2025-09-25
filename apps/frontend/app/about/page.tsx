import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - OASYS',
  description: 'Learn about OASYS, the AI-powered business finance platform revolutionizing financial operations with blockchain technology.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">OASYS</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're building the future of AI-powered business finance, combining cutting-edge technology 
              with practical solutions for modern businesses.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                OASYS was founded with a simple yet ambitious vision: to revolutionize business finance 
                through the power of artificial intelligence and blockchain technology. We believe that 
                every business, regardless of size, should have access to enterprise-grade financial 
                tools that can automate complex processes, provide real-time insights, and ensure 
                complete transparency and security.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our platform combines advanced AI algorithms with blockchain security to deliver 
                unprecedented accuracy in document processing, predictive analytics, and automated 
                financial operations. We're not just building software – we're creating the foundation 
                for the future of business finance.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Technology</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Intelligence</h3>
                  <p className="text-gray-600 text-sm">
                    Our proprietary AI algorithms achieve 99.5% accuracy in document processing, 
                    automated categorization, and predictive analytics.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Security</h3>
                  <p className="text-gray-600 text-sm">
                    Enterprise-grade security with immutable audit trails and transparent 
                    financial records using blockchain technology.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Processing</h3>
                  <p className="text-gray-600 text-sm">
                    Instant data processing and analysis with real-time insights and 
                    automated decision-making capabilities.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Compliance</h3>
                  <p className="text-gray-600 text-sm">
                    Built-in compliance with international financial regulations and 
                    multi-country tax requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                OASYS is built by a team of experienced entrepreneurs, AI researchers, blockchain 
                developers, and financial experts who share a common vision of transforming business 
                finance. Our team combines decades of experience in fintech, enterprise software, 
                and cutting-edge technology development.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-600">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
                  <div className="text-gray-600">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                  <div className="text-gray-600">Years Combined Experience</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Journey</h2>
              <p className="text-gray-600 leading-relaxed">
                We're currently in beta and looking for forward-thinking businesses to help us 
                shape the future of AI-powered finance. Join our beta program to get early access 
                to our platform and work directly with our founders to build the features you need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
