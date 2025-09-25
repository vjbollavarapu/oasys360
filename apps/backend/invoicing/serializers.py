from rest_framework import serializers
from decimal import Decimal
from .models import Invoice, InvoiceLine, InvoiceTemplate, InvoicePayment, EInvoiceSettings


class InvoiceLineSerializer(serializers.ModelSerializer):
    """Serializer for Invoice Line"""
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = InvoiceLine
        fields = [
            'id', 'invoice', 'description', 'quantity', 'unit_price',
            'tax_rate', 'discount_rate', 'total_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_amount(self, obj):
        subtotal = obj.quantity * obj.unit_price
        discount = subtotal * (obj.discount_rate / 100)
        taxable_amount = subtotal - discount
        tax = taxable_amount * (obj.tax_rate / 100)
        return subtotal - discount + tax


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice"""
    total_amount = serializers.SerializerMethodField()
    total_tax = serializers.SerializerMethodField()
    total_discount = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'tenant', 'company', 'customer', 'customer_name', 'invoice_number',
            'invoice_date', 'due_date', 'status', 'payment_terms', 'currency',
            'exchange_rate', 'notes', 'terms_conditions', 'total_amount',
            'total_tax', 'total_discount', 'created_by', 'created_by_name',
            'approved_by', 'approved_at', 'sent_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at', 'sent_at']
    
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


class InvoiceWithLinesSerializer(InvoiceSerializer):
    """Serializer for Invoice with lines"""
    lines = InvoiceLineSerializer(many=True, read_only=True)
    
    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields + ['lines']


class InvoiceTemplateSerializer(serializers.ModelSerializer):
    """Serializer for Invoice Template"""
    class Meta:
        model = InvoiceTemplate
        fields = [
            'id', 'tenant', 'name', 'description', 'template_type',
            'header_template', 'footer_template', 'line_item_template',
            'css_styles', 'is_default', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoicePaymentSerializer(serializers.ModelSerializer):
    """Serializer for Invoice Payment"""
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    customer_name = serializers.CharField(source='invoice.customer.name', read_only=True)
    
    class Meta:
        model = InvoicePayment
        fields = [
            'id', 'invoice', 'invoice_number', 'customer_name', 'payment_date',
            'payment_method', 'payment_reference', 'amount', 'currency',
            'exchange_rate', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EInvoiceSettingsSerializer(serializers.ModelSerializer):
    """Serializer for E-Invoice Settings"""
    class Meta:
        model = EInvoiceSettings
        fields = [
            'id', 'tenant', 'company', 'provider', 'api_key', 'api_secret',
            'endpoint_url', 'format_type', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoiceStatsSerializer(serializers.Serializer):
    """Serializer for Invoice Statistics"""
    total_invoices = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    overdue_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    period_start = serializers.DateField()
    period_end = serializers.DateField()


class InvoiceSummarySerializer(serializers.Serializer):
    """Serializer for Invoice Summary"""
    invoice_id = serializers.UUIDField()
    invoice_number = serializers.CharField()
    customer_name = serializers.CharField()
    invoice_date = serializers.DateField()
    due_date = serializers.DateField()
    status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
