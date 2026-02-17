from django.urls import path
from . import views

app_name = 'accounting'

urlpatterns = [
    # Chart of Accounts
    path('accounts/', views.ChartOfAccountsListView.as_view(), name='accounts_list'),
    path('accounts/<uuid:pk>/', views.ChartOfAccountsDetailView.as_view(), name='accounts_detail'),
    path('accounts/search/', views.search_accounts, name='search_accounts'),
    path('accounts/<uuid:account_id>/activity/', views.account_activity, name='account_activity'),
    
    # Journal Entries
    path('journal-entries/', views.JournalEntryListView.as_view(), name='journal_entries_list'),
    path('journal-entries/<uuid:pk>/', views.JournalEntryDetailView.as_view(), name='journal_entries_detail'),
    path('journal-entries/<uuid:pk>/post/', views.post_journal_entry, name='post_journal_entry'),
    path('journal-entries/<uuid:journal_entry_id>/lines/', views.JournalEntryLineListView.as_view(), name='journal_entry_lines'),
    
    # Financial Reports
    path('reports/trial-balance/', views.trial_balance, name='trial_balance'),
    path('reports/income-statement/', views.income_statement, name='income_statement'),
    path('reports/balance-sheet/', views.balance_sheet, name='balance_sheet'),
    
    # Fiscal Years
    path('fiscal-years/', views.FiscalYearListView.as_view(), name='fiscal_years_list'),
    path('fiscal-years/<uuid:pk>/', views.FiscalYearDetailView.as_view(), name='fiscal_years_detail'),
    
    # Fiscal Periods
    path('fiscal-periods/', views.FiscalPeriodListView.as_view(), name='fiscal_periods_list'),
    path('fiscal-periods/<uuid:pk>/', views.FiscalPeriodDetailView.as_view(), name='fiscal_periods_detail'),
    
    # Petty Cash Accounts
    path('petty-cash/accounts/', views.PettyCashAccountListView.as_view(), name='petty_cash_accounts_list'),
    path('petty-cash/accounts/<uuid:pk>/', views.PettyCashAccountDetailView.as_view(), name='petty_cash_accounts_detail'),
    
    # Petty Cash Transactions
    path('petty-cash/transactions/', views.PettyCashTransactionListView.as_view(), name='petty_cash_transactions_list'),
    path('petty-cash/transactions/<uuid:pk>/', views.PettyCashTransactionDetailView.as_view(), name='petty_cash_transactions_detail'),
    path('petty-cash/transactions/<uuid:pk>/approve/', views.approve_petty_cash_transaction, name='approve_petty_cash_transaction'),
    
    # Credit/Debit Notes
    path('credit-debit-notes/', views.CreditDebitNoteListView.as_view(), name='credit_debit_notes_list'),
    path('credit-debit-notes/<uuid:pk>/', views.CreditDebitNoteDetailView.as_view(), name='credit_debit_notes_detail'),
    
    # Accounting Settings
    path('settings/', views.AccountingSettingsView.as_view(), name='accounting_settings'),
]
