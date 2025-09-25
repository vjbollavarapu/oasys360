import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Press - OASYS',
  description: 'Latest news, press releases, and media coverage about OASYS, the AI-powered business finance platform.',
}

export default function PressPage() {
  const pressReleases = [
    {
      title: "OASYS Launches Beta Program for AI-Powered Business Finance Platform",
      date: "2024-01-15",
      summary: "Revolutionary platform combines AI and blockchain technology to transform financial operations for modern businesses."
    },
    {
      title: "OASYS Achieves 99.5% Accuracy in AI Document Processing",
      date: "2024-01-10", 
      summary: "Breakthrough in machine learning algorithms enables unprecedented accuracy in financial document processing."
    },
    {
      title: "OASYS Secures $10M Series A Funding for Global Expansion",
      date: "2024-01-05",
      summary: "Investment will accelerate development of AI-powered financial tools and expand market reach."
    }
  ]

  const mediaCoverage = [
    {
      outlet: "TechCrunch",
      title: "OASYS Revolutionizes Business Finance with AI and Blockchain",
      date: "2024-01-20",
      type: "Article"
    },
    {
      outlet: "Forbes",
      title: "The Future of Business Finance: AI Meets Blockchain",
      date: "2024-01-18",
      type: "Interview"
    },
    {
      outlet: "VentureBeat",
      title: "OASYS Beta Program Shows Promise for Financial Automation",
      date: "2024-01-16",
      type: "Review"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Press & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Media</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Latest news, press releases, and media coverage about OASYS and our mission to 
              revolutionize business finance with AI and blockchain technology.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{release.title}</h3>
                      <p className="text-gray-600 mb-3">{release.summary}</p>
                      <span className="text-sm text-gray-500">{release.date}</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Read More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Coverage</h2>
            <div className="space-y-4">
              {mediaCoverage.map((coverage, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">{coverage.outlet}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{coverage.type}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{coverage.title}</h3>
                      <span className="text-sm text-gray-500">{coverage.date}</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Read Article
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Press Kit</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Download Assets</h3>
                <div className="space-y-2">
                  <button className="block w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                    📸 Company Logo & Brand Assets
                  </button>
                  <button className="block w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                    📊 Product Screenshots & Demos
                  </button>
                  <button className="block w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                    👥 Team Photos & Bios
                  </button>
                  <button className="block w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                    📄 Company Fact Sheet
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Media Contact</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Email:</strong> press@oasys.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Response Time:</strong> Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our press mailing list to receive the latest news and announcements 
              about OASYS directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
