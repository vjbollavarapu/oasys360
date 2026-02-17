"""
Tax Optimization Admin Configuration
"""
from django.contrib import admin
from .models import (
    TaxEvent, TaxOptimizationStrategy, TaxYearSummary,
    TaxAlert, TaxSettings
)


@admin.register(TaxEvent)
class TaxEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'amount', 'currency', 'tax_year', 'event_date', 'realized', 'offset_applied']
    list_filter = ['event_type', 'tax_year', 'realized', 'offset_applied', 'currency']
    search_fields = ['description', 'source_id']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'event_date'


@admin.register(TaxOptimizationStrategy)
class TaxOptimizationStrategyAdmin(admin.ModelAdmin):
    list_display = ['title', 'strategy_type', 'priority', 'status', 'tax_year', 'potential_savings', 'created_by']
    list_filter = ['strategy_type', 'priority', 'status', 'tax_year']
    search_fields = ['title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'approved_at']
    filter_horizontal = ['applicable_events']


@admin.register(TaxYearSummary)
class TaxYearSummaryAdmin(admin.ModelAdmin):
    list_display = ['tax_year', 'net_taxable_income', 'estimated_tax_liability', 'status', 'calculated_at']
    list_filter = ['tax_year', 'status', 'currency']
    search_fields = ['notes']
    readonly_fields = ['id', 'created_at', 'updated_at', 'calculated_at', 'finalized_at']


@admin.register(TaxAlert)
class TaxAlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'severity', 'tax_year', 'read', 'dismissed', 'deadline_date']
    list_filter = ['alert_type', 'severity', 'read', 'dismissed', 'tax_year']
    search_fields = ['title', 'message']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'deadline_date'


@admin.register(TaxSettings)
class TaxSettingsAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'tax_jurisdiction', 'tax_year_end', 'default_tax_rate', 'enable_auto_alerts']
    list_filter = ['tax_jurisdiction', 'enable_loss_harvesting', 'enable_auto_alerts']
    readonly_fields = ['id', 'created_at', 'updated_at']

