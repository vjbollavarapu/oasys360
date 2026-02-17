"""
Vendor Identity Verification Service
Handles wallet address verification, transaction history checks, and payment blocking
"""
from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class VendorWalletAddress(models.Model):
    """
    Vendor Wallet Address model for storing verified wallet addresses for suppliers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='vendor_wallets')
    supplier = models.ForeignKey('purchase.Supplier', on_delete=models.CASCADE, related_name='wallet_addresses')
    wallet_address = models.CharField(max_length=255, help_text='Cryptocurrency wallet address')
    network = models.CharField(max_length=50, choices=[
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
        ('arbitrum', 'Arbitrum'),
        ('optimism', 'Optimism'),
        ('base', 'Base'),
    ])
    is_primary = models.BooleanField(default=False, help_text='Primary wallet address for this supplier')
    is_verified = models.BooleanField(default=False, help_text='Manually verified by admin')
    verification_date = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    transaction_count = models.IntegerField(default=0, help_text='Number of transactions from this address')
    first_transaction_date = models.DateTimeField(null=True, blank=True)
    last_transaction_date = models.DateTimeField(null=True, blank=True)
    total_amount_received = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    risk_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='Risk score 0-100')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendor_wallet_addresses'
        verbose_name = 'Vendor Wallet Address'
        verbose_name_plural = 'Vendor Wallet Addresses'
        unique_together = ['tenant', 'wallet_address', 'network']
        indexes = [
            models.Index(fields=['supplier', 'is_primary']),
            models.Index(fields=['is_verified', 'risk_score']),
        ]

    def __str__(self):
        return f"{self.supplier.name} - {self.wallet_address[:10]}... ({self.network})"


class VendorVerificationLog(models.Model):
    """
    Vendor Verification Log model for tracking verification attempts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='verification_logs')
    supplier = models.ForeignKey('purchase.Supplier', on_delete=models.CASCADE, related_name='verification_logs')
    wallet_address = models.CharField(max_length=255)
    network = models.CharField(max_length=50)
    verification_type = models.CharField(max_length=50, choices=[
        ('auto', 'Automatic'),
        ('manual', 'Manual'),
        ('payment_check', 'Payment Check'),
        ('transaction_analysis', 'Transaction Analysis'),
    ])
    verification_status = models.CharField(max_length=20, choices=[
        ('passed', 'Passed'),
        ('failed', 'Failed'),
        ('warning', 'Warning'),
        ('blocked', 'Blocked'),
    ])
    risk_factors = models.JSONField(default=list, blank=True, help_text='List of risk factors identified')
    transaction_history_match = models.BooleanField(default=False)
    address_found_in_history = models.BooleanField(default=False)
    transaction_count_found = models.IntegerField(default=0)
    recommendation = models.CharField(max_length=50, choices=[
        ('approve', 'Approve'),
        ('review', 'Review Required'),
        ('block', 'Block Payment'),
    ])
    notes = models.TextField(blank=True)
    verified_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vendor_verification_logs'
        verbose_name = 'Vendor Verification Log'
        verbose_name_plural = 'Vendor Verification Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['supplier', 'verification_status']),
            models.Index(fields=['wallet_address', 'network']),
        ]

    def __str__(self):
        return f"Verification {self.verification_status} - {self.supplier.name} ({self.created_at})"


class PaymentBlock(models.Model):
    """
    Payment Block model for blocking suspicious payments
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='payment_blocks')
    supplier = models.ForeignKey('purchase.Supplier', on_delete=models.CASCADE, related_name='payment_blocks')
    purchase_order = models.ForeignKey('purchase.PurchaseOrder', on_delete=models.CASCADE, null=True, blank=True, related_name='payment_blocks')
    invoice = models.ForeignKey('invoicing.Invoice', on_delete=models.CASCADE, null=True, blank=True, related_name='payment_blocks')
    wallet_address = models.CharField(max_length=255)
    network = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    block_reason = models.CharField(max_length=50, choices=[
        ('unknown_address', 'Unknown Wallet Address'),
        ('suspicious_pattern', 'Suspicious Transaction Pattern'),
        ('no_transaction_history', 'No Transaction History'),
        ('risk_score_threshold', 'High Risk Score'),
        ('manual_block', 'Manually Blocked'),
    ])
    risk_factors = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, default='blocked', choices=[
        ('blocked', 'Blocked'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('resolved', 'Resolved'),
    ])
    resolution_notes = models.TextField(blank=True)
    blocked_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='blocked_payments')
    resolved_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_payments')
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_blocks'
        verbose_name = 'Payment Block'
        verbose_name_plural = 'Payment Blocks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['supplier', 'status']),
            models.Index(fields=['wallet_address', 'network']),
        ]

    def __str__(self):
        return f"Blocked: {self.supplier.name} - {self.amount} ({self.get_block_reason_display()})"

