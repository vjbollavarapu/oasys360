#!/usr/bin/env python
"""
Database setup script for OASYS Platform (row-based multi-tenancy).
- Initial setup: migrations + seed users (all roles, password: Pass123456).
- To EMPTY the database and re-run seed: use reset_and_seed instead (see below).
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def setup_database():
    """Run migrations and create seed users (password: Pass123456)."""
    print("🚀 Setting up OASYS Database...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")

        print("📦 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        print("✅ Migrations done")

        print("👤 Creating seed users (all roles, password: Pass123456)...")
        execute_from_command_line(['manage.py', 'create_test_users'])
        print("✅ Database setup completed successfully!")
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("\n📋 Manual setup:")
        print("  1. Ensure PostgreSQL is running and DB exists (e.g. createdb oasysdb)")
        print("  2. python manage.py migrate --noinput")
        print("  3. python manage.py create_test_users")
        print("\n📋 To EMPTY the database and re-seed from scratch:")
        print("  From apps/backend: python manage.py reset_and_seed --no-input")

if __name__ == "__main__":
    setup_database()
