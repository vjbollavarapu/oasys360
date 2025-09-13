#!/usr/bin/env python
"""
Script to set up the initial tenant and domain for multi-tenancy
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
    public_tenant, created = Tenant.objects.get_or_create(
        schema_name='public',
        defaults={
            'name': 'Public Tenant',
            'plan': 'enterprise',
            'is_active': True,
            'max_users': 1000,
            'max_storage_gb': 1000,
        }
    )
    
    if created:
        print("✅ Created public tenant")
    else:
        print("✅ Public tenant already exists")
    
    # Create domain for public tenant (localhost)
    public_domain, created = Domain.objects.get_or_create(
        domain='localhost',
        defaults={
            'tenant': public_tenant,
            'is_primary': True,
        }
    )
    
    if created:
        print("✅ Created public domain (localhost)")
    else:
        print("✅ Public domain already exists")
    
    # Create a sample tenant
    sample_tenant, created = Tenant.objects.get_or_create(
        schema_name='tenant1',
        defaults={
            'name': 'Sample Company',
            'plan': 'professional',
            'is_active': True,
            'max_users': 50,
            'max_storage_gb': 100,
        }
    )
    
    if created:
        print("✅ Created sample tenant")
    else:
        print("✅ Sample tenant already exists")
    
    # Create domain for sample tenant
    sample_domain, created = Domain.objects.get_or_create(
        domain='tenant.localhost',
        defaults={
            'tenant': sample_tenant,
            'is_primary': True,
        }
    )
    
    if created:
        print("✅ Created sample domain (tenant.localhost)")
    else:
        print("✅ Sample domain already exists")
    
    print("\n🎉 Multi-tenant setup completed!")
    print("📋 Available domains:")
    print("   - localhost (public/shared)")
    print("   - tenant.localhost (sample tenant)")
    print("\n💡 You can now access:")
    print("   - http://localhost:8000/ (public schema)")
    print("   - http://tenant.localhost:8000/ (tenant schema)")

if __name__ == '__main__':
    setup_tenant()
