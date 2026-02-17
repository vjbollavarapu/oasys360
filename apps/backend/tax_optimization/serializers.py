"""
Tax Optimization Serializers
"""
from rest_framework import serializers
from decimal import Decimal
from .models import (
    TaxEvent, TaxOptimizationStrategy, TaxYearSummary,
    TaxAlert, TaxSettings
)


class TaxEventSerializer(serializers.ModelSerializer):
    """Serializer for Tax Event"""
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)
    remaining_offset = serializers.SerializerMethodField()
    
    class Meta:
        model = TaxEvent
        fields = [
            'id', 'tenant', 'event_type', 'event_type_display', 'source_type',
            'source_type_display', 'source_id', 'amount', 'currency', 'tax_year',
            'event_date', 'realized', 'offset_applied', 'offset_amount',
            'remaining_offset', 'description', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_remaining_offset(self, obj):
        return obj.remaining_offset_amount()


class TaxOptimizationStrategySerializer(serializers.ModelSerializer):
    """Serializer for Tax Optimization Strategy"""
    strategy_type_display = serializers.CharField(source='get_strategy_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    applicable_events = TaxEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = TaxOptimizationStrategy
        fields = [
            'id', 'tenant', 'strategy_type', 'strategy_type_display', 'title',
            'description', 'priority', 'priority_display', 'potential_savings',
            'tax_year', 'applicable_events', 'status', 'status_display',
            'implementation_date', 'actual_savings', 'created_by', 'created_by_name',
            'approved_by', 'approved_by_name', 'approved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'approved_at', 'created_by', 'approved_by'
        ]


class TaxYearSummarySerializer(serializers.ModelSerializer):
    """Serializer for Tax Year Summary"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    net_after_offset = serializers.SerializerMethodField()
    
    class Meta:
        model = TaxYearSummary
        fields = [
            'id', 'tenant', 'tax_year', 'total_profit', 'total_loss',
            'total_gains', 'total_losses', 'net_taxable_income', 'net_after_offset',
            'realized_gains', 'realized_losses', 'unrealized_gains', 'unrealized_losses',
            'offset_applied', 'estimated_tax_liability', 'estimated_tax_rate',
            'currency', 'status', 'status_display', 'notes', 'calculated_at',
            'finalized_at', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'calculated_at', 'finalized_at',
            'created_by'
        ]
    
    def get_net_after_offset(self, obj):
        return max(Decimal('0'), obj.total_gains - obj.total_losses - obj.offset_applied)


class TaxAlertSerializer(serializers.ModelSerializer):
    """Serializer for Tax Alert"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    days_until_deadline = serializers.SerializerMethodField()
    
    class Meta:
        model = TaxAlert
        fields = [
            'id', 'tenant', 'alert_type', 'alert_type_display', 'severity',
            'severity_display', 'title', 'message', 'actionable', 'action_url',
            'related_event', 'related_strategy', 'tax_year', 'deadline_date',
            'days_until_deadline', 'read', 'dismissed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_days_until_deadline(self, obj):
        if obj.deadline_date:
            from django.utils import timezone
            today = timezone.now().date()
            delta = obj.deadline_date - today
            return max(0, delta.days)
        return None


class TaxSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Tax Settings"""
    
    class Meta:
        model = TaxSettings
        fields = [
            'id', 'tenant', 'tax_jurisdiction', 'tax_year_end', 'default_tax_rate',
            'enable_loss_harvesting', 'enable_auto_alerts', 'year_end_alert_days',
            'loss_carryforward_years', 'settings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaxOptimizationStatsSerializer(serializers.Serializer):
    """Serializer for tax optimization statistics"""
    current_year = serializers.IntegerField()
    total_events = serializers.IntegerField()
    total_gains = serializers.DecimalField(max_digits=20, decimal_places=2)
    total_losses = serializers.DecimalField(max_digits=20, decimal_places=2)
    net_taxable = serializers.DecimalField(max_digits=20, decimal_places=2)
    offset_available = serializers.DecimalField(max_digits=20, decimal_places=2)
    pending_strategies = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    estimated_savings = serializers.DecimalField(max_digits=20, decimal_places=2)

