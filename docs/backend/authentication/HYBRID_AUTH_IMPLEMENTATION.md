# Hybrid Authentication Implementation Guide

## Overview

OASYS360 now supports a **corporate-first authentication strategy** with optional social sign-up for trials. This provides security and compliance for business accounts while offering flexibility for user acquisition.

## Architecture

### Account Types

1. **Corporate Account** (Primary)
   - Requires corporate email
   - Full feature access after email verification
   - Business tier by default
   - Required for financial operations

2. **Trial Account** (Secondary)
   - Can use social authentication
   - Limited feature access
   - Can upgrade to corporate account
   - No financial transactions allowed

### Account Tiers

- **Trial**: Limited access, view-only features
- **Business**: Full access after corporate email verification
- **Enterprise**: Full access with additional features (future)

## API Endpoints

### Registration

#### Corporate Email Sign-up (Primary)
```
POST /api/v1/auth/register/
```

**Request:**
```json
{
  "email": "user@company.com",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "tenant_name": "My Company",
  "company_name": "My Company Inc",
  "country_code": "SG"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "user_info": {
    "account_type": "corporate",
    "tier": "business",
    "access_level": "full",
    "requires_verification": true,
    "can_access_financial_features": false
  },
  "tokens": { ... },
  "message": "User registered successfully. Please verify your email.",
  "requires_verification": true
}
```

#### Social Sign-up (Optional)
```
POST /api/v1/auth/register/social/
```

**Request:**
```json
{
  "provider": "google",
  "access_token": "oauth_access_token",
  "email": "user@gmail.com",
  "first_name": "John",
  "last_name": "Doe",
  "tenant_name": "My Company",
  "company_name": "My Company Inc"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "user_info": {
    "account_type": "trial",
    "tier": "trial",
    "access_level": "limited",
    "can_access_financial_features": false
  },
  "tokens": { ... },
  "message": "Account created successfully. Upgrade to corporate account for full features.",
  "requires_upgrade": true,
  "can_upgrade": true
}
```

### Account Management

#### Get Account Status
```
GET /api/v1/auth/account/status/
```

**Response:**
```json
{
  "account_type": "trial",
  "account_tier": "trial",
  "email_verified": true,
  "corporate_email_verified": false,
  "user_info": { ... },
  "can_upgrade": true,
  "requires_verification": false
}
```

#### Convert Trial to Corporate
```
POST /api/v1/auth/account/convert/
```

**Request:**
```json
{
  "corporate_email": "user@company.com",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent to corporate email. Please check your inbox.",
  "conversion_id": "uuid",
  "corporate_email": "user@company.com"
}
```

#### Verify Corporate Email
```
POST /api/v1/auth/account/verify-corporate-email/
```

**Request:**
```json
{
  "token": "verification_token",
  "email": "user@company.com"
}
```

#### Verify Email
```
POST /api/v1/auth/account/verify-email/
```

**Request:**
```json
{
  "token": "verification_token"
}
```

#### Resend Verification
```
POST /api/v1/auth/account/resend-verification/
```

**Request:**
```json
{
  "email": "user@company.com"  // Optional, defaults to user email
}
```

### Social Accounts

#### List Social Accounts
```
GET /api/v1/auth/social-accounts/
```

## Feature Access Control

### Trial Account Restrictions

Trial accounts have **limited access**:
- ✅ View dashboards
- ✅ Explore features (read-only)
- ❌ Create invoices
- ❌ Access banking
- ❌ Manage accounts
- ❌ Invite team members
- ❌ Financial transactions

### Business Account Access

Business accounts have **full access**:
- ✅ All features
- ✅ Create invoices
- ✅ Access banking
- ✅ Manage accounts
- ✅ Invite team members
- ✅ Financial transactions

## Corporate Email Validation

### Validation Rules

1. **Corporate Email Required** for business accounts
2. **Custom Domains** are automatically considered corporate
3. **Free Email Providers** (Gmail, Yahoo, etc.) are rejected for business accounts
4. **Email Verification** required before full access

### Supported Corporate Email Patterns

- Custom domains: `user@company.com`
- Microsoft 365: `user@company.onmicrosoft.com`
- Google Workspace: `user@company.com` (custom domain)
- Other enterprise email providers

### Free Email Providers (Rejected for Business)

- Gmail, Googlemail
- Yahoo, Ymail
- Hotmail, Outlook (personal)
- AOL
- iCloud (personal)
- ProtonMail (personal)

## User Flow

### Corporate Sign-up Flow

```
1. User enters corporate email
2. System validates email domain
3. User creates account
4. Verification email sent
5. User verifies email
6. Account upgraded to business tier
7. Full access granted
```

### Social Sign-up Flow

```
1. User clicks "Sign up with Google/LinkedIn"
2. OAuth flow completes
3. Trial account created
4. Limited access granted
5. User can explore features
6. User prompted to upgrade
7. User provides corporate email
8. Verification email sent
9. User verifies corporate email
10. Account converted to business tier
11. Full access granted
```

## Implementation Details

### Models

- **User**: Extended with `account_type`, `account_tier`, `email_verified`, `corporate_email_verified`
- **SocialAccount**: Stores OAuth provider information
- **AccountConversion**: Tracks conversion from trial to corporate

### Utilities

- **is_corporate_email()**: Validates if email is corporate
- **validate_corporate_email()**: Strict validation for business accounts
- **detect_user_type()**: Determines account status and access level

### Permissions

Access control is enforced at the view level based on:
- `account_tier` (trial vs business)
- `email_verified` status
- `corporate_email_verified` status

## Security Considerations

1. **Email Verification**: Required for all corporate accounts
2. **Password Requirements**: Enforced for corporate accounts
3. **OAuth Tokens**: Stored encrypted (should be implemented)
4. **Rate Limiting**: Applied to registration endpoints
5. **Account Conversion**: Requires email verification

## Frontend Integration

### Registration Page

```typescript
// Primary: Corporate Email Sign-up
<Button onClick={handleCorporateSignUp}>
  Sign Up with Corporate Email
</Button>

// Secondary: Social Sign-up (Optional)
<Button variant="outline" onClick={handleSocialSignUp}>
  Continue with Google
</Button>
<Button variant="outline" onClick={handleSocialSignUp}>
  Continue with LinkedIn
</Button>

// Note displayed:
"Corporate email required for full business features"
```

### Account Status Check

```typescript
// Check account status on app load
const { data: accountStatus } = useQuery('accountStatus', () =>
  api.get('/auth/account/status/')
);

if (accountStatus?.can_upgrade) {
  // Show upgrade prompt
}

if (accountStatus?.requires_verification) {
  // Show verification prompt
}
```

## Migration Guide

### Existing Users

Existing users will be migrated with:
- `account_type`: 'corporate'
- `account_tier`: 'business'
- `email_verified`: Based on existing verification status
- `corporate_email_verified`: Based on email domain

### New Registrations

All new registrations will:
1. Use corporate email validation
2. Require email verification
3. Start with appropriate account tier

## Testing

### Test Cases

1. **Corporate Email Registration**
   - Valid corporate email → Success
   - Free email provider → Rejected
   - Custom domain → Accepted

2. **Social Registration**
   - Google OAuth → Trial account created
   - LinkedIn OAuth → Trial account created
   - Corporate email from social → Business account

3. **Account Conversion**
   - Trial → Corporate → Success
   - Email verification → Required
   - Access upgrade → After verification

4. **Feature Access**
   - Trial account → Limited features
   - Business account → Full features

## Future Enhancements

1. **OAuth Provider Integration**
   - Google OAuth SDK
   - LinkedIn OAuth SDK
   - Microsoft OAuth SDK

2. **Domain Verification**
   - Verify corporate domains
   - Whitelist verified domains

3. **Progressive Verification**
   - Multi-step verification
   - Document verification for enterprise

4. **Account Limits**
   - Trial account expiration
   - Feature usage limits

