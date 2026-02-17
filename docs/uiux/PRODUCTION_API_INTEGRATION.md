# 🔌 Production API Integration

**Date**: 2025-12-07  
**Status**: ✅ Configured

---

## 📊 Configuration

### Production Backend
- **API Base URL**: `https://api.oasys360.com`
- **API URL**: `https://api.oasys360.com/api`

### Environment Variables Set in Vercel

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.oasys360.com
NEXT_PUBLIC_API_URL=https://api.oasys360.com/api
NEXT_PUBLIC_SITE_URL=https://uiux-18cwwvakf-vjbollavarapu-8ded34df.vercel.app
```

---

## ✅ What's Configured

1. **API Configuration** (`lib/api-config.ts`)
   - Uses `NEXT_PUBLIC_API_BASE_URL` environment variable
   - Falls back to `https://api.oasys360.com` for production
   - Production URL configured: `https://api.oasys360.com`

2. **API Client** (`lib/api-client.ts`)
   - Configured with retry logic (3 retries, exponential backoff)
   - Error handling for network/5xx errors
   - Timeout: 10 seconds

3. **Marketing API Service** (`lib/marketing-api.ts`)
   - Waitlist join endpoint
   - Contact form submission
   - Status checking

---

## 🧪 Testing

### Test from Browser Console (After Deployment)

Once deployed, test from browser console on production site:

```javascript
// Test waitlist join
fetch('https://api.oasys360.com/api/waitlist/join/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

### Manual Testing Checklist

- [ ] Waitlist form submission works
- [ ] Success message displays correctly
- [ ] Error handling works (test with invalid email)
- [ ] API responses are received
- [ ] CORS is configured correctly on backend

---

## 🔧 Backend CORS Configuration

Make sure your backend (`https://api.oasys360.com`) allows requests from your Vercel domain:

```python
# Django CORS settings example
CORS_ALLOWED_ORIGINS = [
    "https://uiux-18cwwvakf-vjbollavarapu-8ded34df.vercel.app",
    "https://your-custom-domain.com",  # Add your custom domain
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['GET', 'POST', 'OPTIONS']
CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization']
```

---

## 🔄 Redeploy Required

After setting environment variables, you **must redeploy** for them to take effect:

```bash
vercel --prod --yes
```

Or via Vercel Dashboard:
1. Go to Deployments
2. Click "Redeploy" on latest deployment
3. Environment variables will be included

---

## 📝 API Endpoints

### Waitlist
- **POST** `/api/waitlist/join/` - Join waitlist
- **GET** `/api/waitlist/status/{email}/` - Check status
- **GET** `/api/waitlist/entries/stats/` - Get statistics

### Contact Forms
- **POST** `/api/contacts/submit/` - Submit contact form

### Newsletter
- **POST** `/api/newsletter/subscribe/` - Subscribe to newsletter

---

## ✅ Next Steps

1. ✅ Environment variables set in Vercel
2. ⏳ Redeploy application (`vercel --prod --yes`)
3. ⏳ Test waitlist form on production site
4. ⏳ Verify CORS is configured on backend
5. ⏳ Test error handling

---

**Last Updated**: 2025-12-07

