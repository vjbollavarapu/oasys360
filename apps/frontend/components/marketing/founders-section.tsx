"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Award,
  Briefcase,
  GraduationCap
} from "lucide-react"

export function FoundersSection() {
  const founders = [
    {
      name: "Viswa",
      title: "Co-Founder, CEO & CAO",
      initials: "V",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=viswa&backgroundColor=264653&clothing=blazer_shirt&clothingColor=262e33",
      description: "Visionary leader with expertise in business strategy and financial operations. Driving OASYS towards revolutionizing the accounting industry.",
      expertise: ["Business Strategy", "Financial Operations", "Leadership"],
      icon: Award
    },
    {
      name: "VJ Bollavarapu", 
      title: "Co-Founder, CTO",
      initials: "VJ",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vjbollavarapu&backgroundColor=1a1a2e&clothing=hoodie&clothingColor=262e33",
      description: "Technology innovator specializing in AI, blockchain, and scalable software architecture. Architecting the future of financial technology.",
      expertise: ["AI/ML", "Blockchain", "Software Architecture", "Web3"],
      icon: Briefcase
    }
  ]

  return (
    <section id="founders" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50" role="main" aria-labelledby="founders-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Meet Our Founders
            </Badge>
            <h2 id="founders-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Visionaries Behind
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OASYS Innovation
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our founding team combines decades of experience in business strategy, 
              technology innovation, and financial operations to build the future of accounting.
            </p>
          </div>

          {/* Founders Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {founders.map((founder, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-6">
                      <Avatar className="w-24 h-24 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                        <AvatarImage 
                          src={founder.avatar} 
                          alt={`${founder.name} avatar`}
                          onError={(e) => {
                            console.log(`Avatar failed to load for ${founder.name}:`, founder.avatar);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                          {founder.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <founder.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Name and Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {founder.name}
                    </h3>
                    <p className="text-lg text-blue-600 font-semibold mb-4">
                      {founder.title}
                    </p>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
                      {founder.description}
                    </p>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {founder.expertise.map((skill, skillIndex) => (
                        <Badge 
                          key={skillIndex} 
                          variant="secondary" 
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission Statement */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Together, we're building OASYS to democratize access to advanced financial technology. 
                We believe that AI and blockchain should be accessible to businesses of all sizes, 
                not just large enterprises. Our vision is to create a platform that combines the 
                power of artificial intelligence with the security of blockchain technology to 
                revolutionize how businesses manage their finances.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
                  <div className="text-gray-600">Years Combined Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">AI-First</div>
                  <div className="text-gray-600">Technology Approach</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">Global</div>
                  <div className="text-gray-600">Vision & Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
