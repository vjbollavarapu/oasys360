from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, F
from django.shortcuts import get_object_or_404

from .models import Item, ItemCategory, InventoryMovement, Warehouse, WarehouseStock
from .serializers import (
    ItemSerializer, ItemCategorySerializer, InventoryMovementSerializer,
    WarehouseSerializer, WarehouseStockSerializer, ItemDetailSerializer
)
from authentication.permissions import IsTenantMember


class ItemCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing item categories
    """
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
