from rest_framework import serializers
from decimal import Decimal
from .models import (
    Invoice, InvoiceLine, InvoiceTemplate, InvoicePayment, EInvoiceSettings, EInvoiceSubmission,
    InvoiceComplianceRule, ComplianceViolation, DigitalCertificate, InvoiceSignature,
    TaxRate, TaxCategory, InvoicingSettings
)


class InvoiceLineSerializer(serializers.ModelSerializer):
    """Serializer for Invoice Line"""
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = InvoiceLine
        fields = [
            'id', 'invoice', 'description', 'quantity', 'unit_price',
            'tax_rate', 'discount_rate', 'total_amount', 'created_at', 'updated_at',
            # E-Invoice (LHDN) fields
            'msic_code', 'tax_category', 'tax_exemption_code'
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
            'approved_by', 'approved_at', 'sent_at', 'created_at', 'updated_at',
            # E-Invoice (LHDN) fields
            'e_invoice_status', 'lhdn_reference_number', 'submitted_to_lhdn_at',
            'lhdn_validated_at', 'e_invoice_errors'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'approved_at', 'sent_at',
            'submitted_to_lhdn_at', 'lhdn_validated_at'
        ]
    
    def get_total_amount(self, obj):
        return sum(line.line_total for line in obj.lines.all())
    
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
            'id', 'tenant', 'is_enabled', 'provider', 'api_key', 'api_secret',
            'webhook_url', 'settings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'api_key': {'write_only': True},
            'api_secret': {'write_only': True},
        }


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


class InvoiceComplianceRuleSerializer(serializers.ModelSerializer):
    """Serializer for Invoice Compliance Rule"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = InvoiceComplianceRule
        fields = [
            'id', 'tenant', 'name', 'description', 'rule_type', 'region',
            'is_active', 'rule_expression', 'severity', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplianceViolationSerializer(serializers.ModelSerializer):
    """Serializer for Compliance Violation"""
    rule_name = serializers.CharField(source='rule.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    
    class Meta:
        model = ComplianceViolation
        fields = [
            'id', 'tenant', 'invoice', 'invoice_number', 'rule', 'rule_name',
            'violation_type', 'description', 'severity', 'status',
            'resolved_by', 'resolved_by_name', 'resolved_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DigitalCertificateSerializer(serializers.ModelSerializer):
    """Serializer for Digital Certificate"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = DigitalCertificate
        fields = [
            'id', 'tenant', 'name', 'certificate_type', 'issuer', 'serial_number',
            'valid_from', 'valid_to', 'is_active', 'is_primary', 'is_valid',
            'certificate_data', 'notes', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_valid']
        extra_kwargs = {
            'certificate_data': {'write_only': True},
            'private_key': {'write_only': True},
            'password': {'write_only': True},
        }
    
    def get_is_valid(self, obj):
        return obj.is_valid()


class InvoiceSignatureSerializer(serializers.ModelSerializer):
    """Serializer for Invoice Signature"""
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    certificate_name = serializers.CharField(source='certificate.name', read_only=True)
    signed_by_name = serializers.CharField(source='signed_by.get_full_name', read_only=True)
    
    class Meta:
        model = InvoiceSignature
        fields = [
            'id', 'tenant', 'invoice', 'invoice_number', 'certificate',
            'certificate_name', 'signature_hash', 'signature_data',
            'signed_by', 'signed_by_name', 'signed_at', 'verification_status',
            'verified_at', 'notes'
        ]
        read_only_fields = ['id', 'signed_at', 'verified_at']


class TaxRateSerializer(serializers.ModelSerializer):
    """Serializer for Tax Rate"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaxRate
        fields = [
            'id', 'tenant', 'name', 'code', 'rate', 'tax_type', 'region',
            'category', 'is_default', 'is_active', 'effective_from',
            'effective_to', 'description', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaxCategorySerializer(serializers.ModelSerializer):
    """Serializer for Tax Category"""
    
    class Meta:
        model = TaxCategory
        fields = [
            'id', 'tenant', 'name', 'code', 'description', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoicingSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Invoicing Settings"""
    default_template_name = serializers.CharField(source='default_template.name', read_only=True)
    
    class Meta:
        model = InvoicingSettings
        fields = [
            'id', 'tenant', 'company', 'default_currency', 'invoice_prefix',
            'invoice_number_format', 'default_payment_terms', 'default_tax_rate',
            'default_template', 'default_template_name', 'enable_us_tax_compliance',
            'enable_eu_vat_compliance', 'enable_digital_signatures',
            'enable_payment_reminders', 'enable_overdue_notifications',
            'enable_compliance_alerts', 'compliance_alert_frequency',
            'next_invoice_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EInvoiceSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for E-Invoice Submission"""
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = EInvoiceSubmission
        fields = [
            'id', 'tenant', 'invoice', 'invoice_number', 'submission_type',
            'status', 'request_payload', 'response_payload', 'qrid',
            'error_message', 'error_code', 'retry_count', 'submitted_at',
            'completed_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = [
            'id', 'submitted_at', 'completed_at'
        ]
