"""
FX Conversion Utilities
Helper functions for currency conversion
"""
from decimal import Decimal
from typing import Tuple, Optional
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def convert_to_base(
    amount: Decimal,
    currency_code: str,
    tenant_id: str,
    transaction_date: Optional[timezone.datetime] = None
) -> Tuple[Decimal, Decimal, Optional[str]]:
    """
    Convert amount to tenant's base currency
    
    Args:
        amount: Amount in transaction currency
        currency_code: Currency code of the transaction (e.g., 'USD', 'MYR')
        tenant_id: Tenant UUID string
        transaction_date: Optional transaction date (defaults to now)
    
    Returns:
        Tuple of (converted_amount, rate_used, base_currency_code)
        - converted_amount: Amount in base currency
        - rate_used: Exchange rate used for conversion
        - base_currency_code: Base currency code (e.g., 'MYR')
    
    Example:
        # Namecheap case: $10.00 USD for Malaysian tenant (base: MYR)
        converted, rate, base = convert_to_base(Decimal('10.00'), 'USD', tenant_id)
        # Returns: (Decimal('47.20'), Decimal('4.72'), 'MYR')
    """
    from fx_conversion.models import Currency, ExchangeRate
    from tenants.models import Tenant
    
    try:
        tenant = Tenant.objects.get(id=tenant_id)
    except Tenant.DoesNotExist:
        logger.error(f"Tenant {tenant_id} not found")
        return amount, Decimal('1.0'), currency_code
    
    # Get base currency
    base_currency = Currency.objects.filter(
        tenant=tenant,
        is_base_currency=True
    ).first()
    
    if not base_currency:
        # Fallback to tenant currency_code
        base_currency_code = getattr(tenant, 'currency_code', 'USD')
        logger.warning(f"No base currency found for tenant {tenant_id}, using {base_currency_code}")
        return amount, Decimal('1.0'), base_currency_code
    
    base_currency_code = base_currency.code
    
    # If same currency, no conversion needed
    if currency_code == base_currency_code:
        return amount, Decimal('1.0'), base_currency_code
    
    # Find latest exchange rate
    if transaction_date:
        # Find rate valid at transaction date
        rate_obj = ExchangeRate.objects.filter(
            tenant=tenant,
            from_currency=currency_code,
            to_currency=base_currency_code,
            is_active=True,
            valid_from__lte=transaction_date
        ).order_by('-valid_from').first()
    else:
        # Find latest active rate
        rate_obj = ExchangeRate.objects.filter(
            tenant=tenant,
            from_currency=currency_code,
            to_currency=base_currency_code,
            is_active=True
        ).order_by('-valid_from').first()
    
    if not rate_obj:
        logger.warning(
            f"No exchange rate found for {currency_code} -> {base_currency_code} "
            f"for tenant {tenant_id}. Using 1.0 as fallback."
        )
        return amount, Decimal('1.0'), base_currency_code
    
    # Convert amount
    rate_used = rate_obj.rate
    converted_amount = amount * rate_used
    
    return converted_amount, rate_used, base_currency_code

