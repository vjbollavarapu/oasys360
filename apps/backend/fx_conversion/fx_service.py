"""
FX Conversion Service
Real-time foreign exchange rate fetching and conversion
"""
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from typing import Dict, Optional
import logging
import requests

from .models import ExchangeRate, CurrencyConfig, CurrencyConversion

logger = logging.getLogger(__name__)


class FXConversionService:
    """Service for real-time FX conversion"""
    
    @staticmethod
    def get_exchange_rate(
        tenant,
        from_currency: str,
        to_currency: str,
        force_refresh: bool = False
    ) -> Optional[ExchangeRate]:
        """
        Get exchange rate for currency pair
        
        Args:
            tenant: Tenant instance
            from_currency: Source currency code
            to_currency: Target currency code
            force_refresh: Force refresh from API
        
        Returns:
            ExchangeRate instance or None
        """
        # Check for cached rate
        if not force_refresh:
            rate = ExchangeRate.objects.filter(
                tenant=tenant,
                from_currency=from_currency.upper(),
                to_currency=to_currency.upper(),
                is_active=True
            ).order_by('-valid_from').first()
            
            if rate:
                # Check if rate is still fresh (within 24 hours by default)
                config = FXConversionService._get_currency_config(tenant)
                max_age = timedelta(hours=config.update_frequency_hours if config else 24)
                
                if timezone.now() - rate.last_updated < max_age:
                    return rate
        
        # Fetch fresh rate from API
        return FXConversionService._fetch_and_save_rate(tenant, from_currency, to_currency)
    
    @staticmethod
    def _get_currency_config(tenant):
        """Get or create currency config for tenant"""
        config, created = CurrencyConfig.objects.get_or_create(
            tenant=tenant,
            defaults={
                'base_currency': 'USD',
                'default_exchange_rate_provider': 'exchangerate-api',
            }
        )
        return config
    
    @staticmethod
    def _fetch_and_save_rate(tenant, from_currency: str, to_currency: str) -> Optional[ExchangeRate]:
        """Fetch rate from API and save"""
        config = FXConversionService._get_currency_config(tenant)
        
        try:
            if config.default_exchange_rate_provider == 'exchangerate-api':
                rate = FXConversionService._fetch_from_exchangerate_api(
                    from_currency, to_currency, config.api_key
                )
            elif config.default_exchange_rate_provider == 'fixer':
                rate = FXConversionService._fetch_from_fixer(
                    from_currency, to_currency, config.api_key
                )
            else:
                logger.warning(f"Unsupported provider: {config.default_exchange_rate_provider}")
                return None
            
            if rate:
                # Save rate
                exchange_rate = ExchangeRate.objects.create(
                    tenant=tenant,
                    from_currency=from_currency.upper(),
                    to_currency=to_currency.upper(),
                    rate=Decimal(str(rate)),
                    source='api',
                    provider=config.default_exchange_rate_provider,
                    is_active=True,
                )
                
                # Update config last update time
                config.last_rate_update = timezone.now()
                config.save()
                
                return exchange_rate
            
        except Exception as e:
            logger.error(f"Error fetching exchange rate: {e}")
            return None
        
        return None
    
    @staticmethod
    def _fetch_from_exchangerate_api(from_currency: str, to_currency: str, api_key: str = None) -> Optional[float]:
        """Fetch rate from ExchangeRate-API"""
        try:
            if api_key:
                url = f"https://v6.exchangerate-api.com/v6/{api_key}/pair/{from_currency.upper()}/{to_currency.upper()}"
            else:
                url = f"https://api.exchangerate-api.com/v4/latest/{from_currency.upper()}"
            
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if api_key:
                return data.get('conversion_rate')
            else:
                rates = data.get('rates', {})
                return rates.get(to_currency.upper())
        except Exception as e:
            logger.error(f"Error fetching from ExchangeRate-API: {e}")
            return None
    
    @staticmethod
    def _fetch_from_fixer(from_currency: str, to_currency: str, api_key: str) -> Optional[float]:
        """Fetch rate from Fixer.io"""
        if not api_key:
            logger.warning("Fixer.io API key not configured")
            return None
        
        try:
            url = f"http://data.fixer.io/api/latest"
            params = {
                'access_key': api_key,
                'base': from_currency.upper(),
                'symbols': to_currency.upper(),
            }
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                rates = data.get('rates', {})
                return rates.get(to_currency.upper())
        except Exception as e:
            logger.error(f"Error fetching from Fixer.io: {e}")
            return None
    
    @staticmethod
    def convert_currency(
        tenant,
        from_currency: str,
        to_currency: str,
        amount: Decimal,
        user=None
    ) -> Dict:
        """
        Convert currency amount
        
        Returns:
            dict: {
                'from_currency': str,
                'to_currency': str,
                'from_amount': Decimal,
                'to_amount': Decimal,
                'exchange_rate': Decimal,
                'conversion_id': str
            }
        """
        if from_currency.upper() == to_currency.upper():
            return {
                'from_currency': from_currency.upper(),
                'to_currency': to_currency.upper(),
                'from_amount': amount,
                'to_amount': amount,
                'exchange_rate': Decimal('1'),
                'conversion_id': None
            }
        
        # Get exchange rate
        rate_obj = FXConversionService.get_exchange_rate(tenant, from_currency, to_currency)
        
        if not rate_obj:
            raise ValueError(f"Could not fetch exchange rate for {from_currency}/{to_currency}")
        
        # Perform conversion
        to_amount = amount * rate_obj.rate
        
        # Log conversion
        conversion = CurrencyConversion.objects.create(
            tenant=tenant,
            from_currency=from_currency.upper(),
            to_currency=to_currency.upper(),
            from_amount=amount,
            to_amount=to_amount,
            exchange_rate=rate_obj.rate,
            exchange_rate_id=rate_obj,
            created_by=user
        )
        
        return {
            'from_currency': from_currency.upper(),
            'to_currency': to_currency.upper(),
            'from_amount': str(amount),
            'to_amount': str(to_amount),
            'exchange_rate': str(rate_obj.rate),
            'conversion_id': str(conversion.id)
        }
    
    @staticmethod
    def get_currency_list() -> list:
        """Get list of supported currencies"""
        return [
            # Major currencies
            'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF',
            # Southeast Asian (SEA) currencies
            'SGD',  # Singapore Dollar
            'MYR',  # Malaysian Ringgit
            'THB',  # Thai Baht
            'IDR',  # Indonesian Rupiah
            'PHP',  # Philippine Peso
            'VND',  # Vietnamese Dong
            'MMK',  # Myanmar Kyat
            'KHR',  # Cambodian Riel
            'LAK',  # Lao Kip
            'BND',  # Brunei Dollar
            # Other Asian currencies
            'HKD', 'INR', 'KRW',
            # Other major currencies
            'BRL', 'MXN', 'ZAR', 'NZD', 'SEK', 'NOK', 'DKK',
            'PLN', 'CZK', 'HUF', 'RUB', 'TRY', 'AED', 'SAR', 'ILS',
        ]
    
    @staticmethod
    def update_all_rates(tenant, base_currency: str = 'USD') -> Dict:
        """Update exchange rates for all currency pairs"""
        config = FXConversionService._get_currency_config(tenant)
        currencies = FXConversionService.get_currency_list()
        
        updated_count = 0
        failed_count = 0
        
        for currency in currencies:
            if currency.upper() == base_currency.upper():
                continue
            
            try:
                rate_obj = FXConversionService._fetch_and_save_rate(
                    tenant, base_currency, currency
                )
                if rate_obj:
                    updated_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(f"Error updating rate for {base_currency}/{currency}: {e}")
                failed_count += 1
        
        # Update config
        config.last_rate_update = timezone.now()
        config.save()
        
        return {
            'updated': updated_count,
            'failed': failed_count,
            'total': len(currencies) - 1,
            'updated_at': timezone.now().isoformat()
        }

