# Landing Page Backend Integration Guide

> Guide for configuring the landing page to work with your separate backend

## 🔍 Current Status

The landing page is configured to connect to a backend API, but **we need to know your backend's endpoint structure** to complete the integration.

## 📋 What We Need From You

Please provide the following information about your separate landing page backend:

1. **Base URL Structure**
   - What is the base path for API endpoints?
   - Examples: `/api/`, `/api/v1/`, `/`, etc.

2. **Waitlist/Email Signup Endpoint**
   - What is the endpoint path for email signup?
   - What HTTP method does it use? (POST, PUT, etc.)
   - What is the expected request body format?
   - What is the response format?

3. **Other Available Endpoints**
   - Contact form endpoint
   - Newsletter subscription
   - Any other marketing endpoints

4. **Response Format**
   - Does your backend return: `{ success: true, message: "..." }`?
   - Or a different format?

## 🔧 Current Configuration

The landing page is currently configured with these defaults:

```typescript
// apps/uiux/lib/api-config.ts
BASE_URL: 'http://localhost:8000'
API_URL: 'http://localhost:8000/api/v1'

ENDPOINTS: {
  MARKETING: {
    EARLY_ACCESS: '/marketing/early-access/'
  }
}
```

## 🛠️ How to Update

Once you provide the endpoint information, we'll update:

1. **`apps/uiux/lib/api-config.ts`** - Update endpoint paths
2. **`apps/uiux/lib/marketing-api.ts`** - Update request/response handling
3. **`apps/uiux/components/cta-section.tsx`** - Already set up, just needs correct endpoint

## 📝 Quick Test

To test if your backend is accessible:

```bash
# Test basic connectivity
curl http://localhost:8000/

# Test with email (adjust endpoint as needed)
curl -X POST http://localhost:8000/YOUR_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 💡 Common Backend Patterns

### Pattern 1: Simple REST API
```
POST /api/waitlist
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "..." }
```

### Pattern 2: Versioned API
```
POST /api/v1/subscriptions
Body: { "email": "user@example.com" }
Response: { "id": "...", "status": "..." }
```

### Pattern 3: Marketing Endpoints
```
POST /marketing/waitlist
Body: { "email": "user@example.com" }
Response: { "success": true }
```

## 🚀 Once Configured

After updating the configuration:

1. Test the waitlist form on the landing page
2. Verify submissions are saved to your backend
3. Check error handling works correctly

---

**Next Step**: Please share your backend endpoint details and we'll update the integration immediately!

