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
    
    # E-Invoice (LHDN) Settings
    path('e-invoice/settings/', views.EInvoiceSettingsListView.as_view(), name='einvoice_settings_list'),
    path('e-invoice/settings/<uuid:pk>/', views.EInvoiceSettingsDetailView.as_view(), name='einvoice_settings_detail'),
    path('e-invoice/settings/<uuid:pk>/test-connection/', views.test_e_invoice_connection, name='test_e_invoice_connection'),
    path('e-invoice/test-connection/', views.test_e_invoice_connection, name='test_e_invoice_connection_default'),
    
    # E-Invoice Operations
    path('invoices/<uuid:pk>/e-invoice/submit/', views.submit_e_invoice, name='submit_e_invoice'),
    path('invoices/<uuid:pk>/e-invoice/status/', views.get_e_invoice_status, name='get_e_invoice_status'),
    path('invoices/<uuid:pk>/e-invoice/cancel/', views.cancel_e_invoice, name='cancel_e_invoice'),
    path('invoices/<uuid:pk>/e-invoice/ubl/', views.generate_ubl_format, name='generate_ubl_format'),
    
    # E-Invoice Submission History
    path('invoices/<uuid:pk>/e-invoice/submissions/', views.get_e_invoice_submissions, name='get_e_invoice_submissions'),
    path('e-invoice/submissions/<uuid:submission_id>/', views.get_e_invoice_submission_detail, name='get_e_invoice_submission_detail'),
    
    # Compliance Rules
    path('compliance/rules/', views.InvoiceComplianceRuleListView.as_view(), name='compliance_rules_list'),
    path('compliance/rules/<uuid:pk>/', views.InvoiceComplianceRuleDetailView.as_view(), name='compliance_rules_detail'),
    
    # Compliance Violations
    path('compliance/violations/', views.ComplianceViolationListView.as_view(), name='compliance_violations_list'),
    path('compliance/violations/<uuid:pk>/resolve/', views.resolve_compliance_violation, name='resolve_compliance_violation'),
    
    # Digital Certificates
    path('signatures/certificates/', views.DigitalCertificateListView.as_view(), name='certificates_list'),
    path('signatures/certificates/<uuid:pk>/', views.DigitalCertificateDetailView.as_view(), name='certificates_detail'),
    
    # Invoice Signatures
    path('signatures/', views.InvoiceSignatureListView.as_view(), name='signatures_list'),
    path('signatures/<uuid:pk>/', views.InvoiceSignatureDetailView.as_view(), name='signatures_detail'),
    
    # Tax Rates
    path('tax/rates/', views.TaxRateListView.as_view(), name='tax_rates_list'),
    path('tax/rates/<uuid:pk>/', views.TaxRateDetailView.as_view(), name='tax_rates_detail'),
    
    # Tax Categories
    path('tax/categories/', views.TaxCategoryListView.as_view(), name='tax_categories_list'),
    path('tax/categories/<uuid:pk>/', views.TaxCategoryDetailView.as_view(), name='tax_categories_detail'),
    
    # Invoicing Settings
    path('settings/', views.InvoicingSettingsView.as_view(), name='invoicing_settings'),
]
