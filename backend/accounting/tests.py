"""
Unit tests for accounting app
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
from .models import ChartOfAccounts, JournalEntry, JournalEntryLine

User = get_user_model()


class ChartOfAccountsModelTest(TestCase):
    """Test ChartOfAccounts model"""
    
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
        
        # Create parent account
        self.parent_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            account_code='1000',
            account_name='Assets',
            account_type='asset',
            parent=None,
            is_active=True,
            created_by=self.user
        )
        
        # Create child account
        self.child_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            account_code='1100',
            account_name='Cash and Cash Equivalents',
            account_type='asset',
            parent=self.parent_account,
            is_active=True,
            created_by=self.user
        )
    
    def test_account_creation(self):
        """Test account creation with required fields"""
        self.assertEqual(self.parent_account.account_code, '1000')
        self.assertEqual(self.parent_account.account_name, 'Assets')
        self.assertEqual(self.parent_account.account_type, 'asset')
        self.assertTrue(self.parent_account.is_active)
    
    def test_account_str_representation(self):
        """Test account string representation"""
        self.assertEqual(str(self.parent_account), '1000 - Assets')
    
    def test_account_hierarchy(self):
        """Test account parent-child relationship"""
        self.assertIsNone(self.parent_account.parent)
        self.assertEqual(self.child_account.parent, self.parent_account)
        self.assertIn(self.child_account, self.parent_account.children.all())
    
    def test_account_balance_calculation(self):
        """Test account balance calculation"""
        # Create journal entry
        journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            entry_date=date.today(),
            reference='TEST-001',
            description='Test entry',
            is_posted=True,
            created_by=self.user
        )
        
        # Create debit line
        JournalEntryLine.objects.create(
            journal_entry=journal_entry,
            account=self.child_account,
            description='Cash deposit',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        # Create credit line
        JournalEntryLine.objects.create(
            journal_entry=journal_entry,
            account=self.child_account,
            description='Cash withdrawal',
            debit_amount=Decimal('0.00'),
            credit_amount=Decimal('300.00')
        )
        
        # Calculate balance
        balance = self.child_account.get_balance()
        self.assertEqual(balance, Decimal('700.00'))  # 1000 - 300
    
    def test_account_type_display(self):
        """Test account type display"""
        self.assertEqual(self.parent_account.get_account_type_display(), 'Asset')


class JournalEntryModelTest(TestCase):
    """Test JournalEntry model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
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
        
        self.cash_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            account_code='1000',
            account_name='Cash',
            account_type='asset',
            is_active=True,
            created_by=self.user
        )
        
        self.revenue_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            account_code='4000',
            account_name='Revenue',
            account_type='revenue',
            is_active=True,
            created_by=self.user
        )
        
        self.journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            entry_date=date.today(),
            reference='JE-001',
            description='Test journal entry',
            is_posted=False,
            created_by=self.user
        )
    
    def test_journal_entry_creation(self):
        """Test journal entry creation"""
        self.assertEqual(self.journal_entry.reference, 'JE-001')
        self.assertEqual(self.journal_entry.description, 'Test journal entry')
        self.assertFalse(self.journal_entry.is_posted)
        self.assertEqual(self.journal_entry.created_by, self.user)
    
    def test_journal_entry_str_representation(self):
        """Test journal entry string representation"""
        self.assertEqual(str(self.journal_entry), 'JE-001 - Test journal entry')
    
    def test_journal_entry_balance_validation(self):
        """Test journal entry balance validation"""
        # Create balanced entry
        JournalEntryLine.objects.create(
            journal_entry=self.journal_entry,
            account=self.cash_account,
            description='Cash received',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        JournalEntryLine.objects.create(
            journal_entry=self.journal_entry,
            account=self.revenue_account,
            description='Revenue earned',
            debit_amount=Decimal('0.00'),
            credit_amount=Decimal('1000.00')
        )
        
        # Check if entry is balanced
        self.assertTrue(self.journal_entry.is_balanced())
        
        # Create unbalanced entry
        unbalanced_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            entry_date=date.today(),
            reference='JE-002',
            description='Unbalanced entry',
            is_posted=False,
            created_by=self.user
        )
        
        JournalEntryLine.objects.create(
            journal_entry=unbalanced_entry,
            account=self.cash_account,
            description='Cash received',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        # Check if entry is not balanced
        self.assertFalse(unbalanced_entry.is_balanced())


class JournalEntryLineModelTest(TestCase):
    """Test JournalEntryLine model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
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
        
        self.account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            account_code='1000',
            account_name='Cash',
            account_type='asset',
            is_active=True,
            created_by=self.user
        )
        
        self.journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            entry_date=date.today(),
            reference='JE-001',
            description='Test entry',
            is_posted=False,
            created_by=self.user
        )
        
        self.line = JournalEntryLine.objects.create(
            journal_entry=self.journal_entry,
            account=self.account,
            description='Cash deposit',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
    
    def test_line_creation(self):
        """Test journal entry line creation"""
        self.assertEqual(self.line.account, self.account)
        self.assertEqual(self.line.description, 'Cash deposit')
        self.assertEqual(self.line.debit_amount, Decimal('1000.00'))
        self.assertEqual(self.line.credit_amount, Decimal('0.00'))
    
    def test_line_str_representation(self):
        """Test line string representation"""
        self.assertEqual(str(self.line), 'Cash deposit - 1000.00')
    
    def test_line_net_amount(self):
        """Test line net amount calculation"""
        self.assertEqual(self.line.net_amount, Decimal('1000.00'))
        
        # Test credit line
        credit_line = JournalEntryLine.objects.create(
            journal_entry=self.journal_entry,
            account=self.account,
            description='Cash withdrawal',
            debit_amount=Decimal('0.00'),
            credit_amount=Decimal('300.00')
        )
        self.assertEqual(credit_line.net_amount, Decimal('-300.00'))


class AccountingAPITest(APITestCase):
    """Test accounting APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
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
        
        self.cash_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            account_code='1000',
            account_name='Cash',
            account_type='asset',
            is_active=True,
            created_by=self.user
        )
        
        self.revenue_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            account_code='4000',
            account_name='Revenue',
            account_type='revenue',
            is_active=True,
            created_by=self.user
        )
    
    def test_account_list(self):
        """Test listing chart of accounts"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:account_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_account_create(self):
        """Test creating new account"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:account_list')
        data = {
            'account_code': '2000',
            'account_name': 'Accounts Payable',
            'account_type': 'liability',
            'is_active': True
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['account_name'], 'Accounts Payable')
    
    def test_account_detail(self):
        """Test retrieving account detail"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:account_detail', kwargs={'pk': self.cash_account.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['account_name'], 'Cash')
    
    def test_journal_entry_create(self):
        """Test creating journal entry"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:journal_entry_list')
        data = {
            'entry_date': date.today().isoformat(),
            'reference': 'JE-001',
            'description': 'Test entry',
            'lines': [
                {
                    'account': self.cash_account.pk,
                    'description': 'Cash received',
                    'debit_amount': '1000.00',
                    'credit_amount': '0.00'
                },
                {
                    'account': self.revenue_account.pk,
                    'description': 'Revenue earned',
                    'debit_amount': '0.00',
                    'credit_amount': '1000.00'
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reference'], 'JE-001')
    
    def test_journal_entry_list(self):
        """Test listing journal entries"""
        # Create a journal entry first
        journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            entry_date=date.today(),
            reference='JE-001',
            description='Test entry',
            is_posted=False,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:journal_entry_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_post_journal_entry(self):
        """Test posting journal entry"""
        # Create a balanced journal entry
        journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            entry_date=date.today(),
            reference='JE-001',
            description='Test entry',
            is_posted=False,
            created_by=self.user
        )
        
        JournalEntryLine.objects.create(
            journal_entry=journal_entry,
            account=self.cash_account,
            description='Cash received',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        JournalEntryLine.objects.create(
            journal_entry=journal_entry,
            account=self.revenue_account,
            description='Revenue earned',
            debit_amount=Decimal('0.00'),
            credit_amount=Decimal('1000.00')
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:post_journal_entry', kwargs={'pk': journal_entry.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if entry is posted
        journal_entry.refresh_from_db()
        self.assertTrue(journal_entry.is_posted)
    
    def test_trial_balance(self):
        """Test trial balance report"""
        # Create posted journal entry
        journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            entry_date=date.today(),
            reference='JE-001',
            description='Test entry',
            is_posted=True,
            created_by=self.user
        )
        
        JournalEntryLine.objects.create(
            journal_entry=journal_entry,
            account=self.cash_account,
            description='Cash received',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        JournalEntryLine.objects.create(
            journal_entry=journal_entry,
            account=self.revenue_account,
            description='Revenue earned',
            debit_amount=Decimal('0.00'),
            credit_amount=Decimal('1000.00')
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:trial_balance')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('accounts', response.data)
        self.assertIn('total_debits', response.data)
        self.assertIn('total_credits', response.data)
