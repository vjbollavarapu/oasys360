import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  TrendingUp,
  Brain,
  Shield,
  Globe,
  Zap,
  DollarSign
} from 'lucide-react'

export default function BlogPage() {
  const featuredPost = {
    id: 1,
    title: "The Future of AI in Accounting: How Machine Learning is Transforming Financial Operations",
    excerpt: "Discover how artificial intelligence is revolutionizing accounting practices, from automated bookkeeping to predictive financial analytics. Learn about the latest AI trends that are reshaping the industry.",
    author: "Sarah Chen",
    date: "2024-03-15",
    readTime: "8 min read",
    category: "AI & Technology",
    image: "/placeholder.jpg",
    featured: true
  }

  const blogPosts = [
    {
      id: 2,
      title: "Web3 Accounting: Managing Cryptocurrency and DeFi Transactions",
      excerpt: "A comprehensive guide to handling crypto assets, DeFi protocols, and blockchain transactions in your accounting system.",
      author: "Marcus Rodriguez",
      date: "2024-03-12",
      readTime: "12 min read",
      category: "Web3 & Crypto",
      image: "/placeholder.jpg"
    },
    {
      id: 3,
      title: "E-invoicing Compliance: Malaysia's MyInvois Implementation Guide",
      excerpt: "Everything you need to know about Malaysia's mandatory e-invoicing system and how to ensure compliance for your business.",
      author: "Priya Nair",
      date: "2024-03-10",
      readTime: "10 min read",
      category: "Compliance",
      image: "/placeholder.jpg"
    },
    {
      id: 4,
      title: "5 Ways AI Can Reduce Accounting Errors and Improve Accuracy",
      excerpt: "Explore how artificial intelligence can help eliminate common accounting mistakes and boost financial accuracy.",
      author: "David Kim",
      date: "2024-03-08",
      readTime: "6 min read",
      category: "AI & Technology",
      image: "/placeholder.jpg"
    },
    {
      id: 5,
      title: "Building a Multi-Currency Accounting System for Global Businesses",
      excerpt: "Learn best practices for handling multiple currencies, exchange rates, and international financial regulations.",
      author: "Emma Thompson",
      date: "2024-03-05",
      readTime: "14 min read",
      category: "Global Finance",
      image: "/placeholder.jpg"
    },
    {
      id: 6,
      title: "Mobile Accounting: Managing Finances on the Go",
      excerpt: "How mobile technology is enabling real-time financial management and improving business agility.",
      author: "James Wilson",
      date: "2024-03-02",
      readTime: "7 min read",
      category: "Mobile & Apps",
      image: "/placeholder.jpg"
    },
    {
      id: 7,
      title: "Fraud Prevention in Digital Accounting: AI-Powered Security Measures",
      excerpt: "Discover how AI and machine learning are being used to detect and prevent financial fraud in real-time.",
      author: "Lisa Zhang",
      date: "2024-02-28",
      readTime: "9 min read",
      category: "Security",
      image: "/placeholder.jpg"
    },
    {
      id: 8,
      title: "The ROI of Automated Accounting: Real Business Case Studies",
      excerpt: "See how companies have achieved significant cost savings and efficiency gains through accounting automation.",
      author: "Michael Brown",
      date: "2024-02-25",
      readTime: "11 min read",
      category: "Business Growth",
      image: "/placeholder.jpg"
    },
    {
      id: 9,
      title: "Integration Strategies: Connecting Your Accounting System with Business Tools",
      excerpt: "Best practices for integrating accounting software with CRM, ERP, and other business management systems.",
      author: "Anna Kowalski",
      date: "2024-02-22",
      readTime: "13 min read",
      category: "Integration",
      image: "/placeholder.jpg"
    }
  ]

  const categories = [
    { name: "All Posts", count: 25, icon: Globe },
    { name: "AI & Technology", count: 8, icon: Brain },
    { name: "Web3 & Crypto", count: 5, icon: Zap },
    { name: "Compliance", count: 6, icon: Shield },
    { name: "Business Growth", count: 4, icon: TrendingUp },
    { name: "Security", count: 2, icon: Shield }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & Technology": return Brain
      case "Web3 & Crypto": return Zap
      case "Compliance": return Shield
      case "Global Finance": return Globe
      case "Mobile & Apps": return Globe
      case "Security": return Shield
      case "Business Growth": return TrendingUp
      case "Integration": return Globe
      default: return Globe
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI & Technology": return "bg-purple-100 text-purple-700 border-purple-200"
      case "Web3 & Crypto": return "bg-green-100 text-green-700 border-green-200"
      case "Compliance": return "bg-blue-100 text-blue-700 border-blue-200"
      case "Global Finance": return "bg-orange-100 text-orange-700 border-orange-200"
      case "Mobile & Apps": return "bg-pink-100 text-pink-700 border-pink-200"
      case "Security": return "bg-red-100 text-red-700 border-red-200"
      case "Business Growth": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Integration": return "bg-indigo-100 text-indigo-700 border-indigo-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              OASYS Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Insights, tutorials, and updates on AI-powered accounting, Web3 finance, and business innovation
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 pr-4 py-3 rounded-full border-gray-200"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <button
                          key={category.name}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {category.count}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Stay Updated</CardTitle>
                  <CardDescription className="text-blue-600">
                    Get the latest insights delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Your email address" 
                      className="border-blue-200"
                    />
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blogPosts.slice(0, 3).map((post, idx) => (
                      <div key={post.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-2 mb-1">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-500">{post.readTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Post */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <Image
                    src="/placeholder.jpg"
                    alt={featuredPost.title}
                    width={400}
                    height={300}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <Badge className="mb-3 bg-purple-600 hover:bg-purple-700">
                    Featured
                  </Badge>
                  <h2 className="text-2xl font-bold text-purple-900 mb-3 line-clamp-2">
                    {featuredPost.title}
                  </h2>
                  <p className="text-purple-700 mb-4 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-purple-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredPost.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Posts Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogPosts.map((post) => {
                  const CategoryIcon = getCategoryIcon(post.category)
                  return (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                      <div className="relative overflow-hidden">
                        <Image
                          src="/placeholder.jpg"
                          alt={post.title}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className={getCategoryColor(post.category)}>
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.date}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" size="lg">
                Load More Articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-16">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Accounting?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of businesses using OASYS for AI-powered financial management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 