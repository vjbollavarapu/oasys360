"""
Serializers for social authentication and account conversion
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, SocialAccount, AccountConversion
from .utils import is_corporate_email, validate_corporate_email


class SocialAccountSerializer(serializers.ModelSerializer):
    """Serializer for SocialAccount model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = SocialAccount
        fields = [
            'id', 'user', 'user_email', 'provider', 'provider_account_id',
            'email', 'expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AccountConversionSerializer(serializers.Serializer):
    """Serializer for converting trial account to corporate account"""
    corporate_email = serializers.EmailField(help_text='Corporate email to convert to')
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        help_text='Password for corporate account (required if no password set)'
    )
    password_confirm = serializers.CharField(write_only=True, required=False)
    
    def validate_corporate_email(self, value):
        """Validate corporate email"""
        is_valid, error_msg = validate_corporate_email(value, strict=True)
        if not is_valid:
            raise serializers.ValidationError(error_msg)
        return value
    
    def validate(self, attrs):
        corporate_email = attrs.get('corporate_email')
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        user = self.context['request'].user
        
        # Check if email is different from current
        if corporate_email.lower() == user.email.lower():
            raise serializers.ValidationError("Corporate email must be different from current email")
        
        # Check if email is already in use
        if User.objects.filter(email=corporate_email).exclude(id=user.id).exists():
            raise serializers.ValidationError("This email is already registered")
        
        # Validate password if provided
        if password:
            if password != password_confirm:
                raise serializers.ValidationError("Passwords don't match")
        elif not user.has_usable_password():
            # User has no password (social-only account), require password
            raise serializers.ValidationError("Password is required for corporate account")
        
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    token = serializers.CharField(help_text='Email verification token')


class ResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email"""
    email = serializers.EmailField(required=False, help_text='Email to verify (defaults to user email)')

