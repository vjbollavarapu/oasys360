import { render, screen } from '@testing-library/react'
import { FoundersSection } from '@/components/marketing/founders-section'

describe('FoundersSection', () => {
  it('renders founders section with correct content', () => {
    render(<FoundersSection />)
    
    // Check for section heading
    expect(screen.getByText('Meet Our Founders')).toBeInTheDocument()
    expect(screen.getByText('The Visionaries Behind')).toBeInTheDocument()
    expect(screen.getByText('OASYS Innovation')).toBeInTheDocument()
    
    // Check for founder names and titles
    expect(screen.getByText('Viswa')).toBeInTheDocument()
    expect(screen.getByText('Co-Founder, CEO & CAO')).toBeInTheDocument()
    expect(screen.getByText('VJ Bollavarapu')).toBeInTheDocument()
    expect(screen.getByText('Co-Founder, CTO')).toBeInTheDocument()
    
    // Check for mission section
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
  })

  it('renders founder avatars with fallbacks', () => {
    render(<FoundersSection />)
    
    // Check for fallback initials (since avatars are using fallback text)
    expect(screen.getByText('V')).toBeInTheDocument() // Viswa's initial
    expect(screen.getByText('VJ')).toBeInTheDocument() // VJ's initials
    
    // Check for avatar containers
    const avatarContainers = document.querySelectorAll('[class*="w-24 h-24"]')
    expect(avatarContainers).toHaveLength(2) // Two founder avatars
  })

  it('displays expertise tags for each founder', () => {
    render(<FoundersSection />)
    
    // Check for expertise tags
    expect(screen.getByText('Business Strategy')).toBeInTheDocument()
    expect(screen.getByText('Financial Operations')).toBeInTheDocument()
    expect(screen.getByText('AI/ML')).toBeInTheDocument()
    expect(screen.getByText('Blockchain')).toBeInTheDocument()
    expect(screen.getByText('Software Architecture')).toBeInTheDocument()
    expect(screen.getByText('Web3')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<FoundersSection />)
    
    const section = screen.getByRole('main')
    expect(section).toHaveAttribute('aria-labelledby', 'founders-heading')
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveAttribute('id', 'founders-heading')
  })
})
