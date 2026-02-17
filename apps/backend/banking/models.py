from django.db import models
import uuid
from decimal import Decimal
from backend.enhanced_base_models import TenantScopedModel, FinancialModel


class BankAccount(FinancialModel):
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


class BankTransaction(FinancialModel):
    """
    Bank Transaction model for recording bank transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='bank_transactions')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
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
        # Update balance after transaction (only if bank_account is set)
        if not self.balance_after and self.bank_account:
            if self.type == 'deposit':
                self.balance_after = self.bank_account.current_balance + self.amount
            else:
                self.balance_after = self.bank_account.current_balance - self.amount
        
        super().save(*args, **kwargs)
        
        # Update bank account balance if transaction is reconciled
        if self.is_reconciled and self.bank_account:
            self.bank_account.update_balance()


class BankStatement(FinancialModel):
    """
    Bank Statement model for importing bank statements
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='bank_statements')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='bank_statements', null=True, blank=True)
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
        bank_account_name = self.bank_account.name if self.bank_account else "Unknown"
        return f"Statement for {bank_account_name} - {self.statement_date}"


class BankIntegration(FinancialModel):
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


class PlaidConnection(FinancialModel):
    """
    Plaid Connection model for managing Plaid bank connections
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='plaid_connections')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='plaid_connections')
    integration = models.ForeignKey(BankIntegration, on_delete=models.CASCADE, related_name='plaid_connections', null=True, blank=True)
    item_id = models.CharField(max_length=255, help_text='Plaid Item ID')
    access_token = models.CharField(max_length=500, help_text='Encrypted Plaid access token')
    institution_id = models.CharField(max_length=255, blank=True)
    institution_name = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default='active', choices=[
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('error', 'Error'),
        ('disconnected', 'Disconnected'),
    ])
    error_code = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    last_successful_sync = models.DateTimeField(null=True, blank=True)
    last_failed_sync = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'plaid_connections'
        verbose_name = 'Plaid Connection'
        verbose_name_plural = 'Plaid Connections'
        ordering = ['-created_at']
        unique_together = ['tenant', 'item_id']

    def __str__(self):
        return f"Plaid - {self.institution_name} ({self.item_id[:8]}...)"


class ImportExportJob(FinancialModel):
    """
    Import/Export Job model for tracking banking data import/export operations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='import_export_jobs')
    job_type = models.CharField(max_length=20, choices=[
        ('import', 'Import'),
        ('export', 'Export'),
    ])
    file_format = models.CharField(max_length=50, choices=[
        ('csv', 'CSV'),
        ('xlsx', 'Excel'),
        ('ofx', 'OFX'),
        ('qif', 'QIF'),
        ('json', 'JSON'),
    ])
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    total_records = models.IntegerField(default=0)
    processed_records = models.IntegerField(default=0)
    failed_records = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, null=True, blank=True, related_name='import_export_jobs')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='import_export_jobs')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'import_export_jobs'
        verbose_name = 'Import/Export Job'
        verbose_name_plural = 'Import/Export Jobs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_job_type_display()} - {self.file_name} ({self.status})"


class BankingSettings(FinancialModel):
    """
    Banking Settings model for tenant/company-specific banking configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='banking_settings')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='banking_settings', null=True, blank=True)
    
    # General Settings
    default_currency = models.CharField(max_length=3, default='USD')
    auto_reconcile = models.BooleanField(default=False)
    auto_reconcile_days = models.IntegerField(default=30, help_text='Days to auto-reconcile transactions')
    
    # Integration Settings
    enable_plaid = models.BooleanField(default=False)
    enable_auto_sync = models.BooleanField(default=True)
    sync_frequency = models.CharField(max_length=20, default='daily', choices=[
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('manual', 'Manual'),
    ])
    
    # Security Settings
    require_approval_for_large_transactions = models.BooleanField(default=True)
    large_transaction_threshold = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('10000.00'))
    enable_transaction_alerts = models.BooleanField(default=True)
    
    # Notification Settings
    notify_on_reconciliation = models.BooleanField(default=True)
    notify_on_sync_error = models.BooleanField(default=True)
    notify_on_large_transaction = models.BooleanField(default=True)
    
    # Import/Export Settings
    default_export_format = models.CharField(max_length=20, default='csv', choices=[
        ('csv', 'CSV'),
        ('xlsx', 'Excel'),
        ('json', 'JSON'),
    ])
    auto_delete_old_exports = models.BooleanField(default=False)
    export_retention_days = models.IntegerField(default=90)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'banking_settings'
        verbose_name = 'Banking Settings'
        verbose_name_plural = 'Banking Settings'
        unique_together = ['tenant', 'company']

    def __str__(self):
        return f"Banking Settings - {self.tenant.name}"
