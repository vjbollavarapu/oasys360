from django.urls import path
from . import views

app_name = 'banking'

urlpatterns = [
    # Bank Accounts
    path('accounts/', views.BankAccountListView.as_view(), name='account_list'),
    path('accounts/<uuid:pk>/', views.BankAccountDetailView.as_view(), name='account_detail'),
    path('accounts/<uuid:account_id>/transactions/', views.bank_account_transactions, name='account_transactions'),
    path('accounts/<uuid:account_id>/reconciliation/', views.bank_reconciliation, name='account_reconciliation'),
    path('accounts/summary/', views.account_summary, name='account_summary'),
    
    # Bank Transactions
    path('transactions/', views.BankTransactionListView.as_view(), name='transaction_list'),
    path('transactions/<uuid:pk>/', views.BankTransactionDetailView.as_view(), name='transaction_detail'),
    path('transactions/<uuid:transaction_id>/reconcile/', views.reconcile_transaction, name='reconcile_transaction'),
    path('transactions/search/', views.search_transactions, name='search_transactions'),
    
    # Bank Statements
    path('statements/', views.BankStatementListView.as_view(), name='statement_list'),
    path('statements/<uuid:pk>/', views.BankStatementDetailView.as_view(), name='statement_detail'),
    
    # Bank Integrations
    path('integrations/', views.BankIntegrationListView.as_view(), name='integration_list'),
    path('integrations/<uuid:pk>/', views.BankIntegrationDetailView.as_view(), name='integration_detail'),
    path('integrations/<uuid:integration_id>/sync/', views.sync_bank_data, name='sync_bank_data'),
    
    # Banking Statistics
    path('stats/', views.bank_stats, name='bank_stats'),
    
    # Bank Integration - Test Connection
    path('integrations/<uuid:pk>/test/', views.test_bank_integration, name='test_bank_integration'),
    
    # Plaid Connections
    path('plaid/connections/', views.PlaidConnectionListView.as_view(), name='plaid_connections_list'),
    path('plaid/connections/<uuid:pk>/', views.PlaidConnectionDetailView.as_view(), name='plaid_connections_detail'),
    path('plaid/connections/<uuid:pk>/sync/', views.sync_plaid_connection, name='sync_plaid_connection'),
    path('plaid/link-token/', views.create_plaid_link_token, name='create_plaid_link_token'),
    
    # Import/Export Jobs
    path('import-export/jobs/', views.ImportExportJobListView.as_view(), name='import_export_jobs_list'),
    path('import-export/jobs/<uuid:pk>/', views.ImportExportJobDetailView.as_view(), name='import_export_jobs_detail'),
    path('import-export/jobs/<uuid:pk>/process/', views.process_import_job, name='process_import_job'),
    path('import-export/export/', views.generate_export_job, name='generate_export_job'),
    
    # Banking Settings
    path('settings/', views.BankingSettingsView.as_view(), name='banking_settings'),
]
