from rest_framework import serializers
from .models import Item, ItemCategory, InventoryMovement, Warehouse, WarehouseStock, InventoryValuation, InventorySettings


class ItemCategorySerializer(serializers.ModelSerializer):
    """Serializer for Item Category"""
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemCategory
        fields = [
            'id', 'name', 'description', 'parent', 'is_active', 
            'created_at', 'updated_at', 'children_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children_count(self, obj):
        return obj.children.count()


class ItemCategoryDetailSerializer(ItemCategorySerializer):
    """Detailed serializer for Item Category with children"""
    children = ItemCategorySerializer(many=True, read_only=True)
    
    class Meta(ItemCategorySerializer.Meta):
        fields = ItemCategorySerializer.Meta.fields + ['children']


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    # supplier_name removed - supplier field is commented out in Item model to avoid circular dependency
    # supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    total_value = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    needs_reorder = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'sku', 'name', 'description', 'category', 'category_name',
            'item_type', 'unit', 'cost_price', 'selling_price', 
            'min_stock_level', 'max_stock_level', 'current_stock',
            'reorder_point', 'gl_account',
            'is_active', 'is_tracked', 'barcode', 'weight', 'dimensions',
            'image', 'company', 'company_name', 'created_at', 'updated_at',
            'total_value', 'is_low_stock', 'needs_reorder'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_value(self, obj):
        return float(obj.get_total_value())
    
    def get_is_low_stock(self, obj):
        return obj.is_low_stock()
    
    def get_needs_reorder(self, obj):
        return obj.needs_reorder()


class ItemDetailSerializer(ItemSerializer):
    """Detailed serializer for Item with related data"""
    movements = serializers.SerializerMethodField()
    warehouse_stock = serializers.SerializerMethodField()
    
    class Meta(ItemSerializer.Meta):
        fields = ItemSerializer.Meta.fields + ['movements', 'warehouse_stock']
    
    def get_movements(self, obj):
        recent_movements = obj.movements.all()[:10]  # Last 10 movements
        return InventoryMovementSerializer(recent_movements, many=True).data
    
    def get_warehouse_stock(self, obj):
        warehouse_stock = obj.warehouse_stock.all()
        return WarehouseStockSerializer(warehouse_stock, many=True).data


class InventoryMovementSerializer(serializers.ModelSerializer):
    """Serializer for Inventory Movement"""
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = InventoryMovement
        fields = [
            'id', 'item', 'item_name', 'item_sku', 'movement_type',
            'quantity', 'unit_cost', 'reference', 'reference_type',
            'reference_id', 'notes', 'movement_date', 'created_by',
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'movement_date', 'created_at']


class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse"""
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    stock_items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = [
            'id', 'name', 'code', 'address', 'city', 'state', 'country',
            'postal_code', 'phone', 'email', 'manager', 'manager_name',
            'is_active', 'is_primary', 'notes', 'company', 'company_name',
            'created_at', 'updated_at', 'stock_items_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_stock_items_count(self, obj):
        return obj.stock_levels.count()


class WarehouseStockSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse Stock"""
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse_code = serializers.CharField(source='warehouse.code', read_only=True)
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = WarehouseStock
        fields = [
            'id', 'warehouse', 'warehouse_name', 'warehouse_code',
            'item', 'item_name', 'item_sku', 'quantity', 'reserved_quantity',
            'available_quantity', 'last_updated', 'is_low_stock'
        ]
        read_only_fields = ['id', 'available_quantity', 'last_updated']
    
    def get_is_low_stock(self, obj):
        return obj.available_quantity <= obj.item.min_stock_level


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for stock adjustment operations"""
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    movement_type = serializers.ChoiceField(
        choices=[
            ('adjustment_in', 'Stock Adjustment In'),
            ('adjustment_out', 'Stock Adjustment Out'),
        ],
        default='adjustment_in'
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class InventorySummarySerializer(serializers.Serializer):
    """Serializer for inventory summary data"""
    total_items = serializers.IntegerField()
    tracked_items = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    reorder_items = serializers.IntegerField()
    total_inventory_value = serializers.DecimalField(max_digits=15, decimal_places=2)


class InventoryValuationSerializer(serializers.ModelSerializer):
    """Serializer for Inventory Valuation"""
    calculated_by_name = serializers.CharField(source='calculated_by.get_full_name', read_only=True)
    
    class Meta:
        model = InventoryValuation
        fields = [
            'id', 'tenant', 'company', 'valuation_method', 'valuation_date',
            'total_inventory_value', 'total_items', 'currency', 'notes',
            'calculated_by', 'calculated_by_name', 'calculated_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'calculated_at']


class InventorySettingsSerializer(serializers.ModelSerializer):
    """Serializer for Inventory Settings"""
    default_warehouse_name = serializers.CharField(source='default_warehouse.name', read_only=True)
    
    class Meta:
        model = InventorySettings
        fields = [
            'id', 'tenant', 'company', 'default_valuation_method',
            'enable_automatic_valuation', 'valuation_currency',
            'allow_negative_stock', 'enable_low_stock_alerts',
            'low_stock_threshold_percentage', 'auto_calculate_reorder_points',
            'enable_barcode_scanning', 'barcode_prefix', 'require_barcode',
            'enable_multi_warehouse', 'default_warehouse', 'default_warehouse_name',
            'notify_on_low_stock', 'notify_on_reorder_point',
            'notify_on_negative_stock', 'default_export_format',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

