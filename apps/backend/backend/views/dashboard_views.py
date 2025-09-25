"""
Dashboard views for different user roles in the public schema
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth.models import User
# Import models with error handling
try:
    from tenant.models import Tenant, TenantUser, TenantUsage
except ImportError:
    Tenant = TenantUser = TenantUsage = None

try:
    from clinic.models import Clinic
except ImportError:
    Clinic = None

try:
    from study.models import Patient, Study
except ImportError:
    Patient = Study = None

try:
    from radiologyreport.models import RadiologyReport
except ImportError:
    RadiologyReport = None

try:
    from invoice.models import Invoice
except ImportError:
    Invoice = None

try:
    from logging_system.models import ActivityLog, SystemLog, AuditTrail
except ImportError:
    ActivityLog = SystemLog = AuditTrail = None

try:
    from radiologist.models import RadiologistProfile
except ImportError:
    RadiologistProfile = None
import json


class BaseDashboardView(APIView):
    """Base class for dashboard views"""
    permission_classes = [IsAuthenticated]
    
    def get_user_role(self, request):
        """Get the current user's role"""
        if request.user.is_superuser:
            return 'super_administrator'
        elif request.user.is_staff:
            return 'admin'
        else:
            # Check if user has any tenant roles
            if TenantUser:
                tenant_users = TenantUser.objects.filter(user=request.user)
                if tenant_users.exists():
                    return tenant_users.first().role
        return 'user'


class SuperAdminDashboardView(BaseDashboardView):
    """Dashboard for Super Administrators"""
    
    def get(self, request):
        """Get super admin dashboard data"""
        if not request.user.is_superuser:
            return Response({'error': 'Access denied'}, status=403)
        
        # System-wide statistics
        total_tenants = Tenant.objects.count() if Tenant else 0
        active_tenants = Tenant.objects.filter(subscription_status='active').count() if Tenant else 0
        trial_tenants = Tenant.objects.filter(subscription_status='trial').count() if Tenant else 0
        suspended_tenants = Tenant.objects.filter(subscription_status='suspended').count() if Tenant else 0
        
        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Platform usage
        total_patients = Patient.objects.count() if Patient else 0
        total_studies = Study.objects.count() if Study else 0
        total_reports = RadiologyReport.objects.count() if RadiologyReport else 0
        total_invoices = Invoice.objects.count() if Invoice else 0
        
        # Recent activity
        last_24h = timezone.now() - timedelta(hours=24)
        recent_activities = ActivityLog.objects.filter(
            timestamp__gte=last_24h
        ).order_by('-timestamp')[:10] if ActivityLog else []
        
        # System health
        system_errors = SystemLog.objects.filter(
            level__in=['error', 'critical'],
            timestamp__gte=last_24h
        ).count() if SystemLog else 0
        
        # Revenue metrics
        total_revenue = Invoice.objects.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0 if Invoice else 0
        
        monthly_revenue = Invoice.objects.filter(
            status='paid',
            created_at__gte=timezone.now().replace(day=1)
        ).aggregate(total=Sum('amount'))['total'] or 0 if Invoice else 0
        
        # Top performing tenants
        top_tenants = Tenant.objects.annotate(
            patient_count=Count('patient', distinct=True),
            study_count=Count('study', distinct=True)
        ).order_by('-patient_count')[:5] if Tenant else []
        
        dashboard_data = {
            'role': 'super_administrator',
            'overview': {
                'total_tenants': total_tenants,
                'active_tenants': active_tenants,
                'trial_tenants': trial_tenants,
                'suspended_tenants': suspended_tenants,
                'total_users': total_users,
                'active_users': active_users,
                'total_patients': total_patients,
                'total_studies': total_studies,
                'total_reports': total_reports,
                'total_invoices': total_invoices,
            },
            'financial': {
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue),
                'revenue_growth': 15.5,  # Placeholder
            },
            'system_health': {
                'system_errors_24h': system_errors,
                'uptime_percentage': 99.8,
                'active_sessions': 45,
            },
            'top_tenants': [
                {
                    'id': tenant.id,
                    'name': tenant.name,
                    'patient_count': tenant.patient_count,
                    'study_count': tenant.study_count,
                    'status': tenant.subscription_status,
                }
                for tenant in top_tenants
            ],
            'recent_activities': [
                {
                    'id': activity.id,
                    'action': activity.action,
                    'description': activity.description,
                    'timestamp': activity.timestamp,
                    'user': activity.user.username if activity.user else 'System',
                }
                for activity in recent_activities
            ],
            'alerts': [
                {
                    'type': 'warning',
                    'message': f'{suspended_tenants} tenants are suspended',
                    'timestamp': timezone.now(),
                }
            ] if suspended_tenants > 0 else []
        }
        
        return Response(dashboard_data)


class AdminDashboardView(BaseDashboardView):
    """Dashboard for Administrators"""
    
    def get(self, request):
        """Get admin dashboard data"""
        if not request.user.is_staff:
            return Response({'error': 'Access denied'}, status=403)
        
        # User management statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        new_users_this_month = User.objects.filter(
            date_joined__gte=timezone.now().replace(day=1)
        ).count()
        
        # Tenant management
        total_tenants = Tenant.objects.count() if Tenant else 0
        active_tenants = Tenant.objects.filter(subscription_status='active').count() if Tenant else 0
        
        # Content statistics
        total_patients = Patient.objects.count() if Patient else 0
        total_studies = Study.objects.count() if Study else 0
        total_reports = RadiologyReport.objects.count() if RadiologyReport else 0
        
        # Recent user registrations
        recent_users = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).order_by('-date_joined')[:10]
        
        # System logs
        last_24h = timezone.now() - timedelta(hours=24)
        recent_logs = SystemLog.objects.filter(
            timestamp__gte=last_24h
        ).order_by('-timestamp')[:10] if SystemLog else []
        
        # Audit trail
        pending_audits = AuditTrail.objects.filter(
            requires_review=True,
            is_reviewed=False
        ).count() if AuditTrail else 0
        
        dashboard_data = {
            'role': 'admin',
            'overview': {
                'total_users': total_users,
                'active_users': active_users,
                'new_users_this_month': new_users_this_month,
                'total_tenants': total_tenants,
                'active_tenants': active_tenants,
                'total_patients': total_patients,
                'total_studies': total_studies,
                'total_reports': total_reports,
            },
            'user_management': {
                'pending_approvals': 0,  # Placeholder
                'recent_registrations': new_users_this_month,
                'user_activity_rate': 85.5,  # Placeholder
            },
            'system_monitoring': {
                'pending_audits': pending_audits,
                'system_errors_24h': recent_logs.filter(level__in=['error', 'critical']).count(),
                'active_sessions': 32,
            },
            'recent_users': [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'date_joined': user.date_joined,
                    'is_active': user.is_active,
                }
                for user in recent_users
            ],
            'recent_logs': [
                {
                    'id': log.id,
                    'level': log.level,
                    'message': log.message,
                    'timestamp': log.timestamp,
                }
                for log in recent_logs
            ],
        }
        
        return Response(dashboard_data)


class FinanceDashboardView(BaseDashboardView):
    """Dashboard for Finance/Accounting users"""
    
    def get(self, request):
        """Get finance dashboard data"""
        # Check if user has finance role
        user_role = self.get_user_role(request)
        if user_role not in ['accountant', 'finance_manager', 'accounts_receivable', 'accounts_payable']:
            return Response({'error': 'Access denied'}, status=403)
        
        # Financial statistics
        total_invoices = Invoice.objects.count() if Invoice else 0
        paid_invoices = Invoice.objects.filter(status='paid').count() if Invoice else 0
        unpaid_invoices = Invoice.objects.filter(status='unpaid').count() if Invoice else 0
        overdue_invoices = Invoice.objects.filter(
            status='unpaid',
            due_date__lt=timezone.now()
        ).count() if Invoice else 0
        
        # Revenue calculations
        total_revenue = Invoice.objects.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0 if Invoice else 0
        
        monthly_revenue = Invoice.objects.filter(
            status='paid',
            created_at__gte=timezone.now().replace(day=1)
        ).aggregate(total=Sum('amount'))['total'] or 0 if Invoice else 0
        
        # Outstanding amounts
        outstanding_amount = Invoice.objects.filter(status='unpaid').aggregate(
            total=Sum('amount')
        )['total'] or 0 if Invoice else 0
        
        # Payment trends (last 6 months)
        payment_trends = []
        if Invoice:
            for i in range(6):
                month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
                month_end = month_start.replace(day=1) + timedelta(days=30)
                month_revenue = Invoice.objects.filter(
                    status='paid',
                    created_at__gte=month_start,
                    created_at__lt=month_end
                ).aggregate(total=Sum('amount'))['total'] or 0
                payment_trends.append({
                    'month': month_start.strftime('%B %Y'),
                    'revenue': float(month_revenue),
                })
        
        # Top payers
        top_payers = Invoice.objects.filter(status='paid').values(
            'patient__clinic__name'
        ).annotate(
            total_paid=Sum('amount')
        ).order_by('-total_paid')[:5] if Invoice else []
        
        # Recent invoices
        recent_invoices = Invoice.objects.order_by('-created_at')[:10] if Invoice else []
        
        dashboard_data = {
            'role': 'finance',
            'overview': {
                'total_invoices': total_invoices,
                'paid_invoices': paid_invoices,
                'unpaid_invoices': unpaid_invoices,
                'overdue_invoices': overdue_invoices,
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue),
                'outstanding_amount': float(outstanding_amount),
            },
            'payment_metrics': {
                'payment_rate': (paid_invoices / total_invoices * 100) if total_invoices > 0 else 0,
                'average_payment_time': 15.5,  # Placeholder - days
                'collection_efficiency': 92.3,  # Placeholder - percentage
            },
            'payment_trends': payment_trends,
            'top_payers': [
                {
                    'clinic_name': payer['patient__clinic__name'] or 'Unknown',
                    'total_paid': float(payer['total_paid']),
                }
                for payer in top_payers
            ],
            'recent_invoices': [
                {
                    'id': invoice.id,
                    'patient_name': invoice.patient.name if invoice.patient else 'Unknown',
                    'amount': float(invoice.amount),
                    'status': invoice.status,
                    'created_at': invoice.created_at,
                    'due_date': invoice.due_date,
                }
                for invoice in recent_invoices
            ],
            'alerts': [
                {
                    'type': 'warning',
                    'message': f'{overdue_invoices} invoices are overdue',
                    'timestamp': timezone.now(),
                }
            ] if overdue_invoices > 0 else []
        }
        
        return Response(dashboard_data)


class ITAdminDashboardView(BaseDashboardView):
    """Dashboard for IT Administrators"""
    
    def get(self, request):
        """Get IT admin dashboard data"""
        # Check if user has IT admin role
        user_role = self.get_user_role(request)
        if user_role not in ['it_admin', 'platform_admin', 'super_administrator']:
            return Response({'error': 'Access denied'}, status=403)
        
        # System health metrics
        last_24h = timezone.now() - timedelta(hours=24)
        system_errors = SystemLog.objects.filter(
            level__in=['error', 'critical'],
            timestamp__gte=last_24h
        ).count() if SystemLog else 0
        
        system_warnings = SystemLog.objects.filter(
            level='warning',
            timestamp__gte=last_24h
        ).count() if SystemLog else 0
        
        # User activity
        active_sessions = 45  # Placeholder
        concurrent_users = 23  # Placeholder
        
        # Database metrics
        total_tenants = Tenant.objects.count() if Tenant else 0
        total_users = User.objects.count()
        total_patients = Patient.objects.count() if Patient else 0
        total_studies = Study.objects.count() if Study else 0
        
        # Performance metrics
        avg_response_time = 245  # Placeholder - milliseconds
        uptime_percentage = 99.8  # Placeholder
        
        # Recent system logs
        recent_logs = SystemLog.objects.filter(
            timestamp__gte=last_24h
        ).order_by('-timestamp')[:15] if SystemLog else []
        
        # Security events
        security_events = AuditTrail.objects.filter(
            category='security',
            timestamp__gte=last_24h
        ).order_by('-timestamp')[:10] if AuditTrail else []
        
        # Backup status
        last_backup = timezone.now() - timedelta(hours=2)  # Placeholder
        backup_status = 'success'  # Placeholder
        
        dashboard_data = {
            'role': 'it_admin',
            'system_health': {
                'system_errors_24h': system_errors,
                'system_warnings_24h': system_warnings,
                'uptime_percentage': uptime_percentage,
                'avg_response_time': avg_response_time,
                'active_sessions': active_sessions,
                'concurrent_users': concurrent_users,
            },
            'database_metrics': {
                'total_tenants': total_tenants,
                'total_users': total_users,
                'total_patients': total_patients,
                'total_studies': total_studies,
                'database_size_mb': 1250,  # Placeholder
                'connection_pool_usage': 65,  # Placeholder - percentage
            },
            'security': {
                'security_events_24h': security_events.count(),
                'failed_login_attempts': 12,  # Placeholder
                'suspicious_activities': 3,  # Placeholder
                'pending_security_reviews': 5,  # Placeholder
            },
            'backup_monitoring': {
                'last_backup': last_backup,
                'backup_status': backup_status,
                'backup_size_gb': 2.5,  # Placeholder
                'next_scheduled_backup': timezone.now() + timedelta(hours=22),
            },
            'recent_logs': [
                {
                    'id': log.id,
                    'level': log.level,
                    'message': log.message,
                    'timestamp': log.timestamp,
                    'category': log.category,
                }
                for log in recent_logs
            ],
            'security_events': [
                {
                    'id': event.id,
                    'event_type': event.event_type,
                    'description': event.description,
                    'risk_level': event.risk_level,
                    'timestamp': event.timestamp,
                }
                for event in security_events
            ],
            'alerts': [
                {
                    'type': 'error' if system_errors > 10 else 'warning',
                    'message': f'{system_errors} system errors in the last 24 hours',
                    'timestamp': timezone.now(),
                }
            ] if system_errors > 0 else []
        }
        
        return Response(dashboard_data)


class SupportTeamDashboardView(BaseDashboardView):
    """Dashboard for Support Team"""
    
    def get(self, request):
        """Get support team dashboard data"""
        # Check if user has support role
        user_role = self.get_user_role(request)
        if user_role not in ['support_agent', 'customer_success', 'platform_admin', 'super_administrator']:
            return Response({'error': 'Access denied'}, status=403)
        
        # Support metrics
        total_tenants = Tenant.objects.count() if Tenant else 0
        active_tenants = Tenant.objects.filter(subscription_status='active').count() if Tenant else 0
        trial_tenants = Tenant.objects.filter(subscription_status='trial').count() if Tenant else 0
        
        # User activity
        active_users_24h = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        # Recent user activity
        recent_activities = ActivityLog.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).order_by('-timestamp')[:20] if ActivityLog else []
        
        # System issues
        system_errors = SystemLog.objects.filter(
            level__in=['error', 'critical'],
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).count() if SystemLog else 0
        
        # Tenant health
        healthy_tenants = Tenant.objects.filter(subscription_status='active').count() if Tenant else 0
        problematic_tenants = Tenant.objects.filter(
            subscription_status__in=['suspended', 'expired']
        ).count() if Tenant else 0
        
        # Support tickets (placeholder data)
        open_tickets = 15  # Placeholder
        resolved_tickets_24h = 8  # Placeholder
        avg_resolution_time = 4.5  # Placeholder - hours
        
        # Recent tenant issues
        recent_issues = [
            {
                'tenant_name': 'Sample Clinic',
                'issue_type': 'Login Problem',
                'status': 'Open',
                'priority': 'Medium',
                'created_at': timezone.now() - timedelta(hours=2),
            },
            {
                'tenant_name': 'Medical Center',
                'issue_type': 'Report Generation',
                'status': 'In Progress',
                'priority': 'High',
                'created_at': timezone.now() - timedelta(hours=4),
            }
        ]
        
        dashboard_data = {
            'role': 'support_team',
            'overview': {
                'total_tenants': total_tenants,
                'active_tenants': active_tenants,
                'trial_tenants': trial_tenants,
                'active_users_24h': active_users_24h,
                'system_errors_24h': system_errors,
            },
            'support_metrics': {
                'open_tickets': open_tickets,
                'resolved_tickets_24h': resolved_tickets_24h,
                'avg_resolution_time': avg_resolution_time,
                'customer_satisfaction': 4.7,  # Placeholder - out of 5
            },
            'tenant_health': {
                'healthy_tenants': healthy_tenants,
                'problematic_tenants': problematic_tenants,
                'health_percentage': (healthy_tenants / total_tenants * 100) if total_tenants > 0 else 0,
            },
            'recent_activities': [
                {
                    'id': activity.id,
                    'action': activity.action,
                    'description': activity.description,
                    'user': activity.user.username if activity.user else 'System',
                    'timestamp': activity.timestamp,
                }
                for activity in recent_activities
            ],
            'recent_issues': recent_issues,
            'alerts': [
                {
                    'type': 'warning',
                    'message': f'{problematic_tenants} tenants have issues',
                    'timestamp': timezone.now(),
                }
            ] if problematic_tenants > 0 else []
        }
        
        return Response(dashboard_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_role_based_dashboard(request):
    """Get dashboard based on user role"""
    user_role = None
    
    if request.user.is_superuser:
        user_role = 'super_administrator'
    elif request.user.is_staff:
        user_role = 'admin'
    else:
        # Check tenant user roles
        if TenantUser:
            tenant_users = TenantUser.objects.filter(user=request.user)
            if tenant_users.exists():
                user_role = tenant_users.first().role
    
    # Route to appropriate dashboard based on role
    if user_role == 'super_administrator':
        view = SuperAdminDashboardView()
        return view.get(request)
    elif user_role == 'admin':
        view = AdminDashboardView()
        return view.get(request)
    elif user_role in ['accountant', 'finance_manager', 'accounts_receivable', 'accounts_payable']:
        view = FinanceDashboardView()
        return view.get(request)
    elif user_role in ['it_admin', 'platform_admin']:
        view = ITAdminDashboardView()
        return view.get(request)
    elif user_role in ['support_agent', 'customer_success']:
        view = SupportTeamDashboardView()
        return view.get(request)
    else:
        # Default dashboard for other roles
        return Response({
            'role': user_role or 'user',
            'message': 'Dashboard not available for this role',
            'available_features': [
                'View profile',
                'Change password',
                'Access basic features'
            ]
        })
