# Database Setup Guide for OASYS Platform

## Prerequisites

1. **PostgreSQL** must be installed and running
2. **Python virtual environment** activated
3. **Environment variables** configured

## Quick Setup

### 1. Install PostgreSQL (if not already installed)

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE oasysdb;

# Create user (optional)
CREATE USER oasys_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE oasysdb TO oasys_user;

# Exit psql
\q
```

### 3. Configure Environment Variables

Update your `.env` file with correct database credentials:

```env
DATABASE_NAME=oasysdb
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### 4. Run Django Setup

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate_schemas --shared
python manage.py migrate_schemas --tenant

# Create superuser
python manage.py createsuperuser
```

### 5. Test Database Connection

```bash
# Test Django configuration
python manage.py check

# Test database connection
python manage.py dbshell
```

## Troubleshooting

### Common Issues

1. **Connection refused:**
   - Ensure PostgreSQL is running
   - Check if port 5432 is available
   - Verify database credentials

2. **Permission denied:**
   - Check database user permissions
   - Ensure user has CREATE privileges

3. **Database does not exist:**
   - Create the database manually
   - Check database name in settings

### Alternative: Use SQLite for Development

If PostgreSQL setup is complex, you can temporarily use SQLite:

1. Update `backend/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

2. Run migrations:
```bash
python manage.py migrate
```

## Production Setup

For production, use PostgreSQL with proper security:

1. **Strong passwords**
2. **SSL connections**
3. **Limited user permissions**
4. **Regular backups**
5. **Connection pooling**

## Next Steps

After database setup:
1. ✅ Configure CORS settings
2. ✅ Set up environment variables
3. ✅ Configure API endpoints
4. ✅ Set up local development database
5. 🔄 Install and configure Axios in frontend
6. 🔄 Set up API client with interceptors
7. 🔄 Configure request/response transformers
8. 🔄 Set up error handling middleware
