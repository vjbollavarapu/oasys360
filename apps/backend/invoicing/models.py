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
    invoice_number = models.CharField(max_length=50)  # Removed unique=True to allow tenant-scoped uniqueness
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
    
    # E-Invoice (LHDN) specific fields
    e_invoice_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ], blank=True, null=True)
    lhdn_reference_number = models.CharField(max_length=255, blank=True, null=True, help_text='QRID from LHDN')
    submitted_to_lhdn_at = models.DateTimeField(null=True, blank=True)
    lhdn_validated_at = models.DateTimeField(null=True, blank=True)
    e_invoice_xml = models.TextField(blank=True, null=True, help_text='Generated UBL 2.1 XML format')
    e_invoice_json = models.JSONField(default=dict, blank=True, null=True, help_text='Generated UBL 2.1 JSON format')
    e_invoice_errors = models.JSONField(default=list, blank=True, help_text='Validation errors from LHDN')

    class Meta:
        db_table = 'invoices'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        ordering = ['-invoice_date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'invoice_number'],
                name='uniq_tenant_invoice_number'
            ),
        ]

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.name}"

    def calculate_totals(self):
        """Calculate invoice totals"""
        self.subtotal = sum(line.line_total for line in self.lines.all())
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
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='invoice_lines')
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='lines')
    # item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE, null=True, blank=True)  # Temporarily commented to break circular dependency
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=15, decimal_places=2)
    # E-Invoice (LHDN) specific fields
    msic_code = models.CharField(max_length=20, blank=True, null=True, help_text='Malaysia Standard Industrial Classification code')
    tax_category = models.CharField(max_length=20, blank=True, null=True, choices=[
        ('standard', 'Standard Rate'),
        ('zero_rated', 'Zero Rated'),
        ('exempt', 'Exempt'),
        ('out_of_scope', 'Out of Scope'),
    ], help_text='Tax category for LHDN e-Invois')
    tax_exemption_code = models.CharField(max_length=50, blank=True, null=True, help_text='Tax exemption code if applicable')
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_invoice_lines')
    updated_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_invoice_lines')
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
        from decimal import Decimal
        subtotal = self.quantity * self.unit_price
        discount = subtotal * (Decimal(str(self.discount_rate)) / Decimal('100'))
        tax = (subtotal - discount) * (Decimal(str(self.tax_rate)) / Decimal('100'))
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
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='invoice_payments')
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


class EInvoiceSubmission(models.Model):
    """
    E-Invoice Submission model for tracking all submission attempts to MyInvois
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='e_invoice_submissions')
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='e_invoice_submissions')
    submission_type = models.CharField(max_length=20, choices=[
        ('submit', 'Submit'),
        ('status_check', 'Status Check'),
        ('cancel', 'Cancel'),
    ], default='submit')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ], default='pending')
    request_payload = models.JSONField(default=dict, blank=True, help_text='Request sent to MyInvois')
    response_payload = models.JSONField(default=dict, blank=True, null=True, help_text='Response from MyInvois')
    qrid = models.CharField(max_length=255, blank=True, null=True, help_text='LHDN Reference Number (QRID)')
    error_message = models.TextField(blank=True, null=True)
    error_code = models.CharField(max_length=100, blank=True, null=True)
    retry_count = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='e_invoice_submissions')

    class Meta:
        db_table = 'e_invoice_submissions'
        verbose_name = 'E-Invoice Submission'
        verbose_name_plural = 'E-Invoice Submissions'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['invoice', '-submitted_at']),
            models.Index(fields=['tenant', '-submitted_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"E-Invoice Submission {self.id} - {self.invoice.invoice_number} ({self.status})"


class InvoiceComplianceRule(models.Model):
    """
    Invoice Compliance Rule model for managing compliance rules and regulations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='invoice_compliance_rules')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    rule_type = models.CharField(max_length=50, choices=[
        ('tax', 'Tax Compliance'),
        ('legal', 'Legal Requirement'),
        ('industry', 'Industry Standard'),
        ('custom', 'Custom Rule'),
    ])
    region = models.CharField(max_length=100, blank=True, help_text='Geographic region (e.g., US, EU, MY)')
    is_active = models.BooleanField(default=True)
    rule_expression = models.TextField(help_text='Rule logic/expression')
    severity = models.CharField(max_length=20, default='warning', choices=[
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ])
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_compliance_rules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoice_compliance_rules'
        verbose_name = 'Invoice Compliance Rule'
        verbose_name_plural = 'Invoice Compliance Rules'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.get_rule_type_display()}"


class ComplianceViolation(models.Model):
    """
    Compliance Violation model for tracking compliance rule violations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='compliance_violations')
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='compliance_violations')
    rule = models.ForeignKey(InvoiceComplianceRule, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=50)
    description = models.TextField()
    severity = models.CharField(max_length=20, default='warning')
    status = models.CharField(max_length=20, default='open', choices=[
        ('open', 'Open'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('ignored', 'Ignored'),
    ])
    resolved_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_violations')
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'compliance_violations'
        verbose_name = 'Compliance Violation'
        verbose_name_plural = 'Compliance Violations'
        ordering = ['-created_at']

    def __str__(self):
        return f"Violation: {self.rule.name} - {self.invoice.invoice_number}"


class DigitalCertificate(models.Model):
    """
    Digital Certificate model for managing digital certificates used for invoice signing
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='digital_certificates')
    name = models.CharField(max_length=255)
    certificate_type = models.CharField(max_length=50, choices=[
        ('x509', 'X.509 Certificate'),
        ('pem', 'PEM Certificate'),
        ('p12', 'PKCS#12'),
        ('pfx', 'PFX Certificate'),
    ])
    issuer = models.CharField(max_length=255, blank=True)
    serial_number = models.CharField(max_length=255, blank=True)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False)
    certificate_data = models.TextField(help_text='Base64 encoded certificate')
    private_key = models.TextField(blank=True, help_text='Encrypted private key (if stored)')
    password = models.CharField(max_length=255, blank=True, help_text='Encrypted password for certificate')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_certificates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'digital_certificates'
        verbose_name = 'Digital Certificate'
        verbose_name_plural = 'Digital Certificates'
        ordering = ['-is_primary', 'name']

    def __str__(self):
        return f"{self.name} - {self.get_certificate_type_display()}"

    def is_valid(self):
        """Check if certificate is currently valid"""
        from django.utils import timezone
        now = timezone.now()
        return self.valid_from <= now <= self.valid_to and self.is_active


class InvoiceSignature(models.Model):
    """
    Invoice Signature model for tracking digital signatures on invoices
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='invoice_signatures')
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='signatures')
    certificate = models.ForeignKey(DigitalCertificate, on_delete=models.CASCADE, related_name='signatures')
    signature_hash = models.CharField(max_length=512, help_text='SHA-256 hash of the signature')
    signature_data = models.TextField(help_text='Base64 encoded signature')
    signed_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='signed_invoices')
    signed_at = models.DateTimeField(auto_now_add=True)
    verification_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('invalid', 'Invalid'),
        ('expired', 'Expired'),
    ])
    verified_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'invoice_signatures'
        verbose_name = 'Invoice Signature'
        verbose_name_plural = 'Invoice Signatures'
        ordering = ['-signed_at']

    def __str__(self):
        return f"Signature for {self.invoice.invoice_number} - {self.signed_at}"


class TaxCode(models.Model):
    """
    Tax Code model for standardizing tax code definitions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_codes')
    code = models.CharField(max_length=50, help_text='Tax code (e.g., GST_STANDARD, SST_SALES)')
    name = models.CharField(max_length=255, help_text='Tax code name (e.g., GST Standard Rate)')
    tax_type = models.CharField(max_length=50, choices=[
        ('sales', 'Sales Tax'),
        ('vat', 'VAT'),
        ('gst', 'GST'),
        ('service', 'Service Tax'),
        ('excise', 'Excise Tax'),
        ('custom', 'Custom Tax'),
    ], help_text='Type of tax')
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False, help_text='System-defined codes cannot be deleted')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_codes'
        verbose_name = 'Tax Code'
        verbose_name_plural = 'Tax Codes'
        unique_together = ['tenant', 'code']
        ordering = ['code']

    def __str__(self):
        return f"{self.name} ({self.code})"


class TaxRate(models.Model):
    """
    Tax Rate model for managing tax rates by region and category
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_rates')
    name = models.CharField(max_length=255)
    # Use ForeignKey to TaxCode for standardization
    tax_code = models.ForeignKey(TaxCode, on_delete=models.PROTECT, related_name='tax_rates', null=True, blank=True, help_text='Tax code (FK to TaxCode)')
    # Keep code field for backward compatibility and migration period
    code = models.CharField(max_length=50, help_text='Tax code (legacy field, use tax_code FK)')
    rate = models.DecimalField(max_digits=5, decimal_places=2, help_text='Tax rate as percentage')
    tax_type = models.CharField(max_length=50, choices=[
        ('sales', 'Sales Tax'),
        ('vat', 'VAT'),
        ('gst', 'GST'),
        ('service', 'Service Tax'),
        ('excise', 'Excise Tax'),
        ('custom', 'Custom Tax'),
    ])
    region = models.CharField(max_length=100, blank=True, help_text='Region/State/Country')
    category = models.CharField(max_length=100, blank=True, help_text='Product/service category')
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='created_tax_rates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_rates'
        verbose_name = 'Tax Rate'
        verbose_name_plural = 'Tax Rates'
        ordering = ['-is_default', 'name']
        unique_together = ['tenant', 'code', 'region', 'effective_from']

    def __str__(self):
        return f"{self.name} ({self.rate}%) - {self.region}"


class TaxCategory(models.Model):
    """
    Tax Category model for categorizing tax types
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_categories')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_categories'
        verbose_name = 'Tax Category'
        verbose_name_plural = 'Tax Categories'
        ordering = ['name']
        unique_together = ['tenant', 'code']

    def __str__(self):
        return f"{self.name} ({self.code})"


class InvoicingSettings(models.Model):
    """
    Invoicing Settings model for tenant/company-specific invoicing configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='invoicing_settings')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='invoicing_settings', null=True, blank=True)
    
    # General Settings
    default_currency = models.CharField(max_length=3, default='USD')
    invoice_prefix = models.CharField(max_length=20, default='INV-')
    invoice_number_format = models.CharField(max_length=50, default='{prefix}{year}-{number:04d}')
    default_payment_terms = models.CharField(max_length=50, default='net_30', choices=[
        ('net_15', 'Net 15'),
        ('net_30', 'Net 30'),
        ('net_45', 'Net 45'),
        ('net_60', 'Net 60'),
        ('due_on_receipt', 'Due on Receipt'),
    ])
    default_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text='Default tax rate percentage')
    
    # Template Settings
    default_template = models.ForeignKey('InvoiceTemplate', on_delete=models.SET_NULL, null=True, blank=True, related_name='default_for_settings')
    
    # Compliance Settings
    enable_us_tax_compliance = models.BooleanField(default=False)
    enable_eu_vat_compliance = models.BooleanField(default=False)
    enable_digital_signatures = models.BooleanField(default=False)
    
    # Notification Settings
    enable_payment_reminders = models.BooleanField(default=True)
    enable_overdue_notifications = models.BooleanField(default=True)
    enable_compliance_alerts = models.BooleanField(default=True)
    compliance_alert_frequency = models.CharField(max_length=20, default='weekly', choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ])
    
    # Auto-numbering
    next_invoice_number = models.IntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoicing_settings'
        verbose_name = 'Invoicing Settings'
        verbose_name_plural = 'Invoicing Settings'
        unique_together = ['tenant', 'company']

    def __str__(self):
        return f"Invoicing Settings - {self.tenant.name}"
