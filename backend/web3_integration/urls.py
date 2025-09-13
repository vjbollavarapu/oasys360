from django.urls import path
from . import views

app_name = 'web3_integration'

urlpatterns = [
    # Crypto Wallets
    path('wallets/', views.CryptoWalletListView.as_view(), name='wallet_list'),
    path('wallets/<uuid:pk>/', views.CryptoWalletDetailView.as_view(), name='wallet_detail'),
    path('wallets/create/', views.create_wallet, name='create_wallet'),
    path('wallets/<uuid:wallet_id>/balance/', views.wallet_balance, name='wallet_balance'),
    path('wallets/<uuid:wallet_id>/transactions/', views.wallet_transactions, name='wallet_transactions'),
    path('wallets/<uuid:wallet_id>/send/', views.send_transaction, name='send_transaction'),
    
    # Crypto Transactions
    path('transactions/', views.CryptoTransactionListView.as_view(), name='transaction_list'),
    path('transactions/<uuid:pk>/', views.CryptoTransactionDetailView.as_view(), name='transaction_detail'),
    path('transactions/search/', views.search_transactions, name='search_transactions'),
    
    # Smart Contracts
    path('contracts/', views.SmartContractListView.as_view(), name='contract_list'),
    path('contracts/<uuid:pk>/', views.SmartContractDetailView.as_view(), name='contract_detail'),
    path('contracts/deploy/', views.deploy_contract, name='deploy_contract'),
    
    # DeFi Protocols
    path('protocols/', views.DeFiProtocolListView.as_view(), name='protocol_list'),
    path('protocols/<uuid:pk>/', views.DeFiProtocolDetailView.as_view(), name='protocol_detail'),
    
    # DeFi Positions
    path('positions/', views.DeFiPositionListView.as_view(), name='position_list'),
    path('positions/<uuid:pk>/', views.DeFiPositionDetailView.as_view(), name='position_detail'),
    path('positions/open/', views.open_defi_position, name='open_defi_position'),
    path('positions/<uuid:position_id>/close/', views.close_defi_position, name='close_defi_position'),
    
    # Token Prices
    path('token-prices/', views.TokenPriceListView.as_view(), name='token_price_list'),
    path('token-prices/<uuid:pk>/', views.TokenPriceDetailView.as_view(), name='token_price_detail'),
    path('token-prices/<str:token_address>/history/', views.token_price_history, name='token_price_history'),
    
    # Web3 Integration Settings
    path('settings/', views.Web3IntegrationSettingsListView.as_view(), name='settings_list'),
    path('settings/<uuid:pk>/', views.Web3IntegrationSettingsDetailView.as_view(), name='settings_detail'),
    
    # Statistics
    path('stats/', views.web3_stats, name='web3_stats'),
]
