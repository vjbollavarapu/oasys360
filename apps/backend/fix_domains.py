#!/usr/bin/env python
"""
Fix domain configuration for django-tenants
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

def fix_domains():
    """Fix domain configuration"""
    
    # Delete existing domains and tenants to start fresh
    Domain.objects.all().delete()
    Tenant.objects.all().delete()
    
    # Create the public tenant (for shared resources)
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
    public_domain = Domain.objects.create(
        domain='localhost',
        tenant=public_tenant,
        is_primary=True,
    )
    print("✅ Created public domain (localhost)")
    
    # Create a sample tenant
    sample_tenant = Tenant.objects.create(
        schema_name='tenant1',
        name='Sample Company',
        plan='professional',
        is_active=True,
        max_users=50,
        max_storage_gb=100,
    )
    print("✅ Created sample tenant")
    
    # Create domain for sample tenant
    sample_domain = Domain.objects.create(
        domain='tenant.localhost',
        tenant=sample_tenant,
        is_primary=True,
    )
    print("✅ Created sample domain (tenant.localhost)")
    
    print("\n🎉 Multi-tenant setup completed!")
    print("📋 Available domains:")
    print("   - localhost (public/shared)")
    print("   - tenant.localhost (sample tenant)")
    print("\n💡 You can now access:")
    print("   - http://localhost:8000/ (public schema)")
    print("   - http://tenant.localhost:8000/ (tenant schema)")

if __name__ == '__main__':
    fix_domains()

