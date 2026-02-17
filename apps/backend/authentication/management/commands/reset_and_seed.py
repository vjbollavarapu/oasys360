"""
Management command to reset database and seed test data
Usage: python manage.py reset_and_seed
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.conf import settings
import sys


class Command(BaseCommand):
    help = 'Reset database (drop and recreate) and seed test data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input',
            action='store_true',
            help='Skip confirmation prompts',
        )
        parser.add_argument(
            '--keep-migrations',
            action='store_true',
            help='Keep existing migrations and just flush data',
        )

    def handle(self, *args, **options):
        no_input = options.get('no_input', False)
        keep_migrations = options.get('keep_migrations', False)
        
        # Get database info
        db_name = settings.DATABASES['default']['NAME']
        db_engine = settings.DATABASES['default']['ENGINE']
        
        self.stdout.write(self.style.WARNING(
            f'\n⚠️  WARNING: This will DELETE ALL DATA in the database!'
        ))
        self.stdout.write(f'Database: {db_name}')
        self.stdout.write(f'Engine: {db_engine}')
        
        if not no_input:
            confirm = input('\nAre you sure you want to continue? (yes/no): ')
            if confirm.lower() not in ['yes', 'y']:
                self.stdout.write(self.style.ERROR('Operation cancelled.'))
                return
        
        try:
            # Step 1: Flush database (remove all data)
            self.stdout.write(self.style.WARNING('\n📦 Step 1: Flushing database...'))
            call_command('flush', verbosity=0, interactive=False, no_input=True)
            self.stdout.write(self.style.SUCCESS('✅ Database flushed successfully'))
            
            # Step 2: Run migrations
            if not keep_migrations:
                self.stdout.write(self.style.WARNING('\n📦 Step 2: Running migrations...'))
                try:
                    call_command('migrate', verbosity=1, interactive=False)
                    self.stdout.write(self.style.SUCCESS('✅ Migrations completed'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'❌ Migration error: {e}'))
                    self.stdout.write(self.style.WARNING('Continuing with seed...'))
            else:
                self.stdout.write(self.style.WARNING('⏭️  Skipping migrations (--keep-migrations)'))
            
            # Step 3: Create test users (all roles; password: Pass123456)
            self.stdout.write(self.style.WARNING('\n📦 Step 3: Creating test users...'))
            call_command('create_test_users', reset=False)  # DB already empty from flush
            self.stdout.write(self.style.SUCCESS('✅ Test users created'))
            
            # Step 4: Summary
            self.stdout.write(self.style.SUCCESS(
                '\n' + '='*60
            ))
            self.stdout.write(self.style.SUCCESS('✅ Database reset and seeded successfully!'))
            self.stdout.write(self.style.SUCCESS('='*60))
            self.stdout.write('\n📋 Seeded users (password for all: Pass123456):')
            self.stdout.write('   • demo@company.com          — Staff')
            self.stdout.write('   • admin@oasys360.com       — Tenant Admin')
            self.stdout.write('   • cfo@oasys360.com         — CFO')
            self.stdout.write('   • admin@globalaccounting.com — Firm Admin')
            self.stdout.write('   • accountant@globalaccounting.com — Accountant')
            self.stdout.write('   • platform@oasys360.com   — Platform Admin')
            self.stdout.write('\n🔐 2FA code (if enabled on login): 123456')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error during reset: {e}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            sys.exit(1)

