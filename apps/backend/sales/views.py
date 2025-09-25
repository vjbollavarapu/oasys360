from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import Customer, SalesOrder, SalesOrderLine, SalesQuote, SalesQuoteLine
from .serializers import (
    CustomerSerializer, SalesOrderSerializer, SalesOrderLineSerializer,
    SalesOrderWithLinesSerializer, SalesQuoteSerializer, SalesQuoteLineSerializer,
    SalesQuoteWithLinesSerializer, CustomerSummarySerializer, SalesStatsSerializer,
    SalesOrderSummarySerializer
)
from authentication.permissions import IsAccountant, IsTenantMember


class CustomerListView(generics.ListCreateAPIView):
    """List and create customers"""
    serializer_class = CustomerSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Customer.objects.filter(
            tenant=self.request.user.tenant,
            is_active=True
        ).order_by('name')
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete customer"""
    serializer_class = CustomerSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return Customer.objects.filter(tenant=self.request.user.tenant)


class SalesOrderListView(generics.ListCreateAPIView):
    """List and create sales orders"""
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return SalesOrder.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-order_date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )


class SalesOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete sales order"""
    serializer_class = SalesOrderWithLinesSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return SalesOrder.objects.filter(tenant=self.request.user.tenant)


class SalesOrderLineListView(generics.ListCreateAPIView):
    """List and create sales order lines"""
    serializer_class = SalesOrderLineSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        sales_order_id = self.kwargs.get('sales_order_id')
        return SalesOrderLine.objects.filter(
            sales_order__id=sales_order_id,
            sales_order__tenant=self.request.user.tenant
        )
    
    def perform_create(self, serializer):
        sales_order = get_object_or_404(
            SalesOrder,
            id=self.kwargs.get('sales_order_id'),
            tenant=self.request.user.tenant
        )
        serializer.save(sales_order=sales_order)


class SalesQuoteListView(generics.ListCreateAPIView):
    """List and create sales quotes"""
    serializer_class = SalesQuoteSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return SalesQuote.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-quote_date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )


class SalesQuoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete sales quote"""
    serializer_class = SalesQuoteWithLinesSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return SalesQuote.objects.filter(tenant=self.request.user.tenant)


class SalesQuoteLineListView(generics.ListCreateAPIView):
    """List and create sales quote lines"""
    serializer_class = SalesQuoteLineSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        sales_quote_id = self.kwargs.get('sales_quote_id')
        return SalesQuoteLine.objects.filter(
            sales_quote__id=sales_quote_id,
            sales_quote__tenant=self.request.user.tenant
        )
    
    def perform_create(self, serializer):
        sales_quote = get_object_or_404(
            SalesQuote,
            id=self.kwargs.get('sales_quote_id'),
            tenant=self.request.user.tenant
        )
        serializer.save(sales_quote=sales_quote)


@api_view(['POST'])
@permission_classes([IsAccountant])
def approve_sales_order(request, pk):
    """Approve a sales order"""
    sales_order = get_object_or_404(
        SalesOrder,
        id=pk,
        tenant=request.user.tenant
    )
    
    if sales_order.status != 'draft':
        return Response(
            {'error': 'Only draft orders can be approved'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    sales_order.status = 'approved'
    sales_order.approved_by = request.user
    sales_order.approved_at = timezone.now()
    sales_order.save()
    
    return Response({
        'message': 'Sales order approved successfully',
        'sales_order': SalesOrderSerializer(sales_order).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def ship_sales_order(request, pk):
    """Ship a sales order"""
    sales_order = get_object_or_404(
        SalesOrder,
        id=pk,
        tenant=request.user.tenant
    )
    
    if sales_order.status not in ['approved', 'shipped']:
        return Response(
            {'error': 'Only approved orders can be shipped'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    sales_order.status = 'shipped'
    sales_order.shipped_at = timezone.now()
    sales_order.save()
    
    return Response({
        'message': 'Sales order shipped successfully',
        'sales_order': SalesOrderSerializer(sales_order).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def approve_sales_quote(request, pk):
    """Approve a sales quote"""
    sales_quote = get_object_or_404(
        SalesQuote,
        id=pk,
        tenant=request.user.tenant
    )
    
    if sales_quote.status != 'draft':
        return Response(
            {'error': 'Only draft quotes can be approved'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    sales_quote.status = 'approved'
    sales_quote.approved_by = request.user
    sales_quote.approved_at = timezone.now()
    sales_quote.save()
    
    return Response({
        'message': 'Sales quote approved successfully',
        'sales_quote': SalesQuoteSerializer(sales_quote).data
    })


@api_view(['POST'])
@permission_classes([IsAccountant])
def convert_quote_to_order(request, pk):
    """Convert a sales quote to a sales order"""
    sales_quote = get_object_or_404(
        SalesQuote,
        id=pk,
        tenant=request.user.tenant
    )
    
    if sales_quote.status != 'approved':
        return Response(
            {'error': 'Only approved quotes can be converted to orders'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create sales order from quote
    sales_order = SalesOrder.objects.create(
        tenant=sales_quote.tenant,
        company=sales_quote.company,
        customer=sales_quote.customer,
        order_number=f"SO-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        order_date=timezone.now().date(),
        delivery_date=sales_quote.valid_until,
        status='draft',
        payment_terms=sales_quote.terms_conditions,
        currency=sales_quote.currency,
        exchange_rate=sales_quote.exchange_rate,
        notes=sales_quote.notes,
        created_by=request.user
    )
    
    # Copy quote lines to order lines
    for quote_line in sales_quote.lines.all():
        SalesOrderLine.objects.create(
            sales_order=sales_order,
            item=quote_line.item,
            description=quote_line.description,
            quantity=quote_line.quantity,
            unit_price=quote_line.unit_price,
            tax_rate=quote_line.tax_rate,
            discount_rate=quote_line.discount_rate
        )
    
    # Update quote status
    sales_quote.status = 'converted'
    sales_quote.converted_to_order = sales_order
    sales_quote.save()
    
    return Response({
        'message': 'Quote converted to order successfully',
        'sales_order': SalesOrderSerializer(sales_order).data,
        'sales_quote': SalesQuoteSerializer(sales_quote).data
    })


@api_view(['GET'])
@permission_classes([IsAccountant])
def sales_stats(request):
    """Get sales statistics"""
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
    
    orders = SalesOrder.objects.filter(
        tenant=request.user.tenant,
        order_date__range=[start_date, end_date]
    )
    
    quotes = SalesQuote.objects.filter(
        tenant=request.user.tenant,
        quote_date__range=[start_date, end_date]
    )
    
    total_orders = orders.count()
    total_quotes = quotes.count()
    total_revenue = sum(order.total_amount for order in orders)
    total_customers = Customer.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    ).count()
    
    # Calculate conversion rate
    converted_quotes = quotes.filter(status='converted').count()
    conversion_rate = (converted_quotes / total_quotes * 100) if total_quotes > 0 else 0
    
    data = {
        'total_orders': total_orders,
        'total_quotes': total_quotes,
        'total_revenue': total_revenue,
        'total_customers': total_customers,
        'conversion_rate': conversion_rate,
        'period_start': start_date,
        'period_end': end_date
    }
    
    serializer = SalesStatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def search_customers(request):
    """Search customers"""
    query = request.query_params.get('q', '')
    
    customers = Customer.objects.filter(
        Q(name__icontains=query) |
        Q(email__icontains=query) |
        Q(phone__icontains=query),
        tenant=request.user.tenant,
        is_active=True
    ).order_by('name')
    
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def customer_orders(request, customer_id):
    """Get orders for a specific customer"""
    customer = get_object_or_404(
        Customer,
        id=customer_id,
        tenant=request.user.tenant
    )
    
    orders = SalesOrder.objects.filter(
        customer=customer,
        tenant=request.user.tenant
    ).order_by('-order_date')
    
    serializer = SalesOrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def customer_summary(request):
    """Get summary of all customers"""
    customers = Customer.objects.filter(
        tenant=request.user.tenant,
        is_active=True
    )
    
    summary_data = []
    for customer in customers:
        # Get last order date
        last_order = SalesOrder.objects.filter(
            customer=customer
        ).order_by('-order_date').first()
        
        summary_data.append({
            'customer_id': customer.id,
            'customer_name': customer.name,
            'email': customer.email,
            'phone': customer.phone,
            'total_orders': customer.total_orders,
            'total_revenue': customer.total_revenue,
            'last_order_date': last_order.order_date if last_order else None,
            'is_active': customer.is_active
        })
    
    serializer = CustomerSummarySerializer(summary_data, many=True)
    return Response(serializer.data)
