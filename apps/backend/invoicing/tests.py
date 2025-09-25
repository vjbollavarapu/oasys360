"""
Unit tests for invoicing app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, datetime
import uuid

from tenants.models import Tenant, Company
from authentication.models import User
from sales.models import Customer
from .models import Invoice, InvoiceLine, InvoiceTemplate, InvoicePayment, EInvoiceSettings

User = get_user_model()


class InvoiceModelTest(TestCase):
    """Test Invoice model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True
        )
        self.company = Company.objects.create(
            tenant=self.tenant,
            name='Test Company',
            registration_number='123456789'
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            tenant=self.tenant,
            role='accountant'
        )
        self.customer = Customer.objects.create(
            tenant=self.tenant,
            name='Test Customer',
            email='customer@test.com',
            phone='+1234567890',
            address='123 Customer St',
            city='Customer City',
            country='Customer Country'
        )
        self.invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='draft',
            created_by=self.user
        )
    
    def test_invoice_creation(self):
        """Test invoice creation with required fields"""
        self.assertEqual(self.invoice.invoice_number, 'INV-001')
        self.assertEqual(self.invoice.customer, self.customer)
        self.assertEqual(self.invoice.total_amount, Decimal('1100.00'))
        self.assertEqual(self.invoice.status, 'draft')
        self.assertEqual(self.invoice.created_by, self.user)
    
    def test_invoice_str_representation(self):
        """Test invoice string representation"""
        self.assertEqual(str(self.invoice), 'INV-001 - Test Customer')
    
    def test_invoice_status_display(self):
        """Test invoice status display"""
        self.assertEqual(self.invoice.get_status_display(), 'Draft')
    
    def test_invoice_total_calculation(self):
        """Test invoice total calculation"""
        # Create invoice line
        line = InvoiceLine.objects.create(
            invoice=self.invoice,
            description='Test Item',
            quantity=Decimal('2.00'),
            unit_price=Decimal('500.00'),
            tax_rate=Decimal('10.00'),
            line_total=Decimal('1100.00')
        )
        
        # Recalculate total
        self.invoice.calculate_totals()
        self.assertEqual(self.invoice.subtotal, Decimal('1000.00'))
        self.assertEqual(self.invoice.tax_amount, Decimal('100.00'))
        self.assertEqual(self.invoice.total_amount, Decimal('1100.00'))


class InvoiceLineModelTest(TestCase):
    """Test InvoiceLine model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True
        )
        self.company = Company.objects.create(
            tenant=self.tenant,
            name='Test Company',
            registration_number='123456789'
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            tenant=self.tenant,
            role='accountant'
        )
        self.customer = Customer.objects.create(
            tenant=self.tenant,
            name='Test Customer',
            email='customer@test.com'
        )
        self.invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='draft',
            created_by=self.user
        )
        self.line = InvoiceLine.objects.create(
            invoice=self.invoice,
            description='Test Item',
            quantity=Decimal('2.00'),
            unit_price=Decimal('500.00'),
            tax_rate=Decimal('10.00'),
            line_total=Decimal('1100.00')
        )
    
    def test_line_creation(self):
        """Test invoice line creation"""
        self.assertEqual(self.line.description, 'Test Item')
        self.assertEqual(self.line.quantity, Decimal('2.00'))
        self.assertEqual(self.line.unit_price, Decimal('500.00'))
        self.assertEqual(self.line.line_total, Decimal('1100.00'))
    
    def test_line_str_representation(self):
        """Test line string representation"""
        self.assertEqual(str(self.line), 'Test Item - 1100.00')
    
    def test_line_total_calculation(self):
        """Test line total calculation"""
        self.line.calculate_line_total()
        expected_total = Decimal('2.00') * Decimal('500.00') * (Decimal('1.00') + Decimal('0.10'))
        self.assertEqual(self.line.line_total, expected_total)


class InvoiceTemplateModelTest(TestCase):
    """Test InvoiceTemplate model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True
        )
        self.company = Company.objects.create(
            tenant=self.tenant,
            name='Test Company',
            registration_number='123456789'
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            tenant=self.tenant,
            role='accountant'
        )
        self.template = InvoiceTemplate.objects.create(
            tenant=self.tenant,
            company=self.company,
            name='Standard Template',
            template_type='standard',
            header_html='<h1>Invoice</h1>',
            footer_html='<p>Thank you</p>',
            is_default=True,
            created_by=self.user
        )
    
    def test_template_creation(self):
        """Test template creation"""
        self.assertEqual(self.template.name, 'Standard Template')
        self.assertEqual(self.template.template_type, 'standard')
        self.assertTrue(self.template.is_default)
    
    def test_template_str_representation(self):
        """Test template string representation"""
        self.assertEqual(str(self.template), 'Standard Template')


class InvoicingAPITest(APITestCase):
    """Test invoicing APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            schema_name='test_tenant',
            is_active=True
        )
        self.company = Company.objects.create(
            tenant=self.tenant,
            name='Test Company',
            registration_number='123456789'
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            tenant=self.tenant,
            role='accountant'
        )
        self.customer = Customer.objects.create(
            tenant=self.tenant,
            name='Test Customer',
            email='customer@test.com',
            phone='+1234567890'
        )
    
    def test_invoice_list(self):
        """Test listing invoices"""
        # Create an invoice first
        invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='draft',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:invoice_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_invoice_create(self):
        """Test creating invoice"""
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:invoice_list')
        data = {
            'customer': self.customer.pk,
            'invoice_number': 'INV-002',
            'invoice_date': date.today().isoformat(),
            'due_date': date.today().isoformat(),
            'subtotal': '1000.00',
            'tax_amount': '100.00',
            'total_amount': '1100.00',
            'currency': 'USD',
            'status': 'draft',
            'lines': [
                {
                    'description': 'Test Item',
                    'quantity': '2.00',
                    'unit_price': '500.00',
                    'tax_rate': '10.00',
                    'line_total': '1100.00'
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['invoice_number'], 'INV-002')
    
    def test_invoice_detail(self):
        """Test retrieving invoice detail"""
        invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='draft',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:invoice_detail', kwargs={'pk': invoice.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['invoice_number'], 'INV-001')
    
    def test_invoice_approve(self):
        """Test approving invoice"""
        invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='draft',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:approve_invoice', kwargs={'pk': invoice.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if invoice is approved
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'approved')
    
    def test_invoice_send(self):
        """Test sending invoice"""
        invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='approved',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:send_invoice', kwargs={'pk': invoice.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if invoice is sent
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'sent')
    
    def test_invoice_template_list(self):
        """Test listing invoice templates"""
        template = InvoiceTemplate.objects.create(
            tenant=self.tenant,
            company=self.company,
            name='Standard Template',
            template_type='standard',
            is_default=True,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:template_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_invoice_template_create(self):
        """Test creating invoice template"""
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:template_list')
        data = {
            'name': 'Custom Template',
            'template_type': 'custom',
            'header_html': '<h1>Custom Invoice</h1>',
            'footer_html': '<p>Custom Footer</p>',
            'is_default': False
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Custom Template')
    
    def test_invoice_payment_create(self):
        """Test creating invoice payment"""
        invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='sent',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:payment_list')
        data = {
            'invoice': invoice.pk,
            'payment_date': date.today().isoformat(),
            'payment_method': 'bank_transfer',
            'amount': '1100.00',
            'reference': 'PAY-001',
            'notes': 'Payment received'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reference'], 'PAY-001')
    
    def test_invoice_stats(self):
        """Test invoice statistics"""
        # Create some invoices
        Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='paid',
            created_by=self.user
        )
        
        Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-002',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('2000.00'),
            tax_amount=Decimal('200.00'),
            total_amount=Decimal('2200.00'),
            currency='USD',
            status='overdue',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:invoice_stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_invoices', response.data)
        self.assertIn('total_amount', response.data)
        self.assertIn('paid_amount', response.data)
        self.assertIn('overdue_amount', response.data)
    
    def test_customer_invoices(self):
        """Test getting customer invoices"""
        invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='draft',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:customer_invoices', kwargs={'customer_id': self.customer.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_overdue_invoices(self):
        """Test getting overdue invoices"""
        # Create overdue invoice
        overdue_date = date.today().replace(day=date.today().day - 30)
        invoice = Invoice.objects.create(
            tenant=self.tenant,
            company=self.company,
            customer=self.customer,
            invoice_number='INV-001',
            invoice_date=date.today(),
            due_date=overdue_date,
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('100.00'),
            total_amount=Decimal('1100.00'),
            currency='USD',
            status='sent',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('invoicing:overdue_invoices')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
