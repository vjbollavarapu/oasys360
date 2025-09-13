"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Zap } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#1B1D23] text-[#F3F4F6]">
      {/* Header */}
      <header className="border-b border-[#4B0082]/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-[#00FFC6] hover:text-[#00FFC6]/80">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">OASYS</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge className="bg-[#4B0082]/20 text-[#00FFC6] border-[#00FFC6]/30 mb-4">📞 Get in Touch</Badge>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Get in Touch</h1>
            <p className="text-muted-foreground">
              Ready to revolutionize your accounting and inventory management? Let's discuss how OASYS can transform your
              business.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input className="bg-[#1B1D23]/50 border-[#4B0082]/30" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input className="bg-[#1B1D23]/50 border-[#4B0082]/30" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input className="bg-[#1B1D23]/50 border-[#4B0082]/30" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input className="bg-[#1B1D23]/50 border-[#4B0082]/30" placeholder="Your Company" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  className="bg-[#1B1D23]/50 border-[#4B0082]/30 min-h-[120px]"
                  placeholder="Tell us about your accounting and inventory management needs..."
                />
              </div>
              <Button className="w-full bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#00FFC6]/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#00FFC6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-[#F3F4F6]/70">+1 (555) 123-4567</p>
                  </div>
                </div>
                <p className="text-sm text-[#F3F4F6]/60">Available Monday to Friday, 9 AM to 6 PM EST</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#00FFC6]" />
                  <p className="text-[#F3F4F6]/70">hello@oasys.com</p>
                </div>
                <p className="text-sm text-[#F3F4F6]/60">We typically respond within 2-4 hours</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#FFC700]/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#FFC700]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-[#F3F4F6]/70">
                      123 Innovation Drive
                      <br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-[#4B0082]/20 to-[#00FFC6]/10 border-[#00FFC6]/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Clock className="w-8 h-8 text-[#00FFC6]" />
                  <div>
                    <h3 className="font-semibold text-lg">Schedule a Demo</h3>
                    <p className="text-[#F3F4F6]/70">Book a personalized 30-minute demo with our team</p>
                  </div>
                </div>
                <Button className="w-full bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">Schedule Demo Call</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
