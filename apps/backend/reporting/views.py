from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import (
    Report, ReportTemplate, ScheduledReport, ReportExecution,
    Dashboard, Widget, TaxReport, ComplianceReport, ReportExport, ReportingSettings
)
from .serializers import (
    ReportSerializer, ReportTemplateSerializer, ScheduledReportSerializer,
    ReportExecutionSerializer, DashboardSerializer, WidgetSerializer,
    TaxReportSerializer, ComplianceReportSerializer, ReportExportSerializer,
    ReportingSettingsSerializer, ReportSummarySerializer
)
from authentication.permissions import IsTenantMember
from backend.tenant_utils import get_request_tenant


# Report Overview Stats
@api_view(['GET'])
@permission_classes([IsTenantMember])
def reports_overview_stats(request):
    """Get reports overview statistics"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    reports = Report.objects.filter(tenant=tenant)
    tax_reports = TaxReport.objects.filter(tenant=tenant)
    compliance_reports = ComplianceReport.objects.filter(tenant=tenant)
    scheduled_reports = ScheduledReport.objects.filter(tenant=tenant)
    
    stats = {
        'total_reports': reports.count(),
        'completed_reports': reports.filter(status='completed').count(),
        'pending_reports': reports.filter(status__in=['draft', 'generating']).count(),
        'failed_reports': reports.filter(status='failed').count(),
        'total_tax_reports': tax_reports.count(),
        'total_compliance_reports': compliance_reports.count(),
        'scheduled_reports_count': scheduled_reports.count(),
        'active_scheduled_reports': scheduled_reports.filter(is_active=True).count()
    }
    
    serializer = ReportSummarySerializer(stats)
    return Response(serializer.data)


# Report Views
class ReportListView(generics.ListCreateAPIView):
    """List and create Reports"""
    serializer_class = ReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return Report.objects.none()
        report_type = self.request.query_params.get('report_type')
        status_filter = self.request.query_params.get('status')
        queryset = Report.objects.filter(tenant=tenant)
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Report"""
    serializer_class = ReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return Report.objects.none()
        return Report.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def generate_report(request, pk):
    """Generate a report"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    report = get_object_or_404(Report, id=pk, tenant=tenant)
    
    # Update report status
    report.status = 'generating'
    report.save()
    
    # Here you would implement actual report generation logic
    # For now, just mark as completed
    report.status = 'completed'
    report.generated_at = timezone.now()
    report.save()
    
    return Response({
        'message': 'Report generated successfully',
        'report': ReportSerializer(report).data
    })


# Financial Reports
@api_view(['GET'])
@permission_classes([IsTenantMember])
def financial_reports(request):
    """Get financial reports"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    financial_types = [
        'balance_sheet', 'income_statement', 'cash_flow',
        'trial_balance', 'general_ledger', 'accounts_receivable',
        'accounts_payable'
    ]
    
    reports = Report.objects.filter(
        tenant=tenant,
        report_type__in=financial_types
    ).order_by('-created_at')
    
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)


# Tax Reports
class TaxReportListView(generics.ListCreateAPIView):
    """List and create Tax Reports"""
    serializer_class = TaxReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return TaxReport.objects.none()
        tax_type = self.request.query_params.get('tax_type')
        queryset = TaxReport.objects.filter(tenant=tenant)
        if tax_type:
            queryset = queryset.filter(tax_type=tax_type)
        return queryset.order_by('-tax_period_end', '-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class TaxReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Tax Report"""
    serializer_class = TaxReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return TaxReport.objects.none()
        return TaxReport.objects.filter(tenant=tenant)


# Compliance Reports
class ComplianceReportListView(generics.ListCreateAPIView):
    """List and create Compliance Reports"""
    serializer_class = ComplianceReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ComplianceReport.objects.none()
        compliance_type = self.request.query_params.get('compliance_type')
        queryset = ComplianceReport.objects.filter(tenant=tenant)
        if compliance_type:
            queryset = queryset.filter(compliance_type=compliance_type)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class ComplianceReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Compliance Report"""
    serializer_class = ComplianceReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ComplianceReport.objects.none()
        return ComplianceReport.objects.filter(tenant=tenant)


# Custom Reports
@api_view(['GET'])
@permission_classes([IsTenantMember])
def custom_reports(request):
    """Get custom reports"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    custom_reports = Report.objects.filter(
        tenant=tenant,
        report_type='custom'
    ).order_by('-created_at')
    
    serializer = ReportSerializer(custom_reports, many=True)
    return Response(serializer.data)


# Scheduled Reports
class ScheduledReportListView(generics.ListCreateAPIView):
    """List and create Scheduled Reports"""
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ScheduledReport.objects.none()
        is_active = self.request.query_params.get('is_active')
        queryset = ScheduledReport.objects.filter(tenant=tenant)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active == 'true')
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class ScheduledReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Scheduled Report"""
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ScheduledReport.objects.none()
        return ScheduledReport.objects.filter(tenant=tenant)


# Report Export
class ReportExportListView(generics.ListCreateAPIView):
    """List and create Report Exports"""
    serializer_class = ReportExportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ReportExport.objects.none()
        status_filter = self.request.query_params.get('status')
        queryset = ReportExport.objects.filter(tenant=tenant)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class ReportExportDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve and delete Report Export"""
    serializer_class = ReportExportSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ReportExport.objects.none()
        return ReportExport.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def export_report(request, pk):
    """Export a report in specified format"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    report = get_object_or_404(Report, id=pk, tenant=tenant)
    export_format = request.data.get('export_format', 'pdf')
    
    # Create export record
    export = ReportExport.objects.create(
        tenant=tenant,
        report=report,
        export_format=export_format,
        status='processing',
        created_by=request.user
    )
    
    # Here you would implement actual export logic
    # For now, just mark as completed
    export.status = 'completed'
    export.completed_at = timezone.now()
    export.save()
    
    return Response({
        'message': 'Report export initiated successfully',
        'export': ReportExportSerializer(export).data
    })


# Report Settings
class ReportingSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update Reporting Settings"""
    serializer_class = ReportingSettingsSerializer
    permission_classes = [IsTenantMember]
    
    def get_object(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        company = getattr(self.request.user, 'company', None)
        settings, created = ReportingSettings.objects.get_or_create(
            tenant=tenant,
            company=company
        )
        return settings


# Report Templates
class ReportTemplateListView(generics.ListCreateAPIView):
    """List and create Report Templates"""
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ReportTemplate.objects.none()
        report_type = self.request.query_params.get('report_type')
        queryset = ReportTemplate.objects.filter(tenant=tenant, is_active=True)
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class ReportTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Report Template"""
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ReportTemplate.objects.none()
        return ReportTemplate.objects.filter(tenant=tenant)
