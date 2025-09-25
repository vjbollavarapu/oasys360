import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center - OASYS',
  description: 'Get help and support for OASYS AI-powered business finance platform. Find answers, tutorials, and contact support.',
}

export default function HelpPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      faqs: [
        {
          question: "How do I set up my OASYS account?",
          answer: "Setting up your OASYS account is simple. After signing up, you'll be guided through a quick onboarding process to connect your financial data sources and configure your preferences."
        },
        {
          question: "What data sources does OASYS support?",
          answer: "OASYS supports integration with major banks, accounting software, payment processors, and can process documents from various formats including PDF, Excel, and CSV files."
        },
        {
          question: "How accurate is the AI document processing?",
          answer: "Our AI achieves 99.5% accuracy in document processing, with continuous learning to improve performance over time."
        }
      ]
    },
    {
      title: "AI Features",
      faqs: [
        {
          question: "How does AI categorization work?",
          answer: "Our AI uses machine learning algorithms trained on millions of transactions to automatically categorize your financial data with 95% accuracy."
        },
        {
          question: "Can I customize the AI predictions?",
          answer: "Yes, you can train the AI on your specific business patterns and provide feedback to improve accuracy for your unique use cases."
        },
        {
          question: "How does fraud detection work?",
          answer: "Our AI monitors transaction patterns in real-time and flags anomalies that could indicate fraudulent activity, achieving 99.9% detection accuracy."
        }
      ]
    },
    {
      title: "Blockchain & Security",
      faqs: [
        {
          question: "How secure is my financial data?",
          answer: "OASYS uses enterprise-grade encryption, blockchain technology for immutable audit trails, and complies with international security standards."
        },
        {
          question: "What is blockchain integration used for?",
          answer: "Blockchain integration provides tamper-proof audit trails, transparent financial records, and automated compliance reporting."
        },
        {
          question: "Can I export my blockchain records?",
          answer: "Yes, all blockchain records can be exported in various formats for compliance and audit purposes."
        }
      ]
    }
  ]

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our AI-powered support team",
      availability: "24/7",
      icon: "💬"
    },
    {
      title: "Email Support",
      description: "Send us your questions and get detailed responses",
      availability: "Within 2 hours",
      icon: "📧"
    },
    {
      title: "Video Call",
      description: "Schedule a one-on-one session with our experts",
      availability: "Business hours",
      icon: "📹"
    },
    {
      title: "Community Forum",
      description: "Connect with other users and share best practices",
      availability: "24/7",
      icon: "👥"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Help <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Find answers to your questions and get the support you need to make the most of OASYS.
            </p>
          </div>

          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search for help articles, tutorials, or FAQs..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Support Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-lg border border-gray-200 transition-shadow">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                  <span className="text-xs text-blue-600 font-semibold">{option.availability}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{category.title}</h3>
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <button className="w-full text-left">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {faq.question}
                          </h4>
                          <p className="text-gray-600">{faq.answer}</p>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you succeed with OASYS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Contact Support
                </button>
                <button className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
