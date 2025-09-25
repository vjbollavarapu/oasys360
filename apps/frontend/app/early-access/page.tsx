"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap, 
  Shield,
  Brain,
  TrendingUp,
  Gift,
  Star,
  Calendar
} from "lucide-react"
import Link from "next/link"

export default function EarlyAccessPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    companySize: "",
    industry: "",
    currentChallenges: "",
    timeline: "",
    expectations: ""
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/v1/marketing/early-access/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const errorData = await response.json()
        console.error('Error submitting request:', errorData)
        alert('Error submitting request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Error submitting request. Please try again.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Priority Access",
      description: "Get early access to OASYS before the general public"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Exclusive Pricing",
      description: "Special early adopter pricing with significant discounts"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Founder Direct Access",
      description: "Direct line to our founders for feedback and feature requests"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Custom Onboarding",
      description: "Personalized onboarding and setup assistance"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Priority Support",
      description: "Dedicated support team and faster response times"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Influence Development",
      description: "Your input shapes the product roadmap and features"
    }
  ]

  const timeline = [
    {
      phase: "Phase 1",
      title: "Application Review",
      duration: "24-48 hours",
      description: "We review your application and business needs"
    },
    {
      phase: "Phase 2", 
      title: "Founder Interview",
      duration: "1 week",
      description: "Schedule a call with Viswa or VJ to discuss your needs"
    },
    {
      phase: "Phase 3",
      title: "Access Granted",
      duration: "Immediate",
      description: "Get your early access credentials and start using OASYS"
    },
    {
      phase: "Phase 4",
      title: "Onboarding",
      duration: "1-2 weeks",
      description: "Personalized setup and training with our team"
    }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Early Access Request Submitted!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your interest in OASYS Early Access. We'll review your application and get back to you within 24-48 hours.
            </p>
            <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>Application review within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Founder interview to discuss your needs</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span>Early access credentials and onboarding</span>
                </div>
              </div>
            </div>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Early Access Program
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get Early Access to OASYS
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Be among the first to experience the future of AI-powered business finance. 
            Get exclusive early access with special pricing and founder support.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Benefits */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Early Access Benefits
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Early Access Timeline
                </h3>
                <div className="space-y-4">
                  {timeline.map((phase, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{phase.phase}</span>
                          <Badge variant="outline" className="text-xs">
                            {phase.duration}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{phase.title}</h4>
                        <p className="text-gray-600 text-sm">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Form */}
            <Card className="shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Request Early Access
                </CardTitle>
                <p className="text-gray-600">
                  Tell us about your business and why you need early access to OASYS.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Your Role *</Label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select your role</option>
                        <option value="ceo">CEO/Founder</option>
                        <option value="cfo">CFO</option>
                        <option value="accountant">Accountant</option>
                        <option value="bookkeeper">Bookkeeper</option>
                        <option value="finance-manager">Finance Manager</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companySize">Company Size *</Label>
                      <select
                        id="companySize"
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                        required
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-1000">201-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select industry</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentChallenges">Current Financial Challenges *</Label>
                    <Textarea
                      id="currentChallenges"
                      name="currentChallenges"
                      value={formData.currentChallenges}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="mt-1"
                      placeholder="What financial challenges are you currently facing that OASYS could help solve?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeline">When do you need access? *</Label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      required
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select timeline</option>
                      <option value="immediately">Immediately</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="3-months">Within 3 months</option>
                      <option value="6-months">Within 6 months</option>
                      <option value="exploring">Just exploring</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="expectations">What do you expect from early access?</Label>
                    <Textarea
                      id="expectations"
                      name="expectations"
                      value={formData.expectations}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1"
                      placeholder="Any specific features you'd like to test or feedback you'd like to provide..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                  >
                    Request Early Access
                    <Star className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
