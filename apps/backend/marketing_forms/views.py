from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import BetaProgramApplication, EarlyAccessRequest, FounderFeedback
from .serializers import (
    BetaProgramApplicationCreateSerializer,
    EarlyAccessRequestCreateSerializer,
    FounderFeedbackCreateSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_beta_program_application(request):
    """Submit a beta program application"""
    try:
        serializer = BetaProgramApplicationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            application = serializer.save()
            
            # Here you could add email notifications, etc.
            # send_beta_application_notification(application)
            
            return Response({
                'success': True,
                'message': 'Beta program application submitted successfully',
                'application_id': str(application.id)
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Invalid form data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred while submitting the application',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_early_access_request(request):
    """Submit an early access request"""
    try:
        serializer = EarlyAccessRequestCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            early_access_request = serializer.save()
            
            # Here you could add email notifications, etc.
            # send_early_access_notification(early_access_request)
            
            return Response({
                'success': True,
                'message': 'Early access request submitted successfully',
                'request_id': str(early_access_request.id)
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Invalid form data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred while submitting the request',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_founder_feedback(request):
    """Submit founder feedback"""
    try:
        serializer = FounderFeedbackCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            feedback = serializer.save()
            
            # Here you could add email notifications, etc.
            # send_founder_feedback_notification(feedback)
            
            return Response({
                'success': True,
                'message': 'Founder feedback submitted successfully',
                'feedback_id': str(feedback.id)
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Invalid form data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred while submitting the feedback',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def marketing_forms_stats(request):
    """Get statistics for marketing forms (public endpoint)"""
    try:
        stats = {
            'beta_applications': {
                'total': BetaProgramApplication.objects.filter(is_active=True).count(),
                'pending': BetaProgramApplication.objects.filter(status='pending', is_active=True).count(),
                'approved': BetaProgramApplication.objects.filter(status='approved', is_active=True).count(),
            },
            'early_access_requests': {
                'total': EarlyAccessRequest.objects.filter(is_active=True).count(),
                'pending': EarlyAccessRequest.objects.filter(status='pending', is_active=True).count(),
                'approved': EarlyAccessRequest.objects.filter(status='approved', is_active=True).count(),
            },
            'founder_feedback': {
                'total': FounderFeedback.objects.filter(is_active=True).count(),
                'new': FounderFeedback.objects.filter(status='new', is_active=True).count(),
                'responded': FounderFeedback.objects.filter(status='responded', is_active=True).count(),
            }
        }
        
        return Response({
            'success': True,
            'stats': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred while fetching statistics',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)