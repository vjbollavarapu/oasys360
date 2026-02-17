"""
Onboarding API Views - Multi-step wizard endpoints
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from .models import Tenant, TenantOnboardingProgress, Company
from .preset_engine import PresetEngine
# Serializers not needed for these views - using direct data access
import logging

logger = logging.getLogger(__name__)


class OnboardingStatusView(APIView):
    """Get current onboarding status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Try multiple ways to get tenant
        tenant = None
        
        # Method 1: From request.tenant (set by middleware)
        if hasattr(request, 'tenant') and request.tenant:
            tenant = request.tenant
        # Method 2: From user.tenant
        elif hasattr(request.user, 'tenant') and request.user.tenant:
            tenant = request.user.tenant
        # Method 3: Use utility function
        else:
            from backend.tenant_utils import get_request_tenant
            tenant = get_request_tenant(request)
        
        if not tenant:
            logger.warning(f"No tenant found for user {request.user.id}")
            return Response(
                {
                    'error': 'No tenant associated with user',
                    'onboarding_status': 'INCOMPLETE',
                    'can_access_dashboard': False,
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        progress, _ = TenantOnboardingProgress.objects.get_or_create(
            tenant=tenant
        )
        
        return Response({
            'onboarding_status': tenant.onboarding_status,
            'current_step': progress.current_step,
            'completed_steps': progress.completed_steps,
            'can_access_dashboard': tenant.can_access_dashboard(),
        })


class OnboardingProgressView(APIView):
    """Get detailed onboarding progress with preset module status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Try multiple ways to get tenant
        tenant = None
        
        # Method 1: From request.tenant (set by middleware)
        if hasattr(request, 'tenant') and request.tenant:
            tenant = request.tenant
        # Method 2: From user.tenant
        elif hasattr(request.user, 'tenant') and request.user.tenant:
            tenant = request.user.tenant
        # Method 3: Use utility function
        else:
            from backend.tenant_utils import get_request_tenant
            tenant = get_request_tenant(request)
        
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        progress, _ = TenantOnboardingProgress.objects.get_or_create(
            tenant=tenant
        )
        
        # Calculate overall progress
        total_steps = 5
        completed_steps_count = len(progress.completed_steps)
        overall_progress = int((completed_steps_count / total_steps) * 100)
        
        # Get current step detail
        current_step_detail = self._get_current_step_detail(progress, tenant)
        
        # Build steps array
        steps = self._build_steps_array(progress)
        
        return Response({
            'overall_progress': overall_progress,
            'current_step': progress.current_step,
            'current_step_detail': current_step_detail,
            'steps': steps,
            'onboarding_status': tenant.onboarding_status,
            'can_access_dashboard': tenant.can_access_dashboard(),
        })
    
    def _get_current_step_detail(self, progress, tenant) -> str:
        """Get detailed status of current step"""
        step = progress.current_step
        
        if step == 1:
            return 'Select subscription plan'
        elif step == 2:
            return 'Configure domain'
        elif step == 3:
            return 'Complete company profile'
        elif step == 4:
            # Get preset progress details
            preset_progress = progress.get_preset_progress()
            if preset_progress:
                # Find in-progress preset
                for preset_type, details in preset_progress.items():
                    if details.get('status') == 'in_progress':
                        records = details.get('records_created', 0)
                        total = details.get('total_expected', 0)
                        preset_name = self._get_preset_display_name(preset_type)
                        return f'Importing {records}/{total} {preset_name}'
                
                # Find completed preset with progress
                for preset_type, details in preset_progress.items():
                    if details.get('status') == 'completed':
                        records = details.get('records_created', 0)
                        preset_name = self._get_preset_display_name(preset_type)
                        return f'Completed {preset_name} ({records} records)'
            
            return 'Provisioning presets...'
        elif step == 5:
            return 'Review and confirm'
        else:
            return 'Onboarding complete'
    
    def _get_preset_display_name(self, preset_type: str) -> str:
        """Get display name for preset type"""
        names = {
            'chart_of_accounts': 'GL Accounts',
            'tax_rates': 'Tax Rates',
            'tax_categories': 'Tax Categories',
            'currency': 'Currency Settings',
            'invoice_numbering': 'Invoice Numbering',
            'einvoice_config': 'E-Invoice Config',
            'country_settings': 'Country Settings',
        }
        return names.get(preset_type, preset_type.replace('_', ' ').title())
    
    def _build_steps_array(self, progress) -> list:
        """Build steps array with status for each step"""
        step_names = {
            1: 'Subscription Selection',
            2: 'Domain Configuration',
            3: 'Company Profile',
            4: 'Presets Provisioning',
            5: 'Confirmation',
        }
        
        steps = []
        for step_num in range(1, 6):
            is_completed = step_num in progress.completed_steps
            is_current = step_num == progress.current_step
            
            # For step 4, check preset progress
            if step_num == 4:
                preset_progress = progress.get_preset_progress()
                if preset_progress:
                    # Check if any preset is processing
                    has_processing = any(
                        details.get('status') == 'in_progress'
                        for details in preset_progress.values()
                    )
                    if has_processing:
                        status = 'processing'
                    elif all(
                        details.get('status') == 'completed'
                        for details in preset_progress.values()
                    ):
                        status = 'completed'
                    else:
                        status = 'pending'
                else:
                    status = 'pending' if not is_completed else 'completed'
            else:
                status = 'completed' if is_completed else ('processing' if is_current else 'pending')
            
            steps.append({
                'step': step_num,
                'name': step_names[step_num],
                'status': status,
                'is_completed': is_completed,
                'is_current': is_current,
            })
        
        return steps


class OnboardingStep1View(APIView):
    """Step 1: Subscription Selection"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Try multiple ways to get tenant
        tenant = None
        
        # Method 1: From request.tenant (set by middleware)
        if hasattr(request, 'tenant') and request.tenant:
            tenant = request.tenant
        # Method 2: From user.tenant
        elif hasattr(request.user, 'tenant') and request.user.tenant:
            tenant = request.user.tenant
        # Method 3: Use utility function
        else:
            from backend.tenant_utils import get_request_tenant
            tenant = get_request_tenant(request)
        
        if not tenant:
            logger.warning(f"No tenant found for user {request.user.id}")
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate input
        plan_code = request.data.get('plan_code')
        billing_cycle = request.data.get('billing_cycle', 'trial')
        subscription_id = request.data.get('subscription_id', '')
        
        if not plan_code:
            return Response(
                {'error': 'plan_code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_plans = ['trial', 'basic', 'professional', 'enterprise']
        if plan_code not in valid_plans:
            return Response(
                {'error': f'Invalid plan_code. Must be one of: {", ".join(valid_plans)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Update tenant subscription info
                tenant.plan = plan_code
                tenant.plan_code = plan_code
                tenant.billing_cycle = billing_cycle
                tenant.subscription_id = subscription_id
                
                if billing_cycle == 'trial':
                    from datetime import timedelta
                    tenant.trial_expiry = timezone.now() + timedelta(days=14)
                
                tenant.onboarding_status = 'IN_PROGRESS'
                tenant.save()
                
                # Update progress
                progress, _ = TenantOnboardingProgress.objects.get_or_create(
                    tenant=tenant
                )
                progress.complete_step(1, {
                    'plan_code': plan_code,
                    'billing_cycle': billing_cycle,
                    'subscription_id': subscription_id,
                })
                
                # Log audit
                logger.info(
                    f"Onboarding Step 1 completed for tenant {tenant.id} "
                    f"by user {request.user.id}"
                )
            
            return Response({
                'success': True,
                'message': 'Subscription selected successfully',
                'current_step': progress.current_step,
            })
        
        except Exception as e:
            logger.error(f"Failed to complete Step 1: {e}")
            return Response(
                {'error': 'Failed to save subscription selection'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OnboardingStep2View(APIView):
    """Step 2: Domain Configuration"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Try multiple ways to get tenant
        tenant = None
        
        # Method 1: From request.tenant (set by middleware)
        if hasattr(request, 'tenant') and request.tenant:
            tenant = request.tenant
        # Method 2: From user.tenant
        elif hasattr(request.user, 'tenant') and request.user.tenant:
            tenant = request.user.tenant
        # Method 3: Use utility function
        else:
            from backend.tenant_utils import get_request_tenant
            tenant = get_request_tenant(request)
        
        if not tenant:
            logger.warning(f"No tenant found for user {request.user.id}")
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        primary_domain = request.data.get('primary_domain')
        domain_type = request.data.get('domain_type', 'subdomain')  # 'subdomain' or 'custom'
        
        if not primary_domain:
            return Response(
                {'error': 'primary_domain is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Update tenant domain
                tenant.primary_domain = primary_domain
                tenant.domain_status = 'pending' if domain_type == 'custom' else 'active'
                tenant.save()
                
                # Update progress
                progress, _ = TenantOnboardingProgress.objects.get_or_create(
                    tenant=tenant
                )
                progress.complete_step(2, {
                    'primary_domain': primary_domain,
                    'domain_type': domain_type,
                })
                
                logger.info(
                    f"Onboarding Step 2 completed for tenant {tenant.id} "
                    f"by user {request.user.id}"
                )
            
            return Response({
                'success': True,
                'message': 'Domain configured successfully',
                'current_step': progress.current_step,
            })
        
        except Exception as e:
            logger.error(f"Failed to complete Step 2: {e}")
            return Response(
                {'error': 'Failed to save domain configuration'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OnboardingStep3View(APIView):
    """Step 3: Company Profile"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate required fields
        required_fields = ['legal_name', 'country_code', 'industry_code']
        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {'error': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            with transaction.atomic():
                # Update tenant company info
                tenant.name = request.data.get('legal_name', tenant.name)
                tenant.country_code = request.data.get('country_code')
                tenant.industry_code = request.data.get('industry_code')
                tenant.timezone = request.data.get('timezone', 'UTC')
                tenant.currency_code = request.data.get('currency_code', 'USD')
                tenant.save()
                
                # Create or update primary company
                company, created = Company.objects.get_or_create(
                    tenant=tenant,
                    is_primary=True,
                    defaults={
                        'name': request.data.get('legal_name'),
                        'legal_name': request.data.get('legal_name'),
                        'tax_id': request.data.get('tax_id', ''),
                        'registration_number': request.data.get('registration_number', ''),
                        'address': request.data.get('address', ''),
                        'city': request.data.get('city', ''),
                        'state': request.data.get('state', ''),
                        'country': request.data.get('country_code'),
                        'postal_code': request.data.get('postal_code', ''),
                        'phone': request.data.get('phone', ''),
                        'email': request.data.get('email', ''),
                        'website': request.data.get('website', ''),
                        'currency': request.data.get('currency_code', 'USD'),
                        'timezone': request.data.get('timezone', 'UTC'),
                    }
                )
                
                if not created:
                    # Update existing company
                    company.name = request.data.get('legal_name', company.name)
                    company.legal_name = request.data.get('legal_name', company.legal_name)
                    company.tax_id = request.data.get('tax_id', company.tax_id)
                    company.registration_number = request.data.get('registration_number', company.registration_number)
                    company.address = request.data.get('address', company.address)
                    company.city = request.data.get('city', company.city)
                    company.state = request.data.get('state', company.state)
                    company.country = request.data.get('country_code', company.country)
                    company.postal_code = request.data.get('postal_code', company.postal_code)
                    company.phone = request.data.get('phone', company.phone)
                    company.email = request.data.get('email', company.email)
                    company.website = request.data.get('website', company.website)
                    company.currency = request.data.get('currency_code', company.currency)
                    company.timezone = request.data.get('timezone', company.timezone)
                    company.save()
                
                # Update progress
                progress, _ = TenantOnboardingProgress.objects.get_or_create(
                    tenant=tenant
                )
                progress.complete_step(3, {
                    'legal_name': request.data.get('legal_name'),
                    'country_code': request.data.get('country_code'),
                    'industry_code': request.data.get('industry_code'),
                })
                
                logger.info(
                    f"Onboarding Step 3 completed for tenant {tenant.id} "
                    f"by user {request.user.id}"
                )
            
            return Response({
                'success': True,
                'message': 'Company profile saved successfully',
                'current_step': progress.current_step,
            })
        
        except Exception as e:
            logger.error(f"Failed to complete Step 3: {e}")
            return Response(
                {'error': 'Failed to save company profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OnboardingStep4View(APIView):
    """Step 4: Industry & Country Preset Engine (AUTO-PROVISION)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Try multiple ways to get tenant
        tenant = None
        
        # Method 1: From request.tenant (set by middleware)
        if hasattr(request, 'tenant') and request.tenant:
            tenant = request.tenant
        # Method 2: From user.tenant
        elif hasattr(request.user, 'tenant') and request.user.tenant:
            tenant = request.user.tenant
        # Method 3: Use utility function
        else:
            from backend.tenant_utils import get_request_tenant
            tenant = get_request_tenant(request)
        
        if not tenant:
            logger.warning(f"No tenant found for user {request.user.id}")
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not tenant.country_code or not tenant.industry_code:
            return Response(
                {'error': 'Country and industry must be set in Step 3 first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use PresetLoaderService for sequenced loading with progress tracking
            from presets.preset_loader_service import PresetLoaderService
            
            loader_service = PresetLoaderService(tenant=tenant, user=request.user)
            
            # Load all presets in sequence
            loader_results = loader_service.load_presets(
                country_code=tenant.country_code,
                industry_code=tenant.industry_code,
                progress_callback=lambda preset_type, progress, count: None  # Progress tracked in DB
            )
            
            # Also use PresetEngine for other presets (invoice numbering, etc.)
            preset_engine = PresetEngine()
            detailed_results = preset_engine.provision_tenant_presets(
                tenant=tenant,
                country_code=tenant.country_code,
                industry_code=tenant.industry_code,
                user=request.user
            )
            
            # Merge results
            detailed_results['detailed_results']['currencies'] = {
                'success': True,
                'record_count': loader_results['currencies'],
                'name': 'Currencies',
            }
            detailed_results['detailed_results']['tax_categories'] = {
                'success': True,
                'record_count': loader_results['tax_categories'],
                'name': 'Tax Categories',
            }
            detailed_results['detailed_results']['tax_codes'] = {
                'success': True,
                'record_count': loader_results['tax_codes'],
                'name': 'Tax Codes',
            }
            detailed_results['detailed_results']['account_types'] = {
                'success': True,
                'record_count': loader_results['account_types'],
                'name': 'Account Types',
            }
            
            # Update progress
            progress, _ = TenantOnboardingProgress.objects.get_or_create(
                tenant=tenant
            )
            progress.complete_step(4, {
                'presets_provisioned': detailed_results['results'],
                'detailed_results': detailed_results['detailed_results'],
                'country_code': tenant.country_code,
                'industry_code': tenant.industry_code,
            })
            
            logger.info(
                f"Onboarding Step 4 completed for tenant {tenant.id} "
                f"by user {request.user.id}. Presets: {detailed_results}"
            )
            
            return Response({
                'success': True,
                'message': 'Presets provisioned successfully',
                'presets': detailed_results['results'],
                'detailed_results': detailed_results['detailed_results'],
                'total_presets': detailed_results['total_presets'],
                'successful_presets': detailed_results['successful_presets'],
                'current_step': progress.current_step,
            })
        
        except Exception as e:
            logger.error(f"Failed to complete Step 4: {e}")
            return Response(
                {'error': f'Failed to provision presets: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OnboardingStep5View(APIView):
    """Step 5: Confirmation & Lock-In"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify all steps are completed
        progress, _ = TenantOnboardingProgress.objects.get_or_create(
            tenant=tenant
        )
        
        required_steps = [1, 2, 3, 4]
        if not all(progress.is_step_completed(step) for step in required_steps):
            return Response(
                {'error': 'All previous steps must be completed first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Mark onboarding as completed
                tenant.onboarding_status = 'COMPLETED'
                tenant.onboarded_at = timezone.now()
                tenant.save()
                
                # Complete final step
                progress.complete_step(5, {
                    'completed_at': timezone.now().isoformat(),
                })
                
                logger.info(
                    f"Onboarding completed for tenant {tenant.id} "
                    f"by user {request.user.id}"
                )
            
            return Response({
                'success': True,
                'message': 'Onboarding completed successfully',
                'onboarding_status': tenant.onboarding_status,
                'onboarded_at': tenant.onboarded_at.isoformat(),
            })
        
        except Exception as e:
            logger.error(f"Failed to complete Step 5: {e}")
            return Response(
                {'error': 'Failed to complete onboarding'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

