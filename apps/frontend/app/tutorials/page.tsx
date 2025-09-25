import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tutorials - OASYS',
  description: 'Learn how to use OASYS with step-by-step tutorials and guides for AI-powered business finance.',
}

export default function TutorialsPage() {
  const tutorialCategories = [
    {
      title: "Getting Started",
      tutorials: [
        {
          title: "Setting Up Your First Account",
          duration: "5 min",
          difficulty: "Beginner",
          description: "Learn how to create your OASYS account and complete the initial setup process."
        },
        {
          title: "Connecting Your Bank Accounts",
          duration: "8 min",
          difficulty: "Beginner",
          description: "Step-by-step guide to securely connect your bank accounts for automated data import."
        },
        {
          title: "Understanding the Dashboard",
          duration: "10 min",
          difficulty: "Beginner",
          description: "Navigate the OASYS dashboard and understand key features and metrics."
        }
      ]
    },
    {
      title: "AI Features",
      tutorials: [
        {
          title: "AI Document Processing",
          duration: "12 min",
          difficulty: "Intermediate",
          description: "Master AI-powered document processing and achieve 99.5% accuracy."
        },
        {
          title: "Setting Up AI Categorization",
          duration: "15 min",
          difficulty: "Intermediate",
          description: "Configure and train AI categorization rules for your business."
        },
        {
          title: "Using Predictive Analytics",
          duration: "20 min",
          difficulty: "Advanced",
          description: "Leverage AI predictions for cash flow forecasting and business insights."
        }
      ]
    },
    {
      title: "Advanced Features",
      tutorials: [
        {
          title: "Blockchain Integration",
          duration: "18 min",
          difficulty: "Advanced",
          description: "Set up blockchain audit trails and immutable financial records."
        },
        {
          title: "Fraud Detection Setup",
          duration: "14 min",
          difficulty: "Intermediate",
          description: "Configure AI-powered fraud detection and risk management."
        },
        {
          title: "Custom Reporting",
          duration: "25 min",
          difficulty: "Advanced",
          description: "Create custom reports and automated compliance documentation."
        }
      ]
    }
  ]

  const popularTutorials = [
    {
      title: "Complete OASYS Setup in 30 Minutes",
      views: "15,234",
      rating: "4.9",
      duration: "30 min"
    },
    {
      title: "AI Document Processing Masterclass",
      views: "12,567",
      rating: "4.8",
      duration: "45 min"
    },
    {
      title: "Blockchain Security for Business Finance",
      views: "8,901",
      rating: "4.9",
      duration: "35 min"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tutorials</span> & Guides
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Master OASYS with our comprehensive tutorials and step-by-step guides designed 
              for users of all skill levels.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Tutorials</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {popularTutorials.map((tutorial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600">{tutorial.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tutorial.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>👁️ {tutorial.views} views</span>
                    <span>⏱️ {tutorial.duration}</span>
                  </div>
                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
                    Watch Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            {tutorialCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.title}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.tutorials.map((tutorial, tutorialIndex) => (
                    <div key={tutorialIndex} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tutorial.difficulty}
                        </span>
                        <span className="text-sm text-gray-600">⏱️ {tutorial.duration}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{tutorial.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold transition-colors">
                        Start Tutorial
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with a Specific Topic?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Request a tutorial or get personalized help from our experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Request Tutorial
                </button>
                <button className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
