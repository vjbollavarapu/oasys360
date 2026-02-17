from django.db import models
from django.utils import timezone
import uuid
from decimal import Decimal
from backend.enhanced_base_models import TenantScopedModel, FinancialModel


class GLAccountType(FinancialModel):
    """
    GL Account Type model for standardizing account type definitions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='gl_account_types')
    code = models.CharField(max_length=50, help_text='Account type code (e.g., asset, liability)')
    name = models.CharField(max_length=255, help_text='Account type name (e.g., Asset, Liability)')
    normal_balance = models.CharField(max_length=10, choices=[
        ('debit', 'Debit'),
        ('credit', 'Credit'),
    ], help_text='Normal balance for this account type')
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False, help_text='System-defined types cannot be deleted')
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0, help_text='Order for display in UI')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'gl_account_types'
        verbose_name = 'GL Account Type'
        verbose_name_plural = 'GL Account Types'
        unique_together = ['tenant', 'code']
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class ChartOfAccounts(FinancialModel):
    """
    Chart of Accounts model for managing GL accounts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='chart_of_accounts')
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    # Use ForeignKey to GLAccountType for better normalization and extensibility
    account_type = models.ForeignKey(GLAccountType, on_delete=models.PROTECT, related_name='accounts', null=True, blank=True, help_text='Account type (FK to GLAccountType)')
    # Keep type field for backward compatibility and migration period
    type = models.CharField(max_length=50, choices=[
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
    ], help_text='Account type (legacy field, use account_type FK)')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False)  # System accounts cannot be deleted
    normal_balance = models.CharField(max_length=10, choices=[
        ('debit', 'Debit'),
        ('credit', 'Credit'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chart_of_accounts'
        unique_together = ['tenant', 'code']
        verbose_name = 'Chart of Account'
        verbose_name_plural = 'Chart of Accounts'

    def __str__(self):
        return f"{self.code} - {self.name}"

    def get_balance(self, as_of_date=None):
        """Get account balance as of a specific date"""
        from django.utils import timezone
        if as_of_date is None:
            as_of_date = timezone.now().date()
        
        # Get all journal entry lines for this account up to the date
        lines = JournalEntryLine.objects.filter(
            account=self,
            journal_entry__date__lte=as_of_date,
            journal_entry__status='posted'
        )
        
        balance = Decimal('0.00')
        for line in lines:
            if self.normal_balance == 'debit':
                balance += line.debit_amount - line.credit_amount
            else:
                balance += line.credit_amount - line.debit_amount
        
        return balance

    def get_children_balance(self, as_of_date=None):
        """Get total balance of all child accounts"""
        if not self.children.exists():
            return self.get_balance(as_of_date)
        
        total_balance = Decimal('0.00')
        for child in self.children.filter(is_active=True):
            total_balance += child.get_children_balance(as_of_date)
        
        return total_balance


class JournalEntry(FinancialModel):
    """
    Journal Entry model for recording financial transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='journal_entries')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='journal_entries')
    date = models.DateField()
    reference = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('cancelled', 'Cancelled'),
    ])
    entry_type = models.CharField(max_length=50, choices=[
        ('manual', 'Manual Entry'),
        ('system', 'System Generated'),
        ('recurring', 'Recurring Entry'),
        ('adjustment', 'Adjustment Entry'),
    ], default='manual')
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_entries')
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, null=True, blank=True, related_name='approved_entries')
    posted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'journal_entries'
        verbose_name = 'Journal Entry'
        verbose_name_plural = 'Journal Entries'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.reference} - {self.description} ({self.date})"

    def get_total_debits(self):
        """Get total debits for this entry"""
        return sum(line.debit_amount for line in self.lines.all())

    def get_total_credits(self):
        """Get total credits for this entry"""
        return sum(line.credit_amount for line in self.lines.all())

    def is_balanced(self):
        """Check if debits equal credits"""
        return self.get_total_debits() == self.get_total_credits()

    def can_post(self):
        """Check if entry can be posted"""
        return (
            self.status == 'draft' and 
            self.is_balanced() and 
            self.lines.count() >= 2
        )

    def post(self, approved_by=None):
        """Post the journal entry"""
        if not self.can_post():
            raise ValueError("Journal entry cannot be posted")
        
        self.status = 'posted'
        self.approved_by = approved_by
        self.posted_at = timezone.now()
        self.save()


class JournalEntryLine(models.Model):
    """
    Journal Entry Line model for individual line items in journal entries
    """
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='journal_entry_lines')
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE, related_name='journal_lines')
    description = models.TextField()
    debit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'journal_entry_lines'
        verbose_name = 'Journal Entry Line'
        verbose_name_plural = 'Journal Entry Lines'

    def __str__(self):
        return f"{self.account.code} - {self.description}"

    def clean(self):
        """Validate that either debit or credit amount is set, but not both"""
        from django.core.exceptions import ValidationError
        
        if self.debit_amount > 0 and self.credit_amount > 0:
            raise ValidationError("A line cannot have both debit and credit amounts")
        
        if self.debit_amount == 0 and self.credit_amount == 0:
            raise ValidationError("A line must have either a debit or credit amount")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class BankReconciliation(FinancialModel):
    """
    Bank Reconciliation model for reconciling bank statements
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='bank_reconciliations')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='bank_reconciliations')
    bank_account = models.ForeignKey('banking.BankAccount', on_delete=models.CASCADE, related_name='reconciliations')
    statement_date = models.DateField()
    statement_balance = models.DecimalField(max_digits=15, decimal_places=2)
    book_balance = models.DecimalField(max_digits=15, decimal_places=2)
    reconciled_balance = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ])
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    completed_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, null=True, blank=True, related_name='completed_reconciliations')
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bank_reconciliations'
        verbose_name = 'Bank Reconciliation'
        verbose_name_plural = 'Bank Reconciliations'
        ordering = ['-statement_date']

    def __str__(self):
        return f"Reconciliation for {self.bank_account.name} - {self.statement_date}"

    def get_unreconciled_transactions(self):
        """Get unreconciled transactions for this bank account"""
        return self.bank_account.transactions.filter(
            is_reconciled=False,
            date__lte=self.statement_date
        )


class FiscalYear(FinancialModel):
    """
    Fiscal Year model for managing accounting periods
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='fiscal_years')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='fiscal_years')
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, default='open', choices=[
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('locked', 'Locked'),
    ])
    is_current = models.BooleanField(default=False)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fiscal_years'
        verbose_name = 'Fiscal Year'
        verbose_name_plural = 'Fiscal Years'
        ordering = ['-start_date']
        unique_together = ['tenant', 'company', 'start_date', 'end_date']

    def __str__(self):
        return f"{self.name} ({self.start_date} to {self.end_date})"


class FiscalPeriod(FinancialModel):
    """
    Fiscal Period model for managing periods within a fiscal year
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='fiscal_periods')
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.CASCADE, related_name='periods')
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, default='open', choices=[
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('locked', 'Locked'),
    ])
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fiscal_periods'
        verbose_name = 'Fiscal Period'
        verbose_name_plural = 'Fiscal Periods'
        ordering = ['start_date']
        unique_together = ['fiscal_year', 'start_date', 'end_date']

    def __str__(self):
        return f"{self.name} ({self.start_date} to {self.end_date})"


class PettyCashAccount(FinancialModel):
    """
    Petty Cash Account model for managing petty cash funds
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='petty_cash_accounts')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='petty_cash_accounts')
    name = models.CharField(max_length=255)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    initial_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    max_balance = models.DecimalField(max_digits=15, decimal_places=2)
    custodian = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='petty_cash_accounts')
    location = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'petty_cash_accounts'
        verbose_name = 'Petty Cash Account'
        verbose_name_plural = 'Petty Cash Accounts'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.custodian.get_full_name()}"


class PettyCashTransaction(FinancialModel):
    """
    Petty Cash Transaction model for recording petty cash transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='petty_cash_transactions')
    account = models.ForeignKey(PettyCashAccount, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField()
    type = models.CharField(max_length=20, choices=[
        ('expense', 'Expense'),
        ('replenishment', 'Replenishment'),
        ('adjustment', 'Adjustment'),
    ])
    description = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    category = models.CharField(max_length=100, blank=True)
    receipt_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ])
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='petty_cash_transactions')
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, null=True, blank=True, related_name='approved_petty_cash_transactions')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'petty_cash_transactions'
        verbose_name = 'Petty Cash Transaction'
        verbose_name_plural = 'Petty Cash Transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.type} - {self.description} ({self.amount})"


class CreditDebitNote(FinancialModel):
    """
    Credit/Debit Note model for managing credit and debit notes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='credit_debit_notes')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='credit_debit_notes')
    number = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=[
        ('credit', 'Credit Note'),
        ('debit', 'Debit Note'),
    ])
    date = models.DateField()
    customer = models.ForeignKey('sales.Customer', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_debit_notes')
    supplier = models.ForeignKey('purchase.Supplier', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_debit_notes')
    invoice_number = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    reason = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('cancelled', 'Cancelled'),
    ])
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_credit_debit_notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_debit_notes'
        verbose_name = 'Credit/Debit Note'
        verbose_name_plural = 'Credit/Debit Notes'
        ordering = ['-date', '-created_at']
        unique_together = ['tenant', 'company', 'number']

    def __str__(self):
        return f"{self.number} - {self.type} ({self.amount})"


class AccountingSettings(FinancialModel):
    """
    Accounting Settings model for tenant/company-specific accounting configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='accounting_settings')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='accounting_settings', null=True, blank=True)
    
    # Currency settings
    base_currency = models.CharField(max_length=3, default='USD')
    display_currency = models.CharField(max_length=3, default='USD')
    
    # Fiscal year settings
    fiscal_year_start_month = models.IntegerField(default=1)  # 1-12 for January-December
    fiscal_year_start_day = models.IntegerField(default=1)  # 1-31
    
    # Accounting method
    accounting_method = models.CharField(max_length=20, default='accrual', choices=[
        ('accrual', 'Accrual'),
        ('cash', 'Cash'),
    ])
    
    # Number formatting
    decimal_places = models.IntegerField(default=2)
    thousands_separator = models.CharField(max_length=1, default=',')
    decimal_separator = models.CharField(max_length=1, default='.')
    
    # Date format
    date_format = models.CharField(max_length=20, default='YYYY-MM-DD')
    
    # Auto-numbering
    journal_entry_prefix = models.CharField(max_length=10, default='JE')
    journal_entry_number_format = models.CharField(max_length=50, default='{prefix}-{year}-{number:04d}')
    
    # Lock periods
    lock_closed_periods = models.BooleanField(default=True)
    allow_backdating = models.BooleanField(default=False)
    max_backdate_days = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounting_settings'
        verbose_name = 'Accounting Settings'
        verbose_name_plural = 'Accounting Settings'
        unique_together = ['tenant', 'company']

    def __str__(self):
        return f"Accounting Settings - {self.tenant.name}"
