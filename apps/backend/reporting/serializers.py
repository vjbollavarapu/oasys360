from rest_framework import serializers
from decimal import Decimal
from .models import (
    Report, ReportTemplate, ScheduledReport, ReportExecution,
    Dashboard, Widget, TaxReport, ComplianceReport, ReportExport, ReportingSettings
)


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report"""
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'tenant', 'company', 'name', 'report_type', 'report_type_display',
            'description', 'parameters', 'data', 'file_path', 'status', 'status_display',
            'generated_at', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'generated_at']


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for Report Template"""
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'tenant', 'name', 'report_type', 'report_type_display',
            'description', 'template_data', 'is_default', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ScheduledReportSerializer(serializers.ModelSerializer):
    """Serializer for Scheduled Report"""
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ScheduledReport
        fields = [
            'id', 'tenant', 'name', 'report_type', 'report_type_display',
            'frequency', 'frequency_display', 'day_of_week', 'day_of_month',
            'time', 'recipients', 'parameters', 'is_active', 'last_run',
            'next_run', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_run', 'next_run']


class ReportExecutionSerializer(serializers.ModelSerializer):
    """Serializer for Report Execution"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    scheduled_report_name = serializers.CharField(source='scheduled_report.name', read_only=True)
    
    class Meta:
        model = ReportExecution
        fields = [
            'id', 'tenant', 'scheduled_report', 'scheduled_report_name',
            'report', 'status', 'status_display', 'started_at', 'completed_at',
            'error_message', 'execution_time', 'file_size'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


class DashboardSerializer(serializers.ModelSerializer):
    """Serializer for Dashboard"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Dashboard
        fields = [
            'id', 'tenant', 'user', 'user_email', 'name', 'description',
            'layout', 'widgets', 'is_default', 'is_public',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WidgetSerializer(serializers.ModelSerializer):
    """Serializer for Widget"""
    widget_type_display = serializers.CharField(source='get_widget_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Widget
        fields = [
            'id', 'tenant', 'name', 'widget_type', 'widget_type_display',
            'data_source', 'configuration', 'refresh_interval', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaxReportSerializer(serializers.ModelSerializer):
    """Serializer for Tax Report"""
    tax_type_display = serializers.CharField(source='get_tax_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaxReport
        fields = [
            'id', 'tenant', 'company', 'report_name', 'tax_period_start',
            'tax_period_end', 'tax_type', 'tax_type_display', 'tax_jurisdiction',
            'total_taxable_income', 'total_deductions', 'total_tax_liability',
            'total_tax_paid', 'data', 'file_path', 'status', 'status_display',
            'generated_at', 'filed_at', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'generated_at', 'filed_at']


class ComplianceReportSerializer(serializers.ModelSerializer):
    """Serializer for Compliance Report"""
    compliance_type_display = serializers.CharField(source='get_compliance_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ComplianceReport
        fields = [
            'id', 'tenant', 'company', 'report_name', 'compliance_type',
            'compliance_type_display', 'period_start', 'period_end', 'description',
            'data', 'file_path', 'status', 'status_display', 'generated_at',
            'reviewed_at', 'reviewed_by', 'reviewed_by_name', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'generated_at', 'reviewed_at']


class ReportExportSerializer(serializers.ModelSerializer):
    """Serializer for Report Export"""
    export_format_display = serializers.CharField(source='get_export_format_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportExport
        fields = [
            'id', 'tenant', 'report', 'tax_report', 'compliance_report',
            'export_format', 'export_format_display', 'file_path', 'file_size',
            'status', 'status_display', 'error_message', 'created_by',
            'created_by_name', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']


class ReportingSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Reporting Settings"""
    
    class Meta:
        model = ReportingSettings
        fields = [
            'id', 'tenant', 'company', 'default_currency', 'default_date_format',
            'default_export_format', 'auto_generate_reports', 'report_retention_days',
            'enable_report_caching', 'cache_expiry_hours', 'enable_email_notifications',
            'default_recipients', 'max_export_file_size_mb', 'allowed_export_formats',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReportSummarySerializer(serializers.Serializer):
    """Serializer for Report Summary Statistics"""
    total_reports = serializers.IntegerField()
    completed_reports = serializers.IntegerField()
    pending_reports = serializers.IntegerField()
    failed_reports = serializers.IntegerField()
    total_tax_reports = serializers.IntegerField()
    total_compliance_reports = serializers.IntegerField()
    scheduled_reports_count = serializers.IntegerField()
    active_scheduled_reports = serializers.IntegerField()

