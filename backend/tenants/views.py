from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Tenant, Company, TenantInvitation
from .serializers import (
    TenantSerializer, CompanySerializer, TenantInvitationSerializer,
    TenantStatsSerializer
)
from authentication.permissions import IsTenantAdmin, IsFirmAdmin, IsTenantMember


class TenantListView(generics.ListCreateAPIView):
    """List and create tenants (for platform admin)"""
    serializer_class = TenantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'platform_admin':
            return Tenant.objects.all()
        elif user.tenant:
            return Tenant.objects.filter(id=user.tenant.id)
        return Tenant.objects.none()
    
    def perform_create(self, serializer):
        # Only platform admins can create tenants
        if self.request.user.role != 'platform_admin':
            raise permissions.PermissionDenied("Only platform admins can create tenants")
        serializer.save()


class TenantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete tenant"""
    serializer_class = TenantSerializer
    permission_classes = [IsTenantAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'platform_admin':
            return Tenant.objects.all()
        elif user.tenant:
            return Tenant.objects.filter(id=user.tenant.id)
        return Tenant.objects.none()


class TenantStatsView(generics.RetrieveAPIView):
    """Get tenant statistics"""
    serializer_class = TenantStatsSerializer
    permission_classes = [IsTenantMember]
    
    def get_object(self):
        return self.request.user.tenant


class CompanyListView(generics.ListCreateAPIView):
    """List and create companies for a tenant"""
    serializer_class = CompanySerializer
    permission_classes = [IsFirmAdmin]
    
    def get_queryset(self):
        return Company.objects.filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete company"""
    serializer_class = CompanySerializer
    permission_classes = [IsFirmAdmin]
    
    def get_queryset(self):
        return Company.objects.filter(tenant=self.request.user.tenant)


class TenantInvitationListView(generics.ListCreateAPIView):
    """List and create tenant invitations"""
    serializer_class = TenantInvitationSerializer
    permission_classes = [IsTenantAdmin]
    
    def get_queryset(self):
        return TenantInvitation.objects.filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            invited_by=self.request.user
        )


class TenantInvitationDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve and delete tenant invitation"""
    serializer_class = TenantInvitationSerializer
    permission_classes = [IsTenantAdmin]
    
    def get_queryset(self):
        return TenantInvitation.objects.filter(tenant=self.request.user.tenant)


@api_view(['GET'])
@permission_classes([IsTenantMember])
def tenant_dashboard(request):
    """Get tenant dashboard data"""
    tenant = request.user.tenant
    if not tenant:
        return Response({'error': 'No tenant associated'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get basic tenant info
    tenant_data = TenantStatsSerializer(tenant).data
    
    # Get recent companies
    recent_companies = Company.objects.filter(tenant=tenant, is_active=True)[:5]
    companies_data = CompanySerializer(recent_companies, many=True).data
    
    # Get pending invitations
    pending_invitations = TenantInvitation.objects.filter(
        tenant=tenant, 
        is_accepted=False
    )[:5]
    invitations_data = TenantInvitationSerializer(pending_invitations, many=True).data
    
    return Response({
        'tenant': tenant_data,
        'recent_companies': companies_data,
        'pending_invitations': invitations_data,
    })


@api_view(['POST'])
@permission_classes([IsTenantAdmin])
def upgrade_tenant_plan(request, tenant_id):
    """Upgrade tenant plan"""
    tenant = get_object_or_404(Tenant, id=tenant_id)
    
    # Check if user has permission to upgrade this tenant
    if request.user.role != 'platform_admin' and request.user.tenant != tenant:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    new_plan = request.data.get('plan')
    if new_plan not in ['basic', 'professional', 'enterprise']:
        return Response({'error': 'Invalid plan'}, status=status.HTTP_400_BAD_REQUEST)
    
    tenant.plan = new_plan
    tenant.save()
    
    return Response({
        'message': f'Tenant plan upgraded to {new_plan}',
        'tenant': TenantSerializer(tenant).data
    })


@api_view(['POST'])
@permission_classes([IsTenantAdmin])
def deactivate_tenant(request, tenant_id):
    """Deactivate tenant"""
    tenant = get_object_or_404(Tenant, id=tenant_id)
    
    # Check if user has permission to deactivate this tenant
    if request.user.role != 'platform_admin' and request.user.tenant != tenant:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    tenant.is_active = False
    tenant.save()
    
    return Response({
        'message': 'Tenant deactivated successfully',
        'tenant': TenantSerializer(tenant).data
    })


@api_view(['GET'])
@permission_classes([IsTenantMember])
def search_companies(request):
    """Search companies within tenant"""
    query = request.query_params.get('q', '')
    tenant = request.user.tenant
    
    companies = Company.objects.filter(
        Q(name__icontains=query) | 
        Q(legal_name__icontains=query) |
        Q(email__icontains=query),
        tenant=tenant
    )
    
    serializer = CompanySerializer(companies, many=True)
    return Response(serializer.data)
