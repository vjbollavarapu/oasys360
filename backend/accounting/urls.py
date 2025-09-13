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
]
