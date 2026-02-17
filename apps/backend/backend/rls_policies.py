"""
PostgreSQL Row-Level Security (RLS) Policies for Multi-Tenant Data Access
Provides database-level security for tenant isolation.
"""

import logging
from django.db import connection, transaction
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import models

logger = logging.getLogger(__name__)


class RLSPolicyManager:
    """
    Manager for PostgreSQL Row-Level Security policies.
    Provides methods to create, update, and manage RLS policies for tenant isolation.
    """
    
    def __init__(self):
        self.connection = connection
    
    def create_tenant_policies(self):
        """Create RLS policies for all tenant-scoped tables"""
        policies_created = []
        
        try:
            with transaction.atomic():
                # Enable RLS on all tenant-scoped tables
                tenant_tables = self._get_tenant_tables()
                
                for table_name in tenant_tables:
                    # Enable RLS on table
                    self._enable_rls_on_table(table_name)
                    
                    # Create tenant isolation policy
                    policy_name = f"{table_name}_tenant_isolation"
                    self._create_tenant_isolation_policy(table_name, policy_name)
                    policies_created.append(policy_name)
                    
                    # Create audit policy
                    audit_policy_name = f"{table_name}_audit_policy"
                    self._create_audit_policy(table_name, audit_policy_name)
                    policies_created.append(audit_policy_name)
                
                logger.info(f"Created {len(policies_created)} RLS policies")
                
        except Exception as e:
            logger.error(f"Failed to create RLS policies: {e}")
            raise
        
        return policies_created
    
    def _get_tenant_tables(self):
        """Get list of tenant-scoped tables"""
        tenant_tables = [
            # Core tenant tables
            'tenants_tenant',
            'tenants_domain',
            'tenants_company',
            'tenants_tenantinvitation',
            
            # Authentication tables
            'authentication_user',
            'authentication_userprofile',
            
            # Accounting tables
            'accounting_chartofaccounts',
            'accounting_journalentry',
            'accounting_journalentryline',
            'accounting_bankreconciliation',
            
            # Banking tables
            'banking_bankaccount',
            'banking_banktransaction',
            'banking_bankstatement',
            'banking_bankintegration',
            
            # Sales tables
            'sales_customer',
            'sales_salesorder',
            'sales_salesorderline',
            'sales_salesquote',
            'sales_salesquoteline',
            
            # Inventory tables
            'inventory_itemcategory',
            'inventory_item',
            'inventory_inventorymovement',
            'inventory_warehouse',
            'inventory_warehousestock',
            
            # Invoicing tables
            'invoicing_invoice',
            'invoicing_invoiceline',
            'invoicing_payment',
            
            # Reporting tables
            'reporting_report',
            'reporting_reporttemplate',
            
            # Compliance tables
            'compliance_auditlog',
            'compliance_dataclassification',
            'compliance_dataretentionpolicy',
            'compliance_complianceviolation',
            'compliance_datasubjectrequest',
            'compliance_securityincident',
        ]
        
        return tenant_tables
    
    def _enable_rls_on_table(self, table_name):
        """Enable RLS on a table"""
        with self.connection.cursor() as cursor:
            cursor.execute(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;")
            logger.info(f"Enabled RLS on table: {table_name}")
    
    def _create_tenant_isolation_policy(self, table_name, policy_name):
        """Create tenant isolation policy for a table"""
        with self.connection.cursor() as cursor:
            # Drop existing policy if it exists
            cursor.execute(f"""
                DROP POLICY IF EXISTS {policy_name} ON {table_name};
            """)
            
            # Create tenant isolation policy
            policy_sql = f"""
                CREATE POLICY {policy_name} ON {table_name}
                FOR ALL
                TO PUBLIC
                USING (
                    CASE 
                        WHEN {table_name}.tenant_id IS NOT NULL THEN 
                            {table_name}.tenant_id = current_setting('app.current_tenant_id', true)::uuid
                        WHEN {table_name}.company_id IS NOT NULL THEN 
                            {table_name}.company_id IN (
                                SELECT id FROM tenants_company 
                                WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
                            )
                        WHEN {table_name}.user_id IS NOT NULL THEN 
                            {table_name}.user_id IN (
                                SELECT id FROM authentication_user 
                                WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
                            )
                        WHEN {table_name}.created_by_id IS NOT NULL THEN 
                            {table_name}.created_by_id IN (
                                SELECT id FROM authentication_user 
                                WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
                            )
                        WHEN {table_name}.bank_account_id IS NOT NULL THEN 
                            {table_name}.bank_account_id IN (
                                SELECT id FROM banking_bankaccount 
                                WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
                            )
                        WHEN {table_name}.journal_entry_id IS NOT NULL THEN 
                            {table_name}.journal_entry_id IN (
                                SELECT id FROM accounting_journalentry 
                                WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
                            )
                        WHEN {table_name}.sales_order_id IS NOT NULL THEN 
                            {table_name}.sales_order_id IN (
                                SELECT id FROM sales_salesorder 
                                WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
                            )
                        WHEN {table_name}.customer_id IS NOT NULL THEN 
                            {table_name}.customer_id IN (
                                SELECT id FROM sales_customer 
                                WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
                            )
                        ELSE false
                    END
                );
            """
            
            cursor.execute(policy_sql)
            logger.info(f"Created tenant isolation policy: {policy_name}")
    
    def _create_audit_policy(self, table_name, policy_name):
        """Create audit policy for a table"""
        with self.connection.cursor() as cursor:
            # Drop existing policy if it exists
            cursor.execute(f"""
                DROP POLICY IF EXISTS {policy_name} ON {table_name};
            """)
            
            # Create audit policy for compliance
            policy_sql = f"""
                CREATE POLICY {policy_name} ON {table_name}
                FOR ALL
                TO PUBLIC
                USING (
                    current_setting('app.current_tenant_id', true) IS NOT NULL
                    AND current_setting('app.current_user_id', true) IS NOT NULL
                );
            """
            
            cursor.execute(policy_sql)
            logger.info(f"Created audit policy: {policy_name}")
    
    def create_application_context_function(self):
        """Create application context function for RLS"""
        with self.connection.cursor() as cursor:
            cursor.execute("""
                CREATE OR REPLACE FUNCTION app.set_tenant_context(tenant_id uuid, user_id uuid, user_role text)
                RETURNS void AS $$
                BEGIN
                    PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
                    PERFORM set_config('app.current_user_id', user_id::text, true);
                    PERFORM set_config('app.current_user_role', user_role, true);
                END;
                $$ LANGUAGE plpgsql;
            """)
            logger.info("Created application context function")
    
    def create_tenant_validation_function(self):
        """Create tenant validation function"""
        with self.connection.cursor() as cursor:
            cursor.execute("""
                CREATE OR REPLACE FUNCTION app.validate_tenant_access(table_name text, record_id uuid)
                RETURNS boolean AS $$
                DECLARE
                    tenant_id uuid;
                    current_tenant_id uuid;
                BEGIN
                    -- Get current tenant from context
                    current_tenant_id := current_setting('app.current_tenant_id', true)::uuid;
                    
                    IF current_tenant_id IS NULL THEN
                        RETURN false;
                    END IF;
                    
                    -- Get tenant from record based on table structure
                    CASE table_name
                        WHEN 'tenants_tenant' THEN
                            SELECT id INTO tenant_id FROM tenants_tenant WHERE id = record_id;
                        WHEN 'tenants_company' THEN
                            SELECT tenant_id INTO tenant_id FROM tenants_company WHERE id = record_id;
                        WHEN 'authentication_user' THEN
                            SELECT tenant_id INTO tenant_id FROM authentication_user WHERE id = record_id;
                        WHEN 'accounting_chartofaccounts' THEN
                            SELECT tenant_id INTO tenant_id FROM accounting_chartofaccounts WHERE id = record_id;
                        WHEN 'accounting_journalentry' THEN
                            SELECT tenant_id INTO tenant_id FROM accounting_journalentry WHERE id = record_id;
                        WHEN 'banking_bankaccount' THEN
                            SELECT tenant_id INTO tenant_id FROM banking_bankaccount WHERE id = record_id;
                        WHEN 'sales_customer' THEN
                            SELECT tenant_id INTO tenant_id FROM sales_customer WHERE id = record_id;
                        WHEN 'sales_salesorder' THEN
                            SELECT tenant_id INTO tenant_id FROM sales_salesorder WHERE id = record_id;
                        ELSE
                            RETURN false;
                    END CASE;
                    
                    RETURN tenant_id = current_tenant_id;
                END;
                $$ LANGUAGE plpgsql;
            """)
            logger.info("Created tenant validation function")
    
    def create_audit_trigger_function(self):
        """Create audit trigger function for compliance"""
        with self.connection.cursor() as cursor:
            cursor.execute("""
                CREATE OR REPLACE FUNCTION app.audit_trigger_function()
                RETURNS trigger AS $$
                DECLARE
                    audit_data jsonb;
                    tenant_id uuid;
                    user_id uuid;
                BEGIN
                    -- Get context values
                    tenant_id := current_setting('app.current_tenant_id', true)::uuid;
                    user_id := current_setting('app.current_user_id', true)::uuid;
                    
                    -- Create audit record
                    audit_data := jsonb_build_object(
                        'timestamp', now(),
                        'action', TG_OP,
                        'table_name', TG_TABLE_NAME,
                        'tenant_id', tenant_id,
                        'user_id', user_id,
                        'old_data', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
                        'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
                    );
                    
                    -- Insert audit record
                    INSERT INTO compliance_auditlog (
                        tenant_id, user_id, audit_type, audit_data, created_at
                    ) VALUES (
                        tenant_id, user_id, TG_OP, audit_data, now()
                    );
                    
                    RETURN COALESCE(NEW, OLD);
                END;
                $$ LANGUAGE plpgsql;
            """)
            logger.info("Created audit trigger function")
    
    def create_audit_triggers(self):
        """Create audit triggers for all tenant tables"""
        tenant_tables = self._get_tenant_tables()
        
        for table_name in tenant_tables:
            with self.connection.cursor() as cursor:
                # Drop existing trigger if it exists
                cursor.execute(f"""
                    DROP TRIGGER IF EXISTS {table_name}_audit_trigger ON {table_name};
                """)
                
                # Create audit trigger
                cursor.execute(f"""
                    CREATE TRIGGER {table_name}_audit_trigger
                    AFTER INSERT OR UPDATE OR DELETE ON {table_name}
                    FOR EACH ROW EXECUTE FUNCTION app.audit_trigger_function();
                """)
                
                logger.info(f"Created audit trigger for table: {table_name}")
    
    def create_tenant_isolation_triggers(self):
        """Create tenant isolation triggers for additional security"""
        tenant_tables = self._get_tenant_tables()
        
        for table_name in tenant_tables:
            with self.connection.cursor() as cursor:
                # Drop existing trigger if it exists
                cursor.execute(f"""
                    DROP TRIGGER IF EXISTS {table_name}_tenant_isolation_trigger ON {table_name};
                """)
                
                # Create tenant isolation trigger
                cursor.execute(f"""
                    CREATE TRIGGER {table_name}_tenant_isolation_trigger
                    BEFORE INSERT OR UPDATE ON {table_name}
                    FOR EACH ROW EXECUTE FUNCTION app.tenant_isolation_trigger_function();
                """)
                
                logger.info(f"Created tenant isolation trigger for table: {table_name}")
    
    def create_tenant_isolation_trigger_function(self):
        """Create tenant isolation trigger function"""
        with self.connection.cursor() as cursor:
            cursor.execute("""
                CREATE OR REPLACE FUNCTION app.tenant_isolation_trigger_function()
                RETURNS trigger AS $$
                DECLARE
                    current_tenant_id uuid;
                    current_user_id uuid;
                BEGIN
                    -- Get current tenant from context
                    current_tenant_id := current_setting('app.current_tenant_id', true)::uuid;
                    current_user_id := current_setting('app.current_user_id', true)::uuid;
                    
                    IF current_tenant_id IS NULL THEN
                        RAISE EXCEPTION 'No tenant context set';
                    END IF;
                    
                    -- Auto-assign tenant if not set
                    IF TG_OP = 'INSERT' AND NEW.tenant_id IS NULL THEN
                        NEW.tenant_id := current_tenant_id;
                    END IF;
                    
                    -- Auto-assign created_by if not set
                    IF TG_OP = 'INSERT' AND NEW.created_by_id IS NULL AND current_user_id IS NOT NULL THEN
                        NEW.created_by_id := current_user_id;
                    END IF;
                    
                    -- Auto-assign updated_by for updates
                    IF TG_OP = 'UPDATE' AND current_user_id IS NOT NULL THEN
                        NEW.updated_by_id := current_user_id;
                    END IF;
                    
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """)
            logger.info("Created tenant isolation trigger function")
    
    def setup_rls_environment(self):
        """Set up complete RLS environment"""
        try:
            with transaction.atomic():
                # Create application context function
                self.create_application_context_function()
                
                # Create tenant validation function
                self.create_tenant_validation_function()
                
                # Create audit trigger function
                self.create_audit_trigger_function()
                
                # Create tenant isolation trigger function
                self.create_tenant_isolation_trigger_function()
                
                # Create tenant policies
                policies_created = self.create_tenant_policies()
                
                # Create audit triggers
                self.create_audit_triggers()
                
                # Create tenant isolation triggers
                self.create_tenant_isolation_triggers()
                
                logger.info("RLS environment setup completed successfully")
                return policies_created
                
        except Exception as e:
            logger.error(f"Failed to setup RLS environment: {e}")
            raise
    
    def drop_rls_environment(self):
        """Drop RLS environment (for testing/development)"""
        try:
            with transaction.atomic():
                tenant_tables = self._get_tenant_tables()
                
                for table_name in tenant_tables:
                    with self.connection.cursor() as cursor:
                        # Drop triggers
                        cursor.execute(f"""
                            DROP TRIGGER IF EXISTS {table_name}_audit_trigger ON {table_name};
                        """)
                        cursor.execute(f"""
                            DROP TRIGGER IF EXISTS {table_name}_tenant_isolation_trigger ON {table_name};
                        """)
                        
                        # Drop policies
                        cursor.execute(f"""
                            DROP POLICY IF EXISTS {table_name}_tenant_isolation ON {table_name};
                        """)
                        cursor.execute(f"""
                            DROP POLICY IF EXISTS {table_name}_audit_policy ON {table_name};
                        """)
                        
                        # Disable RLS
                        cursor.execute(f"ALTER TABLE {table_name} DISABLE ROW LEVEL SECURITY;")
                
                # Drop functions
                with self.connection.cursor() as cursor:
                    cursor.execute("DROP FUNCTION IF EXISTS app.set_tenant_context(uuid, uuid, text);")
                    cursor.execute("DROP FUNCTION IF EXISTS app.validate_tenant_access(text, uuid);")
                    cursor.execute("DROP FUNCTION IF EXISTS app.audit_trigger_function();")
                    cursor.execute("DROP FUNCTION IF EXISTS app.tenant_isolation_trigger_function();")
                
                logger.info("RLS environment dropped successfully")
                
        except Exception as e:
            logger.error(f"Failed to drop RLS environment: {e}")
            raise


class RLSManagementCommand(BaseCommand):
    """
    Django management command for RLS setup and management.
    """
    
    help = 'Manage PostgreSQL Row-Level Security policies for multi-tenant data access'
    
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
    
    def handle(self, *args, **options):
        rls_manager = RLSPolicyManager()
        
        if options['setup']:
            self.stdout.write('Setting up RLS environment...')
            policies_created = rls_manager.setup_rls_environment()
            self.stdout.write(
                self.style.SUCCESS(f'RLS environment setup completed. Created {len(policies_created)} policies.')
            )
        
        elif options['drop']:
            self.stdout.write('Dropping RLS environment...')
            rls_manager.drop_rls_environment()
            self.stdout.write(self.style.SUCCESS('RLS environment dropped successfully.'))
        
        elif options['status']:
            self.stdout.write('Checking RLS status...')
            self._check_rls_status()
        
        else:
            self.stdout.write(self.style.ERROR('Please specify --setup, --drop, or --status'))
    
    def _check_rls_status(self):
        """Check RLS status for all tables"""
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
            self.stdout.write('-' * 50)
            
            for schema, table, rls_enabled in tables:
                status = 'ENABLED' if rls_enabled else 'DISABLED'
                self.stdout.write(f'{table}: {status}')
    
    def _check_policies(self):
        """Check RLS policies for all tables"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
                FROM pg_policies 
                WHERE schemaname = 'public'
                ORDER BY tablename, policyname;
            """)
            
            policies = cursor.fetchall()
            
            self.stdout.write('\nRLS Policies:')
            self.stdout.write('-' * 50)
            
            for schema, table, policy, permissive, roles, cmd, qual in policies:
                self.stdout.write(f'{table}.{policy}: {cmd} ({permissive})')


# Utility functions for RLS management
def setup_rls_environment():
    """Set up RLS environment"""
    rls_manager = RLSPolicyManager()
    return rls_manager.setup_rls_environment()


def drop_rls_environment():
    """Drop RLS environment"""
    rls_manager = RLSPolicyManager()
    return rls_manager.drop_rls_environment()


def check_rls_status():
    """Check RLS status"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT schemaname, tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename LIKE '%_%'
            ORDER BY tablename;
        """)
        
        return cursor.fetchall()


def get_rls_policies():
    """Get RLS policies"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
            FROM pg_policies 
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
        """)
        
        return cursor.fetchall()
