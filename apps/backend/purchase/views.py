from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import (
    Supplier, PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, PurchaseReceiptLine, PurchasePayment,
    VendorWalletAddress, VendorVerificationLog, PaymentBlock, PurchaseApprovalRequest, PurchaseContract, PurchaseSettings
)
from .serializers import (
    SupplierSerializer, PurchaseOrderSerializer, PurchaseOrderLineSerializer,
    PurchaseOrderWithLinesSerializer, PurchaseReceiptSerializer, PurchaseReceiptLineSerializer,
    PurchaseReceiptWithLinesSerializer, PurchasePaymentSerializer, SupplierSummarySerializer,
    PurchaseStatsSerializer, PurchaseOrderSummarySerializer,
    VendorWalletAddressSerializer, VendorVerificationLogSerializer, PaymentBlockSerializer,
    PurchaseApprovalRequestSerializer, PurchaseContractSerializer, PurchaseSettingsSerializer
)
from backend.tenant_utils import get_request_tenant
from .vendor_verification_service import VendorVerificationService
from authentication.permissions import IsAccountant, IsTenantMember


class SupplierListView(generics.ListCreateAPIView):
    """List and create suppliers"""
    serializer_class = SupplierSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Supplier.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('name')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete supplier"""
    serializer_class = SupplierSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Supplier.objects.filter(tenant=self.request.user.tenant)


class PurchaseOrderListView(generics.ListCreateAPIView):
    """List and create purchase orders"""
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return PurchaseOrder.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-order_date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete purchase order"""
    serializer_class = PurchaseOrderWithLinesSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return PurchaseOrder.objects.filter(tenant=self.request.user.tenant)


class PurchaseOrderLineListView(generics.ListCreateAPIView):
    """List and create purchase order lines"""
    serializer_class = PurchaseOrderLineSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        purchase_order_id = self.kwargs.get('purchase_order_id')
        return PurchaseOrderLine.objects.filter(
            purchase_order__id=purchase_order_id,
            purchase_order__tenant=self.request.user.tenant
        )
    
    def perform_create(self, serializer):
        purchase_order = get_object_or_404(
            PurchaseOrder,
            id=self.kwargs.get('purchase_order_id'),
            tenant=self.request.user.tenant
        )
        serializer.save(purchase_order=purchase_order)


class PurchaseReceiptListView(generics.ListCreateAPIView):
    """List and create purchase receipts"""
    serializer_class = PurchaseReceiptSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return PurchaseReceipt.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-receipt_date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )


class PurchaseReceiptDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete purchase receipt"""
    serializer_class = PurchaseReceiptWithLinesSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return PurchaseReceipt.objects.filter(tenant=self.request.user.tenant)


class PurchaseReceiptLineListView(generics.ListCreateAPIView):
    """List and create purchase receipt lines"""
    serializer_class = PurchaseReceiptLineSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        purchase_receipt_id = self.kwargs.get('purchase_receipt_id')
        return PurchaseReceiptLine.objects.filter(
            purchase_receipt__id=purchase_receipt_id,
            purchase_receipt__tenant=self.request.user.tenant
        )
    
    def perform_create(self, serializer):
        purchase_receipt = get_object_or_404(
            PurchaseReceipt,
            id=self.kwargs.get('purchase_receipt_id'),
            tenant=self.request.user.tenant
        )
        serializer.save(purchase_receipt=purchase_receipt)


class PurchasePaymentListView(generics.ListCreateAPIView):
    """List and create purchase payments"""
    serializer_class = PurchasePaymentSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return PurchasePayment.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-payment_date')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class PurchasePaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete purchase payment"""
    serializer_class = PurchasePaymentSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return PurchasePayment.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def approve_purchase_order(request, pk):
    """Approve a purchase order"""
    purchase_order = get_object_or_404(
        PurchaseOrder,
        id=pk,
        tenant=request.user.tenant
    )
    
    if purchase_order.status != 'draft':
        return Response(
            {'error': 'Only draft orders can be approved'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    purchase_order.status = 'approved'
    purchase_order.approved_by = request.user
    purchase_order.approved_at = timezone.now()
    purchase_order.save()
    
    return Response({
        'message': 'Purchase order approved successfully',
        'purchase_order': PurchaseOrderSerializer(purchase_order).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def receive_purchase_order(request, pk):
    """Receive a purchase order"""
    purchase_order = get_object_or_404(
        PurchaseOrder,
        id=pk,
        tenant=request.user.tenant
    )
    
    if purchase_order.status not in ['approved', 'received']:
        return Response(
            {'error': 'Only approved orders can be received'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    purchase_order.status = 'received'
    purchase_order.received_at = timezone.now()
    purchase_order.save()
    
    return Response({
        'message': 'Purchase order received successfully',
        'purchase_order': PurchaseOrderSerializer(purchase_order).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def approve_purchase_receipt(request, pk):
    """Approve a purchase receipt"""
    purchase_receipt = get_object_or_404(
        PurchaseReceipt,
        id=pk,
        tenant=request.user.tenant
    )
    
    if purchase_receipt.status != 'draft':
        return Response(
            {'error': 'Only draft receipts can be approved'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    purchase_receipt.status = 'approved'
    purchase_receipt.approved_by = request.user
    purchase_receipt.approved_at = timezone.now()
    purchase_receipt.save()
    
    # Update received quantities in purchase order lines
    for receipt_line in purchase_receipt.lines.all():
        if receipt_line.purchase_order_line:
            order_line = receipt_line.purchase_order_line
            order_line.received_quantity += receipt_line.quantity_received
            order_line.save()
    
    return Response({
        'message': 'Purchase receipt approved successfully',
        'purchase_receipt': PurchaseReceiptSerializer(purchase_receipt).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def create_receipt_from_order(request, purchase_order_id):
    """Create a purchase receipt from a purchase order"""
    purchase_order = get_object_or_404(
        PurchaseOrder,
        id=purchase_order_id,
        tenant=request.user.tenant
    )
    
    if purchase_order.status != 'approved':
        return Response(
            {'error': 'Only approved orders can have receipts created'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create purchase receipt
    purchase_receipt = PurchaseReceipt.objects.create(
        tenant=purchase_order.tenant,
        company=purchase_order.company,
        supplier=purchase_order.supplier,
        receipt_number=f"PR-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        receipt_date=timezone.now().date(),
        purchase_order=purchase_order,
        status='draft',
        created_by=request.user
    )
    
    # Create receipt lines from order lines
    for order_line in purchase_order.lines.all():
        remaining_quantity = order_line.quantity - order_line.received_quantity
        if remaining_quantity > 0:
            PurchaseReceiptLine.objects.create(
                purchase_receipt=purchase_receipt,
                purchase_order_line=order_line,
                item=order_line.item,
                description=order_line.description,
                quantity_received=remaining_quantity,
                unit_price=order_line.unit_price
            )
    
    return Response({
        'message': 'Purchase receipt created successfully',
        'purchase_receipt': PurchaseReceiptSerializer(purchase_receipt).data
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def purchase_stats(request):
    """Get purchase statistics"""
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
    
    orders = PurchaseOrder.objects.filter(
        tenant=request.user.tenant,
        order_date__range=[start_date, end_date]
    )
    
    receipts = PurchaseReceipt.objects.filter(
        tenant=request.user.tenant,
        receipt_date__range=[start_date, end_date]
    )
    
    total_orders = orders.count()
    total_receipts = receipts.count()
    total_spent = sum(order.total_amount for order in orders)
    total_suppliers = Supplier.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    ).count()
    
    data = {
        'total_orders': total_orders,
        'total_receipts': total_receipts,
        'total_spent': total_spent,
        'total_suppliers': total_suppliers,
        'period_start': start_date,
        'period_end': end_date
    }
    
    serializer = PurchaseStatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def search_suppliers(request):
    """Search suppliers"""
    query = request.query_params.get('q', '')
    
    suppliers = Supplier.objects.filter(
        Q(name__icontains=query) |
        Q(email__icontains=query) |
        Q(phone__icontains=query),
        tenant=request.user.tenant,
        is_active=True
    ).order_by('name')
    
    serializer = SupplierSerializer(suppliers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def supplier_orders(request, supplier_id):
    """Get orders for a specific supplier"""
    supplier = get_object_or_404(
        Supplier,
        id=supplier_id,
        tenant=request.user.tenant
    )
    
    orders = PurchaseOrder.objects.filter(
        supplier=supplier,
        tenant=request.user.tenant
    ).order_by('-order_date')
    
    serializer = PurchaseOrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def supplier_summary(request):
    """Get summary of all suppliers"""
    suppliers = Supplier.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    )
    
    summary_data = []
    for supplier in suppliers:
        # Get last order date
        last_order = PurchaseOrder.objects.filter(
            supplier=supplier
        ).order_by('-order_date').first()
        
        summary_data.append({
            'supplier_id': supplier.id,
            'supplier_name': supplier.name,
            'email': supplier.email,
            'phone': supplier.phone,
            'total_orders': supplier.total_orders,
            'total_spent': supplier.total_spent,
            'last_order_date': last_order.order_date if last_order else None,
            'is_active': supplier.is_active
        })
    
    serializer = SupplierSummarySerializer(summary_data, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAccountant])
def record_purchase_payment(request, supplier_id):
    """Record a payment for a supplier"""
    supplier = get_object_or_404(
        Supplier,
        id=supplier_id,
        tenant=request.user.tenant
    )
    
    payment_data = request.data.copy()
    payment_data['supplier'] = supplier.id
    
    serializer = PurchasePaymentSerializer(data=payment_data)
    if serializer.is_valid():
        payment = serializer.save()
        
        return Response({
            'message': 'Payment recorded successfully',
            'payment': PurchasePaymentSerializer(payment).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# Vendor Identity Verification Views
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAccountant])
def verify_vendor_wallet(request, supplier_id):
    """Verify a wallet address for a supplier"""
    supplier = get_object_or_404(Supplier, id=supplier_id, tenant=request.user.tenant)
    
    wallet_address = request.data.get('wallet_address')
    network = request.data.get('network')
    verification_type = request.data.get('verification_type', 'manual')
    
    if not wallet_address or not network:
        return Response(
            {'error': 'wallet_address and network are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = VendorVerificationService.verify_wallet_address(
        tenant=request.user.tenant,
        supplier=supplier,
        wallet_address=wallet_address,
        network=network,
        verification_type=verification_type,
        user=request.user
    )
    
    return Response(result)


@api_view(['POST'])
@permission_classes([IsAccountant])
def check_payment_before_processing(request):
    """Check if payment should be blocked before processing"""
    supplier_id = request.data.get('supplier_id')
    wallet_address = request.data.get('wallet_address')
    network = request.data.get('network')
    amount = request.data.get('amount')
    currency = request.data.get('currency', 'USD')
    
    if not all([supplier_id, wallet_address, network, amount]):
        return Response(
            {'error': 'supplier_id, wallet_address, network, and amount are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    supplier = get_object_or_404(Supplier, id=supplier_id, tenant=request.user.tenant)
    purchase_order_id = request.data.get('purchase_order_id')
    invoice_id = request.data.get('invoice_id')
    
    purchase_order = None
    if purchase_order_id:
        purchase_order = get_object_or_404(
            PurchaseOrder,
            id=purchase_order_id,
            tenant=request.user.tenant
        )
    
    invoice = None
    if invoice_id:
        from invoicing.models import Invoice
        invoice = get_object_or_404(
            Invoice,
            id=invoice_id,
            tenant=request.user.tenant
        )
    
    result = VendorVerificationService.check_payment_before_processing(
        tenant=request.user.tenant,
        supplier=supplier,
        wallet_address=wallet_address,
        network=network,
        amount=Decimal(str(amount)),
        currency=currency,
        purchase_order=purchase_order,
        invoice=invoice,
        user=request.user
    )
    
    return Response(result)


class VendorWalletAddressListView(generics.ListCreateAPIView):
    """List and create vendor wallet addresses"""
    serializer_class = VendorWalletAddressSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        queryset = VendorWalletAddress.objects.filter(tenant=self.request.user.tenant)
        
        supplier_id = self.request.query_params.get('supplier_id')
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        
        return queryset.order_by('-is_primary', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class VendorWalletAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete vendor wallet address"""
    serializer_class = VendorWalletAddressSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return VendorWalletAddress.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def register_vendor_wallet(request, supplier_id):
    """Register a wallet address for a vendor"""
    supplier = get_object_or_404(Supplier, id=supplier_id, tenant=request.user.tenant)
    
    wallet_address = request.data.get('wallet_address')
    network = request.data.get('network')
    is_primary = request.data.get('is_primary', False)
    
    if not wallet_address or not network:
        return Response(
            {'error': 'wallet_address and network are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    wallet = VendorVerificationService.register_vendor_wallet(
        tenant=request.user.tenant,
        supplier=supplier,
        wallet_address=wallet_address,
        network=network,
        is_primary=is_primary,
        user=request.user
    )
    
    serializer = VendorWalletAddressSerializer(wallet)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAccountant])
def verify_vendor_wallet_manual(request, wallet_id):
    """Manually verify a vendor wallet address"""
    wallet = VendorVerificationService.verify_vendor_wallet(
        tenant=request.user.tenant,
        wallet_id=wallet_id,
        user=request.user
    )
    
    serializer = VendorWalletAddressSerializer(wallet)
    return Response(serializer.data)


class VendorVerificationLogListView(generics.ListAPIView):
    """List vendor verification logs"""
    serializer_class = VendorVerificationLogSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        queryset = VendorVerificationLog.objects.filter(tenant=self.request.user.tenant)
        
        supplier_id = self.request.query_params.get('supplier_id')
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(verification_status=status_filter)
        
        return queryset.order_by('-created_at')


class PaymentBlockListView(generics.ListAPIView):
    """List payment blocks"""
    serializer_class = PaymentBlockSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        queryset = PaymentBlock.objects.filter(tenant=self.request.user.tenant)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        supplier_id = self.request.query_params.get('supplier_id')
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        
        return queryset.order_by('-created_at')


class PaymentBlockDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update payment block"""
    serializer_class = PaymentBlockSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return PaymentBlock.objects.filter(tenant=self.request.user.tenant)
    
    def perform_update(self, serializer):
        if serializer.validated_data.get('status') in ['approved', 'resolved']:
            serializer.save(resolved_by=self.request.user, resolved_at=timezone.now())
        else:
            serializer.save()


@api_view(['POST'])
@permission_classes([IsAccountant])
def resolve_payment_block(request, block_id):
    """Resolve a payment block"""
    block = get_object_or_404(PaymentBlock, id=block_id, tenant=request.user.tenant)
    
    new_status = request.data.get('status')
    resolution_notes = request.data.get('resolution_notes', '')
    
    if new_status not in ['approved', 'resolved']:
        return Response(
            {'error': 'Status must be approved or resolved'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    block.status = new_status
    block.resolution_notes = resolution_notes
    block.resolved_by = request.user
    block.resolved_at = timezone.now()
    block.save()
    
    serializer = PaymentBlockSerializer(block)
    return Response(serializer.data)


# Purchase Overview Stats
@api_view(['GET'])
@permission_classes([IsAccountant])
def purchase_overview_stats(request):
    """Get purchase overview statistics"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    orders = PurchaseOrder.objects.filter(tenant=tenant)
    receipts = PurchaseReceipt.objects.filter(tenant=tenant)
    suppliers = Supplier.objects.filter(tenant=tenant, is_active=True)
    
    # Calculate statistics
    total_orders = orders.count()
    pending_orders = orders.filter(status__in=['draft', 'sent']).count()
    approved_orders = orders.filter(status='confirmed').count()
    received_orders = orders.filter(status__in=['partially_received', 'received']).count()
    
    total_spent = sum(order.total_amount for order in orders.filter(status='received'))
    pending_approvals = PurchaseApprovalRequest.objects.filter(tenant=tenant, status='pending').count()
    
    return Response({
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'approved_orders': approved_orders,
        'received_orders': received_orders,
        'total_spent': float(total_spent),
        'total_suppliers': suppliers.count(),
        'pending_approvals': pending_approvals
    })


# Purchase Analytics
@api_view(['GET'])
@permission_classes([IsAccountant])
def purchase_analytics(request):
    """Get purchase analytics data"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        today = date.today()
        start_date = today.replace(day=1)
        end_date = today
    
    orders = PurchaseOrder.objects.filter(
        tenant=tenant,
        order_date__range=[start_date, end_date]
    )
    
    # Spend by supplier
    spend_by_supplier = {}
    for order in orders.filter(status='received'):
        supplier_name = order.supplier.name
        spend_by_supplier[supplier_name] = spend_by_supplier.get(supplier_name, 0) + float(order.total_amount)
    
    # Spend by month
    spend_by_month = {}
    for order in orders.filter(status='received'):
        month_key = order.order_date.strftime('%Y-%m')
        spend_by_month[month_key] = spend_by_month.get(month_key, 0) + float(order.total_amount)
    
    # Top suppliers
    top_suppliers = sorted(spend_by_supplier.items(), key=lambda x: x[1], reverse=True)[:10]
    
    total_spend = sum(order.total_amount for order in orders.filter(status='received'))
    avg_order_value = total_spend / orders.filter(status='received').count() if orders.filter(status='received').count() > 0 else 0
    
    return Response({
        'total_spend': float(total_spend),
        'total_orders': orders.count(),
        'avg_order_value': float(avg_order_value),
        'spend_by_supplier': dict(top_suppliers),
        'spend_by_month': spend_by_month,
        'period_start': start_date,
        'period_end': end_date
    })


# Purchase Approval Views
class PurchaseApprovalRequestListView(generics.ListCreateAPIView):
    """List and create Purchase Approval Requests"""
    serializer_class = PurchaseApprovalRequestSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return PurchaseApprovalRequest.objects.none()
        status_filter = self.request.query_params.get('status')
        queryset = PurchaseApprovalRequest.objects.filter(tenant=tenant)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, requested_by=self.request.user)


class PurchaseApprovalRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Purchase Approval Request"""
    serializer_class = PurchaseApprovalRequestSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return PurchaseApprovalRequest.objects.none()
        return PurchaseApprovalRequest.objects.filter(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def approve_purchase_request(request, pk):
    """Approve a purchase approval request"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    approval_request = get_object_or_404(
        PurchaseApprovalRequest,
        id=pk,
        tenant=tenant,
        status='pending'
    )
    
    approval_request.status = 'approved'
    approval_request.approved_by = request.user
    approval_request.approved_at = timezone.now()
    approval_request.save()
    
    # Also approve the related purchase order if needed
    if approval_request.approval_type == 'purchase_order' and approval_request.purchase_order.status == 'draft':
        approval_request.purchase_order.status = 'confirmed'
        approval_request.purchase_order.approved_by = request.user
        approval_request.purchase_order.approved_at = timezone.now()
        approval_request.purchase_order.save()
    
    return Response({
        'message': 'Approval request approved successfully',
        'approval_request': PurchaseApprovalRequestSerializer(approval_request).data
    })


# Purchase Contract Views
class PurchaseContractListView(generics.ListCreateAPIView):
    """List and create Purchase Contracts"""
    serializer_class = PurchaseContractSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return PurchaseContract.objects.none()
        status_filter = self.request.query_params.get('status')
        queryset = PurchaseContract.objects.filter(tenant=tenant)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class PurchaseContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Purchase Contract"""
    serializer_class = PurchaseContractSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return PurchaseContract.objects.none()
        return PurchaseContract.objects.filter(tenant=tenant)


# Purchase Settings Views
class PurchaseSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update Purchase Settings"""
    serializer_class = PurchaseSettingsSerializer
    permission_classes = [IsAccountant]
    
    def get_object(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        company = getattr(self.request.user, 'company', None)
        settings, created = PurchaseSettings.objects.get_or_create(
            tenant=tenant,
            company=company
        )
        return settings
