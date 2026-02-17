"""
Treasury Views
Unified treasury dashboard endpoints
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from decimal import Decimal

from authentication.permissions import IsAccountant
from .treasury_service import TreasuryService


@api_view(['GET'])
@permission_classes([IsAccountant])
def unified_treasury(request):
    """Get unified treasury view aggregating fiat and crypto"""
    base_currency = request.query_params.get('currency', 'USD')
    
    treasury_data = TreasuryService.get_unified_treasury(
        tenant=request.user.tenant,
        base_currency=base_currency
    )
    
    return Response(treasury_data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def historical_balance(request):
    """Get historical treasury balance"""
    days = int(request.query_params.get('days', 30))
    
    historical_data = TreasuryService.get_historical_balance(
        tenant=request.user.tenant,
        days=days
    )
    
    return Response({
        'historical_balance': historical_data,
        'period_days': days,
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def treasury_runway(request):
    """Calculate treasury runway"""
    monthly_burn_rate = request.query_params.get('monthly_burn_rate')
    
    if not monthly_burn_rate:
        return Response(
            {'error': 'monthly_burn_rate parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        burn_rate = Decimal(str(monthly_burn_rate))
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid monthly_burn_rate format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    runway_data = TreasuryService.calculate_runway(
        tenant=request.user.tenant,
        monthly_burn_rate=burn_rate
    )
    
    return Response(runway_data)

