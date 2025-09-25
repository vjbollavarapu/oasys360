from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from web3_integration.models import (
    CryptoWallet, CryptoTransaction, SmartContract, DeFiProtocol,
    DeFiPosition, TokenPrice, Web3IntegrationSettings
)
from tenants.models import Tenant, Company
from authentication.models import User


class Command(BaseCommand):
    help = 'Seed Web3 integration data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Web3 integration data...')
        
        # Get the first tenant and company
        tenant = Tenant.objects.first()
        if not tenant:
            self.stdout.write(self.style.ERROR('No tenant found. Please create a tenant first.'))
            return
        
        company = Company.objects.filter(tenant=tenant).first()
        if not company:
            self.stdout.write(self.style.ERROR('No company found. Please create a company first.'))
            return
        
        # Get a user for the wallets
        user = User.objects.filter(tenant=tenant).first()
        if not user:
            self.stdout.write(self.style.ERROR('No user found. Please create a user first.'))
            return
        
        # Create crypto wallets
        wallet1 = CryptoWallet.objects.create(
            tenant=tenant,
            user=user,
            name='Main Trading Wallet',
            address='0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            network='ethereum',
            wallet_type='metamask',
            is_active=True,
            balance=Decimal('2.0'),
            encrypted_private_key='encrypted_key_1'
        )
        
        wallet2 = CryptoWallet.objects.create(
            tenant=tenant,
            user=user,
            name='DeFi Wallet',
            address='0x8ba1f109551bD432803012645Hac136c772c3c7c',
            network='ethereum',
            wallet_type='metamask',
            is_active=True,
            balance=Decimal('1.5'),
            encrypted_private_key='encrypted_key_2'
        )
        
        # Create crypto transactions
        CryptoTransaction.objects.create(
            wallet=wallet1,
            tx_hash='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            transaction_type='transfer',
            amount=Decimal('2.5'),
            token_symbol='ETH',
            token_address='0x0000000000000000000000000000000000000000',
            token_name='Ethereum',
            gas_fee=Decimal('0.001'),
            gas_price=Decimal('0.00000002'),
            gas_limit=21000,
            status='confirmed',
            block_number=12345678,
            from_address='0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            to_address='0x8ba1f109551bD432803012645Hac136c772c3c7c'
        )
        
        CryptoTransaction.objects.create(
            wallet=wallet1,
            tx_hash='0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            transaction_type='transfer',
            amount=Decimal('0.5'),
            token_symbol='ETH',
            token_address='0x0000000000000000000000000000000000000000',
            token_name='Ethereum',
            gas_fee=Decimal('0.001'),
            gas_price=Decimal('0.00000002'),
            gas_limit=21000,
            status='confirmed',
            block_number=12345679,
            from_address='0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            to_address='0x1234567890abcdef1234567890abcdef1234567890'
        )
        
        # Create smart contracts
        contract1 = SmartContract.objects.create(
            tenant=tenant,
            name='OASYS Token',
            address='0x1234567890abcdef1234567890abcdef12345678',
            network='ethereum',
            contract_type='token',
            abi=[{"type":"function","name":"transfer","inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]}],
            bytecode='0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063a9059cbb1461003b578063dd62ed3e1461006b575b600080fd5b610055600480360381019061005091906100d7565b61009b565b604051610062919061012f565b60405180910390f35b61008560048036038101906100809190610150565b6100bd565b604051610092919061012f565b60405180910390f35b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6000602082840312156100e957600080fd5b60006100f5848461009b565b905092915050565b60008115159050919050565b610111816100fc565b82525050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061014282610117565b9050919050565b61015281610137565b82525050565b600060208201905061016d6000830184610108565b92915050565b6000806040838503121561018457600080fd5b6000610190858561009b565b92505060206101a18582860161009b565b915050925092905056fea2646970667358221220ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef64736f6c63430008120033',
            is_verified=True,
            is_active=True,
            created_by=user
        )
        
        # Create DeFi protocols
        protocol1 = DeFiProtocol.objects.create(
            tenant=tenant,
            name='Uniswap V3',
            protocol_type='dex',
            network='ethereum',
            contract_address='0xE592427A0AEce92De3Edee1F18E0157C05861564',
            api_endpoint='https://api.uniswap.org/v3/',
            is_active=True
        )
        
        protocol2 = DeFiProtocol.objects.create(
            tenant=tenant,
            name='Aave V3',
            protocol_type='lending',
            network='ethereum',
            contract_address='0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
            api_endpoint='https://api.aave.com/v3/',
            is_active=True
        )
        
        # Create DeFi positions
        DeFiPosition.objects.create(
            tenant=tenant,
            user=user,
            protocol=protocol1,
            wallet=wallet2,
            position_type='liquidity_provider',
            token_address='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            token_symbol='WETH',
            amount=Decimal('1.0'),
            apy=Decimal('15.5'),
            is_active=True
        )
        
        DeFiPosition.objects.create(
            tenant=tenant,
            user=user,
            protocol=protocol2,
            wallet=wallet2,
            position_type='lending',
            token_address='0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C',
            token_symbol='USDC',
            amount=Decimal('5000.0'),
            apy=Decimal('3.2'),
            is_active=True
        )
        
        # Create token prices
        TokenPrice.objects.create(
            token_address='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            token_symbol='WETH',
            network='ethereum',
            price_usd=Decimal('2000.00'),
            price_btc=Decimal('0.05'),
            price_eth=Decimal('1.0'),
            market_cap=Decimal('50000000000.00'),
            volume_24h=Decimal('1000000000.00'),
            price_change_24h=Decimal('2.5'),
            source='coinmarketcap'
        )
        
        TokenPrice.objects.create(
            token_address='0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C',
            token_symbol='USDC',
            network='ethereum',
            price_usd=Decimal('1.00'),
            price_btc=Decimal('0.000025'),
            price_eth=Decimal('0.0005'),
            market_cap=Decimal('25000000000.00'),
            volume_24h=Decimal('500000000.00'),
            price_change_24h=Decimal('0.0'),
            source='coinmarketcap'
        )
        
        # Create Web3 integration settings
        Web3IntegrationSettings.objects.create(
            tenant=tenant,
            network='ethereum',
            rpc_url='https://mainnet.infura.io/v3/your_project_id',
            api_key='your_infura_api_key_here',
            is_active=True
        )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully seeded Web3 integration data!')
        )
