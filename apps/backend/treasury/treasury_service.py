"""
Unified Treasury Service
Aggregates fiat and crypto balances into a unified treasury view
"""
from django.db.models import Sum, Q
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

# Stablecoin addresses (for USD conversion)
STABLECOINS = {
    'ethereum': {
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    'polygon': {
        'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        'DAI': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    },
    'arbitrum': {
        'USDC': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        'DAI': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
}


class TreasuryService:
    """Service for unified treasury aggregation"""
    
    @staticmethod
    def get_unified_treasury(tenant, base_currency: str = 'USD') -> Dict:
        """
        Get unified treasury view aggregating fiat and crypto
        
        Returns:
            dict: {
                'total_balance_usd': Decimal,
                'fiat_breakdown': [...],
                'crypto_breakdown': [...],
                'by_currency': {...},
                'by_network': {...},
                'stablecoin_equivalent': Decimal,
            }
        """
        # Get fiat balances
        fiat_data = TreasuryService._get_fiat_balances(tenant)
        
        # Get crypto balances
        crypto_data = TreasuryService._get_crypto_balances(tenant)
        
        # Calculate totals
        total_fiat_usd = sum(
            acc.get('balance_usd', Decimal('0')) for acc in fiat_data
        )
        total_crypto_usd = sum(
            wallet.get('balance_usd', Decimal('0')) for wallet in crypto_data
        )
        total_balance_usd = total_fiat_usd + total_crypto_usd
        
        # Group by currency
        by_currency = TreasuryService._group_by_currency(fiat_data, crypto_data)
        
        # Group by network (crypto only)
        by_network = TreasuryService._group_by_network(crypto_data)
        
        # Calculate stablecoin equivalent
        stablecoin_equivalent = TreasuryService._calculate_stablecoin_equivalent(crypto_data)
        
        return {
            'total_balance_usd': total_balance_usd,
            'total_fiat_usd': total_fiat_usd,
            'total_crypto_usd': total_crypto_usd,
            'stablecoin_equivalent_usd': stablecoin_equivalent,
            'fiat_breakdown': fiat_data,
            'crypto_breakdown': crypto_data,
            'by_currency': by_currency,
            'by_network': by_network,
            'last_updated': datetime.now().isoformat(),
        }
    
    @staticmethod
    def _get_fiat_balances(tenant) -> List[Dict]:
        """Get fiat account balances"""
        try:
            from banking.models import BankAccount
            
            accounts = BankAccount.objects.filter(
                tenant=tenant,
                is_active=True
            )
            
            breakdown = []
            for account in accounts:
                # Convert to USD (simplified - would use FX rates)
                balance_usd = account.current_balance
                if account.currency != 'USD':
                    # TODO: Use real FX conversion
                    balance_usd = account.current_balance  # Placeholder
                
                breakdown.append({
                    'id': str(account.id),
                    'name': account.name,
                    'type': 'fiat',
                    'currency': account.currency,
                    'balance': account.current_balance,
                    'balance_usd': balance_usd,
                    'bank_name': account.bank_name,
                    'account_type': account.account_type,
                    'is_reconciled': account.is_reconciled,
                    'last_reconciliation_date': account.last_reconciliation_date.isoformat() if account.last_reconciliation_date else None,
                })
            
            return breakdown
        except Exception as e:
            logger.error(f"Error getting fiat balances: {e}")
            return []
    
    @staticmethod
    def _get_crypto_balances(tenant) -> List[Dict]:
        """Get crypto wallet balances"""
        try:
            from web3_integration.models import CryptoWallet, CryptoToken
            
            wallets = CryptoWallet.objects.filter(
                tenant=tenant,
                is_active=True
            )
            
            breakdown = []
            for wallet in wallets:
                # Get token balances for this wallet
                tokens = CryptoToken.objects.filter(wallet=wallet)
                
                wallet_total_usd = Decimal('0')
                token_breakdown = []
                
                for token in tokens:
                    # Convert to USD (simplified - would use price feeds)
                    balance_usd = token.balance * token.price_usd if token.price_usd else Decimal('0')
                    wallet_total_usd += balance_usd
                    
                    token_breakdown.append({
                        'symbol': token.symbol,
                        'balance': token.balance,
                        'balance_usd': balance_usd,
                        'price_usd': float(token.price_usd) if token.price_usd else 0,
                    })
                
                # Check if stablecoin
                is_stablecoin = TreasuryService._is_stablecoin(wallet.network, wallet.address)
                
                breakdown.append({
                    'id': str(wallet.id),
                    'name': wallet.name,
                    'type': 'crypto',
                    'network': wallet.network,
                    'address': wallet.address,
                    'wallet_type': wallet.wallet_type,
                    'total_balance_usd': wallet_total_usd,
                    'tokens': token_breakdown,
                    'is_stablecoin': is_stablecoin,
                    'last_sync': wallet.last_sync.isoformat() if wallet.last_sync else None,
                })
            
            return breakdown
        except Exception as e:
            logger.error(f"Error getting crypto balances: {e}")
            return []
    
    @staticmethod
    def _is_stablecoin(network: str, address: str) -> bool:
        """Check if address is a known stablecoin"""
        network_stablecoins = STABLECOINS.get(network.lower(), {})
        return address.lower() in [addr.lower() for addr in network_stablecoins.values()]
    
    @staticmethod
    def _group_by_currency(fiat_data: List[Dict], crypto_data: List[Dict]) -> Dict:
        """Group balances by currency"""
        by_currency = {}
        
        # Fiat currencies
        for account in fiat_data:
            currency = account['currency']
            if currency not in by_currency:
                by_currency[currency] = {
                    'currency': currency,
                    'total_balance': Decimal('0'),
                    'total_balance_usd': Decimal('0'),
                    'accounts': [],
                }
            by_currency[currency]['total_balance'] += account['balance']
            by_currency[currency]['total_balance_usd'] += account['balance_usd']
            by_currency[currency]['accounts'].append(account['name'])
        
        # Crypto currencies (grouped by token symbol)
        for wallet in crypto_data:
            for token in wallet.get('tokens', []):
                symbol = token['symbol']
                if symbol not in by_currency:
                    by_currency[symbol] = {
                        'currency': symbol,
                        'total_balance': Decimal('0'),
                        'total_balance_usd': Decimal('0'),
                        'wallets': [],
                    }
                by_currency[symbol]['total_balance'] += Decimal(str(token['balance']))
                by_currency[symbol]['total_balance_usd'] += token['balance_usd']
                by_currency[symbol]['wallets'].append(wallet['name'])
        
        # Convert Decimals to strings for JSON serialization
        for currency, data in by_currency.items():
            data['total_balance'] = str(data['total_balance'])
            data['total_balance_usd'] = str(data['total_balance_usd'])
        
        return by_currency
    
    @staticmethod
    def _group_by_network(crypto_data: List[Dict]) -> Dict:
        """Group crypto balances by network"""
        by_network = {}
        
        for wallet in crypto_data:
            network = wallet['network']
            if network not in by_network:
                by_network[network] = {
                    'network': network,
                    'total_balance_usd': Decimal('0'),
                    'wallet_count': 0,
                    'wallets': [],
                }
            by_network[network]['total_balance_usd'] += wallet['total_balance_usd']
            by_network[network]['wallet_count'] += 1
            by_network[network]['wallets'].append({
                'name': wallet['name'],
                'balance_usd': str(wallet['total_balance_usd']),
            })
        
        # Convert Decimals to strings
        for network, data in by_network.items():
            data['total_balance_usd'] = str(data['total_balance_usd'])
        
        return by_network
    
    @staticmethod
    def _calculate_stablecoin_equivalent(crypto_data: List[Dict]) -> Decimal:
        """Calculate total value in stablecoin equivalent (USD)"""
        stablecoin_value = Decimal('0')
        
        for wallet in crypto_data:
            if wallet.get('is_stablecoin'):
                stablecoin_value += wallet['total_balance_usd']
            else:
                # For non-stablecoins, convert to USD equivalent
                stablecoin_value += wallet['total_balance_usd']
        
        return stablecoin_value
    
    @staticmethod
    def get_historical_balance(tenant, days: int = 30) -> List[Dict]:
        """Get historical treasury balance"""
        # This would query historical transaction data
        # For now, return placeholder
        historical_data = []
        
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            # TODO: Calculate historical balance from transactions
            historical_data.append({
                'date': date.date().isoformat(),
                'balance_usd': Decimal('0'),  # Placeholder
            })
        
        return historical_data
    
    @staticmethod
    def calculate_runway(tenant, monthly_burn_rate: Decimal) -> Dict:
        """Calculate runway in months based on treasury and burn rate"""
        treasury = TreasuryService.get_unified_treasury(tenant)
        total_balance = Decimal(str(treasury['total_balance_usd']))
        
        if monthly_burn_rate <= 0:
            return {
                'runway_months': None,
                'runway_days': None,
                'message': 'Invalid burn rate',
            }
        
        runway_months = total_balance / monthly_burn_rate
        runway_days = runway_months * 30
        
        return {
            'runway_months': float(runway_months),
            'runway_days': int(runway_days),
            'total_balance_usd': str(total_balance),
            'monthly_burn_rate_usd': str(monthly_burn_rate),
            'calculated_at': datetime.now().isoformat(),
        }

