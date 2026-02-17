# Email SMTP Configuration Guide

This guide explains how to configure SMTP email settings for the OASYS360 backend.

---

## 📍 Where to Add Environment Variables

### 1. **Create/Update `.env` file**

Create a `.env` file in the `apps/backend/` directory (or update existing one):

```bash
cd apps/backend
cp env.example .env
# Then edit .env with your actual values
```

### 2. **Required Environment Variables**

Add these variables to your `.env` file:

```bash
# Email Backend
# Development: Use console backend (emails print to terminal)
# Production: Use SMTP backend
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

# SMTP Server Configuration
EMAIL_HOST=smtp.gmail.com          # Your SMTP server
EMAIL_PORT=587                      # Port (587 for TLS, 465 for SSL)
EMAIL_USE_TLS=True                  # Use TLS encryption
EMAIL_USE_SSL=False                 # Use SSL (set True if using port 465)

# SMTP Authentication
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Email Sender
DEFAULT_FROM_EMAIL=noreply@oasys360.com

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:3000

# Admin Email
ADMIN_EMAIL=admin@oasys360.com
```

---

## 🔧 Configuration Details

### Email Backend Options

1. **Console Backend (Development)**
   ```bash
   EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
   ```
   - Emails are printed to the console/terminal
   - No actual emails are sent
   - Useful for local development

2. **SMTP Backend (Production)**
   ```bash
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   ```
   - Sends actual emails via SMTP server
   - Requires SMTP credentials

3. **File Backend (Testing)**
   ```bash
   EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
   EMAIL_FILE_PATH=/path/to/emails
   ```
   - Saves emails to files
   - Useful for testing

### SMTP Server Examples

#### Gmail
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Use App Password, not regular password
```

**Note:** For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (16 characters) as `EMAIL_HOST_PASSWORD`

#### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

#### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-aws-ses-smtp-username
EMAIL_HOST_PASSWORD=your-aws-ses-smtp-password
```

#### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-mailgun-smtp-username
EMAIL_HOST_PASSWORD=your-mailgun-smtp-password
```

#### Custom SMTP Server
```bash
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-username
EMAIL_HOST_PASSWORD=your-password
```

---

## 📝 Settings File Location

The email configuration is loaded in:
- **File:** `apps/backend/backend/settings.py`
- **Lines:** 564-576

The settings automatically read from environment variables using `os.getenv()`.

---

## ✅ Testing Email Configuration

### 1. Test via Django Shell

```bash
cd apps/backend
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email',
    'This is a test email from OASYS360',
    settings.DEFAULT_FROM_EMAIL,
    ['your-email@example.com'],
    fail_silently=False,
)
```

### 2. Test via Signup Flow

1. Sign up a new user
2. Check if verification email is sent
3. Check email inbox (or console if using console backend)

### 3. Check Logs

If emails fail, check Django logs:
```bash
tail -f apps/backend/logs/django.log
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file to Git**
   - `.env` is already in `.gitignore`
   - Use `env.example` as a template

2. **Use App Passwords for Gmail**
   - Don't use your regular Gmail password
   - Generate App Passwords from Google Account settings

3. **Use Environment-Specific Values**
   - Development: Console backend
   - Staging: SMTP with test credentials
   - Production: SMTP with production credentials

4. **Rotate Credentials Regularly**
   - Change SMTP passwords periodically
   - Update environment variables accordingly

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
   ```bash
   # Verify variables are loaded
   python manage.py shell
   >>> from django.conf import settings
   >>> print(settings.EMAIL_HOST)
   >>> print(settings.EMAIL_HOST_USER)
   ```

2. **Check SMTP Credentials**
   - Verify username and password are correct
   - For Gmail, ensure App Password is used

3. **Check Firewall/Network**
   - Ensure port 587 or 465 is not blocked
   - Check if SMTP server allows connections from your IP

4. **Check Email Backend**
   ```bash
   # Verify backend is set correctly
   python manage.py shell
   >>> from django.conf import settings
   >>> print(settings.EMAIL_BACKEND)
   ```

5. **Enable Debug Logging**
   ```python
   # In settings.py, temporarily add:
   LOGGING = {
       'version': 1,
       'handlers': {
           'console': {
               'class': 'logging.StreamHandler',
           },
       },
       'loggers': {
           'django.core.mail': {
               'handlers': ['console'],
               'level': 'DEBUG',
           },
       },
   }
   ```

### Common Errors

**"SMTPAuthenticationError: (535, '5.7.8 Username and Password not accepted')"**
- Wrong credentials
- For Gmail: Use App Password, not regular password
- Check if 2FA is enabled (required for App Passwords)

**"SMTPConnectError: [Errno 61] Connection refused"**
- SMTP server is down
- Wrong host/port
- Firewall blocking connection

**"SMTPServerDisconnected: Connection unexpectedly closed"**
- Wrong TLS/SSL settings
- Try switching `EMAIL_USE_TLS` and `EMAIL_USE_SSL`

---

## 📚 Additional Resources

- [Django Email Documentation](https://docs.djangoproject.com/en/stable/topics/email/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [AWS SES SMTP Setup](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)

