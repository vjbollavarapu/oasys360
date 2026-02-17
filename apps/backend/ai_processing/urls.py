from django.urls import path
from . import views

app_name = 'ai_processing'

urlpatterns = [
    # Documents
    path('documents/', views.DocumentListView.as_view(), name='document_list'),
    path('documents/<uuid:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('documents/upload/', views.upload_document, name='upload_document'),
    path('documents/process/', views.process_document, name='process_document'),
    path('documents/search/', views.search_documents, name='search_documents'),
    path('documents/<uuid:document_id>/categorization/', views.document_categorization, name='document_categorization'),
    path('documents/<uuid:document_id>/extraction/', views.document_extraction, name='document_extraction'),
    
    # AI Categorization
    path('categorization/', views.AICategorizationListView.as_view(), name='categorization_list'),
    path('categorization/<uuid:pk>/', views.AICategorizationDetailView.as_view(), name='categorization_detail'),
    
    # AI Extraction Results
    path('extraction/', views.AIExtractionResultListView.as_view(), name='extraction_list'),
    path('extraction/<uuid:pk>/', views.AIExtractionResultDetailView.as_view(), name='extraction_detail'),
    
    # AI Processing Jobs
    path('jobs/', views.AIProcessingJobListView.as_view(), name='job_list'),
    path('jobs/<uuid:pk>/', views.AIProcessingJobDetailView.as_view(), name='job_detail'),
    
    # AI Models
    path('models/', views.AIModelListView.as_view(), name='model_list'),
    path('models/<uuid:pk>/', views.AIModelDetailView.as_view(), name='model_detail'),
    path('models/<uuid:model_id>/retrain/', views.retrain_model, name='retrain_model'),
    
    # Fraud Detection
    path('fraud/', views.detect_fraud, name='detect_fraud'),
    
    # Financial Forecasting
    path('forecasting/', views.forecast_financials, name='forecast_financials'),
    path('forecasting/models/', views.get_forecasting_models, name='get_forecasting_models'),
    
    # AI Engine Settings
    path('settings/', views.ai_settings, name='ai_settings'),
    
    # AI Processing Statistics
    path('stats/', views.ai_processing_stats, name='ai_processing_stats'),
]
