from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView
from .views import (
    LoginView, LogoutView, RegisterView, SocialRegisterView, UserProfileView, PasswordChangeView,
    PasswordResetView, PasswordResetConfirmView, TenantInvitationView,
    AcceptInvitationView, UserListView, UserDetailView, current_user, navigation_data
)
from .social_views import (
    SocialAccountListView, AccountConversionView, VerifyCorporateEmailView,
    EmailVerificationView, ResendVerificationView, AccountStatusView
)
from .tokens import CustomTokenObtainPairView, CustomTokenRefreshView

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),  # Corporate email sign-up
    path('register/social/', SocialRegisterView.as_view(), name='social_register'),  # Social sign-up
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    # Social authentication and account management
    path('social-accounts/', SocialAccountListView.as_view(), name='social_accounts'),
    path('account/convert/', AccountConversionView.as_view(), name='account_convert'),
    path('account/verify-corporate-email/', VerifyCorporateEmailView.as_view(), name='verify_corporate_email'),
    path('account/verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    path('account/resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    path('account/status/', AccountStatusView.as_view(), name='account_status'),
    
    # User profile and management
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('current-user/', current_user, name='current_user'),
    
    # Navigation endpoint (following multi-tenant guide)
    path('navigation/', navigation_data, name='navigation_data'),
    
    # Password reset
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Tenant invitations
    path('invitations/', TenantInvitationView.as_view(), name='tenant_invitation'),
    path('invitations/accept/', AcceptInvitationView.as_view(), name='accept_invitation'),
    
    # User management (for tenant admins)
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user_detail'),
]
