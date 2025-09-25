from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import BankAccount, BankTransaction, BankStatement, BankIntegration
from .serializers import (
    BankAccountSerializer, BankTransactionSerializer, BankStatementSerializer,
    BankIntegrationSerializer, BankReconciliationSerializer, BankAccountSummarySerializer,
    BankTransactionSummarySerializer, BankStatsSerializer
)
from authentication.permissions import IsAccountant, IsTenantMember
from tenants.models import Company


class BankAccountListView(generics.ListCreateAPIView):
    """List and create bank accounts"""
    serializer_class = BankAccountSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankAccount.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('account_name')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class BankAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank account"""
    serializer_class = BankAccountSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankAccount.objects.filter(tenant=self.request.user.tenant)


class BankTransactionListView(generics.ListCreateAPIView):
    """List and create bank transactions"""
    serializer_class = BankTransactionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankTransaction.objects.filter(
            bank_account__tenant=self.request.user.tenant
        ).order_by('-transaction_date', '-created_at')
    
    def perform_create(self, serializer):
        # Get the bank account and ensure it belongs to the tenant
        bank_account = get_object_or_404(
            BankAccount,
            id=serializer.validated_data['bank_account'].id,
            tenant=self.request.user.tenant
        )
        serializer.save(bank_account=bank_account)


class BankTransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank transaction"""
    serializer_class = BankTransactionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankTransaction.objects.filter(bank_account__tenant=self.request.user.tenant)


class BankStatementListView(generics.ListCreateAPIView):
    """List and create bank statements"""
    serializer_class = BankStatementSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankStatement.objects.filter(
            bank_account__tenant=self.request.user.tenant
        ).order_by('-statement_date')
    
    def perform_create(self, serializer):
        # Get the bank account and ensure it belongs to the tenant
        bank_account = get_object_or_404(
            BankAccount,
            id=serializer.validated_data['bank_account'].id,
            tenant=self.request.user.tenant
        )
        serializer.save(bank_account=bank_account)


class BankStatementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank statement"""
    serializer_class = BankStatementSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankStatement.objects.filter(bank_account__tenant=self.request.user.tenant)


class BankIntegrationListView(generics.ListCreateAPIView):
    """List and create bank integrations"""
    serializer_class = BankIntegrationSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankIntegration.objects.filter(
            bank_account__tenant=self.request.user.tenant,
            is_active=True
        )
    
    def perform_create(self, serializer):
        # Get the bank account and ensure it belongs to the tenant
        bank_account = get_object_or_404(
            BankAccount,
            id=serializer.validated_data['bank_account'].id,
            tenant=self.request.user.tenant
        )
        serializer.save(bank_account=bank_account)


class BankIntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank integration"""
    serializer_class = BankIntegrationSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return BankIntegration.objects.filter(bank_account__tenant=self.request.user.tenant)


@api_view(['GET'])
@permission_classes([IsAccountant])
def bank_account_transactions(request, account_id):
    """Get transactions for a specific bank account"""
    bank_account = get_object_or_404(
        BankAccount,
        id=account_id,
        tenant=request.user.tenant
    )
    
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    transactions = BankTransaction.objects.filter(bank_account=bank_account)
    
    if start_date:
        transactions = transactions.filter(transaction_date__gte=start_date)
    if end_date:
        transactions = transactions.filter(transaction_date__lte=end_date)
    
    transactions = transactions.order_by('-transaction_date')
    
    serializer = BankTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAccountant])
def reconcile_transaction(request, transaction_id):
    """Reconcile a bank transaction"""
    transaction = get_object_or_404(
        BankTransaction,
        id=transaction_id,
        bank_account__tenant=request.user.tenant
    )
    
    if transaction.is_reconciled:
        return Response(
            {'error': 'Transaction is already reconciled'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    transaction.is_reconciled = True
    transaction.reconciliation_date = timezone.now().date()
    transaction.save()
    
    return Response({
        'message': 'Transaction reconciled successfully',
        'transaction': BankTransactionSerializer(transaction).data
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def bank_reconciliation(request, account_id):
    """Get bank reconciliation data"""
    bank_account = get_object_or_404(
        BankAccount,
        id=account_id,
        tenant=request.user.tenant
    )
    
    # Get the latest statement
    latest_statement = BankStatement.objects.filter(
        bank_account=bank_account
    ).order_by('-statement_date').first()
    
    if not latest_statement:
        return Response(
            {'error': 'No bank statement found for reconciliation'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Calculate book balance
    reconciled_transactions = BankTransaction.objects.filter(
        bank_account=bank_account,
        transaction_date__lte=latest_statement.statement_date,
        is_reconciled=True
    )
    
    book_balance = bank_account.opening_balance
    for transaction in reconciled_transactions:
        if transaction.transaction_type == 'credit':
            book_balance += transaction.amount
        else:
            book_balance -= transaction.amount
    
    # Count transactions
    reconciled_count = reconciled_transactions.count()
    unreconciled_count = BankTransaction.objects.filter(
        bank_account=bank_account,
        is_reconciled=False
    ).count()
    
    difference = latest_statement.closing_balance - book_balance
    
    data = {
        'bank_account_id': bank_account.id,
        'bank_account_name': bank_account.account_name,
        'statement_date': latest_statement.statement_date,
        'statement_balance': latest_statement.closing_balance,
        'book_balance': book_balance,
        'difference': difference,
        'reconciled_transactions': reconciled_count,
        'unreconciled_transactions': unreconciled_count
    }
    
    serializer = BankReconciliationSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def bank_stats(request):
    """Get banking statistics"""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        # Default to current month
        today = date.today()
        start_date = today.replace(day=1)
        end_date = today
    else:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    accounts = BankAccount.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    )
    
    total_accounts = accounts.count()
    total_balance = sum(account.current_balance for account in accounts)
    
    transactions = BankTransaction.objects.filter(
        bank_account__tenant=request.user.tenant,
        transaction_date__range=[start_date, end_date]
    )
    
    total_transactions = transactions.count()
    unreconciled_transactions = transactions.filter(is_reconciled=False).count()
    
    data = {
        'total_accounts': total_accounts,
        'total_balance': total_balance,
        'total_transactions': total_transactions,
        'unreconciled_transactions': unreconciled_transactions,
        'period_start': start_date,
        'period_end': end_date
    }
    
    serializer = BankStatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def search_transactions(request):
    """Search bank transactions"""
    query = request.query_params.get('q', '')
    
    transactions = BankTransaction.objects.filter(
        Q(description__icontains=query) |
        Q(reference__icontains=query) |
        Q(notes__icontains=query),
        bank_account__tenant=request.user.tenant
    ).order_by('-transaction_date')
    
    serializer = BankTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAccountant])
def sync_bank_data(request, integration_id):
    """Sync bank data from integration"""
    integration = get_object_or_404(
        BankIntegration,
        id=integration_id,
        bank_account__tenant=request.user.tenant
    )
    
    if not integration.is_active:
        return Response(
            {'error': 'Integration is not active'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Here you would implement the actual bank API integration
    # For now, we'll just update the last sync date
    integration.last_sync_date = timezone.now()
    integration.save()
    
    return Response({
        'message': 'Bank data sync initiated successfully',
        'integration': BankIntegrationSerializer(integration).data
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def account_summary(request):
    """Get summary of all bank accounts"""
    accounts = BankAccount.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    )
    
    summary_data = []
    for account in accounts:
        # Get last transaction date
        last_transaction = BankTransaction.objects.filter(
            bank_account=account
        ).order_by('-transaction_date').first()
        
        summary_data.append({
            'account_id': account.id,
            'account_name': account.account_name,
            'bank_name': account.bank_name,
            'account_type': account.account_type,
            'current_balance': account.current_balance,
            'available_balance': account.available_balance,
            'currency': account.currency,
            'last_transaction_date': last_transaction.transaction_date if last_transaction else None,
            'is_active': account.is_active
        })
    
    serializer = BankAccountSummarySerializer(summary_data, many=True)
    return Response(serializer.data)
