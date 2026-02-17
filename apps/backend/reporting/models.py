from django.db import models
import uuid


class Report(models.Model):
    """
    Report model for managing financial reports
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='reports')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='reports')
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=[
        ('balance_sheet', 'Balance Sheet'),
        ('income_statement', 'Income Statement'),
        ('cash_flow', 'Cash Flow Statement'),
        ('trial_balance', 'Trial Balance'),
        ('general_ledger', 'General Ledger'),
        ('accounts_receivable', 'Accounts Receivable'),
        ('accounts_payable', 'Accounts Payable'),
        ('inventory_report', 'Inventory Report'),
        ('sales_report', 'Sales Report'),
        ('purchase_report', 'Purchase Report'),
        ('custom', 'Custom Report'),
    ])
    description = models.TextField(blank=True)
    parameters = models.JSONField(default=dict, blank=True)  # Report parameters
    data = models.JSONField(null=True, blank=True)  # Report data
    file_path = models.CharField(max_length=500, blank=True)  # Generated file path
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ])
    generated_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reports'
        verbose_name = 'Report'
        verbose_name_plural = 'Reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.report_type})"


class ReportTemplate(models.Model):
    """
    Report Template model for managing report templates
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='report_templates')
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=[
        ('balance_sheet', 'Balance Sheet'),
        ('income_statement', 'Income Statement'),
        ('cash_flow', 'Cash Flow Statement'),
        ('trial_balance', 'Trial Balance'),
        ('general_ledger', 'General Ledger'),
        ('accounts_receivable', 'Accounts Receivable'),
        ('accounts_payable', 'Accounts Payable'),
        ('inventory_report', 'Inventory Report'),
        ('sales_report', 'Sales Report'),
        ('purchase_report', 'Purchase Report'),
        ('custom', 'Custom Report'),
    ])
    description = models.TextField(blank=True)
    template_data = models.JSONField(default=dict)  # Template configuration
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'report_templates'
        verbose_name = 'Report Template'
        verbose_name_plural = 'Report Templates'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one default template per report type per tenant
        if self.is_default:
            ReportTemplate.objects.filter(
                tenant=self.tenant,
                report_type=self.report_type,
                is_default=True
            ).exclude(id=self.id if self.id else None).update(is_default=False)
        super().save(*args, **kwargs)


class ScheduledReport(models.Model):
    """
    Scheduled Report model for managing automated report generation
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='scheduled_reports')
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=[
        ('balance_sheet', 'Balance Sheet'),
        ('income_statement', 'Income Statement'),
        ('cash_flow', 'Cash Flow Statement'),
        ('trial_balance', 'Trial Balance'),
        ('general_ledger', 'General Ledger'),
        ('accounts_receivable', 'Accounts Receivable'),
        ('accounts_payable', 'Accounts Payable'),
        ('inventory_report', 'Inventory Report'),
        ('sales_report', 'Sales Report'),
        ('purchase_report', 'Purchase Report'),
        ('custom', 'Custom Report'),
    ])
    frequency = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ])
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ], null=True, blank=True)
    day_of_month = models.IntegerField(null=True, blank=True)
    time = models.TimeField()
    recipients = models.JSONField(default=list)  # List of email addresses
    parameters = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'scheduled_reports'
        verbose_name = 'Scheduled Report'
        verbose_name_plural = 'Scheduled Reports'

    def __str__(self):
        return f"{self.name} ({self.frequency})"


class ReportExecution(models.Model):
    """
    Report Execution model for tracking report generation history
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='report_executions')
    scheduled_report = models.ForeignKey(ScheduledReport, on_delete=models.CASCADE, related_name='executions', null=True, blank=True)
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='executions', null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ])
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    execution_time = models.FloatField(null=True, blank=True)  # Time in seconds
    file_size = models.BigIntegerField(null=True, blank=True)  # File size in bytes

    class Meta:
        db_table = 'report_executions'
        verbose_name = 'Report Execution'
        verbose_name_plural = 'Report Executions'
        ordering = ['-started_at']

    def __str__(self):
        return f"Execution {self.id} - {self.status}"


class Dashboard(models.Model):
    """
    Dashboard model for managing user dashboards
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='dashboards')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='dashboards')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    layout = models.JSONField(default=dict)  # Dashboard layout configuration
    widgets = models.JSONField(default=list)  # List of widget configurations
    is_default = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dashboards'
        verbose_name = 'Dashboard'
        verbose_name_plural = 'Dashboards'

    def __str__(self):
        return f"{self.name} - {self.user.email}"

    def save(self, *args, **kwargs):
        # Ensure only one default dashboard per user
        if self.is_default:
            Dashboard.objects.filter(
                tenant=self.tenant,
                user=self.user,
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)


class Widget(models.Model):
    """
    Widget model for managing dashboard widgets
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='widgets')
    name = models.CharField(max_length=255)
    widget_type = models.CharField(max_length=50, choices=[
        ('chart', 'Chart'),
        ('table', 'Table'),
        ('metric', 'Metric'),
        ('gauge', 'Gauge'),
        ('pie_chart', 'Pie Chart'),
        ('bar_chart', 'Bar Chart'),
        ('line_chart', 'Line Chart'),
        ('area_chart', 'Area Chart'),
    ])
    data_source = models.CharField(max_length=100)  # Data source configuration
    configuration = models.JSONField(default=dict)  # Widget configuration
    refresh_interval = models.IntegerField(default=0)  # Refresh interval in seconds (0 = manual)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'widgets'
        verbose_name = 'Widget'
        verbose_name_plural = 'Widgets'

    def __str__(self):
        return f"{self.name} ({self.widget_type})"


class TaxReport(models.Model):
    """
    Tax Report model for managing tax-related reports
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='tax_reports')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='tax_reports')
    report_name = models.CharField(max_length=255)
    tax_period_start = models.DateField()
    tax_period_end = models.DateField()
    tax_type = models.CharField(max_length=50, choices=[
        ('income_tax', 'Income Tax'),
        ('sales_tax', 'Sales Tax'),
        ('vat', 'VAT'),
        ('gst', 'GST'),
        ('withholding_tax', 'Withholding Tax'),
        ('property_tax', 'Property Tax'),
        ('other', 'Other'),
    ])
    tax_jurisdiction = models.CharField(max_length=100, blank=True)
    total_taxable_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_tax_liability = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_tax_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    data = models.JSONField(default=dict, blank=True)
    file_path = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('filed', 'Filed'),
        ('failed', 'Failed'),
    ])
    generated_at = models.DateTimeField(null=True, blank=True)
    filed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tax_reports'
        verbose_name = 'Tax Report'
        verbose_name_plural = 'Tax Reports'
        ordering = ['-tax_period_end', '-created_at']

    def __str__(self):
        return f"{self.report_name} - {self.tax_period_start} to {self.tax_period_end}"


class ComplianceReport(models.Model):
    """
    Compliance Report model for managing compliance-related reports
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='compliance_reports')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='compliance_reports')
    report_name = models.CharField(max_length=255)
    compliance_type = models.CharField(max_length=50, choices=[
        ('audit_trail', 'Audit Trail'),
        ('user_activity', 'User Activity'),
        ('data_access', 'Data Access Log'),
        ('gdpr', 'GDPR Compliance'),
        ('sox', 'SOX Compliance'),
        ('pci_dss', 'PCI DSS'),
        ('hipaa', 'HIPAA'),
        ('other', 'Other'),
    ])
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)
    file_path = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('reviewed', 'Reviewed'),
        ('failed', 'Failed'),
    ])
    generated_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_compliance_reports')
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'compliance_reports'
        verbose_name = 'Compliance Report'
        verbose_name_plural = 'Compliance Reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.report_name} ({self.get_compliance_type_display()})"


class ReportExport(models.Model):
    """
    Report Export model for managing report exports
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='report_exports')
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='exports', null=True, blank=True)
    tax_report = models.ForeignKey(TaxReport, on_delete=models.CASCADE, related_name='exports', null=True, blank=True)
    compliance_report = models.ForeignKey(ComplianceReport, on_delete=models.CASCADE, related_name='exports', null=True, blank=True)
    export_format = models.CharField(max_length=20, choices=[
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('xml', 'XML'),
    ])
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ])
    error_message = models.TextField(blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'report_exports'
        verbose_name = 'Report Export'
        verbose_name_plural = 'Report Exports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Export {self.export_format} - {self.created_at}"


class ReportingSettings(models.Model):
    """
    Reporting Settings model for tenant/company-specific reporting configurations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='reporting_settings')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='reporting_settings', null=True, blank=True)
    
    # Default Settings
    default_currency = models.CharField(max_length=3, default='USD')
    default_date_format = models.CharField(max_length=20, default='YYYY-MM-DD')
    default_export_format = models.CharField(max_length=20, default='pdf', choices=[
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
    ])
    
    # Report Generation Settings
    auto_generate_reports = models.BooleanField(default=False)
    report_retention_days = models.IntegerField(default=365)
    enable_report_caching = models.BooleanField(default=True)
    cache_expiry_hours = models.IntegerField(default=24)
    
    # Email Settings
    enable_email_notifications = models.BooleanField(default=True)
    default_recipients = models.JSONField(default=list, blank=True)
    
    # Export Settings
    max_export_file_size_mb = models.IntegerField(default=100)
    allowed_export_formats = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reporting_settings'
        verbose_name = 'Reporting Settings'
        verbose_name_plural = 'Reporting Settings'
        unique_together = ['tenant', 'company']

    def __str__(self):
        return f"Reporting Settings - {self.tenant.name}"
