from django.db import models
import uuid
from decimal import Decimal


class ChartOfAccounts(models.Model):
    """
    Chart of Accounts model for managing GL accounts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='chart_of_accounts')
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=[
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
    ])
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


class JournalEntry(models.Model):
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


class BankReconciliation(models.Model):
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
