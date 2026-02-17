"""
FX Conversion URL Configuration
"""
from django.urls import path
from . import views

app_name = 'fx_conversion'

urlpatterns = [
    path('rate/', views.get_exchange_rate, name='get_exchange_rate'),
    path('convert/', views.convert_currency, name='convert_currency'),
    path('currencies/', views.get_currency_list, name='get_currency_list'),
    path('rates/update/', views.update_exchange_rates, name='update_exchange_rates'),
    path('rates/', views.ExchangeRateListView.as_view(), name='exchange_rate_list'),
    path('conversions/', views.CurrencyConversionListView.as_view(), name='conversion_list'),
    path('config/', views.CurrencyConfigView.as_view(), name='currency_config'),
]

