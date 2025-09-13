from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date

from .models import ChartOfAccounts, JournalEntry, JournalEntryLine, BankReconciliation
from .serializers import (
    ChartOfAccountsSerializer, JournalEntrySerializer, JournalEntryLineSerializer,
    JournalEntryWithLinesSerializer, BankReconciliationSerializer,
    TrialBalanceSerializer, IncomeStatementSerializer, BalanceSheetSerializer
)
from authentication.permissions import IsAccountant, IsTenantMember
from tenants.models import Company


class ChartOfAccountsListView(generics.ListCreateAPIView):
    """List and create Chart of Accounts"""
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return ChartOfAccounts.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('code')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['as_of_date'] = self.request.query_params.get('as_of_date')
        return context


class ChartOfAccountsDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Chart of Accounts"""
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return ChartOfAccounts.objects.filter(tenant=self.request.user.tenant)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['as_of_date'] = self.request.query_params.get('as_of_date')
        return context


class JournalEntryListView(generics.ListCreateAPIView):
    """List and create Journal Entries"""
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return JournalEntry.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )


class JournalEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Journal Entry"""
    serializer_class = JournalEntryWithLinesSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return JournalEntry.objects.filter(tenant=self.request.user.tenant)


class JournalEntryLineListView(generics.ListCreateAPIView):
    """List and create Journal Entry Lines"""
    serializer_class = JournalEntryLineSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        journal_entry_id = self.kwargs.get('journal_entry_id')
        return JournalEntryLine.objects.filter(
            journal_entry__id=journal_entry_id,
            journal_entry__tenant=self.request.user.tenant
        )
    
    def perform_create(self, serializer):
        journal_entry = get_object_or_404(
            JournalEntry,
            id=self.kwargs.get('journal_entry_id'),
            tenant=self.request.user.tenant
        )
        serializer.save(journal_entry=journal_entry)


@api_view(['POST'])
@permission_classes([IsAccountant])
def post_journal_entry(request, pk):
    """Post a journal entry"""
    journal_entry = get_object_or_404(
        JournalEntry,
        id=pk,
        tenant=request.user.tenant
    )
    
    if journal_entry.status != 'draft':
        return Response(
            {'error': 'Only draft entries can be posted'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if debits equal credits
    total_debit = sum(line.debit_amount for line in journal_entry.lines.all())
    total_credit = sum(line.credit_amount for line in journal_entry.lines.all())
    
    if total_debit != total_credit:
        return Response(
            {'error': 'Debits must equal credits'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    journal_entry.status = 'posted'
    journal_entry.posted_at = timezone.now()
    journal_entry.save()
    
    return Response({
        'message': 'Journal entry posted successfully',
        'journal_entry': JournalEntrySerializer(journal_entry).data
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def trial_balance(request):
    """Get trial balance"""
    as_of_date = request.query_params.get('as_of_date')
    if as_of_date:
        try:
            as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        as_of_date = date.today()
    
    accounts = ChartOfAccounts.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    ).order_by('code')
    
    trial_balance_data = []
    for account in accounts:
        balance = account.get_balance(as_of_date)
        
        if account.normal_balance == 'debit':
            debit_balance = balance if balance > 0 else Decimal('0.00')
            credit_balance = -balance if balance < 0 else Decimal('0.00')
        else:
            debit_balance = -balance if balance < 0 else Decimal('0.00')
            credit_balance = balance if balance > 0 else Decimal('0.00')
        
        trial_balance_data.append({
            'account_code': account.code,
            'account_name': account.name,
            'account_type': account.type,
            'debit_balance': debit_balance,
            'credit_balance': credit_balance,
            'net_balance': balance
        })
    
    serializer = TrialBalanceSerializer(trial_balance_data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def income_statement(request):
    """Get income statement"""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        return Response(
            {'error': 'Both start_date and end_date are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate revenue
    revenue_accounts = ChartOfAccounts.objects.filter(
        tenant=request.user.tenant,
        type='revenue',
        is_active=True
    )
    revenue = sum(account.get_balance(end_date) for account in revenue_accounts)
    
    # Calculate expenses
    expense_accounts = ChartOfAccounts.objects.filter(
        tenant=request.user.tenant,
        type='expense',
        is_active=True
    )
    expenses = sum(account.get_balance(end_date) for account in expense_accounts)
    
    net_income = revenue - expenses
    
    data = {
        'revenue': revenue,
        'expenses': expenses,
        'net_income': net_income,
        'period_start': start_date,
        'period_end': end_date
    }
    
    serializer = IncomeStatementSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def balance_sheet(request):
    """Get balance sheet"""
    as_of_date = request.query_params.get('as_of_date')
    if as_of_date:
        try:
            as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        as_of_date = date.today()
    
    # Calculate assets
    asset_accounts = ChartOfAccounts.objects.filter(
        tenant=request.user.tenant,
        type='asset',
        is_active=True
    )
    assets = sum(account.get_balance(as_of_date) for account in asset_accounts)
    
    # Calculate liabilities
    liability_accounts = ChartOfAccounts.objects.filter(
        tenant=request.user.tenant,
        type='liability',
        is_active=True
    )
    liabilities = sum(account.get_balance(as_of_date) for account in liability_accounts)
    
    # Calculate equity
    equity_accounts = ChartOfAccounts.objects.filter(
        tenant=request.user.tenant,
        type='equity',
        is_active=True
    )
    equity = sum(account.get_balance(as_of_date) for account in equity_accounts)
    
    data = {
        'assets': assets,
        'liabilities': liabilities,
        'equity': equity,
        'as_of_date': as_of_date
    }
    
    serializer = BalanceSheetSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def search_accounts(request):
    """Search Chart of Accounts"""
    query = request.query_params.get('q', '')
    
    accounts = ChartOfAccounts.objects.filter(
        Q(code__icontains=query) | Q(name__icontains=query),
        tenant=request.user.tenant,
        is_active=True
    ).order_by('code')
    
    serializer = ChartOfAccountsSerializer(accounts, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def account_activity(request, account_id):
    """Get account activity"""
    account = get_object_or_404(
        ChartOfAccounts,
        id=account_id,
        tenant=request.user.tenant
    )
    
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    lines = JournalEntryLine.objects.filter(
        account=account,
        journal_entry__status='posted'
    )
    
    if start_date:
        lines = lines.filter(journal_entry__date__gte=start_date)
    if end_date:
        lines = lines.filter(journal_entry__date__lte=end_date)
    
    lines = lines.order_by('-journal_entry__date')
    
    activity_data = []
    for line in lines:
        activity_data.append({
            'date': line.journal_entry.date,
            'reference': line.journal_entry.reference,
            'description': line.description,
            'debit_amount': line.debit_amount,
            'credit_amount': line.credit_amount,
            'balance': account.get_balance(line.journal_entry.date)
        })
    
    return Response({
        'account': ChartOfAccountsSerializer(account).data,
        'activity': activity_data
    })
