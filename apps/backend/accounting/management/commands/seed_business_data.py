"""
Management command to seed business data for development
Usage: python manage.py seed_business_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import random

from tenants.models import Tenant, Company
from authentication.models import User
from sales.models import Customer
from purchase.models import Supplier
from inventory.models import Item, ItemCategory
from invoicing.models import Invoice, InvoiceLine
from accounting.models import ChartOfAccounts
from banking.models import BankAccount


class Command(BaseCommand):
    help = 'Seed business data (customers, vendors, products, invoices, etc.) for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing business data before seeding',
        )

    def handle(self, *args, **options):
        reset = options.get('reset', False)

        # Get or create tenant and company
        tenant = Tenant.objects.first()
        if not tenant:
            self.stdout.write(self.style.ERROR('No tenant found. Please run create_test_users first.'))
            return

        company = Company.objects.filter(tenant=tenant).first()
        if not company:
            self.stdout.write(self.style.ERROR('No company found. Please run create_test_users first.'))
            return

        # Get a user to use as created_by
        user = User.objects.filter(tenant=tenant).first()
        if not user:
            self.stdout.write(self.style.ERROR('No user found. Please run create_test_users first.'))
            return

        if reset:
            self.stdout.write(self.style.WARNING('Deleting existing business data...'))
            InvoiceLine.objects.filter(invoice__tenant=tenant).delete()
            Invoice.objects.filter(tenant=tenant).delete()
            Customer.objects.filter(tenant=tenant).delete()
            Supplier.objects.filter(tenant=tenant).delete()
            Item.objects.filter(tenant=tenant).delete()
            ItemCategory.objects.filter(tenant=tenant).delete()
            ChartOfAccounts.objects.filter(tenant=tenant).exclude(is_system=True).delete()
            BankAccount.objects.filter(tenant=tenant).delete()

        # Step 1: Create Chart of Accounts
        self.stdout.write(self.style.WARNING('\n📊 Creating Chart of Accounts...'))
        coa_created = self._create_chart_of_accounts(tenant, user)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {coa_created} accounts'))

        # Step 2: Create Bank Accounts
        self.stdout.write(self.style.WARNING('\n🏦 Creating Bank Accounts...'))
        bank_count = self._create_bank_accounts(tenant, company, user)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {bank_count} bank accounts'))

        # Step 3: Create Customers
        self.stdout.write(self.style.WARNING('\n👥 Creating Customers...'))
        customer_count = self._create_customers(tenant, company, user)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {customer_count} customers'))

        # Step 4: Create Suppliers/Vendors
        self.stdout.write(self.style.WARNING('\n🏢 Creating Suppliers...'))
        supplier_count = self._create_suppliers(tenant, company, user)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {supplier_count} suppliers'))

        # Step 5: Create Item Categories
        self.stdout.write(self.style.WARNING('\n📦 Creating Item Categories...'))
        category_count = self._create_item_categories(tenant, user)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {category_count} categories'))

        # Step 6: Create Items/Products
        self.stdout.write(self.style.WARNING('\n📦 Creating Items...'))
        item_count = self._create_items(tenant, company, user)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {item_count} items'))

        # Step 7: Create Invoices
        self.stdout.write(self.style.WARNING('\n🧾 Creating Invoices...'))
        invoice_count = self._create_invoices(tenant, company, user)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {invoice_count} invoices'))

        # Summary
        self.stdout.write(self.style.SUCCESS(
            '\n' + '='*60
        ))
        self.stdout.write(self.style.SUCCESS('✅ Business data seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(f'\n📊 Summary:')
        self.stdout.write(f'   • Chart of Accounts: {coa_created} accounts')
        self.stdout.write(f'   • Bank Accounts: {bank_count}')
        self.stdout.write(f'   • Customers: {customer_count}')
        self.stdout.write(f'   • Suppliers: {supplier_count}')
        self.stdout.write(f'   • Item Categories: {category_count}')
        self.stdout.write(f'   • Items: {item_count}')
        self.stdout.write(f'   • Invoices: {invoice_count}')
        self.stdout.write(f'\n🎯 You can now test the application with realistic business data!')

    def _create_chart_of_accounts(self, tenant, user):
        """Create chart of accounts"""
        accounts = [
            # Assets
            {'code': '1000', 'name': 'Cash and Cash Equivalents', 'type': 'asset', 'normal_balance': 'debit'},
            {'code': '1100', 'name': 'Accounts Receivable', 'type': 'asset', 'normal_balance': 'debit'},
            {'code': '1200', 'name': 'Inventory', 'type': 'asset', 'normal_balance': 'debit'},
            {'code': '1500', 'name': 'Fixed Assets', 'type': 'asset', 'normal_balance': 'debit'},
            {'code': '1600', 'name': 'Accumulated Depreciation', 'type': 'asset', 'normal_balance': 'credit'},
            # Liabilities
            {'code': '2000', 'name': 'Accounts Payable', 'type': 'liability', 'normal_balance': 'credit'},
            {'code': '2100', 'name': 'Accrued Expenses', 'type': 'liability', 'normal_balance': 'credit'},
            {'code': '2200', 'name': 'Short-term Debt', 'type': 'liability', 'normal_balance': 'credit'},
            # Equity
            {'code': '3000', 'name': 'Common Stock', 'type': 'equity', 'normal_balance': 'credit'},
            {'code': '3100', 'name': 'Retained Earnings', 'type': 'equity', 'normal_balance': 'credit'},
            # Revenue
            {'code': '4000', 'name': 'Sales Revenue', 'type': 'revenue', 'normal_balance': 'credit'},
            {'code': '4100', 'name': 'Service Revenue', 'type': 'revenue', 'normal_balance': 'credit'},
            # Expenses
            {'code': '5000', 'name': 'Cost of Goods Sold', 'type': 'expense', 'normal_balance': 'debit'},
            {'code': '6000', 'name': 'Operating Expenses', 'type': 'expense', 'normal_balance': 'debit'},
            {'code': '6100', 'name': 'Salaries and Wages', 'type': 'expense', 'normal_balance': 'debit'},
            {'code': '6200', 'name': 'Rent Expense', 'type': 'expense', 'normal_balance': 'debit'},
            {'code': '6300', 'name': 'Utilities', 'type': 'expense', 'normal_balance': 'debit'},
        ]
        
        created = 0
        for account_data in accounts:
            ChartOfAccounts.objects.get_or_create(
                tenant=tenant,
                code=account_data['code'],
                defaults={
                    'name': account_data['name'],
                    'type': account_data['type'],
                    'normal_balance': account_data['normal_balance'],
                    'is_active': True,
                    'is_system': False,
                }
            )
            created += 1
        return created

    def _create_bank_accounts(self, tenant, company, user):
        """Create bank accounts"""
        banks = [
            {'name': 'Main Business Account', 'account_number': '****1234', 'bank_name': 'First National Bank', 'opening_balance': Decimal('50000.00')},
            {'name': 'Operating Account', 'account_number': '****5678', 'bank_name': 'Business Savings Bank', 'opening_balance': Decimal('25000.00')},
        ]
        
        created = 0
        for bank_data in banks:
            account, acc_created = BankAccount.objects.get_or_create(
                tenant=tenant,
                company=company,
                account_number=bank_data['account_number'],
                defaults={
                    'name': bank_data['name'],
                    'bank_name': bank_data['bank_name'],
                    'account_type': 'checking',
                    'currency': 'USD',
                    'opening_balance': bank_data['opening_balance'],
                    'current_balance': bank_data['opening_balance'],  # Set current balance to opening balance initially
                    'is_active': True,
                    'created_by': user,
                }
            )
            if acc_created:
                created += 1
        return created

    def _create_customers(self, tenant, company, user):
        """Create customers"""
        customers_data = [
            {'name': 'Acme Corporation', 'email': 'contact@acme.com', 'phone': '+1-555-0101', 'credit_limit': Decimal('50000')},
            {'name': 'Tech Solutions Inc', 'email': 'sales@techsolutions.com', 'phone': '+1-555-0102', 'credit_limit': Decimal('30000')},
            {'name': 'Global Manufacturing', 'email': 'info@globalmfg.com', 'phone': '+1-555-0103', 'credit_limit': Decimal('75000')},
            {'name': 'Digital Services LLC', 'email': 'hello@digitalservices.com', 'phone': '+1-555-0104', 'credit_limit': Decimal('20000')},
            {'name': 'Enterprise Systems', 'email': 'contact@enterprise.com', 'phone': '+1-555-0105', 'credit_limit': Decimal('100000')},
        ]
        
        created = 0
        for customer_data in customers_data:
            Customer.objects.get_or_create(
                tenant=tenant,
                company=company,
                email=customer_data['email'],
                defaults={
                    'name': customer_data['name'],
                    'phone': customer_data['phone'],
                    'address': '123 Business Street',
                    'city': 'New York',
                    'state': 'NY',
                    'country': 'US',
                    'postal_code': '10001',
                    'credit_limit': customer_data['credit_limit'],
                    'payment_terms': 'net_30',
                    'currency': 'USD',
                    'status': 'active',
                    'is_active': True,
                    'created_by': user,
                }
            )
            created += 1
        return created

    def _create_suppliers(self, tenant, company, user):
        """Create suppliers"""
        suppliers_data = [
            {'name': 'Material Supply Co', 'email': 'orders@materialsupply.com', 'phone': '+1-555-0201'},
            {'name': 'Wholesale Distributors', 'email': 'contact@wholesale.com', 'phone': '+1-555-0202'},
            {'name': 'Office Equipment Plus', 'email': 'sales@officeplus.com', 'phone': '+1-555-0203'},
            {'name': 'Raw Materials Inc', 'email': 'info@rawmaterials.com', 'phone': '+1-555-0204'},
        ]
        
        created = 0
        for supplier_data in suppliers_data:
            Supplier.objects.get_or_create(
                tenant=tenant,
                company=company,
                email=supplier_data['email'],
                defaults={
                    'name': supplier_data['name'],
                    'phone': supplier_data['phone'],
                    'address': '456 Supplier Avenue',
                    'city': 'Chicago',
                    'state': 'IL',
                    'country': 'US',
                    'postal_code': '60601',
                    'payment_terms': 'net_30',
                    'currency': 'USD',
                    'is_active': True,
                    'created_by': user,
                }
            )
            created += 1
        return created

    def _create_item_categories(self, tenant, user):
        """Create item categories"""
        categories = [
            {'name': 'Software', 'description': 'Software products and licenses'},
            {'name': 'Hardware', 'description': 'Computer hardware and equipment'},
            {'name': 'Services', 'description': 'Professional services'},
            {'name': 'Consulting', 'description': 'Consulting services'},
        ]
        
        created = 0
        for category_data in categories:
            ItemCategory.objects.get_or_create(
                tenant=tenant,
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'is_active': True,
                }
            )
            created += 1
        return created

    def _create_items(self, tenant, company, user):
        """Create items/products"""
        categories = ItemCategory.objects.filter(tenant=tenant)
        if not categories.exists():
            return 0
        
        items_data = [
            {'name': 'Professional License', 'sku': 'PRO-LIC-001', 'price': Decimal('299.99'), 'category': 'Software'},
            {'name': 'Enterprise License', 'sku': 'ENT-LIC-001', 'price': Decimal('999.99'), 'category': 'Software'},
            {'name': 'Laptop Computer', 'sku': 'LAPTOP-001', 'price': Decimal('1299.99'), 'category': 'Hardware'},
            {'name': 'Consulting Hours', 'sku': 'CONS-HRS', 'price': Decimal('150.00'), 'category': 'Consulting'},
            {'name': 'Implementation Service', 'sku': 'IMP-SVC', 'price': Decimal('5000.00'), 'category': 'Services'},
        ]
        
        created = 0
        for item_data in items_data:
            category = categories.filter(name=item_data['category']).first()
            if category:
                Item.objects.get_or_create(
                    tenant=tenant,
                    company=company,
                    sku=item_data['sku'],
                    defaults={
                        'name': item_data['name'],
                        'category': category,
                        'selling_price': item_data['price'],  # Item model uses 'selling_price' not 'unit_price'
                        'cost_price': item_data['price'] * Decimal('0.7'),  # 30% margin
                        'item_type': 'service' if 'Service' in item_data['name'] or 'Consulting' in item_data['name'] else 'product',
                        'is_active': True,
                    }
                )
                created += 1
        return created

    def _create_invoices(self, tenant, company, user):
        """Create sample invoices"""
        customers = Customer.objects.filter(tenant=tenant)
        items = Item.objects.filter(tenant=tenant)
        
        if not customers.exists() or not items.exists():
            return 0

        today = timezone.now().date()
        invoice_statuses = ['draft', 'sent', 'sent', 'paid', 'overdue']  # Weighted towards sent
        
        created = 0
        for i in range(10):
            customer = random.choice(list(customers))
            status = random.choice(invoice_statuses)
            invoice_date = today - timedelta(days=random.randint(0, 60))
            due_date = invoice_date + timedelta(days=30)
            
            # Adjust status based on dates
            if status == 'paid':
                due_date = invoice_date + timedelta(days=random.randint(1, 20))
            elif status == 'overdue':
                due_date = today - timedelta(days=random.randint(1, 30))
            
            invoice_number = f'INV-{today.year}-{str(i+1).zfill(4)}'
            
            invoice, inv_created = Invoice.objects.get_or_create(
                tenant=tenant,
                company=company,
                invoice_number=invoice_number,
                defaults={
                    'customer': customer,
                    'invoice_date': invoice_date,
                    'due_date': due_date,
                    'status': status,
                    'payment_terms': 'net_30',
                    'currency': 'USD',
                    'subtotal': Decimal('0'),
                    'tax_amount': Decimal('0'),
                    'discount_amount': Decimal('0'),
                    'total_amount': Decimal('0'),
                    'created_by': user,  # Invoice model requires created_by
                }
            )
            
            if inv_created:
                # Add invoice lines
                num_lines = random.randint(1, 4)
                selected_items = random.sample(list(items), min(num_lines, len(items)))
                
                # Create invoice lines - totals will be calculated by save() method
                for item in selected_items:
                    quantity = random.randint(1, 5)
                    unit_price = item.selling_price  # Item model uses 'selling_price' not 'unit_price'
                    
                    # Create InvoiceLine - line_total will be calculated in save() method
                    # We need to provide a temporary value for line_total since it's required
                    temp_line_total = quantity * unit_price
                    invoice_line = InvoiceLine(
                        invoice=invoice,
                        tenant=tenant,
                        description=item.name,
                        quantity=quantity,
                        unit_price=unit_price,
                        tax_rate=Decimal('10.00'),  # 10% tax (stored as percentage: 10.00)
                        discount_rate=Decimal('0.00'),  # No discount (stored as percentage: 0.00)
                        line_total=temp_line_total,  # Temporary value, will be recalculated in save()
                        created_by=user,  # InvoiceLine has created_by field (optional but good practice)
                    )
                    invoice_line.save()  # This will recalculate line_total correctly
                
                # Recalculate totals from invoice lines after they're created
                invoice.refresh_from_db()
                lines = invoice.lines.all()
                
                # Calculate subtotal (sum of quantity * unit_price for all lines)
                actual_subtotal = sum(line.quantity * line.unit_price for line in lines)
                
                # Calculate tax amount (sum of all line taxes)
                actual_tax = sum(
                    (line.quantity * line.unit_price) * (Decimal(str(line.tax_rate)) / Decimal('100'))
                    for line in lines
                )
                
                # Total is sum of all line totals (which already include tax calculated by save() method)
                actual_total = sum(line.line_total for line in lines)
                
                invoice.subtotal = actual_subtotal
                invoice.tax_amount = actual_tax
                invoice.total_amount = actual_total
                invoice.save()
                
                created += 1
        
        return created

