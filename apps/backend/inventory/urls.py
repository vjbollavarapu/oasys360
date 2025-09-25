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
    
    # Add any additional URL patterns here
    # path('reports/', views.InventoryReportsView.as_view(), name='inventory-reports'),
]
