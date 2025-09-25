#!/usr/bin/env python
"""
Database setup script for OASYS Platform
This script sets up the PostgreSQL database for development
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
from django.conf import settings

def setup_database():
    """Set up the database for development"""
    print("🚀 Setting up OASYS Database...")
    
    try:
        # Check if database exists
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
        
        # Run migrations
        print("📦 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate_schemas', '--shared'])
        execute_from_command_line(['manage.py', 'migrate_schemas', '--tenant'])
        
        # Create superuser (optional)
        print("👤 Creating superuser...")
        execute_from_command_line(['manage.py', 'createsuperuser', '--noinput', '--username', 'admin', '--email', 'admin@oasys.com'])
        
        print("✅ Database setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("\n📋 Manual setup instructions:")
        print("1. Make sure PostgreSQL is running")
        print("2. Create database: createdb oasysdb")
        print("3. Run: python manage.py migrate_schemas --shared")
        print("4. Run: python manage.py migrate_schemas --tenant")
        print("5. Run: python manage.py createsuperuser")

if __name__ == "__main__":
    setup_database()
