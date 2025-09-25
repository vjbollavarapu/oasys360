from django.urls import path
from . import views

app_name = 'sales'

urlpatterns = [
    # Customers
    path('customers/', views.CustomerListView.as_view(), name='customer_list'),
    path('customers/<uuid:pk>/', views.CustomerDetailView.as_view(), name='customer_detail'),
    path('customers/search/', views.search_customers, name='search_customers'),
    path('customers/<uuid:customer_id>/orders/', views.customer_orders, name='customer_orders'),
    path('customers/summary/', views.customer_summary, name='customer_summary'),
    
    # Sales Orders
    path('orders/', views.SalesOrderListView.as_view(), name='order_list'),
    path('orders/<uuid:pk>/', views.SalesOrderDetailView.as_view(), name='order_detail'),
    path('orders/<uuid:pk>/approve/', views.approve_sales_order, name='approve_order'),
    path('orders/<uuid:pk>/ship/', views.ship_sales_order, name='ship_order'),
    path('orders/<uuid:sales_order_id>/lines/', views.SalesOrderLineListView.as_view(), name='order_lines'),
    
    # Sales Quotes
    path('quotes/', views.SalesQuoteListView.as_view(), name='quote_list'),
    path('quotes/<uuid:pk>/', views.SalesQuoteDetailView.as_view(), name='quote_detail'),
    path('quotes/<uuid:pk>/approve/', views.approve_sales_quote, name='approve_quote'),
    path('quotes/<uuid:pk>/convert/', views.convert_quote_to_order, name='convert_quote'),
    path('quotes/<uuid:sales_quote_id>/lines/', views.SalesQuoteLineListView.as_view(), name='quote_lines'),
    
    # Sales Statistics
    path('stats/', views.sales_stats, name='sales_stats'),
]
