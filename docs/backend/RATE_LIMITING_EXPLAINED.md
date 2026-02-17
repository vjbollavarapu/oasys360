# Rate Limiting Explained

## What is Rate Limiting?

Rate limiting is a security feature that **prevents abuse** by limiting the number of requests a client can make within a specific time window. It protects your API from:

- **DDoS attacks** (Distributed Denial of Service)
- **Brute force attacks** (repeated login attempts)
- **API abuse** (excessive requests)
- **Resource exhaustion** (overloading the server)

## Current Configuration

**Location**: `apps/backend/backend/security_middleware.py` - `RateLimitMiddleware`

**Current Settings:**
```python
max_requests = 100      # Maximum requests allowed
window_seconds = 60     # Time window (1 minute)
```

**This means:**
- ✅ **100 requests per minute** per IP address
- ❌ **Exceeding this limit** returns `HTTP 429` with message: "Rate limit exceeded. Please try again later."
- ⏱️ **Reset time**: After 60 seconds, the counter resets

## When You See This Message

You'll see "Rate limit exceeded" when:

1. **Too many requests in 1 minute** - You've made more than 100 API calls
2. **During development/testing** - Rapid testing can trigger the limit
3. **Multiple users from same IP** - Shared network (office, VPN) counts as one IP
4. **Automated scripts** - Bots or scripts making rapid requests

## Current Rate Limit Details

### Per IP Address
- **Limit**: 100 requests per minute
- **Scope**: Global (all endpoints except health checks)
- **Tracking**: Uses Redis/cache with key `rate_limit:{client_ip}`
- **Reset**: Automatic after 60 seconds

### Excluded Paths
Rate limiting is **skipped** for:
- `/health/`
- `/api/health/`
- `/static/`
- `/media/`

### Response
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```
**HTTP Status**: `429 Too Many Requests`

## Solutions

### Option 1: Increase Limit for Development

**For Development:**
```python
# In security_middleware.py
max_requests = 1000  # Increase to 1000 requests per minute
window_seconds = 60
```

**For Production:**
```python
max_requests = 100   # Keep at 100 for production
window_seconds = 60
```

### Option 2: Make Limit Environment-Based

Update `RateLimitMiddleware` to read from settings:

```python
# In security_middleware.py
from django.conf import settings

class RateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # ... existing code ...
        
        # Rate limit from settings (default: 100)
        max_requests = getattr(settings, 'RATE_LIMIT_MAX_REQUESTS', 100)
        window_seconds = getattr(settings, 'RATE_LIMIT_WINDOW_SECONDS', 60)
        
        # ... rest of code ...
```

Then in `settings.py`:
```python
# Development
if DEBUG:
    RATE_LIMIT_MAX_REQUESTS = 1000
    RATE_LIMIT_WINDOW_SECONDS = 60
else:
    # Production
    RATE_LIMIT_MAX_REQUESTS = 100
    RATE_LIMIT_WINDOW_SECONDS = 60
```

### Option 3: Disable for Development

**Temporary disable** (not recommended for production):

```python
# In security_middleware.py
from django.conf import settings

class RateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Disable in development
        if settings.DEBUG:
            return None
        
        # ... existing rate limit code ...
```

### Option 4: Add More Excluded Paths

If you want to exclude onboarding endpoints:

```python
skip_paths = [
    '/health/', 
    '/api/health/', 
    '/static/', 
    '/media/',
    '/api/v1/onboarding/',  # Add onboarding endpoints
]
```

## Recommended Settings

### Development
- **Limit**: 1000 requests/minute
- **Purpose**: Allow rapid testing without hitting limits

### Staging
- **Limit**: 500 requests/minute
- **Purpose**: Test rate limiting behavior

### Production
- **Limit**: 100 requests/minute (current)
- **Purpose**: Protect against abuse

## How to Check Your Current Rate Limit Status

The rate limit is tracked in Redis/cache. You can check it:

```python
from django.core.cache import cache

# Check current requests for an IP
client_ip = "127.0.0.1"
rate_limit_key = f"rate_limit:{client_ip}"
current_requests = cache.get(rate_limit_key, 0)
print(f"Current requests: {current_requests}/100")
```

## Best Practices

1. **Development**: Use higher limits or disable
2. **Production**: Keep limits strict (100/minute is reasonable)
3. **Per-Endpoint**: Consider different limits for different endpoints
4. **Per-User**: Consider user-based limits (not just IP-based)
5. **Graceful Degradation**: Return helpful error messages

## Troubleshooting

### Issue: Hitting limit during onboarding
**Solution**: Increase limit temporarily or exclude onboarding endpoints

### Issue: Multiple users from same IP
**Solution**: Implement user-based rate limiting (in addition to IP-based)

### Issue: Legitimate high traffic
**Solution**: Increase limit or implement tiered limits based on subscription plan

## Related Middleware

There are **two** rate limiting middlewares:

1. **`RateLimitMiddleware`** (IP-based) - Current: 100/min
2. **`TenantRateLimitMiddleware`** (Tenant-based) - Currently not implemented

You can implement tenant-based limits for more granular control.

