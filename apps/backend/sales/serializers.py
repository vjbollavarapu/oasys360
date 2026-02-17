from rest_framework import serializers
from decimal import Decimal
from .models import Customer, SalesOrder, SalesOrderLine, SalesQuote, SalesQuoteLine, SalesOpportunity, SalesCommission, SalesSettings


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for Customer"""
    total_orders = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'tenant', 'company', 'name', 'email', 'phone', 'address',
            'city', 'state', 'country', 'postal_code', 'tax_id', 'currency',
            'payment_terms', 'credit_limit', 'is_active', 'total_orders',
            'total_revenue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_orders(self, obj):
        return obj.sales_orders.count()
    
    def get_total_revenue(self, obj):
        return sum(order.total_amount for order in obj.sales_orders.all())


class SalesOrderLineSerializer(serializers.ModelSerializer):
    """Serializer for Sales Order Line"""
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesOrderLine
        fields = [
            'id', 'sales_order', 'description', 'quantity', 'unit_price',
            'tax_rate', 'discount_rate', 'total_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_amount(self, obj):
        subtotal = obj.quantity * obj.unit_price
        discount = subtotal * (obj.discount_rate / 100)
        taxable_amount = subtotal - discount
        tax = taxable_amount * (obj.tax_rate / 100)
        return subtotal - discount + tax


class SalesOrderSerializer(serializers.ModelSerializer):
    """Serializer for Sales Order"""
    total_amount = serializers.SerializerMethodField()
    total_tax = serializers.SerializerMethodField()
    total_discount = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalesOrder
        fields = [
            'id', 'tenant', 'company', 'customer', 'customer_name', 'order_number',
            'order_date', 'delivery_date', 'status', 'payment_terms', 'currency',
            'exchange_rate', 'notes', 'total_amount', 'total_tax', 'total_discount',
            'created_by', 'created_by_name', 'approved_by', 'approved_at',
            'shipped_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at', 'shipped_at']
    
    def get_total_amount(self, obj):
        return sum(line.total_amount for line in obj.lines.all())
    
    def get_total_tax(self, obj):
        total_tax = Decimal('0.00')
        for line in obj.lines.all():
            subtotal = line.quantity * line.unit_price
            discount = subtotal * (line.discount_rate / 100)
            taxable_amount = subtotal - discount
            tax = taxable_amount * (line.tax_rate / 100)
            total_tax += tax
        return total_tax
    
    def get_total_discount(self, obj):
        total_discount = Decimal('0.00')
        for line in obj.lines.all():
            subtotal = line.quantity * line.unit_price
            discount = subtotal * (line.discount_rate / 100)
            total_discount += discount
        return total_discount


class SalesOrderWithLinesSerializer(SalesOrderSerializer):
    """Serializer for Sales Order with lines"""
    lines = SalesOrderLineSerializer(many=True, read_only=True)
    
    class Meta(SalesOrderSerializer.Meta):
        fields = SalesOrderSerializer.Meta.fields + ['lines']


class SalesQuoteLineSerializer(serializers.ModelSerializer):
    """Serializer for Sales Quote Line"""
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesQuoteLine
        fields = [
            'id', 'sales_quote', 'description', 'quantity', 'unit_price',
            'tax_rate', 'discount_rate', 'total_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_amount(self, obj):
        subtotal = obj.quantity * obj.unit_price
        discount = subtotal * (obj.discount_rate / 100)
        taxable_amount = subtotal - discount
        tax = taxable_amount * (obj.tax_rate / 100)
        return subtotal - discount + tax


class SalesQuoteSerializer(serializers.ModelSerializer):
    """Serializer for Sales Quote"""
    total_amount = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalesQuote
        fields = [
            'id', 'tenant', 'company', 'customer', 'customer_name', 'quote_number',
            'quote_date', 'valid_until', 'status', 'currency', 'exchange_rate',
            'notes', 'terms_conditions', 'total_amount', 'created_by', 'created_by_name',
            'approved_by', 'approved_at', 'converted_to_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at']
    
    def get_total_amount(self, obj):
        return sum(line.total_amount for line in obj.lines.all())


class SalesQuoteWithLinesSerializer(SalesQuoteSerializer):
    """Serializer for Sales Quote with lines"""
    lines = SalesQuoteLineSerializer(many=True, read_only=True)
    
    class Meta(SalesQuoteSerializer.Meta):
        fields = SalesQuoteSerializer.Meta.fields + ['lines']


class CustomerSummarySerializer(serializers.Serializer):
    """Serializer for Customer Summary"""
    customer_id = serializers.UUIDField()
    customer_name = serializers.CharField()
    email = serializers.CharField()
    phone = serializers.CharField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    last_order_date = serializers.DateField()
    is_active = serializers.BooleanField()


class SalesStatsSerializer(serializers.Serializer):
    """Serializer for Sales Statistics"""
    total_orders = serializers.IntegerField()
    total_quotes = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_customers = serializers.IntegerField()
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    period_start = serializers.DateField()
    period_end = serializers.DateField()


class SalesOrderSummarySerializer(serializers.Serializer):
    """Serializer for Sales Order Summary"""
    order_id = serializers.UUIDField()
    order_number = serializers.CharField()
    customer_name = serializers.CharField()
    order_date = serializers.DateField()
    delivery_date = serializers.DateField()
    status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency = serializers.CharField()


class SalesOpportunitySerializer(serializers.ModelSerializer):
    """Serializer for Sales Opportunity"""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    sales_person_name = serializers.CharField(source='sales_person.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    weighted_value = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesOpportunity
        fields = [
            'id', 'tenant', 'company', 'opportunity_number', 'customer', 'customer_name',
            'title', 'description', 'stage', 'value', 'probability', 'weighted_value',
            'currency', 'expected_close_date', 'actual_close_date', 'sales_person',
            'sales_person_name', 'assigned_to', 'assigned_to_name', 'status',
            'lost_reason', 'converted_to_quote', 'converted_to_order', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_weighted_value(self, obj):
        return float(obj.get_weighted_value())


class SalesCommissionSerializer(serializers.ModelSerializer):
    """Serializer for Sales Commission"""
    sales_person_name = serializers.CharField(source='sales_person.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalesCommission
        fields = [
            'id', 'tenant', 'company', 'sales_person', 'sales_person_name',
            'period_start', 'period_end', 'commission_type', 'reference_type',
            'reference_id', 'base_amount', 'commission_rate', 'commission_amount',
            'currency', 'status', 'payment_date', 'approved_by', 'approved_by_name',
            'approved_at', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at']


class SalesSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Sales Settings"""
    
    class Meta:
        model = SalesSettings
        fields = [
            'id', 'tenant', 'company', 'default_currency', 'default_payment_terms',
            'default_quote_validity_days', 'quote_number_prefix', 'quote_number_format',
            'order_number_prefix', 'order_number_format', 'require_order_approval',
            'enable_commission_tracking', 'default_commission_rate', 'commission_payment_terms',
            'enable_pipeline_tracking', 'default_probability_by_stage',
            'enable_sales_analytics', 'analytics_retention_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
