import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies - OASYS',
  description: 'Real-world success stories of businesses transforming their financial operations with OASYS AI-powered platform.',
}

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      company: "TechStart Inc.",
      industry: "Technology",
      size: "50-200 employees",
      challenge: "Manual invoice processing taking 40 hours per week",
      solution: "AI-powered document processing and automated categorization",
      results: [
        "95% reduction in processing time",
        "99.5% accuracy in data extraction",
        "$50K annual cost savings",
        "Real-time financial insights"
      ],
      testimonial: "OASYS transformed our financial operations. What used to take our team 40 hours now takes 2 hours with perfect accuracy."
    },
    {
      company: "Global Manufacturing Co.",
      industry: "Manufacturing",
      size: "500+ employees",
      challenge: "Complex multi-currency transactions and compliance requirements",
      solution: "Blockchain-based audit trails and automated compliance reporting",
      results: [
        "100% audit trail transparency",
        "60% faster compliance reporting",
        "Zero compliance violations",
        "Multi-currency automation"
      ],
      testimonial: "The blockchain integration gives us complete transparency and confidence in our financial records."
    },
    {
      company: "E-commerce Retailer",
      industry: "Retail",
      size: "100-500 employees",
      challenge: "Fraud detection and cash flow prediction",
      solution: "AI fraud detection and predictive analytics",
      results: [
        "99.9% fraud detection rate",
        "85% better cash flow predictions",
        "$200K prevented fraud losses",
        "30% improvement in working capital"
      ],
      testimonial: "OASYS AI caught fraudulent transactions we would have missed and helped us optimize our cash flow."
    },
    {
      company: "Financial Services Firm",
      industry: "Finance",
      size: "200-500 employees",
      challenge: "Regulatory compliance and risk management",
      solution: "Automated compliance monitoring and risk assessment",
      results: [
        "Real-time compliance monitoring",
        "Automated risk assessments",
        "50% reduction in audit time",
        "Zero regulatory penalties"
      ],
      testimonial: "OASYS ensures we stay compliant while focusing on growing our business."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Success <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Stories</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover how businesses across industries are transforming their financial operations 
              with OASYS AI-powered platform.
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{study.company}</h2>
                      <div className="flex flex-wrap gap-4 text-blue-100">
                        <span>{study.industry}</span>
                        <span>•</span>
                        <span>{study.size}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">99.5%</div>
                      <div className="text-blue-100 text-sm">Average Accuracy</div>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Challenge</h3>
                        <p className="text-gray-600">{study.challenge}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Solution</h3>
                        <p className="text-gray-600">{study.solution}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Testimonial</h3>
                        <p className="text-gray-700 italic">"{study.testimonial}"</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Results</h3>
                      <div className="space-y-3">
                        {study.results.map((result, resultIndex) => (
                          <div key={resultIndex} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            </div>
                            <span className="text-gray-700">{result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Write Your Success Story?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join hundreds of businesses already transforming their financial operations with OASYS. 
                Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Start Free Trial
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
