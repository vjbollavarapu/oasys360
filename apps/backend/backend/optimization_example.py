"""
Example Usage of Query Optimization for Large Multi-Tenant System
Demonstrates comprehensive optimization strategies with indexes, caching, and Redis.
"""

from django.db import models
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action
from backend.query_optimization import (
    OptimizedTenantManager, OptimizedTenantQuerySet,
    query_optimizer, tenant_cache_manager
)
from backend.redis_cache import (
    redis_cache_manager, dashboard_cache, statistics_cache,
    get_tenant_dashboard_data, get_tenant_statistics_data
)
from backend.tenant_base_model import TenantBaseModel

User = get_user_model()


# Example optimized models
class BankAccount(TenantBaseModel):
    """
    Example bank account model with optimized queries and caching.
    """
    
    account_number = models.CharField(max_length=50, db_index=True)
    routing_number = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    bank_name = models.CharField(max_length=255, db_index=True)
    account_type = models.CharField(max_length=50, choices=[
        ('checking', 'Checking'),
        ('savings', 'Savings'),
        ('money_market', 'Money Market'),
    ], db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ], default='active', db_index=True)
    
    # Use optimized manager
    objects = OptimizedTenantManager()
    
    class Meta:
        db_table = 'bank_accounts'
        verbose_name = 'Bank Account'
        verbose_name_plural = 'Bank Accounts'
        # Optimized indexes for multi-tenant queries
        indexes = [
            models.Index(fields=['tenant', 'is_active'], name='bank_accounts_tenant_active_idx'),
            models.Index(fields=['tenant', 'account_type'], name='bank_accounts_tenant_type_idx'),
            models.Index(fields=['tenant', 'status'], name='bank_accounts_tenant_status_idx'),
            models.Index(fields=['tenant', 'created_at'], name='bank_accounts_tenant_created_idx'),
            models.Index(fields=['tenant', 'bank_name'], name='bank_accounts_tenant_bank_idx'),
            models.Index(fields=['tenant', 'account_number'], name='bank_accounts_tenant_account_idx'),
        ]
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class Transaction(TenantBaseModel):
    """
    Example transaction model with optimized queries and caching.
    """
    
    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=[
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('fee', 'Fee'),
    ], db_index=True)
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, blank=True, db_index=True)
    is_reconciled = models.BooleanField(default=False, db_index=True)
    
    # Use optimized manager
    objects = OptimizedTenantManager()
    
    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        # Optimized indexes for multi-tenant queries
        indexes = [
            models.Index(fields=['tenant', 'account'], name='transactions_tenant_account_idx'),
            models.Index(fields=['tenant', 'transaction_type'], name='transactions_tenant_type_idx'),
            models.Index(fields=['tenant', 'is_reconciled'], name='transactions_tenant_reconciled_idx'),
            models.Index(fields=['tenant', 'created_at'], name='transactions_tenant_created_idx'),
            models.Index(fields=['tenant', 'amount'], name='transactions_tenant_amount_idx'),
        ]
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"


# Example views using optimization
def example_optimized_views():
    """
    Example of optimized views for multi-tenant system.
    """
    
    def list_bank_accounts(request):
        """List bank accounts with optimization"""
        # Use optimized queryset with caching
        accounts = BankAccount.objects.with_cache(
            timeout=300,  # 5 minutes
            key_prefix=f"accounts:{request.user.tenant.id}"
        ).select_related('tenant').filter(is_active=True)
        
        # Apply additional optimizations
        accounts = query_optimizer.optimize_queryset(accounts)
        
        data = [
            {
                'id': str(account.id),
                'account_number': account.account_number,
                'balance': float(account.balance),
                'bank_name': account.bank_name,
                'account_type': account.account_type,
                'is_active': account.is_active,
            }
            for account in accounts
        ]
        
        return JsonResponse({'accounts': data})
    
    def get_dashboard_data(request):
        """Get optimized dashboard data with Redis caching"""
        tenant = request.user.tenant
        
        # Try to get cached data first
        dashboard_data = get_tenant_dashboard_data(
            tenant.id, 
            force_refresh=request.GET.get('refresh') == 'true'
        )
        
        return JsonResponse(dashboard_data)
    
    def get_statistics_data(request):
        """Get optimized statistics data with Redis caching"""
        tenant = request.user.tenant
        period = request.GET.get('period', 'daily')
        
        # Try to get cached data first
        statistics_data = get_tenant_statistics_data(
            tenant.id,
            period=period,
            force_refresh=request.GET.get('refresh') == 'true'
        )
        
        return JsonResponse(statistics_data)
    
    def search_accounts(request):
        """Search accounts with optimization"""
        query = request.GET.get('q', '')
        account_type = request.GET.get('type')
        status = request.GET.get('status')
        
        # Build optimized query
        accounts = BankAccount.objects.select_related('tenant').filter(
            tenant=request.user.tenant
        )
        
        if query:
            accounts = accounts.filter(
                models.Q(account_number__icontains=query) |
                models.Q(bank_name__icontains=query)
            )
        
        if account_type:
            accounts = accounts.filter(account_type=account_type)
        
        if status:
            accounts = accounts.filter(status=status)
        
        # Apply optimization
        accounts = query_optimizer.optimize_queryset(accounts)
        
        # Use caching for search results
        accounts = accounts.with_cache(
            timeout=180,  # 3 minutes
            key_prefix=f"search:{hash(query + str(account_type) + str(status))}"
        )
        
        data = [
            {
                'id': str(account.id),
                'account_number': account.account_number,
                'balance': float(account.balance),
                'bank_name': account.bank_name,
                'account_type': account.account_type,
                'status': account.status,
            }
            for account in accounts
        ]
        
        return JsonResponse({'accounts': data})


# Example serializers with optimization
def example_optimized_serializers():
    """
    Example of optimized serializers for multi-tenant system.
    """
    
    class BankAccountSerializer(serializers.ModelSerializer):
        """Optimized serializer for bank accounts"""
        
        class Meta:
            model = BankAccount
            fields = [
                'id', 'account_number', 'routing_number', 'balance',
                'bank_name', 'account_type', 'is_active', 'status',
                'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']
    
    class TransactionSerializer(serializers.ModelSerializer):
        """Optimized serializer for transactions"""
        
        class Meta:
            model = Transaction
            fields = [
                'id', 'account', 'amount', 'transaction_type',
                'description', 'reference', 'is_reconciled',
                'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']


# Example viewsets with optimization
def example_optimized_viewsets():
    """
    Example of optimized viewsets for multi-tenant system.
    """
    
    class BankAccountViewSet(viewsets.ModelViewSet):
        """Optimized ViewSet for bank accounts"""
        
        serializer_class = BankAccountSerializer
        permission_classes = [permissions.IsAuthenticated]
        
        def get_queryset(self):
            """Get optimized queryset"""
            # Use optimized queryset with caching
            queryset = BankAccount.objects.select_related('tenant').filter(
                tenant=self.request.user.tenant
            )
            
            # Apply optimization
            queryset = query_optimizer.optimize_queryset(queryset)
            
            return queryset
        
        def list(self, request):
            """List with caching"""
            # Use caching for list operations
            queryset = self.get_queryset().with_cache(
                timeout=300,  # 5 minutes
                key_prefix=f"accounts_list:{request.user.tenant.id}"
            )
            
            # Apply filters
            if request.GET.get('active_only'):
                queryset = queryset.filter(is_active=True)
            
            if request.GET.get('account_type'):
                queryset = queryset.filter(account_type=request.GET.get('account_type'))
            
            # Paginate
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            
            paginator = Paginator(queryset, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = self.get_serializer(page_obj, many=True)
            
            return JsonResponse({
                'results': serializer.data,
                'count': paginator.count,
                'page': page,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
            })
        
        @action(detail=False, methods=['get'])
        def dashboard(self, request):
            """Get dashboard data with caching"""
            tenant = request.user.tenant
            
            # Get cached dashboard data
            dashboard_data = get_tenant_dashboard_data(tenant.id)
            
            return JsonResponse(dashboard_data)
        
        @action(detail=False, methods=['get'])
        def statistics(self, request):
            """Get statistics with caching"""
            tenant = request.user.tenant
            period = request.GET.get('period', 'daily')
            
            # Get cached statistics data
            statistics_data = get_tenant_statistics_data(tenant.id, period)
            
            return JsonResponse(statistics_data)
        
        @action(detail=False, methods=['get'])
        def search(self, request):
            """Search with optimization"""
            query = request.GET.get('q', '')
            
            if not query:
                return JsonResponse({'accounts': []})
            
            # Build optimized search query
            accounts = self.get_queryset().filter(
                models.Q(account_number__icontains=query) |
                models.Q(bank_name__icontains=query)
            ).with_cache(
                timeout=180,  # 3 minutes
                key_prefix=f"search:{hash(query)}"
            )
            
            serializer = self.get_serializer(accounts, many=True)
            
            return JsonResponse({'accounts': serializer.data})
    
    class TransactionViewSet(viewsets.ModelViewSet):
        """Optimized ViewSet for transactions"""
        
        serializer_class = TransactionSerializer
        permission_classes = [permissions.IsAuthenticated]
        
        def get_queryset(self):
            """Get optimized queryset"""
            # Use optimized queryset with caching
            queryset = Transaction.objects.select_related(
                'tenant', 'account'
            ).filter(tenant=self.request.user.tenant)
            
            # Apply optimization
            queryset = query_optimizer.optimize_queryset(queryset)
            
            return queryset
        
        def list(self, request):
            """List with caching and filtering"""
            queryset = self.get_queryset()
            
            # Apply filters
            if request.GET.get('account_id'):
                queryset = queryset.filter(account_id=request.GET.get('account_id'))
            
            if request.GET.get('transaction_type'):
                queryset = queryset.filter(transaction_type=request.GET.get('transaction_type'))
            
            if request.GET.get('is_reconciled'):
                queryset = queryset.filter(is_reconciled=request.GET.get('is_reconciled') == 'true')
            
            # Use caching for filtered results
            filter_key = hash(str(request.GET))
            queryset = queryset.with_cache(
                timeout=180,  # 3 minutes
                key_prefix=f"transactions_list:{request.user.tenant.id}:{filter_key}"
            )
            
            # Paginate
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            
            paginator = Paginator(queryset, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = self.get_serializer(page_obj, many=True)
            
            return JsonResponse({
                'results': serializer.data,
                'count': paginator.count,
                'page': page,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
            })


# Example caching strategies
def example_caching_strategies():
    """
    Example of caching strategies for multi-tenant system.
    """
    
    def get_tenant_dashboard_with_cache(tenant_id, force_refresh=False):
        """Get tenant dashboard with comprehensive caching"""
        # Try Redis cache first
        dashboard_data = redis_cache_manager.get_dashboard_data(
            tenant_id, force_refresh=force_refresh
        )
        
        if dashboard_data is not None:
            return dashboard_data
        
        # Generate fresh data
        dashboard_data = _generate_dashboard_data(tenant_id)
        
        # Cache in Redis
        redis_cache_manager.set_dashboard_data(tenant_id, dashboard_data)
        
        return dashboard_data
    
    def get_tenant_statistics_with_cache(tenant_id, period="daily", force_refresh=False):
        """Get tenant statistics with comprehensive caching"""
        # Try Redis cache first
        statistics_data = redis_cache_manager.get_statistics_data(
            tenant_id, period, force_refresh=force_refresh
        )
        
        if statistics_data is not None:
            return statistics_data
        
        # Generate fresh data
        statistics_data = _generate_statistics_data(tenant_id, period)
        
        # Cache in Redis
        redis_cache_manager.set_statistics_data(tenant_id, statistics_data, period)
        
        return statistics_data
    
    def _generate_dashboard_data(tenant_id):
        """Generate dashboard data for tenant"""
        # This would be implemented based on specific business logic
        return {
            'tenant_id': tenant_id,
            'generated_at': timezone.now().isoformat(),
            'data': {
                'total_accounts': 0,
                'total_balance': 0,
                'recent_transactions': [],
            }
        }
    
    def _generate_statistics_data(tenant_id, period):
        """Generate statistics data for tenant"""
        # This would be implemented based on specific business logic
        return {
            'tenant_id': tenant_id,
            'period': period,
            'generated_at': timezone.now().isoformat(),
            'statistics': {
                'total_transactions': 0,
                'total_amount': 0,
                'average_amount': 0,
            }
        }


# Example performance monitoring
def example_performance_monitoring():
    """
    Example of performance monitoring for multi-tenant system.
    """
    
    def monitor_query_performance(queryset, operation="query"):
        """Monitor query performance"""
        start_time = time.time()
        
        # Execute query
        if operation == "count":
            result = queryset.count()
        elif operation == "exists":
            result = queryset.exists()
        else:
            result = list(queryset)
        
        execution_time = time.time() - start_time
        
        # Log performance metrics
        logger.info(
            f"Query performance: {operation} took {execution_time:.3f}s, "
            f"result_count: {len(result) if isinstance(result, list) else result}"
        )
        
        return {
            'execution_time': execution_time,
            'result_count': len(result) if isinstance(result, list) else result,
            'operation': operation,
            'timestamp': timezone.now().isoformat()
        }
    
    def monitor_cache_performance(cache_key, operation="get"):
        """Monitor cache performance"""
        start_time = time.time()
        
        if operation == "get":
            result = cache.get(cache_key)
        elif operation == "set":
            result = cache.set(cache_key, "test_data", 300)
        else:
            result = cache.delete(cache_key)
        
        execution_time = time.time() - start_time
        
        # Log cache performance
        logger.info(
            f"Cache performance: {operation} took {execution_time:.3f}s, "
            f"cache_key: {cache_key}"
        )
        
        return {
            'execution_time': execution_time,
            'operation': operation,
            'cache_key': cache_key,
            'timestamp': timezone.now().isoformat()
        }


# Example management commands
def example_management_commands():
    """
    Example of management commands for optimization.
    """
    
    def create_optimized_indexes():
        """Create optimized indexes for all models"""
        from django.core.management import call_command
        
        # Create indexes for all models
        call_command('create_optimized_indexes')
        
        # Create indexes for specific app
        call_command('create_optimized_indexes', app='banking')
        
        # Create indexes for specific model
        call_command('create_optimized_indexes', model='BankAccount')
        
        # Dry run to see what would be created
        call_command('create_optimized_indexes', dry_run=True)
    
    def analyze_index_performance():
        """Analyze index performance"""
        from backend.management.commands.create_optimized_indexes import IndexAnalyzer
        
        analyzer = IndexAnalyzer()
        
        # Analyze indexes for BankAccount model
        indexes = analyzer.analyze_indexes(BankAccount)
        usage_stats = analyzer.get_index_usage_stats(BankAccount)
        table_stats = analyzer.get_table_stats(BankAccount)
        
        print(f"Indexes: {len(indexes)}")
        print(f"Usage stats: {len(usage_stats)}")
        print(f"Table stats: {len(table_stats)}")
    
    def optimize_tenant_queries():
        """Optimize tenant queries"""
        from backend.query_optimization import query_optimizer
        
        # Optimize queryset
        queryset = BankAccount.objects.filter(tenant_id=1)
        optimized_queryset = query_optimizer.optimize_queryset(queryset)
        
        # Analyze performance
        performance = query_optimizer.analyze_query_performance(optimized_queryset)
        
        print(f"Performance: {performance}")


# Example testing
def example_testing():
    """
    Example of testing optimization strategies.
    """
    from django.test import TestCase
    from django.contrib.auth import get_user_model
    from tenants.models import Tenant
    from unittest.mock import patch
    
    User = get_user_model()
    
    class OptimizationTestCase(TestCase):
        """Test case for optimization strategies"""
        
        def setUp(self):
            """Set up test data"""
            self.tenant = Tenant.objects.create(
                schema_name='test_tenant',
                name='Test Tenant'
            )
            
            self.user = User.objects.create_user(
                email='test@example.com',
                username='testuser',
                password='testpass123',
                tenant=self.tenant
            )
        
        def test_optimized_queryset(self):
            """Test optimized queryset"""
            with patch('backend.query_optimization.get_current_tenant', return_value=self.tenant):
                # Create test data
                account = BankAccount.objects.create(
                    tenant=self.tenant,
                    account_number='123456',
                    balance=1000.00,
                    bank_name='Test Bank'
                )
                
                # Test optimized queryset
                accounts = BankAccount.objects.with_cache(timeout=300)
                self.assertEqual(accounts.count(), 1)
                
                # Test performance metrics
                metrics = accounts.get_performance_metrics()
                self.assertIn('count', metrics)
        
        def test_redis_caching(self):
            """Test Redis caching"""
            with patch('backend.redis_cache.get_current_tenant', return_value=self.tenant):
                # Test dashboard cache
                dashboard_data = get_tenant_dashboard_data(self.tenant.id)
                self.assertIsNotNone(dashboard_data)
                
                # Test statistics cache
                statistics_data = get_tenant_statistics_data(self.tenant.id)
                self.assertIsNotNone(statistics_data)
        
        def test_query_optimization(self):
            """Test query optimization"""
            with patch('backend.query_optimization.get_current_tenant', return_value=self.tenant):
                # Create test data
                for i in range(10):
                    BankAccount.objects.create(
                        tenant=self.tenant,
                        account_number=f'12345{i}',
                        balance=1000.00 + i,
                        bank_name=f'Test Bank {i}'
                    )
                
                # Test optimized query
                accounts = BankAccount.objects.filter(tenant=self.tenant)
                optimized_accounts = query_optimizer.optimize_queryset(accounts)
                
                self.assertEqual(optimized_accounts.count(), 10)
                
                # Test performance analysis
                performance = query_optimizer.analyze_query_performance(optimized_accounts)
                self.assertIn('execution_time', performance)
