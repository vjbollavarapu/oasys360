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
from .models import ChartOfAccounts, JournalEntry, JournalEntryLine, GLAccountType

User = get_user_model()


class ChartOfAccountsModelTest(TestCase):
    """Test ChartOfAccounts model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            slug='test_tenant',
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
        
        # Create GL Account Types
        self.asset_type = GLAccountType.objects.create(
            tenant=self.tenant,
            code='asset',
            name='Asset',
            normal_balance='debit'
        )
        
        # Create parent account
        self.parent_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='1000',
            name='Assets',
            account_type=self.asset_type,
            type='asset',
            parent=None,
            is_active=True,
            created_by=self.user,
            normal_balance='debit'
        )
        
        # Create child account
        self.child_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='1100',
            name='Cash and Cash Equivalents',
            account_type=self.asset_type,
            type='asset',
            parent=self.parent_account,
            is_active=True,
            created_by=self.user,
            normal_balance='debit'
        )
    
    def test_account_creation(self):
        """Test account creation with required fields"""
        self.assertEqual(self.parent_account.code, '1000')
        self.assertEqual(self.parent_account.name, 'Assets')
        self.assertEqual(self.parent_account.account_type, self.asset_type)
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
            company=self.company,
            date=date.today(),
            reference='TEST-001',
            description='Test entry',
            status='posted',
            created_by=self.user
        )
        
        # Create debit line
        JournalEntryLine.objects.create(
            tenant=self.tenant,
            journal_entry=journal_entry,
            account=self.child_account,
            description='Cash deposit',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        # Create credit line
        JournalEntryLine.objects.create(
            tenant=self.tenant,
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
        # Since we use FK, get_account_type_display refers to the type CharField choices if used, 
        # or we verify the FK relationship name
        self.assertEqual(self.parent_account.type, 'asset')


class JournalEntryModelTest(TestCase):
    """Test JournalEntry model"""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            slug='test_tenant_je',
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
        
        self.asset_type = GLAccountType.objects.create(
            tenant=self.tenant,
            code='asset',
            name='Asset',
            normal_balance='debit'
        )
        self.revenue_type = GLAccountType.objects.create(
            tenant=self.tenant,
            code='revenue',
            name='Revenue',
            normal_balance='credit'
        )
        
        self.cash_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='1000',
            name='Cash',
            account_type=self.asset_type,
            type='asset',
            is_active=True,
            created_by=self.user,
            normal_balance='debit'
        )
        
        self.revenue_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='4000',
            name='Revenue',
            account_type=self.revenue_type,
            type='revenue',
            is_active=True,
            created_by=self.user,
            normal_balance='credit'
        )
        
        self.journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            company=self.company,
            date=date.today(),
            reference='JE-001',
            description='Test journal entry',
            status='draft',
            created_by=self.user
        )
    
    def test_journal_entry_creation(self):
        """Test journal entry creation"""
        self.assertEqual(self.journal_entry.reference, 'JE-001')
        self.assertEqual(self.journal_entry.description, 'Test journal entry')
        self.assertEqual(self.journal_entry.status, 'draft')
        self.assertEqual(self.journal_entry.created_by, self.user)
    
    def test_journal_entry_str_representation(self):
        """Test journal entry string representation"""
        self.assertEqual(str(self.journal_entry), f"JE-001 - Test journal entry ({date.today()})")
    
    def test_journal_entry_balance_validation(self):
        """Test journal entry balance validation"""
        # Create balanced entry
        JournalEntryLine.objects.create(
            tenant=self.tenant,
            journal_entry=self.journal_entry,
            account=self.cash_account,
            description='Cash received',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        JournalEntryLine.objects.create(
            tenant=self.tenant,
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
            company=self.company,
            date=date.today(),
            reference='JE-002',
            description='Unbalanced entry',
            status='draft',
            created_by=self.user
        )
        
        JournalEntryLine.objects.create(
            tenant=self.tenant,
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
            slug='test_tenant_jel',
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
        
        self.asset_type = GLAccountType.objects.create(
            tenant=self.tenant,
            code='asset',
            name='Asset',
            normal_balance='debit'
        )
        
        self.account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='1000',
            name='Cash',
            account_type=self.asset_type,
            type='asset',
            is_active=True,
            created_by=self.user,
            normal_balance='debit'
        )
        
        self.journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            company=self.company,
            date=date.today(),
            reference='JE-001',
            description='Test entry',
            status='draft',
            created_by=self.user
        )
        
        self.line = JournalEntryLine.objects.create(
            tenant=self.tenant,
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
        self.assertEqual(str(self.line), '1000 - Cash deposit')


class AccountingAPITest(APITestCase):
    """Test accounting APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            slug='test_tenant_api',
            is_active=True
        )
        self.client.credentials(HTTP_X_TENANT_ID=str(self.tenant.id))
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
        
        self.asset_type = GLAccountType.objects.create(
            tenant=self.tenant,
            code='asset',
            name='Asset',
            normal_balance='debit'
        )
        self.revenue_type = GLAccountType.objects.create(
            tenant=self.tenant,
            code='revenue',
            name='Revenue',
            normal_balance='credit'
        )
        self.liability_type = GLAccountType.objects.create(
            tenant=self.tenant,
            code='liability',
            name='Liability',
            normal_balance='credit'
        )
        
        self.cash_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='1000',
            name='Cash',
            account_type=self.asset_type,
            type='asset',
            is_active=True,
            created_by=self.user,
            normal_balance='debit'
        )
        
        self.revenue_account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='4000',
            name='Revenue',
            account_type=self.revenue_type,
            type='revenue',
            is_active=True,
            created_by=self.user,
            normal_balance='credit'
        )
    
    def test_account_list(self):
        """Test listing chart of accounts"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:accounts_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # We expect 2 accounts created in setUp
        self.assertEqual(len(response.data), 2)
    
    def test_account_create(self):
        """Test creating new account"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:accounts_list')
        data = {
            'code': '2000',
            'name': 'Accounts Payable',
            'account_type': self.liability_type.id,
            'is_active': True,
            'normal_balance': 'credit'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Accounts Payable')
    
    def test_account_detail(self):
        """Test retrieving account detail"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:accounts_detail', kwargs={'pk': self.cash_account.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Cash')
    
    def test_journal_entry_create(self):
        """Test creating journal entry"""
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:journal_entries_list')
        data = {
            'date': date.today().isoformat(),
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
            company=self.company,
            date=date.today(),
            reference='JE-001',
            description='Test entry',
            status='draft',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:journal_entries_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_post_journal_entry(self):
        """Test posting journal entry"""
        # Create a balanced journal entry
        journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            company=self.company,
            date=date.today(),
            reference='JE-001',
            description='Test entry',
            status='draft',
            created_by=self.user
        )
        
        JournalEntryLine.objects.create(
            tenant=self.tenant,
            journal_entry=journal_entry,
            account=self.cash_account,
            description='Cash received',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        JournalEntryLine.objects.create(
            tenant=self.tenant,
            journal_entry=journal_entry,
            account=self.revenue_account,
            description='Revenue earned',
            debit_amount=Decimal('0.00'),
            credit_amount=Decimal('1000.00')
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('accounting:post_journal_entry', kwargs={'pk': journal_entry.pk})
        response = self.client.post(url, {}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if entry is posted
        journal_entry.refresh_from_db()
        self.assertEqual(journal_entry.status, 'posted')
        self.assertTrue(journal_entry.posted_at is not None)
    
    def test_trial_balance(self):
        """Test trial balance report"""
        # Create posted journal entry
        journal_entry = JournalEntry.objects.create(
            tenant=self.tenant,
            company=self.company,
            date=date.today(),
            reference='JE-001',
            description='Test entry',
            status='posted',
            created_by=self.user
        )
        
        JournalEntryLine.objects.create(
            tenant=self.tenant,
            journal_entry=journal_entry,
            account=self.cash_account,
            description='Cash received',
            debit_amount=Decimal('1000.00'),
            credit_amount=Decimal('0.00')
        )
        
        JournalEntryLine.objects.create(
            tenant=self.tenant,
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
        if isinstance(response.data, list):
             self.assertGreaterEqual(len(response.data), 2)
        else:
             self.assertIn('accounts', response.data)
             self.assertIn('total_debits', response.data)
             self.assertIn('total_credits', response.data)
