from django.db import models
import uuid


class Tenant(models.Model):
    """
    Tenant model for row-based multi-tenancy architecture
    Each tenant represents a separate organization using the platform
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=63, unique=True, db_index=True)
    plan = models.CharField(max_length=50, default='basic', choices=[
        ('basic', 'Basic'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ])
    is_active = models.BooleanField(default=True)
    max_users = models.IntegerField(default=10)
    max_storage_gb = models.IntegerField(default=10)
    features = models.JSONField(default=list, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    
    # Onboarding fields
    onboarding_status = models.CharField(max_length=20, choices=[
        ('INCOMPLETE', 'Incomplete'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ], default='INCOMPLETE', db_index=True, help_text='Onboarding completion status')
    onboarded_at = models.DateTimeField(null=True, blank=True, help_text='Timestamp when onboarding was completed')
    
    # Company/Industry information
    industry_code = models.CharField(max_length=50, blank=True, db_index=True, help_text='Industry classification code')
    country_code = models.CharField(max_length=2, blank=True, db_index=True, help_text='ISO 3166-1 alpha-2 country code')
    currency_code = models.CharField(max_length=3, default='USD', help_text='ISO 4217 currency code')
    timezone = models.CharField(max_length=50, default='UTC', help_text='IANA timezone identifier')
    
    # Domain configuration
    primary_domain = models.CharField(max_length=255, blank=True, help_text='Primary custom domain or subdomain')
    domain_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('active', 'Active'),
    ], default='pending', help_text='Domain verification status')
    
    # Subscription information
    subscription_id = models.CharField(max_length=255, blank=True, help_text='External subscription ID')
    plan_code = models.CharField(max_length=50, blank=True, help_text='Subscription plan code')
    trial_expiry = models.DateTimeField(null=True, blank=True, help_text='Trial expiration date')
    billing_cycle = models.CharField(max_length=20, choices=[
        ('trial', 'Trial'),
        ('monthly', 'Monthly'),
        ('annual', 'Annual'),
    ], default='trial', help_text='Billing cycle')
    
    # System flags (auto-set by preset engine)
    supports_tax = models.BooleanField(default=False, help_text='Tax compliance enabled')
    supports_einvoice = models.BooleanField(default=False, help_text='E-invoicing enabled')
    supports_inventory = models.BooleanField(default=False, help_text='Inventory management enabled')
    supports_multi_branch = models.BooleanField(default=False, help_text='Multi-branch support enabled')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenants'
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'
        indexes = [
            models.Index(fields=['slug'], name='tenants_slug_idx'),
            models.Index(fields=['is_active'], name='tenants_active_idx'),
            models.Index(fields=['onboarding_status'], name='tenants_onboarding_status_idx'),
            models.Index(fields=['country_code', 'industry_code'], name='tenants_country_industry_idx'),
        ]

    def __str__(self):
        return f"{self.name} ({self.plan})"

    def get_active_users_count(self):
        """Get count of active users for this tenant"""
        # Use 'users' as related_name is set to 'users' in User model
        return self.users.filter(is_active=True).count()

    def can_add_user(self):
        """Check if tenant can add more users based on plan limits"""
        return self.get_active_users_count() < self.max_users
    
    def is_onboarding_complete(self):
        """Check if onboarding is completed"""
        return self.onboarding_status == 'COMPLETED'
    
    def can_access_dashboard(self):
        """Check if tenant can access dashboard (requires completed onboarding)"""
        return self.is_onboarding_complete() and self.is_active


class Domain(models.Model):
    """
    Domain model for tenant domains in row-based multi-tenancy
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='domains')
    domain = models.CharField(max_length=255, unique=True, db_index=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'domains'
        verbose_name = 'Domain'
        verbose_name_plural = 'Domains'
        indexes = [
            models.Index(fields=['domain'], name='domains_domain_idx'),
            models.Index(fields=['tenant', 'is_primary'], name='domains_tenant_primary_idx'),
        ]
    
    def __str__(self):
        return self.domain


class Company(models.Model):
    """
    Company model representing business entities within a tenant
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='companies')
    name = models.CharField(max_length=255)
    legal_name = models.CharField(max_length=255, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='US')
    postal_code = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    currency = models.CharField(max_length=3, default='USD')
    timezone = models.CharField(max_length=50, default='UTC')
    fiscal_year_start = models.DateField(null=True, blank=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        unique_together = ['tenant', 'name']

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"

    def save(self, *args, **kwargs):
        # Ensure only one primary company per tenant
        if self.is_primary:
            Company.objects.filter(tenant=self.tenant, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class TenantInvitation(models.Model):
    """
    Model for managing tenant invitations
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    role = models.CharField(max_length=50, choices=[
        ('tenant_admin', 'Tenant Admin'),
        ('firm_admin', 'Firm Admin'),
        ('cfo', 'CFO'),
        ('accountant', 'Accountant'),
        ('staff', 'Staff'),
    ])
    # invited_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, null=True, blank=True)  # Temporarily commented out to avoid circular dependency
    token = models.CharField(max_length=255, unique=True)
    is_accepted = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenant_invitations'
        verbose_name = 'Tenant Invitation'
        verbose_name_plural = 'Tenant Invitations'

    def __str__(self):
        return f"Invitation for {self.email} to {self.tenant.name}"

    def is_expired(self):
        """Check if invitation has expired"""
        from django.utils import timezone
        return timezone.now() > self.expires_at


class TenantOnboardingProgress(models.Model):
    """
    Track onboarding progress for each tenant
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='onboarding_progress')
    current_step = models.IntegerField(default=1, help_text='Current step number (1-5)')
    completed_steps = models.JSONField(default=list, blank=True, help_text='List of completed step numbers')
    step_data = models.JSONField(default=dict, blank=True, help_text='Data collected in each step')
    # Preset module completion tracking
    preset_progress = models.JSONField(
        default=dict, 
        blank=True, 
        help_text='Preset module completion status with record counts and percentages'
    )
    # Example structure:
    # {
    #   'chart_of_accounts': {'status': 'completed', 'records_created': 45, 'percentage': 100, 'total_expected': 45},
    #   'tax_rates': {'status': 'completed', 'records_created': 3, 'percentage': 100, 'total_expected': 3},
    #   'tax_categories': {'status': 'in_progress', 'records_created': 1, 'percentage': 50, 'total_expected': 2},
    # }
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenant_onboarding_progress'
        verbose_name = 'Tenant Onboarding Progress'
        verbose_name_plural = 'Tenant Onboarding Progresses'

    def __str__(self):
        return f"Onboarding progress for {self.tenant.name} - Step {self.current_step}"

    def complete_step(self, step_number: int, step_data: dict = None):
        """Mark a step as completed"""
        if step_number not in self.completed_steps:
            self.completed_steps.append(step_number)
        if step_data:
            self.step_data[str(step_number)] = step_data
        if step_number >= self.current_step:
            self.current_step = step_number + 1
        self.save()

    def is_step_completed(self, step_number: int) -> bool:
        """Check if a step is completed"""
        return step_number in self.completed_steps

    def get_step_data(self, step_number: int) -> dict:
        """Get data for a specific step"""
        return self.step_data.get(str(step_number), {})
    
    def update_preset_progress(self, preset_type: str, status: str, records_created: int, total_expected: int = None):
        """Update progress for a specific preset module"""
        from django.utils import timezone
        if not self.preset_progress:
            self.preset_progress = {}
        
        percentage = 100 if status == 'completed' else int((records_created / total_expected * 100)) if total_expected else 0
        
        self.preset_progress[preset_type] = {
            'status': status,  # 'pending', 'in_progress', 'completed', 'failed'
            'records_created': records_created,
            'total_expected': total_expected or records_created,
            'percentage': min(percentage, 100),
            'updated_at': timezone.now().isoformat(),
        }
        self.save(update_fields=['preset_progress', 'updated_at'])
    
    def get_preset_progress(self, preset_type: str = None) -> dict:
        """Get preset progress for a specific module or all modules"""
        if preset_type:
            return self.preset_progress.get(preset_type, {})
        return self.preset_progress or {}
    
    def get_overall_preset_percentage(self) -> float:
        """Get overall preset completion percentage"""
        if not self.preset_progress:
            return 0.0
        
        total_percentage = sum(module.get('percentage', 0) for module in self.preset_progress.values())
        module_count = len(self.preset_progress)
        
        return total_percentage / module_count if module_count > 0 else 0.0


class TenantPreset(models.Model):
    """
    Store auto-provisioned presets for tenants
    """
    PRESET_TYPES = [
        ('chart_of_accounts', 'Chart of Accounts'),
        ('tax_rates', 'Tax Rates'),
        ('currency', 'Currency'),
        ('invoice_numbering', 'Invoice Numbering'),
        ('einvoice_config', 'E-Invoice Configuration'),
        ('country_settings', 'Country Settings'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='presets')
    preset_type = models.CharField(max_length=50, choices=PRESET_TYPES)
    payload = models.JSONField(default=dict, help_text='Preset data (JSON)')
    source_country = models.CharField(max_length=2, blank=True, help_text='Country code this preset is for')
    source_industry = models.CharField(max_length=50, blank=True, help_text='Industry code this preset is for')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenant_presets'
        verbose_name = 'Tenant Preset'
        verbose_name_plural = 'Tenant Presets'
        unique_together = ['tenant', 'preset_type']
        indexes = [
            models.Index(fields=['tenant', 'preset_type'], name='tenant_presets_tenant_type_idx'),
        ]

    def __str__(self):
        return f"{self.get_preset_type_display()} for {self.tenant.name}"
