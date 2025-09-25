from django.urls import path
from . import views

app_name = 'contact_sales'

urlpatterns = [
    # Public endpoints (no authentication required)
    path('contact-sales/', views.contact_sales_submit, name='contact_sales_submit'),
    
    # Admin endpoints (authentication required)
    path('inquiries/', views.SalesInquiryListView.as_view(), name='inquiry_list'),
    path('inquiries/<uuid:pk>/', views.SalesInquiryDetailView.as_view(), name='inquiry_detail'),
    path('inquiries/summary/', views.SalesInquirySummaryView.as_view(), name='inquiry_summary'),
    path('inquiries/search/', views.search_inquiries, name='search_inquiries'),
    path('inquiries/my-assigned/', views.my_assigned_inquiries, name='my_assigned_inquiries'),
    path('inquiries/recent/', views.recent_inquiries, name='recent_inquiries'),
    path('inquiries/stats/', views.SalesInquiryStatsView.as_view(), name='inquiry_stats'),
    path('inquiries/<uuid:pk>/mark-contacted/', views.mark_inquiry_contacted, name='mark_inquiry_contacted'),
    path('inquiries/<uuid:pk>/assign/', views.assign_inquiry, name='assign_inquiry'),
    path('inquiries/<uuid:inquiry_id>/responses/', views.SalesInquiryResponseView.as_view(), name='inquiry_responses'),
]
