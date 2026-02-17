from rest_framework import serializers
from decimal import Decimal
from .models import (
    DocumentFile, DocumentFolder, DocumentTemplate, DocumentVersion,
    DocumentShare, DocumentComment, DocumentAuditLog, DocumentWorkflow,
    DocumentWorkflowInstance, DocumentWorkflowStep, DocumentStorage, DocumentSettings
)


class DocumentFolderSerializer(serializers.ModelSerializer):
    """Serializer for Document Folder"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    files_count = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentFolder
        fields = [
            'id', 'tenant', 'name', 'description', 'parent', 'path',
            'is_public', 'is_system', 'created_by', 'created_by_name',
            'files_count', 'children_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'path', 'created_at', 'updated_at']
    
    def get_files_count(self, obj):
        return obj.files.count()
    
    def get_children_count(self, obj):
        return obj.children.count()


class DocumentTemplateSerializer(serializers.ModelSerializer):
    """Serializer for Document Template"""
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentTemplate
        fields = [
            'id', 'tenant', 'name', 'description', 'template_type',
            'template_type_display', 'file_path', 'file_type', 'variables',
            'is_active', 'is_default', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DocumentFileSerializer(serializers.ModelSerializer):
    """Serializer for Document File"""
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentFile
        fields = [
            'id', 'tenant', 'company', 'filename', 'original_filename',
            'file_path', 'file_type', 'file_size', 'file_size_mb',
            'mime_type', 'document_type', 'document_type_display',
            'category', 'tags', 'description', 'folder', 'folder_name',
            'is_public', 'is_archived', 'version', 'checksum',
            'uploaded_by', 'uploaded_by_name', 'file_extension',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_file_size_mb(self, obj):
        return obj.get_file_size_mb()
    
    def get_file_extension(self, obj):
        return obj.get_file_extension()


class DocumentVersionSerializer(serializers.ModelSerializer):
    """Serializer for Document Version"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentVersion
        fields = [
            'id', 'document', 'version_number', 'file_path', 'file_size',
            'checksum', 'changes', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DocumentShareSerializer(serializers.ModelSerializer):
    """Serializer for Document Share"""
    document_name = serializers.CharField(source='document.original_filename', read_only=True)
    shared_by_name = serializers.CharField(source='shared_by.get_full_name', read_only=True)
    shared_with_name = serializers.CharField(source='shared_with.get_full_name', read_only=True)
    permission_display = serializers.CharField(source='get_permission_display', read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentShare
        fields = [
            'id', 'document', 'document_name', 'shared_by', 'shared_by_name',
            'shared_with', 'shared_with_name', 'shared_with_email', 'permission',
            'permission_display', 'expires_at', 'is_active', 'access_count',
            'last_accessed', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'access_count', 'last_accessed']
    
    def get_is_expired(self, obj):
        return obj.is_expired()


class DocumentCommentSerializer(serializers.ModelSerializer):
    """Serializer for Document Comment"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentComment
        fields = [
            'id', 'document', 'user', 'user_name', 'user_email', 'comment',
            'page_number', 'coordinates', 'parent', 'is_resolved',
            'replies_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_replies_count(self, obj):
        return obj.replies.count()


class DocumentAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for Document Audit Log"""
    document_name = serializers.CharField(source='document.original_filename', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    # Fix for DRF 3.14.0 bug with GenericIPAddressField - use CharField instead
    ip_address = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    
    class Meta:
        model = DocumentAuditLog
        fields = [
            'id', 'document', 'document_name', 'user', 'user_name', 'action',
            'action_display', 'details', 'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DocumentWorkflowStepSerializer(serializers.ModelSerializer):
    """Serializer for Document Workflow Step"""
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = DocumentWorkflowStep
        fields = [
            'id', 'workflow_instance', 'step_number', 'step_name', 'status',
            'status_display', 'assigned_to', 'assigned_to_name', 'action',
            'comments', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


class DocumentWorkflowInstanceSerializer(serializers.ModelSerializer):
    """Serializer for Document Workflow Instance"""
    workflow_name = serializers.CharField(source='workflow.name', read_only=True)
    document_name = serializers.CharField(source='document.original_filename', read_only=True)
    started_by_name = serializers.CharField(source='started_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    steps = DocumentWorkflowStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = DocumentWorkflowInstance
        fields = [
            'id', 'tenant', 'workflow', 'workflow_name', 'document', 'document_name',
            'current_step', 'status', 'status_display', 'started_by', 'started_by_name',
            'started_at', 'completed_at', 'notes', 'steps'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


class DocumentWorkflowSerializer(serializers.ModelSerializer):
    """Serializer for Document Workflow"""
    workflow_type_display = serializers.CharField(source='get_workflow_type_display', read_only=True)
    trigger_type_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    instances_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentWorkflow
        fields = [
            'id', 'tenant', 'name', 'description', 'workflow_type',
            'workflow_type_display', 'trigger_type', 'trigger_type_display',
            'steps', 'is_active', 'auto_assign', 'notification_enabled',
            'created_by', 'created_by_name', 'instances_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_instances_count(self, obj):
        return obj.instances.count()


class DocumentStorageSerializer(serializers.ModelSerializer):
    """Serializer for Document Storage"""
    storage_type_display = serializers.CharField(source='get_storage_type_display', read_only=True)
    used_space_percentage = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentStorage
        fields = [
            'id', 'tenant', 'name', 'storage_type', 'storage_type_display',
            'is_primary', 'is_active', 'configuration', 'base_path',
            'total_space', 'used_space', 'used_space_percentage',
            'is_encrypted', 'backup_enabled', 'backup_frequency',
            'last_backup', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'used_space', 'created_at', 'updated_at', 'last_backup']
        extra_kwargs = {
            'configuration': {'write_only': True},  # Hide sensitive configuration
        }
    
    def get_used_space_percentage(self, obj):
        return obj.get_used_space_percentage()


class DocumentSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Document Settings"""
    default_storage_name = serializers.CharField(source='default_storage.name', read_only=True)
    default_workflow_name = serializers.CharField(source='default_workflow.name', read_only=True)
    
    class Meta:
        model = DocumentSettings
        fields = [
            'id', 'tenant', 'company', 'max_file_size_mb', 'allowed_file_types',
            'enable_versioning', 'max_versions', 'enable_ocr', 'auto_classification',
            'enable_auto_indexing', 'ocr_languages', 'default_storage',
            'default_storage_name', 'enable_compression', 'retention_days',
            'enable_encryption', 'enable_watermark', 'require_approval_for_deletion',
            'enable_audit_logging', 'enable_workflows', 'default_workflow',
            'default_workflow_name', 'enable_email_notifications',
            'notify_on_upload', 'notify_on_approval', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

