"""
URL configuration for tenants app
"""
from django.urls import path
from . import onboarding_views, views

app_name = 'tenants'

urlpatterns = [
    # Tenant info endpoint
    path('me/', views.tenant_me, name='tenant_me'),
    
    # Tenant settings endpoint
    path('settings/', views.tenant_settings, name='tenant_settings'),
    
    # Onboarding endpoints
    path('onboarding/status/', onboarding_views.OnboardingStatusView.as_view(), name='onboarding_status'),
    path('onboarding/progress/', onboarding_views.OnboardingProgressView.as_view(), name='onboarding_progress'),
    path('onboarding/step/1/', onboarding_views.OnboardingStep1View.as_view(), name='onboarding_step_1'),
    path('onboarding/step/2/', onboarding_views.OnboardingStep2View.as_view(), name='onboarding_step_2'),
    path('onboarding/step/3/', onboarding_views.OnboardingStep3View.as_view(), name='onboarding_step_3'),
    path('onboarding/step/4/', onboarding_views.OnboardingStep4View.as_view(), name='onboarding_step_4'),
    path('onboarding/step/5/', onboarding_views.OnboardingStep5View.as_view(), name='onboarding_step_5'),
]
