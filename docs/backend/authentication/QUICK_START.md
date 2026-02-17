# Hybrid Authentication - Quick Start Guide

## Overview

OASYS360 uses a **corporate-first authentication strategy** with optional social sign-up for trials.

## Registration Options

### Option 1: Corporate Email (Recommended)
- ✅ Full feature access after verification
- ✅ Business account tier
- ✅ Required for financial operations
- ✅ Best for companies and professionals

### Option 2: Social Sign-up (Trial)
- ✅ Quick sign-up
- ⚠️ Limited feature access
- ⚠️ Trial account tier
- ✅ Can upgrade to corporate account

## Registration Endpoints

### Corporate Email Sign-up
```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "tenant_name": "My Company",
  "company_name": "My Company Inc",
  "country_code": "SG"
}
```

### Social Sign-up
```http
POST /api/v1/auth/register/social/
Content-Type: application/json

{
  "provider": "google",
  "access_token": "oauth_token",
  "email": "user@gmail.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

## Account Status

### Check Account Status
```http
GET /api/v1/auth/account/status/
Authorization: Bearer <token>
```

### Response
```json
{
  "account_type": "trial",
  "account_tier": "trial",
  "email_verified": true,
  "corporate_email_verified": false,
  "can_upgrade": true,
  "requires_verification": false
}
```

## Upgrade Trial to Corporate

### Step 1: Request Conversion
```http
POST /api/v1/auth/account/convert/
Authorization: Bearer <token>
Content-Type: application/json

{
  "corporate_email": "user@company.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

### Step 2: Verify Corporate Email
```http
POST /api/v1/auth/account/verify-corporate-email/
Content-Type: application/json

{
  "token": "verification_token_from_email",
  "email": "user@company.com"
}
```

## Email Verification

### Verify Email
```http
POST /api/v1/auth/account/verify-email/
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

### Resend Verification
```http
POST /api/v1/auth/account/resend-verification/
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@company.com"  // Optional
}
```

## Feature Access

### Trial Account
- ✅ View dashboards
- ✅ Explore features (read-only)
- ❌ Create invoices
- ❌ Access banking
- ❌ Financial transactions

### Business Account
- ✅ All features
- ✅ Create invoices
- ✅ Access banking
- ✅ Financial transactions
- ✅ Team management

## Corporate Email Validation

### Accepted
- Custom domains: `user@company.com`
- Corporate email providers with custom domains

### Rejected (for business accounts)
- Gmail, Yahoo, Hotmail, Outlook (personal)
- Other free email providers

## Next Steps

1. **Run Migration**
   ```bash
   python manage.py migrate authentication
   ```

2. **Configure OAuth Providers** (for social sign-up)
   - Add Google OAuth credentials
   - Add LinkedIn OAuth credentials

3. **Create Email Templates**
   - Email verification template
   - Corporate email verification template

4. **Update Frontend**
   - Add corporate email registration form
   - Add social sign-up buttons
   - Add account status checks
   - Add upgrade prompts

## Support

For detailed implementation guide, see:
- `HYBRID_AUTH_IMPLEMENTATION.md` - Full implementation details
- `AUTHENTICATION_SUMMARY.md` - Implementation summary

