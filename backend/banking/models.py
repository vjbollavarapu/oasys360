from django.db import models
import uuid
from decimal import Decimal


class BankAccount(models.Model):
    """
    Bank Account model for managing bank accounts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='bank_accounts')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='bank_accounts')
    name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=50, blank=True)
    routing_number = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50, choices=[
        ('checking', 'Checking'),
        ('savings', 'Savings'),
        ('money_market', 'Money Market'),
        ('credit_card', 'Credit Card'),
        ('line_of_credit', 'Line of Credit'),
    ])
    currency = models.CharField(max_length=3, default='USD')
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gl_account = models.ForeignKey('accounting.ChartOfAccounts', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_reconciled = models.BooleanField(default=False)
    last_reconciliation_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bank_accounts'
        verbose_name = 'Bank Account'
        verbose_name_plural = 'Bank Accounts'
        unique_together = ['tenant', 'company', 'account_number']

    def __str__(self):
        return f"{self.name} - {self.bank_name}"

    def get_balance_as_of(self, date):
        """Get account balance as of a specific date"""
        transactions = self.transactions.filter(
            date__lte=date,
            is_reconciled=True
        )
        
        balance = self.opening_balance
        for transaction in transactions:
            if transaction.type == 'deposit':
                balance += transaction.amount
            else:
                balance -= transaction.amount
        
        return balance

    def update_balance(self):
        """Update current balance based on reconciled transactions"""
        reconciled_transactions = self.transactions.filter(is_reconciled=True)
        
        balance = self.opening_balance
        for transaction in reconciled_transactions:
            if transaction.type == 'deposit':
                balance += transaction.amount
            else:
                balance -= transaction.amount
        
        self.current_balance = balance
        self.save()


class BankTransaction(models.Model):
    """
    Bank Transaction model for recording bank transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField()
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=[
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('fee', 'Fee'),
        ('interest', 'Interest'),
    ])
    transaction_date = models.DateField(null=True, blank=True)
    transaction_type = models.CharField(max_length=50, choices=[
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('fee', 'Fee'),
        ('interest', 'Interest'),
    ])
    reconciliation_date = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    notes = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    balance_after = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_reconciled = models.BooleanField(default=False)
    reconciliation_id = models.CharField(max_length=100, blank=True)
    journal_entry = models.ForeignKey('accounting.JournalEntry', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bank_transactions'
        verbose_name = 'Bank Transaction'
        verbose_name_plural = 'Bank Transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.date} - {self.description} ({self.amount})"

    def save(self, *args, **kwargs):
        # Update balance after transaction
        if not self.balance_after:
            if self.type == 'deposit':
                self.balance_after = self.bank_account.current_balance + self.amount
            else:
                self.balance_after = self.bank_account.current_balance - self.amount
        
        super().save(*args, **kwargs)
        
        # Update bank account balance if transaction is reconciled
        if self.is_reconciled:
            self.bank_account.update_balance()


class BankStatement(models.Model):
    """
    Bank Statement model for importing bank statements
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='statements')
    statement_date = models.DateField()
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = models.DecimalField(max_digits=15, decimal_places=2)
    file_path = models.CharField(max_length=500, blank=True)
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bank_statements'
        verbose_name = 'Bank Statement'
        verbose_name_plural = 'Bank Statements'
        ordering = ['-statement_date']

    def __str__(self):
        return f"Statement for {self.bank_account.name} - {self.statement_date}"


class BankIntegration(models.Model):
    """
    Bank Integration model for managing bank API connections
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='bank_integrations')
    bank_name = models.CharField(max_length=255)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='bank_integrations')
    integration_type = models.CharField(max_length=50, choices=[
        ('plaid', 'Plaid'),
        ('yodlee', 'Yodlee'),
        ('teller', 'Teller'),
        ('manual', 'Manual'),
    ])
    provider = models.CharField(max_length=50, choices=[
        ('plaid', 'Plaid'),
        ('yodlee', 'Yodlee'),
        ('teller', 'Teller'),
        ('manual', 'Manual'),
    ])
    last_sync_date = models.DateTimeField(null=True, blank=True)
    endpoint_url = models.URLField(blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    api_secret = models.CharField(max_length=255, blank=True)
    access_token = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_frequency = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ], default='daily')
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bank_integrations'
        verbose_name = 'Bank Integration'
        verbose_name_plural = 'Bank Integrations'

    def __str__(self):
        return f"{self.bank_name} - {self.integration_type}"
