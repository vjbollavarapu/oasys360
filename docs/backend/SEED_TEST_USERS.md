# Seed Test Users for Development

## Overview
This document explains how to create test users in the backend for development and testing.

## Management Command

A management command has been created to seed test users:
- **Location**: `apps/backend/authentication/management/commands/create_test_users.py`
- **Usage**: `python manage.py create_test_users`

## Test Users Created

The command creates the following test users matching the frontend test accounts:

| Email | Password | Role | Tenant |
|-------|----------|------|--------|
| demo@company.com | Demo123! | Staff | Demo Corp |
| admin@vcsmy.com | Admin123! | Tenant Admin | Demo Corp |
| cfo@techflow.com | CFO123! | CFO | Demo Corp |
| admin@globalaccounting.com | Firm123! | Firm Admin | Demo Corp |
| accountant@globalaccounting.com | Account123! | Firm Staff | Demo Corp |
| platform@oasys360.com | Platform123! | Platform Admin | Demo Corp |
| admin@oasys360.com | Admin123! | Platform Admin | Demo Corp |

## How to Run

### Prerequisites
1. Backend server dependencies installed
2. Database migrations applied
3. Backend server can connect to database

### Steps

1. **Navigate to backend directory**:
   ```bash
   cd apps/backend
   ```

2. **Run the command**:
   ```bash
   python manage.py create_test_users
   ```

3. **To reset existing test users** (delete and recreate):
   ```bash
   python manage.py create_test_users --reset
   ```

### Expected Output

```
✓ Created tenant: Demo Corp
✓ Created company: Demo Corporation
✓ Created user: demo@company.com (staff)
✓ Created user: admin@oasys360.com (tenant_admin)
✓ Created user: cfo@oasys360.com (cfo)
✓ Created user: admin@globalaccounting.com (firm_admin)
✓ Created user: accountant@globalaccounting.com (firm_staff)
✓ Created user: platform@oasys360.com (platform_admin)
✓ Created user: admin@oasys360.com (platform_admin)

✓ Created 7 new users

✓ Test users ready for login!

Test Credentials:
  • demo@company.com / ***
  • admin@oasys360.com / ***
  ...
```

## Troubleshooting

### ModuleNotFoundError: No module named 'dotenv'
**Solution**: Install backend dependencies:
```bash
cd apps/backend
pip install -r requirements.txt
```

### Database connection error
**Solution**: Ensure:
1. Database is running
2. Environment variables are set (`.env` file)
3. Database migrations are applied: `python manage.py migrate`

### Command not found
**Solution**: Ensure you're in the `apps/backend` directory and Django can find the management command.

## Manual User Creation (Alternative)

If the management command doesn't work, you can manually create users via Django shell:

```python
python manage.py shell

from authentication.models import User
from tenants.models import Tenant, Company

# Create tenant
tenant = Tenant.objects.create(
    name='Demo Corp',
    slug='demo-corp',
    plan='professional',
    max_users=100,
    max_storage_gb=1000,
    features=['accounting', 'invoicing', 'banking'],
    is_active=True
)

# Create company
company = Company.objects.create(
    tenant=tenant,
    name='Demo Corporation',
    is_primary=True,
    is_active=True
)

# Create user
user = User.objects.create_user(
    email='demo@company.com',
    username='demo@company.com',
    password='Demo123!',
    first_name='Demo',
    last_name='User',
    role='staff',
    tenant=tenant
)
```

## Frontend Integration

The frontend login page (`apps/frontend/app/auth/login/page.tsx`) includes these test users in a dropdown for quick testing. After seeding the backend, these accounts will work for login.

## Notes

- All test users are created with `is_active=True`
- Passwords are properly hashed using Django's password hashing
- Users are associated with the "Demo Corp" tenant
- The command is idempotent - running it multiple times won't create duplicates (unless using `--reset`)

