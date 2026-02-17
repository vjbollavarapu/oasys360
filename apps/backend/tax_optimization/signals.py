"""
Tax Optimization Signals
Auto-generate alerts and strategies based on tax events
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import date
from .models import TaxEvent, TaxAlert, TaxSettings


@receiver(post_save, sender=TaxEvent)
def check_tax_opportunities(sender, instance, created, **kwargs):
    """Check for tax optimization opportunities when a new tax event is created"""
    if not created:
        return
    
    tenant = instance.tenant
    tax_year = instance.tax_year
    
    # Get tax settings
    settings = TaxSettings.objects.filter(tenant=tenant).first()
    if not settings or not settings.enable_auto_alerts:
        return
    
    # Check for offset opportunities
    events = TaxEvent.objects.filter(
        tenant=tenant,
        tax_year=tax_year
    )
    
    total_gains = sum(e.amount for e in events if 'gain' in e.event_type)
    total_losses = abs(sum(e.amount for e in events if 'loss' in e.event_type))
    
    if total_losses > 0 and total_gains > 0:
        offset_available = min(total_losses, total_gains)
        
        # Create or update offset opportunity alert
        TaxAlert.objects.update_or_create(
            tenant=tenant,
            alert_type='offset_opportunity',
            tax_year=tax_year,
            dismissed=False,
            defaults={
                'severity': 'high',
                'title': f'Tax Offset Opportunity - ${offset_available:,.2f}',
                'message': f'You have ${offset_available:,.2f} in losses that can offset your gains, reducing your tax liability.',
                'actionable': True,
                'action_url': '/tax-optimization/strategies'
            }
        )


@receiver(post_save, sender=TaxSettings)
def setup_initial_alerts(sender, instance, created, **kwargs):
    """Set up initial year-end alerts when tax settings are created"""
    if not created:
        return
    
    # Create year-end alert if approaching
    current_date = timezone.now().date()
    current_year = current_date.year
    year_end = date(current_year, 12, 31)
    days_remaining = (year_end - current_date).days
    
    if days_remaining <= instance.year_end_alert_days and days_remaining > 0:
        TaxAlert.objects.create(
            tenant=instance.tenant,
            alert_type='year_end_approaching',
            severity='high' if days_remaining <= 7 else 'medium',
            title=f'Year-End Approaching - {days_remaining} Days Remaining',
            message=f'Tax year {current_year} ends in {days_remaining} days. Review your tax position and consider optimization strategies.',
            actionable=True,
            tax_year=current_year,
            deadline_date=year_end
        )

