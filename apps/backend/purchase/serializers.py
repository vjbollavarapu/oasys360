from rest_framework import serializers
from decimal import Decimal
from .models import (
    Supplier, PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, PurchaseReceiptLine, PurchasePayment,
    VendorWalletAddress, VendorVerificationLog, PaymentBlock, PurchaseApprovalRequest, PurchaseContract, PurchaseSettings
)


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier"""
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'tenant', 'company', 'name', 'email', 'phone', 'address',
            'city', 'state', 'country', 'postal_code', 'tax_id', 'currency',
            'payment_terms', 'credit_limit', 'is_active', 'total_orders',
            'total_spent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_orders(self, obj):
        return obj.purchase_orders.count()
    
    def get_total_spent(self, obj):
        return sum(order.total_amount for order in obj.purchase_orders.all())


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Order Line"""
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseOrderLine
        fields = [
            'id', 'purchase_order', 'item', 'description', 'quantity', 'unit_price',
            'tax_rate', 'discount_rate', 'total_amount', 'received_quantity',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_amount(self, obj):
        subtotal = obj.quantity * obj.unit_price
        discount = subtotal * (obj.discount_rate / 100)
        taxable_amount = subtotal - discount
        tax = taxable_amount * (obj.tax_rate / 100)
        return subtotal - discount + tax


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Order"""
    total_amount = serializers.SerializerMethodField()
    total_tax = serializers.SerializerMethodField()
    total_discount = serializers.SerializerMethodField()
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'tenant', 'company', 'supplier', 'supplier_name', 'order_number',
            'order_date', 'delivery_date', 'status', 'payment_terms', 'currency',
            'exchange_rate', 'notes', 'total_amount', 'total_tax', 'total_discount',
            'created_by', 'created_by_name', 'approved_by', 'approved_at',
            'received_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at', 'received_at']
    
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


class PurchaseOrderWithLinesSerializer(PurchaseOrderSerializer):
    """Serializer for Purchase Order with lines"""
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)
    
    class Meta(PurchaseOrderSerializer.Meta):
        fields = PurchaseOrderSerializer.Meta.fields + ['lines']


class PurchaseReceiptLineSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Receipt Line"""
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseReceiptLine
        fields = [
            'id', 'purchase_receipt', 'purchase_order_line', 'item', 'description',
            'quantity_received', 'unit_price', 'total_amount', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_amount(self, obj):
        return obj.quantity_received * obj.unit_price


class PurchaseReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Receipt"""
    total_amount = serializers.SerializerMethodField()
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseReceipt
        fields = [
            'id', 'tenant', 'company', 'supplier', 'supplier_name', 'receipt_number',
            'receipt_date', 'purchase_order', 'status', 'total_amount',
            'created_by', 'created_by_name', 'approved_by', 'approved_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at']
    
    def get_total_amount(self, obj):
        return sum(line.total_amount for line in obj.lines.all())


class PurchaseReceiptWithLinesSerializer(PurchaseReceiptSerializer):
    """Serializer for Purchase Receipt with lines"""
    lines = PurchaseReceiptLineSerializer(many=True, read_only=True)
    
    class Meta(PurchaseReceiptSerializer.Meta):
        fields = PurchaseReceiptSerializer.Meta.fields + ['lines']


class PurchasePaymentSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Payment"""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = PurchasePayment
        fields = [
            'id', 'tenant', 'company', 'supplier', 'supplier_name', 'payment_date',
            'payment_method', 'payment_reference', 'amount', 'currency',
            'exchange_rate', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupplierSummarySerializer(serializers.Serializer):
    """Serializer for Supplier Summary"""
    supplier_id = serializers.UUIDField()
    supplier_name = serializers.CharField()
    email = serializers.CharField()
    phone = serializers.CharField()
    total_orders = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    last_order_date = serializers.DateField()
    is_active = serializers.BooleanField()


class PurchaseStatsSerializer(serializers.Serializer):
    """Serializer for Purchase Statistics"""
    total_orders = serializers.IntegerField()
    total_receipts = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_suppliers = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()


class PurchaseOrderSummarySerializer(serializers.Serializer):
    """Serializer for Purchase Order Summary"""
    order_id = serializers.UUIDField()
    order_number = serializers.CharField()
    supplier_name = serializers.CharField()
    order_date = serializers.DateField()
    delivery_date = serializers.DateField()
    status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency = serializers.CharField()


# ============================================================================
# Vendor Verification Serializers
# ============================================================================

class VendorWalletAddressSerializer(serializers.ModelSerializer):
    """Serializer for Vendor Wallet Address"""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    network_display = serializers.CharField(source='get_network_display', read_only=True)
    
    class Meta:
        model = VendorWalletAddress
        fields = [
            'id', 'tenant', 'supplier', 'supplier_name', 'wallet_address', 'network',
            'network_display', 'is_primary', 'is_verified', 'verification_date',
            'verified_by', 'transaction_count', 'first_transaction_date',
            'last_transaction_date', 'total_amount_received', 'risk_score', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VendorVerificationLogSerializer(serializers.ModelSerializer):
    """Serializer for Vendor Verification Log"""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    verification_type_display = serializers.CharField(source='get_verification_type_display', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    recommendation_display = serializers.CharField(source='get_recommendation_display', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)
    
    class Meta:
        model = VendorVerificationLog
        fields = [
            'id', 'tenant', 'supplier', 'supplier_name', 'wallet_address', 'network',
            'verification_type', 'verification_type_display', 'verification_status',
            'verification_status_display', 'risk_factors', 'transaction_history_match',
            'address_found_in_history', 'transaction_count_found', 'recommendation',
            'recommendation_display', 'notes', 'verified_by', 'verified_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PurchaseApprovalRequestSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Approval Request"""
    purchase_order_number = serializers.CharField(source='purchase_order.order_number', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseApprovalRequest
        fields = [
            'id', 'tenant', 'purchase_order', 'purchase_order_number',
            'requested_by', 'requested_by_name', 'approval_type', 'status',
            'approval_level', 'approver', 'approver_name', 'approved_by',
            'approved_by_name', 'approved_at', 'rejection_reason', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at']


class PurchaseContractSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Contract"""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_active = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseContract
        fields = [
            'id', 'tenant', 'company', 'contract_number', 'supplier', 'supplier_name',
            'title', 'description', 'contract_type', 'start_date', 'end_date',
            'status', 'total_value', 'currency', 'payment_terms', 'renewal_option',
            'auto_renew', 'renewal_notice_days', 'document_url', 'file_path',
            'terms_conditions', 'signed_by_supplier', 'signed_by_company',
            'signed_at', 'approved_by', 'approved_by_name', 'approved_at',
            'notes', 'created_by', 'created_by_name', 'is_active', 'is_expiring_soon',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at', 'signed_at']
    
    def get_is_active(self, obj):
        return obj.is_active()
    
    def get_is_expiring_soon(self, obj):
        return obj.is_expiring_soon()


class PurchaseSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Settings"""
    default_warehouse_name = serializers.CharField(source='default_warehouse.name', read_only=True)
    
    class Meta:
        model = PurchaseSettings
        fields = [
            'id', 'tenant', 'company', 'default_currency', 'default_payment_terms',
            'order_number_prefix', 'order_number_format', 'require_order_approval',
            'require_receipt_approval', 'approval_threshold', 'enable_receiving_inspection',
            'default_warehouse', 'default_warehouse_name', 'enable_contract_management',
            'default_contract_validity_days', 'auto_renewal_reminder_days',
            'enable_purchase_analytics', 'analytics_retention_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentBlockSerializer(serializers.ModelSerializer):
    """Serializer for Payment Block"""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    block_reason_display = serializers.CharField(source='get_block_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    blocked_by_name = serializers.CharField(source='blocked_by.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    
    class Meta:
        model = PaymentBlock
        fields = [
            'id', 'tenant', 'supplier', 'supplier_name', 'purchase_order', 'invoice',
            'wallet_address', 'network', 'amount', 'currency', 'block_reason',
            'block_reason_display', 'risk_factors', 'status', 'status_display',
            'resolution_notes', 'blocked_by', 'blocked_by_name', 'resolved_by',
            'resolved_by_name', 'resolved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
