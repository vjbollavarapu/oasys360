# Reset Database and Seed Test Data

## Quick Reset Command

Use the management command to reset the database and seed fresh test data:

```bash
cd apps/backend
python manage.py reset_and_seed
```

This command will:
1. ✅ Flush all existing data from the database
2. ✅ Run all migrations to recreate tables
3. ✅ Seed test users and data

## Options

### Skip confirmation prompt:
```bash
python manage.py reset_and_seed --no-input
```

### Keep existing migrations (just flush data):
```bash
python manage.py reset_and_seed --keep-migrations
```

## Manual Reset Steps

If you prefer to reset manually:

### For PostgreSQL:
```bash
cd apps/backend

# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS oasysdb;"
psql -U postgres -c "CREATE DATABASE oasysdb;"

# Run migrations
python manage.py migrate

# Seed test users
python manage.py create_test_users
```

### For SQLite (development):
```bash
cd apps/backend

# Delete database file
rm db.sqlite3

# Run migrations
python manage.py migrate

# Seed test users
python manage.py create_test_users
```

## What Gets Seeded

After running `reset_and_seed`, you'll have:

1. **Demo Corp Tenant** with full features enabled
2. **Demo Corporation** as the primary company
3. **7 Test Users** with various roles:
   - `demo@company.com` (Staff)
   - `admin@techflow.com` (Tenant Admin)
   - `cfo@techflow.com` (CFO)
   - `admin@globalaccounting.com` (Firm Admin)
   - `accountant@globalaccounting.com` (Accountant)
   - `platform@oasys360.com` (Platform Admin)
   - `admin@oasys360.com` (Platform Admin)

All users have password: `Demo123!`, `Admin123!`, etc. (see TEST_CREDENTIALS.md)

## Troubleshooting

### Error: "database is being accessed by other users"
**Solution**: Make sure Django server is stopped before resetting:
```bash
# Stop Django server (Ctrl+C)
# Then run reset
python manage.py reset_and_seed
```

### Error: "permission denied"
**Solution**: Ensure database user has proper permissions or use superuser:
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS oasysdb;"
psql -U postgres -c "CREATE DATABASE oasysdb;"
```

### Error: "ModuleNotFoundError: No module named 'dotenv'"
**Solution**: Install backend dependencies:
```bash
cd apps/backend
pip install -r requirements.txt
```

## Notes

- ⚠️ **WARNING**: This command will delete ALL data in the database
- ✅ All test users will be created with `is_active=True`
- ✅ Passwords are properly hashed
- ✅ All users belong to "Demo Corp" tenant
- ✅ 2FA code for testing: `123456`

