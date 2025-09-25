from django.urls import path
from . import views

app_name = 'marketing_forms'

urlpatterns = [
    # Public endpoints (no authentication required)
    path('beta-program/', views.submit_beta_program_application, name='submit_beta_program'),
    path('early-access/', views.submit_early_access_request, name='submit_early_access'),
    path('founder-feedback/', views.submit_founder_feedback, name='submit_founder_feedback'),
    path('stats/', views.marketing_forms_stats, name='marketing_forms_stats'),
]
