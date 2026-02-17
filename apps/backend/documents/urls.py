from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the documents app
router = DefaultRouter()

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Document Templates
    path('templates/', views.DocumentTemplateListView.as_view(), name='document_templates_list'),
    path('templates/<uuid:pk>/', views.DocumentTemplateDetailView.as_view(), name='document_templates_detail'),
    
    # Document Workflows
    path('workflows/', views.DocumentWorkflowListView.as_view(), name='document_workflows_list'),
    path('workflows/<uuid:pk>/', views.DocumentWorkflowDetailView.as_view(), name='document_workflows_detail'),
    path('workflows/instances/', views.DocumentWorkflowInstanceListView.as_view(), name='document_workflow_instances_list'),
    path('workflows/instances/<uuid:pk>/', views.DocumentWorkflowInstanceDetailView.as_view(), name='document_workflow_instances_detail'),
    path('documents/<uuid:document_id>/start-workflow/', views.start_workflow, name='start_workflow'),
    path('workflows/instances/<uuid:instance_id>/steps/<uuid:step_id>/complete/', views.complete_workflow_step, name='complete_workflow_step'),
    
    # Document Storage
    path('storage/', views.DocumentStorageListView.as_view(), name='document_storage_list'),
    path('storage/<uuid:pk>/', views.DocumentStorageDetailView.as_view(), name='document_storage_detail'),
    path('storage/statistics/', views.storage_statistics, name='storage_statistics'),
    
    # Cloudflare R2 Direct Upload (for Flutter/mobile apps)
    path('upload/generate-url/', views.generate_upload_url, name='generate_upload_url'),
    
    # Document Settings
    path('settings/', views.DocumentSettingsView.as_view(), name='document_settings'),
]

