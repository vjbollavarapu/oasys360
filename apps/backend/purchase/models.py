from django.db import models
import uuid
from decimal import Decimal
from django.utils import timezone
from backend.enhanced_base_models import TenantScopedModel, FinancialModel, MultiCurrencyMixin


class Supplier(models.Model):
    """
    Supplier model for managing suppliers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='suppliers')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='suppliers')
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='US')
    postal_code = models.CharField(max_length=20, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_60', 'Net 60'),
        ('net_90', 'Net 90'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='active', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ])
    rating = models.IntegerField(choices=[
        (1, 'Poor'),
        (2, 'Fair'),
        (3, 'Good'),
        (4, 'Very Good'),
        (5, 'Excellent'),
    ], null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'suppliers'
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'
        unique_together = ['tenant', 'company', 'name']

    def __str__(self):
        return self.name

    def get_total_purchases(self):
        """Get total purchases from this supplier"""
        return sum(
            order.total_amount for order in self.purchase_orders.filter(status='received')
        )

    def get_outstanding_balance(self):
        """Get outstanding balance for this supplier"""
        return sum(
            order.total_amount - sum(payment.amount for payment in order.payments.all())
            for order in self.purchase_orders.filter(status='received')
        )


class PurchaseOrder(FinancialModel, MultiCurrencyMixin):
    """
    Purchase Order model for managing purchase orders
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_orders')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='purchase_orders')
    order_number = models.CharField(max_length=50)  # Removed unique=True to allow tenant-scoped uniqueness
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('confirmed', 'Confirmed'),
        ('partially_received', 'Partially Received'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    ])
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    notes = models.TextField(blank=True)
    payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_60', 'Net 60'),
        ('net_90', 'Net 90'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    exchange_rate = models.DecimalField(max_digits=15, decimal_places=2, default=1)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='approved_purchase_orders', null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    shipping_address = models.TextField(blank=True)
    billing_address = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_purchase_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_orders'
        verbose_name = 'Purchase Order'
        verbose_name_plural = 'Purchase Orders'
        ordering = ['-order_date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'order_number'],
                name='uniq_tenant_purchase_order_number'
            ),
        ]

    def __str__(self):
        return f"PO {self.order_number} - {self.supplier.name}"

    def save(self, *args, **kwargs):
        """Override save to auto-convert to base currency"""
        # Set transaction_currency from currency field if not set
        if not self.transaction_currency and self.currency:
            self.transaction_currency = self.currency
        
        # Auto-convert total_amount to base currency if transaction_currency is set
        if self.transaction_currency and self.total_amount:
            from fx_conversion.utils import convert_to_base
            try:
                converted, rate, base = convert_to_base(
                    self.total_amount,
                    self.transaction_currency,
                    str(self.tenant.id),
                    timezone.now() if hasattr(self, 'order_date') and self.order_date else None
                )
                self.converted_amount_in_base_currency = converted
                self.exchange_rate = rate
                self.exchange_rate_date = timezone.now()
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to convert currency for PurchaseOrder {self.id}: {e}")
        
        super().save(*args, **kwargs)
    
    def calculate_totals(self):
        """Calculate order totals"""
        self.subtotal = sum(line.total_amount for line in self.lines.all())
        self.total_amount = self.subtotal + self.tax_amount + self.shipping_amount - self.discount_amount
        
        # Auto-convert to base currency
        if self.transaction_currency and self.total_amount:
            from fx_conversion.utils import convert_to_base
            try:
                converted, rate, base = convert_to_base(
                    self.total_amount,
                    self.transaction_currency,
                    str(self.tenant.id),
                    timezone.now() if hasattr(self, 'order_date') and self.order_date else None
                )
                self.converted_amount_in_base_currency = converted
                self.exchange_rate = rate
                self.exchange_rate_date = timezone.now()
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to convert currency for PurchaseOrder {self.id}: {e}")
        
        self.save()

    def get_received_quantity(self):
        """Get total received quantity"""
        return sum(line.received_quantity for line in self.lines.all())

    def get_total_quantity(self):
        """Get total ordered quantity"""
        return sum(line.quantity for line in self.lines.all())

    def is_fully_received(self):
        """Check if order is fully received"""
        return self.get_received_quantity() >= self.get_total_quantity()


class PurchaseOrderLine(models.Model):
    """
    Purchase Order Line model for individual line items in purchase orders
    """
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_order_lines')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    received_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_purchase_order_lines')
    updated_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_purchase_order_lines')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        db_table = 'purchase_order_lines'
        verbose_name = 'Purchase Order Line'
        verbose_name_plural = 'Purchase Order Lines'

    def __str__(self):
        return f"{self.description} - {self.quantity} x {self.unit_price}"

    def save(self, *args, **kwargs):
        # Calculate line total
        subtotal = self.quantity * self.unit_price
        discount = subtotal * (self.discount_rate / 100)
        tax = (subtotal - discount) * (self.tax_rate / 100)
        self.line_total = subtotal - discount + tax
        super().save(*args, **kwargs)

    def get_remaining_quantity(self):
        """Get remaining quantity to be received"""
        return self.quantity - self.received_quantity


class PurchaseReceipt(models.Model):
    """
    Purchase Receipt model for managing goods received
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_receipts')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='purchase_receipts')
    receipt_number = models.CharField(max_length=50)  # Removed unique=True to allow tenant-scoped uniqueness
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='receipts')
    receipt_date = models.DateField()
    warehouse = models.ForeignKey('inventory.Warehouse', on_delete=models.CASCADE, related_name='purchase_receipts')
    notes = models.TextField(blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_receipts')
    supplier_name = models.CharField(max_length=255, blank=True)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='approved_purchase_receipts', null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    ])
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_receipts'
        verbose_name = 'Purchase Receipt'
        verbose_name_plural = 'Purchase Receipts'
        ordering = ['-receipt_date']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'receipt_number'],
                name='uniq_tenant_receipt_number'
            ),
        ]

    def __str__(self):
        return f"Receipt {self.receipt_number} - {self.purchase_order.order_number}"


class PurchaseReceiptLine(models.Model):
    """
    Purchase Receipt Line model for individual line items in purchase receipts
    """
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_receipt_lines')
    purchase_receipt = models.ForeignKey(PurchaseReceipt, on_delete=models.CASCADE, related_name='lines')
    purchase_order_line = models.ForeignKey(PurchaseOrderLine, on_delete=models.CASCADE, related_name='receipt_lines')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_purchase_receipt_lines')
    updated_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_purchase_receipt_lines')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        db_table = 'purchase_receipt_lines'
        verbose_name = 'Purchase Receipt Line'
        verbose_name_plural = 'Purchase Receipt Lines'

    def __str__(self):
        return f"{self.item.name} - {self.quantity_received}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update purchase order line received quantity
        self.purchase_order_line.received_quantity += self.quantity_received
        self.purchase_order_line.save()


class PurchasePayment(models.Model):
    """
    Purchase Payment model for tracking payments to suppliers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_payments')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=[
        ('cash', 'Cash'),
        ('check', 'Check'),
        ('bank_transfer', 'Bank Transfer'),
        ('credit_card', 'Credit Card'),
        ('other', 'Other'),
    ])
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='payments')
    supplier_name = models.CharField(max_length=255, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    exchange_rate = models.DecimalField(max_digits=15, decimal_places=2, default=1)
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='purchase_payments')
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_payments'
        verbose_name = 'Purchase Payment'
        verbose_name_plural = 'Purchase Payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment {self.reference} - {self.amount}"


# ============================================================================
# Vendor Identity Verification Models
# ============================================================================

class VendorWalletAddress(models.Model):
    """
    Vendor Wallet Address model for storing verified wallet addresses for suppliers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='vendor_wallets')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='wallet_addresses')
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
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='verification_logs')
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
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='payment_blocks')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, null=True, blank=True, related_name='payment_blocks')
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


class PurchaseApprovalRequest(models.Model):
    """
    Purchase Approval Request model for managing approval workflows
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_approval_requests')
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='approval_requests')
    requested_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='requested_purchase_approvals')
    approval_type = models.CharField(max_length=50, choices=[
        ('purchase_order', 'Purchase Order'),
        ('receipt', 'Receipt'),
        ('payment', 'Payment'),
        ('contract', 'Contract'),
    ], default='purchase_order')
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ])
    approval_level = models.IntegerField(default=1, help_text='Approval level in workflow')
    approver = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='purchase_approvals_to_approve', null=True, blank=True)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_purchase_requests')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_approval_requests'
        verbose_name = 'Purchase Approval Request'
        verbose_name_plural = 'Purchase Approval Requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"Approval for {self.purchase_order.order_number} - {self.get_status_display()}"


class PurchaseContract(models.Model):
    """
    Purchase Contract model for managing supplier contracts and agreements
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_contracts')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='purchase_contracts')
    contract_number = models.CharField(max_length=50)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='contracts')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    contract_type = models.CharField(max_length=50, choices=[
        ('master_agreement', 'Master Agreement'),
        ('purchase_agreement', 'Purchase Agreement'),
        ('service_agreement', 'Service Agreement'),
        ('framework_agreement', 'Framework Agreement'),
        ('blanket_order', 'Blanket Order'),
        ('other', 'Other'),
    ], default='purchase_agreement')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('terminated', 'Terminated'),
        ('renewed', 'Renewed'),
    ])
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    payment_terms = models.CharField(max_length=50, default='net_30')
    renewal_option = models.BooleanField(default=False)
    auto_renew = models.BooleanField(default=False)
    renewal_notice_days = models.IntegerField(default=30)
    document_url = models.URLField(blank=True, null=True)
    file_path = models.CharField(max_length=500, blank=True)
    terms_conditions = models.TextField(blank=True)
    signed_by_supplier = models.BooleanField(default=False)
    signed_by_company = models.BooleanField(default=False)
    signed_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_purchase_contracts')
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_purchase_contracts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_contracts'
        verbose_name = 'Purchase Contract'
        verbose_name_plural = 'Purchase Contracts'
        ordering = ['-created_at']
        unique_together = ['tenant', 'contract_number']

    def __str__(self):
        return f"Contract {self.contract_number} - {self.supplier.name}"

    def is_active(self):
        """Check if contract is currently active"""
        from django.utils import timezone
        today = timezone.now().date()
        if self.end_date:
            return self.start_date <= today <= self.end_date and self.status == 'active'
        return self.start_date <= today and self.status == 'active'

    def is_expiring_soon(self):
        """Check if contract is expiring soon"""
        from django.utils import timezone
        if not self.end_date or self.status != 'active':
            return False
        today = timezone.now().date()
        days_until_expiry = (self.end_date - today).days
        return 0 <= days_until_expiry <= self.renewal_notice_days


class PurchaseSettings(models.Model):
    """
    Purchase Settings model for tenant/company-specific purchase configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_settings')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='purchase_settings', null=True, blank=True)
    
    # General Settings
    default_currency = models.CharField(max_length=3, default='USD')
    default_payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_60', 'Net 60'),
        ('net_90', 'Net 90'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    
    # Order Settings
    order_number_prefix = models.CharField(max_length=20, default='PO-')
    order_number_format = models.CharField(max_length=50, default='{prefix}{year}-{number:04d}')
    require_order_approval = models.BooleanField(default=False)
    require_receipt_approval = models.BooleanField(default=False)
    approval_threshold = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('10000.00'), help_text='Amount threshold requiring approval')
    
    # Receiving Settings
    enable_receiving_inspection = models.BooleanField(default=True)
    default_warehouse = models.ForeignKey('inventory.Warehouse', on_delete=models.SET_NULL, null=True, blank=True, related_name='default_for_purchase_settings')
    
    # Contract Settings
    enable_contract_management = models.BooleanField(default=True)
    default_contract_validity_days = models.IntegerField(default=365)
    auto_renewal_reminder_days = models.IntegerField(default=30)
    
    # Analytics Settings
    enable_purchase_analytics = models.BooleanField(default=True)
    analytics_retention_days = models.IntegerField(default=365)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_settings'
        verbose_name = 'Purchase Settings'
        verbose_name_plural = 'Purchase Settings'
        unique_together = ['tenant', 'company']

    def __str__(self):
        return f"Purchase Settings - {self.tenant.name}"
