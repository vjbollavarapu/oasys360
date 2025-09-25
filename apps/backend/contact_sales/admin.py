from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import SalesInquiry, SalesInquiryResponse, SalesInquiryAttachment


@admin.register(SalesInquiry)
class SalesInquiryAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'company', 'email', 'inquiry_type', 'status', 
        'priority', 'assigned_to', 'created_at', 'contacted_at'
    ]
    list_filter = [
        'status', 'priority', 'inquiry_type', 'source', 'assigned_to',
        'created_at', 'contacted_at', 'is_active'
    ]
    search_fields = [
        'first_name', 'last_name', 'company', 'email', 'phone', 
        'subject', 'message'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at', 'contacted_at']
    fieldsets = (
        ('Contact Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'company', 'job_title', 'website')
        }),
        ('Inquiry Details', {
            'fields': ('inquiry_type', 'subject', 'message', 'source')
        }),
        ('Business Information', {
            'fields': ('company_size', 'industry', 'current_solution', 'budget_range', 'timeline'),
            'classes': ('collapse',)
        }),
        ('Status and Assignment', {
            'fields': ('status', 'priority', 'assigned_to', 'notes', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at', 'contacted_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('assigned_to', 'tenant')
    
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Full Name'
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ['tenant']
        return self.readonly_fields
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating a new object
            obj.tenant = request.user.tenant
        super().save_model(request, obj, form, change)


@admin.register(SalesInquiryResponse)
class SalesInquiryResponseAdmin(admin.ModelAdmin):
    list_display = [
        'inquiry_link', 'responded_by', 'response_type', 'subject', 'created_at'
    ]
    list_filter = ['response_type', 'is_internal', 'created_at']
    search_fields = ['subject', 'message', 'inquiry__first_name', 'inquiry__last_name']
    readonly_fields = ['id', 'created_at']
    fieldsets = (
        ('Response Details', {
            'fields': ('inquiry', 'response_type', 'subject', 'message', 'is_internal')
        }),
        ('Metadata', {
            'fields': ('id', 'responded_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
    
    def inquiry_link(self, obj):
        url = reverse('admin:contact_sales_salesinquiry_change', args=[obj.inquiry.id])
        return format_html('<a href="{}">{}</a>', url, obj.inquiry.full_name)
    inquiry_link.short_description = 'Inquiry'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('inquiry', 'responded_by')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating a new object
            obj.responded_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(SalesInquiryAttachment)
class SalesInquiryAttachmentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'inquiry_link', 'file_size', 'file_type', 'created_at']
    list_filter = ['file_type', 'created_at']
    search_fields = ['file_name', 'description', 'inquiry__first_name', 'inquiry__last_name']
    readonly_fields = ['id', 'file_size', 'created_at']
    fieldsets = (
        ('File Information', {
            'fields': ('inquiry', 'file_name', 'file_path', 'file_size', 'file_type')
        }),
        ('Additional Details', {
            'fields': ('description', 'uploaded_by')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
    
    def inquiry_link(self, obj):
        url = reverse('admin:contact_sales_salesinquiry_change', args=[obj.inquiry.id])
        return format_html('<a href="{}">{}</a>', url, obj.inquiry.full_name)
    inquiry_link.short_description = 'Inquiry'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('inquiry', 'uploaded_by')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating a new object
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)