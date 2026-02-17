from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the reporting app
router = DefaultRouter()

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Overview Stats
    path('overview-stats/', views.reports_overview_stats, name='reports_overview_stats'),
    
    # Reports
    path('reports/', views.ReportListView.as_view(), name='reports_list'),
    path('reports/<uuid:pk>/', views.ReportDetailView.as_view(), name='reports_detail'),
    path('reports/<uuid:pk>/generate/', views.generate_report, name='generate_report'),
    
    # Financial Reports
    path('financial/', views.financial_reports, name='financial_reports'),
    
    # Tax Reports
    path('tax/', views.TaxReportListView.as_view(), name='tax_reports_list'),
    path('tax/<uuid:pk>/', views.TaxReportDetailView.as_view(), name='tax_reports_detail'),
    
    # Compliance Reports
    path('compliance/', views.ComplianceReportListView.as_view(), name='compliance_reports_list'),
    path('compliance/<uuid:pk>/', views.ComplianceReportDetailView.as_view(), name='compliance_reports_detail'),
    
    # Custom Reports
    path('custom/', views.custom_reports, name='custom_reports'),
    
    # Scheduled Reports
    path('scheduled/', views.ScheduledReportListView.as_view(), name='scheduled_reports_list'),
    path('scheduled/<uuid:pk>/', views.ScheduledReportDetailView.as_view(), name='scheduled_reports_detail'),
    
    # Report Exports
    path('exports/', views.ReportExportListView.as_view(), name='report_exports_list'),
    path('exports/<uuid:pk>/', views.ReportExportDetailView.as_view(), name='report_exports_detail'),
    path('reports/<uuid:pk>/export/', views.export_report, name='export_report'),
    
    # Report Templates
    path('templates/', views.ReportTemplateListView.as_view(), name='report_templates_list'),
    path('templates/<uuid:pk>/', views.ReportTemplateDetailView.as_view(), name='report_templates_detail'),
    
    # Settings
    path('settings/', views.ReportingSettingsView.as_view(), name='reporting_settings'),
]

