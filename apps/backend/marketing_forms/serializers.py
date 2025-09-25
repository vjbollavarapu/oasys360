from rest_framework import serializers
from .models import BetaProgramApplication, EarlyAccessRequest, FounderFeedback


class BetaProgramApplicationSerializer(serializers.ModelSerializer):
    """Serializer for Beta Program Applications"""
    
    class Meta:
        model = BetaProgramApplication
        fields = [
            'id', 'name', 'email', 'company', 'role', 'company_size',
            'use_case', 'expectations', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class BetaProgramApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Beta Program Applications"""
    
    class Meta:
        model = BetaProgramApplication
        fields = [
            'name', 'email', 'company', 'role', 'company_size',
            'use_case', 'expectations'
        ]
    
    def create(self, validated_data):
        # Set default tenant if available
        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            validated_data['tenant'] = request.tenant
        return super().create(validated_data)


class EarlyAccessRequestSerializer(serializers.ModelSerializer):
    """Serializer for Early Access Requests"""
    
    class Meta:
        model = EarlyAccessRequest
        fields = [
            'id', 'name', 'email', 'company', 'role', 'company_size', 'industry',
            'current_challenges', 'timeline', 'expectations', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class EarlyAccessRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Early Access Requests"""
    
    class Meta:
        model = EarlyAccessRequest
        fields = [
            'name', 'email', 'company', 'role', 'company_size', 'industry',
            'current_challenges', 'timeline', 'expectations'
        ]
    
    def create(self, validated_data):
        # Set default tenant if available
        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            validated_data['tenant'] = request.tenant
        return super().create(validated_data)


class FounderFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for Founder Feedback"""
    
    class Meta:
        model = FounderFeedback
        fields = [
            'id', 'name', 'email', 'company', 'role', 'feedback_type',
            'subject', 'message', 'priority', 'contact_preference', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class FounderFeedbackCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Founder Feedback"""
    
    class Meta:
        model = FounderFeedback
        fields = [
            'name', 'email', 'company', 'role', 'feedback_type',
            'subject', 'message', 'priority', 'contact_preference'
        ]
    
    def create(self, validated_data):
        # Set default tenant if available
        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            validated_data['tenant'] = request.tenant
        return super().create(validated_data)
