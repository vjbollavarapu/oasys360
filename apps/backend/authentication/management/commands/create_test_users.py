"""
Management command to create test users for development
Usage: python manage.py create_test_users
All seeded users have password: Pass123456
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tenants.models import Tenant, Company

User = get_user_model()

# Single password for all seeded users (per requirement)
SEED_PASSWORD = 'Pass123456'


def get_or_create_tenant(name, slug):
    return Tenant.objects.get_or_create(
        name=name,
        defaults={
            'slug': slug,
            'plan': 'professional',
            'max_users': 100,
            'max_storage_gb': 1000,
            'features': [
                'accounting', 'invoicing', 'banking', 'sales', 'purchase',
                'inventory', 'reports', 'ai_processing', 'web3_integration',
            ],
            'is_active': True,
            'onboarding_status': 'COMPLETED',
        }
    )


class Command(BaseCommand):
    help = 'Create test users for all roles (password: Pass123456)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing test users before creating new ones',
        )

    def handle(self, *args, **options):
        if options['reset']:
            test_emails = [
                'demo@company.com',
                'admin@oasys360.com',
                'cfo@oasys360.com',
                'admin@globalaccounting.com',
                'accountant@globalaccounting.com',
                'platform@oasys360.com',
            ]
            deleted = User.objects.filter(email__in=test_emails).delete()
            self.stdout.write(
                self.style.WARNING(f'Deleted {deleted[0]} existing test users')
            )

        # Tenants: Demo Corp, oasys360 Solutions, Global Accounting Firm
        tenant_demo, _ = get_or_create_tenant('Demo Corp', 'demo-corp')
        tenant_oasys, _ = get_or_create_tenant('oasys360 Solutions', 'oasys360-solutions')
        tenant_firm, _ = get_or_create_tenant('Global Accounting Firm', 'global-accounting-firm')

        for tenant in (tenant_demo, tenant_oasys, tenant_firm):
            Company.objects.get_or_create(
                tenant=tenant,
                name=f'{tenant.name} Primary',
                defaults={'is_primary': True, 'is_active': True},
            )

        # One user per role; unique email each; all password Pass123456
        # email_verified=True so seeded users can log in without a verification link
        test_users = [
            {
                'email': 'demo@company.com',
                'username': 'demo@company.com',
                'first_name': 'Demo',
                'last_name': 'User',
                'role': 'staff',
                'tenant': tenant_demo,
                'email_verified': True,
                'corporate_email_verified': True,
            },
            {
                'email': 'admin@oasys360.com',
                'username': 'admin@oasys360.com',
                'first_name': 'Tenant',
                'last_name': 'Admin',
                'role': 'tenant_admin',
                'tenant': tenant_oasys,
                'email_verified': True,
                'corporate_email_verified': True,
            },
            {
                'email': 'cfo@oasys360.com',
                'username': 'cfo@oasys360.com',
                'first_name': 'CFO',
                'last_name': 'User',
                'role': 'cfo',
                'tenant': tenant_oasys,
                'email_verified': True,
                'corporate_email_verified': True,
            },
            {
                'email': 'admin@globalaccounting.com',
                'username': 'admin@globalaccounting.com',
                'first_name': 'Firm',
                'last_name': 'Admin',
                'role': 'firm_admin',
                'tenant': tenant_firm,
                'email_verified': True,
                'corporate_email_verified': True,
            },
            {
                'email': 'accountant@globalaccounting.com',
                'username': 'accountant@globalaccounting.com',
                'first_name': 'Accountant',
                'last_name': 'User',
                'role': 'accountant',
                'tenant': tenant_firm,
                'email_verified': True,
                'corporate_email_verified': True,
            },
            {
                'email': 'platform@oasys360.com',
                'username': 'platform@oasys360.com',
                'first_name': 'Platform',
                'last_name': 'Admin',
                'role': 'platform_admin',
                'tenant': tenant_oasys,
                'email_verified': True,
                'corporate_email_verified': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for user_data in test_users:
            email = user_data['email']
            user, created = User.objects.get_or_create(
                email=email,
                defaults=user_data,
            )
            user.set_password(SEED_PASSWORD)
            user.is_active = True
            user.email_verified = True
            user.corporate_email_verified = True
            user.save()
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {email} ({user.get_role_display()})')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated: {email} ({user.get_role_display()})')
                )

        self.stdout.write(self.style.SUCCESS(f'\n✓ Created {created_count} new users, updated {updated_count}'))
        self.stdout.write(self.style.SUCCESS('\n✓ All seeded users use password: Pass123456'))
        self.stdout.write('\nSeeded credentials (email / Pass123456):')
        for u in test_users:
            self.stdout.write(f"  • {u['email']} — {u['role']}")
