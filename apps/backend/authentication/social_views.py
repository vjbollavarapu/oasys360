"""
Social authentication and account conversion views
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta

from .models import User, SocialAccount, AccountConversion
from .serializers import UserSerializer
from .social_serializers import (
    SocialAccountSerializer, AccountConversionSerializer,
    EmailVerificationSerializer, ResendVerificationSerializer
)
from .utils import detect_user_type, is_corporate_email
from tenants.models import Tenant


class SocialAccountListView(APIView):
    """List social accounts linked to user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        social_accounts = SocialAccount.objects.filter(user=request.user)
        serializer = SocialAccountSerializer(social_accounts, many=True)
        return Response(serializer.data)


class AccountConversionView(APIView):
    """Convert trial account to corporate account"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = AccountConversionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            corporate_email = serializer.validated_data['corporate_email']
            password = serializer.validated_data.get('password')
            
            # Create conversion record
            conversion, created = AccountConversion.objects.get_or_create(
                user=user,
                defaults={
                    'from_account_type': user.account_type,
                    'to_account_type': 'corporate',
                    'corporate_email': corporate_email,
                    'conversion_reason': 'User requested upgrade',
                }
            )
            
            # Generate verification token
            verification_token = get_random_string(32)
            conversion.verification_token = verification_token
            conversion.verification_expires = timezone.now() + timedelta(days=7)
            conversion.save()
            
            # Send verification email to corporate email
            verification_url = f"{settings.FRONTEND_URL}/verify-corporate-email?token={verification_token}&email={corporate_email}"
            send_mail(
                'Verify Corporate Email for OASYS360',
                f'Please verify your corporate email by clicking this link: {verification_url}',
                settings.DEFAULT_FROM_EMAIL,
                [corporate_email],
                fail_silently=False,
            )
            
            # Set password if provided
            if password:
                user.set_password(password)
                user.save()
            
            return Response({
                'success': True,
                'message': 'Verification email sent to corporate email. Please check your inbox.',
                'conversion_id': str(conversion.id),
                'corporate_email': corporate_email
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyCorporateEmailView(APIView):
    """Verify corporate email and complete account conversion"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        email = request.data.get('email')
        
        if not token or not email:
            return Response({
                'success': False,
                'error': 'Token and email are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            conversion = AccountConversion.objects.get(
                verification_token=token,
                corporate_email=email,
                is_completed=False
            )
            
            # Check if token expired
            if conversion.verification_expires < timezone.now():
                return Response({
                    'success': False,
                    'error': 'Verification token has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = conversion.user
            
            # Update user account
            user.email = email
            user.account_type = 'corporate'
            user.account_tier = 'business'
            user.email_verified = True
            user.corporate_email_verified = True
            user.save()
            
            # Mark conversion as completed
            conversion.is_completed = True
            conversion.completed_at = timezone.now()
            conversion.save()
            
            # Generate new tokens
            refresh = RefreshToken.for_user(user)
            user_info = detect_user_type(user, user.tenant)
            
            return Response({
                'success': True,
                'message': 'Corporate email verified. Account upgraded to business tier.',
                'user': UserSerializer(user).data,
                'user_info': user_info,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            })
            
        except AccountConversion.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Invalid verification token or email'
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """Verify email address"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            
            try:
                user = User.objects.get(
                    email_verification_token=token,
                    email_verified=False
                )
                
                # Check if token expired
                if user.email_verification_expires and user.email_verification_expires < timezone.now():
                    return Response({
                        'success': False,
                        'error': 'Verification token has expired. Please request a new one.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Verify email
                user.email_verified = True
                user.email_verification_token = None
                user.email_verification_expires = None
                
                # Check if corporate email
                is_corporate, _ = is_corporate_email(user.email)
                if is_corporate:
                    user.corporate_email_verified = True
                    if user.account_tier == 'trial':
                        user.account_tier = 'business'
                
                user.save()
                
                return Response({
                    'success': True,
                    'message': 'Email verified successfully',
                    'user': UserSerializer(user).data
                })
                
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid verification token'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    """Resend email verification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            email = serializer.validated_data.get('email', user.email)
            
            # Generate new verification token
            user.email_verification_token = get_random_string(32)
            user.email_verification_expires = timezone.now() + timedelta(days=7)
            user.save()
            
            # Send verification email
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={user.email_verification_token}"
            send_mail(
                'Verify Your Email - OASYS360',
                f'Please verify your email by clicking this link: {verification_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                'success': True,
                'message': 'Verification email sent successfully'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AccountStatusView(APIView):
    """Get current account status and access level"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        user_info = detect_user_type(user, user.tenant)
        
        return Response({
            'account_type': user.account_type,
            'account_tier': user.account_tier,
            'email_verified': user.email_verified,
            'corporate_email_verified': user.corporate_email_verified,
            'user_info': user_info,
            'can_upgrade': user.account_tier == 'trial',
            'requires_verification': not user.email_verified and user.account_type == 'corporate'
        })

