import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers - OASYS',
  description: 'Join the OASYS team and help build the future of AI-powered business finance. Explore career opportunities and be part of our mission.',
}

export default function CareersPage() {
  const positions = [
    {
      title: "Senior AI Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Lead the development of our AI algorithms for document processing and financial analytics."
    },
    {
      title: "Blockchain Developer",
      department: "Engineering", 
      location: "Remote",
      type: "Full-time",
      description: "Build and maintain our blockchain integration and smart contract systems."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time", 
      description: "Drive product strategy and work with our beta users to shape the platform."
    },
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote", 
      type: "Full-time",
      description: "Create beautiful, responsive user interfaces for our financial platform."
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Manage our cloud infrastructure and ensure 99.9% uptime for our platform."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help our beta users succeed and provide feedback to improve our product."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Join the <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">OASYS</span> Team
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Help us build the future of AI-powered business finance. We're looking for talented 
              individuals who share our vision of transforming financial operations.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Work at OASYS?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Cutting-Edge Technology</h3>
                    <p className="text-gray-600 text-sm">Work with the latest AI and blockchain technologies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Remote-First Culture</h3>
                    <p className="text-gray-600 text-sm">Work from anywhere with flexible schedules</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Beta Program Access</h3>
                    <p className="text-gray-600 text-sm">Shape the product and work directly with users</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Competitive Benefits</h3>
                    <p className="text-gray-600 text-sm">Health insurance, equity, and learning budget</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Growth Opportunities</h3>
                    <p className="text-gray-600 text-sm">Fast-paced environment with rapid career growth</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Impact</h3>
                    <p className="text-gray-600 text-sm">Help businesses worldwide improve their finances</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
            <div className="space-y-4">
              {positions.map((position, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-lg border border-gray-200 transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                      <p className="text-gray-600 mb-2">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{position.department}</span>
                        <span>•</span>
                        <span>{position.location}</span>
                        <span>•</span>
                        <span>{position.type}</span>
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Don't See Your Role?</h2>
            <p className="text-gray-600 mb-6">
              We're always looking for talented individuals who share our vision. Even if you don't 
              see a specific role that matches your skills, we'd love to hear from you.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all">
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
