from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the reporting app
router = DefaultRouter()

# Register viewsets with the router
# router.register(r'reports', views.ReportViewSet)
# router.register(r'dashboards', views.DashboardViewSet)

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Add any additional URL patterns here
    # path('generate/', views.ReportGenerationView.as_view(), name='report-generation'),
]

