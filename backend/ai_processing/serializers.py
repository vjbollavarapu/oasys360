from rest_framework import serializers
from .models import Document, AICategorization, AIExtractionResult, AIProcessingJob, AIModel, AIProcessingLog


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document"""
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'tenant', 'company', 'filename', 'original_filename', 'file_path', 'file_type',
            'file_size', 'file_size_mb', 'mime_type', 'status', 'document_type',
            'extracted_data', 'confidence_score', 'processing_errors', 'uploaded_by',
            'processed_by', 'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0


class AICategorizationSerializer(serializers.ModelSerializer):
    """Serializer for AI Categorization"""
    document_name = serializers.CharField(source='document.original_filename', read_only=True)
    
    class Meta:
        model = AICategorization
        fields = [
            'id', 'document', 'document_name', 'category', 'confidence',
            'ai_model', 'model_version', 'processing_time', 'raw_response', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIExtractionResultSerializer(serializers.ModelSerializer):
    """Serializer for AI Extraction Result"""
    document_name = serializers.CharField(source='document.original_filename', read_only=True)
    
    class Meta:
        model = AIExtractionResult
        fields = [
            'id', 'document', 'document_name', 'field_name', 'field_value', 'confidence',
            'bounding_box', 'ai_model', 'model_version', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIProcessingJobSerializer(serializers.ModelSerializer):
    """Serializer for AI Processing Job"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    processing_time_seconds = serializers.SerializerMethodField()
    
    def get_processing_time_seconds(self, obj):
        return obj.get_processing_time()
    
    class Meta:
        model = AIProcessingJob
        fields = [
            'id', 'tenant', 'job_type', 'job_type_display', 'status', 'status_display',
            'priority', 'documents', 'parameters', 'results', 'error_message', 
            'started_at', 'completed_at', 'processing_time_seconds', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIModelSerializer(serializers.ModelSerializer):
    """Serializer for AI Model"""
    class Meta:
        model = AIModel
        fields = [
            'id', 'name', 'version', 'model_type', 'provider', 'model_id',
            'is_active', 'is_default', 'configuration', 'performance_metrics',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIProcessingLogSerializer(serializers.ModelSerializer):
    """Serializer for AI Processing Log"""
    class Meta:
        model = AIProcessingLog
        fields = [
            'id', 'tenant', 'job', 'document', 'level', 'message', 'details',
            'processing_time', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer for Document Upload"""
    file = serializers.FileField()
    category = serializers.CharField(required=False)
    extraction_type = serializers.CharField(required=False)
    notes = serializers.CharField(required=False)


class DocumentProcessingRequestSerializer(serializers.Serializer):
    """Serializer for Document Processing Request"""
    document_id = serializers.UUIDField()
    processing_type = serializers.ChoiceField(choices=[
        'categorization', 'extraction', 'both'
    ])
    extraction_fields = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )


class AIProcessingStatsSerializer(serializers.Serializer):
    """Serializer for AI Processing Statistics"""
    total_documents = serializers.IntegerField()
    processed_documents = serializers.IntegerField()
    processing_success_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_confidence_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_processing_time = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()


class DocumentSearchResultSerializer(serializers.Serializer):
    """Serializer for Document Search Results"""
    document_id = serializers.UUIDField()
    file_name = serializers.CharField()
    file_type = serializers.CharField()
    category = serializers.CharField()
    confidence_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    upload_date = serializers.DateField()
    relevance_score = serializers.DecimalField(max_digits=5, decimal_places=2)
