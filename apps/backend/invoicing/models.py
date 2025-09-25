from django.db import models
import uuid
from decimal import Decimal


class Invoice(models.Model):
    """
    Invoice model for managing invoices
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='invoices')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey('sales.Customer', on_delete=models.CASCADE, related_name='invoices')
    invoice_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ])
    payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_60', 'Net 60'),
        ('net_90', 'Net 90'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    terms_conditions = models.TextField(blank=True)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='approved_invoices', null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    exchange_rate = models.DecimalField(max_digits=15, decimal_places=2, default=1)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    notes = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    template = models.ForeignKey('InvoiceTemplate', on_delete=models.SET_NULL, null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_invoices')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        ordering = ['-invoice_date', '-created_at']

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.name}"

    def calculate_totals(self):
        """Calculate invoice totals"""
        self.subtotal = sum(line.total_amount for line in self.lines.all())
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        self.save()

    def is_overdue(self):
        """Check if invoice is overdue"""
        from django.utils import timezone
        return self.status not in ['paid', 'cancelled'] and self.due_date < timezone.now().date()

    def get_payment_status(self):
        """Get payment status"""
        if self.status == 'paid':
            return 'paid'
        elif self.is_overdue():
            return 'overdue'
        elif self.status == 'sent':
            return 'pending'
        else:
            return 'draft'


class InvoiceLine(models.Model):
    """
    Invoice Line model for individual line items in invoices
    """
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='lines')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE, null=True, blank=True)
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        db_table = 'invoice_lines'
        verbose_name = 'Invoice Line'
        verbose_name_plural = 'Invoice Lines'

    def __str__(self):
        return f"{self.description} - {self.quantity} x {self.unit_price}"

    def save(self, *args, **kwargs):
        # Calculate line total
        subtotal = self.quantity * self.unit_price
        discount = subtotal * (self.discount_rate / 100)
        tax = (subtotal - discount) * (self.tax_rate / 100)
        self.line_total = subtotal - discount + tax
        super().save(*args, **kwargs)


class InvoiceTemplate(models.Model):
    """
    Invoice Template model for managing invoice templates
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='invoice_templates')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    template_type = models.CharField(max_length=50, choices=[
        ('html', 'HTML Template'),
        ('pdf', 'PDF Template'),
        ('email', 'Email Template'),
    ])
    content = models.TextField()
    header_template = models.TextField(blank=True)
    footer_template = models.TextField(blank=True)
    line_item_template = models.TextField(blank=True)
    css_styles = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoice_templates'
        verbose_name = 'Invoice Template'
        verbose_name_plural = 'Invoice Templates'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one default template per tenant
        if self.is_default:
            InvoiceTemplate.objects.filter(
                tenant=self.tenant,
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)


class InvoicePayment(models.Model):
    """
    Invoice Payment model for tracking invoice payments
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=[
        ('cash', 'Cash'),
        ('check', 'Check'),
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('other', 'Other'),
    ])
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    exchange_rate = models.DecimalField(max_digits=15, decimal_places=2, default=1)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoice_payments'
        verbose_name = 'Invoice Payment'
        verbose_name_plural = 'Invoice Payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment {self.reference} - {self.amount}"


class EInvoiceSettings(models.Model):
    """
    E-Invoice Settings model for managing electronic invoicing
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='e_invoice_settings')
    is_enabled = models.BooleanField(default=False)
    provider = models.CharField(max_length=100, blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    api_secret = models.CharField(max_length=255, blank=True)
    webhook_url = models.URLField(blank=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'e_invoice_settings'
        verbose_name = 'E-Invoice Setting'
        verbose_name_plural = 'E-Invoice Settings'

    def __str__(self):
        return f"E-Invoice Settings for {self.tenant.name}"
