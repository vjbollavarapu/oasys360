from django.urls import path
from . import views

app_name = 'invoicing'

urlpatterns = [
    # Invoices
    path('invoices/', views.InvoiceListView.as_view(), name='invoice_list'),
    path('invoices/<uuid:pk>/', views.InvoiceDetailView.as_view(), name='invoice_detail'),
    path('invoices/<uuid:pk>/approve/', views.approve_invoice, name='approve_invoice'),
    path('invoices/<uuid:pk>/send/', views.send_invoice, name='send_invoice'),
    path('invoices/<uuid:invoice_id>/lines/', views.InvoiceLineListView.as_view(), name='invoice_lines'),
    path('invoices/<uuid:invoice_id>/payments/', views.record_payment, name='record_payment'),
    path('invoices/search/', views.search_invoices, name='search_invoices'),
    path('invoices/stats/', views.invoice_stats, name='invoice_stats'),
    path('invoices/overdue/', views.overdue_invoices, name='overdue_invoices'),
    
    # Invoice Templates
    path('templates/', views.InvoiceTemplateListView.as_view(), name='template_list'),
    path('templates/<uuid:pk>/', views.InvoiceTemplateDetailView.as_view(), name='template_detail'),
    
    # Invoice Payments
    path('payments/', views.InvoicePaymentListView.as_view(), name='payment_list'),
    path('payments/<uuid:pk>/', views.InvoicePaymentDetailView.as_view(), name='payment_detail'),
    
    # Customer Invoices
    path('customers/<uuid:customer_id>/invoices/', views.customer_invoices, name='customer_invoices'),
]
