# UIUX Backend API Integration

> Guide for integrating the landing page with the Django backend API

## 📋 Overview

The landing page (`apps/uiux`) is now integrated with the Django backend API running at `http://localhost:8000`.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in `apps/uiux/` (or use environment variables):

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See `env.example` for all available variables.

## 📡 API Endpoints

### Marketing Forms (Public, No Auth Required)

#### Early Access / Waitlist
- **POST** `/api/v1/marketing/early-access/`
- **Body**: 
  ```json
  {
    "email": "user@company.com",
    "name": "John Doe" (optional),
    "company": "Company Inc" (optional),
    "role": "ceo" (optional),
    "company_size": "1-10" (optional),
    "industry": "technology" (optional),
    "current_challenges": "..." (optional),
    "timeline": "immediately" (optional),
    "expectations": "..." (optional)
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Early access request submitted successfully",
    "request_id": "uuid"
  }
  ```

#### Beta Program Application
- **POST** `/api/v1/marketing/beta-program/`
- **Body**: See backend serializers for full schema

#### Contact Sales
- **POST** `/api/v1/contact_sales/contact-sales/`
- **Body**: See backend serializers for full schema

### Stats
- **GET** `/api/v1/marketing/stats/` - Get marketing forms statistics

## 🏗️ Architecture

### File Structure
```
apps/uiux/
├── lib/
│   ├── api-config.ts       # API endpoint configuration
│   ├── api-client.ts       # Axios client with error handling
│   └── marketing-api.ts    # Marketing forms service layer
├── components/
│   └── cta-section.tsx     # Waitlist form (integrated)
└── env.example             # Environment variables template
```

### API Client Features

1. **Automatic Error Handling**
   - Network errors
   - HTTP status errors
   - Request timeouts

2. **Structured Responses**
   - Consistent response format
   - Success/error indicators
   - Error messages

3. **Development Logging**
   - Request logging in development mode
   - Error logging

## 💻 Usage

### In Components

```typescript
import { marketingApi } from '@/lib/marketing-api'

// Submit waitlist entry
const response = await marketingApi.submitEarlyAccess({
  email: 'user@company.com',
  name: 'John Doe', // optional
  company: 'Company Inc', // optional
})

if (response.success) {
  console.log('Success:', response.message)
  console.log('Request ID:', response.data?.request_id)
} else {
  console.error('Error:', response.message)
}
```

### Error Handling

```typescript
try {
  const response = await marketingApi.submitEarlyAccess({ email })
  // Handle success
} catch (error: any) {
  // Error is already formatted by API client
  console.error(error.message)
  console.error(error.errors) // Validation errors if any
  console.error(error.status) // HTTP status code
}
```

## ✅ Integration Status

### Completed ✅
- [x] API client setup (axios)
- [x] API configuration
- [x] Marketing API service
- [x] CTA form integration (waitlist)
- [x] Error handling
- [x] Toast notifications
- [x] Environment variable configuration

### Ready for Integration
- [ ] Contact sales form (backend endpoint ready)
- [ ] Beta program form (backend endpoint ready)
- [ ] Founder feedback form (backend endpoint ready)

## 🧪 Testing

### Manual Testing

1. Start backend:
   ```bash
   cd apps/backend
   python manage.py runserver
   ```

2. Start uiux:
   ```bash
   cd apps/uiux
   npm run dev
   ```

3. Test waitlist form:
   - Navigate to landing page
   - Fill in email in CTA section
   - Submit and verify:
     - Success toast appears
     - Entry is created in backend
     - Check backend admin: `/admin/marketing_forms/earlyaccessrequest/`

### API Testing

Check backend health:
```bash
curl http://localhost:8000/health/
```

Test waitlist endpoint:
```bash
curl -X POST http://localhost:8000/api/v1/marketing/early-access/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🔒 Security

- ✅ Public endpoints (no authentication required)
- ✅ CORS configured for localhost:3000
- ✅ Client-side validation
- ✅ Server-side validation (backend)
- ✅ Rate limiting (backend)

## 📝 Notes

- All marketing endpoints are public (no auth required)
- The API client automatically handles errors and formatting
- Environment variables are prefixed with `NEXT_PUBLIC_` for client-side access
- CORS is configured in backend to allow requests from the landing page

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend CORS is configured (already done)
- Check `ALLOWED_HOSTS` in backend settings
- Verify `NEXT_PUBLIC_API_URL` is correct

### Network Errors
- Verify backend is running on port 8000
- Check API URL in `.env.local`
- Ensure backend is accessible from browser

### Validation Errors
- Check backend serializer requirements
- Verify field names match backend expectations
- Review error messages from API response

---

**Last Updated**: 2025-12-07

