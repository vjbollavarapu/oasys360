"use client"

import HeroSection from "@/components/marketing/hero-section"
import { FeaturesSection } from "@/components/marketing/features-section"
import { AboutSection } from "@/components/marketing/about-section"
import { FoundersSection } from "@/components/marketing/founders-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { DemoSection } from "@/components/marketing/demo-section"
import { ContactSection } from "@/components/marketing/contact-section"
import { SignupSection } from "@/components/marketing/signup-section"
import { Footer } from "@/components/marketing/footer"

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OASYS",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "AI-powered business finance platform with blockchain security and real-time insights",
    "url": "https://oasys.com",
    "author": {
      "@type": "Organization",
      "name": "OASYS",
      "url": "https://oasys.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "description": "Beta program with early adopter pricing"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "15000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "AI-powered document processing",
      "Automated transaction categorization", 
      "Blockchain security integration",
      "Digital identity verification",
      "Smart contract automation",
      "Real-time financial insights",
      "Predictive analytics",
      "Compliance automation"
    ],
    "screenshot": "https://oasys.com/screenshot.jpg",
    "softwareVersion": "Beta 1.0",
    "releaseNotes": "Initial beta release with AI and blockchain features"
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="min-h-screen">
        {/* Hero Section with Navigation */}
        <HeroSection />
        
        {/* Features Section - AI Capabilities */}
        <FeaturesSection />
        
        {/* About Section - AI Features */}
        <AboutSection />
        
        {/* Founders Section - Meet the Team */}
        <FoundersSection />
        
        {/* Pricing Section - AI-Focused Plans */}
        <PricingSection />
        
        {/* Demo Section - AI Showcase */}
        <DemoSection />
        
        {/* Contact Section - Get in Touch */}
        <ContactSection />
        
        {/* Signup Section - Professional CTA */}
        <SignupSection />
        
        {/* Footer - Corporate Branding */}
        <Footer />
      </div>
    </>
  )
}