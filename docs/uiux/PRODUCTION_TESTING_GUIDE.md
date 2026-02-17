# 🧪 Production API Testing Guide

**Date**: 2025-12-07  
**Backend**: https://api.oasys360.com  
**Frontend**: https://uiux-lfjd0mttb-vjbollavarapu-8ded34df.vercel.app

---

## ✅ Deployment Status

- **Status**: ✅ Deployed successfully
- **Build**: ✅ Completed without errors
- **Environment Variables**: ✅ All set

---

## 🧪 How to Test

### Method 1: Test Page (Recommended)

1. Visit: **https://uiux-lfjd0mttb-vjbollavarapu-8ded34df.vercel.app/test-api**
2. The page shows current API configuration
3. Click test buttons for each endpoint:
   - Waitlist Join Test
   - Contact Form Test
   - Stats Endpoint Test
4. Verify responses show success ✅ or error ❌

### Method 2: Test Main Landing Page Forms

1. Visit production URL
2. Scroll to CTA section (bottom of page)
3. Submit waitlist form with a test email
4. Verify:
   - Form submits without error
   - Success message appears
   - No console errors

### Method 3: Browser Console Test

Open browser DevTools Console on production site:

```javascript
// Test 1: Check API Config
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Test 2: Direct API Call
fetch('https://api.oasys360.com/api/waitlist/join/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

### Method 4: Network Tab

1. Open browser DevTools → Network tab
2. Submit waitlist form on production site
3. Look for request to: `https://api.oasys360.com/api/waitlist/join/`
4. Check:
   - Status code (200/201 = success)
   - Response body
   - Request headers

---

## 🔍 What to Check

### ✅ Success Indicators

- Form submits without error
- Success toast/message appears
- Network request returns 200/201 status
- No CORS errors in console
- Response contains expected data structure

### ❌ Common Issues

1. **CORS Error**: Backend needs to allow your Vercel domain
2. **404 Error**: API endpoint path incorrect
3. **500 Error**: Backend server error
4. **Network Error**: Backend not accessible or SSL issues
5. **Timeout**: Backend taking too long to respond

---

## 🔧 Troubleshooting

### Issue: CORS Error

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**: Configure CORS on backend to allow your Vercel domain:
```python
CORS_ALLOWED_ORIGINS = [
    "https://uiux-lfjd0mttb-vjbollavarapu-8ded34df.vercel.app",
]
```

### Issue: API Not Found (404)

**Check**:
- API endpoint path in `lib/api-config.ts`
- Backend URL structure matches frontend expectations
- Backend has the endpoint configured

### Issue: Environment Variables Not Working

**Solution**:
1. Verify in Vercel Dashboard → Settings → Environment Variables
2. Redeploy: `vercel --prod --yes`
3. Check browser console for actual API URL being used

---

## 📊 Expected API Responses

### Waitlist Join (Success)
```json
{
  "success": true,
  "message": "Successfully joined waitlist",
  "data": {
    "request_id": "...",
    "email": "test@example.com"
  }
}
```

### Contact Form (Success)
```json
{
  "success": true,
  "message": "Contact form submitted",
  "data": {
    "inquiry_id": "..."
  }
}
```

---

## ✅ Testing Checklist

- [ ] Test page (`/test-api`) loads
- [ ] API configuration shows correct URL
- [ ] Waitlist join test succeeds
- [ ] Contact form test succeeds
- [ ] Main landing page form works
- [ ] Success messages display correctly
- [ ] Error handling works (test with invalid data)
- [ ] Network tab shows correct requests
- [ ] No CORS errors
- [ ] No console errors

---

## 📝 Next Steps After Testing

1. **If All Tests Pass**:
   - ✅ Integration successful!
   - Remove or protect `/test-api` page (optional)
   - Monitor form submissions

2. **If Tests Fail**:
   - Check CORS configuration on backend
   - Verify API endpoints are correct
   - Check backend logs
   - Verify SSL certificates

---

**Test Page**: https://uiux-lfjd0mttb-vjbollavarapu-8ded34df.vercel.app/test-api  
**Production Site**: https://uiux-lfjd0mttb-vjbollavarapu-8ded34df.vercel.app

**Last Updated**: 2025-12-07

