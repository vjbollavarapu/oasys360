# Test Email Configuration

## Current Status

Your SMTP environment variables are configured, but you need to switch from console backend to SMTP backend.

## Quick Fix

In your `apps/backend/.env` file, make sure you have:

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

**NOT:**
```bash
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend  # ❌ This just prints to console
```

## Test Email Sending

After updating `.env`, restart your Django server and test:

### Option 1: Django Shell Test

```bash
cd apps/backend
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

# Test email
send_mail(
    'Test Email from OASYS360',
    'This is a test email. If you receive this, SMTP is working!',
    settings.DEFAULT_FROM_EMAIL,
    ['your-email@example.com'],  # Replace with your email
    fail_silently=False,
)
print("Email sent! Check your inbox.")
```

### Option 2: Test via Signup

1. Sign up a new user at `/auth/signup`
2. Check if verification email is received
3. Email should contain:
   - Verification link
   - Subdomain login URL

### Option 3: Check Logs

If emails fail, check for errors:
```bash
tail -f apps/backend/logs/django.log
```

## Verify Configuration

Run this to verify all settings are loaded:

```bash
cd apps/backend
python manage.py shell -c "from django.conf import settings; print('EMAIL_BACKEND:', settings.EMAIL_BACKEND); print('EMAIL_HOST:', settings.EMAIL_HOST); print('EMAIL_PORT:', settings.EMAIL_PORT); print('EMAIL_USE_TLS:', settings.EMAIL_USE_TLS); print('DEFAULT_FROM_EMAIL:', settings.DEFAULT_FROM_EMAIL)"
```

Expected output for SMTP:
```
EMAIL_BACKEND: django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST: smtp.gmail.com
EMAIL_PORT: 587
EMAIL_USE_TLS: True
DEFAULT_FROM_EMAIL: noreply@oasys360.com
```

## Common Issues

### Emails Still Not Sending?

1. **Restart Django Server** - Environment variables are loaded at startup
2. **Check Gmail App Password** - Must use App Password, not regular password
3. **Check Firewall** - Port 587 must be open
4. **Check Credentials** - Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are correct

### Gmail-Specific

If using Gmail:
- ✅ Enable 2-Factor Authentication
- ✅ Generate App Password: https://myaccount.google.com/apppasswords
- ✅ Use App Password (16 characters) as EMAIL_HOST_PASSWORD
- ❌ Don't use your regular Gmail password

