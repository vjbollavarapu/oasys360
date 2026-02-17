"""
FX Conversion Views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics
from decimal import Decimal

from authentication.permissions import IsAccountant
from .models import ExchangeRate, CurrencyConversion, CurrencyConfig
from .serializers import ExchangeRateSerializer, CurrencyConversionSerializer, CurrencyConfigSerializer
from .fx_service import FXConversionService


@api_view(['GET'])
@permission_classes([IsAccountant])
def get_exchange_rate(request):
    """Get exchange rate for currency pair"""
    from_currency = request.query_params.get('from')
    to_currency = request.query_params.get('to')
    force_refresh = request.query_params.get('refresh', 'false').lower() == 'true'
    
    if not from_currency or not to_currency:
        return Response(
            {'error': 'from and to currency parameters are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    rate = FXConversionService.get_exchange_rate(
        tenant=request.user.tenant,
        from_currency=from_currency,
        to_currency=to_currency,
        force_refresh=force_refresh
    )
    
    if not rate:
        return Response(
            {'error': f'Could not fetch exchange rate for {from_currency}/{to_currency}'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ExchangeRateSerializer(rate)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAccountant])
def convert_currency(request):
    """Convert currency amount"""
    from_currency = request.data.get('from_currency')
    to_currency = request.data.get('to_currency')
    amount = request.data.get('amount')
    
    if not all([from_currency, to_currency, amount]):
        return Response(
            {'error': 'from_currency, to_currency, and amount are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        amount_decimal = Decimal(str(amount))
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid amount format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = FXConversionService.convert_currency(
            tenant=request.user.tenant,
            from_currency=from_currency,
            to_currency=to_currency,
            amount=amount_decimal,
            user=request.user
        )
        return Response(result)
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Conversion failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAccountant])
def get_currency_list(request):
    """Get list of supported currencies"""
    currencies = FXConversionService.get_currency_list()
    return Response({'currencies': currencies})


@api_view(['POST'])
@permission_classes([IsAccountant])
def update_exchange_rates(request):
    """Update all exchange rates"""
    base_currency = request.data.get('base_currency', 'USD')
    
    result = FXConversionService.update_all_rates(
        tenant=request.user.tenant,
        base_currency=base_currency
    )
    
    return Response(result)


class ExchangeRateListView(generics.ListAPIView):
    """List exchange rates"""
    serializer_class = ExchangeRateSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        queryset = ExchangeRate.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        )
        
        from_currency = self.request.query_params.get('from_currency')
        if from_currency:
            queryset = queryset.filter(from_currency=from_currency.upper())
        
        return queryset.order_by('-last_updated')


class CurrencyConversionListView(generics.ListAPIView):
    """List currency conversions"""
    serializer_class = CurrencyConversionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return CurrencyConversion.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-conversion_date')


class CurrencyConfigView(generics.RetrieveUpdateAPIView):
    """Retrieve and update currency config"""
    serializer_class = CurrencyConfigSerializer
    permission_classes = [IsAccountant]
    
    def get_object(self):
        config, created = CurrencyConfig.objects.get_or_create(
            tenant=self.request.user.tenant
        )
        return config

