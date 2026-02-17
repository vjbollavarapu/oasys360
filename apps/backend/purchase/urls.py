from django.urls import path
from . import views

app_name = 'purchase'

urlpatterns = [
    # Suppliers
    path('suppliers/', views.SupplierListView.as_view(), name='supplier_list'),
    path('suppliers/<uuid:pk>/', views.SupplierDetailView.as_view(), name='supplier_detail'),
    path('suppliers/search/', views.search_suppliers, name='search_suppliers'),
    path('suppliers/<uuid:supplier_id>/orders/', views.supplier_orders, name='supplier_orders'),
    path('suppliers/<uuid:supplier_id>/payments/', views.record_purchase_payment, name='record_payment'),
    path('suppliers/summary/', views.supplier_summary, name='supplier_summary'),
    
    # Purchase Orders
    path('orders/', views.PurchaseOrderListView.as_view(), name='order_list'),
    path('orders/<uuid:pk>/', views.PurchaseOrderDetailView.as_view(), name='order_detail'),
    path('orders/<uuid:pk>/approve/', views.approve_purchase_order, name='approve_order'),
    path('orders/<uuid:pk>/receive/', views.receive_purchase_order, name='receive_order'),
    path('orders/<uuid:purchase_order_id>/lines/', views.PurchaseOrderLineListView.as_view(), name='order_lines'),
    path('orders/<uuid:purchase_order_id>/receipt/', views.create_receipt_from_order, name='create_receipt'),
    
    # Purchase Receipts
    path('receipts/', views.PurchaseReceiptListView.as_view(), name='receipt_list'),
    path('receipts/<uuid:pk>/', views.PurchaseReceiptDetailView.as_view(), name='receipt_detail'),
    path('receipts/<uuid:pk>/approve/', views.approve_purchase_receipt, name='approve_receipt'),
    path('receipts/<uuid:purchase_receipt_id>/lines/', views.PurchaseReceiptLineListView.as_view(), name='receipt_lines'),
    
    # Purchase Payments
    path('payments/', views.PurchasePaymentListView.as_view(), name='payment_list'),
    path('payments/<uuid:pk>/', views.PurchasePaymentDetailView.as_view(), name='payment_detail'),
    
    # Purchase Statistics
    path('stats/', views.purchase_stats, name='purchase_stats'),
    path('overview-stats/', views.purchase_overview_stats, name='purchase_overview_stats'),
    
    # Purchase Analytics
    path('analytics/', views.purchase_analytics, name='purchase_analytics'),
    
    # Purchase Approvals
    path('approvals/', views.PurchaseApprovalRequestListView.as_view(), name='approvals_list'),
    path('approvals/<uuid:pk>/', views.PurchaseApprovalRequestDetailView.as_view(), name='approvals_detail'),
    path('approvals/<uuid:pk>/approve/', views.approve_purchase_request, name='approve_purchase_request'),
    
    # Purchase Contracts
    path('contracts/', views.PurchaseContractListView.as_view(), name='contracts_list'),
    path('contracts/<uuid:pk>/', views.PurchaseContractDetailView.as_view(), name='contracts_detail'),
    
    # Purchase Settings
    path('settings/', views.PurchaseSettingsView.as_view(), name='purchase_settings'),
    
    # Vendor Identity Verification
    path('suppliers/<uuid:supplier_id>/verify-wallet/', views.verify_vendor_wallet, name='verify_vendor_wallet'),
    path('suppliers/<uuid:supplier_id>/register-wallet/', views.register_vendor_wallet, name='register_vendor_wallet'),
    path('vendor-wallets/', views.VendorWalletAddressListView.as_view(), name='vendor_wallet_list'),
    path('vendor-wallets/<uuid:pk>/', views.VendorWalletAddressDetailView.as_view(), name='vendor_wallet_detail'),
    path('vendor-wallets/<uuid:wallet_id>/verify/', views.verify_vendor_wallet_manual, name='verify_vendor_wallet_manual'),
    path('payments/check-before-processing/', views.check_payment_before_processing, name='check_payment_before_processing'),
    path('verification-logs/', views.VendorVerificationLogListView.as_view(), name='verification_log_list'),
    path('payment-blocks/', views.PaymentBlockListView.as_view(), name='payment_block_list'),
    path('payment-blocks/<uuid:pk>/', views.PaymentBlockDetailView.as_view(), name='payment_block_detail'),
    path('payment-blocks/<uuid:block_id>/resolve/', views.resolve_payment_block, name='resolve_payment_block'),
]
