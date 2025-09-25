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
  MessageCircle, 
  Users, 
  Mail, 
  Phone,
  Calendar,
  Star,
  Heart,
  Lightbulb,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function FounderFeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    feedbackType: "",
    subject: "",
    message: "",
    priority: "",
    contactPreference: ""
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Founder Feedback:", formData)
    setIsSubmitted(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const feedbackTypes = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Feature Request",
      description: "Suggest new features or improvements"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Product Feedback",
      description: "Share your experience using OASYS"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "General Feedback",
      description: "Share thoughts about our vision and direction"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Partnership Inquiry",
      description: "Discuss potential business partnerships"
    }
  ]

  const founders = [
    {
      name: "Viswa",
      title: "Co-Founder, CEO & CAO",
      expertise: "Business Strategy, Financial Operations, Leadership",
      email: "viswa@oasys.com",
      focus: "Strategic vision, business development, and financial operations"
    },
    {
      name: "VJ Bollavarapu",
      title: "Co-Founder, CTO",
      expertise: "AI/ML, Blockchain, Software Architecture, Web3",
      email: "vj@oasys.com",
      focus: "Technology innovation, AI development, and blockchain integration"
    }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Feedback Submitted!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your valuable feedback. Our founders will review your message and get back to you within 24-48 hours.
            </p>
            <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span>Your feedback is reviewed by our founders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span>Personal response within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Follow-up call if needed</span>
                </div>
              </div>
            </div>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-4 py-2">
            <MessageCircle className="w-4 h-4 mr-2" />
            Founder Feedback
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Share Your Feedback with Our Founders
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your voice matters. Share your thoughts, suggestions, and feedback directly with Viswa and VJ, 
            the founders of OASYS. Help us build the future of business finance.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Founders Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Meet Our Founders
              </h2>
              <div className="space-y-6">
                {founders.map((founder, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {founder.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {founder.name}
                          </h3>
                          <p className="text-green-600 font-semibold mb-2">
                            {founder.title}
                          </p>
                          <p className="text-gray-600 text-sm mb-3">
                            {founder.expertise}
                          </p>
                          <p className="text-gray-700 text-sm">
                            <strong>Focus:</strong> {founder.focus}
                          </p>
                          <div className="mt-3">
                            <a 
                              href={`mailto:${founder.email}`}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              <Mail className="w-4 h-4 inline mr-1" />
                              {founder.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Feedback Types */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Types of Feedback We Value
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {feedbackTypes.map((type, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                        {type.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{type.title}</h4>
                        <p className="text-gray-600 text-sm">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Send Your Feedback
                </CardTitle>
                <p className="text-gray-600">
                  Share your thoughts, suggestions, or questions with our founders.
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
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Your Role</Label>
                      <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="e.g., CEO, CFO, Accountant"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedbackType">Type of Feedback *</Label>
                    <select
                      id="feedbackType"
                      name="feedbackType"
                      value={formData.feedbackType}
                      onChange={handleInputChange}
                      required
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select feedback type</option>
                      <option value="feature-request">Feature Request</option>
                      <option value="product-feedback">Product Feedback</option>
                      <option value="general-feedback">General Feedback</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="bug-report">Bug Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Brief summary of your feedback"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="mt-1"
                      placeholder="Please share your detailed feedback, suggestions, or questions..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority Level</Label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select priority</option>
                        <option value="low">Low - General feedback</option>
                        <option value="medium">Medium - Important suggestion</option>
                        <option value="high">High - Critical issue</option>
                        <option value="urgent">Urgent - Needs immediate attention</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="contactPreference">Preferred Contact Method</Label>
                      <select
                        id="contactPreference"
                        name="contactPreference"
                        value={formData.contactPreference}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select preference</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone Call</option>
                        <option value="video">Video Call</option>
                        <option value="no-preference">No Preference</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  >
                    Send Feedback to Founders
                    <MessageCircle className="w-5 h-5 ml-2" />
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
