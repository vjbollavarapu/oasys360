import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community - OASYS',
  description: 'Join the OASYS community of users, developers, and financial professionals sharing knowledge and best practices.',
}

export default function CommunityPage() {
  const communityStats = [
    { number: "5,000+", label: "Active Members" },
    { number: "2,500+", label: "Discussions" },
    { number: "500+", label: "Solutions Shared" },
    { number: "24/7", label: "Community Support" }
  ]

  const discussionCategories = [
    {
      title: "Getting Started",
      posts: 234,
      description: "New to OASYS? Get help from the community and share your first experiences."
    },
    {
      title: "AI Features",
      posts: 456,
      description: "Discuss AI document processing, categorization, and predictive analytics."
    },
    {
      title: "Blockchain & Security",
      posts: 123,
      description: "Share insights about blockchain integration and security best practices."
    },
    {
      title: "Integrations",
      posts: 189,
      description: "Connect OASYS with your existing tools and share integration tips."
    },
    {
      title: "Feature Requests",
      posts: 345,
      description: "Suggest new features and vote on upcoming improvements."
    },
    {
      title: "Success Stories",
      posts: 167,
      description: "Share your success stories and learn from other users' experiences."
    }
  ]

  const recentPosts = [
    {
      title: "How to achieve 99.5% accuracy with AI document processing",
      author: "Sarah Chen",
      category: "AI Features",
      replies: 12,
      views: 234,
      time: "2 hours ago"
    },
    {
      title: "Best practices for blockchain audit trails",
      author: "Michael Rodriguez",
      category: "Blockchain & Security",
      replies: 8,
      views: 156,
      time: "5 hours ago"
    },
    {
      title: "Integration with QuickBooks - Step by step guide",
      author: "Emma Thompson",
      category: "Integrations",
      replies: 15,
      views: 289,
      time: "1 day ago"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              OASYS <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Community</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with fellow users, share knowledge, and get help from the OASYS community 
              of financial professionals and technology enthusiasts.
            </p>
          </div>

          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {communityStats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Discussion Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discussionCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold">
                      {category.posts}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
                    Join Discussion
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Recent Discussions</h2>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                {recentPosts.map((post, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                          {post.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span>👤 {post.author}</span>
                          <span>📂 {post.category}</span>
                          <span>💬 {post.replies} replies</span>
                          <span>👁️ {post.views} views</span>
                          <span>⏰ {post.time}</span>
                        </div>
                      </div>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors">
                        View Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Community Guidelines</h2>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">✅ Do</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Be respectful and helpful to fellow members
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Share your experiences and best practices
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Search before asking questions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Provide constructive feedback
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">❌ Don't</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Spam or promote unrelated services
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Share sensitive financial information
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Use inappropriate language
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Post duplicate questions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Join the Community?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Connect with thousands of OASYS users, share your knowledge, and get help from 
              the community. Join us today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                Join Community
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                View All Discussions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
