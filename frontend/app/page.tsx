"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  CheckCircle,
  Star,
  ArrowRight,
  Brain,
  Zap,
  FileText,
  Shield,
  Globe,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Play,
  Sparkles,
  BarChart3,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  Crown,
  Loader2,
  MessageCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GeolocationData {
  country: string
  currency: string
  symbol: string
  exchangeRate: number
  flag: string
  region: string
}

export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [geoData, setGeoData] = useState<GeolocationData>({
    country: 'United States',
    currency: 'USD',
    symbol: '$',
    exchangeRate: 1,
    flag: '🇺🇸',
    region: 'americas'
  })
  const [isLoadingGeo, setIsLoadingGeo] = useState(true)
  const [showCookiePolicy, setShowCookiePolicy] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const { toast } = useToast()

  // Cookie policy detection
  useEffect(() => {
    const cookieConsent = localStorage.getItem('oasys-cookie-consent')
    if (!cookieConsent) {
      setShowCookiePolicy(true)
    }
  }, [])

  const handleAcceptCookies = () => {
    localStorage.setItem('oasys-cookie-consent', 'accepted')
    setShowCookiePolicy(false)
    toast({
      title: "Cookie preferences saved",
      description: "Thank you for accepting our cookie policy.",
    })
  }

  const handleDeclineCookies = () => {
    localStorage.setItem('oasys-cookie-consent', 'declined')
    setShowCookiePolicy(false)
    toast({
      title: "Cookie preferences saved",
      description: "You can change your preferences anytime in our privacy policy.",
    })
  }

  // Geolocation and currency detection
  useEffect(() => {
    const detectGeolocation = async () => {
      try {
        setIsLoadingGeo(true)
        
        // Try to get user's location via IP geolocation
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        // Currency mapping based on country
        const currencyMap: Record<string, GeolocationData> = {
          'MY': { country: 'Malaysia', currency: 'MYR', symbol: 'RM', exchangeRate: 4.7, flag: '🇲🇾', region: 'asia' },
          'SG': { country: 'Singapore', currency: 'SGD', symbol: 'S$', exchangeRate: 1.35, flag: '🇸🇬', region: 'asia' },
          'ID': { country: 'Indonesia', currency: 'IDR', symbol: 'Rp', exchangeRate: 15800, flag: '🇮🇩', region: 'asia' },
          'TH': { country: 'Thailand', currency: 'THB', symbol: '฿', exchangeRate: 36, flag: '🇹🇭', region: 'asia' },
          'PH': { country: 'Philippines', currency: 'PHP', symbol: '₱', exchangeRate: 56, flag: '🇵🇭', region: 'asia' },
          'VN': { country: 'Vietnam', currency: 'VND', symbol: '₫', exchangeRate: 24500, flag: '🇻🇳', region: 'asia' },
          'IN': { country: 'India', currency: 'INR', symbol: '₹', exchangeRate: 83, flag: '🇮🇳', region: 'asia' },
          'GB': { country: 'United Kingdom', currency: 'GBP', symbol: '£', exchangeRate: 0.79, flag: '🇬🇧', region: 'europe' },
          'EU': { country: 'European Union', currency: 'EUR', symbol: '€', exchangeRate: 0.92, flag: '🇪🇺', region: 'europe' },
          'CA': { country: 'Canada', currency: 'CAD', symbol: 'C$', exchangeRate: 1.37, flag: '🇨🇦', region: 'americas' },
          'AU': { country: 'Australia', currency: 'AUD', symbol: 'A$', exchangeRate: 1.52, flag: '🇦🇺', region: 'oceania' },
          'JP': { country: 'Japan', currency: 'JPY', symbol: '¥', exchangeRate: 149, flag: '🇯🇵', region: 'asia' },
          'KR': { country: 'South Korea', currency: 'KRW', symbol: '₩', exchangeRate: 1340, flag: '🇰🇷', region: 'asia' },
          'CN': { country: 'China', currency: 'CNY', symbol: '¥', exchangeRate: 7.3, flag: '🇨🇳', region: 'asia' },
          'BR': { country: 'Brazil', currency: 'BRL', symbol: 'R$', exchangeRate: 5.1, flag: '🇧🇷', region: 'americas' },
          'MX': { country: 'Mexico', currency: 'MXN', symbol: '$', exchangeRate: 17.5, flag: '🇲🇽', region: 'americas' },
          'ZA': { country: 'South Africa', currency: 'ZAR', symbol: 'R', exchangeRate: 18.8, flag: '🇿🇦', region: 'africa' },
          'AE': { country: 'UAE', currency: 'AED', symbol: 'د.إ', exchangeRate: 3.67, flag: '🇦🇪', region: 'middle_east' },
          'SA': { country: 'Saudi Arabia', currency: 'SAR', symbol: '﷼', exchangeRate: 3.75, flag: '🇸🇦', region: 'middle_east' }
        }

        const detectedCountry = data.country_code || 'US'
        const geoInfo = currencyMap[detectedCountry] || {
          country: 'United States',
          currency: 'USD',
          symbol: '$',
          exchangeRate: 1,
          flag: '🇺🇸',
          region: 'americas'
        }

        setGeoData(geoInfo)
        
        toast({
          title: `Welcome from ${geoInfo.country}! ${geoInfo.flag}`,
          description: `Prices shown in ${geoInfo.currency}`,
        })
        
      } catch (error) {
        console.error('Geolocation detection failed:', error)
        // Keep default USD pricing
      } finally {
        setIsLoadingGeo(false)
      }
    }

    detectGeolocation()
  }, [toast])

  // Helper function to format price based on currency
  const formatPrice = (usdPrice: number) => {
    const localPrice = usdPrice * geoData.exchangeRate
    
    // Format based on currency
    if (geoData.currency === 'JPY' || geoData.currency === 'KRW' || geoData.currency === 'IDR' || geoData.currency === 'VND') {
      return Math.round(localPrice).toLocaleString()
    } else {
      return localPrice.toFixed(0)
    }
  }

  // Helper function to get regional discount
  const getRegionalDiscount = () => {
    const discounts: Record<string, number> = {
      'asia': 0.85, // 15% discount for Asian markets
      'africa': 0.75, // 25% discount for African markets
      'americas': 1, // No discount for Americas
      'europe': 1, // No discount for Europe
      'oceania': 1, // No discount for Oceania
      'middle_east': 0.9 // 10% discount for Middle East
    }
    return discounts[geoData.region] || 1
  }

  // Waitlist signup handler
  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Welcome to the waitlist! 🎉",
      description: "You'll be among the first to experience the future of AI-powered accounting.",
    })
    
    setEmail('')
    setIsSubmitting(false)
  }

  // Contact form handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Message sent! 📨",
      description: "We'll get back to you within 24 hours.",
    })
    
    setContactForm({ name: '', email: '', company: '', message: '' })
    setIsSubmitting(false)
  }

  // AI Chat handler
  const handleAIChatToggle = () => {
    setShowAIChat(!showAIChat)
    if (!showAIChat) {
      toast({
        title: "🤖 AI Assistant",
        description: "Hi! I'm your AI accounting assistant. How can I help you today?",
      })
    }
  }

  const pricing = {
    plans: [
      {
        id: "ai_core",
        name: "AI Core",
        usdMonthly: 99,
        usdYearly: 1008, // $84/month when paid annually
        revenue: "Up to $25K",
        badge: "Best for startups",
        popular: false,
        features: [
          "✅ 99.5% AI accuracy automation",
          "✅ Intelligent document processing",
          "✅ E-invoicing & digital signatures",
          "✅ Automated transaction categorization",
          "✅ Basic financial forecasting",
          "✅ Real-time expense tracking",
          "✅ Mobile app access",
          "✅ Email support",
          "🔒 Web3 features (upgrade to unlock)",
          "🔒 Advanced compliance automation"
        ]
      },
      {
        id: "ai_basic_web3",
        name: "AI + Basic Web3",
        usdMonthly: 249,
        usdYearly: 2532, // $211/month when paid annually
        revenue: "$25K - $100K",
        badge: "Most popular",
        popular: true,
        features: [
          "✅ Everything in AI Core",
          "✅ Advanced AI financial insights",
          "✅ Basic cryptocurrency accounting",
          "✅ Simple Web3 wallet connections",
          "✅ Team collaboration (up to 15 users)",
          "✅ Custom reporting & analytics",
          "✅ Priority support",
          "✅ API access",
          "✅ Multi-currency support",
          "🔒 Smart contracts (upgrade to unlock)"
        ]
      },
      {
        id: "ai_full_web3",
        name: "AI + Full Web3",
        usdMonthly: 449,
        usdYearly: 4572, // $381/month when paid annually
        revenue: "$100K - $500K",
        badge: "Future-ready",
        popular: false,
        features: [
          "✅ Everything in AI + Basic Web3",
          "✅ Smart contract automation",
          "✅ Advanced crypto portfolio management",
          "✅ Blockchain transparency features",
          "✅ Multi-chain support (ETH, BTC, SOL)",
          "✅ Advanced compliance automation",
          "✅ Dedicated support manager",
          "✅ Custom integrations",
          "✅ Advanced security protocols",
          "✅ Multi-location support"
        ]
      },
      {
        id: "enterprise",
        name: "Complete Platform",
        usdMonthly: 899,
        usdYearly: 9168, // $764/month when paid annually
        revenue: "$500K+",
        badge: "Enterprise-grade",
        popular: false,
        features: [
          "✅ Everything in AI + Full Web3",
          "✅ Custom AI models & training",
          "✅ White-label Web3 solutions",
          "✅ Custom smart contract development",
          "✅ Advanced blockchain analytics",
          "✅ 24/7 dedicated support team",
          "✅ SLA guarantees (99.9% uptime)",
          "✅ On-premise deployment options",
          "✅ Unlimited users & transactions",
          "✅ Custom compliance frameworks"
        ]
      }
    ]
  }

  const faqData = {
    categories: [
      {
        title: "General Questions",
        questions: [
          {
            question: "What is OASYS and how is it different from traditional accounting software?",
            answer: "OASYS is a next-generation financial management platform that combines AI-powered automation with Web3 blockchain technology. Unlike traditional accounting software that requires manual data entry and basic reporting, OASYS automatically processes documents, predicts financial trends, manages cryptocurrency assets, and provides real-time compliance across multiple countries."
          },
          {
            question: "Is OASYS suitable for small businesses or just large enterprises?",
            answer: "OASYS is designed to scale with businesses of all sizes. Our Starter plan supports businesses with up to $25K revenue, while our Enterprise plan handles $500K+ revenue companies. The AI learns and adapts to your business size and complexity."
          },
          {
            question: "How secure is my financial data with OASYS?",
            answer: "Security is our top priority. We use military-grade encryption, blockchain immutability, and multi-layer security protocols. Your data is protected by cryptographic hashing, distributed across secure nodes, and monitored by AI fraud detection systems."
          }
        ]
      },
      {
        title: "AI & Automation",
        questions: [
          {
            question: "How does AI actually help with my daily accounting tasks?",
            answer: "OASYS AI transforms every aspect of accounting: instantly extracts data from documents with 99.5% accuracy, learns your business patterns for automatic categorization, forecasts cash flow, automates reconciliation, and provides 24/7 fraud detection."
          },
          {
            question: "Can AI really replace my accountant or bookkeeper?",
            answer: "AI doesn't replace your accounting team—it supercharges them. OASYS handles 85% of routine tasks like data entry and reconciliation, freeing your team to focus on strategic activities like financial planning and business advisory services."
          }
        ]
      },
      {
        title: "Web3 & Cryptocurrency",
        questions: [
          {
            question: "Why should my traditional business care about Web3?",
            answer: "Web3 offers transparent, secure, and efficient business processes. Benefits include supply chain transparency, automated smart contracts, enhanced security, global payments, permanent audit trails, and cost reduction by eliminating intermediaries."
          },
          {
            question: "How does OASYS handle cryptocurrency accounting?",
            answer: "OASYS provides comprehensive crypto accounting with real-time valuation across 1000+ tokens, multi-chain support, DeFi integration, tax optimization, regulatory compliance, and automated conversion to traditional accounting entries."
          }
        ]
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-emerald-600/10" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm">
              🚀 Now in Beta - Join 15,420+ businesses on the waitlist
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The Future of Business Finance 
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                {" "}is Here
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              AI-powered accounting, Web3 integration, and global compliance in one unified platform. 
              Join the revolution that's transforming how businesses manage their finances.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </Button>
              </form>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              <Button variant="outline" size="lg" className="group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
              <Link href="/demo">
                <Button variant="ghost" size="lg">
                  Try Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">15,420+</div>
                <div className="text-gray-600">Businesses waiting</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">45+</div>
                <div className="text-gray-600">Countries supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">99.5%</div>
                <div className="text-gray-600">AI accuracy rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Features for Modern Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered insights to Web3 integration and country-specific compliance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI-Powered Accounting */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-blue-900">AI-Powered Accounting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-blue-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Smart Document Processing: 99.5% accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Predictive Analytics & Cash Flow Forecasting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Automated Reconciliation & Fraud Detection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Web3 Integration */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-emerald-900">Web3 & Blockchain Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-emerald-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Cryptocurrency Accounting & DeFi Tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Smart Contract Automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Cross-Chain Analytics & NFT Management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Global Compliance */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-orange-900">E-Invoicing & Global Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-orange-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Malaysia LHDNM Integration & MyInvois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Multi-Country GST, VAT & Tax Support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time Validation & Digital Signatures</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Financial Platform Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Professional-grade AI + Web3 technology that scales with your business
            </p>
            
            {/* Geolocation Badge */}
            <div className="flex justify-center mb-6">
              {isLoadingGeo ? (
                <Badge variant="outline" className="px-4 py-2">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detecting location...
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
                  {geoData.flag} Pricing for {geoData.country} in {geoData.currency}
                  {getRegionalDiscount() < 1 && (
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded text-xs">
                      {Math.round((1 - getRegionalDiscount()) * 100)}% OFF
                    </span>
                  )}
                </Badge>
              )}
            </div>
            
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={isYearly ? "text-gray-500" : "text-gray-900 font-semibold"}>Monthly</span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={isYearly ? "text-gray-900 font-semibold" : "text-gray-500"}>
                Yearly (Save 15%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricing.plans.map((plan) => {
              const regionalDiscount = getRegionalDiscount()
              const monthlyPrice = plan.usdMonthly * regionalDiscount
              const yearlyPrice = plan.usdYearly * regionalDiscount
              const monthlyLocal = formatPrice(monthlyPrice)
              const yearlyLocal = formatPrice(yearlyPrice)
              const monthlyFromYearly = formatPrice(yearlyPrice / 12)

              return (
                <Card key={plan.id} className={`relative hover:shadow-xl transition-all ${
                  plan.popular 
                    ? "ring-2 ring-blue-600 shadow-lg scale-105" 
                    : "border-gray-200"
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      {isYearly ? (
                        <>
                          <div className="text-3xl font-bold text-gray-900">
                            {geoData.symbol}{monthlyFromYearly}/month
                          </div>
                          <div className="text-lg text-gray-600">
                            {geoData.symbol}{yearlyLocal}/year
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Save {geoData.symbol}{formatPrice((monthlyPrice * 12) - yearlyPrice)} annually
                          </div>
                        </>
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">
                          {geoData.symbol}{monthlyLocal}/month
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{plan.revenue}</p>
                    {!plan.popular && plan.badge && (
                      <Badge variant="outline" className="mt-2">
                        {plan.badge}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          {feature.startsWith("✅") ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={feature.startsWith("🔒") ? "text-gray-500" : "text-gray-700"}>
                            {feature.replace(/^(✅|🔒)\s*/, "")}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                    >
                      Join Waitlist
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Regional Pricing Note */}
          {getRegionalDiscount() < 1 && (
            <div className="text-center mt-8">
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 Regional Pricing Available!</h3>
                  <p className="text-green-700">
                    We offer special pricing for {geoData.country} to make OASYS more accessible. 
                    All features remain the same with full support and updates.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about OASYS and how AI & Web3 revolutionizes financial management
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-white rounded-2xl">
                <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  General Questions
                </TabsTrigger>
                <TabsTrigger value="ai" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  AI & Automation
                </TabsTrigger>
                <TabsTrigger value="web3" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  Web3 & Crypto
                </TabsTrigger>
              </TabsList>

              {faqData.categories.map((category, categoryIdx) => (
                <TabsContent key={categoryIdx} value={categoryIdx === 0 ? "general" : categoryIdx === 1 ? "ai" : "web3"}>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, idx) => (
                      <AccordionItem key={idx} value={`${categoryIdx}-${idx}`} className="bg-white rounded-lg border">
                        <AccordionTrigger className="px-6 hover:no-underline">
                          <span className="text-left font-semibold">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Ready to transform your business with AI and Web3? Let's talk.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  We'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">hello@oasys.com</p>
                      <p className="text-gray-600">support@oasys.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Office</h3>
                      <p className="text-gray-600">Kuala Lumpur, Malaysia</p>
                      <p className="text-gray-600">Singapore</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Support Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 9 AM - 6 PM MYT</p>
                      <p className="text-gray-600">Weekend: 10 AM - 4 PM MYT</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center pt-6">
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="group">
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Try Demo Instead
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                OASYS
              </h3>
              <p className="text-gray-300">
                The future of AI-powered business finance and Web3 integration.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                  LinkedIn
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/accounting" className="hover:text-white transition-colors">AI Accounting</Link></li>
                <li><Link href="/web3" className="hover:text-white transition-colors">Web3 Features</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OASYS. All rights reserved. The future of AI-powered business finance.</p>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleAIChatToggle}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
        
        {/* AI Chat Badge */}
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          AI
        </div>
        
        {/* Chat Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Chat with AI Assistant
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* AI Chat Panel */}
      {showAIChat && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs opacity-90">Online • Ready to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIChat(false)}
                className="text-white hover:bg-white/20 p-1 h-auto w-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-4 h-64 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {/* AI Welcome Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm">
                  <p className="text-sm text-gray-800">
                    Hi! I'm your AI accounting assistant. I can help you with:
                  </p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• Pricing and plan questions</li>
                    <li>• Feature explanations</li>
                    <li>• Implementation guidance</li>
                    <li>• Technical support</li>
                  </ul>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3 bg-white hover:bg-blue-50 border-blue-200"
                  onClick={() => {
                    toast({
                      title: "🤖 AI Assistant",
                      description: "Our pricing starts at $99/month with regional discounts available!",
                    })
                  }}
                >
                  <span className="text-sm">💰 Ask about pricing</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3 bg-white hover:bg-blue-50 border-blue-200"
                  onClick={() => {
                    toast({
                      title: "🤖 AI Assistant",
                      description: "Our AI processes documents with 99.5% accuracy and automates categorization!",
                    })
                  }}
                >
                  <span className="text-sm">🧠 Learn about AI features</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3 bg-white hover:bg-blue-50 border-blue-200"
                  onClick={() => {
                    toast({
                      title: "🤖 AI Assistant",
                      description: "We support Web3 wallets, DeFi tracking, and blockchain verification!",
                    })
                  }}
                >
                  <span className="text-sm">🚀 Explore Web3 capabilities</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="Type your question..."
                className="flex-1 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    toast({
                      title: "🤖 AI Assistant",
                      description: "Thanks for your question! Our team will respond soon.",
                    })
                    e.currentTarget.value = ''
                  }
                }}
              />
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by OASYS AI • <Link href="/contact" className="text-blue-600 hover:underline">Contact human support</Link>
            </p>
          </div>
        </div>
      )}

      {/* Cookie Policy Popup */}
      {showCookiePolicy && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-xl">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">🍪 We use cookies</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use cookies to enhance your experience, analyze site traffic, and provide personalized content. 
                  By continuing to use our site, you consent to our use of cookies. 
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline ml-1">
                    Learn more in our Privacy Policy
                  </Link>
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeclineCookies}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Decline
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAcceptCookies}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
