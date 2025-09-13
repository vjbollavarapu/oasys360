from django.db import models
import uuid
from decimal import Decimal


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


class PurchaseOrder(models.Model):
    """
    Purchase Order model for managing purchase orders
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_orders')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='purchase_orders')
    order_number = models.CharField(max_length=50, unique=True)
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

    def __str__(self):
        return f"PO {self.order_number} - {self.supplier.name}"

    def calculate_totals(self):
        """Calculate order totals"""
        self.subtotal = sum(line.total_amount for line in self.lines.all())
        self.total_amount = self.subtotal + self.tax_amount + self.shipping_amount - self.discount_amount
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
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    received_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
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
    receipt_number = models.CharField(max_length=50, unique=True)
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

    def __str__(self):
        return f"Receipt {self.receipt_number} - {self.purchase_order.order_number}"


class PurchaseReceiptLine(models.Model):
    """
    Purchase Receipt Line model for individual line items in purchase receipts
    """
    purchase_receipt = models.ForeignKey(PurchaseReceipt, on_delete=models.CASCADE, related_name='lines')
    purchase_order_line = models.ForeignKey(PurchaseOrderLine, on_delete=models.CASCADE, related_name='receipt_lines')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
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
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='purchase_payments')
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
