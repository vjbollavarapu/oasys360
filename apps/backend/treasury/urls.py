"""
Treasury URL Configuration
"""
from django.urls import path
from . import views

app_name = 'treasury'

urlpatterns = [
    path('unified/', views.unified_treasury, name='unified_treasury'),
    path('historical/', views.historical_balance, name='historical_balance'),
    path('runway/', views.treasury_runway, name='treasury_runway'),
]

