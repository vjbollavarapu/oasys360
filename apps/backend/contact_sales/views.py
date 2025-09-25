from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
import logging

from .models import SalesInquiry, SalesInquiryResponse, SalesInquiryAttachment
from .serializers import (
    SalesInquirySerializer, SalesInquiryCreateSerializer, SalesInquiryUpdateSerializer,
    SalesInquirySummarySerializer, SalesInquiryStatsSerializer, SalesInquiryResponseSerializer,
    SalesInquiryResponseCreateSerializer, ContactSalesFormSerializer
)
from authentication.permissions import IsAccountant, IsTenantMember

logger = logging.getLogger(__name__)


class SalesInquiryListView(generics.ListCreateAPIView):
    """List and create sales inquiries (admin endpoint)"""
    serializer_class = SalesInquirySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        queryset = SalesInquiry.objects.filter(tenant=self.request.user.tenant)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by inquiry type
        inquiry_type = self.request.query_params.get('inquiry_type')
        if inquiry_type:
            queryset = queryset.filter(inquiry_type=inquiry_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(company__icontains=search) |
                Q(email__icontains=search) |
                Q(subject__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class SalesInquiryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete sales inquiry"""
    serializer_class = SalesInquirySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return SalesInquiry.objects.filter(tenant=self.request.user.tenant)


class SalesInquirySummaryView(generics.ListAPIView):
    """Get summary of sales inquiries for dashboard"""
    serializer_class = SalesInquirySummarySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return SalesInquiry.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('-created_at')[:50]


# Public endpoint for contact sales form (no authentication required)
@api_view(['POST'])
@permission_classes([])  # No authentication required
def contact_sales_submit(request):
    """Submit a contact sales form (public endpoint)"""
    serializer = ContactSalesFormSerializer(data=request.data)
    
    if serializer.is_valid():
        # Create sales inquiry
        inquiry_data = serializer.validated_data
        inquiry_data['tenant'] = request.tenant if hasattr(request, 'tenant') else None
        inquiry_data['source'] = 'website'
        
        inquiry = SalesInquiry.objects.create(**inquiry_data)
        
        # Send notification email to sales team
        try:
            send_mail(
                subject=f'New Sales Inquiry: {inquiry.subject}',
                message=f"""
                New sales inquiry received:
                
                Name: {inquiry.full_name}
                Company: {inquiry.company}
                Email: {inquiry.email}
                Phone: {inquiry.phone or 'Not provided'}
                Inquiry Type: {inquiry.get_inquiry_type_display()}
                Subject: {inquiry.subject}
                
                Message:
                {inquiry.message}
                
                Company Size: {inquiry.company_size or 'Not specified'}
                Industry: {inquiry.industry or 'Not specified'}
                
                Please respond within 24 hours.
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.SALES_EMAIL] if hasattr(settings, 'SALES_EMAIL') else [settings.DEFAULT_FROM_EMAIL],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send sales inquiry notification email: {e}")
        
        return Response({
            'message': 'Thank you for your inquiry! We will contact you within 24 hours.',
            'inquiry_id': str(inquiry.id)
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAccountant])
def mark_inquiry_contacted(request, pk):
    """Mark a sales inquiry as contacted"""
    inquiry = get_object_or_404(
        SalesInquiry,
        id=pk,
        tenant=request.user.tenant
    )
    
    inquiry.mark_contacted()
    
    return Response({
        'message': 'Inquiry marked as contacted successfully',
        'inquiry': SalesInquirySerializer(inquiry).data
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def search_inquiries(request):
    """Search sales inquiries"""
    query = request.query_params.get('q', '')
    
    if not query:
        return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    inquiries = SalesInquiry.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(company__icontains=query) |
        Q(email__icontains=query) |
        Q(subject__icontains=query) |
        Q(message__icontains=query),
        tenant=request.user.tenant,
        is_active=True
    ).order_by('-created_at')
    
    serializer = SalesInquirySummarySerializer(inquiries, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def my_assigned_inquiries(request):
    """Get inquiries assigned to the current user"""
    inquiries = SalesInquiry.objects.filter(
        assigned_to=request.user,
        tenant=request.user.tenant,
        is_active=True
    ).order_by('-created_at')
    
    serializer = SalesInquirySummarySerializer(inquiries, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def recent_inquiries(request):
    """Get recent inquiries (last 7 days)"""
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    inquiries = SalesInquiry.objects.filter(
        tenant=request.user.tenant,
        created_at__gte=seven_days_ago,
        is_active=True
    ).order_by('-created_at')
    
    serializer = SalesInquirySummarySerializer(inquiries, many=True)
    return Response(serializer.data)


class SalesInquiryStatsView(APIView):
    """Get sales inquiry statistics"""
    permission_classes = [IsAccountant]
    
    def get(self, request):
        tenant = request.user.tenant
        now = timezone.now()
        
        # Basic counts
        total_inquiries = SalesInquiry.objects.filter(tenant=tenant).count()
        new_inquiries = SalesInquiry.objects.filter(tenant=tenant, status='new').count()
        contacted_inquiries = SalesInquiry.objects.filter(tenant=tenant, status='contacted').count()
        qualified_inquiries = SalesInquiry.objects.filter(tenant=tenant, status='qualified').count()
        closed_won = SalesInquiry.objects.filter(tenant=tenant, status='closed_won').count()
        closed_lost = SalesInquiry.objects.filter(tenant=tenant, status='closed_lost').count()
        
        # Conversion rate
        total_closed = closed_won + closed_lost
        conversion_rate = (closed_won / total_closed * 100) if total_closed > 0 else 0
        
        # Response time (average hours to first contact)
        contacted_inquiries_with_time = SalesInquiry.objects.filter(
            tenant=tenant,
            status__in=['contacted', 'qualified', 'demo_scheduled', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost']
        ).exclude(contacted_at__isnull=True)
        
        avg_response_time_hours = 0
        if contacted_inquiries_with_time.exists():
            total_hours = 0
            count = 0
            for inquiry in contacted_inquiries_with_time:
                delta = inquiry.contacted_at - inquiry.created_at
                total_hours += delta.total_seconds() / 3600
                count += 1
            avg_response_time_hours = total_hours / count if count > 0 else 0
        
        # By inquiry type
        demo_requests = SalesInquiry.objects.filter(tenant=tenant, inquiry_type='demo').count()
        pricing_requests = SalesInquiry.objects.filter(tenant=tenant, inquiry_type='pricing').count()
        enterprise_requests = SalesInquiry.objects.filter(tenant=tenant, inquiry_type='enterprise').count()
        
        # By priority
        high_priority = SalesInquiry.objects.filter(tenant=tenant, priority='high').count()
        urgent_priority = SalesInquiry.objects.filter(tenant=tenant, priority='urgent').count()
        
        # By time period
        this_week = SalesInquiry.objects.filter(
            tenant=tenant,
            created_at__gte=now - timedelta(days=7)
        ).count()
        
        this_month = SalesInquiry.objects.filter(
            tenant=tenant,
            created_at__gte=now.replace(day=1)
        ).count()
        
        last_month = SalesInquiry.objects.filter(
            tenant=tenant,
            created_at__gte=(now.replace(day=1) - timedelta(days=1)).replace(day=1),
            created_at__lt=now.replace(day=1)
        ).count()
        
        stats_data = {
            'total_inquiries': total_inquiries,
            'new_inquiries': new_inquiries,
            'contacted_inquiries': contacted_inquiries,
            'qualified_inquiries': qualified_inquiries,
            'closed_won': closed_won,
            'closed_lost': closed_lost,
            'conversion_rate': round(conversion_rate, 2),
            'avg_response_time_hours': round(avg_response_time_hours, 2),
            'demo_requests': demo_requests,
            'pricing_requests': pricing_requests,
            'enterprise_requests': enterprise_requests,
            'high_priority': high_priority,
            'urgent_priority': urgent_priority,
            'this_week': this_week,
            'this_month': this_month,
            'last_month': last_month,
        }
        
        serializer = SalesInquiryStatsSerializer(stats_data)
        return Response(serializer.data)


class SalesInquiryResponseView(generics.ListCreateAPIView):
    """List and create responses for a sales inquiry"""
    serializer_class = SalesInquiryResponseSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        inquiry_id = self.kwargs.get('inquiry_id')
        return SalesInquiryResponse.objects.filter(
            inquiry_id=inquiry_id,
            inquiry__tenant=self.request.user.tenant
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        inquiry_id = self.kwargs.get('inquiry_id')
        inquiry = get_object_or_404(
            SalesInquiry,
            id=inquiry_id,
            tenant=self.request.user.tenant
        )
        serializer.save(inquiry=inquiry, responded_by=self.request.user)


@api_view(['POST'])
@permission_classes([IsAccountant])
def assign_inquiry(request, pk):
    """Assign a sales inquiry to a user"""
    inquiry = get_object_or_404(
        SalesInquiry,
        id=pk,
        tenant=request.user.tenant
    )
    
    assigned_to_id = request.data.get('assigned_to_id')
    if not assigned_to_id:
        return Response(
            {'error': 'assigned_to_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        assigned_to = request.user.tenant.users.get(id=assigned_to_id)
        inquiry.assigned_to = assigned_to
        inquiry.save()
        
        return Response({
            'message': 'Inquiry assigned successfully',
            'inquiry': SalesInquirySerializer(inquiry).data
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
