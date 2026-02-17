"""
Gnosis Safe Integration Models
Multi-signature wallet support
"""
from django.db import models
import uuid
from decimal import Decimal
from django.utils import timezone


class GnosisSafe(models.Model):
    """
    Gnosis Safe wallet model for multi-signature wallet management
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='gnosis_safes')
    name = models.CharField(max_length=255, help_text='Safe wallet name')
    safe_address = models.CharField(max_length=255, unique=True, help_text='Gnosis Safe contract address')
    network = models.CharField(max_length=50, choices=[
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('arbitrum', 'Arbitrum'),
        ('optimism', 'Optimism'),
        ('base', 'Base'),
    ], default='ethereum')
    threshold = models.IntegerField(help_text='Number of signatures required')
    owner_count = models.IntegerField(default=0, help_text='Number of owners')
    version = models.CharField(max_length=20, default='1.3.0', help_text='Safe contract version')
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    balance = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'gnosis_safes'
        verbose_name = 'Gnosis Safe'
        verbose_name_plural = 'Gnosis Safes'
        unique_together = ['tenant', 'safe_address', 'network']

    def __str__(self):
        return f"{self.name} ({self.safe_address[:10]}...)"


class GnosisSafeOwner(models.Model):
    """
    Gnosis Safe owner model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    safe = models.ForeignKey(GnosisSafe, on_delete=models.CASCADE, related_name='owners')
    owner_address = models.CharField(max_length=255, help_text='Owner wallet address')
    name = models.CharField(max_length=255, blank=True, help_text='Owner name/identifier')
    is_active = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'gnosis_safe_owners'
        verbose_name = 'Gnosis Safe Owner'
        verbose_name_plural = 'Gnosis Safe Owners'
        unique_together = ['safe', 'owner_address']

    def __str__(self):
        return f"{self.name or self.owner_address[:10]}... - {self.safe.name}"


class GnosisSafeTransaction(models.Model):
    """
    Gnosis Safe transaction model for tracking multi-sig transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='gnosis_transactions')
    safe = models.ForeignKey(GnosisSafe, on_delete=models.CASCADE, related_name='transactions')
    safe_tx_hash = models.CharField(max_length=255, unique=True, help_text='Safe transaction hash')
    to_address = models.CharField(max_length=255, help_text='Recipient address')
    value = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    data = models.TextField(blank=True, help_text='Transaction data')
    operation = models.IntegerField(default=0, help_text='Operation type (0=call, 1=delegatecall)')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('executed', 'Executed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    confirmations_count = models.IntegerField(default=0)
    confirmations_required = models.IntegerField(default=0)
    nonce = models.BigIntegerField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    execution_tx_hash = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'gnosis_safe_transactions'
        verbose_name = 'Gnosis Safe Transaction'
        verbose_name_plural = 'Gnosis Safe Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['safe', 'status']),
            models.Index(fields=['safe_tx_hash']),
        ]

    def __str__(self):
        return f"{self.safe.name} - {self.safe_tx_hash[:10]}... ({self.status})"


class GnosisSafeConfirmation(models.Model):
    """
    Gnosis Safe transaction confirmation model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(GnosisSafeTransaction, on_delete=models.CASCADE, related_name='confirmations')
    owner = models.ForeignKey(GnosisSafeOwner, on_delete=models.CASCADE, related_name='confirmations')
    signature = models.TextField(help_text='Owner signature')
    confirmed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'gnosis_safe_confirmations'
        verbose_name = 'Gnosis Safe Confirmation'
        verbose_name_plural = 'Gnosis Safe Confirmations'
        unique_together = ['transaction', 'owner']

    def __str__(self):
        return f"Confirmation by {self.owner.owner_address[:10]}... for {self.transaction.safe_tx_hash[:10]}..."

