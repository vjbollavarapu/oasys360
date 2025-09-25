from django.db import models
import uuid
from decimal import Decimal


class ItemCategory(models.Model):
    """
    Item Category model for organizing inventory items
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='item_categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'item_categories'
        verbose_name = 'Item Category'
        verbose_name_plural = 'Item Categories'
        unique_together = ['tenant', 'name']

    def __str__(self):
        return self.name


class Item(models.Model):
    """
    Item model for managing inventory items
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='items')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='items')
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(ItemCategory, on_delete=models.SET_NULL, null=True, blank=True)
    item_type = models.CharField(max_length=20, choices=[
        ('product', 'Product'),
        ('service', 'Service'),
        ('material', 'Material'),
    ], default='product')
    unit = models.CharField(max_length=20, default='piece', choices=[
        ('piece', 'Piece'),
        ('kg', 'Kilogram'),
        ('lb', 'Pound'),
        ('liter', 'Liter'),
        ('gallon', 'Gallon'),
        ('meter', 'Meter'),
        ('foot', 'Foot'),
        ('hour', 'Hour'),
        ('day', 'Day'),
    ])
    cost_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_point = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    supplier = models.ForeignKey('purchase.Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    gl_account = models.ForeignKey('accounting.ChartOfAccounts', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_tracked = models.BooleanField(default=True)  # Whether to track stock levels
    barcode = models.CharField(max_length=100, blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dimensions = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='item_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'items'
        verbose_name = 'Item'
        verbose_name_plural = 'Items'
        unique_together = ['tenant', 'company', 'sku']

    def __str__(self):
        return f"{self.sku} - {self.name}"

    def get_total_value(self):
        """Get total inventory value"""
        return self.current_stock * self.cost_price

    def is_low_stock(self):
        """Check if item is low on stock"""
        return self.current_stock <= self.min_stock_level

    def needs_reorder(self):
        """Check if item needs reordering"""
        return self.current_stock <= self.reorder_point

    def update_stock(self, quantity, movement_type):
        """Update stock level"""
        if movement_type in ['purchase', 'return', 'adjustment_in']:
            self.current_stock += quantity
        elif movement_type in ['sale', 'damage', 'adjustment_out']:
            self.current_stock -= quantity
        
        if self.current_stock < 0:
            self.current_stock = 0
        
        self.save()


class InventoryMovement(models.Model):
    """
    Inventory Movement model for tracking stock movements
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='inventory_movements')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='inventory_movements')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=[
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('return', 'Return'),
        ('damage', 'Damage'),
        ('adjustment_in', 'Stock Adjustment In'),
        ('adjustment_out', 'Stock Adjustment Out'),
        ('transfer_in', 'Transfer In'),
        ('transfer_out', 'Transfer Out'),
    ])
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    reference_type = models.CharField(max_length=50, blank=True)  # e.g., 'purchase_order', 'sales_order'
    reference_id = models.UUIDField(null=True, blank=True)
    notes = models.TextField(blank=True)
    movement_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory_movements'
        verbose_name = 'Inventory Movement'
        verbose_name_plural = 'Inventory Movements'
        ordering = ['-movement_date']

    def __str__(self):
        return f"{self.movement_type} - {self.item.name} ({self.quantity})"

    def save(self, *args, **kwargs):
        # Update item stock level
        if not self.pk:  # Only on creation
            self.item.update_stock(self.quantity, self.movement_type)
        super().save(*args, **kwargs)


class Warehouse(models.Model):
    """
    Warehouse model for managing multiple storage locations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='warehouses')
    company = models.ForeignKey('tenants.Company', on_delete=models.CASCADE, related_name='warehouses')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='US')
    postal_code = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    manager = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'warehouses'
        verbose_name = 'Warehouse'
        verbose_name_plural = 'Warehouses'
        unique_together = ['tenant', 'company', 'code']

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        # Ensure only one primary warehouse per company
        if self.is_primary:
            Warehouse.objects.filter(
                tenant=self.tenant,
                company=self.company,
                is_primary=True
            ).update(is_primary=False)
        super().save(*args, **kwargs)


class WarehouseStock(models.Model):
    """
    Warehouse Stock model for tracking stock levels by warehouse
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stock_levels')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='warehouse_stock')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reserved_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    available_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'warehouse_stock'
        verbose_name = 'Warehouse Stock'
        verbose_name_plural = 'Warehouse Stock'
        unique_together = ['warehouse', 'item']

    def __str__(self):
        return f"{self.item.name} at {self.warehouse.name}"

    def save(self, *args, **kwargs):
        # Calculate available quantity
        self.available_quantity = self.quantity - self.reserved_quantity
        super().save(*args, **kwargs)
