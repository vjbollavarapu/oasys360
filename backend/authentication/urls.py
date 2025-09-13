from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, LogoutView, RegisterView, UserProfileView, PasswordChangeView,
    PasswordResetView, PasswordResetConfirmView, TenantInvitationView,
    AcceptInvitationView, UserListView, UserDetailView, current_user, navigation_data
)
from .tokens import CustomTokenObtainPairView

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
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
