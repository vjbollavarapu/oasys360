from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import Invoice, InvoiceLine, InvoiceTemplate, InvoicePayment, EInvoiceSettings
from .serializers import (
    InvoiceSerializer, InvoiceLineSerializer, InvoiceWithLinesSerializer,
    InvoiceTemplateSerializer, InvoicePaymentSerializer, EInvoiceSettingsSerializer,
    InvoiceStatsSerializer, InvoiceSummarySerializer
)
from authentication.permissions import IsAccountant, IsTenantMember
from sales.models import Customer


class InvoiceListView(generics.ListCreateAPIView):
    """List and create invoices"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Invoice.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-invoice_date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete invoice"""
    serializer_class = InvoiceWithLinesSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Invoice.objects.filter(tenant=self.request.user.tenant)


class InvoiceLineListView(generics.ListCreateAPIView):
    """List and create invoice lines"""
    serializer_class = InvoiceLineSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        invoice_id = self.kwargs.get('invoice_id')
        return InvoiceLine.objects.filter(
            invoice__id=invoice_id,
            invoice__tenant=self.request.user.tenant
        )
    
    def perform_create(self, serializer):
        invoice = get_object_or_404(
            Invoice,
            id=self.kwargs.get('invoice_id'),
            tenant=self.request.user.tenant
        )
        serializer.save(invoice=invoice)


class InvoiceTemplateListView(generics.ListCreateAPIView):
    """List and create invoice templates"""
    serializer_class = InvoiceTemplateSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return InvoiceTemplate.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        )
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class InvoiceTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete invoice template"""
    serializer_class = InvoiceTemplateSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return InvoiceTemplate.objects.filter(tenant=self.request.user.tenant)


class InvoicePaymentListView(generics.ListCreateAPIView):
    """List and create invoice payments"""
    serializer_class = InvoicePaymentSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return InvoicePayment.objects.filter(
            invoice__tenant=self.request.user.tenant
        ).order_by('-payment_date')


class InvoicePaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete invoice payment"""
    serializer_class = InvoicePaymentSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return InvoicePayment.objects.filter(invoice__tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def approve_invoice(request, pk):
    """Approve an invoice"""
    invoice = get_object_or_404(
        Invoice,
        id=pk,
        tenant=request.user.tenant
    )
    
    if invoice.status != 'draft':
        return Response(
            {'error': 'Only draft invoices can be approved'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    invoice.status = 'approved'
    invoice.approved_by = request.user
    invoice.approved_at = timezone.now()
    invoice.save()
    
    return Response({
        'message': 'Invoice approved successfully',
        'invoice': InvoiceSerializer(invoice).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def send_invoice(request, pk):
    """Send an invoice"""
    invoice = get_object_or_404(
        Invoice,
        id=pk,
        tenant=request.user.tenant
    )
    
    if invoice.status not in ['approved', 'sent']:
        return Response(
            {'error': 'Only approved invoices can be sent'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    invoice.status = 'sent'
    invoice.sent_at = timezone.now()
    invoice.save()
    
    # Here you would typically send the invoice via email or e-invoice
    # For now, we'll just update the status
    
    return Response({
        'message': 'Invoice sent successfully',
        'invoice': InvoiceSerializer(invoice).data
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def invoice_stats(request):
    """Get invoice statistics"""
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
    
    invoices = Invoice.objects.filter(
        tenant=request.user.tenant,
        invoice_date__range=[start_date, end_date]
    )
    
    total_invoices = invoices.count()
    total_amount = sum(invoice.total_amount for invoice in invoices)
    
    # Calculate paid amount
    paid_invoices = invoices.filter(status='paid')
    paid_amount = sum(invoice.total_amount for invoice in paid_invoices)
    
    # Calculate outstanding amount
    outstanding_invoices = invoices.filter(status__in=['sent', 'approved'])
    outstanding_amount = sum(invoice.total_amount for invoice in outstanding_invoices)
    
    # Calculate overdue amount
    overdue_invoices = outstanding_invoices.filter(due_date__lt=date.today())
    overdue_amount = sum(invoice.total_amount for invoice in overdue_invoices)
    
    data = {
        'total_invoices': total_invoices,
        'total_amount': total_amount,
        'paid_amount': paid_amount,
        'outstanding_amount': outstanding_amount,
        'overdue_amount': overdue_amount,
        'period_start': start_date,
        'period_end': end_date
    }
    
    serializer = InvoiceStatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def search_invoices(request):
    """Search invoices"""
    query = request.query_params.get('q', '')
    
    invoices = Invoice.objects.filter(
        Q(invoice_number__icontains=query) |
        Q(customer__name__icontains=query) |
        Q(notes__icontains=query),
        tenant=request.user.tenant
    ).order_by('-invoice_date')
    
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def customer_invoices(request, customer_id):
    """Get invoices for a specific customer"""
    customer = get_object_or_404(
        Customer,
        id=customer_id,
        tenant=request.user.tenant
    )
    
    invoices = Invoice.objects.filter(
        customer=customer,
        tenant=request.user.tenant
    ).order_by('-invoice_date')
    
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def overdue_invoices(request):
    """Get overdue invoices"""
    overdue_invoices = Invoice.objects.filter(
        tenant=request.user.tenant,
        status__in=['sent', 'approved'],
        due_date__lt=date.today()
    ).order_by('due_date')
    
    summary_data = []
    for invoice in overdue_invoices:
        paid_amount = sum(payment.amount for payment in invoice.payments.all())
        outstanding_amount = invoice.total_amount - paid_amount
        
        summary_data.append({
            'invoice_id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'customer_name': invoice.customer.name,
            'invoice_date': invoice.invoice_date,
            'due_date': invoice.due_date,
            'status': invoice.status,
            'total_amount': invoice.total_amount,
            'paid_amount': paid_amount,
            'outstanding_amount': outstanding_amount
        })
    
    serializer = InvoiceSummarySerializer(summary_data, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAccountant])
def record_payment(request, invoice_id):
    """Record a payment for an invoice"""
    invoice = get_object_or_404(
        Invoice,
        id=invoice_id,
        tenant=request.user.tenant
    )
    
    payment_data = request.data.copy()
    payment_data['invoice'] = invoice.id
    
    serializer = InvoicePaymentSerializer(data=payment_data)
    if serializer.is_valid():
        payment = serializer.save()
        
        # Check if invoice is fully paid
        total_paid = sum(p.amount for p in invoice.payments.all())
        if total_paid >= invoice.total_amount:
            invoice.status = 'paid'
            invoice.save()
        
        return Response({
            'message': 'Payment recorded successfully',
            'payment': InvoicePaymentSerializer(payment).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
