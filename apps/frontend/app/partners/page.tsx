import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partners - OASYS',
  description: 'Join our partner ecosystem and help businesses transform their financial operations with OASYS AI-powered platform.',
}

export default function PartnersPage() {
  const partnerTypes = [
    {
      title: "Technology Partners",
      description: "Integrate OASYS with your existing financial software and tools",
      benefits: ["API Access", "Technical Support", "Co-marketing Opportunities", "Revenue Sharing"]
    },
    {
      title: "Consulting Partners",
      description: "Help businesses implement and optimize OASYS for their specific needs",
      benefits: ["Partner Training", "Certification Program", "Lead Sharing", "Dedicated Support"]
    },
    {
      title: "Channel Partners",
      description: "Resell OASYS to your clients and build recurring revenue streams",
      benefits: ["Competitive Margins", "Marketing Support", "Sales Training", "Partner Portal"]
    }
  ]

  const currentPartners = [
    { name: "Microsoft", type: "Technology Partner", logo: "🏢" },
    { name: "AWS", type: "Cloud Partner", logo: "☁️" },
    { name: "Deloitte", type: "Consulting Partner", logo: "🏛️" },
    { name: "PwC", type: "Consulting Partner", logo: "📊" },
    { name: "Accenture", type: "Technology Partner", logo: "🔧" },
    { name: "IBM", type: "Technology Partner", logo: "💻" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Partner with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">OASYS</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join our growing ecosystem of partners and help businesses worldwide transform 
              their financial operations with AI-powered technology.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Partnership Opportunities</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {partnerTypes.map((type, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Current Partners</h2>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {currentPartners.map((partner, index) => (
                  <div key={index} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-3xl mb-2">{partner.logo}</div>
                    <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                    <p className="text-sm text-gray-600">{partner.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Partner with OASYS?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Growing Market</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    $50B+ AI in Finance market
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    300% annual growth rate
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Early market entry advantage
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Proven Technology</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    99.5% AI accuracy rate
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Enterprise-grade security
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Scalable architecture
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Partner Success Stories</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Microsoft Partnership</h3>
                <p className="text-gray-600 mb-2">
                  "Integrating OASYS with Microsoft Dynamics has enabled our clients to achieve 
                  40% faster financial processing with 99.5% accuracy."
                </p>
                <span className="text-sm text-gray-500">- Microsoft Partner Solutions</span>
              </div>
              <div className="border-l-4 border-purple-600 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Deloitte Consulting</h3>
                <p className="text-gray-600 mb-2">
                  "OASYS has transformed how we help clients implement AI-powered financial systems. 
                  The results speak for themselves."
                </p>
                <span className="text-sm text-gray-500">- Deloitte Digital</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Partner with Us?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join our partner ecosystem and help businesses worldwide transform their financial 
              operations with cutting-edge AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                Become a Partner
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                Download Partner Kit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
