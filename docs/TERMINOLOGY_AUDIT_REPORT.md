# Terminology Audit Report
**Date:** 2025-01-XX  
**Scope:** Site-wide terminology audit for OASYS marketing website  
**Goal:** Update language to align with positioning (verification layer, not accounting replacement)

---

## Audit Rules Applied

1. ✅ Replace "decentralised accounting" → "decentralised verification" or "verification layer"
2. ✅ Replace "trustless" → "verifiable" / "tamper-resistant"
3. ✅ Replace "blockchain accounting" → "ledger-backed verification"
4. ✅ Keep "decentralised ledger" only when immediately qualified as evidence/verification

---

## Terms Replaced

### 1. "crypto accounting" → "ledger-backed verification"
**File:** `apps/uiux/app/layout.tsx`  
**Line:** 19 (keywords array)  
**Change:** 
- **Before:** `"crypto accounting"`
- **After:** `"ledger-backed verification"`

---

### 2. "fiat and crypto accounting" → "ledger-backed verification" / "fiat and digital asset operations"
**Files Updated:**

#### a. `apps/uiux/app/layout.tsx`
- **Line 115** (softwareApplicationSchema description):
  - **Before:** `"Unified financial operations system for fiat and crypto accounting, AI-powered automation, and global compliance"`
  - **After:** `"Unified financial operations system with ledger-backed verification, AI-powered automation, and global compliance"`

- **Line 122** (featureList):
  - **Before:** `"Unified fiat and crypto accounting"`
  - **After:** `"Unified fiat and digital asset operations with verification layer"`

#### b. `apps/uiux/README.md`
- **Line 28** (Overview section):
  - **Before:** `"a comprehensive financial operations system that unifies fiat and crypto accounting, AI-powered document processing, and global compliance automation"`
  - **After:** `"a comprehensive financial operations system with ledger-backed verification, AI-powered document processing, and global compliance automation"`

- **Line 471** (Web3 & Blockchain features):
  - **Before:** `"Cryptocurrency accounting"`
  - **After:** `"Digital asset verification and ledger-backed evidence"`

---

### 3. LHDN Compliance Language (Consistency Update)
**File:** `apps/uiux/app/layout.tsx`  
**Lines:** 162-166 (FAQ schema)  
**Change:** Updated to match pricing-section-faq.tsx changes from earlier session
- **Before:** `"Do you support LHDN e-Invois compliance?"` → `"Yes! OASYS is fully LHDN e-Invois compliant..."`
- **After:** `"Do you support LHDN e-Invois workflows?"` → `"Yes! OASYS supports e-invoice workflows and is integration-ready..."`

---

## Terms Verified (Already Correct)

### ✅ "decentralized ledgers" - Properly Qualified
**File:** `apps/uiux/components/hybrid-by-design-section.tsx`  
**Line:** 14  
**Status:** ✅ **CORRECT** - Already qualified: "Uses decentralized ledgers for tamper-resistant evidence and immutable audit trails alongside your accounting system."

### ✅ "decentralized verification" - Correct Usage
**File:** `apps/uiux/components/hero-section.tsx`  
**Line:** 47  
**Status:** ✅ **CORRECT** - Already using preferred terminology: "Adds decentralized verification as an immutable integrity layer—without replacing your accounting."

---

## Terms Not Found (No Action Needed)

- ❌ "decentralised accounting" - Not found
- ❌ "trustless" - Not found  
- ❌ "blockchain accounting" - Not found

---

## Contextually Appropriate (No Change Needed)

### ✅ "fiat and crypto operations"
**Files:** 
- `apps/uiux/app/about/page.tsx` (Line 21)
- `apps/uiux/app/changelog/page.tsx` (Line 27)
- `apps/uiux/app/manifesto/page.tsx` (Line 21, 33, 59)

**Rationale:** These instances describe **operations management** (not accounting), which is appropriate. The term "operations" correctly describes what the platform manages, not how it replaces accounting.

### ✅ "blockchain-based transactions"
**File:** `apps/uiux/app/manifesto/page.tsx`  
**Line:** 22  
**Rationale:** Describes the hybrid economy context, not the product's positioning. No change needed.

### ✅ "blockchain" (general references)
**Files:**
- `apps/uiux/app/careers/page.tsx` (Line 28) - Describes industry/technology interests
- `apps/uiux/components/integrations-section.tsx` (Line 65) - Section header for integrations category
- Various documentation files

**Rationale:** General references to blockchain technology/integrations are acceptable and not claiming "blockchain accounting."

---

## Summary

### Files Modified: 2
1. `apps/uiux/app/layout.tsx` - 4 replacements
2. `apps/uiux/README.md` - 2 replacements

### Total Replacements: 6
- 1× "crypto accounting" → "ledger-backed verification"
- 2× "fiat and crypto accounting" → appropriate alternatives
- 1× "Cryptocurrency accounting" → "Digital asset verification and ledger-backed evidence"
- 1× LHDN compliance FAQ update (consistency)

### Terms Verified as Correct: 2
- "decentralized ledgers" (properly qualified)
- "decentralized verification" (correct usage)

### Terms Not Found: 3
- "decentralised accounting"
- "trustless"
- "blockchain accounting"

---

## Compliance Notes

✅ All updated copy:
- Emphasizes "verification layer" positioning
- Avoids claims of replacing accounting
- Uses regulator-safe language
- Maintains professional tone
- No business logic changes

✅ Existing correct usage preserved:
- Properly qualified "decentralized ledger" references
- Appropriate "operations" terminology for operational management
- Contextually appropriate blockchain/Web3 references in integration contexts

---

## Next Steps (Optional)

- Consider adding "verification layer" and "ledger-backed verification" to SEO keywords if not already present
- Review any future content for consistency with these terminology guidelines
- Consider creating a style guide document for future content creation

---

**Audit Complete** ✅  
**All terminology now aligns with positioning:** Verification layer, not accounting replacement.
