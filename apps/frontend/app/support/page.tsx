import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support - OASYS',
  description: 'Get technical support and help for OASYS AI-powered business finance platform.',
}

export default function SupportPage() {
  const supportChannels = [
    {
      title: "Live Chat Support",
      description: "Get instant help from our AI-powered support team",
      availability: "24/7",
      responseTime: "Immediate",
      icon: "💬",
      features: ["AI-powered responses", "Human escalation", "Screen sharing", "File sharing"]
    },
    {
      title: "Email Support",
      description: "Send detailed questions and get comprehensive responses",
      availability: "24/7",
      responseTime: "< 2 hours",
      icon: "📧",
      features: ["Detailed responses", "File attachments", "Follow-up tracking", "Priority queue"]
    },
    {
      title: "Video Call Support",
      description: "Schedule one-on-one sessions with our technical experts",
      availability: "Business hours",
      responseTime: "Scheduled",
      icon: "📹",
      features: ["Screen sharing", "Live troubleshooting", "Training sessions", "Custom solutions"]
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support team for urgent issues",
      availability: "Business hours",
      responseTime: "Immediate",
      icon: "📞",
      features: ["Immediate response", "Voice support", "Urgent issues", "Direct escalation"]
    }
  ]

  const supportTopics = [
    {
      category: "Technical Issues",
      topics: [
        "Account setup and configuration",
        "API integration problems",
        "Data import/export issues",
        "Performance optimization"
      ]
    },
    {
      category: "AI Features",
      topics: [
        "Document processing accuracy",
        "AI categorization setup",
        "Predictive analytics configuration",
        "Fraud detection tuning"
      ]
    },
    {
      category: "Billing & Account",
      topics: [
        "Subscription management",
        "Payment issues",
        "Account upgrades/downgrades",
        "Invoice and billing questions"
      ]
    },
    {
      category: "Security & Compliance",
      topics: [
        "Security best practices",
        "Compliance requirements",
        "Data privacy concerns",
        "Blockchain integration"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Technical <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Support</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Get expert help and support for OASYS. Our team is here to help you succeed 
              with AI-powered business finance.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Support Channels</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {supportChannels.map((channel, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-lg border border-gray-200 transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{channel.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{channel.title}</h3>
                      <p className="text-gray-600 mb-3">{channel.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <span>🕒 {channel.availability}</span>
                        <span>⚡ {channel.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {channel.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
                    Contact Support
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Common Support Topics</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {supportTopics.map((category, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{category.category}</h3>
                  <div className="space-y-2">
                    {category.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Before You Contact Support</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Self-Help</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Check our <a href="/help" className="text-blue-600 hover:underline">Help Center</a>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Browse <a href="/tutorials" className="text-blue-600 hover:underline">tutorials</a> and guides
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Search the <a href="/community" className="text-blue-600 hover:underline">community forum</a>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Check <a href="/status" className="text-blue-600 hover:underline">system status</a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">When You Contact Us</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Describe the issue clearly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Include error messages
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Provide account information
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Attach relevant files
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              For urgent issues or if you can't find what you're looking for, our support team 
              is ready to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                Start Live Chat
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
