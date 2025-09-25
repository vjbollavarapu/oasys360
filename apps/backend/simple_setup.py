#!/usr/bin/env python
"""
Simple script to set up the initial tenant and domain
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tenants.models import Tenant, Domain

def setup_tenant():
    """Set up the initial tenant and domain"""
    
    # Create the public tenant (for shared resources)
    try:
        public_tenant = Tenant.objects.get(schema_name='public')
        print("✅ Public tenant already exists")
    except Tenant.DoesNotExist:
        public_tenant = Tenant.objects.create(
            schema_name='public',
            name='Public Tenant',
            plan='enterprise',
            is_active=True,
            max_users=1000,
            max_storage_gb=1000,
        )
        print("✅ Created public tenant")
    
    # Create domain for public tenant (localhost)
    try:
        public_domain = Domain.objects.get(domain='localhost')
        print("✅ Public domain already exists")
    except Domain.DoesNotExist:
        public_domain = Domain.objects.create(
            domain='localhost',
            tenant=public_tenant,
            is_primary=True,
        )
        print("✅ Created public domain (localhost)")
    
    print("\n🎉 Basic tenant setup completed!")
    print("📋 Available domains:")
    print("   - localhost (public/shared)")
    print("\n💡 You can now access:")
    print("   - http://localhost:8000/ (public schema)")

if __name__ == '__main__':
    setup_tenant()
