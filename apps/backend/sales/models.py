from django.db import models
import uuid
from decimal import Decimal
from backend.enhanced_base_models import TenantScopedModel, FinancialModel


class Customer(FinancialModel):
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


class SalesOrder(FinancialModel):
    """
    Sales Order model for managing sales orders
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_orders')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='sales_orders')
    order_number = models.CharField(max_length=50)  # Removed unique=True to allow tenant-scoped uniqueness
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
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'order_number'],
                name='uniq_tenant_order_number'
            ),
        ]

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
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_order_lines')
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='lines')
    # item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)  # Temporarily commented to break circular dependency
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_sales_order_lines')
    updated_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_sales_order_lines')
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


class SalesQuote(FinancialModel):
    """
    Sales Quote model for managing sales quotes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_quotes')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='sales_quotes')
    quote_number = models.CharField(max_length=50)  # Removed unique=True to allow tenant-scoped uniqueness
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
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'quote_number'],
                name='uniq_tenant_quote_number'
            ),
        ]

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
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_quote_lines')
    sales_quote = models.ForeignKey(SalesQuote, on_delete=models.CASCADE, related_name='lines')
    # item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)  # Temporarily commented to break circular dependency
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_sales_quote_lines')
    updated_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_sales_quote_lines')
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


class SalesOpportunity(FinancialModel):
    """
    Sales Opportunity model for tracking sales pipeline and opportunities
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_opportunities')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='sales_opportunities')
    opportunity_number = models.CharField(max_length=50, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='opportunities')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    stage = models.CharField(max_length=50, choices=[
        ('prospecting', 'Prospecting'),
        ('qualification', 'Qualification'),
        ('needs_analysis', 'Needs Analysis'),
        ('quotation', 'Quotation'),
        ('proforma', 'Proforma'),
        ('sales_order', 'Sales Order'),
        ('invoice', 'Invoice'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ], default='prospecting')
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    probability = models.IntegerField(default=0, help_text='Probability percentage (0-100)')
    currency = models.CharField(max_length=3, default='USD')
    expected_close_date = models.DateField(null=True, blank=True)
    actual_close_date = models.DateField(null=True, blank=True)
    sales_person = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='sales_opportunities')
    assigned_to = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_opportunities')
    status = models.CharField(max_length=20, default='open', choices=[
        ('open', 'Open'),
        ('won', 'Won'),
        ('lost', 'Lost'),
        ('cancelled', 'Cancelled'),
    ])
    lost_reason = models.TextField(blank=True)
    converted_to_quote = models.ForeignKey(SalesQuote, on_delete=models.SET_NULL, null=True, blank=True, related_name='converted_from_opportunity')
    converted_to_order = models.ForeignKey(SalesOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='converted_from_opportunity')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_opportunities'
        verbose_name = 'Sales Opportunity'
        verbose_name_plural = 'Sales Opportunities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.customer.name} ({self.get_stage_display()})"

    def get_weighted_value(self):
        """Get weighted value based on probability"""
        return self.value * (self.probability / 100)


class SalesCommission(FinancialModel):
    """
    Sales Commission model for tracking sales commissions and incentives
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_commissions')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='sales_commissions')
    sales_person = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='commissions')
    period_start = models.DateField()
    period_end = models.DateField()
    commission_type = models.CharField(max_length=50, choices=[
        ('sales_order', 'Sales Order'),
        ('quote', 'Quote'),
        ('invoice', 'Invoice'),
        ('opportunity', 'Opportunity'),
        ('bonus', 'Bonus'),
        ('other', 'Other'),
    ])
    reference_type = models.CharField(max_length=50, blank=True)  # e.g., 'sales_order', 'quote'
    reference_id = models.UUIDField(null=True, blank=True)
    base_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, help_text='Base amount for commission calculation')
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='Commission rate as percentage')
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('calculated', 'Calculated'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ])
    payment_date = models.DateField(null=True, blank=True)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_commissions')
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_commissions'
        verbose_name = 'Sales Commission'
        verbose_name_plural = 'Sales Commissions'
        ordering = ['-period_end', '-created_at']

    def __str__(self):
        return f"Commission - {self.sales_person.get_full_name()} ({self.period_start} to {self.period_end})"

    def calculate_commission(self):
        """Calculate commission amount"""
        self.commission_amount = self.base_amount * (self.commission_rate / 100)
        self.save()


class SalesSettings(FinancialModel):
    """
    Sales Settings model for tenant/company-specific sales configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='sales_settings')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='sales_settings', null=True, blank=True)
    
    # General Settings
    default_currency = models.CharField(max_length=3, default='USD')
    default_payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_60', 'Net 60'),
        ('net_90', 'Net 90'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    
    # Quote Settings
    default_quote_validity_days = models.IntegerField(default=30)
    quote_number_prefix = models.CharField(max_length=20, default='QT-')
    quote_number_format = models.CharField(max_length=50, default='{prefix}{year}-{number:04d}')
    
    # Order Settings
    order_number_prefix = models.CharField(max_length=20, default='SO-')
    order_number_format = models.CharField(max_length=50, default='{prefix}{year}-{number:04d}')
    require_order_approval = models.BooleanField(default=False)
    
    # Commission Settings
    enable_commission_tracking = models.BooleanField(default=True)
    default_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'), help_text='Default commission rate as percentage')
    commission_payment_terms = models.CharField(max_length=50, default='net_30')
    
    # Pipeline Settings
    enable_pipeline_tracking = models.BooleanField(default=True)
    default_probability_by_stage = models.JSONField(default=dict, blank=True, help_text='Default probability by pipeline stage')
    
    # Analytics Settings
    enable_sales_analytics = models.BooleanField(default=True)
    analytics_retention_days = models.IntegerField(default=365)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_settings'
        verbose_name = 'Sales Settings'
        verbose_name_plural = 'Sales Settings'
        unique_together = ['tenant', 'company']

    def __str__(self):
        return f"Sales Settings - {self.tenant.name}"
