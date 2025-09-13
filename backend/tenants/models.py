from django.db import models
import uuid
from django_tenants.models import TenantMixin, DomainMixin


class Tenant(TenantMixin):
    """
    Tenant model for multi-tenancy architecture
    Each tenant represents a separate organization using the platform
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schema_name = models.CharField(max_length=63, unique=True, db_index=True)
    name = models.CharField(max_length=255)
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenants'
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'

    def __str__(self):
        return f"{self.name} ({self.plan})"

    def get_active_users_count(self):
        """Get count of active users for this tenant"""
        return self.user_set.filter(is_active=True).count()

    def can_add_user(self):
        """Check if tenant can add more users based on plan limits"""
        return self.get_active_users_count() < self.max_users


class Domain(DomainMixin):
    """
    Domain model for tenant domains
    """
    
    class Meta:
        db_table = 'domains'
        verbose_name = 'Domain'
        verbose_name_plural = 'Domains'
    
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
    invited_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
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
