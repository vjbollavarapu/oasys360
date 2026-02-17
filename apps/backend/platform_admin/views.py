from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    SystemSettings, AuditLog, Backup, MaintenanceWindow,
    SystemHealth, SecurityEvent, SystemMetrics, APIKey, AdminSettings
)
from .serializers import (
    SystemSettingsSerializer, AuditLogSerializer, BackupSerializer,
    MaintenanceWindowSerializer, SystemHealthSerializer, SecurityEventSerializer,
    SystemMetricsSerializer, APIKeySerializer, AdminSettingsSerializer,
    AdminOverviewStatsSerializer
)
from authentication.permissions import IsTenantMember
from backend.tenant_utils import get_request_tenant
from tenants.models import Tenant
from authentication.models import User


# Admin Overview Stats
@api_view(['GET'])
@permission_classes([IsTenantMember])
def admin_overview_stats(request):
    """Get admin overview statistics"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # User stats
    users = User.objects.filter(tenant=tenant)
    total_users = users.count()
    active_users = users.filter(is_active=True).count()
    
    # Tenant stats (only for platform admin)
    total_tenants = Tenant.objects.count() if request.user.role == 'platform_admin' else 1
    active_tenants = Tenant.objects.filter(status='active').count() if request.user.role == 'platform_admin' else 1
    
    # Security events (last 7 days)
    recent_security_events = SecurityEvent.objects.filter(
        tenant=tenant,
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Backup stats (Backup model doesn't have tenant field - it's platform-wide)
    pending_backups = Backup.objects.filter(status='in_progress').count()
    
    # System health
    system_health = SystemHealth.objects.filter(status__in=['warning', 'critical']).exists()
    system_health_status = 'warning' if system_health else 'healthy'
    
    # Active maintenance windows
    active_maintenance_windows = MaintenanceWindow.objects.filter(
        status__in=['scheduled', 'in_progress'],
        start_time__lte=timezone.now(),
        end_time__gte=timezone.now()
    ).count()
    
    stats = {
        'total_users': total_users,
        'active_users': active_users,
        'total_tenants': total_tenants,
        'active_tenants': active_tenants,
        'recent_security_events': recent_security_events,
        'pending_backups': pending_backups,
        'system_health_status': system_health_status,
        'active_maintenance_windows': active_maintenance_windows
    }
    
    serializer = AdminOverviewStatsSerializer(stats)
    return Response(serializer.data)


# System Settings
class SystemSettingsListView(generics.ListCreateAPIView):
    """List and create System Settings"""
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        category = self.request.query_params.get('category')
        queryset = SystemSettings.objects.all()
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('category', 'setting_key')
    
    def perform_create(self, serializer):
        serializer.save()


class SystemSettingsDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete System Settings"""
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsTenantMember]
    queryset = SystemSettings.objects.all()


# Admin Settings
class AdminSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update Admin Settings"""
    serializer_class = AdminSettingsSerializer
    permission_classes = [IsTenantMember]
    
    def get_object(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        settings, created = AdminSettings.objects.get_or_create(tenant=tenant)
        return settings


# Audit Logs
class AuditLogListView(generics.ListAPIView):
    """List Audit Logs"""
    serializer_class = AuditLogSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return AuditLog.objects.none()
        
        queryset = AuditLog.objects.filter(tenant=tenant)
        
        # Filters
        action = self.request.query_params.get('action')
        resource_type = self.request.query_params.get('resource_type')
        severity = self.request.query_params.get('severity')
        
        if action:
            queryset = queryset.filter(action__icontains=action)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-created_at')


class AuditLogDetailView(generics.RetrieveAPIView):
    """Retrieve Audit Log"""
    serializer_class = AuditLogSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return AuditLog.objects.none()
        return AuditLog.objects.filter(tenant=tenant)


# Security Events
class SecurityEventListView(generics.ListCreateAPIView):
    """List and create Security Events"""
    serializer_class = SecurityEventSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return SecurityEvent.objects.none()
        
        queryset = SecurityEvent.objects.filter(tenant=tenant)
        
        # Filters
        event_type = self.request.query_params.get('event_type')
        severity = self.request.query_params.get('severity')
        is_resolved = self.request.query_params.get('is_resolved')
        
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if severity:
            queryset = queryset.filter(severity=severity)
        if is_resolved is not None:
            queryset = queryset.filter(is_resolved=is_resolved == 'true')
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


class SecurityEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Security Event"""
    serializer_class = SecurityEventSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return SecurityEvent.objects.none()
        return SecurityEvent.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def resolve_security_event(request, pk):
    """Resolve a security event"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    event = get_object_or_404(SecurityEvent, id=pk, tenant=tenant)
    event.is_resolved = True
    event.resolved_at = timezone.now()
    event.resolved_by = request.user
    event.save()
    
    return Response({
        'message': 'Security event resolved successfully',
        'event': SecurityEventSerializer(event).data
    })


# Backups
class BackupListView(generics.ListCreateAPIView):
    """List and create Backups"""
    serializer_class = BackupSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status')
        backup_type = self.request.query_params.get('backup_type')
        queryset = Backup.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if backup_type:
            queryset = queryset.filter(backup_type=backup_type)
        
        return queryset.order_by('-started_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BackupDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve and delete Backup"""
    serializer_class = BackupSerializer
    permission_classes = [IsTenantMember]
    queryset = Backup.objects.all()


@api_view(['POST'])
@permission_classes([IsTenantMember])
def create_backup(request):
    """Create a backup"""
    backup_type = request.data.get('backup_type', 'database')
    
    backup = Backup.objects.create(
        backup_type=backup_type,
        filename=f"backup_{backup_type}_{timezone.now().strftime('%Y%m%d_%H%M%S')}",
        file_path='',  # Will be set when backup is completed
        file_size=0,
        checksum='',
        status='in_progress',
        created_by=request.user
    )
    
    # Here you would implement actual backup logic
    # For now, just mark as completed
    backup.status = 'completed'
    backup.completed_at = timezone.now()
    backup.save()
    
    return Response({
        'message': 'Backup created successfully',
        'backup': BackupSerializer(backup).data
    })


# Maintenance Windows
class MaintenanceWindowListView(generics.ListCreateAPIView):
    """List and create Maintenance Windows"""
    serializer_class = MaintenanceWindowSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status')
        queryset = MaintenanceWindow.objects.all()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-start_time')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MaintenanceWindowDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Maintenance Window"""
    serializer_class = MaintenanceWindowSerializer
    permission_classes = [IsTenantMember]
    queryset = MaintenanceWindow.objects.all()


# System Health
class SystemHealthListView(generics.ListAPIView):
    """List System Health"""
    serializer_class = SystemHealthSerializer
    permission_classes = [IsTenantMember]
    queryset = SystemHealth.objects.all()


class SystemHealthDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update System Health"""
    serializer_class = SystemHealthSerializer
    permission_classes = [IsTenantMember]
    queryset = SystemHealth.objects.all()


# API Keys
class APIKeyListView(generics.ListCreateAPIView):
    """List and create API Keys"""
    serializer_class = APIKeySerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return APIKey.objects.none()
        return APIKey.objects.filter(tenant=tenant)
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, user=self.request.user)


class APIKeyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete API Key"""
    serializer_class = APIKeySerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return APIKey.objects.none()
        return APIKey.objects.filter(tenant=tenant)
