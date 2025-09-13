from rest_framework import serializers
from decimal import Decimal
from .models import (
    CryptoWallet, CryptoTransaction, SmartContract, DeFiProtocol, 
    DeFiPosition, TokenPrice, Web3IntegrationSettings
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
        # Calculate total balance in USD (mock conversion)
        return obj.balance * Decimal('2000')  # Mock ETH price
    
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
        return sum(position.amount * Decimal('2000') for position in positions)  # Mock conversion


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
