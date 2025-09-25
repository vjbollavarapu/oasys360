from django.urls import path
from . import views

app_name = 'tenants'

urlpatterns = [
    # Tenant management
    path('', views.TenantListView.as_view(), name='tenant_list'),
    path('<uuid:pk>/', views.TenantDetailView.as_view(), name='tenant_detail'),
    path('stats/', views.TenantStatsView.as_view(), name='tenant_stats'),
    path('dashboard/', views.tenant_dashboard, name='tenant_dashboard'),
    path('<uuid:tenant_id>/upgrade/', views.upgrade_tenant_plan, name='upgrade_tenant_plan'),
    path('<uuid:tenant_id>/deactivate/', views.deactivate_tenant, name='deactivate_tenant'),
    
    # Company management
    path('companies/', views.CompanyListView.as_view(), name='company_list'),
    path('companies/<uuid:pk>/', views.CompanyDetailView.as_view(), name='company_detail'),
    path('companies/search/', views.search_companies, name='search_companies'),
    
    # Tenant invitations
    path('invitations/', views.TenantInvitationListView.as_view(), name='invitation_list'),
    path('invitations/<uuid:pk>/', views.TenantInvitationDetailView.as_view(), name='invitation_detail'),
]
