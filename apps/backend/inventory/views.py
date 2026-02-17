from rest_framework import viewsets, status, filters, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal

from .models import Item, ItemCategory, InventoryMovement, Warehouse, WarehouseStock, InventoryValuation, InventorySettings
from .serializers import (
    ItemSerializer, ItemCategorySerializer, InventoryMovementSerializer,
    WarehouseSerializer, WarehouseStockSerializer, ItemDetailSerializer,
    InventoryValuationSerializer, InventorySettingsSerializer, InventorySummarySerializer
)
from authentication.permissions import IsTenantMember


class ItemCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing item categories
    """
    queryset = ItemCategory.objects.none()  # Placeholder queryset for router
    serializer_class = ItemCategorySerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'parent']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return ItemCategory.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing inventory items
    """
    queryset = Item.objects.none()  # Placeholder queryset for router
    permission_classes = [IsAuthenticated, IsTenantMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'item_type', 'is_active', 'is_tracked', 'company']
    search_fields = ['name', 'sku', 'description', 'barcode']
    ordering_fields = ['name', 'sku', 'current_stock', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return Item.objects.filter(tenant=self.request.user.tenant)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ItemDetailSerializer
        return ItemSerializer

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get items with low stock levels"""
        items = self.get_queryset().filter(
            current_stock__lte=F('min_stock_level'),
            is_tracked=True
        )
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reorder_needed(self, request):
        """Get items that need reordering"""
        items = self.get_queryset().filter(
            current_stock__lte=F('reorder_point'),
            is_tracked=True
        )
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stock_summary(self, request):
        """Get inventory stock summary"""
        queryset = self.get_queryset()
        
        total_items = queryset.count()
        tracked_items = queryset.filter(is_tracked=True).count()
        low_stock_items = queryset.filter(
            current_stock__lte=F('min_stock_level'),
            is_tracked=True
        ).count()
        reorder_items = queryset.filter(
            current_stock__lte=F('reorder_point'),
            is_tracked=True
        ).count()
        
        # Calculate total inventory value
        total_value = queryset.aggregate(
            total_value=Sum(F('current_stock') * F('cost_price'))
        )['total_value'] or 0

        return Response({
            'total_items': total_items,
            'tracked_items': tracked_items,
            'low_stock_items': low_stock_items,
            'reorder_items': reorder_items,
            'total_inventory_value': float(total_value)
        })

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """Adjust stock level for an item"""
        item = self.get_object()
        quantity = request.data.get('quantity')
        movement_type = request.data.get('movement_type', 'adjustment_in')
        notes = request.data.get('notes', '')
        
        if not quantity:
            return Response(
                {'error': 'Quantity is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create inventory movement
        movement = InventoryMovement.objects.create(
            tenant=request.user.tenant,
            company=item.company,
            item=item,
            movement_type=movement_type,
            quantity=abs(float(quantity)),
            notes=notes,
            created_by=request.user
        )
        
        serializer = InventoryMovementSerializer(movement)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class InventoryMovementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing inventory movements
    """
    queryset = InventoryMovement.objects.none()  # Placeholder queryset for router
    serializer_class = InventoryMovementSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['item', 'movement_type', 'reference_type', 'created_by']
    search_fields = ['reference', 'notes', 'item__name', 'item__sku']
    ordering_fields = ['movement_date', 'quantity']
    ordering = ['-movement_date']

    def get_queryset(self):
        return InventoryMovement.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_item(self, request):
        """Get movements for a specific item"""
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response(
                {'error': 'item_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movements = self.get_queryset().filter(item_id=item_id)
        serializer = self.get_serializer(movements, many=True)
        return Response(serializer.data)


class WarehouseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing warehouses
    """
    queryset = Warehouse.objects.none()  # Placeholder queryset for router
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_primary', 'company']
    search_fields = ['name', 'code', 'city', 'state']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return Warehouse.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=True, methods=['get'])
    def stock_levels(self, request, pk=None):
        """Get stock levels for a warehouse"""
        warehouse = self.get_object()
        stock_levels = WarehouseStock.objects.filter(warehouse=warehouse)
        serializer = WarehouseStockSerializer(stock_levels, many=True)
        return Response(serializer.data)


class WarehouseStockViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing warehouse stock levels
    """
    queryset = WarehouseStock.objects.none()  # Placeholder queryset for router
    serializer_class = WarehouseStockSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['warehouse', 'item']
    search_fields = ['item__name', 'item__sku']
    ordering_fields = ['quantity', 'available_quantity', 'last_updated']
    ordering = ['-last_updated']

    def get_queryset(self):
        return WarehouseStock.objects.filter(
            warehouse__tenant=self.request.user.tenant
        )

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get warehouse stock levels that are low"""
        stock_levels = self.get_queryset().filter(
            available_quantity__lte=F('item__min_stock_level'),
            item__is_tracked=True
        )
        serializer = self.get_serializer(stock_levels, many=True)
        return Response(serializer.data)


# Inventory Overview Stats
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTenantMember])
def inventory_overview_stats(request):
    """Get inventory overview statistics"""
    tenant = request.user.tenant
    
    items = Item.objects.filter(tenant=tenant, is_active=True)
    tracked_items = items.filter(is_tracked=True)
    
    # Calculate statistics
    total_items = items.count()
    total_tracked = tracked_items.count()
    low_stock_items = tracked_items.filter(
        current_stock__lte=F('min_stock_level')
    ).count()
    reorder_items = tracked_items.filter(
        current_stock__lte=F('reorder_point')
    ).count()
    
    # Total inventory value
    total_value = tracked_items.aggregate(
        total=Sum(F('current_stock') * F('cost_price'))
    )['total'] or Decimal('0.00')
    
    # Total warehouses
    total_warehouses = Warehouse.objects.filter(tenant=tenant, is_active=True).count()
    
    # Recent movements (last 7 days)
    recent_movements = InventoryMovement.objects.filter(
        tenant=tenant,
        created_at__gte=timezone.now() - timezone.timedelta(days=7)
    ).count()
    
    return Response({
        'total_items': total_items,
        'tracked_items': total_tracked,
        'low_stock_items': low_stock_items,
        'reorder_items': reorder_items,
        'total_inventory_value': float(total_value),
        'total_warehouses': total_warehouses,
        'recent_movements': recent_movements
    })


# Inventory Valuation Views
class InventoryValuationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Inventory Valuations"""
    queryset = InventoryValuation.objects.none()
    serializer_class = InventoryValuationSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['valuation_method', 'company']
    ordering_fields = ['valuation_date', 'calculated_at']
    ordering = ['-valuation_date', '-calculated_at']
    
    def get_queryset(self):
        return InventoryValuation.objects.filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        tenant = self.request.user.tenant
        
        # Calculate total inventory value based on valuation method
        items = Item.objects.filter(tenant=tenant, is_tracked=True, is_active=True)
        
        total_value = Decimal('0.00')
        total_items = items.count()
        
        # Simple calculation - in real implementation, this would use the valuation method
        for item in items:
            total_value += item.get_total_value()
        
        serializer.save(
            tenant=tenant,
            total_inventory_value=total_value,
            total_items=total_items,
            calculated_by=self.request.user
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTenantMember])
def calculate_valuation(request):
    """Calculate inventory valuation"""
    tenant = request.user.tenant
    valuation_method = request.data.get('valuation_method', 'fifo')
    valuation_date = request.data.get('valuation_date', timezone.now().date())
    company_id = request.data.get('company_id')
    
    # Get items to value
    items = Item.objects.filter(tenant=tenant, is_tracked=True, is_active=True)
    if company_id:
        items = items.filter(company_id=company_id)
    
    total_value = Decimal('0.00')
    total_items = items.count()
    
    # Calculate based on valuation method
    for item in items:
        # Simplified calculation - real implementation would use FIFO/LIFO/etc
        total_value += item.get_total_value()
    
    # Create valuation record
    valuation_data = {
        'tenant': tenant.id,
        'company': company_id,
        'valuation_method': valuation_method,
        'valuation_date': valuation_date,
        'total_inventory_value': total_value,
        'total_items': total_items,
        'currency': 'USD',
        'calculated_by': request.user.id
    }
    
    serializer = InventoryValuationSerializer(data=valuation_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Reorder Points Views
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTenantMember])
def reorder_points_list(request):
    """Get items that need reordering"""
    tenant = request.user.tenant
    items = Item.objects.filter(
        tenant=tenant,
        is_tracked=True,
        is_active=True,
        current_stock__lte=F('reorder_point')
    ).order_by('current_stock')
    
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTenantMember])
def bulk_update_reorder_points(request):
    """Bulk update reorder points for multiple items"""
    tenant = request.user.tenant
    updates = request.data.get('updates', [])  # List of {item_id, reorder_point}
    
    updated_items = []
    for update in updates:
        item_id = update.get('item_id')
        reorder_point = update.get('reorder_point')
        
        if not item_id or reorder_point is None:
            continue
        
        try:
            item = Item.objects.get(id=item_id, tenant=tenant)
            item.reorder_point = Decimal(str(reorder_point))
            item.save()
            updated_items.append(ItemSerializer(item).data)
        except Item.DoesNotExist:
            continue
    
    return Response({
        'updated_count': len(updated_items),
        'items': updated_items
    })


# Barcode Scanning Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsTenantMember])
def barcode_lookup(request):
    """Lookup item by barcode"""
    tenant = request.user.tenant
    
    if request.method == 'GET':
        barcode = request.query_params.get('barcode')
    else:
        barcode = request.data.get('barcode')
    
    if not barcode:
        return Response(
            {'error': 'Barcode is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        item = Item.objects.get(tenant=tenant, barcode=barcode, is_active=True)
        serializer = ItemDetailSerializer(item)
        return Response(serializer.data)
    except Item.DoesNotExist:
        return Response(
            {'error': 'Item not found with barcode'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Item.MultipleObjectsReturned:
        # Return first match if multiple
        item = Item.objects.filter(tenant=tenant, barcode=barcode, is_active=True).first()
        serializer = ItemDetailSerializer(item)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTenantMember])
def generate_barcode(request, pk):
    """Generate barcode for an item"""
    tenant = request.user.tenant
    item = get_object_or_404(Item, id=pk, tenant=tenant)
    
    if item.barcode:
        return Response(
            {'error': 'Item already has a barcode'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate barcode (simple implementation - use actual barcode generation library)
    # For now, use SKU as barcode
    settings = InventorySettings.objects.filter(tenant=tenant).first()
    prefix = settings.barcode_prefix if settings else ''
    item.barcode = f"{prefix}{item.sku}"
    item.save()
    
    serializer = ItemSerializer(item)
    return Response(serializer.data)


# Inventory Settings Views
class InventorySettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update Inventory Settings"""
    serializer_class = InventorySettingsSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    
    def get_object(self):
        tenant = self.request.user.tenant
        company = getattr(self.request.user, 'company', None)
        settings, created = InventorySettings.objects.get_or_create(
            tenant=tenant,
            company=company
        )
        return settings
