from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta
import json

from .models import Document, AICategorization, AIExtractionResult, AIProcessingJob, AIModel, AIProcessingLog
from .serializers import (
    DocumentSerializer, AICategorizationSerializer, AIExtractionResultSerializer,
    AIProcessingJobSerializer, AIModelSerializer, AIProcessingLogSerializer,
    DocumentUploadSerializer, DocumentProcessingRequestSerializer,
    AIProcessingStatsSerializer, DocumentSearchResultSerializer
)
from authentication.permissions import IsAccountant, IsTenantMember


class DocumentListView(generics.ListCreateAPIView):
    """List and create documents"""
    serializer_class = DocumentSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Document.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-upload_date')
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            uploaded_by=self.request.user
        )


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete document"""
    serializer_class = DocumentSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Document.objects.filter(tenant=self.request.user.tenant)


class AICategorizationListView(generics.ListCreateAPIView):
    """List and create AI categorizations"""
    serializer_class = AICategorizationSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AICategorization.objects.filter(
            document__tenant=self.request.user.tenant
        ).order_by('-processing_date')


class AICategorizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete AI categorization"""
    serializer_class = AICategorizationSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AICategorization.objects.filter(document__tenant=self.request.user.tenant)


class AIExtractionResultListView(generics.ListCreateAPIView):
    """List and create AI extraction results"""
    serializer_class = AIExtractionResultSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AIExtractionResult.objects.filter(
            document__tenant=self.request.user.tenant
        ).order_by('-processing_date')


class AIExtractionResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete AI extraction result"""
    serializer_class = AIExtractionResultSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AIExtractionResult.objects.filter(document__tenant=self.request.user.tenant)


class AIProcessingJobListView(generics.ListCreateAPIView):
    """List and create AI processing jobs"""
    serializer_class = AIProcessingJobSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AIProcessingJob.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class AIProcessingJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete AI processing job"""
    serializer_class = AIProcessingJobSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AIProcessingJob.objects.filter(tenant=self.request.user.tenant)


class AIModelListView(generics.ListCreateAPIView):
    """List and create AI models"""
    serializer_class = AIModelSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AIModel.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        serializer.save()


class AIModelDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete AI model"""
    serializer_class = AIModelSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return AIModel.objects.all()


@api_view(['POST'])
@permission_classes([IsAccountant])
def upload_document(request):
    """Upload and process a document"""
    serializer = DocumentUploadSerializer(data=request.data)
    if serializer.is_valid():
        # Here you would implement actual file upload logic
        # For now, we'll create a mock document
        document = Document.objects.create(
            tenant=request.user.tenant,
            file_name=serializer.validated_data['file'].name,
            file_path=f"/uploads/{serializer.validated_data['file'].name}",
            file_type=serializer.validated_data['file'].name.split('.')[-1],
            file_size=serializer.validated_data['file'].size,
            uploaded_by=request.user,
            upload_date=timezone.now().date(),
            processing_status='pending',
            notes=serializer.validated_data.get('notes', '')
        )
        
        # Create processing job
        job = AIProcessingJob.objects.create(
            tenant=request.user.tenant,
            job_type='document_categorization',
            status='pending',
            parameters={'document_id': str(document.id)},
            created_by=request.user
        )
        
        # Simulate AI processing
        # In a real implementation, this would be handled by a background task
        document.processing_status = 'processing'
        document.save()
        
        job.status = 'processing'
        job.started_at = timezone.now()
        job.save()
        
        # Simulate processing completion
        document.processing_status = 'completed'
        document.processing_date = timezone.now()
        document.confidence_score = Decimal('0.85')
        document.save()
        
        job.status = 'completed'
        job.completed_at = timezone.now()
        job.results = {
            'category': 'invoice',
            'confidence': 0.85,
            'extracted_data': {
                'invoice_number': 'INV-001',
                'amount': '1000.00',
                'date': '2025-08-29'
            }
        }
        job.save()
        
        return Response({
            'message': 'Document uploaded and processed successfully',
            'document': DocumentSerializer(document).data,
            'job': AIProcessingJobSerializer(job).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAccountant])
def process_document(request):
    """Process an existing document"""
    serializer = DocumentProcessingRequestSerializer(data=request.data)
    if serializer.is_valid():
        document = get_object_or_404(
            Document,
            id=serializer.validated_data['document_id'],
            tenant=request.user.tenant
        )
        
        processing_type = serializer.validated_data['processing_type']
        
        # Create processing job
        job = AIProcessingJob.objects.create(
            tenant=request.user.tenant,
            job_type='document_processing',
            status='processing',
            input_data={
                'document_id': str(document.id),
                'processing_type': processing_type,
                'extraction_fields': serializer.validated_data.get('extraction_fields', [])
            },
            started_at=timezone.now()
        )
        
        # Simulate AI processing
        document.processing_status = 'processing'
        document.save()
        
        # Simulate processing completion
        document.processing_status = 'completed'
        document.processing_date = timezone.now()
        document.confidence_score = Decimal('0.90')
        document.save()
        
        job.status = 'completed'
        job.completed_at = timezone.now()
        job.processing_time_seconds = 45
        job.output_data = {
            'category': 'invoice',
            'confidence': 0.90,
            'extracted_data': {
                'invoice_number': 'INV-002',
                'amount': '1500.00',
                'date': '2025-08-29'
            }
        }
        job.save()
        
        return Response({
            'message': 'Document processed successfully',
            'document': DocumentSerializer(document).data,
            'job': AIProcessingJobSerializer(job).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAccountant])
def ai_processing_stats(request):
    """Get AI processing statistics"""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        # Default to current month
        today = date.today()
        start_date = today.replace(day=1)
        end_date = today
    else:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    documents = Document.objects.filter(
        tenant=request.user.tenant,
        upload_date__range=[start_date, end_date]
    )
    
    total_documents = documents.count()
    processed_documents = documents.filter(processing_status='completed').count()
    processing_success_rate = (processed_documents / total_documents * 100) if total_documents > 0 else 0
    
    avg_confidence = documents.filter(
        processing_status='completed'
    ).aggregate(avg_confidence=Avg('confidence_score'))['avg_confidence'] or 0
    
    total_processing_time = AIProcessingJob.objects.filter(
        tenant=request.user.tenant,
        status='completed',
        started_at__date__range=[start_date, end_date]
    ).aggregate(total_time=Sum('processing_time_seconds'))['total_time'] or 0
    
    data = {
        'total_documents': total_documents,
        'processed_documents': processed_documents,
        'processing_success_rate': processing_success_rate,
        'average_confidence_score': avg_confidence,
        'total_processing_time': total_processing_time,
        'period_start': start_date,
        'period_end': end_date
    }
    
    serializer = AIProcessingStatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def search_documents(request):
    """Search documents using AI"""
    query = request.query_params.get('q', '')
    
    if not query:
        return Response(
            {'error': 'Search query is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Simulate AI-powered document search
    # In a real implementation, this would use vector search or semantic search
    documents = Document.objects.filter(
        Q(file_name__icontains=query) |
        Q(notes__icontains=query),
        tenant=request.user.tenant,
        processing_status='completed'
    ).order_by('-confidence_score')
    
    search_results = []
    for document in documents:
        # Simulate relevance score
        relevance_score = Decimal('0.85') if query.lower() in document.file_name.lower() else Decimal('0.65')
        
        search_results.append({
            'document_id': document.id,
            'file_name': document.file_name,
            'file_type': document.file_type,
            'category': 'invoice',  # This would come from AI categorization
            'confidence_score': document.confidence_score,
            'upload_date': document.upload_date,
            'relevance_score': relevance_score
        })
    
    serializer = DocumentSearchResultSerializer(search_results, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def document_categorization(request, document_id):
    """Get AI categorization for a document"""
    document = get_object_or_404(
        Document,
        id=document_id,
        tenant=request.user.tenant
    )
    
    categorization = AICategorization.objects.filter(document=document).first()
    
    if categorization:
        serializer = AICategorizationSerializer(categorization)
        return Response(serializer.data)
    else:
        return Response(
            {'error': 'No categorization found for this document'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAccountant])
def document_extraction(request, document_id):
    """Get AI extraction results for a document"""
    document = get_object_or_404(
        Document,
        id=document_id,
        tenant=request.user.tenant
    )
    
    extraction_results = AIExtractionResult.objects.filter(document=document)
    
    if extraction_results.exists():
        serializer = AIExtractionResultSerializer(extraction_results, many=True)
        return Response(serializer.data)
    else:
        return Response(
            {'error': 'No extraction results found for this document'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAccountant])
def retrain_model(request, model_id):
    """Retrain an AI model"""
    model = get_object_or_404(
        AIModel,
        id=model_id,
        tenant=request.user.tenant
    )
    
    # Create retraining job
    job = AIProcessingJob.objects.create(
        tenant=request.user.tenant,
        job_type='model_retraining',
        status='processing',
        input_data={'model_id': str(model.id)},
        started_at=timezone.now()
    )
    
    # Simulate retraining process
    # In a real implementation, this would trigger actual model retraining
    job.status = 'completed'
    job.completed_at = timezone.now()
    job.processing_time_seconds = 3600  # 1 hour
    job.output_data = {
        'accuracy_improvement': 0.05,
        'new_accuracy': 0.92
    }
    job.save()
    
    # Update model accuracy
    model.accuracy_score = Decimal('0.92')
    model.last_updated = timezone.now()
    model.save()
    
    return Response({
        'message': 'Model retraining completed successfully',
        'model': AIModelSerializer(model).data,
        'job': AIProcessingJobSerializer(job).data
    })
