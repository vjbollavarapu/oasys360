"""
URL Configuration for Audit API
Provides REST API endpoints for audit trails and compliance reports.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .audit_api import (
    AuditLogViewSet,
    ComplianceReportView,
    UserActivityView,
    ResourceAuditTrailView,
    AuditViolationViewSet,
    AuditExportView,
    AuditManagementView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')
router.register(r'audit-violations', AuditViolationViewSet, basename='audit-violations')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Compliance and reporting
    path('compliance/report/', ComplianceReportView.as_view(), name='compliance-report'),
    path('compliance/export/', AuditExportView.as_view(), name='audit-export'),
    
    # User activity
    path('user-activity/', UserActivityView.as_view(), name='user-activity'),
    path('user-activity/<str:user_id>/', UserActivityView.as_view(), name='user-activity-detail'),
    
    # Resource audit trails
    path('resource/<str:resource_type>/<str:resource_id>/', ResourceAuditTrailView.as_view(), name='resource-audit-trail'),
    
    # Audit management
    path('management/', AuditManagementView.as_view(), name='audit-management'),
]

# Additional URL patterns for specific audit operations
audit_urlpatterns = [
    # Audit log operations
    path('audit-logs/', AuditLogViewSet.as_view({'get': 'list'}), name='audit-logs-list'),
    path('audit-logs/<uuid:pk>/', AuditLogViewSet.as_view({'get': 'retrieve'}), name='audit-logs-detail'),
    path('audit-logs/<uuid:pk>/details/', AuditLogViewSet.as_view({'get': 'details'}), name='audit-logs-details'),
    path('audit-logs/<uuid:pk>/related/', AuditLogViewSet.as_view({'get': 'related'}), name='audit-logs-related'),
    path('audit-logs/summary/', AuditLogViewSet.as_view({'get': 'summary'}), name='audit-logs-summary'),
    
    # Audit violation operations
    path('audit-violations/', AuditViolationViewSet.as_view({'get': 'list'}), name='audit-violations-list'),
    path('audit-violations/<uuid:pk>/', AuditViolationViewSet.as_view({'get': 'retrieve'}), name='audit-violations-detail'),
    path('audit-violations/<uuid:pk>/resolve/', AuditViolationViewSet.as_view({'post': 'resolve'}), name='audit-violations-resolve'),
    
    # Compliance operations
    path('compliance/report/', ComplianceReportView.as_view(), name='compliance-report'),
    path('compliance/export/', AuditExportView.as_view(), name='audit-export'),
    
    # User activity operations
    path('user-activity/', UserActivityView.as_view(), name='user-activity'),
    path('user-activity/<str:user_id>/', UserActivityView.as_view(), name='user-activity-detail'),
    
    # Resource audit trail operations
    path('resource/<str:resource_type>/<str:resource_id>/', ResourceAuditTrailView.as_view(), name='resource-audit-trail'),
    
    # Audit management operations
    path('management/', AuditManagementView.as_view(), name='audit-management'),
]

# Export URL patterns for external use
audit_api_urls = [
    path('audit/', include(urlpatterns)),
]
