from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import (
    BankAccount, BankTransaction, BankStatement, BankIntegration,
    PlaidConnection, ImportExportJob, BankingSettings
)
from .serializers import (
    BankAccountSerializer, BankTransactionSerializer, BankStatementSerializer,
    BankIntegrationSerializer, BankReconciliationSerializer, BankAccountSummarySerializer,
    BankTransactionSummarySerializer, BankStatsSerializer, PlaidConnectionSerializer,
    ImportExportJobSerializer, BankingSettingsSerializer
)
from authentication.permissions import IsAccountant, IsTenantMember
from backend.tenant_utils import get_request_tenant
from tenants.models import Company


class BankAccountListView(generics.ListCreateAPIView):
    """List and create bank accounts"""
    serializer_class = BankAccountSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankAccount.objects.none()
        return BankAccount.objects.filter(
            tenant=tenant,
            is_active=True
        ).order_by('name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


class BankAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank account"""
    serializer_class = BankAccountSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankAccount.objects.none()
        return BankAccount.objects.filter(tenant=tenant)


class BankTransactionListView(generics.ListCreateAPIView):
    """List and create bank transactions"""
    serializer_class = BankTransactionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankTransaction.objects.none()
        # Filter by tenant, with optional bank_account filter from query params
        queryset = BankTransaction.objects.filter(tenant=tenant)
        account_id = self.request.query_params.get('account_id')
        if account_id:
            queryset = queryset.filter(bank_account_id=account_id)
        return queryset.order_by('-transaction_date', '-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        # Get the bank account and ensure it belongs to the tenant
        if 'bank_account' in serializer.validated_data:
            bank_account = get_object_or_404(
                BankAccount,
                id=serializer.validated_data['bank_account'].id,
                tenant=tenant
            )
            serializer.save(tenant=tenant, bank_account=bank_account)
        else:
            serializer.save(tenant=tenant)


class BankTransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank transaction"""
    serializer_class = BankTransactionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankTransaction.objects.none()
        return BankTransaction.objects.filter(tenant=tenant)


class BankStatementListView(generics.ListCreateAPIView):
    """List and create bank statements"""
    serializer_class = BankStatementSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankStatement.objects.none()
        return BankStatement.objects.filter(
            bank_account__tenant=tenant
        ).order_by('-statement_date')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        # Get the bank account and ensure it belongs to the tenant
        bank_account = get_object_or_404(
            BankAccount,
            id=serializer.validated_data['bank_account'].id,
            tenant=tenant
        )
        serializer.save(bank_account=bank_account)


class BankStatementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank statement"""
    serializer_class = BankStatementSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankStatement.objects.none()
        return BankStatement.objects.filter(bank_account__tenant=tenant)


class BankIntegrationListView(generics.ListCreateAPIView):
    """List and create bank integrations"""
    serializer_class = BankIntegrationSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankIntegration.objects.none()
        return BankIntegration.objects.filter(
            bank_account__tenant=tenant,
            is_active=True
        )
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        # Get the bank account and ensure it belongs to the tenant
        bank_account = get_object_or_404(
            BankAccount,
            id=serializer.validated_data['bank_account'].id,
            tenant=tenant
        )
        serializer.save(bank_account=bank_account)


class BankIntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete bank integration"""
    serializer_class = BankIntegrationSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return BankIntegration.objects.none()
        return BankIntegration.objects.filter(bank_account__tenant=tenant)


@api_view(['GET'])
@permission_classes([IsAccountant])
def bank_account_transactions(request, account_id):
    """Get transactions for a specific bank account"""
    tenant = get_request_tenant(request)
    if not tenant:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Tenant context required")
    
    bank_account = get_object_or_404(
        BankAccount,
        id=account_id,
        tenant=tenant
    )
    
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    transactions = BankTransaction.objects.filter(
        tenant=tenant,
        bank_account=bank_account
    )
    
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
    tenant = get_request_tenant(request)
    if not tenant:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Tenant context required")
    transaction = get_object_or_404(
        BankTransaction,
        id=transaction_id,
        tenant=tenant
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
    tenant = get_request_tenant(request)
    if not tenant:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Tenant context required")
    
    bank_account = get_object_or_404(
        BankAccount,
        id=account_id,
        tenant=tenant
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
        'bank_account_name': bank_account.name,
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
    
    tenant = get_request_tenant(request)
    if not tenant:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Tenant context required")
    
    accounts = BankAccount.objects.filter(
        tenant=tenant,
        is_active=True
    )
    
    total_accounts = accounts.count()
    total_balance = sum(account.current_balance for account in accounts)
    
    transactions = BankTransaction.objects.filter(
        tenant=tenant,
        transaction_date__range=[start_date, end_date]
    ) if tenant else BankTransaction.objects.none()
    
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
    tenant = get_request_tenant(request)
    if not tenant:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Tenant context required")
    
    query = request.query_params.get('q', '')
    
    transactions = BankTransaction.objects.filter(
        Q(description__icontains=query) |
        Q(reference__icontains=query) |
        Q(notes__icontains=query),
        tenant=tenant
    ).order_by('-transaction_date') if tenant else BankTransaction.objects.none()
    
    serializer = BankTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAccountant])
def sync_bank_data(request, integration_id):
    """Sync bank data from integration"""
    tenant = get_request_tenant(request)
    if not tenant:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Tenant context required")
    
    integration = get_object_or_404(
        BankIntegration,
        id=integration_id,
        bank_account__tenant=tenant
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
    tenant = get_request_tenant(request)
    if not tenant:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Tenant context required")
    
    accounts = BankAccount.objects.filter(
        tenant=tenant,
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
            'account_name': account.name,
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


# Bank Integration - Test Connection
@api_view(['POST'])
@permission_classes([IsAccountant])
def test_bank_integration(request, pk):
    """Test bank integration connection"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    integration = get_object_or_404(
        BankIntegration,
        id=pk,
        bank_account__tenant=tenant
    )
    
    # Here you would implement the actual connection test
    # For now, we'll return a mock response
    return Response({
        'message': 'Connection test initiated',
        'integration_id': str(integration.id),
        'status': 'success' if integration.is_active else 'inactive',
        'last_sync': integration.last_sync_date
    })


# Plaid Connection Views
class PlaidConnectionListView(generics.ListCreateAPIView):
    """List and create Plaid Connections"""
    serializer_class = PlaidConnectionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return PlaidConnection.objects.none()
        return PlaidConnection.objects.filter(tenant=tenant).order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


class PlaidConnectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Plaid Connection"""
    serializer_class = PlaidConnectionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return PlaidConnection.objects.none()
        return PlaidConnection.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def sync_plaid_connection(request, pk):
    """Sync data from Plaid connection"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    connection = get_object_or_404(
        PlaidConnection,
        id=pk,
        tenant=tenant
    )
    
    # Here you would implement the actual Plaid sync
    # For now, we'll update the last sync date
    connection.last_successful_sync = timezone.now()
    connection.status = 'active'
    connection.save()
    
    return Response({
        'message': 'Plaid sync initiated successfully',
        'connection': PlaidConnectionSerializer(connection).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def create_plaid_link_token(request):
    """Create Plaid Link token for frontend"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Here you would call Plaid API to create a link token
    # For now, we'll return a mock response
    return Response({
        'link_token': 'link-sandbox-token-placeholder',
        'expiration': (timezone.now() + timedelta(hours=4)).isoformat()
    })


# Import/Export Views
class ImportExportJobListView(generics.ListCreateAPIView):
    """List and create Import/Export Jobs"""
    serializer_class = ImportExportJobSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ImportExportJob.objects.none()
        job_type = self.request.query_params.get('job_type')
        queryset = ImportExportJob.objects.filter(tenant=tenant)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class ImportExportJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Import/Export Job"""
    serializer_class = ImportExportJobSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ImportExportJob.objects.none()
        return ImportExportJob.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def process_import_job(request, pk):
    """Process an import job"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    job = get_object_or_404(
        ImportExportJob,
        id=pk,
        tenant=tenant,
        job_type='import'
    )
    
    if job.status != 'pending':
        return Response(
            {'error': 'Job is not in pending status'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    job.status = 'processing'
    job.started_at = timezone.now()
    job.save()
    
    # Here you would implement the actual import processing
    # For now, we'll mark it as completed
    job.status = 'completed'
    job.completed_at = timezone.now()
    job.save()
    
    return Response({
        'message': 'Import job processed successfully',
        'job': ImportExportJobSerializer(job).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def generate_export_job(request):
    """Generate export job"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    file_format = request.data.get('file_format', 'csv')
    bank_account_id = request.data.get('bank_account_id')
    start_date = request.data.get('start_date')
    end_date = request.data.get('end_date')
    
    # Create export job
    job = ImportExportJob.objects.create(
        tenant=tenant,
        job_type='export',
        file_format=file_format,
        file_name=f'bank_export_{timezone.now().strftime("%Y%m%d_%H%M%S")}.{file_format}',
        status='processing',
        bank_account_id=bank_account_id if bank_account_id else None,
        start_date=start_date,
        end_date=end_date,
        created_by=request.user,
        started_at=timezone.now()
    )
    
    # Here you would implement the actual export generation
    # For now, we'll mark it as completed
    job.status = 'completed'
    job.completed_at = timezone.now()
    job.save()
    
    return Response({
        'message': 'Export job created successfully',
        'job': ImportExportJobSerializer(job).data
    })


# Banking Settings Views
class BankingSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update Banking Settings"""
    serializer_class = BankingSettingsSerializer
    permission_classes = [IsAccountant]
    
    def get_object(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        company = getattr(self.request.user, 'company', None)
        settings, created = BankingSettings.objects.get_or_create(
            tenant=tenant,
            company=company
        )
        return settings
