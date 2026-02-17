"""
URL configuration for backend project with row-based multi-tenancy.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from rest_framework.permissions import AllowAny
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from backend.swagger_views import JSONSpectacularAPIView

# Import health check views
from backend.views.health_views import MultiTenantHealthView, SimpleHealthView

# Import performance views
from backend.performance_views import (
    performance_metrics, cache_status, clear_cache, 
    database_health, system_health
)

# All API patterns for row-based multi-tenancy
api_patterns = [
    # Authentication and tenant management
    path('auth/', include('authentication.urls')),
    path('tenants/', include('tenants.urls')),
    
    # Business applications
    path('accounting/', include('accounting.urls')),
    path('ai_processing/', include('ai_processing.urls')),
    path('banking/', include('banking.urls')),
    path('contact_sales/', include('contact_sales.urls')),
    path('documents/', include('documents.urls')),
    path('inventory/', include('inventory.urls')),
    path('invoicing/', include('invoicing.urls')),
    path('mobile/', include('mobile.urls')),
    path('platform_admin/', include('platform_admin.urls')),
    path('purchase/', include('purchase.urls')),
    path('reporting/', include('reporting.urls')),
    path('sales/', include('sales.urls')),
    path('tax_optimization/', include('tax_optimization.urls')),
    path('treasury/', include('treasury.urls')),
    path('fx_conversion/', include('fx_conversion.urls')),
    path('web3_integration/', include('web3_integration.urls')),
    
    # Marketing forms (public access)
    path('marketing/', include('marketing_forms.urls')),
]

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # Health check endpoints
    path('health/', SimpleHealthView.as_view(), name='simple-health'),
    path('api/health/', MultiTenantHealthView.as_view(), name='multi-tenant-health'),
    
    # Performance monitoring endpoints
    path('api/performance/metrics/', performance_metrics, name='performance-metrics'),
    path('api/performance/cache/status/', cache_status, name='cache-status'),
    path('api/performance/cache/clear/', clear_cache, name='clear-cache'),
    path('api/performance/database/health/', database_health, name='database-health'),
    path('api/performance/system/health/', system_health, name='system-health'),
    
    # API endpoints
    path('api/v1/', include(api_patterns)),
    
    # API Documentation
    # Schema endpoint must be defined first - AllowAny to bypass authentication
    path('api/schema/', SpectacularAPIView.as_view(
        patterns=[path('api/v1/', include(api_patterns))],
        permission_classes=[AllowAny],
        authentication_classes=[],
    ), name='schema'),
    # Swagger UI endpoints - AllowAny to bypass authentication
    path('swagger/', SpectacularSwaggerView.as_view(
        url_name='schema',
        permission_classes=[AllowAny],
        authentication_classes=[],
    ), name='swagger-ui'),
    path('api/docs/', SpectacularSwaggerView.as_view(
        url='api/schema.json',  # Use direct URL to JSON schema endpoint
        permission_classes=[AllowAny],
        authentication_classes=[],
    ), name='swagger-ui-alt'),
    # JSON schema endpoint for Swagger UI (always returns JSON)
    path('api/schema.json', JSONSpectacularAPIView.as_view(
        patterns=[path('api/v1/', include(api_patterns))],
    ), name='schema-json'),
    # ReDoc endpoints - AllowAny to bypass authentication
    path('redoc/', SpectacularRedocView.as_view(
        url_name='schema',
        permission_classes=[AllowAny],
        authentication_classes=[],
    ), name='redoc'),
    path('api/redoc/', SpectacularRedocView.as_view(
        url_name='schema',
        permission_classes=[AllowAny],
        authentication_classes=[],
    ), name='redoc-alt'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
