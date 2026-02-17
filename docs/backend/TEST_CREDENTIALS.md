# Test Credentials Verification

## ✅ All Credentials Match Between Frontend and Backend

All test user credentials in the frontend dropdown match the backend seed command.

| # | Email | Password | Frontend Role | Backend Role | Status |
|---|-------|----------|---------------|--------------|--------|
| 1 | demo@company.com | Demo123! | Staff | staff | ✅ Match |
| 2 | admin@oasys360.com | Admin123! | Tenant Admin | tenant_admin | ✅ Match |
| 3 | cfo@oasys360.com | CFO123! | CFO | cfo | ✅ Match |
| 4 | admin@globalaccounting.com | Firm123! | Firm Admin | firm_admin | ✅ Match |
| 5 | accountant@globalaccounting.com | Account123! | Firm Staff | accountant | ✅ Match* |
| 6 | platform@oasys360.com | Platform123! | Platform Admin | platform_admin | ✅ Match |
| 7 | admin@oasys360.com | Admin123! | Legacy Admin | platform_admin | ✅ Match |

\* Note: Frontend displays "Firm Staff" but backend uses role `accountant` (which is the correct role value in the User model).

## Backend User Model Roles

The backend User model defines these role choices:
- `platform_admin` - Platform Admin
- `tenant_admin` - Tenant Admin
- `firm_admin` - Firm Admin
- `cfo` - CFO
- `accountant` - Accountant
- `staff` - Staff

## How to Verify

### 1. Check if users exist in database:
```bash
cd apps/backend
python manage.py shell

from authentication.models import User
User.objects.values_list('email', 'role', 'is_active')
```

### 2. Test login via API:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@company.com","password":"Demo123!"}'
```

### 3. Test login via frontend:
- Go to http://localhost:3000/auth/login
- Select a user from the dropdown
- Enter password: Demo123! (or the corresponding password)
- Enter 2FA code: 123456
- Click "Verify & Sign In"

## Troubleshooting

### Login fails with "Invalid email or password"
1. **Check if users exist**: Run `python manage.py create_test_users`
2. **Check user is active**: In Django shell: `User.objects.get(email='demo@company.com').is_active`
3. **Check password**: Password should be hashed in database, verify via: `User.objects.get(email='demo@company.com').check_password('Demo123!')`

### Login fails with "User account is disabled"
- User's `is_active` field is `False`
- Fix: Run `create_test_users --reset` or manually set `is_active=True`

### Role mismatch errors
- Frontend display names don't need to match backend role values exactly
- The backend uses lowercase with underscores (e.g., `tenant_admin`)
- Frontend can display user-friendly names (e.g., "Tenant Admin")

## Notes

- All passwords are properly hashed using Django's password hashing
- All users are created with `is_active=True` by default
- All users belong to the "Demo Corp" tenant
- The 2FA code for testing is always: `123456`

