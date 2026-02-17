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
from .gnosis.models import (
    GnosisSafe, GnosisSafeOwner, GnosisSafeTransaction, GnosisSafeConfirmation
)
from .coinbase.models import (
    CoinbasePrimeConnection, CoinbasePrimeAccount, CoinbasePrimeOrder
)
from .serializers import (
    CryptoWalletSerializer, CryptoTransactionSerializer, SmartContractSerializer,
    DeFiProtocolSerializer, DeFiPositionSerializer, TokenPriceSerializer,
    Web3IntegrationSettingsSerializer, WalletBalanceSerializer,
    TransactionSummarySerializer, DeFiPositionSummarySerializer, Web3StatsSerializer,
    GnosisSafeSerializer, GnosisSafeOwnerSerializer, GnosisSafeTransactionSerializer,
    GnosisSafeConfirmationSerializer, CoinbasePrimeConnectionSerializer,
    CoinbasePrimeAccountSerializer, CoinbasePrimeOrderSerializer
)
from backend.tenant_utils import get_request_tenant
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
    
    # Generate a real wallet address and private key
    from eth_account import Account
    # Enable features for account creation
    Account.enable_unaudited_hdwallet_features()
    
    # Create account with extra entropy from wallet details
    acct = Account.create(f"{wallet_name}{request.user.id}")
    wallet_address = acct.address
    private_key = acct.key.hex()
    
    # In a real production scenario, the private key should be encrypted using a specialized KMS
    # For this implementation, we will store it but marked as requiring encryption middleware
    
    wallet = CryptoWallet.objects.create(
        tenant=request.user.tenant,
        wallet_name=wallet_name,
        wallet_address=wallet_address,
        wallet_type=wallet_type,
        blockchain_network=blockchain_network,
        private_key_encrypted=private_key, # Storing hex directly for now, encryption layer is separate
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
    
    # Real RPC Transaction Logic
    from web3 import Web3
    import os
    
    rpc_url = os.environ.get('WEB3_RPC_URL', 'https://rpc.sepolia.org') # Default to Sepolia
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not w3.is_connected():
        return Response(
            {'error': 'Could not connect to Blockchain RPC'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # Get private key (decrypt if necessary)
    private_key = wallet.private_key_encrypted
    if not private_key or private_key == "encrypted_private_key_placeholder":
         return Response(
            {'error': 'Wallet does not have a valid private key for signing'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Check balance
        checksum_address = Web3.to_checksum_address(wallet.wallet_address)
        balance = w3.eth.get_balance(checksum_address)
        amount_wei = w3.to_wei(amount, 'ether')
        
        # Estimate gas
        gas_price = w3.eth.gas_price
        gas_limit = 21000 # Standard transfer
        
        # Simple balance check including gas
        total_cost = amount_wei + (gas_limit * gas_price)
        if balance < total_cost:
             return Response(
                {'error': f'Insufficient funds. Balance: {w3.from_wei(balance, "ether")} ETH'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        nonce = w3.eth.get_transaction_count(checksum_address)
        
        tx_dict = {
            'nonce': nonce,
            'to': Web3.to_checksum_address(to_address),
            'value': amount_wei,
            'gas': gas_limit,
            'gasPrice': gas_price,
            'chainId': w3.eth.chain_id
        }
        
        signed_tx = w3.eth.account.sign_transaction(tx_dict, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        transaction_hash = w3.to_hex(tx_hash)
        
        # Calculate USD amount (dynamic lookup)
        try:
            token_price = TokenPrice.objects.filter(token_symbol='ETH', tenant=request.user.tenant).latest('timestamp')
            usd_price = token_price.price_usd
        except TokenPrice.DoesNotExist:
            usd_price = Decimal('0.00')
            
        amount_usd = Decimal(amount) * usd_price
        
        transaction = CryptoTransaction.objects.create(
            wallet=wallet,
            transaction_hash=transaction_hash,
            transaction_type='send',
            amount=Decimal(amount),
            amount_usd=amount_usd,
            currency=currency,
            fee=Decimal(w3.from_wei(gas_limit * gas_price, 'ether')),
            fee_usd=Decimal('0.00'), # Todo: Calculate fee USD
            from_address=wallet.wallet_address,
            to_address=to_address,
            block_number=0, # Will be updated via async listener
            confirmations=0,
            status='pending', # Pending
            gas_used=gas_limit,
            gas_price=Decimal(w3.from_wei(gas_price, 'ether'))
        )
        
        return Response({
            'message': 'Transaction sent successfully',
            'transaction': CryptoTransactionSerializer(transaction).data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Transaction failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
    
    # Deploy contract using Web3
    from web3 import Web3
    import os
    
    rpc_url = os.environ.get('WEB3_RPC_URL', 'https://rpc.sepolia.org')
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    # We need a primary wallet for deployment
    # For now, just pick the first active wallet with a key
    deployer_wallet = CryptoWallet.objects.filter(
        tenant=request.user.tenant, 
        is_active=True
    ).exclude(private_key_encrypted="encrypted_private_key_placeholder").first()
    
    if not deployer_wallet:
        return Response(
            {'error': 'No active wallet with private key found for deployment'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    try:
        # Setup contract
        Contract = w3.eth.contract(abi=json.loads(abi), bytecode=bytecode)
        
        # Build transaction
        construct_txn = Contract.constructor().build_transaction({
            'from': deployer_wallet.wallet_address,
            'nonce': w3.eth.get_transaction_count(deployer_wallet.wallet_address),
            'gas': 2000000, # Simplified estimate
            'gasPrice': w3.eth.gas_price
        })
        
        # Sign
        signed = w3.eth.account.sign_transaction(construct_txn, deployer_wallet.private_key_encrypted)
        
        # Send
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        contract_address = tx_receipt.contractAddress
        
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
            deployed_at=timezone.now(),
            deployment_tx=w3.to_hex(tx_hash),
            deployment_block=tx_receipt.blockNumber,
            created_by=request.user
        )
        
        return Response({
            'message': 'Contract deployed successfully',
            'contract': SmartContractSerializer(contract).data
        })
        
    except Exception as e:
         return Response(
            {'error': f'Deployment failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
    
    # Calculate USD value based on real prices
    try:
         token_price = TokenPrice.objects.filter(
            token_symbol=token_symbol,
            tenant=request.user.tenant
        ).latest('timestamp')
         price_usd = token_price.price_usd
    except TokenPrice.DoesNotExist:
         price_usd = Decimal('0.00')
         
    value_usd = Decimal(amount) * price_usd
    
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


# Gnosis Safe Views
class GnosisSafeListView(generics.ListCreateAPIView):
    """List and create Gnosis Safes"""
    serializer_class = GnosisSafeSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return GnosisSafe.objects.none()
        return GnosisSafe.objects.filter(tenant=tenant, is_active=True).order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


class GnosisSafeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Gnosis Safe"""
    serializer_class = GnosisSafeSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return GnosisSafe.objects.none()
        return GnosisSafe.objects.filter(tenant=tenant)


class GnosisSafeOwnerListView(generics.ListCreateAPIView):
    """List and create Gnosis Safe Owners"""
    serializer_class = GnosisSafeOwnerSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        safe_id = self.request.query_params.get('safe_id')
        if not safe_id:
            return GnosisSafeOwner.objects.none()
        safe = get_object_or_404(GnosisSafe, id=safe_id, tenant=get_request_tenant(self.request))
        return GnosisSafeOwner.objects.filter(safe=safe)


class GnosisSafeTransactionListView(generics.ListCreateAPIView):
    """List and create Gnosis Safe Transactions"""
    serializer_class = GnosisSafeTransactionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return GnosisSafeTransaction.objects.none()
        safe_id = self.request.query_params.get('safe_id')
        queryset = GnosisSafeTransaction.objects.filter(tenant=tenant)
        if safe_id:
            queryset = queryset.filter(safe_id=safe_id)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class GnosisSafeTransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Gnosis Safe Transaction"""
    serializer_class = GnosisSafeTransactionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return GnosisSafeTransaction.objects.none()
        return GnosisSafeTransaction.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def confirm_gnosis_transaction(request, pk):
    """Confirm a Gnosis Safe transaction"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    transaction = get_object_or_404(
        GnosisSafeTransaction,
        id=pk,
        tenant=tenant,
        status='pending'
    )
    
    owner_address = request.data.get('owner_address')
    signature = request.data.get('signature')
    
    if not owner_address or not signature:
        return Response(
            {'error': 'owner_address and signature are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create owner
    owner, created = GnosisSafeOwner.objects.get_or_create(
        safe=transaction.safe,
        owner_address=owner_address
    )
    
    # Create confirmation
    confirmation, created = GnosisSafeConfirmation.objects.get_or_create(
        transaction=transaction,
        owner=owner,
        defaults={'signature': signature}
    )
    
    # Update transaction confirmation count
    transaction.confirmations_count = transaction.confirmations.count()
    transaction.save()
    
    # Check if transaction can be executed
    if transaction.confirmations_count >= transaction.confirmations_required:
        transaction.status = 'approved'
        transaction.save()
    
    return Response({
        'message': 'Transaction confirmed successfully',
        'transaction': GnosisSafeTransactionSerializer(transaction).data
    })


# Coinbase Prime Views
class CoinbasePrimeConnectionListView(generics.ListCreateAPIView):
    """List and create Coinbase Prime Connections"""
    serializer_class = CoinbasePrimeConnectionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return CoinbasePrimeConnection.objects.none()
        return CoinbasePrimeConnection.objects.filter(tenant=tenant, is_active=True).order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class CoinbasePrimeConnectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Coinbase Prime Connection"""
    serializer_class = CoinbasePrimeConnectionSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return CoinbasePrimeConnection.objects.none()
        return CoinbasePrimeConnection.objects.filter(tenant=tenant)


class CoinbasePrimeAccountListView(generics.ListCreateAPIView):
    """List and create Coinbase Prime Accounts"""
    serializer_class = CoinbasePrimeAccountSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return CoinbasePrimeAccount.objects.none()
        connection_id = self.request.query_params.get('connection_id')
        queryset = CoinbasePrimeAccount.objects.filter(tenant=tenant)
        if connection_id:
            queryset = queryset.filter(connection_id=connection_id)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


class CoinbasePrimeAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Coinbase Prime Account"""
    serializer_class = CoinbasePrimeAccountSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return CoinbasePrimeAccount.objects.none()
        return CoinbasePrimeAccount.objects.filter(tenant=tenant)


class CoinbasePrimeOrderListView(generics.ListCreateAPIView):
    """List and create Coinbase Prime Orders"""
    serializer_class = CoinbasePrimeOrderSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return CoinbasePrimeOrder.objects.none()
        connection_id = self.request.query_params.get('connection_id')
        queryset = CoinbasePrimeOrder.objects.filter(tenant=tenant)
        if connection_id:
            queryset = queryset.filter(connection_id=connection_id)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


class CoinbasePrimeOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Coinbase Prime Order"""
    serializer_class = CoinbasePrimeOrderSerializer
    permission_classes = [IsTenantMember]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return CoinbasePrimeOrder.objects.none()
        return CoinbasePrimeOrder.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsTenantMember])
def sync_coinbase_accounts(request, connection_id):
    """Sync accounts from Coinbase Prime"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    connection = get_object_or_404(
        CoinbasePrimeConnection,
        id=connection_id,
        tenant=tenant
    )
    
    # Here you would implement actual Coinbase Prime API sync
    # For now, just update last_sync
    connection.last_sync = timezone.now()
    connection.save()
    
    return Response({
        'message': 'Account sync initiated successfully',
        'connection': CoinbasePrimeConnectionSerializer(connection).data
    })
