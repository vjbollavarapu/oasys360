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
from tenants.models import Company
from .client import ai_engine_client
import logging

logger = logging.getLogger(__name__)


class DocumentListView(generics.ListCreateAPIView):
    """List and create documents"""
    serializer_class = DocumentSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Document.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-created_at')
    
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
        ).order_by('-created_at')


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
        ).order_by('-created_at')


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
        # Get the user's company (primary company or first company associated with tenant)
        company = Company.objects.filter(
            tenant=request.user.tenant,
            is_active=True
        ).order_by('-is_primary').first()
        
        if not company:
            return Response(
                {'error': 'No active company found for this tenant. Please create a company first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = serializer.validated_data['file']
        document = Document.objects.create(
            tenant=request.user.tenant,
            company=company,
            filename=file.name,
            original_filename=file.name,
            file_path=f"/uploads/{file.name}",
            file_type=file.name.split('.')[-1] if '.' in file.name else '',
            file_size=file.size,
            mime_type=getattr(file, 'content_type', '') or '',
            status='pending',
            uploaded_by=request.user
        )
        
        # Create processing job in Django
        job = AIProcessingJob.objects.create(
            tenant=request.user.tenant,
            job_type='document_categorization',
            status='pending',
            parameters={'document_id': str(document.id)},
            created_by=request.user
        )
        
        # Call AI Engine service for categorization
        try:
            document.status = 'processing'
            document.save()
            
            job.status = 'processing'
            job.started_at = timezone.now()
            job.save()
            
            # Get file URL or construct it from document
            file_url = f"/api/v1/ai_processing/documents/{document.id}/file"  # Adjust based on your file serving setup
            
            # Call AI Engine
            ai_result = ai_engine_client.categorize_document(
                document_id=str(document.id),
                tenant_id=str(request.user.tenant.id),
                file_url=file_url,
                mime_type=document.mime_type,
                async_mode=False
            )
            
            # Save categorization result
            categorization = AICategorization.objects.create(
                document=document,
                category=ai_result.get('category', 'unknown'),
                confidence=float(ai_result.get('confidence', 0.0)),
                ai_model=ai_result.get('ai_model', 'unknown'),
                model_version=ai_result.get('model_version'),
                processing_time=ai_result.get('processing_time'),
                raw_response=ai_result.get('raw_response')
            )
            
            document.status = 'completed'
            document.processed_at = timezone.now()
            document.confidence_score = Decimal(str(ai_result.get('confidence', 0.0)))
            document.document_type = ai_result.get('category', 'other')
            document.save()
            
            job.status = 'completed'
            job.completed_at = timezone.now()
            job.results = ai_result
            job.save()
            
        except Exception as e:
            logger.error(f"AI processing failed: {e}", exc_info=True)
            document.status = 'failed'
            document.processing_errors = str(e)
            document.save()
            
            job.status = 'failed'
            job.error_message = str(e)
            job.completed_at = timezone.now()
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
        extraction_fields = serializer.validated_data.get('extraction_fields', [])
        
        # Create processing job
        job = AIProcessingJob.objects.create(
            tenant=request.user.tenant,
            job_type='data_extraction' if processing_type == 'extraction' else 'document_categorization',
            status='pending',
            parameters={
                'document_id': str(document.id),
                'processing_type': processing_type,
                'extraction_fields': extraction_fields
            },
            created_by=request.user
        )
        
        try:
            document.status = 'processing'
            document.save()
            
            job.status = 'processing'
            job.started_at = timezone.now()
            job.save()
            
            file_url = f"/api/v1/ai_processing/documents/{document.id}/file"  # Adjust based on your file serving setup
            
            results = {}
            
            # Process based on type
            if processing_type in ['categorization', 'both']:
                # Categorize document
                cat_result = ai_engine_client.categorize_document(
                    document_id=str(document.id),
                    tenant_id=str(request.user.tenant.id),
                    file_url=file_url,
                    mime_type=document.mime_type,
                    async_mode=False
                )
                
                categorization = AICategorization.objects.create(
                    document=document,
                    category=cat_result.get('category', 'unknown'),
                    confidence=float(cat_result.get('confidence', 0.0)),
                    ai_model=cat_result.get('ai_model', 'unknown'),
                    model_version=cat_result.get('model_version'),
                    processing_time=cat_result.get('processing_time'),
                    raw_response=cat_result.get('raw_response')
                )
                
                document.document_type = cat_result.get('category', 'other')
                results['categorization'] = cat_result
            
            if processing_type in ['extraction', 'both']:
                # Extract data
                ext_result = ai_engine_client.extract_data(
                    document_id=str(document.id),
                    tenant_id=str(request.user.tenant.id),
                    fields=extraction_fields or ['invoice_number', 'amount', 'date'],
                    file_url=file_url,
                    mime_type=document.mime_type,
                    async_mode=False
                )
                
                # Save extraction results
                for ext_item in ext_result.get('results', []):
                    AIExtractionResult.objects.create(
                        document=document,
                        field_name=ext_item.get('field_name'),
                        field_value=str(ext_item.get('field_value', '')),
                        confidence=float(ext_item.get('confidence', 0.0)),
                        bounding_box=ext_item.get('bounding_box'),
                        ai_model=ext_item.get('ai_model', 'unknown'),
                        model_version=ext_item.get('model_version')
                    )
                
                document.extracted_data = ext_result.get('extracted_data', {})
                results['extraction'] = ext_result
            
            document.status = 'completed'
            document.processed_at = timezone.now()
            document.confidence_score = Decimal(str(results.get('categorization', {}).get('confidence', 0.9) if 'categorization' in results else 0.9))
            document.save()
            
            job.status = 'completed'
            job.completed_at = timezone.now()
            job.results = results
            job.save()
            
        except Exception as e:
            logger.error(f"AI processing failed: {e}", exc_info=True)
            document.status = 'failed'
            document.processing_errors = str(e)
            document.save()
            
            job.status = 'failed'
            job.error_message = str(e)
            job.completed_at = timezone.now()
            job.save()
            
            return Response({
                'error': 'Document processing failed',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
        created_at__date__range=[start_date, end_date]
    )
    
    total_documents = documents.count()
    processed_documents = documents.filter(status='completed').count()
    processing_success_rate = (processed_documents / total_documents * 100) if total_documents > 0 else 0
    
    avg_confidence = documents.filter(
        status='completed'
    ).aggregate(avg_confidence=Avg('confidence_score'))['avg_confidence'] or 0
    
    # Calculate total processing time from job start/end times
    completed_jobs = AIProcessingJob.objects.filter(
        tenant=request.user.tenant,
        status='completed',
        started_at__date__range=[start_date, end_date]
    )
    
    total_processing_time = 0
    for job in completed_jobs:
        processing_time = job.get_processing_time()
        if processing_time:
            total_processing_time += processing_time
    
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
        Q(filename__icontains=query) |
        Q(original_filename__icontains=query),
        tenant=request.user.tenant,
        status='completed'
    ).order_by('-confidence_score')
    
    search_results = []
    for document in documents:
        # Simulate relevance score
        relevance_score = Decimal('0.85') if query.lower() in document.filename.lower() else Decimal('0.65')
        
        search_results.append({
            'document_id': document.id,
            'file_name': document.filename,
            'file_type': document.file_type,
            'category': document.document_type or 'other',  # Use actual document type
            'confidence_score': document.confidence_score,
            'upload_date': document.created_at.date(),
            'relevance_score': relevance_score
        })
    
    serializer = DocumentSearchResultSerializer(search_results, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAccountant])
def document_categorization(request, document_id):
    """Get or trigger AI categorization for a document"""
    document = get_object_or_404(
        Document,
        id=document_id,
        tenant=request.user.tenant
    )
    
    if request.method == 'POST':
        # Trigger categorization via AI Engine
        try:
            file_url = f"/api/v1/ai_processing/documents/{document.id}/file"
            
            ai_result = ai_engine_client.categorize_document(
                document_id=str(document.id),
                tenant_id=str(request.user.tenant.id),
                file_url=file_url,
                mime_type=document.mime_type,
                async_mode=False
            )
            
            # Save or update categorization
            categorization, created = AICategorization.objects.update_or_create(
                document=document,
                defaults={
                    'category': ai_result.get('category', 'unknown'),
                    'confidence': float(ai_result.get('confidence', 0.0)),
                    'ai_model': ai_result.get('ai_model', 'unknown'),
                    'model_version': ai_result.get('model_version'),
                    'processing_time': ai_result.get('processing_time'),
                    'raw_response': ai_result.get('raw_response')
                }
            )
            
            serializer = AICategorizationSerializer(categorization)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Categorization failed: {e}", exc_info=True)
            return Response(
                {'error': 'Categorization failed', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # GET - return existing categorization
    categorization = AICategorization.objects.filter(document=document).first()
    
    if categorization:
        serializer = AICategorizationSerializer(categorization)
        return Response(serializer.data)
    else:
        return Response(
            {'error': 'No categorization found for this document'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAccountant])
def document_extraction(request, document_id):
    """Get or trigger AI extraction results for a document"""
    document = get_object_or_404(
        Document,
        id=document_id,
        tenant=request.user.tenant
    )
    
    if request.method == 'POST':
        # Trigger extraction via AI Engine
        try:
            fields = request.data.get('fields', ['invoice_number', 'amount', 'date'])
            file_url = f"/api/v1/ai_processing/documents/{document.id}/file"
            
            ai_result = ai_engine_client.extract_data(
                document_id=str(document.id),
                tenant_id=str(request.user.tenant.id),
                fields=fields,
                file_url=file_url,
                mime_type=document.mime_type,
                async_mode=False
            )
            
            # Clear existing results and save new ones
            AIExtractionResult.objects.filter(document=document).delete()
            
            for ext_item in ai_result.get('results', []):
                AIExtractionResult.objects.create(
                    document=document,
                    field_name=ext_item.get('field_name'),
                    field_value=str(ext_item.get('field_value', '')),
                    confidence=float(ext_item.get('confidence', 0.0)),
                    bounding_box=ext_item.get('bounding_box'),
                    ai_model=ext_item.get('ai_model', 'unknown'),
                    model_version=ext_item.get('model_version')
                )
            
            document.extracted_data = ai_result.get('extracted_data', {})
            document.save()
            
            extraction_results = AIExtractionResult.objects.filter(document=document)
            serializer = AIExtractionResultSerializer(extraction_results, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Extraction failed: {e}", exc_info=True)
            return Response(
                {'error': 'Extraction failed', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # GET - return existing extraction results
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
        is_active=True
    )
    
    # Create retraining job
    job = AIProcessingJob.objects.create(
        tenant=request.user.tenant,
        job_type='fraud_detection',  # Using closest available job type
        status='pending',
        parameters={'model_id': str(model.id), 'action': 'retrain'},
        created_by=request.user
    )
    
    # Note: In a real implementation, this would trigger actual model retraining
    # via AI Engine service or background task
    # For now, return the job for async processing
    return Response({
        'message': 'Model retraining job created',
        'job': AIProcessingJobSerializer(job).data,
        'note': 'Model retraining will be processed asynchronously'
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsAccountant])
def detect_fraud(request):
    """Detect fraud in a transaction or document"""
    try:
        document_id = request.data.get('document_id')
        data = request.data.get('data', {})
        transaction_amount = request.data.get('transaction_amount')
        transaction_type = request.data.get('transaction_type')
        metadata = request.data.get('metadata')
        async_mode = request.data.get('async_mode', False)
        
        if not document_id:
            return Response(
                {'error': 'document_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call AI Engine service
        result = ai_engine_client.detect_fraud(
            document_id=str(document_id),
            tenant_id=str(request.user.tenant.id),
            data=data,
            transaction_amount=transaction_amount,
            transaction_type=transaction_type,
            metadata=metadata,
            async_mode=async_mode
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Fraud detection failed: {e}", exc_info=True)
        return Response(
            {'error': 'Fraud detection failed', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAccountant])
def forecast_financials(request):
    """Generate financial forecasts"""
    try:
        forecast_type = request.data.get('forecast_type')
        time_period = request.data.get('time_period')
        periods = request.data.get('periods', 12)
        historical_data = request.data.get('historical_data')
        model_type = request.data.get('model_type')
        parameters = request.data.get('parameters')
        
        if not forecast_type or not time_period:
            return Response(
                {'error': 'forecast_type and time_period are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call AI Engine service
        result = ai_engine_client.forecast_financials(
            tenant_id=str(request.user.tenant.id),
            forecast_type=forecast_type,
            time_period=time_period,
            periods=periods,
            historical_data=historical_data,
            model_type=model_type,
            parameters=parameters
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Forecasting failed: {e}", exc_info=True)
        return Response(
            {'error': 'Forecasting failed', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAccountant])
def get_forecasting_models(request):
    """Get available forecasting models"""
    try:
        result = ai_engine_client.get_forecasting_models(
            tenant_id=str(request.user.tenant.id)
        )
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Failed to get forecasting models: {e}", exc_info=True)
        return Response(
            {'error': 'Failed to get forecasting models', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAccountant])
def ai_settings(request):
    """Get or update AI Engine settings"""
    try:
        tenant_id = str(request.user.tenant.id)
        
        if request.method == 'GET':
            result = ai_engine_client.get_settings(tenant_id)
            return Response(result, status=status.HTTP_200_OK)
        
        elif request.method == 'PUT':
            settings_data = request.data.get('settings', request.data)
            result = ai_engine_client.update_settings(tenant_id, settings_data)
            return Response(result, status=status.HTTP_200_OK)
        
        elif request.method == 'PATCH':
            settings_data = request.data.get('settings', request.data)
            result = ai_engine_client.patch_settings(tenant_id, settings_data)
            return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Settings operation failed: {e}", exc_info=True)
        return Response(
            {'error': 'Settings operation failed', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
