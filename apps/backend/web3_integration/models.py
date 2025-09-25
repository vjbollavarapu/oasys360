from django.db import models
import uuid
from decimal import Decimal


class CryptoWallet(models.Model):
    """
    Crypto Wallet model for managing cryptocurrency wallets
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='crypto_wallets')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='crypto_wallets')
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    network = models.CharField(max_length=50, choices=[
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
        ('bitcoin', 'Bitcoin'),
        ('cardano', 'Cardano'),
        ('polkadot', 'Polkadot'),
    ])
    wallet_type = models.CharField(max_length=50, choices=[
        ('metamask', 'MetaMask'),
        ('walletconnect', 'WalletConnect'),
        ('coinbase', 'Coinbase Wallet'),
        ('trust_wallet', 'Trust Wallet'),
        ('hardware', 'Hardware Wallet'),
        ('exchange', 'Exchange Wallet'),
    ])
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False)
    balance = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    last_sync = models.DateTimeField(null=True, blank=True)
    public_key = models.CharField(max_length=255, blank=True)
    encrypted_private_key = models.TextField(blank=True)  # Encrypted private key
    mnemonic_phrase = models.TextField(blank=True)  # Encrypted mnemonic phrase
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crypto_wallets'
        verbose_name = 'Crypto Wallet'
        verbose_name_plural = 'Crypto Wallets'
        unique_together = ['tenant', 'address', 'network']

    def __str__(self):
        return f"{self.name} ({self.network})"

    def save(self, *args, **kwargs):
        # Ensure only one primary wallet per user per network
        if self.is_primary:
            CryptoWallet.objects.filter(
                tenant=self.tenant,
                user=self.user,
                network=self.network,
                is_primary=True
            ).update(is_primary=False)
        super().save(*args, **kwargs)

    def get_balance_usd(self):
        """Get wallet balance in USD"""
        # This would need integration with price APIs
        return self.balance * 0  # Placeholder


class CryptoTransaction(models.Model):
    """
    Crypto Transaction model for tracking cryptocurrency transactions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(CryptoWallet, on_delete=models.CASCADE, related_name='transactions')
    tx_hash = models.CharField(max_length=255, unique=True)
    from_address = models.CharField(max_length=255)
    to_address = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=30, decimal_places=18)
    token_symbol = models.CharField(max_length=10)
    token_address = models.CharField(max_length=255, blank=True)
    token_name = models.CharField(max_length=100, blank=True)
    gas_fee = models.DecimalField(max_digits=20, decimal_places=18, null=True, blank=True)
    gas_price = models.DecimalField(max_digits=20, decimal_places=18, null=True, blank=True)
    gas_limit = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    block_number = models.BigIntegerField(null=True, blank=True)
    block_hash = models.CharField(max_length=255, blank=True)
    transaction_type = models.CharField(max_length=50, choices=[
        ('transfer', 'Transfer'),
        ('swap', 'Swap'),
        ('stake', 'Stake'),
        ('unstake', 'Unstake'),
        ('mint', 'Mint'),
        ('burn', 'Burn'),
        ('contract_interaction', 'Contract Interaction'),
    ], default='transfer')
    contract_address = models.CharField(max_length=255, blank=True)
    function_name = models.CharField(max_length=100, blank=True)
    function_args = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crypto_transactions'
        verbose_name = 'Crypto Transaction'
        verbose_name_plural = 'Crypto Transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tx_hash[:10]}... - {self.amount} {self.token_symbol}"

    def get_amount_usd(self):
        """Get transaction amount in USD"""
        # This would need integration with price APIs
        return self.amount * 0  # Placeholder


class SmartContract(models.Model):
    """
    Smart Contract model for managing smart contracts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='smart_contracts')
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    network = models.CharField(max_length=50, choices=[
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
    ])
    contract_type = models.CharField(max_length=50, choices=[
        ('token', 'Token Contract'),
        ('nft', 'NFT Contract'),
        ('defi', 'DeFi Protocol'),
        ('dao', 'DAO Contract'),
        ('custom', 'Custom Contract'),
    ])
    abi = models.JSONField(null=True, blank=True)  # Contract ABI
    bytecode = models.TextField(blank=True)  # Contract bytecode
    source_code = models.TextField(blank=True)  # Contract source code
    compiler_version = models.CharField(max_length=50, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    deployment_tx = models.CharField(max_length=255, blank=True)
    deployment_block = models.BigIntegerField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smart_contracts'
        verbose_name = 'Smart Contract'
        verbose_name_plural = 'Smart Contracts'
        unique_together = ['address', 'network']

    def __str__(self):
        return f"{self.name} ({self.address[:10]}...)"


class DeFiProtocol(models.Model):
    """
    DeFi Protocol model for managing DeFi protocol integrations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='defi_protocols')
    name = models.CharField(max_length=255)
    protocol_type = models.CharField(max_length=50, choices=[
        ('lending', 'Lending'),
        ('dex', 'Decentralized Exchange'),
        ('yield_farming', 'Yield Farming'),
        ('staking', 'Staking'),
        ('insurance', 'Insurance'),
        ('derivatives', 'Derivatives'),
    ])
    network = models.CharField(max_length=50, choices=[
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
    ])
    contract_address = models.CharField(max_length=255)
    api_endpoint = models.URLField(blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'defi_protocols'
        verbose_name = 'DeFi Protocol'
        verbose_name_plural = 'DeFi Protocols'

    def __str__(self):
        return f"{self.name} ({self.protocol_type})"


class DeFiPosition(models.Model):
    """
    DeFi Position model for tracking DeFi positions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='defi_positions')
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='defi_positions')
    protocol = models.ForeignKey(DeFiProtocol, on_delete=models.CASCADE, related_name='positions')
    wallet = models.ForeignKey(CryptoWallet, on_delete=models.CASCADE, related_name='defi_positions')
    position_type = models.CharField(max_length=50, choices=[
        ('liquidity_provider', 'Liquidity Provider'),
        ('borrower', 'Borrower'),
        ('lender', 'Lender'),
        ('staker', 'Staker'),
        ('farmer', 'Yield Farmer'),
    ])
    token_address = models.CharField(max_length=255)
    token_symbol = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=30, decimal_places=18)
    apy = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    rewards_earned = models.DecimalField(max_digits=30, decimal_places=18, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'defi_positions'
        verbose_name = 'DeFi Position'
        verbose_name_plural = 'DeFi Positions'

    def __str__(self):
        return f"{self.position_type} - {self.amount} {self.token_symbol}"


class TokenPrice(models.Model):
    """
    Token Price model for tracking token prices
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token_address = models.CharField(max_length=255)
    token_symbol = models.CharField(max_length=10)
    network = models.CharField(max_length=50)
    price_usd = models.DecimalField(max_digits=20, decimal_places=8)
    price_btc = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    price_eth = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    market_cap = models.DecimalField(max_digits=30, decimal_places=2, null=True, blank=True)
    volume_24h = models.DecimalField(max_digits=30, decimal_places=2, null=True, blank=True)
    price_change_24h = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    source = models.CharField(max_length=100, default='coinmarketcap')
    timestamp = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'token_prices'
        verbose_name = 'Token Price'
        verbose_name_plural = 'Token Prices'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.token_symbol} - ${self.price_usd}"


class Web3IntegrationSettings(models.Model):
    """
    Web3 Integration Settings model for managing Web3 integrations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='web3_settings')
    network = models.CharField(max_length=50, choices=[
        ('ethereum', 'Ethereum'),
        ('polygon', 'Polygon'),
        ('bsc', 'Binance Smart Chain'),
        ('solana', 'Solana'),
    ])
    rpc_url = models.URLField()
    api_key = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'web3_integration_settings'
        verbose_name = 'Web3 Integration Setting'
        verbose_name_plural = 'Web3 Integration Settings'
        unique_together = ['tenant', 'network']

    def __str__(self):
        return f"{self.network} - {self.tenant.name}"
