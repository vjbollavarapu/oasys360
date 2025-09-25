"""
Management command to set up Django Groups for multi-tenant user classification
Following the Multi-Tenant Implementation Guide pattern
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from authentication.utils import setup_user_groups


class Command(BaseCommand):
    help = 'Set up Django Groups for multi-tenant user classification'

    def handle(self, *args, **options):
        self.stdout.write('Setting up multi-tenant user groups...')
        
        try:
            # Create the required groups
            multi_tenant_group, tenant_group = setup_user_groups()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created groups: {multi_tenant_group.name}, {tenant_group.name}'
                )
            )
            
            # Display group information
            self.stdout.write('\nGroup Details:')
            self.stdout.write(f'- Multi-Tenant Group: {multi_tenant_group.name}')
            self.stdout.write(f'- Tenant Group: {tenant_group.name}')
            
            # Show existing users in each group
            multi_tenant_users = multi_tenant_group.user_set.all()
            tenant_users = tenant_group.user_set.all()
            
            self.stdout.write(f'\nMulti-Tenant Users ({multi_tenant_users.count()}):')
            for user in multi_tenant_users:
                self.stdout.write(f'  - {user.email} ({user.get_full_name()})')
            
            self.stdout.write(f'\nTenant Users ({tenant_users.count()}):')
            for user in tenant_users:
                self.stdout.write(f'  - {user.email} ({user.get_full_name()})')
            
            self.stdout.write(
                self.style.SUCCESS('\nMulti-tenant groups setup completed successfully!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error setting up groups: {str(e)}')
            )
