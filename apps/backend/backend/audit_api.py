"""
Audit API Views for Multi-Tenant Database Operations
Provides REST API endpoints for querying audit trails and compliance reports.
"""

import logging
from typing import Any, Optional, Dict, List
from django.db.models import Q, QuerySet
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator
from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .audit_service import audit_service
from .audit_models import AuditLog, AuditQuery, AuditExport, AuditViolation
from .row_tenant_middleware import get_current_tenant, get_current_user

User = get_user_model()
logger = logging.getLogger(__name__)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for audit log records with tenant filtering.
    """
    
    serializer_class = None  # Will be defined in serializers
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get audit logs for current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            return AuditLog.objects.none()
        
        return AuditLog.objects.filter(tenant=tenant).order_by('-timestamp')
    
    def list(self, request):
        """List audit logs with filtering and pagination"""
        try:
            # Get query parameters
            operation = request.query_params.get('operation')
            resource_type = request.query_params.get('resource_type')
            user_id = request.query_params.get('user_id')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            compliance_framework = request.query_params.get('compliance_framework')
            data_classification = request.query_params.get('data_classification')
            is_sensitive = request.query_params.get('is_sensitive')
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 50))
            
            # Parse dates
            start_date_obj = None
            end_date_obj = None
            if start_date:
                start_date_obj = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if end_date:
                end_date_obj = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Parse boolean
            is_sensitive_bool = None
            if is_sensitive is not None:
                is_sensitive_bool = is_sensitive.lower() == 'true'
            
            # Get audit trail
            audit_logs = audit_service.get_audit_trail(
                operation=operation,
                resource_type=resource_type,
                start_date=start_date_obj,
                end_date=end_date_obj,
                compliance_framework=compliance_framework,
                data_classification=data_classification,
                is_sensitive=is_sensitive_bool,
                limit=page_size,
                offset=(page - 1) * page_size
            )
            
            # Filter by user if specified
            if user_id:
                audit_logs = audit_logs.filter(user_id=user_id)
            
            # Serialize data
            data = []
            for audit_log in audit_logs:
                data.append({
                    'id': str(audit_log.id),
                    'operation': audit_log.operation,
                    'resource_type': audit_log.resource_type,
                    'resource_id': audit_log.resource_id,
                    'resource_name': audit_log.resource_name,
                    'user': audit_log.user.email if audit_log.user else None,
                    'timestamp': audit_log.timestamp.isoformat(),
                    'compliance_framework': audit_log.compliance_framework,
                    'data_classification': audit_log.data_classification,
                    'is_sensitive': audit_log.is_sensitive,
                    'ip_address': audit_log.ip_address,
                    'user_agent': audit_log.user_agent,
                    'changed_fields': audit_log.changed_fields,
                })
            
            return Response({
                'results': data,
                'count': audit_logs.count(),
                'page': page,
                'page_size': page_size,
            })
            
        except Exception as e:
            logger.error(f"Failed to list audit logs: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get audit log summary for current tenant"""
        try:
            tenant = get_current_tenant()
            if not tenant:
                return Response(
                    {'error': 'Tenant context required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get summary data
            audit_logs = AuditLog.objects.filter(tenant=tenant)
            
            summary = {
                'total_operations': audit_logs.count(),
                'operations_by_type': {},
                'operations_by_user': {},
                'operations_by_resource': {},
                'sensitive_operations': audit_logs.filter(is_sensitive=True).count(),
                'compliance_frameworks': list(audit_logs.values_list('compliance_framework', flat=True).distinct()),
                'data_classifications': list(audit_logs.values_list('data_classification', flat=True).distinct()),
            }
            
            # Operations by type
            for operation in audit_logs.values_list('operation', flat=True).distinct():
                summary['operations_by_type'][operation] = audit_logs.filter(operation=operation).count()
            
            # Operations by user
            for user_email in audit_logs.values_list('user__email', flat=True).distinct():
                if user_email:
                    summary['operations_by_user'][user_email] = audit_logs.filter(user__email=user_email).count()
            
            # Operations by resource
            for resource_type in audit_logs.values_list('resource_type', flat=True).distinct():
                summary['operations_by_resource'][resource_type] = audit_logs.filter(resource_type=resource_type).count()
            
            return Response(summary)
            
        except Exception as e:
            logger.error(f"Failed to get audit summary: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Get detailed audit log information"""
        try:
            audit_log = self.get_object()
            
            details = {
                'id': str(audit_log.id),
                'operation': audit_log.operation,
                'resource_type': audit_log.resource_type,
                'resource_id': audit_log.resource_id,
                'resource_name': audit_log.resource_name,
                'user': audit_log.user.email if audit_log.user else None,
                'timestamp': audit_log.timestamp.isoformat(),
                'compliance_framework': audit_log.compliance_framework,
                'data_classification': audit_log.data_classification,
                'is_sensitive': audit_log.is_sensitive,
                'ip_address': audit_log.ip_address,
                'user_agent': audit_log.user_agent,
                'request_id': audit_log.request_id,
                'session_id': audit_log.session_id,
                'old_data': audit_log.old_data,
                'new_data': audit_log.new_data,
                'changed_fields': audit_log.changed_fields,
                'audit_hash': audit_log.audit_hash,
                'parent_audit_id': str(audit_log.parent_audit_id) if audit_log.parent_audit_id else None,
                'retention_until': audit_log.retention_until.isoformat() if audit_log.retention_until else None,
                'is_archived': audit_log.is_archived,
            }
            
            return Response(details)
            
        except Exception as e:
            logger.error(f"Failed to get audit details: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Get related audit logs"""
        try:
            audit_log = self.get_object()
            related_logs = audit_log.get_related_audits()
            
            data = []
            for related_log in related_logs:
                data.append({
                    'id': str(related_log.id),
                    'operation': related_log.operation,
                    'resource_type': related_log.resource_type,
                    'resource_id': related_log.resource_id,
                    'timestamp': related_log.timestamp.isoformat(),
                    'user': related_log.user.email if related_log.user else None,
                })
            
            return Response(data)
            
        except Exception as e:
            logger.error(f"Failed to get related audits: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ComplianceReportView(APIView):
    """
    API view for compliance reports.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get compliance report for current tenant"""
        try:
            # Get query parameters
            compliance_framework = request.query_params.get('compliance_framework')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            # Parse dates
            start_date_obj = None
            end_date_obj = None
            if start_date:
                start_date_obj = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if end_date:
                end_date_obj = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Get compliance report
            report = audit_service.get_compliance_report(
                compliance_framework=compliance_framework,
                start_date=start_date_obj,
                end_date=end_date_obj
            )
            
            return Response(report)
            
        except Exception as e:
            logger.error(f"Failed to get compliance report: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserActivityView(APIView):
    """
    API view for user activity audit trails.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """Get user activity audit trail"""
        try:
            # Get user
            if user_id:
                user = User.objects.get(id=user_id)
            else:
                user = get_current_user()
            
            if not user:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get query parameters
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            limit = int(request.query_params.get('limit', 100))
            
            # Parse dates
            start_date_obj = None
            end_date_obj = None
            if start_date:
                start_date_obj = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if end_date:
                end_date_obj = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Get user activity
            audit_logs = audit_service.get_user_activity(
                user=user,
                start_date=start_date_obj,
                end_date=end_date_obj,
                limit=limit
            )
            
            # Serialize data
            data = []
            for audit_log in audit_logs:
                data.append({
                    'id': str(audit_log.id),
                    'operation': audit_log.operation,
                    'resource_type': audit_log.resource_type,
                    'resource_id': audit_log.resource_id,
                    'timestamp': audit_log.timestamp.isoformat(),
                    'compliance_framework': audit_log.compliance_framework,
                    'data_classification': audit_log.data_classification,
                    'is_sensitive': audit_log.is_sensitive,
                })
            
            return Response({
                'user': user.email,
                'activity': data,
                'count': len(data),
            })
            
        except Exception as e:
            logger.error(f"Failed to get user activity: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResourceAuditTrailView(APIView):
    """
    API view for resource audit trails.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, resource_type, resource_id):
        """Get audit trail for a specific resource"""
        try:
            # Get audit trail
            audit_logs = audit_service.get_resource_audit_trail(
                resource_type=resource_type,
                resource_id=resource_id
            )
            
            # Serialize data
            data = []
            for audit_log in audit_logs:
                data.append({
                    'id': str(audit_log.id),
                    'operation': audit_log.operation,
                    'user': audit_log.user.email if audit_log.user else None,
                    'timestamp': audit_log.timestamp.isoformat(),
                    'old_data': audit_log.old_data,
                    'new_data': audit_log.new_data,
                    'changed_fields': audit_log.changed_fields,
                    'compliance_framework': audit_log.compliance_framework,
                    'data_classification': audit_log.data_classification,
                    'is_sensitive': audit_log.is_sensitive,
                })
            
            return Response({
                'resource_type': resource_type,
                'resource_id': resource_id,
                'audit_trail': data,
                'count': len(data),
            })
            
        except Exception as e:
            logger.error(f"Failed to get resource audit trail: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AuditViolationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for audit violations with tenant filtering.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get audit violations for current tenant"""
        tenant = get_current_tenant()
        if not tenant:
            return AuditViolation.objects.none()
        
        return AuditViolation.objects.filter(tenant=tenant).order_by('-timestamp')
    
    def list(self, request):
        """List audit violations with filtering and pagination"""
        try:
            # Get query parameters
            violation_type = request.query_params.get('violation_type')
            severity = request.query_params.get('severity')
            status = request.query_params.get('status')
            user_id = request.query_params.get('user_id')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 50))
            
            # Parse dates
            start_date_obj = None
            end_date_obj = None
            if start_date:
                start_date_obj = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if end_date:
                end_date_obj = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Get violations
            violations = self.get_queryset()
            
            # Apply filters
            if violation_type:
                violations = violations.filter(violation_type=violation_type)
            if severity:
                violations = violations.filter(severity=severity)
            if status:
                violations = violations.filter(status=status)
            if user_id:
                violations = violations.filter(user_id=user_id)
            if start_date_obj:
                violations = violations.filter(timestamp__gte=start_date_obj)
            if end_date_obj:
                violations = violations.filter(timestamp__lte=end_date_obj)
            
            # Apply pagination
            paginator = Paginator(violations, page_size)
            page_obj = paginator.get_page(page)
            
            # Serialize data
            data = []
            for violation in page_obj:
                data.append({
                    'id': str(violation.id),
                    'violation_type': violation.violation_type,
                    'severity': violation.severity,
                    'status': violation.status,
                    'description': violation.description,
                    'user': violation.user.email if violation.user else None,
                    'timestamp': violation.timestamp.isoformat(),
                    'resolved_by': violation.resolved_by.email if violation.resolved_by else None,
                    'resolved_at': violation.resolved_at.isoformat() if violation.resolved_at else None,
                })
            
            return Response({
                'results': data,
                'count': paginator.count,
                'page': page,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
            })
            
        except Exception as e:
            logger.error(f"Failed to list audit violations: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an audit violation"""
        try:
            violation = self.get_object()
            notes = request.data.get('notes', '')
            
            # Resolve violation
            violation.resolve(
                resolved_by=get_current_user(),
                notes=notes
            )
            
            return Response({
                'message': 'Violation resolved successfully',
                'violation_id': str(violation.id),
            })
            
        except Exception as e:
            logger.error(f"Failed to resolve violation: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AuditExportView(APIView):
    """
    API view for exporting audit data.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Export audit data"""
        try:
            # Get request data
            export_type = request.data.get('export_type', 'CSV')
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            filters = request.data.get('filters', {})
            
            # Parse dates
            start_date_obj = None
            end_date_obj = None
            if start_date:
                start_date_obj = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if end_date:
                end_date_obj = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Get audit logs
            audit_logs = audit_service.get_audit_trail(
                start_date=start_date_obj,
                end_date=end_date_obj,
                **filters
            )
            
            # Create export record
            export_record = audit_service.log_export(
                export_type=export_type,
                model_name='AuditLog',
                filters_applied=filters,
                record_count=audit_logs.count(),
                file_path=f'/tmp/audit_export_{timezone.now().timestamp()}.{export_type.lower()}',
                file_size=0,  # Will be updated when file is created
            )
            
            # TODO: Implement actual file export logic
            # This would create the actual export file and update the file_path and file_size
            
            return Response({
                'export_id': str(export_record.id),
                'export_type': export_type,
                'record_count': audit_logs.count(),
                'file_path': export_record.file_path,
                'created_at': export_record.timestamp.isoformat(),
            })
            
        except Exception as e:
            logger.error(f"Failed to export audit data: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Utility views for audit management
class AuditManagementView(APIView):
    """
    API view for audit management operations.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Perform audit management operations"""
        try:
            action = request.data.get('action')
            
            if action == 'cleanup':
                days = int(request.data.get('days', 2555))
                deleted_count = audit_service.cleanup_old_audit_logs(days=days)
                return Response({
                    'message': f'Cleaned up {deleted_count} old audit logs',
                    'deleted_count': deleted_count,
                })
            
            elif action == 'archive':
                days = int(request.data.get('days', 365))
                archived_count = audit_service.archive_audit_logs(days=days)
                return Response({
                    'message': f'Archived {archived_count} audit logs',
                    'archived_count': archived_count,
                })
            
            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            logger.error(f"Failed to perform audit management: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
