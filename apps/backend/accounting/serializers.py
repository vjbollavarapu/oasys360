from rest_framework import serializers
from decimal import Decimal
from .models import ChartOfAccounts, JournalEntry, JournalEntryLine, BankReconciliation


class ChartOfAccountsSerializer(serializers.ModelSerializer):
    """Serializer for Chart of Accounts"""
    balance = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = ChartOfAccounts
        fields = [
            'id', 'tenant', 'code', 'name', 'type', 'parent', 'parent_name',
            'description', 'is_active', 'is_system', 'normal_balance',
            'balance', 'children_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_balance(self, obj):
        as_of_date = self.context.get('as_of_date')
        return obj.get_balance(as_of_date)
    
    def get_children_count(self, obj):
        return obj.children.count()


class JournalEntrySerializer(serializers.ModelSerializer):
    """Serializer for Journal Entry"""
    total_debit = serializers.SerializerMethodField()
    total_credit = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'tenant', 'company', 'date', 'reference', 'description',
            'status', 'entry_type', 'created_by', 'created_by_name',
            'approved_by', 'approved_by_name', 'posted_at', 'total_debit',
            'total_credit', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'posted_at']
    
    def get_total_debit(self, obj):
        return sum(line.debit_amount for line in obj.lines.all())
    
    def get_total_credit(self, obj):
        return sum(line.credit_amount for line in obj.lines.all())


class JournalEntryLineSerializer(serializers.ModelSerializer):
    """Serializer for Journal Entry Line"""
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_code = serializers.CharField(source='account.code', read_only=True)
    
    class Meta:
        model = JournalEntryLine
        fields = [
            'id', 'journal_entry', 'account', 'account_name', 'account_code',
            'description', 'debit_amount', 'credit_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JournalEntryWithLinesSerializer(JournalEntrySerializer):
    """Serializer for Journal Entry with lines"""
    lines = JournalEntryLineSerializer(many=True, read_only=True)
    
    class Meta(JournalEntrySerializer.Meta):
        fields = JournalEntrySerializer.Meta.fields + ['lines']


class BankReconciliationSerializer(serializers.ModelSerializer):
    """Serializer for Bank Reconciliation"""
    reconciled_amount = serializers.SerializerMethodField()
    unreconciled_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = BankReconciliation
        fields = [
            'id', 'tenant', 'company', 'bank_account', 'statement_date',
            'statement_balance', 'book_balance', 'reconciled_amount',
            'unreconciled_amount', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_reconciled_amount(self, obj):
        return obj.reconciled_amount if hasattr(obj, 'reconciled_amount') else Decimal('0.00')
    
    def get_unreconciled_amount(self, obj):
        return obj.unreconciled_amount if hasattr(obj, 'unreconciled_amount') else Decimal('0.00')


class TrialBalanceSerializer(serializers.Serializer):
    """Serializer for Trial Balance"""
    account_code = serializers.CharField()
    account_name = serializers.CharField()
    account_type = serializers.CharField()
    debit_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=15, decimal_places=2)


class IncomeStatementSerializer(serializers.Serializer):
    """Serializer for Income Statement"""
    revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    period_start = serializers.DateField()
    period_end = serializers.DateField()


class BalanceSheetSerializer(serializers.Serializer):
    """Serializer for Balance Sheet"""
    assets = serializers.DecimalField(max_digits=15, decimal_places=2)
    liabilities = serializers.DecimalField(max_digits=15, decimal_places=2)
    equity = serializers.DecimalField(max_digits=15, decimal_places=2)
    as_of_date = serializers.DateField()
