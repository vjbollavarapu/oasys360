"""
ERP Integration Models
Support for QuickBooks, Xero, NetSuite integrations
"""
from django.db import models
import uuid
from django.utils import timezone


class ERPConnection(models.Model):
    """
    ERP Connection model for managing integrations with external ERP systems
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='erp_connections')
    provider = models.CharField(max_length=50, choices=[
        ('quickbooks', 'QuickBooks'),
        ('xero', 'Xero'),
        ('netsuite', 'NetSuite'),
    ])
    name = models.CharField(max_length=255, help_text='Connection name/identifier')
    is_active = models.BooleanField(default=True)
    
    # OAuth tokens
    access_token = models.TextField(blank=True, help_text='OAuth access token (encrypted)')
    refresh_token = models.TextField(blank=True, help_text='OAuth refresh token (encrypted)')
    token_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Connection metadata
    realm_id = models.CharField(max_length=255, blank=True, help_text='QuickBooks Realm ID or Xero Tenant ID')
    company_name = models.CharField(max_length=255, blank=True)
    environment = models.CharField(max_length=20, default='sandbox', choices=[
        ('sandbox', 'Sandbox'),
        ('production', 'Production'),
    ])
    
    # Sync settings
    auto_sync = models.BooleanField(default=False, help_text='Enable automatic synchronization')
    sync_frequency_hours = models.IntegerField(default=24, help_text='Sync frequency in hours')
    last_sync_at = models.DateTimeField(null=True, blank=True)
    last_sync_status = models.CharField(max_length=20, blank=True, choices=[
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('in_progress', 'In Progress'),
    ])
    last_sync_error = models.TextField(blank=True)
    
    # Sync scope
    sync_invoices = models.BooleanField(default=True)
    sync_customers = models.BooleanField(default=True)
    sync_payments = models.BooleanField(default=True)
    sync_expenses = models.BooleanField(default=False)
    
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'erp_connections'
        verbose_name = 'ERP Connection'
        verbose_name_plural = 'ERP Connections'
        unique_together = ['tenant', 'provider', 'realm_id']

    def __str__(self):
        return f"{self.get_provider_display()} - {self.name}"


class ERPSyncLog(models.Model):
    """
    ERP Sync Log model for tracking synchronization operations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='erp_sync_logs')
    connection = models.ForeignKey(ERPConnection, on_delete=models.CASCADE, related_name='sync_logs')
    sync_type = models.CharField(max_length=50, choices=[
        ('invoices', 'Invoices'),
        ('customers', 'Customers'),
        ('payments', 'Payments'),
        ('expenses', 'Expenses'),
        ('full', 'Full Sync'),
    ])
    status = models.CharField(max_length=20, choices=[
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('in_progress', 'In Progress'),
        ('partial', 'Partial Success'),
    ])
    records_synced = models.IntegerField(default=0)
    records_failed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'erp_sync_logs'
        verbose_name = 'ERP Sync Log'
        verbose_name_plural = 'ERP Sync Logs'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.connection.name} - {self.sync_type} ({self.status})"


class ERPMapping(models.Model):
    """
    ERP Mapping model for mapping OASYS entities to ERP entities
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='erp_mappings')
    connection = models.ForeignKey(ERPConnection, on_delete=models.CASCADE, related_name='mappings')
    oasys_type = models.CharField(max_length=50, choices=[
        ('customer', 'Customer'),
        ('invoice', 'Invoice'),
        ('payment', 'Payment'),
        ('expense', 'Expense'),
    ])
    oasys_id = models.UUIDField(help_text='OASYS entity ID')
    erp_id = models.CharField(max_length=255, help_text='ERP entity ID')
    erp_type = models.CharField(max_length=50, help_text='ERP entity type')
    synced_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'erp_mappings'
        verbose_name = 'ERP Mapping'
        verbose_name_plural = 'ERP Mappings'
        unique_together = ['tenant', 'connection', 'oasys_type', 'oasys_id']

    def __str__(self):
        return f"{self.oasys_type} {self.oasys_id} -> {self.erp_id}"

