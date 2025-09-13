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
]
