from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import (
    DocumentFile, DocumentFolder, DocumentTemplate, DocumentVersion,
    DocumentShare, DocumentComment, DocumentAuditLog, DocumentWorkflow,
    DocumentWorkflowInstance, DocumentWorkflowStep, DocumentStorage, DocumentSettings
)
from .serializers import (
    DocumentFileSerializer, DocumentFolderSerializer, DocumentTemplateSerializer,
    DocumentVersionSerializer, DocumentShareSerializer, DocumentCommentSerializer,
    DocumentAuditLogSerializer, DocumentWorkflowSerializer,
    DocumentWorkflowInstanceSerializer, DocumentWorkflowStepSerializer,
    DocumentStorageSerializer, DocumentSettingsSerializer
)
from authentication.permissions import IsTenantMember
from backend.tenant_utils import get_request_tenant


# Document Templates
class DocumentTemplateListView(generics.ListCreateAPIView):
    """List and create Document Templates"""
    serializer_class = DocumentTemplateSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentTemplate.objects.none()
        template_type = self.request.query_params.get('template_type')
        queryset = DocumentTemplate.objects.filter(tenant=tenant, is_active=True)
        if template_type:
            queryset = queryset.filter(template_type=template_type)
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class DocumentTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Document Template"""
    serializer_class = DocumentTemplateSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentTemplate.objects.none()
        return DocumentTemplate.objects.filter(tenant=tenant)


# Document Workflows
class DocumentWorkflowListView(generics.ListCreateAPIView):
    """List and create Document Workflows"""
    serializer_class = DocumentWorkflowSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentWorkflow.objects.none()
        is_active = self.request.query_params.get('is_active')
        queryset = DocumentWorkflow.objects.filter(tenant=tenant)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active == 'true')
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class DocumentWorkflowDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Document Workflow"""
    serializer_class = DocumentWorkflowSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentWorkflow.objects.none()
        return DocumentWorkflow.objects.filter(tenant=tenant)


class DocumentWorkflowInstanceListView(generics.ListCreateAPIView):
    """List and create Document Workflow Instances"""
    serializer_class = DocumentWorkflowInstanceSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentWorkflowInstance.objects.none()
        workflow_id = self.request.query_params.get('workflow_id')
        document_id = self.request.query_params.get('document_id')
        status_filter = self.request.query_params.get('status')
        queryset = DocumentWorkflowInstance.objects.filter(tenant=tenant)
        if workflow_id:
            queryset = queryset.filter(workflow_id=workflow_id)
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-started_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, started_by=self.request.user)


class DocumentWorkflowInstanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Document Workflow Instance"""
    serializer_class = DocumentWorkflowInstanceSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentWorkflowInstance.objects.none()
        return DocumentWorkflowInstance.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def start_workflow(request, document_id):
    """Start a workflow for a document"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    document = get_object_or_404(DocumentFile, id=document_id, tenant=tenant)
    workflow_id = request.data.get('workflow_id')
    
    if not workflow_id:
        return Response(
            {'error': 'workflow_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    workflow = get_object_or_404(DocumentWorkflow, id=workflow_id, tenant=tenant)
    
    # Create workflow instance
    instance = DocumentWorkflowInstance.objects.create(
        tenant=tenant,
        workflow=workflow,
        document=document,
        status='pending',
        started_by=request.user
    )
    
    # Create workflow steps based on workflow configuration
    for idx, step_config in enumerate(workflow.steps, start=1):
        DocumentWorkflowStep.objects.create(
            workflow_instance=instance,
            step_number=idx,
            step_name=step_config.get('name', f'Step {idx}'),
            status='pending'
        )
    
    return Response({
        'message': 'Workflow started successfully',
        'workflow_instance': DocumentWorkflowInstanceSerializer(instance).data
    })


@api_view(['POST'])
@permission_classes([IsTenantMember])
def complete_workflow_step(request, instance_id, step_id):
    """Complete a workflow step"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    instance = get_object_or_404(DocumentWorkflowInstance, id=instance_id, tenant=tenant)
    step = get_object_or_404(DocumentWorkflowStep, id=step_id, workflow_instance=instance)
    
    action = request.data.get('action', 'complete')
    comments = request.data.get('comments', '')
    
    if action == 'complete':
        step.status = 'completed'
        step.completed_at = timezone.now()
    elif action == 'reject':
        step.status = 'rejected'
        instance.status = 'rejected'
        instance.completed_at = timezone.now()
    
    step.action = action
    step.comments = comments
    step.save()
    instance.save()
    
    return Response({
        'message': 'Workflow step updated successfully',
        'step': DocumentWorkflowStepSerializer(step).data
    })


# Document Storage
class DocumentStorageListView(generics.ListCreateAPIView):
    """List and create Document Storage"""
    serializer_class = DocumentStorageSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentStorage.objects.none()
        is_active = self.request.query_params.get('is_active')
        queryset = DocumentStorage.objects.filter(tenant=tenant)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active == 'true')
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class DocumentStorageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Document Storage"""
    serializer_class = DocumentStorageSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DocumentStorage.objects.none()
        return DocumentStorage.objects.filter(tenant=tenant)


@api_view(['GET'])
@permission_classes([IsTenantMember])
@api_view(['POST'])
@permission_classes([IsTenantMember])
def generate_upload_url(request):
    """
    Generate a presigned URL for direct file upload to Cloudflare R2
    This allows Flutter/mobile apps to upload files directly to R2 without going through the backend
    """
    from backend.cloudflare_storage import get_cloudflare_r2
    from rest_framework.exceptions import ValidationError
    
    r2 = get_cloudflare_r2()
    
    if not r2.is_configured:
        return Response(
            {'error': 'Cloudflare R2 is not configured'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Get parameters from request
    filename = request.data.get('filename')
    content_type = request.data.get('content_type', 'application/octet-stream')
    expiration = int(request.data.get('expiration', 3600))
    
    if not filename:
        raise ValidationError({'filename': 'Filename is required'})
    
    # Generate tenant-specific path
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create path: tenant_id/documents/timestamp_filename
    import uuid
    from django.utils import timezone
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    safe_filename = filename.replace(' ', '_').replace('/', '_')
    object_key = f"{tenant.id}/documents/{timestamp}_{uuid.uuid4().hex[:8]}_{safe_filename}"
    
    # Generate upload URL
    upload_info = r2.generate_upload_url(
        object_name=object_key,
        content_type=content_type,
        expiration=expiration
    )
    
    if not upload_info:
        return Response(
            {'error': 'Failed to generate upload URL'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return Response({
        'success': True,
        'upload_url': upload_info['upload_url'],
        'method': upload_info['method'],
        'headers': upload_info.get('headers', {}),
        'object_key': upload_info['object_key'],
        'expires_at': upload_info['expires_at'],
        'public_url': r2.get_file_url(object_key, signed=False) if r2.public_url else None
    })


def storage_statistics(request):
    """Get storage statistics"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    storages = DocumentStorage.objects.filter(tenant=tenant, is_active=True)
    documents = DocumentFile.objects.filter(tenant=tenant)
    
    total_space = sum(storage.total_space or 0 for storage in storages)
    used_space = sum(storage.used_space for storage in storages)
    total_documents = documents.count()
    total_size = documents.aggregate(total=Sum('file_size'))['total'] or 0
    
    return Response({
        'total_storages': storages.count(),
        'total_space': total_space,
        'used_space': used_space,
        'available_space': total_space - used_space,
        'used_percentage': (used_space / total_space * 100) if total_space > 0 else 0,
        'total_documents': total_documents,
        'total_documents_size': total_size
    })


# Document Settings
class DocumentSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update Document Settings"""
    serializer_class = DocumentSettingsSerializer
    permission_classes = [IsTenantMember]
    
    def get_object(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        company = getattr(self.request.user, 'company', None)
        settings, created = DocumentSettings.objects.get_or_create(
            tenant=tenant,
            company=company
        )
        return settings
