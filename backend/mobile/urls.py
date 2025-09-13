from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the mobile app
router = DefaultRouter()

# Register viewsets with the router
# router.register(r'devices', views.DeviceViewSet)
# router.register(r'notifications', views.NotificationViewSet)

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Add any additional URL patterns here
    # path('sync/', views.MobileSyncView.as_view(), name='mobile-sync'),
]

