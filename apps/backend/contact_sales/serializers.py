from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SalesInquiry, SalesInquiryResponse, SalesInquiryAttachment

User = get_user_model()


class SalesInquiryAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for sales inquiry attachments"""
    
    class Meta:
        model = SalesInquiryAttachment
        fields = [
            'id', 'file_name', 'file_size', 'file_type', 
            'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SalesInquiryResponseSerializer(serializers.ModelSerializer):
    """Serializer for sales inquiry responses"""
    responded_by_name = serializers.CharField(source='responded_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalesInquiryResponse
        fields = [
            'id', 'response_type', 'subject', 'message', 'is_internal',
            'responded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'responded_by', 'created_at']


class SalesInquirySerializer(serializers.ModelSerializer):
    """Serializer for sales inquiries"""
    full_name = serializers.ReadOnlyField()
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    responses = SalesInquiryResponseSerializer(many=True, read_only=True)
    attachments = SalesInquiryAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = SalesInquiry
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'company', 'job_title', 'website', 'inquiry_type', 'subject',
            'message', 'company_size', 'industry', 'current_solution',
            'budget_range', 'timeline', 'status', 'priority', 'assigned_to',
            'assigned_to_name', 'source', 'created_at', 'updated_at',
            'contacted_at', 'notes', 'is_active', 'responses', 'attachments'
        ]
        read_only_fields = ['id', 'full_name', 'assigned_to_name', 'created_at', 'updated_at', 'contacted_at']


class SalesInquiryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new sales inquiries (public endpoint)"""
    
    class Meta:
        model = SalesInquiry
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'company',
            'job_title', 'website', 'inquiry_type', 'subject', 'message',
            'company_size', 'industry', 'current_solution', 'budget_range',
            'timeline', 'source'
        ]
    
    def validate_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required")
        return value.lower()
    
    def validate_company(self, value):
        """Validate company name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long")
        return value.strip()


class SalesInquiryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating sales inquiries (admin endpoint)"""
    
    class Meta:
        model = SalesInquiry
        fields = [
            'status', 'priority', 'assigned_to', 'notes', 'is_active'
        ]


class SalesInquirySummarySerializer(serializers.ModelSerializer):
    """Serializer for sales inquiry summaries (dashboard views)"""
    full_name = serializers.ReadOnlyField()
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    days_since_created = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesInquiry
        fields = [
            'id', 'full_name', 'email', 'company', 'inquiry_type',
            'status', 'priority', 'assigned_to_name', 'created_at',
            'days_since_created', 'is_active'
        ]
    
    def get_days_since_created(self, obj):
        """Calculate days since inquiry was created"""
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        return delta.days


class SalesInquiryStatsSerializer(serializers.Serializer):
    """Serializer for sales inquiry statistics"""
    total_inquiries = serializers.IntegerField()
    new_inquiries = serializers.IntegerField()
    contacted_inquiries = serializers.IntegerField()
    qualified_inquiries = serializers.IntegerField()
    closed_won = serializers.IntegerField()
    closed_lost = serializers.IntegerField()
    conversion_rate = serializers.FloatField()
    avg_response_time_hours = serializers.FloatField()
    
    # By inquiry type
    demo_requests = serializers.IntegerField()
    pricing_requests = serializers.IntegerField()
    enterprise_requests = serializers.IntegerField()
    
    # By priority
    high_priority = serializers.IntegerField()
    urgent_priority = serializers.IntegerField()
    
    # By time period
    this_week = serializers.IntegerField()
    this_month = serializers.IntegerField()
    last_month = serializers.IntegerField()


class SalesInquiryResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating responses to sales inquiries"""
    
    class Meta:
        model = SalesInquiryResponse
        fields = [
            'response_type', 'subject', 'message', 'is_internal'
        ]
    
    def validate_message(self, value):
        """Validate message content"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long")
        return value.strip()


class ContactSalesFormSerializer(serializers.Serializer):
    """Serializer for the contact sales form (simplified for public use)"""
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    company = serializers.CharField(max_length=200)
    job_title = serializers.CharField(max_length=100, required=False, allow_blank=True)
    inquiry_type = serializers.ChoiceField(choices=SalesInquiry.INQUIRY_TYPES)
    subject = serializers.CharField(max_length=200)
    message = serializers.CharField()
    company_size = serializers.CharField(max_length=50, required=False, allow_blank=True)
    industry = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_first_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters long")
        return value.strip()
    
    def validate_last_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters long")
        return value.strip()
    
    def validate_company(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long")
        return value.strip()
    
    def validate_message(self, value):
        if not value or len(value.strip()) < 20:
            raise serializers.ValidationError("Message must be at least 20 characters long")
        return value.strip()
