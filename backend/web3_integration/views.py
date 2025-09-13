from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta
import json

from .models import (
    CryptoWallet, CryptoTransaction, SmartContract, DeFiProtocol,
    DeFiPosition, TokenPrice, Web3IntegrationSettings
)
from .serializers import (
    CryptoWalletSerializer, CryptoTransactionSerializer, SmartContractSerializer,
    DeFiProtocolSerializer, DeFiPositionSerializer, TokenPriceSerializer,
    Web3IntegrationSettingsSerializer, WalletBalanceSerializer,
    TransactionSummarySerializer, DeFiPositionSummarySerializer, Web3StatsSerializer
)
from authentication.permissions import IsTenantMember


class CryptoWalletListView(generics.ListCreateAPIView):
    """List and create crypto wallets"""
    serializer_class = CryptoWalletSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return CryptoWallet.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('wallet_name')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class CryptoWalletDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete crypto wallet"""
    serializer_class = CryptoWalletSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return CryptoWallet.objects.filter(tenant=self.request.user.tenant)


class CryptoTransactionListView(generics.ListCreateAPIView):
    """List and create crypto transactions"""
    serializer_class = CryptoTransactionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return CryptoTransaction.objects.filter(
            wallet__tenant=self.request.user.tenant
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        # Get the wallet and ensure it belongs to the tenant
        wallet = get_object_or_404(
            CryptoWallet,
            id=serializer.validated_data['wallet'].id,
            tenant=self.request.user.tenant
        )
        serializer.save(wallet=wallet)


class CryptoTransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete crypto transaction"""
    serializer_class = CryptoTransactionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return CryptoTransaction.objects.filter(wallet__tenant=self.request.user.tenant)


class SmartContractListView(generics.ListCreateAPIView):
    """List and create smart contracts"""
    serializer_class = SmartContractSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return SmartContract.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('contract_name')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class SmartContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete smart contract"""
    serializer_class = SmartContractSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return SmartContract.objects.filter(tenant=self.request.user.tenant)


class DeFiProtocolListView(generics.ListCreateAPIView):
    """List and create DeFi protocols"""
    serializer_class = DeFiProtocolSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return DeFiProtocol.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('protocol_name')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class DeFiProtocolDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete DeFi protocol"""
    serializer_class = DeFiProtocolSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return DeFiProtocol.objects.filter(tenant=self.request.user.tenant)


class DeFiPositionListView(generics.ListCreateAPIView):
    """List and create DeFi positions"""
    serializer_class = DeFiPositionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return DeFiPosition.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class DeFiPositionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete DeFi position"""
    serializer_class = DeFiPositionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return DeFiPosition.objects.filter(tenant=self.request.user.tenant)


class TokenPriceListView(generics.ListCreateAPIView):
    """List and create token prices"""
    serializer_class = TokenPriceSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return TokenPrice.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-last_updated')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class TokenPriceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete token price"""
    serializer_class = TokenPriceSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return TokenPrice.objects.filter(tenant=self.request.user.tenant)


class Web3IntegrationSettingsListView(generics.ListCreateAPIView):
    """List and create Web3 integration settings"""
    serializer_class = Web3IntegrationSettingsSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return Web3IntegrationSettings.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        )
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class Web3IntegrationSettingsDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Web3 integration settings"""
    serializer_class = Web3IntegrationSettingsSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        return Web3IntegrationSettings.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def create_wallet(request):
    """Create a new crypto wallet"""
    wallet_name = request.data.get('wallet_name')
    wallet_type = request.data.get('wallet_type', 'ethereum')
    blockchain_network = request.data.get('blockchain_network', 'ethereum')
    
    if not wallet_name:
        return Response(
            {'error': 'Wallet name is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate a mock wallet address (in real implementation, this would use web3)
    import hashlib
    import time
    wallet_address = f"0x{hashlib.md5(f'{wallet_name}{time.time()}'.encode()).hexdigest()[:40]}"
    
    wallet = CryptoWallet.objects.create(
        tenant=request.user.tenant,
        wallet_name=wallet_name,
        wallet_address=wallet_address,
        wallet_type=wallet_type,
        blockchain_network=blockchain_network,
        private_key_encrypted="encrypted_private_key_placeholder",
        is_active=True
    )
    
    return Response({
        'message': 'Wallet created successfully',
        'wallet': CryptoWalletSerializer(wallet).data
    })


@api_view(['POST'])
@permission_classes([IsTenantMember])
def send_transaction(request, wallet_id):
    """Send a crypto transaction"""
    wallet = get_object_or_404(
        CryptoWallet,
        id=wallet_id,
        tenant=request.user.tenant
    )
    
    to_address = request.data.get('to_address')
    amount = request.data.get('amount')
    currency = request.data.get('currency', 'ETH')
    
    if not to_address or not amount:
        return Response(
            {'error': 'To address and amount are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate a mock transaction hash
    import hashlib
    import time
    transaction_hash = f"0x{hashlib.sha256(f'{wallet.wallet_address}{to_address}{amount}{time.time()}'.encode()).hexdigest()}"
    
    # Calculate USD amount (mock conversion)
    amount_usd = Decimal(amount) * Decimal('2000')  # Mock ETH price
    
    transaction = CryptoTransaction.objects.create(
        wallet=wallet,
        transaction_hash=transaction_hash,
        transaction_type='send',
        amount=Decimal(amount),
        amount_usd=amount_usd,
        currency=currency,
        fee=Decimal('0.001'),
        fee_usd=Decimal('2.00'),
        from_address=wallet.wallet_address,
        to_address=to_address,
        block_number=12345678,
        confirmations=12,
        status='confirmed',
        gas_used=21000,
        gas_price=Decimal('0.00000002')
    )
    
    return Response({
        'message': 'Transaction sent successfully',
        'transaction': CryptoTransactionSerializer(transaction).data
    })


@api_view(['GET'])
@permission_classes([IsTenantMember])
def wallet_balance(request, wallet_id):
    """Get wallet balance"""
    wallet = get_object_or_404(
        CryptoWallet,
        id=wallet_id,
        tenant=request.user.tenant
    )
    
    # Calculate balance from transactions
    transactions = CryptoTransaction.objects.filter(wallet=wallet)
    balance_eth = Decimal('0.00')
    balance_usd = Decimal('0.00')
    
    for transaction in transactions:
        if transaction.transaction_type == 'receive':
            balance_eth += transaction.amount
            balance_usd += transaction.amount_usd
        else:
            balance_eth -= transaction.amount
            balance_usd -= transaction.amount_usd
    
    data = {
        'wallet_id': wallet.id,
        'wallet_name': wallet.wallet_name,
        'wallet_address': wallet.wallet_address,
        'balance_eth': balance_eth,
        'balance_usd': balance_usd,
        'last_updated': timezone.now()
    }
    
    serializer = WalletBalanceSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsTenantMember])
def wallet_transactions(request, wallet_id):
    """Get transactions for a specific wallet"""
    wallet = get_object_or_404(
        CryptoWallet,
        id=wallet_id,
        tenant=request.user.tenant
    )
    
    transactions = CryptoTransaction.objects.filter(wallet=wallet).order_by('-created_at')
    serializer = CryptoTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def deploy_contract(request):
    """Deploy a smart contract"""
    contract_name = request.data.get('contract_name')
    contract_type = request.data.get('contract_type', 'erc20')
    abi = request.data.get('abi', '[]')
    bytecode = request.data.get('bytecode', '0x')
    
    if not contract_name:
        return Response(
            {'error': 'Contract name is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate a mock contract address
    import hashlib
    import time
    contract_address = f"0x{hashlib.sha256(f'{contract_name}{time.time()}'.encode()).hexdigest()[:40]}"
    
    contract = SmartContract.objects.create(
        tenant=request.user.tenant,
        contract_name=contract_name,
        contract_address=contract_address,
        contract_type=contract_type,
        blockchain_network='ethereum',
        abi=abi,
        bytecode=bytecode,
        is_verified=True,
        is_active=True,
        deployed_at=timezone.now()
    )
    
    return Response({
        'message': 'Contract deployed successfully',
        'contract': SmartContractSerializer(contract).data
    })


@api_view(['POST'])
@permission_classes([IsTenantMember])
def open_defi_position(request):
    """Open a DeFi position"""
    protocol_id = request.data.get('protocol_id')
    wallet_id = request.data.get('wallet_id')
    position_type = request.data.get('position_type', 'liquidity_provider')
    token_address = request.data.get('token_address')
    token_symbol = request.data.get('token_symbol', 'ETH')
    amount = request.data.get('amount')
    
    if not all([protocol_id, wallet_id, amount]):
        return Response(
            {'error': 'Protocol ID, wallet ID, and amount are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    protocol = get_object_or_404(DeFiProtocol, id=protocol_id, tenant=request.user.tenant)
    wallet = get_object_or_404(CryptoWallet, id=wallet_id, tenant=request.user.tenant)
    
    # Calculate USD value (mock conversion)
    value_usd = Decimal(amount) * Decimal('2000')  # Mock ETH price
    
    position = DeFiPosition.objects.create(
        tenant=request.user.tenant,
        protocol=protocol,
        wallet=wallet,
        position_type=position_type,
        token_address=token_address,
        token_symbol=token_symbol,
        amount=Decimal(amount),
        value_usd=value_usd,
        apy=Decimal('5.25'),
        is_active=True,
        opened_at=timezone.now()
    )
    
    return Response({
        'message': 'DeFi position opened successfully',
        'position': DeFiPositionSerializer(position).data
    })


@api_view(['POST'])
@permission_classes([IsTenantMember])
def close_defi_position(request, position_id):
    """Close a DeFi position"""
    position = get_object_or_404(
        DeFiPosition,
        id=position_id,
        tenant=request.user.tenant
    )
    
    if not position.is_active:
        return Response(
            {'error': 'Position is already closed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    position.is_active = False
    position.closed_at = timezone.now()
    position.save()
    
    return Response({
        'message': 'DeFi position closed successfully',
        'position': DeFiPositionSerializer(position).data
    })


@api_view(['GET'])
@permission_classes([IsTenantMember])
def web3_stats(request):
    """Get Web3 statistics"""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        # Default to current month
        today = date.today()
        start_date = today.replace(day=1)
        end_date = today
    else:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    wallets = CryptoWallet.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    )
    
    transactions = CryptoTransaction.objects.filter(
        wallet__tenant=request.user.tenant,
        created_at__date__range=[start_date, end_date]
    )
    
    defi_positions = DeFiPosition.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    )
    
    total_wallets = wallets.count()
    total_transactions = transactions.count()
    total_value_locked = sum(position.value_usd for position in defi_positions)
    total_defi_positions = defi_positions.count()
    
    data = {
        'total_wallets': total_wallets,
        'total_transactions': total_transactions,
        'total_value_locked': total_value_locked,
        'total_defi_positions': total_defi_positions,
        'period_start': start_date,
        'period_end': end_date
    }
    
    serializer = Web3StatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsTenantMember])
def search_transactions(request):
    """Search crypto transactions"""
    query = request.query_params.get('q', '')
    
    transactions = CryptoTransaction.objects.filter(
        Q(transaction_hash__icontains=query) |
        Q(from_address__icontains=query) |
        Q(to_address__icontains=query),
        wallet__tenant=request.user.tenant
    ).order_by('-created_at')
    
    serializer = CryptoTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsTenantMember])
def token_price_history(request, token_address):
    """Get token price history"""
    prices = TokenPrice.objects.filter(
        token_address=token_address,
        tenant=request.user.tenant
    ).order_by('-last_updated')
    
    serializer = TokenPriceSerializer(prices, many=True)
    return Response(serializer.data)
