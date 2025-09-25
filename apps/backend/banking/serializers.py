from rest_framework import serializers
from decimal import Decimal
from .models import BankAccount, BankTransaction, BankStatement, BankIntegration


class BankAccountSerializer(serializers.ModelSerializer):
    """Serializer for Bank Account"""
    current_balance = serializers.SerializerMethodField()
    available_balance = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'tenant', 'company', 'company_name', 'name', 'account_number',
            'bank_name', 'account_type', 'currency', 'opening_balance', 'current_balance',
            'available_balance', 'is_active', 'last_reconciliation_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_balance(self, obj):
        # Calculate current balance based on transactions
        transactions = BankTransaction.objects.filter(
            bank_account=obj,
            is_reconciled=True
        )
        balance = obj.opening_balance
        for transaction in transactions:
            if transaction.transaction_type == 'credit':
                balance += transaction.amount
            else:
                balance -= transaction.amount
        return balance
    
    def get_available_balance(self, obj):
        # Available balance might be different from current balance due to pending transactions
        current_balance = self.get_current_balance(obj)
        pending_transactions = BankTransaction.objects.filter(
            bank_account=obj,
            is_reconciled=False,
            transaction_type='debit'
        )
        pending_amount = sum(t.amount for t in pending_transactions)
        return current_balance - pending_amount


class BankTransactionSerializer(serializers.ModelSerializer):
    """Serializer for Bank Transaction"""
    bank_account_name = serializers.CharField(source='bank_account.name', read_only=True)
    running_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = BankTransaction
        fields = [
            'id', 'bank_account', 'bank_account_name', 'transaction_date', 'description',
            'reference', 'transaction_type', 'amount', 'currency', 'running_balance',
            'category', 'is_reconciled', 'reconciliation_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_running_balance(self, obj):
        # Calculate running balance up to this transaction
        transactions = BankTransaction.objects.filter(
            bank_account=obj.bank_account,
            transaction_date__lte=obj.transaction_date,
            id__lte=obj.id
        ).order_by('transaction_date', 'id')
        
        balance = obj.bank_account.opening_balance
        for transaction in transactions:
            if transaction.transaction_type == 'credit':
                balance += transaction.amount
            else:
                balance -= transaction.amount
        
        return balance


class BankStatementSerializer(serializers.ModelSerializer):
    """Serializer for Bank Statement"""
    bank_account_name = serializers.CharField(source='bank_account.name', read_only=True)
    total_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = BankStatement
        fields = [
            'id', 'bank_account', 'bank_account_name', 'statement_date', 'opening_balance',
            'closing_balance', 'total_transactions', 'file_path', 'is_processed',
            'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_transactions(self, obj):
        return BankTransaction.objects.filter(
            bank_account=obj.bank_account,
            transaction_date=obj.statement_date
        ).count()


class BankIntegrationSerializer(serializers.ModelSerializer):
    """Serializer for Bank Integration"""
    bank_account_name = serializers.CharField(source='bank_account.name', read_only=True)
    
    class Meta:
        model = BankIntegration
        fields = [
            'id', 'bank_account', 'bank_account_name', 'integration_type', 'provider',
            'api_key', 'api_secret', 'endpoint_url', 'is_active', 'last_sync_date',
            'sync_frequency', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BankReconciliationSerializer(serializers.Serializer):
    """Serializer for Bank Reconciliation"""
    bank_account_id = serializers.UUIDField()
    bank_account_name = serializers.CharField()
    statement_date = serializers.DateField()
    statement_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    book_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    difference = serializers.DecimalField(max_digits=15, decimal_places=2)
    reconciled_transactions = serializers.IntegerField()
    unreconciled_transactions = serializers.IntegerField()


class BankAccountSummarySerializer(serializers.Serializer):
    """Serializer for Bank Account Summary"""
    account_id = serializers.UUIDField()
    account_name = serializers.CharField()
    bank_name = serializers.CharField()
    account_type = serializers.CharField()
    current_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    available_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency = serializers.CharField()
    last_transaction_date = serializers.DateField()
    is_active = serializers.BooleanField()


class BankTransactionSummarySerializer(serializers.Serializer):
    """Serializer for Bank Transaction Summary"""
    transaction_id = serializers.UUIDField()
    transaction_date = serializers.DateField()
    description = serializers.CharField()
    reference = serializers.CharField()
    transaction_type = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    running_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    is_reconciled = serializers.BooleanField()
    category = serializers.CharField()


class BankStatsSerializer(serializers.Serializer):
    """Serializer for Bank Statistics"""
    total_accounts = serializers.IntegerField()
    total_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_transactions = serializers.IntegerField()
    unreconciled_transactions = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()
