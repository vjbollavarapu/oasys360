"""
Coinbase Prime Integration Models
Institutional cryptocurrency trading and custody
"""
from django.db import models
import uuid
from decimal import Decimal
from django.utils import timezone


class CoinbasePrimeConnection(models.Model):
    """
    Coinbase Prime Connection model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='coinbase_connections')
    name = models.CharField(max_length=255, help_text='Connection name')
    api_key = models.CharField(max_length=255, help_text='Coinbase Prime API key (encrypted)')
    api_secret = models.TextField(help_text='Coinbase Prime API secret (encrypted)')
    passphrase = models.CharField(max_length=255, help_text='API passphrase (encrypted)')
    portfolio_id = models.CharField(max_length=255, blank=True, help_text='Portfolio ID')
    environment = models.CharField(max_length=20, default='sandbox', choices=[
        ('sandbox', 'Sandbox'),
        ('production', 'Production'),
    ])
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coinbase_prime_connections'
        verbose_name = 'Coinbase Prime Connection'
        verbose_name_plural = 'Coinbase Prime Connections'

    def __str__(self):
        return f"Coinbase Prime - {self.name}"


class CoinbasePrimeAccount(models.Model):
    """
    Coinbase Prime Account model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='coinbase_accounts')
    connection = models.ForeignKey(CoinbasePrimeConnection, on_delete=models.CASCADE, related_name='accounts')
    account_id = models.CharField(max_length=255, unique=True, help_text='Coinbase Prime account ID')
    account_name = models.CharField(max_length=255, blank=True)
    account_type = models.CharField(max_length=50, choices=[
        ('trading', 'Trading'),
        ('vault', 'Vault'),
        ('cold_storage', 'Cold Storage'),
    ])
    currency = models.CharField(max_length=10, help_text='Account currency')
    balance = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    available_balance = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    last_sync = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coinbase_prime_accounts'
        verbose_name = 'Coinbase Prime Account'
        verbose_name_plural = 'Coinbase Prime Accounts'
        unique_together = ['tenant', 'connection', 'account_id']

    def __str__(self):
        return f"{self.account_name} - {self.currency}"


class CoinbasePrimeOrder(models.Model):
    """
    Coinbase Prime Order model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='coinbase_orders')
    connection = models.ForeignKey(CoinbasePrimeConnection, on_delete=models.CASCADE, related_name='orders')
    order_id = models.CharField(max_length=255, unique=True, help_text='Coinbase Prime order ID')
    product_id = models.CharField(max_length=50, help_text='Trading pair (e.g., BTC-USD)')
    side = models.CharField(max_length=10, choices=[
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    ])
    order_type = models.CharField(max_length=20, choices=[
        ('limit', 'Limit'),
        ('market', 'Market'),
        ('stop', 'Stop'),
    ])
    size = models.DecimalField(max_digits=30, decimal_places=18)
    price = models.DecimalField(max_digits=30, decimal_places=18, null=True, blank=True)
    filled_size = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('open', 'Open'),
        ('filled', 'Filled'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coinbase_prime_orders'
        verbose_name = 'Coinbase Prime Order'
        verbose_name_plural = 'Coinbase Prime Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.side.upper()} {self.size} {self.product_id} - {self.status}"

