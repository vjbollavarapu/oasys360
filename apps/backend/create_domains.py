#!/usr/bin/env python
"""
Create the required domains for multi-tenancy
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

def create_domains():
    """Create the required domains"""
    
    # Create the public tenant (for shared resources) - localhost
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
        print("✅ Public domain (localhost) already exists")
    except Domain.DoesNotExist:
        public_domain = Domain.objects.create(
            domain='localhost',
            tenant=public_tenant,
            is_primary=True,
        )
        print("✅ Created public domain (localhost)")
    
    # Create a sample tenant - tenant.localhost
    try:
        sample_tenant = Tenant.objects.get(schema_name='tenant1')
        print("✅ Sample tenant already exists")
    except Tenant.DoesNotExist:
        sample_tenant = Tenant.objects.create(
            schema_name='tenant1',
            name='Sample Company',
            plan='professional',
            is_active=True,
            max_users=50,
            max_storage_gb=100,
        )
        print("✅ Created sample tenant")
    
    # Create domain for sample tenant (tenant.localhost)
    try:
        sample_domain = Domain.objects.get(domain='tenant.localhost')
        print("✅ Sample domain (tenant.localhost) already exists")
    except Domain.DoesNotExist:
        sample_domain = Domain.objects.create(
            domain='tenant.localhost',
            tenant=sample_tenant,
            is_primary=True,
        )
        print("✅ Created sample domain (tenant.localhost)")
    
    print("\n🎉 Multi-tenant domain setup completed!")
    print("📋 Available domains:")
    print("   - localhost (public/multi-tenant schema)")
    print("   - tenant.localhost (tenant-specific schema)")
    print("\n💡 You can now access:")
    print("   - http://localhost:8000/ (public schema - shared resources)")
    print("   - http://tenant.localhost:8000/ (tenant schema - tenant-specific)")

if __name__ == '__main__':
    create_domains()

