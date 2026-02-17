"""
Tax Optimization Views
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta
import logging

from .models import (
    TaxEvent, TaxOptimizationStrategy, TaxYearSummary,
    TaxAlert, TaxSettings
)
from .serializers import (
    TaxEventSerializer, TaxOptimizationStrategySerializer,
    TaxYearSummarySerializer, TaxAlertSerializer, TaxSettingsSerializer,
    TaxOptimizationStatsSerializer
)
from authentication.permissions import IsAccountant, IsCFO, IsTenantMember

logger = logging.getLogger(__name__)


# ============================================================================
# Tax Events
# ============================================================================

class TaxEventListView(generics.ListCreateAPIView):
    """List and create tax events"""
    serializer_class = TaxEventSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        queryset = TaxEvent.objects.filter(tenant=self.request.user.tenant)
        
        # Filter by tax year
        tax_year = self.request.query_params.get('tax_year')
        if tax_year:
            queryset = queryset.filter(tax_year=tax_year)
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by realized status
        realized = self.request.query_params.get('realized')
        if realized is not None:
            queryset = queryset.filter(realized=realized.lower() == 'true')
        
        return queryset.order_by('-event_date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class TaxEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete tax event"""
    serializer_class = TaxEventSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return TaxEvent.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def detect_tax_events(request):
    """Detect tax events from transactions and create events automatically"""
    from banking.models import BankTransaction
    from web3_integration.models import CryptoTransaction
    
    tenant = request.user.tenant
    tax_year = request.data.get('tax_year', timezone.now().year)
    
    events_created = 0
    
    # Detect from bank transactions (fiat gains/losses)
    bank_transactions = BankTransaction.objects.filter(
        tenant=tenant,
        date__year=tax_year,
        is_reconciled=True
    )
    
    for tx in bank_transactions:
        if tx.type in ['deposit', 'interest']:
            TaxEvent.objects.get_or_create(
                tenant=tenant,
                source_type='fiat',
                source_id=tx.id,
                defaults={
                    'event_type': 'fiat_gain' if tx.amount > 0 else 'fiat_loss',
                    'amount': abs(tx.amount),
                    'currency': tx.currency,
                    'tax_year': tax_year,
                    'event_date': tx.date,
                    'realized': True,
                    'description': f"Bank transaction: {tx.description}"
                }
            )
            events_created += 1
    
    # Detect from crypto transactions (crypto gains/losses)
    crypto_transactions = CryptoTransaction.objects.filter(
        wallet__tenant=tenant,
        created_at__year=tax_year,
        status='confirmed'
    )
    
    for tx in crypto_transactions:
        if tx.transaction_type in ['swap', 'transfer']:
            # Calculate gain/loss based on price difference
            # This is simplified - in reality, need cost basis tracking
            TaxEvent.objects.get_or_create(
                tenant=tenant,
                source_type='crypto',
                source_id=tx.id,
                defaults={
                    'event_type': 'crypto_gain',  # Simplified
                    'amount': abs(float(tx.amount)) if tx.amount else Decimal('0'),
                    'currency': 'USD',  # Convert to USD
                    'tax_year': tax_year,
                    'event_date': tx.created_at.date(),
                    'realized': tx.status == 'confirmed',
                    'description': f"Crypto transaction: {tx.tx_hash[:10]}..."
                }
            )
            events_created += 1
    
    return Response({
        'success': True,
        'message': f'Created {events_created} tax events',
        'events_created': events_created
    })


# ============================================================================
# Tax Optimization Strategies
# ============================================================================

class TaxOptimizationStrategyListView(generics.ListCreateAPIView):
    """List and create tax optimization strategies"""
    serializer_class = TaxOptimizationStrategySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        queryset = TaxOptimizationStrategy.objects.filter(tenant=self.request.user.tenant)
        
        # Filter by tax year
        tax_year = self.request.query_params.get('tax_year')
        if tax_year:
            queryset = queryset.filter(tax_year=tax_year)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-priority', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)


class TaxOptimizationStrategyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete tax optimization strategy"""
    serializer_class = TaxOptimizationStrategySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return TaxOptimizationStrategy.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsCFO])
def approve_strategy(request, pk):
    """Approve a tax optimization strategy"""
    strategy = get_object_or_404(
        TaxOptimizationStrategy,
        pk=pk,
        tenant=request.user.tenant
    )
    
    strategy.status = 'approved'
    strategy.approved_by = request.user
    strategy.approved_at = timezone.now()
    strategy.save()
    
    return Response({
        'success': True,
        'message': 'Strategy approved successfully'
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def generate_strategies(request):
    """Generate tax optimization strategies based on current tax events"""
    tenant = request.user.tenant
    tax_year = request.data.get('tax_year', timezone.now().year)
    
    strategies_created = []
    
    # Get all tax events for the year
    events = TaxEvent.objects.filter(tenant=tenant, tax_year=tax_year)
    
    # Calculate totals
    total_gains = sum(e.amount for e in events if 'gain' in e.event_type)
    total_losses = abs(sum(e.amount for e in events if 'loss' in e.event_type))
    
    # Strategy 1: Loss Harvesting Opportunity
    if total_losses > 0 and total_gains > 0:
        offset_amount = min(total_losses, total_gains)
        potential_savings = offset_amount * Decimal('0.20')  # Assume 20% tax rate
        
        strategy, created = TaxOptimizationStrategy.objects.get_or_create(
            tenant=tenant,
            strategy_type='loss_harvesting',
            tax_year=tax_year,
            defaults={
                'title': f'Loss Harvesting Opportunity - {tax_year}',
                'description': f'Offset {offset_amount} in gains with {total_losses} in losses. Potential savings: ${potential_savings}',
                'priority': 'high',
                'potential_savings': potential_savings,
                'created_by': request.user
            }
        )
        if created:
            strategies_created.append(strategy.id)
    
    # Strategy 2: Year-End Planning
    current_date = timezone.now().date()
    year_end = date(tax_year, 12, 31)
    days_remaining = (year_end - current_date).days
    
    if days_remaining <= 60 and days_remaining > 0:
        strategy, created = TaxOptimizationStrategy.objects.get_or_create(
            tenant=tenant,
            strategy_type='year_end_planning',
            tax_year=tax_year,
            defaults={
                'title': f'Year-End Tax Planning - {days_remaining} Days Remaining',
                'description': f'Review and optimize tax position before year-end. {days_remaining} days remaining.',
                'priority': 'high',
                'created_by': request.user
            }
        )
        if created:
            strategies_created.append(strategy.id)
    
    return Response({
        'success': True,
        'message': f'Generated {len(strategies_created)} strategies',
        'strategies_created': strategies_created
    })


# ============================================================================
# Tax Year Summary
# ============================================================================

class TaxYearSummaryListView(generics.ListCreateAPIView):
    """List and create tax year summaries"""
    serializer_class = TaxYearSummarySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return TaxYearSummary.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-tax_year')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)


class TaxYearSummaryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete tax year summary"""
    serializer_class = TaxYearSummarySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return TaxYearSummary.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def calculate_year_summary(request, tax_year):
    """Calculate tax year summary"""
    tenant = request.user.tenant
    
    summary, created = TaxYearSummary.objects.get_or_create(
        tenant=tenant,
        tax_year=tax_year,
        defaults={'created_by': request.user}
    )
    
    summary.calculate_summary()
    
    serializer = TaxYearSummarySerializer(summary)
    return Response(serializer.data)


# ============================================================================
# Tax Alerts
# ============================================================================

class TaxAlertListView(generics.ListAPIView):
    """List tax alerts"""
    serializer_class = TaxAlertSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        queryset = TaxAlert.objects.filter(
            tenant=self.request.user.tenant,
            dismissed=False
        )
        
        # Filter by read status
        read = self.request.query_params.get('read')
        if read is not None:
            queryset = queryset.filter(read=read.lower() == 'true')
        
        # Filter by severity
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-severity', '-created_at')


@api_view(['PATCH'])
@permission_classes([IsTenantMember])
def mark_alert_read(request, pk):
    """Mark tax alert as read"""
    alert = get_object_or_404(
        TaxAlert,
        pk=pk,
        tenant=request.user.tenant
    )
    
    alert.read = True
    alert.save()
    
    return Response({'success': True, 'message': 'Alert marked as read'})


@api_view(['PATCH'])
@permission_classes([IsTenantMember])
def dismiss_alert(request, pk):
    """Dismiss tax alert"""
    alert = get_object_or_404(
        TaxAlert,
        pk=pk,
        tenant=request.user.tenant
    )
    
    alert.dismissed = True
    alert.save()
    
    return Response({'success': True, 'message': 'Alert dismissed'})


@api_view(['POST'])
@permission_classes([IsAccountant])
def generate_alerts(request):
    """Generate proactive tax alerts"""
    tenant = request.user.tenant
    current_year = timezone.now().year
    
    alerts_created = []
    
    # Alert 1: Year-end approaching
    current_date = timezone.now().date()
    year_end = date(current_year, 12, 31)
    days_remaining = (year_end - current_date).days
    
    settings = TaxSettings.objects.filter(tenant=tenant).first()
    alert_days = settings.year_end_alert_days if settings else 30
    
    if days_remaining <= alert_days and days_remaining > 0:
        alert, created = TaxAlert.objects.get_or_create(
            tenant=tenant,
            alert_type='year_end_approaching',
            tax_year=current_year,
            dismissed=False,
            defaults={
                'severity': 'high' if days_remaining <= 7 else 'medium',
                'title': f'Year-End Approaching - {days_remaining} Days Remaining',
                'message': f'Tax year {current_year} ends in {days_remaining} days. Review your tax position and consider optimization strategies.',
                'actionable': True,
                'deadline_date': year_end
            }
        )
        if created:
            alerts_created.append(alert.id)
    
    # Alert 2: Offset opportunity
    events = TaxEvent.objects.filter(tenant=tenant, tax_year=current_year)
    total_gains = sum(e.amount for e in events if 'gain' in e.event_type)
    total_losses = abs(sum(e.amount for e in events if 'loss' in e.event_type))
    
    if total_losses > 0 and total_gains > 0:
        offset_available = min(total_losses, total_gains)
        if offset_available > 0:
            alert, created = TaxAlert.objects.get_or_create(
                tenant=tenant,
                alert_type='offset_opportunity',
                tax_year=current_year,
                dismissed=False,
                defaults={
                    'severity': 'high',
                    'title': f'Tax Offset Opportunity - ${offset_available:,.2f}',
                    'message': f'You have ${offset_available:,.2f} in losses that can offset your gains, reducing your tax liability.',
                    'actionable': True,
                    'action_url': '/tax-optimization/strategies'
                }
            )
            if created:
                alerts_created.append(alert.id)
    
    return Response({
        'success': True,
        'message': f'Generated {len(alerts_created)} alerts',
        'alerts_created': alerts_created
    })


# ============================================================================
# Tax Settings
# ============================================================================

class TaxSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update tax settings"""
    serializer_class = TaxSettingsSerializer
    permission_classes = [IsCFO]
    
    def get_object(self):
        settings, created = TaxSettings.objects.get_or_create(
            tenant=self.request.user.tenant
        )
        return settings


# ============================================================================
# Statistics and Dashboard
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAccountant])
def tax_optimization_stats(request):
    """Get tax optimization statistics"""
    tenant = request.user.tenant
    current_year = timezone.now().year
    
    # Get events for current year
    events = TaxEvent.objects.filter(tenant=tenant, tax_year=current_year)
    
    total_gains = sum(e.amount for e in events if 'gain' in e.event_type)
    total_losses = abs(sum(e.amount for e in events if 'loss' in e.event_type))
    
    # Calculate offset available
    loss_events = events.filter(event_type__in=['loss', 'capital_loss', 'crypto_loss', 'fiat_loss'])
    offset_available = sum(e.remaining_offset_amount() for e in loss_events)
    
    # Get strategies
    strategies = TaxOptimizationStrategy.objects.filter(
        tenant=tenant,
        tax_year=current_year,
        status='pending'
    )
    potential_savings = sum(s.potential_savings or 0 for s in strategies)
    
    # Get active alerts
    alerts = TaxAlert.objects.filter(
        tenant=tenant,
        tax_year=current_year,
        dismissed=False
    )
    
    stats = {
        'current_year': current_year,
        'total_events': events.count(),
        'total_gains': total_gains,
        'total_losses': total_losses,
        'net_taxable': max(Decimal('0'), total_gains - total_losses),
        'offset_available': offset_available,
        'pending_strategies': strategies.count(),
        'active_alerts': alerts.count(),
        'estimated_savings': potential_savings
    }
    
    serializer = TaxOptimizationStatsSerializer(stats)
    return Response(serializer.data)

