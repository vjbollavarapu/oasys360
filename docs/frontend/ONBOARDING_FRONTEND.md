# Frontend Onboarding Implementation

## ✅ Implementation Complete

The frontend onboarding wizard and route protection have been implemented.

## Components Created

### 1. Onboarding Page
**Location**: `apps/frontend/app/onboarding/page.tsx`

- Checks onboarding status on load
- Redirects to dashboard if already completed
- Displays onboarding wizard

### 2. Onboarding Wizard Component
**Location**: `apps/frontend/components/onboarding/onboarding-wizard.tsx`

**Features:**
- 5-step sequential wizard
- Progress tracking with visual indicators
- Step validation
- Resume capability (loads from backend)
- Error handling
- Loading states

**Steps:**
1. **Subscription Selection** - Plan and billing cycle
2. **Domain Configuration** - Custom domain or subdomain
3. **Company Profile** - Legal name, country, industry, address, etc.
4. **Preset Provisioning** - Auto-provisioned (shows loading)
5. **Confirmation** - Summary and completion

### 3. Onboarding Guard Component
**Location**: `apps/frontend/components/onboarding/onboarding-guard.tsx`

- Protects dashboard routes
- Checks onboarding status
- Redirects to `/onboarding` if incomplete
- Shows loading state during check

## Route Protection

### Updated Files

1. **Login Page** (`apps/frontend/app/auth/login/page.tsx`)
   - After successful login, checks onboarding status
   - Redirects to `/onboarding` if incomplete
   - Redirects to `/accounting` if complete

2. **Home Page** (`apps/frontend/app/page.tsx`)
   - Wrapped with `OnboardingGuard`
   - Checks onboarding status on load
   - Redirects to onboarding if incomplete

3. **Dashboard Layout**
   - All dashboard pages should be wrapped with `OnboardingGuard`
   - Prevents access until onboarding complete

## Usage

### Protecting a Dashboard Page

```tsx
import { OnboardingGuard } from '@/components/onboarding/onboarding-guard'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function MyDashboardPage() {
  return (
    <OnboardingGuard>
      <DashboardLayout>
        {/* Your page content */}
      </DashboardLayout>
    </OnboardingGuard>
  )
}
```

### Manual Onboarding Check

```tsx
const checkOnboarding = async () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  const token = localStorage.getItem('oasys_access_token')
  
  const response = await fetch(`${API_BASE_URL}/api/v1/tenants/onboarding/status/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  
  const data = await response.json()
  
  if (data.onboarding_status !== 'COMPLETED') {
    router.push('/onboarding')
  }
}
```

## API Integration

### Endpoints Used

1. **Get Status**
   ```
   GET /api/v1/tenants/onboarding/status/
   ```

2. **Complete Steps**
   ```
   POST /api/v1/tenants/onboarding/step/1/  # Subscription
   POST /api/v1/tenants/onboarding/step/2/  # Domain
   POST /api/v1/tenants/onboarding/step/3/  # Company Profile
   POST /api/v1/tenants/onboarding/step/4/  # Presets
   POST /api/v1/tenants/onboarding/step/5/  # Confirmation
   ```

## User Flow

1. **User Signs Up**
   - Tenant created in `INCOMPLETE` state
   - User redirected to login

2. **User Logs In**
   - Login successful
   - Onboarding status checked
   - If incomplete → redirect to `/onboarding`
   - If complete → redirect to `/accounting`

3. **Onboarding Wizard**
   - User completes 5 steps sequentially
   - Progress saved after each step
   - Can resume if session breaks

4. **Completion**
   - Step 5 marks onboarding as `COMPLETED`
   - User redirected to dashboard
   - Full access granted

## Security

- **Backend-Enforced**: Middleware blocks all protected routes
- **Frontend Protection**: `OnboardingGuard` provides UX-level protection
- **No Bypass**: Cannot access dashboard without completing onboarding
- **Resume Capability**: Progress persisted, can resume from any step

## Testing

1. **Sign up** → Tenant in `INCOMPLETE` state
2. **Login** → Redirected to `/onboarding`
3. **Try to access dashboard** → Redirected to `/onboarding`
4. **Complete onboarding** → Redirected to dashboard
5. **Access dashboard** → Success

## Next Steps

1. Add more countries/industries to dropdowns
2. Implement domain verification UI
3. Add preset preview before confirmation
4. Add skip option for optional fields
5. Add progress persistence across sessions

