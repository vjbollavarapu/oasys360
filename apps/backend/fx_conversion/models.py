"""
FX Conversion Models
Real-time foreign exchange rate tracking and conversion
"""
from django.db import models
import uuid
from decimal import Decimal
from django.utils import timezone
from backend.enhanced_base_models import TenantScopedModel


class Currency(TenantScopedModel):
    """
    Currency model for managing tenant-specific currencies
    Stores base_currency and supports ExchangeRates for transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='currencies')
    code = models.CharField(max_length=3, help_text='ISO 4217 currency code (e.g., MYR, USD, SGD)')
    name = models.CharField(max_length=255, help_text='Currency name (e.g., Malaysian Ringgit)')
    symbol = models.CharField(max_length=10, blank=True, help_text='Currency symbol (e.g., RM, $)')
    is_base_currency = models.BooleanField(default=False, help_text='Is this the base currency for the tenant?')
    decimal_places = models.IntegerField(default=2, help_text='Number of decimal places')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'currencies'
        verbose_name = 'Currency'
        verbose_name_plural = 'Currencies'
        unique_together = ['tenant', 'code']
        indexes = [
            models.Index(fields=['tenant', 'is_base_currency']),
            models.Index(fields=['tenant', 'code']),
        ]
        ordering = ['-is_base_currency', 'code']

    def __str__(self):
        base_indicator = ' (Base)' if self.is_base_currency else ''
        return f"{self.code} - {self.name}{base_indicator}"

    def save(self, *args, **kwargs):
        """Ensure only one base currency per tenant"""
        if self.is_base_currency:
            Currency.objects.filter(tenant=self.tenant, is_base_currency=True).exclude(id=self.id).update(is_base_currency=False)
        super().save(*args, **kwargs)


class ExchangeRate(models.Model):
    """
    Exchange Rate model for tracking currency exchange rates
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='exchange_rates', null=True, blank=True)
    from_currency = models.CharField(max_length=3, help_text='Source currency code (e.g., USD)')
    to_currency = models.CharField(max_length=3, help_text='Target currency code (e.g., EUR)')
    rate = models.DecimalField(max_digits=18, decimal_places=8, help_text='Exchange rate')
    source = models.CharField(max_length=50, default='api', choices=[
        ('api', 'API'),
        ('manual', 'Manual'),
        ('fixed', 'Fixed Rate'),
    ])
    provider = models.CharField(max_length=50, blank=True, help_text='Rate provider (e.g., exchangerate-api, fixer.io)')
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exchange_rates'
        verbose_name = 'Exchange Rate'
        verbose_name_plural = 'Exchange Rates'
        unique_together = ['tenant', 'from_currency', 'to_currency', 'valid_from']
        indexes = [
            models.Index(fields=['from_currency', 'to_currency', 'is_active']),
            models.Index(fields=['last_updated']),
        ]
        ordering = ['-last_updated']

    def __str__(self):
        return f"{self.from_currency}/{self.to_currency}: {self.rate}"

    def convert(self, amount: Decimal) -> Decimal:
        """Convert amount using this rate"""
        return amount * self.rate


class CurrencyConversion(models.Model):
    """
    Currency Conversion model for tracking conversion transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='currency_conversions')
    from_currency = models.CharField(max_length=3)
    to_currency = models.CharField(max_length=3)
    from_amount = models.DecimalField(max_digits=18, decimal_places=8)
    to_amount = models.DecimalField(max_digits=18, decimal_places=8)
    exchange_rate = models.DecimalField(max_digits=18, decimal_places=8)
    exchange_rate_id = models.ForeignKey(ExchangeRate, on_delete=models.SET_NULL, null=True, blank=True)
    conversion_date = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'currency_conversions'
        verbose_name = 'Currency Conversion'
        verbose_name_plural = 'Currency Conversions'
        ordering = ['-conversion_date']

    def __str__(self):
        return f"{self.from_amount} {self.from_currency} -> {self.to_amount} {self.to_currency}"


class CurrencyConfig(models.Model):
    """
    Currency Configuration model for tenant-specific currency settings
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.OneToOneField('tenants.Tenant', on_delete=models.CASCADE, related_name='currency_config')
    base_currency = models.CharField(max_length=3, default='USD', help_text='Base currency for reporting')
    default_exchange_rate_provider = models.CharField(max_length=50, default='exchangerate-api', choices=[
        ('exchangerate-api', 'ExchangeRate-API'),
        ('fixer', 'Fixer.io'),
        ('currencylayer', 'CurrencyLayer'),
        ('openexchangerates', 'OpenExchangeRates'),
    ])
    auto_update_rates = models.BooleanField(default=True, help_text='Automatically update exchange rates')
    update_frequency_hours = models.IntegerField(default=24, help_text='Rate update frequency in hours')
    last_rate_update = models.DateTimeField(null=True, blank=True)
    api_key = models.CharField(max_length=255, blank=True, help_text='API key for rate provider')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'currency_configs'
        verbose_name = 'Currency Config'
        verbose_name_plural = 'Currency Configs'

    def __str__(self):
        return f"Currency Config for {self.tenant.name}"

