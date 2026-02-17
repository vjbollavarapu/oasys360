# Seeded Test User Credentials

Use these credentials to sign in at `/auth/login`.  
**Password for all seeded users:** `Pass123456`  
**2FA (testing):** use code `123456` when prompted.

| Role            | Email                           | Tenant                  |
|-----------------|----------------------------------|-------------------------|
| Staff           | demo@company.com                 | Demo Corp               |
| Tenant Admin    | admin@oasys360.com              | oasys360 Solutions      |
| CFO             | cfo@oasys360.com                | oasys360 Solutions      |
| Firm Admin      | admin@globalaccounting.com      | Global Accounting Firm  |
| Accountant      | accountant@globalaccounting.com | Global Accounting Firm  |
| Platform Admin  | platform@oasys360.com           | oasys360 Solutions      |

**Backend seed:** Run from `apps/backend`: `python manage.py create_test_users` (or `reset_and_seed --no-input` to empty DB and re-seed). All seeded users use password **Pass123456**.
