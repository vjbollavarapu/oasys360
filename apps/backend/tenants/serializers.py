"""
Serializers for tenants app
"""
from rest_framework import serializers
from .models import Tenant, TenantOnboardingProgress, TenantPreset, Company, TenantInvitation


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model"""
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'plan', 'is_active', 'max_users', 'max_storage_gb',
            'features', 'settings', 'onboarding_status', 'onboarded_at',
            'industry_code', 'country_code', 'currency_code', 'timezone',
            'primary_domain', 'domain_status', 'subscription_id', 'plan_code',
            'billing_cycle', 'trial_expiry', 'supports_tax', 'supports_einvoice',
            'supports_inventory', 'supports_multi_branch', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantStatsSerializer(serializers.ModelSerializer):
    """Serializer for tenant statistics"""
    active_users_count = serializers.SerializerMethodField()
    can_add_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'plan', 'is_active', 'max_users', 'max_storage_gb',
            'onboarding_status', 'active_users_count', 'can_add_user',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_active_users_count(self, obj):
        """Get count of active users"""
        return obj.get_active_users_count()
    
    def get_can_add_user(self, obj):
        """Check if tenant can add more users"""
        return obj.can_add_user()


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    class Meta:
        model = Company
        fields = [
            'id', 'tenant', 'name', 'legal_name', 'tax_id', 'registration_number',
            'address', 'city', 'state', 'country', 'postal_code', 'phone', 'email',
            'website', 'currency', 'timezone', 'fiscal_year_start', 'logo',
            'is_primary', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantInvitationSerializer(serializers.ModelSerializer):
    """Serializer for TenantInvitation model"""
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = TenantInvitation
        fields = [
            'id', 'tenant', 'email', 'role', 'token', 'is_accepted', 'expires_at',
            'is_expired', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'token', 'created_at', 'updated_at']
    
    def get_is_expired(self, obj):
        """Check if invitation has expired"""
        return obj.is_expired()


class TenantOnboardingSerializer(serializers.ModelSerializer):
    """Serializer for tenant onboarding data"""
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'onboarding_status', 'onboarded_at',
            'industry_code', 'country_code', 'currency_code', 'timezone',
            'primary_domain', 'domain_status',
            'plan', 'plan_code', 'billing_cycle', 'trial_expiry',
            'supports_tax', 'supports_einvoice', 'supports_inventory', 'supports_multi_branch',
        ]
        read_only_fields = ['id', 'onboarding_status', 'onboarded_at']


class TenantOnboardingProgressSerializer(serializers.ModelSerializer):
    """Serializer for onboarding progress"""
    class Meta:
        model = TenantOnboardingProgress
        fields = [
            'id', 'tenant', 'current_step', 'completed_steps', 'step_data',
            'preset_progress', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
