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
    Invoice, InvoiceLine, InvoiceTemplate, InvoicePayment, EInvoiceSettings, EInvoiceSubmission,
    InvoiceComplianceRule, ComplianceViolation, DigitalCertificate, InvoiceSignature,
    TaxRate, TaxCategory, InvoicingSettings
)
from .serializers import (
    InvoiceSerializer, InvoiceLineSerializer, InvoiceWithLinesSerializer,
    InvoiceTemplateSerializer, InvoicePaymentSerializer, EInvoiceSettingsSerializer,
    InvoiceStatsSerializer, InvoiceSummarySerializer, EInvoiceSubmissionSerializer,
    InvoiceComplianceRuleSerializer, ComplianceViolationSerializer, DigitalCertificateSerializer,
    InvoiceSignatureSerializer, TaxRateSerializer, TaxCategorySerializer, InvoicingSettingsSerializer
)
from authentication.permissions import IsAccountant, IsTenantMember
from sales.models import Customer
from tenants.models import Company
from backend.tenant_utils import get_request_tenant
from .myinvois_client import MyInvoisClient
from .ubl_generator import UBL21Generator
import logging

logger = logging.getLogger(__name__)


class InvoiceListView(generics.ListCreateAPIView):
    """List and create invoices"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return Invoice.objects.none()
        return Invoice.objects.filter(
            tenant=tenant
        ).order_by('-invoice_date', '-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(
            tenant=tenant,
            created_by=self.request.user
        )


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete invoice"""
    serializer_class = InvoiceWithLinesSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return Invoice.objects.none()
        return Invoice.objects.filter(tenant=tenant)


class InvoiceLineListView(generics.ListCreateAPIView):
    """List and create invoice lines"""
    serializer_class = InvoiceLineSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return InvoiceLine.objects.none()
        invoice_id = self.kwargs.get('invoice_id')
        return InvoiceLine.objects.filter(
            invoice__id=invoice_id,
            invoice__tenant=tenant
        )
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        invoice = get_object_or_404(
            Invoice,
            id=self.kwargs.get('invoice_id'),
            tenant=tenant
        )
        serializer.save(invoice=invoice, tenant=tenant)


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
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
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
        tenant=tenant,
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
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    query = request.query_params.get('q', '')
    
    invoices = Invoice.objects.filter(
        Q(invoice_number__icontains=query) |
        Q(customer__name__icontains=query) |
        Q(notes__icontains=query),
        tenant=tenant
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


# ============================================
# E-Invoice (LHDN) Views
# ============================================

class EInvoiceSettingsListView(generics.ListCreateAPIView):
    """List and create e-invoice settings"""
    serializer_class = EInvoiceSettingsSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return EInvoiceSettings.objects.filter(
            tenant=self.request.user.tenant
        )
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class EInvoiceSettingsDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete e-invoice settings"""
    serializer_class = EInvoiceSettingsSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        return EInvoiceSettings.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def test_e_invoice_connection(request, pk=None):
    """Test connection to MyInvois API"""
    # Get settings - either from URL pk or from tenant
    if pk:
        try:
            einvoice_settings = EInvoiceSettings.objects.get(
                id=pk,
                tenant=request.user.tenant
            )
        except EInvoiceSettings.DoesNotExist:
            return Response(
                {'error': 'E-Invoice settings not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        try:
            einvoice_settings = EInvoiceSettings.objects.get(
                tenant=request.user.tenant,
                is_enabled=True
            )
        except EInvoiceSettings.DoesNotExist:
            return Response(
                {'error': 'E-Invoicing is not configured. Please configure settings first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    try:
        environment = einvoice_settings.settings.get('environment', 'sandbox')
        client = MyInvoisClient(
            api_key=einvoice_settings.api_key,
            api_secret=einvoice_settings.api_secret,
            environment=environment,
            tenant_id=str(request.user.tenant.id)
        )
        
        # Test connection by getting OAuth token
        token_result = client.get_access_token()
        
        if token_result.get('success'):
            return Response({
                'success': True,
                'message': 'Connection to MyInvois API successful',
                'environment': environment,
                'provider': einvoice_settings.provider,
                'token_valid': True,
                'expires_at': token_result.get('expires_at')
            })
        else:
            return Response(
                {
                    'success': False,
                    'error': token_result.get('error', 'Failed to authenticate with MyInvois API'),
                    'environment': environment,
                    'provider': einvoice_settings.provider
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error testing e-invoice connection: {e}", exc_info=True)
        return Response(
            {
                'success': False,
                'error': f'Error testing connection: {str(e)}'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAccountant])
def submit_e_invoice(request, pk):
    """Submit invoice to LHDN MyInvois"""
    invoice = get_object_or_404(
        Invoice,
        id=pk,
        tenant=request.user.tenant
    )
    
    # Get e-invoice settings
    try:
        einvoice_settings = EInvoiceSettings.objects.get(
            tenant=request.user.tenant,
            is_enabled=True
        )
    except EInvoiceSettings.DoesNotExist:
        return Response(
            {'error': 'E-Invoicing is not configured. Please configure e-invoice settings first.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not einvoice_settings.api_key or not einvoice_settings.api_secret:
        return Response(
            {'error': 'MyInvois API credentials are not configured.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if already submitted
    if invoice.e_invoice_status == 'accepted':
        return Response(
            {'error': 'Invoice has already been accepted by LHDN. Cannot resubmit.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get company and customer
        company = invoice.company
        customer = invoice.customer
        
        # Generate UBL 2.1 format
        ubl_generator = UBL21Generator()
        ubl_data = ubl_generator.generate_json(invoice, company, customer)
        
        # Validate UBL data
        is_valid, errors = ubl_generator.validate_ubl_data(ubl_data)
        if not is_valid:
            invoice.e_invoice_errors = errors
            invoice.save()
            return Response(
                {
                    'error': 'UBL validation failed',
                    'errors': errors,
                    'ubl_data': ubl_data
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize MyInvois client
        environment = einvoice_settings.settings.get('environment', 'sandbox')
        client = MyInvoisClient(
            api_key=einvoice_settings.api_key,
            api_secret=einvoice_settings.api_secret,
            environment=environment,
            tenant_id=str(request.user.tenant.id)
        )
        
        # Create submission log entry
        submission = EInvoiceSubmission.objects.create(
            tenant=request.user.tenant,
            invoice=invoice,
            submission_type='submit',
            status='pending',
            request_payload=ubl_data,
            created_by=request.user
        )
        
        # Submit to MyInvois
        result = client.submit_invoice(ubl_data)
        
        # Update submission log
        submission.status = 'success' if result.get('success') else 'failed'
        submission.response_payload = result
        submission.completed_at = timezone.now()
        
        if result.get('qrid'):
            submission.qrid = result.get('qrid')
        
        if result.get('errors'):
            submission.error_message = ', '.join(result.get('errors', []))
            if result.get('errors'):
                submission.error_code = result.get('errors', [])[0] if isinstance(result.get('errors', []), list) else str(result.get('errors', []))
        
        submission.save()
        
        # Update invoice with submission result
        if result.get('success'):
            invoice.e_invoice_status = 'submitted'
            invoice.submitted_to_lhdn_at = timezone.now()
            
            if result.get('qrid'):
                invoice.lhdn_reference_number = result.get('qrid')
            
            if result.get('validation_status') == 'accepted':
                invoice.e_invoice_status = 'accepted'
                invoice.lhdn_validated_at = timezone.now()
            elif result.get('validation_status') == 'rejected':
                invoice.e_invoice_status = 'rejected'
                invoice.e_invoice_errors = result.get('errors', [])
            
            # Store generated UBL data
            invoice.e_invoice_json = ubl_data
            
            invoice.save()
            
            return Response({
                'message': 'Invoice submitted to MyInvois successfully',
                'qrid': result.get('qrid'),
                'status': result.get('status'),
                'validation_status': result.get('validation_status'),
                'errors': result.get('errors', []),
                'warnings': result.get('warnings', []),
                'submission_id': str(submission.id)
            })
        else:
            invoice.e_invoice_status = 'rejected'
            invoice.e_invoice_errors = result.get('errors', [])
            invoice.save()
            
            return Response(
                {
                    'error': 'Failed to submit invoice to MyInvois',
                    'errors': result.get('errors', [result.get('error')]),
                    'submission_id': str(submission.id)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error submitting e-invoice: {e}", exc_info=True)
        
        # Log failed submission
        try:
            submission = EInvoiceSubmission.objects.create(
                tenant=request.user.tenant,
                invoice=invoice,
                submission_type='submit',
                status='failed',
                error_message=str(e),
                completed_at=timezone.now(),
                created_by=request.user
            )
        except:
            pass  # Don't fail if logging fails
        
        invoice.e_invoice_status = 'rejected'
        invoice.e_invoice_errors = [str(e)]
        invoice.save()
        
        return Response(
            {'error': f'Error submitting invoice: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAccountant])
def get_e_invoice_status(request, pk):
    """Get e-invoice status from LHDN"""
    invoice = get_object_or_404(
        Invoice,
        id=pk,
        tenant=request.user.tenant
    )
    
    if not invoice.lhdn_reference_number:
        return Response(
            {'error': 'Invoice has not been submitted to LHDN yet.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get e-invoice settings
    try:
        einvoice_settings = EInvoiceSettings.objects.get(
            tenant=request.user.tenant,
            is_enabled=True
        )
    except EInvoiceSettings.DoesNotExist:
        return Response(
            {'error': 'E-Invoicing is not configured.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        environment = einvoice_settings.settings.get('environment', 'sandbox')
        client = MyInvoisClient(
            api_key=einvoice_settings.api_key,
            api_secret=einvoice_settings.api_secret,
            environment=environment,
            tenant_id=str(request.user.tenant.id)
        )
        
        # Create status check log entry
        submission = EInvoiceSubmission.objects.create(
            tenant=request.user.tenant,
            invoice=invoice,
            submission_type='status_check',
            status='pending',
            created_by=request.user
        )
        
        result = client.get_invoice_status(invoice.lhdn_reference_number)
        
        # Update submission log
        submission.status = 'success' if result.get('success') else 'failed'
        submission.response_payload = result
        submission.completed_at = timezone.now()
        if result.get('errors'):
            submission.error_message = ', '.join(result.get('errors', []))
        submission.save()
        
        if result.get('success'):
            # Update invoice status
            if result.get('status') == 'accepted':
                invoice.e_invoice_status = 'accepted'
                invoice.lhdn_validated_at = timezone.now()
            elif result.get('status') == 'rejected':
                invoice.e_invoice_status = 'rejected'
                invoice.e_invoice_errors = result.get('errors', [])
            
            invoice.save()
            
            return Response({
                'qrid': invoice.lhdn_reference_number,
                'status': result.get('status'),
                'validation_status': result.get('validation_status'),
                'updated_at': result.get('updated_at'),
                'errors': result.get('errors', []),
                'submission_id': str(submission.id)
            })
        else:
            return Response(
                {'error': result.get('error', 'Failed to get invoice status')},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error getting e-invoice status: {e}", exc_info=True)
        
        # Log failed status check
        try:
            EInvoiceSubmission.objects.create(
                tenant=request.user.tenant,
                invoice=invoice,
                submission_type='status_check',
                status='failed',
                error_message=str(e),
                completed_at=timezone.now(),
                created_by=request.user
            )
        except:
            pass
        
        return Response(
            {'error': f'Error getting invoice status: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAccountant])
def cancel_e_invoice(request, pk):
    """Cancel an e-invoice in LHDN"""
    invoice = get_object_or_404(
        Invoice,
        id=pk,
        tenant=request.user.tenant
    )
    
    if not invoice.lhdn_reference_number:
        return Response(
            {'error': 'Invoice has not been submitted to LHDN yet.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    cancellation_reason = request.data.get('cancellation_reason', '')
    if not cancellation_reason:
        return Response(
            {'error': 'Cancellation reason is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get e-invoice settings
    try:
        einvoice_settings = EInvoiceSettings.objects.get(
            tenant=request.user.tenant,
            is_enabled=True
        )
    except EInvoiceSettings.DoesNotExist:
        return Response(
            {'error': 'E-Invoicing is not configured.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        environment = einvoice_settings.settings.get('environment', 'sandbox')
        client = MyInvoisClient(
            api_key=einvoice_settings.api_key,
            api_secret=einvoice_settings.api_secret,
            environment=environment,
            tenant_id=str(request.user.tenant.id)
        )
        
        # Create cancellation log entry
        submission = EInvoiceSubmission.objects.create(
            tenant=request.user.tenant,
            invoice=invoice,
            submission_type='cancel',
            status='pending',
            request_payload={'cancellation_reason': cancellation_reason},
            created_by=request.user
        )
        
        result = client.cancel_invoice(invoice.lhdn_reference_number, cancellation_reason)
        
        # Update submission log
        submission.status = 'success' if result.get('success') else 'failed'
        submission.response_payload = result
        submission.completed_at = timezone.now()
        if result.get('error'):
            submission.error_message = result.get('error')
        submission.save()
        
        if result.get('success'):
            invoice.e_invoice_status = 'cancelled'
            invoice.save()
            
            return Response({
                'message': 'Invoice cancelled in MyInvois successfully',
                'qrid': invoice.lhdn_reference_number,
                'status': result.get('status'),
                'cancelled_at': result.get('cancelled_at'),
                'submission_id': str(submission.id)
            })
        else:
            return Response(
                {'error': result.get('error', 'Failed to cancel invoice')},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error cancelling e-invoice: {e}", exc_info=True)
        
        # Log failed cancellation
        try:
            EInvoiceSubmission.objects.create(
                tenant=request.user.tenant,
                invoice=invoice,
                submission_type='cancel',
                status='failed',
                error_message=str(e),
                completed_at=timezone.now(),
                created_by=request.user
            )
        except:
            pass
        
        return Response(
            {'error': f'Error cancelling invoice: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAccountant])
def generate_ubl_format(request, pk):
    """Generate UBL 2.1 format for invoice (preview only, does not submit)"""
    invoice = get_object_or_404(
        Invoice,
        id=pk,
        tenant=request.user.tenant
    )
    
    try:
        company = invoice.company
        customer = invoice.customer
        
        ubl_generator = UBL21Generator()
        ubl_data = ubl_generator.generate_json(invoice, company, customer)
        
        # Validate
        is_valid, errors = ubl_generator.validate_ubl_data(ubl_data)
        
        return Response({
            'ubl_data': ubl_data,
            'is_valid': is_valid,
            'errors': errors
        })
        
    except Exception as e:
        logger.error(f"Error generating UBL format: {e}", exc_info=True)
        return Response(
            {'error': f'Error generating UBL format: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Submission History Views

class EInvoiceSubmissionListView(generics.ListAPIView):
    """List e-invoice submissions for an invoice"""
    serializer_class = EInvoiceSubmissionSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        invoice_id = self.kwargs.get('invoice_id')
        return EInvoiceSubmission.objects.filter(
            invoice__id=invoice_id,
            invoice__tenant=self.request.user.tenant
        ).order_by('-submitted_at')


@api_view(['GET'])
@permission_classes([IsAccountant])
def get_e_invoice_submissions(request, pk):
    """Get all e-invoice submissions for an invoice"""
    invoice = get_object_or_404(
        Invoice,
        id=pk,
        tenant=request.user.tenant
    )
    
    submissions = EInvoiceSubmission.objects.filter(
        invoice=invoice,
        tenant=request.user.tenant
    ).order_by('-submitted_at')
    
    serializer = EInvoiceSubmissionSerializer(submissions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAccountant])
def get_e_invoice_submission_detail(request, submission_id):
    """Get details of a specific e-invoice submission"""
    submission = get_object_or_404(
        EInvoiceSubmission,
        id=submission_id,
        tenant=request.user.tenant
    )
    
    serializer = EInvoiceSubmissionSerializer(submission)
    return Response(serializer.data)


# Compliance Rules Views
class InvoiceComplianceRuleListView(generics.ListCreateAPIView):
    """List and create Invoice Compliance Rules"""
    serializer_class = InvoiceComplianceRuleSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return InvoiceComplianceRule.objects.none()
        return InvoiceComplianceRule.objects.filter(tenant=tenant, is_active=True).order_by('name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class InvoiceComplianceRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Invoice Compliance Rule"""
    serializer_class = InvoiceComplianceRuleSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return InvoiceComplianceRule.objects.none()
        return InvoiceComplianceRule.objects.filter(tenant=tenant)


class ComplianceViolationListView(generics.ListCreateAPIView):
    """List and create Compliance Violations"""
    serializer_class = ComplianceViolationSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return ComplianceViolation.objects.none()
        invoice_id = self.request.query_params.get('invoice')
        queryset = ComplianceViolation.objects.filter(tenant=tenant)
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


@api_view(['POST'])
@permission_classes([IsAccountant])
def resolve_compliance_violation(request, pk):
    """Resolve a compliance violation"""
    tenant = get_request_tenant(request)
    if not tenant:
        return Response(
            {'error': 'Tenant context required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    violation = get_object_or_404(
        ComplianceViolation,
        id=pk,
        tenant=tenant
    )
    
    violation.status = 'resolved'
    violation.resolved_by = request.user
    violation.resolved_at = timezone.now()
    violation.save()
    
    return Response({
        'message': 'Violation resolved successfully',
        'violation': ComplianceViolationSerializer(violation).data
    })


# Digital Certificate Views
class DigitalCertificateListView(generics.ListCreateAPIView):
    """List and create Digital Certificates"""
    serializer_class = DigitalCertificateSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DigitalCertificate.objects.none()
        return DigitalCertificate.objects.filter(tenant=tenant, is_active=True).order_by('-is_primary', 'name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class DigitalCertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Digital Certificate"""
    serializer_class = DigitalCertificateSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return DigitalCertificate.objects.none()
        return DigitalCertificate.objects.filter(tenant=tenant)


class InvoiceSignatureListView(generics.ListCreateAPIView):
    """List and create Invoice Signatures"""
    serializer_class = InvoiceSignatureSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return InvoiceSignature.objects.none()
        invoice_id = self.request.query_params.get('invoice')
        queryset = InvoiceSignature.objects.filter(tenant=tenant)
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
        return queryset.order_by('-signed_at')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, signed_by=self.request.user)


class InvoiceSignatureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Invoice Signature"""
    serializer_class = InvoiceSignatureSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return InvoiceSignature.objects.none()
        return InvoiceSignature.objects.filter(tenant=tenant)


# Tax Rate Views
class TaxRateListView(generics.ListCreateAPIView):
    """List and create Tax Rates"""
    serializer_class = TaxRateSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return TaxRate.objects.none()
        region = self.request.query_params.get('region')
        queryset = TaxRate.objects.filter(tenant=tenant, is_active=True)
        if region:
            queryset = queryset.filter(region=region)
        return queryset.order_by('-is_default', 'name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant, created_by=self.request.user)


class TaxRateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Tax Rate"""
    serializer_class = TaxRateSerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return TaxRate.objects.none()
        return TaxRate.objects.filter(tenant=tenant)


class TaxCategoryListView(generics.ListCreateAPIView):
    """List and create Tax Categories"""
    serializer_class = TaxCategorySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return TaxCategory.objects.none()
        return TaxCategory.objects.filter(tenant=tenant, is_active=True).order_by('name')
    
    def perform_create(self, serializer):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        serializer.save(tenant=tenant)


class TaxCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete Tax Category"""
    serializer_class = TaxCategorySerializer
    permission_classes = [IsAccountant]
    
    def get_queryset(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            return TaxCategory.objects.none()
        return TaxCategory.objects.filter(tenant=tenant)


# Invoicing Settings Views
class InvoicingSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update Invoicing Settings"""
    serializer_class = InvoicingSettingsSerializer
    permission_classes = [IsAccountant]
    
    def get_object(self):
        tenant = get_request_tenant(self.request)
        if not tenant:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tenant context required")
        company = getattr(self.request.user, 'company', None)
        settings, created = InvoicingSettings.objects.get_or_create(
            tenant=tenant,
            company=company
        )
        return settings
