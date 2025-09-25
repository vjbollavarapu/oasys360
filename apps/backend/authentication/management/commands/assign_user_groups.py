"""
Management command to assign users to appropriate groups based on their roles
Following the Multi-Tenant Implementation Guide pattern
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from authentication.models import User
from authentication.utils import assign_user_to_group, detect_user_type


class Command(BaseCommand):
    help = 'Assign users to appropriate groups based on their roles'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email of specific user to assign to group'
        )
        parser.add_argument(
            '--group',
            type=str,
            choices=['Multi-Tenant', 'Tenant'],
            help='Specific group to assign user to'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Assign all users to appropriate groups'
        )

    def handle(self, *args, **options):
        self.stdout.write('Assigning users to multi-tenant groups...')
        
        try:
            # Get or create groups
            multi_tenant_group, created = Group.objects.get_or_create(name='Multi-Tenant')
            tenant_group, created = Group.objects.get_or_create(name='Tenant')
            
            if options['user_email']:
                # Assign specific user
                try:
                    user = User.objects.get(email=options['user_email'])
                    self.assign_user_to_group(user, options['group'])
                except User.DoesNotExist:
                    self.stdout.write(
                        self.style.ERROR(f'User with email {options["user_email"]} not found')
                    )
                    return
                    
            elif options['all']:
                # Assign all users
                users = User.objects.all()
                for user in users:
                    self.assign_user_to_group(user)
                    
            else:
                # Show current assignments
                self.show_current_assignments()
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error assigning users to groups: {str(e)}')
            )

    def assign_user_to_group(self, user, specific_group=None):
        """Assign user to appropriate group"""
        if specific_group:
            # Clear existing groups and assign to specific group
            user.groups.clear()
            success = assign_user_to_group(user, specific_group)
            if success:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Assigned {user.email} to {specific_group} group'
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f'Failed to assign {user.email} to {specific_group} group'
                    )
                )
        else:
            # Auto-assign based on user type
            user_info = detect_user_type(user, user.tenant)
            user_type = user_info['user_type']
            
            # Clear existing groups
            user.groups.clear()
            
            if user_type == 'multi_tenant':
                success = assign_user_to_group(user, 'Multi-Tenant')
                group_name = 'Multi-Tenant'
            elif user_type == 'tenant_user':
                success = assign_user_to_group(user, 'Tenant')
                group_name = 'Tenant'
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'User {user.email} has unknown type: {user_type}'
                    )
                )
                return
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Assigned {user.email} to {group_name} group (type: {user_type})'
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f'Failed to assign {user.email} to {group_name} group'
                    )
                )

    def show_current_assignments(self):
        """Show current group assignments"""
        multi_tenant_group = Group.objects.get(name='Multi-Tenant')
        tenant_group = Group.objects.get(name='Tenant')
        
        self.stdout.write('\nCurrent Group Assignments:')
        self.stdout.write(f'\nMulti-Tenant Users ({multi_tenant_group.user_set.count()}):')
        for user in multi_tenant_group.user_set.all():
            self.stdout.write(f'  - {user.email} ({user.get_full_name()})')
        
        self.stdout.write(f'\nTenant Users ({tenant_group.user_set.count()}):')
        for user in tenant_group.user_set.all():
            self.stdout.write(f'  - {user.email} ({user.get_full_name()})')
        
        # Show users without groups
        users_without_groups = User.objects.filter(groups__isnull=True)
        if users_without_groups.exists():
            self.stdout.write(f'\nUsers without groups ({users_without_groups.count()}):')
            for user in users_without_groups:
                self.stdout.write(f'  - {user.email} ({user.get_full_name()})')
        
        self.stdout.write(
            self.style.SUCCESS('\nGroup assignment summary completed!')
        )
