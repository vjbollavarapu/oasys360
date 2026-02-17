"""
FX Conversion Serializers
"""
from rest_framework import serializers
from .models import ExchangeRate, CurrencyConversion, CurrencyConfig


class ExchangeRateSerializer(serializers.ModelSerializer):
    """Serializer for Exchange Rate"""
    from_currency_display = serializers.CharField(source='from_currency', read_only=True)
    to_currency_display = serializers.CharField(source='to_currency', read_only=True)
    
    class Meta:
        model = ExchangeRate
        fields = [
            'id', 'tenant', 'from_currency', 'from_currency_display',
            'to_currency', 'to_currency_display', 'rate', 'source',
            'provider', 'is_active', 'valid_from', 'valid_until',
            'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'last_updated', 'created_at']


class CurrencyConversionSerializer(serializers.ModelSerializer):
    """Serializer for Currency Conversion"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = CurrencyConversion
        fields = [
            'id', 'tenant', 'from_currency', 'to_currency',
            'from_amount', 'to_amount', 'exchange_rate',
            'exchange_rate_id', 'conversion_date', 'created_by',
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CurrencyConfigSerializer(serializers.ModelSerializer):
    """Serializer for Currency Config"""
    
    class Meta:
        model = CurrencyConfig
        fields = [
            'id', 'tenant', 'base_currency', 'default_exchange_rate_provider',
            'auto_update_rates', 'update_frequency_hours', 'last_rate_update',
            'api_key', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_rate_update']
        extra_kwargs = {
            'api_key': {'write_only': True}
        }

