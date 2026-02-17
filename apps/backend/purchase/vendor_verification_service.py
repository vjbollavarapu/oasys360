"""
Vendor Identity Verification Service
Core business logic for wallet verification, risk scoring, and payment blocking
"""
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import logging
from typing import Dict, List, Optional, Tuple

from .models import Supplier, VendorWalletAddress, VendorVerificationLog, PaymentBlock

logger = logging.getLogger(__name__)


class VendorVerificationService:
    """Service for vendor wallet verification and fraud detection"""
    
    # Risk thresholds
    HIGH_RISK_THRESHOLD = Decimal('70.0')
    MEDIUM_RISK_THRESHOLD = Decimal('40.0')
    
    # Transaction history thresholds
    MIN_TRANSACTION_COUNT = 3
    MIN_TRANSACTION_AGE_DAYS = 30
    
    @staticmethod
    def verify_wallet_address(
        tenant,
        supplier: Supplier,
        wallet_address: str,
        network: str,
        verification_type: str = 'auto',
        user=None
    ) -> Dict:
        """
        Verify a wallet address for a supplier
        
        Returns:
            dict: {
                'status': 'passed'|'failed'|'warning'|'blocked',
                'risk_score': float,
                'risk_factors': list,
                'recommendation': 'approve'|'review'|'block',
                'transaction_history_match': bool,
                'address_found_in_history': bool,
                'transaction_count_found': int
            }
        """
        risk_factors = []
        risk_score = Decimal('0')
        transaction_count = 0
        address_found = False
        history_match = False
        
        # Check if address is already verified for this supplier
        existing_wallet = VendorWalletAddress.objects.filter(
            tenant=tenant,
            supplier=supplier,
            wallet_address=wallet_address.lower(),
            network=network
        ).first()
        
        if existing_wallet and existing_wallet.is_verified:
            return {
                'status': 'passed',
                'risk_score': float(existing_wallet.risk_score),
                'risk_factors': [],
                'recommendation': 'approve',
                'transaction_history_match': True,
                'address_found_in_history': True,
                'transaction_count_found': existing_wallet.transaction_count
            }
        
        # Check transaction history from Web3 integration
        transaction_count, address_found = VendorVerificationService._check_transaction_history(
            tenant, wallet_address, network, supplier
        )
        
        if address_found:
            history_match = True
            if transaction_count >= VendorVerificationService.MIN_TRANSACTION_COUNT:
                risk_score -= Decimal('20')  # Reduce risk for known address
            else:
                risk_factors.append(f'Low transaction count: {transaction_count}')
                risk_score += Decimal('10')
        else:
            risk_factors.append('Unknown wallet address - no transaction history found')
            risk_score += Decimal('40')
        
        # Check if address matches supplier's primary wallet
        if supplier.primary_wallet_address and supplier.primary_wallet_address.lower() == wallet_address.lower():
            risk_score -= Decimal('30')  # Significant reduction for primary wallet
        else:
            if supplier.primary_wallet_address:
                risk_factors.append('Wallet address does not match supplier primary wallet')
                risk_score += Decimal('25')
        
        # Check recent payment blocks for this address
        recent_blocks = PaymentBlock.objects.filter(
            tenant=tenant,
            wallet_address=wallet_address.lower(),
            network=network,
            status='blocked',
            created_at__gte=timezone.now() - timedelta(days=90)
        ).count()
        
        if recent_blocks > 0:
            risk_factors.append(f'Address has {recent_blocks} recent payment blocks')
            risk_score += Decimal('50')
        
        # Normalize risk score (0-100)
        risk_score = max(Decimal('0'), min(Decimal('100'), risk_score))
        
        # Determine status and recommendation
        if risk_score >= VendorVerificationService.HIGH_RISK_THRESHOLD:
            status = 'blocked'
            recommendation = 'block'
        elif risk_score >= VendorVerificationService.MEDIUM_RISK_THRESHOLD:
            status = 'warning'
            recommendation = 'review'
        else:
            status = 'passed'
            recommendation = 'approve'
        
        # Log verification
        log = VendorVerificationLog.objects.create(
            tenant=tenant,
            supplier=supplier,
            wallet_address=wallet_address.lower(),
            network=network,
            verification_type=verification_type,
            verification_status=status,
            risk_factors=risk_factors,
            transaction_history_match=history_match,
            address_found_in_history=address_found,
            transaction_count_found=transaction_count,
            recommendation=recommendation,
            verified_by=user
        )
        
        return {
            'status': status,
            'risk_score': float(risk_score),
            'risk_factors': risk_factors,
            'recommendation': recommendation,
            'transaction_history_match': history_match,
            'address_found_in_history': address_found,
            'transaction_count_found': transaction_count,
            'verification_id': str(log.id)
        }
    
    @staticmethod
    def _check_transaction_history(
        tenant,
        wallet_address: str,
        network: str,
        supplier: Supplier
    ) -> Tuple[int, bool]:
        """
        Check transaction history for wallet address
        
        Returns:
            tuple: (transaction_count, address_found)
        """
        try:
            from web3_integration.models import CryptoTransaction
            
            # Check transactions to/from this wallet
            transactions = CryptoTransaction.objects.filter(
                wallet__tenant=tenant,
                wallet__address__iexact=wallet_address.lower(),
                wallet__network=network
            ).count()
            
            # Also check if we've paid this supplier before with this address
            past_payments = PaymentBlock.objects.filter(
                tenant=tenant,
                supplier=supplier,
                wallet_address__iexact=wallet_address.lower(),
                network=network,
                status__in=['approved', 'resolved']
            ).count()
            
            total_count = transactions + past_payments
            return total_count, total_count > 0
        except Exception as e:
            logger.error(f"Error checking transaction history: {e}")
            return 0, False
    
    @staticmethod
    def check_payment_before_processing(
        tenant,
        supplier: Supplier,
        wallet_address: str,
        network: str,
        amount: Decimal,
        currency: str = 'USD',
        purchase_order=None,
        invoice=None,
        user=None
    ) -> Dict:
        """
        Check if payment should be blocked before processing
        
        Returns:
            dict: {
                'allowed': bool,
                'blocked': bool,
                'risk_score': float,
                'block_reason': str,
                'risk_factors': list,
                'block_id': str (if blocked)
            }
        """
        # Verify wallet first
        verification_result = VendorVerificationService.verify_wallet_address(
            tenant=tenant,
            supplier=supplier,
            wallet_address=wallet_address,
            network=network,
            verification_type='payment_check',
            user=user
        )
        
        if verification_result['recommendation'] == 'block':
            # Create payment block
            block = PaymentBlock.objects.create(
                tenant=tenant,
                supplier=supplier,
                purchase_order=purchase_order,
                invoice=invoice,
                wallet_address=wallet_address.lower(),
                network=network,
                amount=amount,
                currency=currency,
                block_reason='risk_score_threshold',
                risk_factors=verification_result['risk_factors'],
                status='blocked',
                blocked_by=user
            )
            
            return {
                'allowed': False,
                'blocked': True,
                'risk_score': verification_result['risk_score'],
                'block_reason': 'High risk score - payment blocked',
                'risk_factors': verification_result['risk_factors'],
                'block_id': str(block.id)
            }
        
        if verification_result['recommendation'] == 'review':
            return {
                'allowed': True,
                'blocked': False,
                'risk_score': verification_result['risk_score'],
                'block_reason': None,
                'risk_factors': verification_result['risk_factors'],
                'requires_review': True
            }
        
        return {
            'allowed': True,
            'blocked': False,
            'risk_score': verification_result['risk_score'],
            'block_reason': None,
            'risk_factors': []
        }
    
    @staticmethod
    def register_vendor_wallet(
        tenant,
        supplier: Supplier,
        wallet_address: str,
        network: str,
        is_primary: bool = False,
        user=None
    ) -> VendorWalletAddress:
        """Register a wallet address for a vendor"""
        wallet, created = VendorWalletAddress.objects.get_or_create(
            tenant=tenant,
            supplier=supplier,
            wallet_address=wallet_address.lower(),
            network=network,
            defaults={
                'is_primary': is_primary,
                'is_verified': False
            }
        )
        
        if is_primary:
            # Unset other primary wallets for this supplier
            VendorWalletAddress.objects.filter(
                tenant=tenant,
                supplier=supplier,
                is_primary=True
            ).exclude(id=wallet.id).update(is_primary=False)
            
            # Update supplier primary wallet
            supplier.primary_wallet_address = wallet_address.lower()
            supplier.wallet_network = network
            supplier.save()
        
        return wallet
    
    @staticmethod
    def verify_vendor_wallet(
        tenant,
        wallet_id: str,
        user
    ) -> VendorWalletAddress:
        """Manually verify a vendor wallet address"""
        wallet = VendorWalletAddress.objects.get(
            id=wallet_id,
            tenant=tenant
        )
        
        wallet.is_verified = True
        wallet.verification_date = timezone.now()
        wallet.verified_by = user
        wallet.save()
        
        # Update supplier verification status
        supplier = wallet.supplier
        supplier.wallet_verification_status = 'verified'
        supplier.wallet_verified_at = timezone.now()
        supplier.wallet_verified_by = user
        supplier.save()
        
        return wallet

