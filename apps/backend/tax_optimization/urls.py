"""
Tax Optimization URL Configuration
"""
from django.urls import path
from . import views

app_name = 'tax_optimization'

urlpatterns = [
    # Tax Events
    path('events/', views.TaxEventListView.as_view(), name='tax_event_list'),
    path('events/<uuid:pk>/', views.TaxEventDetailView.as_view(), name='tax_event_detail'),
    path('events/detect/', views.detect_tax_events, name='detect_tax_events'),
    
    # Tax Optimization Strategies
    path('strategies/', views.TaxOptimizationStrategyListView.as_view(), name='strategy_list'),
    path('strategies/<uuid:pk>/', views.TaxOptimizationStrategyDetailView.as_view(), name='strategy_detail'),
    path('strategies/<uuid:pk>/approve/', views.approve_strategy, name='approve_strategy'),
    path('strategies/generate/', views.generate_strategies, name='generate_strategies'),
    
    # Tax Year Summary
    path('year-summaries/', views.TaxYearSummaryListView.as_view(), name='year_summary_list'),
    path('year-summaries/<uuid:pk>/', views.TaxYearSummaryDetailView.as_view(), name='year_summary_detail'),
    path('year-summaries/<int:tax_year>/calculate/', views.calculate_year_summary, name='calculate_year_summary'),
    
    # Tax Alerts
    path('alerts/', views.TaxAlertListView.as_view(), name='alert_list'),
    path('alerts/<uuid:pk>/read/', views.mark_alert_read, name='mark_alert_read'),
    path('alerts/<uuid:pk>/dismiss/', views.dismiss_alert, name='dismiss_alert'),
    path('alerts/generate/', views.generate_alerts, name='generate_alerts'),
    
    # Tax Settings
    path('settings/', views.TaxSettingsView.as_view(), name='tax_settings'),
    
    # Statistics
    path('stats/', views.tax_optimization_stats, name='tax_optimization_stats'),
]

