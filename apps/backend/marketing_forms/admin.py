from django.contrib import admin
from .models import BetaProgramApplication, EarlyAccessRequest, FounderFeedback


@admin.register(BetaProgramApplication)
class BetaProgramApplicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'role', 'status', 'created_at']
    list_filter = ['status', 'role', 'company_size', 'created_at']
    search_fields = ['name', 'email', 'company']
    readonly_fields = ['id', 'created_at', 'updated_at', 'reviewed_at', 'approved_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'company', 'role', 'company_size')
        }),
        ('Application Details', {
            'fields': ('use_case', 'expectations')
        }),
        ('Status and Tracking', {
            'fields': ('status', 'assigned_to', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'reviewed_at', 'approved_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        for application in queryset:
            application.approve()
        self.message_user(request, f"{queryset.count()} applications approved.")
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        for application in queryset:
            application.reject()
        self.message_user(request, f"{queryset.count()} applications rejected.")
    reject_applications.short_description = "Reject selected applications"


@admin.register(EarlyAccessRequest)
class EarlyAccessRequestAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'industry', 'status', 'created_at']
    list_filter = ['status', 'industry', 'timeline', 'created_at']
    search_fields = ['name', 'email', 'company']
    readonly_fields = ['id', 'created_at', 'updated_at', 'reviewed_at', 'interview_scheduled_at', 'approved_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'company', 'role', 'company_size', 'industry')
        }),
        ('Request Details', {
            'fields': ('current_challenges', 'timeline', 'expectations')
        }),
        ('Status and Tracking', {
            'fields': ('status', 'assigned_to', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'reviewed_at', 'interview_scheduled_at', 'approved_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['schedule_interviews', 'approve_requests']
    
    def schedule_interviews(self, request, queryset):
        for request_obj in queryset:
            request_obj.schedule_interview()
        self.message_user(request, f"{queryset.count()} interviews scheduled.")
    schedule_interviews.short_description = "Schedule interviews for selected requests"
    
    def approve_requests(self, request, queryset):
        for request_obj in queryset:
            request_obj.approve()
        self.message_user(request, f"{queryset.count()} requests approved.")
    approve_requests.short_description = "Approve selected requests"


@admin.register(FounderFeedback)
class FounderFeedbackAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'feedback_type', 'subject', 'status', 'priority', 'created_at']
    list_filter = ['status', 'feedback_type', 'priority', 'contact_preference', 'created_at']
    search_fields = ['name', 'email', 'company', 'subject']
    readonly_fields = ['id', 'created_at', 'updated_at', 'acknowledged_at', 'responded_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'company', 'role')
        }),
        ('Feedback Details', {
            'fields': ('feedback_type', 'subject', 'message', 'priority', 'contact_preference')
        }),
        ('Status and Tracking', {
            'fields': ('status', 'assigned_to', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'acknowledged_at', 'responded_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['acknowledge_feedback', 'mark_responded']
    
    def acknowledge_feedback(self, request, queryset):
        for feedback in queryset:
            feedback.acknowledge()
        self.message_user(request, f"{queryset.count()} feedback items acknowledged.")
    acknowledge_feedback.short_description = "Acknowledge selected feedback"
    
    def mark_responded(self, request, queryset):
        for feedback in queryset:
            feedback.mark_responded()
        self.message_user(request, f"{queryset.count()} feedback items marked as responded.")
    mark_responded.short_description = "Mark selected feedback as responded"