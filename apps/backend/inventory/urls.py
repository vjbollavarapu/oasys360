from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the inventory app
router = DefaultRouter()

# Register viewsets with the router
router.register(r'items', views.ItemViewSet)
router.register(r'categories', views.ItemCategoryViewSet)
router.register(r'movements', views.InventoryMovementViewSet)
router.register(r'warehouses', views.WarehouseViewSet)
router.register(r'warehouse-stock', views.WarehouseStockViewSet)

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Overview Stats
    path('stats/', views.inventory_overview_stats, name='inventory_overview_stats'),
    
    # Valuation
    path('valuations/', views.InventoryValuationViewSet.as_view({'get': 'list', 'post': 'create'}), name='inventory_valuations_list'),
    path('valuations/<uuid:pk>/', views.InventoryValuationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='inventory_valuations_detail'),
    path('valuations/calculate/', views.calculate_valuation, name='calculate_valuation'),
    
    # Reorder Points
    path('reorder-points/', views.reorder_points_list, name='reorder_points_list'),
    path('reorder-points/bulk-update/', views.bulk_update_reorder_points, name='bulk_update_reorder_points'),
    
    # Barcode Scanning
    path('barcode/lookup/', views.barcode_lookup, name='barcode_lookup'),
    path('items/<uuid:pk>/generate-barcode/', views.generate_barcode, name='generate_barcode'),
    
    # Settings
    path('settings/', views.InventorySettingsView.as_view(), name='inventory_settings'),
]
