
# Import tenant creation view - using a simpler approach
# from raynai.tenant_management.api_views import CreateTenantAPIView

# Import for tenant creation
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from tenants.models import Tenant, Domain
from django.contrib.auth.models import User

# Import WebSocket views
# import websocket.views

# Import static files serving for development
from django.conf import settings
from django.conf.urls.static import static

# Simple dashboard view for testing
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# 1. Import your ViewSets that handle the logic for tenants, domains, etc.
#    (The exact names and file location might differ in your project)
# from tenants.views import (
#     TenantViewSet,
#     DomainViewSet,
#     TenantSettingsViewSet,
#     TenantUsageViewSet,
# )

# Import health check views
from backend.views.health_views import MultiTenantHealthView, SimpleHealthView

# Import public navigation
# from backend.public_navigation import PublicNavigationAPIView

router = DefaultRouter()

# 3. Define the list of API patterns that Swagger should document.
#    This is the crucial step for separating public vs. tenant docs.
public_api_patterns = [
    # path('tenant/', include('tenant.urls')),
    # path('user/', include('user.urls')),
    # path('navigation/', PublicNavigationAPIView.as_view(), name='public-navigation'),
    path('marketing/', include('marketing_forms.urls')),
]

urlpatterns = [
    # Your project's admin interface
    path('admin/', admin.site.urls),

    # Health check endpoints
    path('health/', SimpleHealthView.as_view(), name='simple-health'),
    path('api/health/', MultiTenantHealthView.as_view(), name='multi-tenant-health'),

    # Your actual API endpoints
    path('api/v1/', include(public_api_patterns)),

    # WebSocket endpoints (documentation only - actual WebSocket connections use ws:// protocol)
    # path('api/v1/websocket/', lambda request: JsonResponse({
    #     'message': 'WebSocket endpoints are available at ws://domain/ws/',
    #     'endpoints': {
    #         'general': 'ws://domain/ws/',
    #         'notifications': 'ws://domain/ws/notifications/',
    #         'studies': 'ws://domain/ws/studies/',
    #         'chat': 'ws://domain/ws/chat/',
    #         'system_health': 'ws://domain/ws/system-health/',
    #         'patients': 'ws://domain/ws/patients/',
    #         'reports': 'ws://domain/ws/reports/'
    #    }
    # }), name='websocket-info'),

    # WebSocket API endpoints for testing
    # path('api/v1/websocket/test/', websocket.views.WebSocketTestView.as_view(), name='websocket-test'),
    # path('api/v1/websocket/notifications/', websocket.views.WebSocketNotificationView.as_view(), name='websocket-notifications'),
    # path('api/v1/websocket/status/', websocket.views.websocket_status, name='websocket-status'),
    
    
    # PUBLIC OpenAPI/Swagger Documentation
    # This schema view is configured to scan both public_api_patterns and additional endpoints.
    path('api/schema/', SpectacularAPIView.as_view(
        patterns=[
            path('api/v1/', include(public_api_patterns)),
        ],
    ), name='public-schema'),

    # UI views that consume the schema defined above.
    path('api/docs/', SpectacularSwaggerView.as_view(
        url_name='public-schema'
    ), name='public-swagger-ui'),

    path('api/redoc/', SpectacularRedocView.as_view(
        url_name='public-schema'
    ), name='public-redoc'),
]

# Add static files serving for development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)