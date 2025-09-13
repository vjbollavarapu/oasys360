from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import User, UserProfile
from .serializers import (
    UserSerializer, UserProfileSerializer, LoginSerializer, RegisterSerializer,
    PasswordChangeSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer,
    TenantInvitationSerializer
)
from tenants.models import Tenant, TenantInvitation
from .utils import detect_user_type, assign_user_to_group
from .navigation import TenantNavigation


@extend_schema(
    summary="User Login",
    description="Authenticate user and return navigation data",
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(description="Login successful with navigation data"),
        400: OpenApiResponse(description="Invalid credentials")
    }
)
class LoginView(APIView):
    """User login view following multi-tenant guide pattern"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Get tenant information
            tenant = getattr(user, 'tenant', None)
            
            # Get domain from request
            domain = request.get_host()
            
            # Get navigation data following guide pattern
            nav = TenantNavigation(user, tenant)
            navigation_data = nav.get_user_navigation_data(domain)
            
            # Detect user type
            user_info = detect_user_type(user, tenant)
            
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'tenant': {
                    'id': str(tenant.id) if tenant else None,
                    'name': tenant.name if tenant else None,
                    'domain': domain
                } if tenant else None,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'navigation': navigation_data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User logout view"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Successfully logged out'})


class RegisterView(APIView):
    """User registration view"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    
    def get(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """Password change view"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetView(APIView):
    """Password reset request view"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate reset token
            token = get_random_string(64)
            user.password_reset_token = token
            user.password_reset_expires = timezone.now() + timezone.timedelta(hours=24)
            user.save()
            
            # Send email (in production, use proper email templates)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_mail(
                'Password Reset Request',
                f'Click the following link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({'message': 'Password reset email sent'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Password reset confirmation view"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(
                    password_reset_token=token,
                    password_reset_expires__gt=timezone.now()
                )
                user.set_password(new_password)
                user.password_reset_token = None
                user.password_reset_expires = None
                user.save()
                return Response({'message': 'Password reset successfully'})
            except User.DoesNotExist:
                return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TenantInvitationView(generics.CreateAPIView):
    """Tenant invitation view"""
    serializer_class = TenantInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        invitation = serializer.save(
            invited_by=self.request.user,
            token=get_random_string(64),
            expires_at=timezone.now() + timezone.timedelta(days=7)
        )
        
        # Send invitation email
        invite_url = f"{settings.FRONTEND_URL}/accept-invitation?token={invitation.token}"
        send_mail(
            f'Invitation to join {invitation.tenant.name}',
            f'You have been invited to join {invitation.tenant.name} as {invitation.get_role_display()}. Click here to accept: {invite_url}',
            settings.DEFAULT_FROM_EMAIL,
            [invitation.email],
            fail_silently=False,
        )


class AcceptInvitationView(APIView):
    """Accept tenant invitation view"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invitation = TenantInvitation.objects.get(
                token=token,
                is_accepted=False,
                expires_at__gt=timezone.now()
            )
            
            # Create user account
            user_data = request.data.copy()
            user_data['tenant'] = invitation.tenant
            user_data['role'] = invitation.role
            
            serializer = RegisterSerializer(data=user_data)
            if serializer.is_valid():
                user = serializer.save()
                invitation.is_accepted = True
                invitation.save()
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                    'message': 'Invitation accepted successfully'
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except TenantInvitation.DoesNotExist:
            return Response({'error': 'Invalid or expired invitation'}, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """List users for tenant admin"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(tenant=self.request.user.tenant)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """User detail view for tenant admin"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(tenant=self.request.user.tenant)
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


@extend_schema(
    summary="Get Navigation Data",
    description="Get navigation menu based on user type and role",
    responses={
        200: OpenApiResponse(description="Navigation data retrieved successfully"),
        401: OpenApiResponse(description="Authentication required")
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def navigation_data(request):
    """Get navigation data following multi-tenant guide pattern"""
    try:
        # Get tenant information
        tenant = getattr(request.user, 'tenant', None)
        
        # Get domain from request
        domain = request.get_host()
        
        # Get navigation data
        nav = TenantNavigation(request.user, tenant)
        navigation_data = nav.get_user_navigation_data(domain)
        
        return Response(navigation_data)
    except Exception as e:
        return Response(
            {'error': f'Error getting navigation: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """Get current user information"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
