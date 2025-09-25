"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OasysLogo } from "./oasys-logo"

const navigationLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Smooth scroll to section
  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
    setIsOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => scrollToSection("#hero")}
          >
            <OasysLogo size={32} animated={false} />
            <span className="text-xl font-bold text-gray-900">
              OASYS
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <button
                key={link.name}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => scrollToSection(link.href)}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => scrollToSection("#contact")}
            >
              Contact Sales
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => scrollToSection("#pricing")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-4 mb-6">
                {navigationLinks.map((link) => (
                  <button
                    key={link.name}
                    className="block w-full text-left py-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => scrollToSection(link.href)}
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              {/* Mobile CTA Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full font-medium py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => scrollToSection("#contact")}
                >
                  Contact Sales
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-lg"
                  onClick={() => scrollToSection("#pricing")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}