from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.text import slugify
from datetime import timedelta
import uuid
from .models import User, UserProfile, SocialAccount, AccountConversion
from tenants.models import Tenant, Company, TenantInvitation
from .utils import is_corporate_email, validate_corporate_email


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    account_tier_display = serializers.CharField(source='get_account_tier_display', read_only=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8, allow_blank=False)
    firstName = serializers.CharField(source='first_name', write_only=True, required=False)
    lastName = serializers.CharField(source='last_name', write_only=True, required=False)
    isActive = serializers.BooleanField(source='is_active', write_only=True, required=False, default=True)
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def validate(self, attrs):
        """Validate data for user creation/update"""
        # When creating (instance is None), password is required
        if self.instance is None:
            if 'password' not in attrs or not attrs.get('password'):
                raise serializers.ValidationError({'password': 'Password is required when creating a new user.'})
            # Validate password strength
            from django.contrib.auth.password_validation import validate_password
            try:
                validate_password(attrs['password'])
            except Exception as e:
                raise serializers.ValidationError({'password': list(e.messages) if hasattr(e, 'messages') else str(e)})
        
        # Email is required
        if 'email' not in attrs or not attrs.get('email'):
            raise serializers.ValidationError({'email': 'Email is required.'})
        
        return attrs
    
    def create(self, validated_data):
        """Create user with password"""
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'Password is required when creating a new user.'})
        
        # Handle firstName/lastName from frontend (camelCase -> snake_case)
        if 'firstName' in validated_data:
            validated_data['first_name'] = validated_data.pop('firstName')
        if 'lastName' in validated_data:
            validated_data['last_name'] = validated_data.pop('lastName')
        # Handle isActive from frontend
        if 'isActive' in validated_data:
            validated_data['is_active'] = validated_data.pop('isActive')
        
        # Remove extra fields that aren't in the User model (e.g., sendWelcomeEmail, tenantId)
        # Use a simple whitelist of known User model fields
        allowed_user_fields = {
            'username', 'email', 'first_name', 'last_name', 'role', 'is_active',
            'account_type', 'account_tier', 'email_verified', 'corporate_email_verified',
            'permissions', 'tenant', 'is_staff', 'is_superuser', 'date_joined'
        }
        # Filter to only include allowed fields
        filtered_data = {k: v for k, v in validated_data.items() if k in allowed_user_fields}
        
        # Ensure email is provided
        if 'email' not in filtered_data or not filtered_data.get('email'):
            raise serializers.ValidationError({'email': 'Email is required.'})
        
        # Set username to email if not provided (required by AbstractUser)
        if 'username' not in filtered_data or not filtered_data.get('username'):
            filtered_data['username'] = filtered_data.get('email', '')
        
        # Ensure role is set (default to staff if not provided)
        if 'role' not in filtered_data:
            filtered_data['role'] = 'staff'
        
        # Create user (tenant will be set in perform_create)
        user = User.objects.create_user(**filtered_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """Update user, handling password separately"""
        password = validated_data.pop('password', None)
        # Handle firstName/lastName from frontend (camelCase -> snake_case)
        if 'firstName' in validated_data:
            validated_data['first_name'] = validated_data.pop('firstName')
        if 'lastName' in validated_data:
            validated_data['last_name'] = validated_data.pop('lastName')
        # Handle isActive from frontend
        if 'isActive' in validated_data:
            validated_data['is_active'] = validated_data.pop('isActive')
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'firstName', 'lastName', 'password', 'isActive', 'role', 'role_display', 
            'account_type', 'account_type_display', 'account_tier', 'account_tier_display', 
            'email_verified', 'corporate_email_verified', 'is_active', 'last_login',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {
            'email': {'required': True},
        }
    
    def to_internal_value(self, data):
        """Override to ignore unknown fields like sendWelcomeEmail and tenantId"""
        # Get all known fields including write-only aliases
        known_fields = set(self.fields.keys()) | {'firstName', 'lastName', 'password', 'isActive'}
        # Filter out unknown fields before validation (ignore sendWelcomeEmail, tenantId, etc.)
        if isinstance(data, dict):
            filtered_data = {k: v for k, v in data.items() if k in known_fields}
            # Call parent to_internal_value with filtered data
            try:
                return super().to_internal_value(filtered_data)
            except serializers.ValidationError as e:
                # Log the error for debugging
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Serializer validation error: {e.detail}")
                logger.error(f"Filtered data: {filtered_data}")
                raise
        return super().to_internal_value(data)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'phone', 'timezone', 'language', 'two_factor_enabled',
            'web3_wallet_address', 'avatar', 'bio', 'date_of_birth', 'address',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            # Check email verification for corporate accounts
            if user.account_type == 'corporate' and not user.email_verified:
                # Return a structured error that frontend can handle
                # DRF will wrap this in non_field_errors
                error_dict = {
                    'email_verification_required': True,
                    'message': 'Please verify your email address before logging in. Check your inbox for the verification link.',
                    'email': user.email,
                }
                # Raise as a string that contains the structured data
                # Frontend will parse non_field_errors array
                raise serializers.ValidationError([error_dict])
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs


class CorporateRegisterSerializer(serializers.ModelSerializer):
    """Serializer for corporate email registration (primary method)"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    tenant_name = serializers.CharField(write_only=True, required=False)
    company_name = serializers.CharField(write_only=True, required=False)
    domain = serializers.CharField(write_only=True, required=False, max_length=255, help_text='Subdomain or custom domain')
    country_code = serializers.CharField(write_only=True, required=False, max_length=2)
    industry_code = serializers.CharField(write_only=True, required=False, max_length=50)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'role', 'tenant_name', 'company_name', 'domain', 'country_code', 'industry_code'
        ]
    
    def validate_email(self, value):
        """Validate corporate email"""
        is_valid, error_msg = validate_corporate_email(value, strict=True)
        if not is_valid:
            raise serializers.ValidationError(error_msg)
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        tenant_name = validated_data.pop('tenant_name', None)
        company_name = validated_data.pop('company_name', None)
        domain = validated_data.pop('domain', None)
        country_code = validated_data.pop('country_code', None)
        industry_code = validated_data.pop('industry_code', None)
        password_confirm = validated_data.pop('password_confirm', None)
        
        # Create tenant if provided (in INCOMPLETE state)
        tenant = None
        if tenant_name:
            from django.utils.text import slugify
            # Use provided domain or generate slug from tenant name
            if domain:
                slug = slugify(domain)[:63] or f"tenant-{uuid.uuid4().hex[:8]}"
                primary_domain = domain
            else:
                slug = slugify(tenant_name)[:63] or f"tenant-{uuid.uuid4().hex[:8]}"
                primary_domain = slug
            
            tenant = Tenant.objects.create(
                name=tenant_name,
                slug=slug,
                primary_domain=primary_domain,
                domain_status='active',  # Subdomain is immediately active
                plan='basic',
                max_users=10,
                max_storage_gb=10,
                features=['accounting', 'invoicing'],
                onboarding_status='INCOMPLETE',  # Start in incomplete state
                country_code=country_code or '',
                industry_code=industry_code or '',
            )
            
            # Create company if provided
            if company_name:
                Company.objects.create(
                    tenant=tenant,
                    name=company_name,
                    is_primary=True,
                    country=country_code or 'US'
                )
            
            # Load presets using PresetEngine (supports both country and industry)
            if country_code:
                try:
                    from tenants.preset_engine import PresetEngine
                    preset_engine = PresetEngine()
                    # Use PresetEngine which supports industry_code
                    preset_engine.provision_tenant_presets(
                        tenant=tenant,
                        country_code=country_code,
                        industry_code=industry_code,
                        user=self.context.get('user')
                    )
                except Exception as e:
                    # Log error but don't fail registration
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to load presets for {country_code}/{industry_code}: {e}")
        
        # Set account type and tier
        validated_data['tenant'] = tenant
        
        # If user created a tenant, they should be the tenant admin
        if tenant:
            validated_data['role'] = 'tenant_admin'
        else:
            # If no tenant created, use default role or provided role
            validated_data.setdefault('role', 'staff')
        
        validated_data['account_type'] = 'corporate'
        validated_data['account_tier'] = 'business'
        validated_data['email_verified'] = False  # Requires email verification
        
        # Generate email verification token
        user = User.objects.create_user(**validated_data)
        user.email_verification_token = get_random_string(32)
        user.email_verification_expires = timezone.now() + timedelta(days=7)
        user.save()
        
        return user


class SocialRegisterSerializer(serializers.Serializer):
    """Serializer for social authentication registration"""
    provider = serializers.ChoiceField(choices=['google', 'linkedin', 'microsoft'])
    access_token = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False)  # May come from provider
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    tenant_name = serializers.CharField(required=False)
    company_name = serializers.CharField(required=False)
    
    def validate(self, attrs):
        """Validate social authentication data"""
        provider = attrs.get('provider')
        access_token = attrs.get('access_token')
        
        # In production, verify the access token with the provider
        # For now, we'll accept it and store it
        
        return attrs
    
    def create(self, validated_data):
        """Create user from social authentication"""
        provider = validated_data['provider']
        access_token = validated_data['access_token']
        email = validated_data.get('email')
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        tenant_name = validated_data.get('tenant_name')
        company_name = validated_data.get('company_name')
        
        # TODO: Verify access token with provider and get user info
        # For now, email is required
        if not email:
            raise serializers.ValidationError("Email is required for social registration")
        
        # Check if user already exists
        user = User.objects.filter(email=email).first()
        
        if not user:
            # Create new user with trial account
            username = email.split('@')[0] + '_' + provider
            
            # Create tenant if provided
            tenant = None
            if tenant_name:
                tenant = Tenant.objects.create(
                    name=tenant_name,
                    plan='basic',
                    max_users=10,
                    max_storage_gb=10,
                    features=['accounting', 'invoicing']
                )
                
                if company_name:
                    Company.objects.create(
                        tenant=tenant,
                        name=company_name,
                        is_primary=True
                    )
            
            # Check if email is corporate
            is_corporate, _ = is_corporate_email(email)
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                tenant=tenant,
                account_type='trial' if not is_corporate else 'corporate',
                account_tier='trial',
                email_verified=True,  # Social providers verify email
                corporate_email_verified=is_corporate,
            )
        
        # Create or update social account
        provider_account_id = validated_data.get('provider_account_id', email)  # Use email as ID for now
        
        social_account, created = SocialAccount.objects.update_or_create(
            provider=provider,
            provider_account_id=provider_account_id,
            defaults={
                'user': user,
                'email': email,
                'access_token': access_token,  # Should be encrypted in production
                'extra_data': {
                    'first_name': first_name,
                    'last_name': last_name,
                }
            }
        )
        
        return user


class RegisterSerializer(serializers.ModelSerializer):
    """Legacy serializer - redirects to CorporateRegisterSerializer"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    tenant_name = serializers.CharField(write_only=True, required=False)
    company_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'role', 'tenant_name', 'company_name'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        # Use CorporateRegisterSerializer logic
        serializer = CorporateRegisterSerializer(data=self.initial_data, context=self.context)
        serializer.is_valid(raise_exception=True)
        return serializer.create(serializer.validated_data)


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError('No active user found with this email address.')
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs


class TenantInvitationSerializer(serializers.ModelSerializer):
    """Serializer for tenant invitations"""
    invited_by = UserSerializer(read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = TenantInvitation
        fields = [
            'id', 'email', 'role', 'invited_by', 'tenant_name', 'is_accepted',
            'expires_at', 'created_at'
        ]
        read_only_fields = ['id', 'invited_by', 'is_accepted', 'expires_at', 'created_at']
