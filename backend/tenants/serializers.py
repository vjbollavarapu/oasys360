from rest_framework import serializers
from .models import Tenant, Company, TenantInvitation
from authentication.serializers import UserSerializer


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model"""
    active_users_count = serializers.SerializerMethodField()
    companies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'plan', 'is_active', 'max_users', 
            'max_storage_gb', 'features', 'settings', 'active_users_count',
            'companies_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_active_users_count(self, obj):
        return obj.get_active_users_count()
    
    def get_companies_count(self, obj):
        return obj.companies.count()


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = Company
        fields = [
            'id', 'tenant', 'tenant_name', 'name', 'legal_name', 'tax_id',
            'registration_number', 'address', 'city', 'state', 'country',
            'postal_code', 'phone', 'email', 'website', 'currency', 'timezone',
            'fiscal_year_start', 'logo', 'is_primary', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantInvitationSerializer(serializers.ModelSerializer):
    """Serializer for Tenant Invitation"""
    invited_by = UserSerializer(read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = TenantInvitation
        fields = [
            'id', 'tenant', 'tenant_name', 'email', 'role', 'invited_by',
            'token', 'is_accepted', 'expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invited_by', 'token', 'is_accepted', 'expires_at', 'created_at', 'updated_at']


class TenantStatsSerializer(serializers.ModelSerializer):
    """Serializer for Tenant statistics"""
    active_users_count = serializers.SerializerMethodField()
    companies_count = serializers.SerializerMethodField()
    storage_used_gb = serializers.SerializerMethodField()
    storage_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'plan', 'max_users', 'max_storage_gb',
            'active_users_count', 'companies_count', 'storage_used_gb',
            'storage_percentage'
        ]
    
    def get_active_users_count(self, obj):
        return obj.get_active_users_count()
    
    def get_companies_count(self, obj):
        return obj.companies.count()
    
    def get_storage_used_gb(self, obj):
        # This would be calculated based on actual file storage
        # For now, return a placeholder
        return 2.5
    
    def get_storage_percentage(self, obj):
        used = self.get_storage_used_gb(obj)
        return (used / obj.max_storage_gb) * 100 if obj.max_storage_gb > 0 else 0
