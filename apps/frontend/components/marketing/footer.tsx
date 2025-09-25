"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OasysLogo } from "./oasys-logo"
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Bot,
  Shield,
  Zap,
  Brain
} from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      setEmail("")
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000)
    } catch (error) {
      console.error('Newsletter signup failed:', error)
    }
  }
  const footerLinks = {
    product: [
      { name: "AI Features", href: "#features" },
      { name: "Web3 Integration", href: "#web3" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "#demo" },
      { name: "API Documentation", href: "/api-docs" },
      { name: "Security", href: "/security" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Partners", href: "/partners" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Blog", href: "/blog" }
    ],
    resources: [
      { name: "Help Center", href: "/help" },
      { name: "Documentation", href: "/documentation" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Community", href: "/community" },
      { name: "Status", href: "/status" },
      { name: "Contact Support", href: "/support" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Compliance", href: "/compliance" },
      { name: "Security Policy", href: "/security-policy" }
    ]
  }

  const aiFeatures = [
    { icon: Brain, title: "AI-Powered", description: "99.5% accuracy" },
    { icon: Shield, title: "Secure", description: "Enterprise-grade" },
    { icon: Zap, title: "Fast", description: "Real-time processing" },
    { icon: Bot, title: "Automated", description: "Smart workflows" }
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="w-full px-6 py-12">
        <div className="max-w-none mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <OasysLogo size={32} animated={false} />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  OASYS
                </span>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6 text-base max-w-md">
                We're building the future of AI-powered business finance. Join our beta program to 
                help shape intelligent automation, blockchain security, and real-time insights for modern businesses.
              </p>

              {/* AI Features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {aiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors border border-white/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{feature.title}</div>
                      <div className="text-xs text-blue-200">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/20 w-10 h-10 rounded-lg border border-white/20">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/20 w-10 h-10 rounded-lg border border-white/20">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/20 w-10 h-10 rounded-lg border border-white/20">
                  <Github className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Product Links */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-white">Product</h3>
                  <ul className="space-y-2">
                    {footerLinks.product.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link.href} 
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm block py-1"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company Links */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
                  <ul className="space-y-2">
                    {footerLinks.company.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link.href} 
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm block py-1"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources Links */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
                  <ul className="space-y-2">
                    {footerLinks.resources.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link.href} 
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm block py-1"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal Links */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
                  <ul className="space-y-2">
                    {footerLinks.legal.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link.href} 
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm block py-1"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="border-t border-gray-700/50">
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Stay Updated with AI Innovation
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Get the latest updates on AI features, Web3 integrations, and industry insights 
                    delivered directly to your inbox.
                  </p>
                </div>
                <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required
                  />
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 font-semibold shadow-lg rounded-lg"
                    disabled={isSubscribed}
                  >
                    {isSubscribed ? "Subscribed!" : "Subscribe"}
                    {!isSubscribed && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information & Bottom Bar */}
      <div className="border-t border-gray-700/50">
        <div className="w-full px-6 py-8">
          <div className="max-w-none mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Headquarters</h4>
                  <p className="text-gray-300 text-sm">
                    Kuala Lumpur, Malaysia<br />
                    Singapore Office
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Contact</h4>
                  <p className="text-gray-300 text-sm">
                    hello@oasys.com<br />
                    support@oasys.com
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Support</h4>
                  <p className="text-gray-300 text-sm">
                    24/7 AI-Powered Support<br />
                    Enterprise: +1 (555) 123-4567
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Beta Program</h4>
                  <p className="text-gray-300 text-sm">
                    Early Access • Founder Feedback<br />
                    Building the Future with AI
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-700/30">
              <div className="text-gray-400 text-sm">
                © 2024 OASYS. All rights reserved. Beta launch - Building the future with AI and blockchain technology.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="hover:text-white transition-colors cursor-pointer">Beta Program</span>
                <span>•</span>
                <span className="hover:text-white transition-colors cursor-pointer">Early Access</span>
                <span>•</span>
                <span className="hover:text-white transition-colors cursor-pointer">Founder Feedback</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}