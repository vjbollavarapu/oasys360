# OASYS UI/UX Landing Page

> **The Financial OS for the Hybrid Economy** - Marketing landing page showcasing OASYS platform features, integrations, and compliance capabilities.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/vjbollavarapu-8ded34df/v0-oasys-landing-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features & Modules](#features--modules)
- [Component Structure](#component-structure)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Sections](#key-sections)
- [Design System](#design-system)
- [Integration Points](#integration-points)

---

## 🎯 Overview

The OASYS UI/UX Landing Page is a modern, responsive Next.js marketing website designed to showcase the OASYS platform - a comprehensive financial operations system with ledger-backed verification, AI-powered document processing, and global compliance automation.

### Purpose

- **Marketing & Branding**: Primary marketing website for OASYS platform
- **Lead Generation**: Capture early access signups and beta program registrations
- **Feature Showcase**: Highlight key capabilities (AI, Web3, Compliance)
- **Trust Building**: Display compliance badges, security features, and integrations
- **Regional Focus**: Special emphasis on Malaysian market (LHDN e-Invois compliance)

### Target Audience

- Finance teams at hybrid companies (fiat + crypto operations)
- Global agencies with remote contractors
- Supply chain businesses needing fraud prevention
- Web3 gaming studios
- Malaysian businesses requiring LHDN e-Invois compliance

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Theme**: next-themes (dark/light mode support)

### Architecture Pattern

- **Component-Based**: Modular React components
- **Server Components**: Next.js App Router with server/client components
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Works without JavaScript for core content

---

## ✨ Features & Modules

### 1. **Hero Section** (`hero-section.tsx`)
- **Purpose**: Main value proposition and primary CTA
- **Features**:
  - Headline: "The Financial OS for the Hybrid Economy"
  - Dual CTA buttons (Get Early Access, See Demo)
  - **LHDN e-Invois Compliant badge** (🇲🇾 Malaysian flag + checkmark)
  - Interactive liquidity card mockup
- **Key Elements**:
  - Responsive grid layout
  - Gradient backgrounds
  - Smooth scroll navigation

### 2. **Problem Section** (`problem-section.tsx`)
- **Purpose**: Contrast old way vs. OASYS way
- **Features**:
  - Side-by-side comparison cards
  - Visual problem indicators (X marks)
  - Solution highlight (checkmark)
- **Messaging**: "Stop running your business with half the data"

### 3. **Workflow Section** (`workflow-section.tsx`)
- **Purpose**: Explain the 4-step process
- **Steps**:
  1. **Ingest**: Connect with Plaid (Fiat) and RPC nodes (Web3)
  2. **Normalize**: Convert crypto to USD at transaction time
  3. **Verify**: AI matches invoices to transactions
  4. **Sync**: Push to QuickBooks/Xero
- **Visual**: Step-by-step workflow with icons

### 4. **Feature Deep Dives** (`feature-deep-dives.tsx`)
- **Purpose**: Detailed feature explanations with mockups
- **Features Covered**:
  - **Unified Treasury Management**: Track fiat + crypto assets
  - **Vendor Identity Shield**: On-chain wallet verification
  - **Tax-Event Scout**: Proactive tax implication alerts
- **Visuals**: Interactive cards with real data mockups

### 5. **Industry Solutions Section** (`industry-solutions-section.tsx`)
- **Purpose**: Industry-specific use cases
- **Tabs**:
  - **Global Agencies**: Pay remote teams in USDC, save FX fees
  - **Supply Chain**: Verify suppliers before payments (fraud prevention)
  - **Web3 Gaming**: Manage token treasury + fiat runway
  - **Malaysia (SEA)**: LHDN e-Invois automated compliance
- **Visuals**: Industry-specific mockups and cards

### 6. **Integrations Section** (`integrations-section.tsx`)
- **Purpose**: Show supported platforms and chains
- **Fiat/ERP Integrations**:
  - QuickBooks, Xero, NetSuite
  - Stripe, Brex, Plaid, Mercury, Ramp
- **Web3/Blockchain**:
  - Ethereum, Polygon, Solana
  - Gnosis Safe, Coinbase Prime
  - Arbitrum, Optimism, Base
- **Layout**: Grid of integration cards

### 7. **Security Section** (`security-section.tsx`)
- **Purpose**: Build trust with security features
- **Features**:
  - **Non-Custodial**: Never hold keys or funds
  - **SOC2 Type II**: Enterprise-grade security
  - **Encryption**: AES-256 at rest and in transit
  - **Role-Based Access**: Granular permissions
- **Visual**: Security feature cards with icons

### 8. **Trust Section** (`trust-section.tsx`)
- **Purpose**: Additional trust indicators
- **Stats**:
  - Human-in-the-loop AI Verification
  - SOC2 Compliance Ready
  - 80% Reduction in Manual Categorization
- **Layout**: Three-column stat cards

### 9. **Pricing Section** (`pricing-section.tsx`)
- **Purpose**: Pricing tiers and plans
- **Plans**:
  - **Growth**: $249/month - Up to $100k monthly volume
  - **Scale**: $599/month - Up to $500k monthly volume
  - **Enterprise**: Custom pricing
- **Features**: Feature comparison tables
- **Value Prop**: "Predictable pricing. Zero transaction fees."

### 10. **CTA Section** (`cta-section.tsx`)
- **Purpose**: Final call-to-action and footer
- **Features**:
  - Email capture form (Join Waitlist)
  - Footer navigation links
  - Social links and legal pages
- **Sections**: Product, Company, Resources

### 11. **Navigation** (`navigation.tsx`)
- **Purpose**: Site navigation and branding
- **Features**:
  - OASYS logo
  - Navigation menu
  - Mobile responsive
  - Smooth scroll to sections

---

## 🧩 Component Structure

### Marketing Components

```
components/
├── navigation.tsx              # Main site navigation
├── hero-section.tsx            # Hero with CTA and LHDN badge
├── problem-section.tsx         # Old vs New comparison
├── workflow-section.tsx        # 4-step process
├── feature-deep-dives.tsx      # Detailed feature explanations
├── industry-solutions-section.tsx  # Industry tabs (Agencies, Supply Chain, Gaming, Malaysia)
├── integrations-section.tsx    # Fiat/ERP and Web3 integrations
├── security-section.tsx        # Security features
├── trust-section.tsx           # Trust indicators
├── pricing-section.tsx         # Pricing tiers
├── cta-section.tsx             # Final CTA + Footer
├── liquidity-card.tsx          # Interactive treasury card
└── ui/                         # Reusable UI components
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    └── input.tsx
```

### App Structure

```
app/
├── layout.tsx                  # Root layout with theme provider
├── page.tsx                    # Main landing page (assembles all sections)
└── globals.css                 # Global styles
```

---

## 🛠️ Technologies

### Core Dependencies

```json
{
  "next": "16.0.7",
  "react": "19.2.0",
  "typescript": "^5",
  "tailwindcss": "^4.1.9"
}
```

### UI Libraries

- **Radix UI**: Accessible component primitives
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog
  - Dropdown Menu, Label, Popover, Select, Tabs
  - Toast, Tooltip, and more
  
- **Lucide React**: Icon library (400+ icons)
- **next-themes**: Dark/light theme support

### Form Handling

- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation resolvers
- **zod**: Schema validation

### Utilities

- **clsx**: Conditional className utilities
- **tailwind-merge**: Merge Tailwind classes
- **class-variance-authority**: Component variants
- **date-fns**: Date formatting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, pnpm, or yarn
- Git

### Installation

```bash
# Navigate to uiux directory
cd apps/uiux

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
# Create production build
npm run build
# or
pnpm build
# or
yarn build
```

### Start Production Server

```bash
# Run production server
npm start
# or
pnpm start
# or
yarn start
```

### Linting

```bash
# Run ESLint
npm run lint
# or
pnpm lint
# or
yarn lint
```

---

## 📁 Project Structure

```
apps/uiux/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/                 # React components
│   ├── navigation.tsx
│   ├── hero-section.tsx
│   ├── problem-section.tsx
│   ├── workflow-section.tsx
│   ├── feature-deep-dives.tsx
│   ├── industry-solutions-section.tsx
│   ├── integrations-section.tsx
│   ├── security-section.tsx
│   ├── trust-section.tsx
│   ├── pricing-section.tsx
│   ├── cta-section.tsx
│   ├── liquidity-card.tsx
│   └── ui/                    # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/                        # Utilities
│   └── utils.ts               # cn() helper and utilities
├── public/                     # Static assets
│   ├── icon.svg
│   ├── apple-icon.png
│   └── placeholder-*.png
├── styles/                     # Additional styles
│   └── globals.css
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.js
├── components.json            # shadcn/ui config
└── README.md                  # This file
```

---

## 🎨 Key Sections Breakdown

### 1. Hero Section
- **Headline**: "The Financial OS for the Hybrid Economy"
- **Subheadline**: Unified fiat and crypto management
- **CTAs**: 
  - Primary: "Get Early Access"
  - Secondary: "See Early Demo"
- **Trust Badge**: 🇲🇾 LHDN e-Invois Compliant
- **Visual**: Interactive liquidity card showing treasury assets

### 2. Problem/Solution
- **Problem**: Fragmented financial data (Bank Portal, Crypto Wallet, Excel)
- **Solution**: One unified source of truth
- **Visual**: Side-by-side comparison cards

### 3. Workflow (4 Steps)
1. **Ingest** - Connect Plaid + RPC nodes
2. **Normalize** - Convert crypto to USD
3. **Verify** - AI invoice matching
4. **Sync** - Push to QuickBooks/Xero

### 4. Feature Deep Dives
- **Unified Treasury**: Track fiat + crypto in one view
- **Vendor Identity Shield**: On-chain wallet verification
- **Tax-Event Scout**: Proactive tax alerts
- **Visuals**: Real data mockups with charts

### 5. Industry Solutions (Tabs)
- **Global Agencies**: Pay remote teams in USDC
- **Supply Chain**: Supplier verification (fraud prevention)
- **Web3 Gaming**: Token treasury management
- **Malaysia (SEA)**: LHDN e-Invois automation

### 6. Integrations
- **Fiat/ERP**: QuickBooks, Xero, NetSuite, Stripe, Plaid
- **Web3**: Ethereum, Polygon, Solana, Arbitrum, Base

### 7. Security & Trust
- SOC2 Type II compliant
- Non-custodial (never hold keys)
- AES-256 encryption
- Role-based access control

### 8. Pricing
- **Growth**: $249/month
- **Scale**: $599/month
- **Enterprise**: Custom

---

## 🎯 Design System

### Color Palette

- **Primary**: Blue (#2563EB) - Trust, technology
- **Secondary**: Purple (#9333EA) - Innovation, Web3
- **Success**: Green (#10B981) - Compliance, validation
- **Warning**: Amber (#F59E0B) - Alerts
- **Error**: Red (#EF4444) - Errors, fraud alerts
- **Neutral**: Gray scale for text and backgrounds

### Typography

- **Headings**: Bold, large (text-4xl to text-6xl)
- **Body**: Regular, readable (text-base to text-xl)
- **Font**: System font stack (San Francisco, Segoe UI, etc.)

### Spacing

- Consistent spacing scale (4px base unit)
- Section padding: `py-24 lg:py-32`
- Container max-width: `max-w-7xl`

### Components

- **Cards**: Rounded corners, subtle shadows, borders
- **Buttons**: Primary (solid), Secondary (outline)
- **Badges**: Small, colored labels
- **Icons**: Lucide React, consistent sizing

---

## 🔗 Integration Points

### Backend Integration

- **API Endpoints**: Future integration with OASYS backend
- **Form Submissions**: Email capture for waitlist
- **Analytics**: Vercel Analytics integration ready

### External Services

- **Vercel**: Deployment and hosting
- **v0.app**: Component generation (synced automatically)
- **Email Service**: For waitlist signups (to be configured)

---

## 📊 Key Features Highlighted

### Core Platform Features

1. **AI-Powered Intelligence**
   - Document processing (99.5% accuracy)
   - Predictive analytics
   - Automated categorization
   - Fraud detection

2. **Web3 & Blockchain**
   - Multi-chain support
   - Digital asset verification and ledger-backed evidence
   - Smart contract integration
   - Digital Identity (DID)

3. **Compliance & Regulatory**
   - **LHDN e-Invois** (Malaysia) - Fully automated
   - Global tax standards
   - Regulatory autopilot
   - Audit trails

4. **Unified Treasury**
   - Fiat + Crypto in one view
   - Real-time FX conversion
   - Multi-currency support
   - Liquidity planning

### Regional Compliance (Malaysia)

- **LHDN e-Invois Integration**
  - Direct MyInvois Portal API connection
  - Automatic UBL 2.1 XML/JSON formatting
  - Real-time validation and status tracking
  - On-chain storage of validation IDs
  - Submission history and audit trails

---

## 🎨 Component Details

### Industry Solutions - Malaysia Tab

**Location**: `components/industry-solutions-section.tsx` → `MalaysiaContent()`

**Content**:
- **Headline**: "Malaysia: LHDN e-Invois Automated"
- **Features**:
  - Direct API integration with LHDN MyInvois Portal
  - Automatic XML formatting and submission
  - On-chain storage of validation IDs
  - Real-time status tracking

**Visual Mockup**:
- Invoice card with LHDN validation stamp
- Green checkmark badge: "LHDN Validated"
- Validation ID: "12938A7B4C...Verified"
- Processing pipeline visualization
- On-chain audit trail display

---

## 🧪 Development Guidelines

### Adding New Sections

1. Create component in `components/` directory
2. Import and add to `app/page.tsx`
3. Follow existing design patterns
4. Use UI components from `components/ui/`
5. Maintain responsive design (mobile-first)

### Styling Conventions

- Use Tailwind CSS utility classes
- Follow existing spacing and color patterns
- Maintain consistency with design system
- Test on mobile, tablet, and desktop

### Component Patterns

- Use TypeScript for type safety
- Implement proper error boundaries
- Follow accessibility guidelines (ARIA labels)
- Optimize images and assets

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (lg, xl)

### Mobile-First Approach

- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized images for all devices

---

## 🔍 SEO & Performance

### SEO Features

- Semantic HTML structure
- Meta tags (to be added)
- Open Graph tags (to be added)
- Structured data (JSON-LD) (to be added)

### Performance

- Next.js automatic code splitting
- Image optimization
- Lazy loading for below-fold content
- Minimal JavaScript bundle

---

## 🚢 Deployment

### Vercel Deployment

The app is automatically synced with v0.app and deployed to Vercel:

**Live URL**: [https://vercel.com/vjbollavarapu-8ded34df/v0-oasys-landing-page](https://vercel.com/vjbollavarapu-8ded34df/v0-oasys-landing-page)

### Manual Deployment

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy

# Or use Vercel CLI
vercel
```

---

## 📝 Content Management

### Text Content

- All copy is currently hardcoded in components
- Consider moving to CMS or JSON files for easier updates
- Key messages should align with marketing strategy

### Images & Assets

- Placeholder images in `public/` directory
- Replace with actual screenshots/mockups
- Optimize images for web (WebP format recommended)

---

## 🔄 Sync with v0.app

This repository automatically syncs with v0.app deployments:

1. Make changes in v0.app chat interface
2. Deploy from v0 interface
3. Changes automatically pushed to this repository
4. Vercel deploys latest version

**v0 Chat**: [https://v0.app/chat/jQpH1smGbAq](https://v0.app/chat/jQpH1smGbAq)

---

## 🐛 Known Issues & TODOs

### Current Limitations

- Form submissions not connected to backend (email capture only)
- Analytics not fully configured
- Some placeholder images still in use
- Meta tags need to be added for SEO

### Future Enhancements

- [ ] Connect waitlist form to backend API
- [ ] Add analytics tracking (Vercel Analytics)
- [ ] Implement A/B testing for CTAs
- [ ] Add more industry-specific content
- [ ] Create component library documentation
- [ ] Add Storybook for component development

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **Lucide Icons**: https://lucide.dev/

---

## 👥 Contributing

1. Follow existing code style and patterns
2. Maintain TypeScript types
3. Test on multiple screen sizes
4. Ensure accessibility standards
5. Update this README if adding major features

---

## 📄 License

Private - OASYS Platform

---

**Last Updated**: 2025-01-27
**Version**: 0.1.0
**Status**: Beta / Development
