from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """
    Custom User model for OASYS Platform
    Extends Django's AbstractUser with additional fields for multi-tenancy and roles
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    email = models.EmailField(unique=True)  # Keep unique for USERNAME_FIELD requirement
    role = models.CharField(max_length=50, choices=[
        ('platform_admin', 'Platform Admin'),
        ('tenant_admin', 'Tenant Admin'),
        ('firm_admin', 'Firm Admin'),
        ('cfo', 'CFO'),
        ('accountant', 'Accountant'),
        ('staff', 'Staff'),
    ], default='staff')
    permissions = models.JSONField(default=list, blank=True)
    
    # Account type and verification fields
    account_type = models.CharField(max_length=20, choices=[
        ('corporate', 'Corporate/Business Account'),
        ('trial', 'Trial Account'),
        ('personal', 'Personal Account'),
    ], default='corporate', help_text='Type of account')
    email_verified = models.BooleanField(default=False, help_text='Email address verified')
    email_verification_token = models.CharField(max_length=255, null=True, blank=True)
    email_verification_expires = models.DateTimeField(null=True, blank=True)
    corporate_email_verified = models.BooleanField(default=False, help_text='Corporate email verified')
    account_tier = models.CharField(max_length=20, choices=[
        ('trial', 'Trial'),
        ('business', 'Business'),
        ('enterprise', 'Enterprise'),
    ], default='trial', help_text='Account access tier')
    
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    password_reset_token = models.CharField(max_length=255, null=True, blank=True)
    password_reset_expires = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Override username field to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'username'],
                name='uniq_tenant_user_username',
                condition=models.Q(tenant__isnull=False)
            ),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = '%s %s' % (self.first_name or '', self.last_name or '')
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or ''


class UserProfile(models.Model):
    """
    Extended user profile information
    """
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='user_profiles')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    two_factor_enabled = models.BooleanField(default=False)
    web3_wallet_address = models.CharField(max_length=255, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"Profile for {self.user.email}"


class SocialAccount(models.Model):
    """
    Social authentication account linked to user
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts')
    provider = models.CharField(max_length=50, choices=[
        ('google', 'Google'),
        ('linkedin', 'LinkedIn'),
        ('microsoft', 'Microsoft'),
        ('facebook', 'Facebook'),
        ('github', 'GitHub'),
    ])
    provider_account_id = models.CharField(max_length=255, help_text='User ID from provider')
    email = models.EmailField(help_text='Email from social provider')
    access_token = models.TextField(blank=True, help_text='OAuth access token (encrypted)')
    refresh_token = models.TextField(blank=True, help_text='OAuth refresh token (encrypted)')
    expires_at = models.DateTimeField(null=True, blank=True)
    extra_data = models.JSONField(default=dict, blank=True, help_text='Additional provider data')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'social_accounts'
        verbose_name = 'Social Account'
        verbose_name_plural = 'Social Accounts'
        unique_together = ['provider', 'provider_account_id']

    def __str__(self):
        return f"{self.provider} account for {self.user.email}"


class AccountConversion(models.Model):
    """
    Track conversion from trial/social account to corporate account
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account_conversion')
    from_account_type = models.CharField(max_length=20)
    to_account_type = models.CharField(max_length=20, default='corporate')
    conversion_reason = models.CharField(max_length=255, blank=True)
    corporate_email = models.EmailField(help_text='Corporate email to convert to')
    verification_token = models.CharField(max_length=255, null=True, blank=True)
    verification_expires = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'account_conversions'
        verbose_name = 'Account Conversion'
        verbose_name_plural = 'Account Conversions'

    def __str__(self):
        return f"Conversion for {self.user.email}: {self.from_account_type} -> {self.to_account_type}"
