from rest_framework import serializers
from decimal import Decimal
from .models import (
    CryptoWallet, CryptoTransaction, SmartContract, DeFiProtocol, 
    DeFiPosition, TokenPrice, Web3IntegrationSettings
)
from .gnosis.models import (
    GnosisSafe, GnosisSafeOwner, GnosisSafeTransaction, GnosisSafeConfirmation
)
from .coinbase.models import (
    CoinbasePrimeConnection, CoinbasePrimeAccount, CoinbasePrimeOrder
)


class CryptoWalletSerializer(serializers.ModelSerializer):
    """Serializer for Crypto Wallet"""
    balance_usd = serializers.SerializerMethodField()
    total_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = CryptoWallet
        fields = [
            'id', 'tenant', 'user', 'name', 'address', 'network', 'wallet_type',
            'is_active', 'is_primary', 'balance', 'last_sync', 'public_key',
            'encrypted_private_key', 'mnemonic_phrase', 'balance_usd', 
            'total_transactions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_balance_usd(self, obj):
        # Calculate total balance in USD based on latest TokenPrice
        try:
            # Assuming 'ETH' for ethereum network, could be dynamic
            token_price = TokenPrice.objects.filter(
                token_symbol='ETH',
                tenant=obj.tenant
            ).latest('timestamp')
            return obj.balance * token_price.price_usd
        except TokenPrice.DoesNotExist:
            return Decimal('0.00')
    
    def get_total_transactions(self, obj):
        return obj.transactions.count()


class CryptoTransactionSerializer(serializers.ModelSerializer):
    """Serializer for Crypto Transaction"""
    wallet_name = serializers.CharField(source='wallet.name', read_only=True)
    transaction_hash_short = serializers.SerializerMethodField()
    
    class Meta:
        model = CryptoTransaction
        fields = [
            'id', 'wallet', 'wallet_name', 'tx_hash', 'transaction_hash_short',
            'transaction_type', 'amount', 'token_symbol', 'token_address', 'token_name',
            'gas_fee', 'gas_price', 'gas_limit', 'status', 'block_number', 'block_hash',
            'from_address', 'to_address', 'contract_address', 'function_name', 
            'function_args', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_transaction_hash_short(self, obj):
        if obj.tx_hash:
            return f"{obj.tx_hash[:10]}...{obj.tx_hash[-10:]}"
        return None


class SmartContractSerializer(serializers.ModelSerializer):
    """Serializer for Smart Contract"""
    contract_type_display = serializers.CharField(source='get_contract_type_display', read_only=True)
    
    class Meta:
        model = SmartContract
        fields = [
            'id', 'tenant', 'name', 'address', 'network', 'contract_type',
            'contract_type_display', 'abi', 'bytecode', 'source_code', 'compiler_version',
            'is_verified', 'is_active', 'deployment_tx', 'deployment_block', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DeFiProtocolSerializer(serializers.ModelSerializer):
    """Serializer for DeFi Protocol"""
    total_value_locked = serializers.SerializerMethodField()
    
    class Meta:
        model = DeFiProtocol
        fields = [
            'id', 'tenant', 'name', 'protocol_type', 'network', 'contract_address',
            'api_endpoint', 'api_key', 'is_active', 'settings', 'total_value_locked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_value_locked(self, obj):
        positions = DeFiPosition.objects.filter(protocol=obj)
        total_usd = Decimal('0.00')
        for position in positions:
            # Try to find price for the position's token
            try:
                price = TokenPrice.objects.filter(
                    token_address=position.token_address,
                    tenant=obj.tenant
                ).latest('timestamp').price_usd
            except TokenPrice.DoesNotExist:
                # Fallback to ETH price if specific token not found
                try:
                    price = TokenPrice.objects.filter(
                        token_symbol='ETH',
                        tenant=obj.tenant
                    ).latest('timestamp').price_usd
                except TokenPrice.DoesNotExist:
                    price = Decimal('0.00')
            
            total_usd += position.amount * price
            
        return total_usd


class DeFiPositionSerializer(serializers.ModelSerializer):
    """Serializer for DeFi Position"""
    protocol_name = serializers.CharField(source='protocol.name', read_only=True)
    wallet_name = serializers.CharField(source='wallet.name', read_only=True)
    
    class Meta:
        model = DeFiPosition
        fields = [
            'id', 'tenant', 'user', 'protocol', 'protocol_name', 'wallet', 'wallet_name',
            'position_type', 'token_address', 'token_symbol', 'amount', 'apy',
            'rewards_earned', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TokenPriceSerializer(serializers.ModelSerializer):
    """Serializer for Token Price"""
    class Meta:
        model = TokenPrice
        fields = [
            'id', 'token_address', 'token_symbol', 'network', 'price_usd', 'price_btc',
            'price_eth', 'market_cap', 'volume_24h', 'price_change_24h', 'source',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class Web3IntegrationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Web3 Integration Settings"""
    class Meta:
        model = Web3IntegrationSettings
        fields = [
            'id', 'tenant', 'network', 'rpc_url', 'api_key', 'is_active', 'settings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WalletBalanceSerializer(serializers.Serializer):
    """Serializer for Wallet Balance"""
    wallet_id = serializers.UUIDField()
    wallet_name = serializers.CharField()
    wallet_address = serializers.CharField()
    balance_eth = serializers.DecimalField(max_digits=20, decimal_places=18)
    balance_usd = serializers.DecimalField(max_digits=15, decimal_places=2)
    last_updated = serializers.DateTimeField()


class TransactionSummarySerializer(serializers.Serializer):
    """Serializer for Transaction Summary"""
    transaction_id = serializers.UUIDField()
    transaction_hash = serializers.CharField()
    transaction_type = serializers.CharField()
    amount = serializers.DecimalField(max_digits=20, decimal_places=18)
    amount_usd = serializers.DecimalField(max_digits=15, decimal_places=2)
    from_address = serializers.CharField()
    to_address = serializers.CharField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()


class DeFiPositionSummarySerializer(serializers.Serializer):
    """Serializer for DeFi Position Summary"""
    position_id = serializers.UUIDField()
    protocol_name = serializers.CharField()
    position_type = serializers.CharField()
    token_symbol = serializers.CharField()
    amount = serializers.DecimalField(max_digits=20, decimal_places=18)
    value_usd = serializers.DecimalField(max_digits=15, decimal_places=2)
    apy = serializers.DecimalField(max_digits=10, decimal_places=2)
    is_active = serializers.BooleanField()


class Web3StatsSerializer(serializers.Serializer):
    """Serializer for Web3 Statistics"""
    total_wallets = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
    total_value_locked = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_defi_positions = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()


# Gnosis Safe Serializers
class GnosisSafeOwnerSerializer(serializers.ModelSerializer):
    """Serializer for Gnosis Safe Owner"""
    
    class Meta:
        model = GnosisSafeOwner
        fields = [
            'id', 'safe', 'owner_address', 'name', 'is_active', 'added_at'
        ]
        read_only_fields = ['id', 'added_at']


class GnosisSafeConfirmationSerializer(serializers.ModelSerializer):
    """Serializer for Gnosis Safe Confirmation"""
    owner_address = serializers.CharField(source='owner.owner_address', read_only=True)
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    
    class Meta:
        model = GnosisSafeConfirmation
        fields = [
            'id', 'transaction', 'owner', 'owner_address', 'owner_name',
            'signature', 'confirmed_at'
        ]
        read_only_fields = ['id', 'confirmed_at']


class GnosisSafeTransactionSerializer(serializers.ModelSerializer):
    """Serializer for Gnosis Safe Transaction"""
    safe_name = serializers.CharField(source='safe.name', read_only=True)
    safe_address = serializers.CharField(source='safe.safe_address', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    confirmations = GnosisSafeConfirmationSerializer(many=True, read_only=True)
    
    class Meta:
        model = GnosisSafeTransaction
        fields = [
            'id', 'tenant', 'safe', 'safe_name', 'safe_address', 'safe_tx_hash',
            'to_address', 'value', 'data', 'operation', 'status', 'confirmations_count',
            'confirmations_required', 'nonce', 'submitted_at', 'executed_at',
            'execution_tx_hash', 'created_by', 'created_by_name', 'confirmations',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at', 'executed_at']


class GnosisSafeSerializer(serializers.ModelSerializer):
    """Serializer for Gnosis Safe"""
    owners = GnosisSafeOwnerSerializer(many=True, read_only=True)
    total_transactions = serializers.SerializerMethodField()
    pending_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = GnosisSafe
        fields = [
            'id', 'tenant', 'name', 'safe_address', 'network', 'threshold',
            'owner_count', 'version', 'is_active', 'last_sync', 'balance',
            'owners', 'total_transactions', 'pending_transactions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner_count']
    
    def get_total_transactions(self, obj):
        return obj.transactions.count()
    
    def get_pending_transactions(self, obj):
        return obj.transactions.filter(status='pending').count()


# Coinbase Prime Serializers
class CoinbasePrimeConnectionSerializer(serializers.ModelSerializer):
    """Serializer for Coinbase Prime Connection"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    total_accounts = serializers.SerializerMethodField()
    
    class Meta:
        model = CoinbasePrimeConnection
        fields = [
            'id', 'tenant', 'name', 'api_key', 'api_secret', 'passphrase',
            'portfolio_id', 'environment', 'is_active', 'last_sync',
            'created_by', 'created_by_name', 'total_accounts',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_sync']
        extra_kwargs = {
            'api_key': {'write_only': True},
            'api_secret': {'write_only': True},
            'passphrase': {'write_only': True},
        }
    
    def get_total_accounts(self, obj):
        return obj.accounts.count()


class CoinbasePrimeAccountSerializer(serializers.ModelSerializer):
    """Serializer for Coinbase Prime Account"""
    connection_name = serializers.CharField(source='connection.name', read_only=True)
    
    class Meta:
        model = CoinbasePrimeAccount
        fields = [
            'id', 'tenant', 'connection', 'connection_name', 'account_id',
            'account_name', 'account_type', 'currency', 'balance',
            'available_balance', 'last_sync', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_sync']


class CoinbasePrimeOrderSerializer(serializers.ModelSerializer):
    """Serializer for Coinbase Prime Order"""
    connection_name = serializers.CharField(source='connection.name', read_only=True)
    
    class Meta:
        model = CoinbasePrimeOrder
        fields = [
            'id', 'tenant', 'connection', 'connection_name', 'order_id',
            'product_id', 'side', 'order_type', 'size', 'price', 'filled_size',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
