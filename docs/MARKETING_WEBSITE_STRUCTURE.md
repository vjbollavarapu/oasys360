# Marketing Website Structure Map

## Overview
The marketing website is located in `/apps/uiux/` (not `/apps/frontend/`). It's a Next.js 13+ application using the App Router.

---

## Homepage Route
**File:** `/apps/uiux/app/page.tsx`

This is the main landing page that composes all sections.

---

## Sections in Order (Top to Bottom)

### 1. Navigation
**Component:** `Navigation`  
**File:** `/apps/uiux/components/navigation.tsx`  
**Content Source:** Hardcoded in component
- Navigation items: `#features`, `#security`, `#pricing`
- Logo: `/oasys-logo-1.png` (from public folder)
- CTA buttons: "Login" and "Request Access"
- **Text Content Location:** Lines 10-14 (navigationItems array)

---

### 2. Hero Section
**Component:** `HeroSection`  
**File:** `/apps/uiux/components/hero-section.tsx`  
**Content Source:** 
- **Headline/Subheadline:** Hardcoded (Lines 43-48)
  - Headline: "The Financial OS for the Hybrid Economy."
  - Subheadline: "Manage Fiat and Crypto operations in one unified ledger. No more spreadsheets. No more blind spots."
- **CTA Button:** Hardcoded (Line 59): "Get Early Access"
- **Trust Badge:** Hardcoded (Line 67): "LHDN e-Invois Compliant"
- **Social Proof Stats:** From `/apps/uiux/lib/social-proof-config.ts`
  - Companies, Users, Transactions, Countries counts
  - Currently disabled (enabled: false)
- **Visual Component:** `LiquidityCard` (hero right side)

---

### 3. Problem Section
**Component:** `ProblemSection`  
**File:** `/apps/uiux/components/problem-section.tsx`  
**Content Source:** Hardcoded in component
- **Section Title:** "Stop running your business with half the data." (Line 11)
- **Old Way vs New Way:** All text hardcoded (Lines 23-74)
  - Old Way problems: Bank Portal, Crypto Wallet, Excel Spreadsheets
  - New Way solution: "One Source of Truth"

---

### 4. Workflow Section
**Component:** `WorkflowSection`  
**File:** `/apps/uiux/components/workflow-section.tsx`  
**Content Source:** Hardcoded in component
- **Section Title:** "The OASYS Workflow" (Line 44)
- **Subtitle:** "Four automated steps from chaos to clarity" (Line 46)
- **Steps Array:** Hardcoded (Lines 10-37)
  - Step 01: Ingest
  - Step 02: Normalize
  - Step 03: Verify
  - Step 04: Sync
- Each step has title and description hardcoded

---

### 5. Feature Deep Dives
**Component:** `FeatureDeepDives`  
**File:** `/apps/uiux/components/feature-deep-dives.tsx`  
**Content Source:** Hardcoded in component
- **Section Title:** "Deep Dives" (Line 10)
- **Subtitle:** "Comprehensive solutions for hybrid finance operations" (Line 11)
- **Features (4 main features):**
  1. **Unified Treasury Management** (Lines 15-118)
     - Title, description, bullet points hardcoded
  2. **Smart Defense Shield** (Lines 121-206)
     - Title, description, bullet points hardcoded
  3. **Hybrid Tax & Compliance** (Lines 209-314)
     - Title, description, bullet points hardcoded
  4. **Regulatory Autopilot** (Lines 317-453)
     - Title, description, bullet points hardcoded
     - Includes compliance dashboard mockup with Malaysia LHDN, Singapore GST, EU VAT, US 1099

---

### 6. Industry Solutions Section
**Component:** `IndustrySolutionsSection`  
**File:** `/apps/uiux/components/industry-solutions-section.tsx`  
**Content Source:** Hardcoded in component
- **Section Title:** "Built for the complexity of your specific industry" (Line 35)
- **Subtitle:** "Tailored solutions for businesses operating in hybrid finance environments" (Line 39)
- **Tabs:** Hardcoded array (Lines 20-25)
  - Global Agencies
  - Supply Chain
  - Web3 Gaming
  - Malaysia (SEA)
- **Tab Content:** Each tab has its own component function with hardcoded content
  - `AgenciesContent()` (Lines 79-194)
  - `SupplyChainContent()` (Lines 196-305)
  - `GamingContent()` (Lines 307-424)
  - `MalaysiaContent()` (Lines 426-590)

---

### 7. Integrations Section
**Component:** `IntegrationsSection`  
**File:** `/apps/uiux/components/integrations-section.tsx`  
**Content Source:** Hardcoded in component
- **Section Title:** "Works with your existing stack" (Line 31)
- **Subtitle:** "Seamless integrations across traditional finance and Web3" (Line 35)
- **Fiat Integrations:** Hardcoded array (Lines 5-14)
  - QuickBooks, Xero, NetSuite, Stripe, Brex, Plaid, Mercury, Ramp
- **Web3 Integrations:** Hardcoded array (Lines 16-25)
  - Ethereum, Polygon, Solana, Gnosis Safe, Coinbase Prime, Arbitrum, Optimism, Base

---

### 8. Security Section
**Component:** `SecuritySection`  
**File:** `/apps/uiux/components/security-section.tsx`  
**Content Source:** Hardcoded in component
- **Section Title:** "Security & Trust" (Line 33)
- **Subtitle:** "Enterprise-grade security for your most sensitive financial data" (Line 37)
- **Security Features:** Hardcoded array (Lines 5-27)
  - Non-Custodial, SOC2 Type II, Encryption, Role-Based Access
- **Stats:** Hardcoded (Lines 64-76)
  - 99.9% Uptime SLA, 24/7 Security Monitoring, GDPR Compliant

---

### 9. Trust Section
**Component:** `TrustSection`  
**File:** `/apps/uiux/components/trust-section.tsx`  
**Content Source:** Hardcoded in component
- **Section Title:** "Built for accuracy, not hype." (Line 24)
- **Trust Stats:** Hardcoded array (Lines 4-17)
  - Human-in-the-loop AI Verification
  - SOC2 Compliance Ready
  - 80% Reduction in Manual Categorization

---

### 10. Pricing Section
**Component:** `PricingSection`  
**File:** `/apps/uiux/components/pricing-section.tsx`  
**Content Source:** 
- **Section Title:** "Simple, Transparent Pricing" (Line 77)
- **Subtitle:** "Choose the plan that fits your business needs" (Line 80)
- **Pricing Data:** From `/apps/uiux/lib/pricing-config.ts`
  - Regional pricing tiers (Global, SEA, India)
  - Pricing tiers: Growth, Scale, Enterprise
  - Features list, pricing, descriptions
- **FAQ Component:** `/apps/uiux/components/pricing-section-faq.tsx`
  - FAQ items hardcoded in component (Lines 13-64)

---

### 11. CTA Section (Call-to-Action + Footer)
**Component:** `CTASection`  
**File:** `/apps/uiux/components/cta-section.tsx`  
**Content Source:** Hardcoded in component
- **Main CTA Title:** "Ready to unify your finance stack?" (Line 159)
- **Email Form:** Hardcoded validation and submit logic
- **Footer Sections:** Hardcoded (Lines 206-286)
  - Product links
  - Company links
  - Resources links
  - Newsletter subscription component
- **Newsletter Component:** `/apps/uiux/components/newsletter-subscription.tsx` (referenced but not read)

---

### 12. Back To Top Button
**Component:** `BackToTop`  
**File:** `/apps/uiux/components/back-to-top.tsx`  
**Content Source:** No text content, just functional button

---

## Supporting Components

### Visual/Mockup Components
- **LiquidityCard:** `/apps/uiux/components/liquidity-card.tsx`
  - Mockup card showing treasury transactions
  - Content hardcoded (transaction data array, Lines 7-41)

### Utility Components
- **ErrorBoundary:** `/apps/uiux/components/error-boundary.tsx`
- **NewsletterSubscription:** `/apps/uiux/components/newsletter-subscription.tsx` (not analyzed)

---

## Content Configuration Files

### 1. Social Proof Config
**File:** `/apps/uiux/lib/social-proof-config.ts`  
**Purpose:** Social proof statistics for Hero section
- Companies count, Users count, Transactions processed, Countries count
- Currently disabled (`enabled: false`)
- Formatting utility functions included

### 2. Pricing Config
**File:** `/apps/uiux/lib/pricing-config.ts`  
**Purpose:** Regional pricing tiers and features
- Defines pricing for 3 regions: Global, SEA, India
- 3 tiers per region: Growth, Scale, Enterprise
- Features, pricing, descriptions, button text

### 3. Other Config Files (Not Content)
- `/apps/uiux/lib/analytics.ts` - Analytics tracking
- `/apps/uiux/lib/marketing-api.ts` - API client
- `/apps/uiux/lib/geolocation.ts` - Region detection
- `/apps/uiux/lib/ab-testing.ts` - A/B testing utilities

---

## Content Summary

### Where Content Comes From:
1. **90% Hardcoded:** Most text content is directly in component files as JSX/strings
2. **Config Files (10%):**
   - Pricing data → `lib/pricing-config.ts`
   - Social proof stats → `lib/social-proof-config.ts`
3. **No CMS:** No MDX, JSON, YAML, or external CMS files
4. **No Shared Section Component:** Each section is a standalone component with no base abstraction

### Suggested Edit Locations:
- **Hero copy:** `components/hero-section.tsx` (Lines 43-48)
- **Section titles/subtitles:** Each section component's header section
- **Feature descriptions:** `components/feature-deep-dives.tsx` (each feature block)
- **Industry content:** `components/industry-solutions-section.tsx` (tab content functions)
- **Pricing:** `lib/pricing-config.ts` (centralized)
- **Integrations list:** `components/integrations-section.tsx` (Lines 5-25)
- **Security features:** `components/security-section.tsx` (Lines 5-27)
- **FAQ:** `components/pricing-section-faq.tsx` (Lines 13-64)
- **Footer links:** `components/cta-section.tsx` (Lines 206-286)
- **Navigation:** `components/navigation.tsx` (Lines 10-14)

---

## File Structure Summary

```
apps/uiux/
├── app/
│   └── page.tsx                    # Main homepage (composes all sections)
├── components/
│   ├── navigation.tsx              # Navigation bar
│   ├── hero-section.tsx            # Hero section
│   ├── problem-section.tsx         # Problem/Solution comparison
│   ├── workflow-section.tsx        # 4-step workflow
│   ├── feature-deep-dives.tsx      # Main feature showcase
│   ├── industry-solutions-section.tsx  # Industry tabs
│   ├── integrations-section.tsx    # Integration logos
│   ├── security-section.tsx        # Security features
│   ├── trust-section.tsx           # Trust indicators
│   ├── pricing-section.tsx         # Pricing tiers
│   ├── pricing-section-faq.tsx     # Pricing FAQ
│   ├── cta-section.tsx             # CTA form + Footer
│   ├── liquidity-card.tsx          # Hero mockup component
│   ├── back-to-top.tsx             # Floating button
│   └── newsletter-subscription.tsx # Newsletter form
└── lib/
    ├── pricing-config.ts           # Pricing data (content)
    ├── social-proof-config.ts      # Social proof stats (content)
    ├── analytics.ts                # Analytics (not content)
    ├── marketing-api.ts            # API client (not content)
    └── geolocation.ts              # Region detection (not content)
```

---

## Notes

1. **No Shared Base Section Component:** Each section is independent with its own styling and structure
2. **Lazy Loading:** Some sections are dynamically imported for performance (FeatureDeepDives, IndustrySolutionsSection, etc.)
3. **Regional Content:** Pricing section supports regional pricing via `pricing-config.ts` and geolocation detection
4. **Analytics:** Uses Vercel Analytics for tracking CTA clicks and form submissions
5. **Accessibility:** Good ARIA labels and semantic HTML throughout
6. **SEO:** Sections have proper IDs for anchor links (#features, #security, #pricing, #cta)
