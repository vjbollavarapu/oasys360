from django.db import models
import uuid
from decimal import Decimal


class Customer(models.Model):
    """
    Customer model for managing customers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='customers')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='US')
    postal_code = models.CharField(max_length=20, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_60', 'Net 60'),
        ('net_90', 'Net 90'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, default='active', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('prospect', 'Prospect'),
    ])
    delivery_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'customers'
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'
        unique_together = ['tenant', 'company', 'name']

    def __str__(self):
        return self.name

    def get_total_sales(self):
        """Get total sales for this customer"""
        return sum(invoice.total_amount for invoice in self.invoices.filter(status='paid'))

    def get_outstanding_balance(self):
        """Get outstanding balance for this customer"""
        return sum(
            invoice.total_amount - sum(payment.amount for payment in invoice.payments.all())
            for invoice in self.invoices.filter(status__in=['sent', 'viewed', 'overdue'])
        )


class SalesOrder(models.Model):
    """
    Sales Order model for managing sales orders
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_orders')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='sales_orders')
    order_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='sales_orders')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ])
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    notes = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)
    billing_address = models.TextField(blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_60', 'Net 60'),
        ('net_90', 'Net 90'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    shipped_at = models.DateTimeField(null=True, blank=True)
    exchange_rate = models.DecimalField(max_digits=15, decimal_places=2, default=1)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='approved_sales_orders', null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_sales_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_orders'
        verbose_name = 'Sales Order'
        verbose_name_plural = 'Sales Orders'
        ordering = ['-order_date', '-created_at']

    def __str__(self):
        return f"Order {self.order_number} - {self.customer.name}"

    def calculate_totals(self):
        """Calculate order totals"""
        self.subtotal = sum(line.total_amount for line in self.lines.all())
        self.total_amount = self.subtotal + self.tax_amount + self.shipping_amount - self.discount_amount
        self.save()


class SalesOrderLine(models.Model):
    """
    Sales Order Line model for individual line items in sales orders
    """
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='lines')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        db_table = 'sales_order_lines'
        verbose_name = 'Sales Order Line'
        verbose_name_plural = 'Sales Order Lines'

    def __str__(self):
        return f"{self.description} - {self.quantity} x {self.unit_price}"

    def save(self, *args, **kwargs):
        # Calculate line total
        subtotal = self.quantity * self.unit_price
        discount = subtotal * (self.discount_rate / 100)
        tax = (subtotal - discount) * (self.tax_rate / 100)
        self.line_total = subtotal - discount + tax
        super().save(*args, **kwargs)


class SalesQuote(models.Model):
    """
    Sales Quote model for managing sales quotes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_quotes')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='sales_quotes')
    quote_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='sales_quotes')
    quote_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ])
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    exchange_rate = models.DecimalField(max_digits=15, decimal_places=2, default=1)
    notes = models.TextField(blank=True)
    terms_conditions = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='approved_sales_quotes', null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    converted_to_order = models.ForeignKey('SalesOrder', on_delete=models.CASCADE, related_name='converted_from_quote', null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_sales_quotes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_quotes'
        verbose_name = 'Sales Quote'
        verbose_name_plural = 'Sales Quotes'
        ordering = ['-quote_date', '-created_at']

    def __str__(self):
        return f"Quote {self.quote_number} - {self.customer.name}"

    def calculate_totals(self):
        """Calculate quote totals"""
        self.subtotal = sum(line.total_amount for line in self.lines.all())
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        self.save()

    def is_expired(self):
        """Check if quote has expired"""
        from django.utils import timezone
        return self.expiry_date < timezone.now().date()


class SalesQuoteLine(models.Model):
    """
    Sales Quote Line model for individual line items in sales quotes
    """
    sales_quote = models.ForeignKey(SalesQuote, on_delete=models.CASCADE, related_name='lines')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        db_table = 'sales_quote_lines'
        verbose_name = 'Sales Quote Line'
        verbose_name_plural = 'Sales Quote Lines'

    def __str__(self):
        return f"{self.description} - {self.quantity} x {self.unit_price}"

    def save(self, *args, **kwargs):
        # Calculate line total
        subtotal = self.quantity * self.unit_price
        discount = subtotal * (self.discount_rate / 100)
        tax = (subtotal - discount) * (self.tax_rate / 100)
        self.line_total = subtotal - discount + tax
        super().save(*args, **kwargs)
