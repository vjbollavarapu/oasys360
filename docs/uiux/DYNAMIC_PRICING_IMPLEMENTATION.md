# 🌍 Dynamic Pricing Implementation

**Date**: 2025-12-08  
**Status**: ✅ Fully Implemented

---

## 📊 Overview

The pricing section now dynamically adjusts based on user's geolocation, offering region-specific pricing optimized for purchasing power parity (PPP).

---

## 🗺️ Region Classification

### 1. **Southeast Asia (SEA)**
- Malaysia (MY)
- Singapore (SG)
- Thailand (TH)
- Vietnam (VN)
- Indonesia (ID)
- Philippines (PH)
- Myanmar (MM)
- Cambodia (KH)
- Laos (LA)
- Brunei (BN)
- East Timor (TL)

### 2. **India (INDIA)**
- India (IN) - Separate pricing tier

### 3. **Global (GLOBAL)**
- All other countries (default)

---

## 💰 Pricing Structure

### Global Pricing (US/Europe/Other)

| Tier | Price | Target Market |
|------|-------|---------------|
| Growth | $249/month | Small agencies & contractors |
| Scale | $749/month | Growing web3 & tech companies |
| Enterprise | Custom | Supply chain & high-volume treasury |

### SEA Pricing (Southeast Asia)

| Tier | Price | Discount | Rationale |
|------|-------|----------|-----------|
| Growth | **$129/month** | -48% | "Sweet Spot" - Small agencies (10-20 staff) in Vietnam/KL often hesitate at >$200. $129 feels like a utility bill. |
| Scale | **$399/month** | -47% | "Upgrade Path" - Once an agency grows to 50+ staff, $399 is negligible compared to FX fees saved. |
| Enterprise | **Custom**<br/>(Starts at $1,500/mo) | - | High Touch - Large SEA conglomerates expect hand-holding. They pay for service, not just software. |

### India Pricing

| Tier | Price | Discount | Rationale |
|------|-------|----------|-----------|
| Growth | **$99/month** | -60% | Most price-sensitive market. Lower entry barrier for small agencies. |
| Scale | **$349/month** | -53% | Competitive pricing for growing tech companies in India. |
| Enterprise | **Custom**<br/>(Starts at $1,200/mo) | - | Competitive enterprise pricing for large Indian corporations. |

---

## 🔍 Detection Methods

### 1. **IP-Based Detection (Primary)**
- Uses `ipapi.co` free API
- Detects country code from user's IP address
- Fast and accurate
- Cached in localStorage

### 2. **Timezone-Based Detection (Fallback)**
- Uses browser's `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Falls back if IP detection fails
- Less accurate but works offline

### 3. **Manual Override**
- Users can manually select their region
- Selection is cached in localStorage
- Useful for testing or if detection is incorrect

---

## 🎨 User Experience

### Region Selector
- Dropdown button showing current region
- Allows manual region switching
- Displays "PPP-adjusted pricing" label for SEA/India
- Smooth transitions between pricing tiers

### Loading State
- Shows "Detecting your region..." while detecting
- Falls back to Global pricing if detection fails
- No blocking - pricing loads immediately with default

### Visual Indicators
- Region label in pricing header
- Pricing cards update dynamically
- Same features across all regions (only price differs)

---

## 📁 Implementation Files

### Core Files

1. **`lib/geolocation.ts`**
   - Region detection logic
   - Country code mapping
   - Timezone detection
   - Caching utilities

2. **`lib/pricing-config.ts`**
   - Pricing tier definitions
   - Region-specific pricing
   - Price formatting utilities

3. **`components/pricing-section.tsx`** (Updated)
   - Dynamic pricing display
   - Region selector UI
   - Loading states
   - Event tracking

---

## 🔧 Technical Details

### Region Detection Flow

```
1. Check localStorage cache
   ↓ (if cached)
   Return cached region

2. Try IP-based detection (ipapi.co)
   ↓ (if successful)
   Cache and return region

3. Try timezone-based detection
   ↓ (if successful)
   Cache and return region

4. Fallback to GLOBAL
```

### Caching Strategy

- Region cached in `localStorage` as `user_region`
- Country code cached as `user_country`
- Cache persists across sessions
- Can be manually overridden by user

### API Integration

- Uses free `ipapi.co` service (no API key required)
- Handles rate limits gracefully
- Falls back silently if service unavailable

---

## 📊 Pricing Comparison

### Growth Tier
- **Global**: $249/month
- **SEA**: $129/month (-48%)
- **India**: $99/month (-60%)

### Scale Tier
- **Global**: $749/month
- **SEA**: $399/month (-47%)
- **India**: $349/month (-53%)

### Enterprise Tier
- **Global**: Custom pricing
- **SEA**: Custom (starts at $1,500/month)
- **India**: Custom (starts at $1,200/month)

---

## 🎯 Business Rationale

### SEA Pricing Strategy

1. **Lower Barrier to Entry**
   - Small agencies (10-20 staff) in Vietnam/KL hesitate at >$200
   - $129 feels like a utility bill, not a luxury

2. **Volume Potential**
   - SEA markets offer massive volume potential
   - Lower pricing captures more customers

3. **Enterprise Premium**
   - Large conglomerates still pay premium for service
   - High-touch model justifies higher enterprise pricing

### India Pricing Strategy

1. **Most Price-Sensitive**
   - India is the most price-sensitive market
   - Lower entry price ($99) captures more customers

2. **Competitive Positioning**
   - Scale tier at $349 is competitive for growing tech companies
   - Enterprise pricing reflects market dynamics

---

## 🧪 Testing

### Test Scenarios

1. **Auto-Detection**
   - Test from different regions
   - Verify correct region detected
   - Check caching behavior

2. **Manual Override**
   - Change region via dropdown
   - Verify pricing updates
   - Check cache update

3. **Fallback Behavior**
   - Test with VPN/proxy
   - Test with IP detection failure
   - Verify falls back gracefully

4. **Performance**
   - Check loading times
   - Verify no blocking
   - Test with slow network

---

## 🔐 Privacy & Compliance

### Data Collection
- **IP Address**: Used only for region detection
- **Country Code**: Cached locally only
- **No Personal Data**: No PII collected or stored

### GDPR Compliance
- No tracking without consent
- Minimal data collection
- Local storage only (no server-side storage)

---

## 🚀 Future Enhancements

1. **Currency Display**
   - Show local currency alongside USD
   - Currency conversion based on current rates

2. **More Granular Regions**
   - Sub-regional pricing (e.g., Tier 1 vs Tier 2 cities)
   - Country-specific pricing within SEA

3. **A/B Testing**
   - Test different price points
   - Measure conversion rates by region

4. **Promotional Pricing**
   - Region-specific promotions
   - Limited-time discounts

5. **Enterprise Customization**
   - Dynamic enterprise pricing calculator
   - Volume-based discounts

---

## ✅ Summary

**Status**: ✅ Fully Implemented  
**Regions**: 3 (Global, SEA, India)  
**Detection Methods**: 2 (IP, Timezone)  
**Fallback**: Global pricing  
**User Control**: Manual override available  

Dynamic pricing is now live and automatically adjusts based on user location, providing optimized pricing for each region while maintaining a consistent user experience.

---

**Last Updated**: 2025-12-08

