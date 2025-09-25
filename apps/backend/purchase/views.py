from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import Supplier, PurchaseOrder, PurchaseOrderLine, PurchaseReceipt, PurchaseReceiptLine, PurchasePayment
from .serializers import (
    SupplierSerializer, PurchaseOrderSerializer, PurchaseOrderLineSerializer,
    PurchaseOrderWithLinesSerializer, PurchaseReceiptSerializer, PurchaseReceiptLineSerializer,
    PurchaseReceiptWithLinesSerializer, PurchasePaymentSerializer, SupplierSummarySerializer,
    PurchaseStatsSerializer, PurchaseOrderSummarySerializer
)
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
