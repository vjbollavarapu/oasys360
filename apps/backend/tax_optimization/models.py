"""
Tax Optimization Models
Handles tax event detection, year-end planning, loss harvesting, and tax optimization strategies
"""
from django.db import models
import uuid
from decimal import Decimal
from django.utils import timezone
from datetime import date, timedelta
from backend.enhanced_base_models import TenantScopedModel, FinancialModel


class TaxEvent(FinancialModel):
    """
    Tax Event model for tracking tax-related events (profits, losses, gains)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_events')
    event_type = models.CharField(max_length=50, choices=[
        ('profit', 'Profit'),
        ('loss', 'Loss'),
        ('capital_gain', 'Capital Gain'),
        ('capital_loss', 'Capital Loss'),
        ('dividend', 'Dividend'),
        ('interest', 'Interest Income'),
        ('crypto_gain', 'Crypto Gain'),
        ('crypto_loss', 'Crypto Loss'),
        ('fiat_gain', 'Fiat Gain'),
        ('fiat_loss', 'Fiat Loss'),
    ])
    source_type = models.CharField(max_length=50, choices=[
        ('fiat', 'Fiat Transaction'),
        ('crypto', 'Crypto Transaction'),
        ('investment', 'Investment'),
        ('sale', 'Sale'),
        ('purchase', 'Purchase'),
        ('income', 'Income'),
        ('expense', 'Expense'),
    ])
    source_id = models.UUIDField(null=True, blank=True, help_text='ID of the source transaction/document')
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    tax_year = models.IntegerField(help_text='Tax year this event applies to')
    event_date = models.DateField()
    realized = models.BooleanField(default=False, help_text='Whether the gain/loss is realized')
    offset_applied = models.BooleanField(default=False, help_text='Whether this has been used to offset other gains')
    offset_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0, help_text='Amount used for offsetting')
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_events'
        verbose_name = 'Tax Event'
        verbose_name_plural = 'Tax Events'
        ordering = ['-event_date', '-created_at']
        indexes = [
            models.Index(fields=['tenant', 'tax_year', 'event_type']),
            models.Index(fields=['tenant', 'realized', 'offset_applied']),
        ]

    def __str__(self):
        return f"{self.get_event_type_display()} - {self.amount} ({self.tax_year})"

    def can_offset(self):
        """Check if this event can be used to offset other gains"""
        if self.event_type in ['loss', 'capital_loss', 'crypto_loss', 'fiat_loss']:
            return not self.offset_applied or (self.offset_amount < abs(self.amount))
        return False

    def remaining_offset_amount(self):
        """Get remaining amount available for offsetting"""
        if not self.can_offset():
            return Decimal('0')
        return abs(self.amount) - self.offset_amount


class TaxOptimizationStrategy(models.Model):
    """
    Tax Optimization Strategy model for storing optimization recommendations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_strategies')
    strategy_type = models.CharField(max_length=50, choices=[
        ('loss_harvesting', 'Loss Harvesting'),
        ('gain_realization', 'Gain Realization'),
        ('year_end_planning', 'Year-End Planning'),
        ('offset_opportunity', 'Offset Opportunity'),
        ('tax_deferral', 'Tax Deferral'),
        ('deduction_maximization', 'Deduction Maximization'),
    ])
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=[
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ], default='medium')
    potential_savings = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    tax_year = models.IntegerField()
    applicable_events = models.ManyToManyField(TaxEvent, blank=True, related_name='strategies')
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('implemented', 'Implemented'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ])
    implementation_date = models.DateField(null=True, blank=True)
    actual_savings = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_strategies')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_optimization_strategies'
        verbose_name = 'Tax Optimization Strategy'
        verbose_name_plural = 'Tax Optimization Strategies'
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_strategy_type_display()} ({self.tax_year})"


class TaxYearSummary(models.Model):
    """
    Tax Year Summary model for annual tax calculations and summaries
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_year_summaries')
    tax_year = models.IntegerField(unique=False)  # Not unique globally, but unique per tenant
    total_profit = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_loss = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_gains = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_losses = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    net_taxable_income = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    realized_gains = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    realized_losses = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    unrealized_gains = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    unrealized_losses = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    offset_applied = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    estimated_tax_liability = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    estimated_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='Percentage')
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('calculated', 'Calculated'),
        ('reviewed', 'Reviewed'),
        ('finalized', 'Finalized'),
    ])
    notes = models.TextField(blank=True)
    calculated_at = models.DateTimeField(null=True, blank=True)
    finalized_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_year_summaries'
        verbose_name = 'Tax Year Summary'
        verbose_name_plural = 'Tax Year Summaries'
        unique_together = ['tenant', 'tax_year']
        ordering = ['-tax_year']

    def __str__(self):
        return f"Tax Year {self.tax_year} - {self.tenant.name}"

    def calculate_summary(self):
        """Calculate tax year summary from events"""
        events = TaxEvent.objects.filter(
            tenant=self.tenant,
            tax_year=self.tax_year
        )

        # Calculate totals
        self.total_profit = sum(e.amount for e in events if e.event_type in ['profit', 'capital_gain', 'crypto_gain', 'fiat_gain', 'dividend', 'interest'] and e.amount > 0)
        self.total_loss = abs(sum(e.amount for e in events if e.event_type in ['loss', 'capital_loss', 'crypto_loss', 'fiat_loss'] and e.amount < 0))
        self.total_gains = sum(e.amount for e in events if 'gain' in e.event_type and e.amount > 0)
        self.total_losses = abs(sum(e.amount for e in events if 'loss' in e.event_type and e.amount < 0))

        # Separate realized vs unrealized
        self.realized_gains = sum(e.amount for e in events if 'gain' in e.event_type and e.realized and e.amount > 0)
        self.realized_losses = abs(sum(e.amount for e in events if 'loss' in e.event_type and e.realized and e.amount < 0))
        self.unrealized_gains = sum(e.amount for e in events if 'gain' in e.event_type and not e.realized and e.amount > 0)
        self.unrealized_losses = abs(sum(e.amount for e in events if 'loss' in e.event_type and not e.realized and e.amount < 0))

        # Calculate offset
        self.offset_applied = sum(e.offset_amount for e in events if e.offset_applied)

        # Calculate net taxable income (gains - losses after offset)
        self.net_taxable_income = max(Decimal('0'), self.total_gains - self.total_losses - self.offset_applied)

        self.calculated_at = timezone.now()
        self.status = 'calculated'
        self.save()


class TaxAlert(models.Model):
    """
    Tax Alert model for proactive tax implication alerts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_alerts')
    alert_type = models.CharField(max_length=50, choices=[
        ('year_end_approaching', 'Year-End Approaching'),
        ('offset_opportunity', 'Offset Opportunity Available'),
        ('loss_harvesting', 'Loss Harvesting Opportunity'),
        ('realization_deadline', 'Realization Deadline'),
        ('tax_threshold', 'Tax Threshold Warning'),
        ('deduction_opportunity', 'Deduction Opportunity'),
    ])
    severity = models.CharField(max_length=20, choices=[
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ], default='medium')
    title = models.CharField(max_length=255)
    message = models.TextField()
    actionable = models.BooleanField(default=True)
    action_url = models.CharField(max_length=500, blank=True)
    related_event = models.ForeignKey(TaxEvent, on_delete=models.SET_NULL, null=True, blank=True)
    related_strategy = models.ForeignKey(TaxOptimizationStrategy, on_delete=models.SET_NULL, null=True, blank=True)
    tax_year = models.IntegerField()
    deadline_date = models.DateField(null=True, blank=True)
    read = models.BooleanField(default=False)
    dismissed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_alerts'
        verbose_name = 'Tax Alert'
        verbose_name_plural = 'Tax Alerts'
        ordering = ['-severity', '-created_at']
        indexes = [
            models.Index(fields=['tenant', 'dismissed', 'read']),
            models.Index(fields=['tenant', 'deadline_date']),
        ]

    def __str__(self):
        return f"{self.title} - {self.get_severity_display()}"


class TaxSettings(models.Model):
    """
    Tax Settings model for tenant-specific tax configuration
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.OneToOneField('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_settings')
    tax_jurisdiction = models.CharField(max_length=100, default='US', help_text='Primary tax jurisdiction')
    tax_year_end = models.DateField(null=True, blank=True, help_text='Tax year end date')
    default_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='Default tax rate percentage')
    enable_loss_harvesting = models.BooleanField(default=True)
    enable_auto_alerts = models.BooleanField(default=True)
    year_end_alert_days = models.IntegerField(default=30, help_text='Days before year-end to send alerts')
    loss_carryforward_years = models.IntegerField(default=3, help_text='Years to carry forward losses')
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_settings'
        verbose_name = 'Tax Settings'
        verbose_name_plural = 'Tax Settings'

    def __str__(self):
        return f"Tax Settings - {self.tenant.name}"

