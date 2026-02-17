"""
Django management command for setting up PostgreSQL Row-Level Security (RLS) policies.
"""

from django.core.management.base import BaseCommand
from django.db import connection
from backend.rls_policies import RLSPolicyManager


class Command(BaseCommand):
    help = 'Set up PostgreSQL Row-Level Security (RLS) policies for multi-tenant data access'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--setup',
            action='store_true',
            help='Set up RLS environment',
        )
        parser.add_argument(
            '--drop',
            action='store_true',
            help='Drop RLS environment',
        )
        parser.add_argument(
            '--status',
            action='store_true',
            help='Check RLS status',
        )
        parser.add_argument(
            '--policies',
            action='store_true',
            help='List RLS policies',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force setup even if RLS already exists',
        )
    
    def handle(self, *args, **options):
        rls_manager = RLSPolicyManager()
        
        if options['setup']:
            self.setup_rls(rls_manager, options['force'])
        elif options['drop']:
            self.drop_rls(rls_manager)
        elif options['status']:
            self.check_status()
        elif options['policies']:
            self.list_policies()
        else:
            self.stdout.write(self.style.ERROR('Please specify --setup, --drop, --status, or --policies'))
    
    def setup_rls(self, rls_manager, force=False):
        """Set up RLS environment"""
        self.stdout.write('Setting up RLS environment...')
        
        try:
            # Check if RLS already exists
            if not force and self._rls_exists():
                self.stdout.write(
                    self.style.WARNING('RLS environment already exists. Use --force to recreate.')
                )
                return
            
            # Set up RLS environment
            policies_created = rls_manager.setup_rls_environment()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'RLS environment setup completed successfully. '
                    f'Created {len(policies_created)} policies.'
                )
            )
            
            # Display created policies
            self.stdout.write('\nCreated policies:')
            for policy in policies_created:
                self.stdout.write(f'  - {policy}')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to setup RLS environment: {e}')
            )
            raise
    
    def drop_rls(self, rls_manager):
        """Drop RLS environment"""
        self.stdout.write('Dropping RLS environment...')
        
        try:
            rls_manager.drop_rls_environment()
            self.stdout.write(
                self.style.SUCCESS('RLS environment dropped successfully.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to drop RLS environment: {e}')
            )
            raise
    
    def check_status(self):
        """Check RLS status"""
        self.stdout.write('Checking RLS status...')
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT schemaname, tablename, rowsecurity 
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                    AND tablename LIKE '%_%'
                    ORDER BY tablename;
                """)
                
                tables = cursor.fetchall()
                
                self.stdout.write('\nRLS Status:')
                self.stdout.write('-' * 60)
                self.stdout.write(f'{"Table":<30} {"RLS Status":<15} {"Schema":<15}')
                self.stdout.write('-' * 60)
                
                enabled_count = 0
                disabled_count = 0
                
                for schema, table, rls_enabled in tables:
                    status = 'ENABLED' if rls_enabled else 'DISABLED'
                    self.stdout.write(f'{table:<30} {status:<15} {schema:<15}')
                    
                    if rls_enabled:
                        enabled_count += 1
                    else:
                        disabled_count += 1
                
                self.stdout.write('-' * 60)
                self.stdout.write(f'Total tables: {len(tables)}')
                self.stdout.write(f'RLS enabled: {enabled_count}')
                self.stdout.write(f'RLS disabled: {disabled_count}')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to check RLS status: {e}')
            )
            raise
    
    def list_policies(self):
        """List RLS policies"""
        self.stdout.write('Listing RLS policies...')
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
                    FROM pg_policies 
                    WHERE schemaname = 'public'
                    ORDER BY tablename, policyname;
                """)
                
                policies = cursor.fetchall()
                
                if not policies:
                    self.stdout.write('No RLS policies found.')
                    return
                
                self.stdout.write('\nRLS Policies:')
                self.stdout.write('-' * 80)
                self.stdout.write(f'{"Table":<25} {"Policy":<25} {"Command":<10} {"Permissive":<10}')
                self.stdout.write('-' * 80)
                
                for schema, table, policy, permissive, roles, cmd, qual in policies:
                    self.stdout.write(f'{table:<25} {policy:<25} {cmd:<10} {permissive:<10}')
                
                self.stdout.write('-' * 80)
                self.stdout.write(f'Total policies: {len(policies)}')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to list RLS policies: {e}')
            )
            raise
    
    def _rls_exists(self):
        """Check if RLS environment already exists"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM pg_policies 
                    WHERE schemaname = 'public' 
                    AND policyname LIKE '%_tenant_isolation';
                """)
                
                count = cursor.fetchone()[0]
                return count > 0
                
        except Exception:
            return False
