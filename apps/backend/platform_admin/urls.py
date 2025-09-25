from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the platform_admin app
router = DefaultRouter()

# Register viewsets with the router
# router.register(r'admin-users', views.AdminUserViewSet)
# router.register(r'system-settings', views.SystemSettingsViewSet)

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Add any additional URL patterns here
    # path('dashboard/', views.PlatformDashboardView.as_view(), name='platform-dashboard'),
]

