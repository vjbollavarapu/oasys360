# myproject/tenant_urls.py

from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.urls import get_resolver

# Import health check views
from backend.views.health_views import MultiTenantHealthView, SimpleHealthView
from backend.performance_views import (
    performance_metrics, cache_status, clear_cache, 
    database_health, system_health
)

# Navigation is now handled by tenant app

# This list includes all the URL configurations from your individual apps.
# This provides a complete map of your entire tenant-facing API.
tenant_api_patterns = [
    path('tenant/', include('tenants.urls')),
    path('accounting/', include('accounting.urls')),
    path('ai_processing/', include('ai_processing.urls')),
    path('authentication/', include('authentication.urls')),
    path('banking/', include('banking.urls')),
    path('contact_sales/', include('contact_sales.urls')),
    path('inventory/', include('inventory.urls')),
    path('invoicing/', include('invoicing.urls')),
    path('mobile/', include('mobile.urls')),
    path('platform_admin/', include('platform_admin.urls')),
    path('purchase/', include('purchase.urls')),
    path('reporting/', include('reporting.urls')),
    path('sales/', include('sales.urls')),
    path('web3_integration/', include('web3_integration.urls')),
]

# Define the final URL patterns for the tenant schema.
urlpatterns = [
    # Health check endpoints
    path('health/', SimpleHealthView.as_view(), name='simple-health'),
    path('api/health/', MultiTenantHealthView.as_view(), name='tenant-health'),
    
    # Performance monitoring endpoints
    path('api/performance/metrics/', performance_metrics, name='performance-metrics'),
    path('api/performance/cache/status/', cache_status, name='cache-status'),
    path('api/performance/cache/clear/', clear_cache, name='clear-cache'),
    path('api/performance/database/health/', database_health, name='database-health'),
    path('api/performance/system/health/', system_health, name='system-health'),

    # Navigation endpoint is now handled by tenant app at /api/v1/tenant/navigation/

    # Wire up the actual API endpoints
    path('api/v1/', include(tenant_api_patterns)),

    # TENANT OpenAPI/Swagger Documentation
    # This schema view is configured to ONLY scan the tenant_api_patterns list.
    path('api/schema/', SpectacularAPIView.as_view(
        patterns=[path('api/v1/', include(tenant_api_patterns))],
    ), name='tenant-schema'),

    # UI views that consume the schema defined above.
    path('api/docs/', SpectacularSwaggerView.as_view(
        url_name='tenant-schema'
    ), name='tenant-swagger-ui'),

    path('api/redoc/', SpectacularRedocView.as_view(
        url_name='tenant-schema'
    ), name='tenant-redoc'),
]