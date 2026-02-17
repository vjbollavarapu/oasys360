# Generated migration for E-Invoice Submission model

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('invoicing', '0005_add_e_invoice_fields'),
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EInvoiceSubmission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('submission_type', models.CharField(choices=[('submit', 'Submit'), ('status_check', 'Status Check'), ('cancel', 'Cancel')], default='submit', max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('request_payload', models.JSONField(blank=True, default=dict, help_text='Request sent to MyInvois')),
                ('response_payload', models.JSONField(blank=True, default=dict, help_text='Response from MyInvois', null=True)),
                ('qrid', models.CharField(blank=True, help_text='LHDN Reference Number (QRID)', max_length=255, null=True)),
                ('error_message', models.TextField(blank=True, null=True)),
                ('error_code', models.CharField(blank=True, max_length=100, null=True)),
                ('retry_count', models.IntegerField(default=0)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='e_invoice_submissions', to='authentication.user')),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='e_invoice_submissions', to='invoicing.invoice')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='e_invoice_submissions', to='tenants.tenant')),
            ],
            options={
                'verbose_name': 'E-Invoice Submission',
                'verbose_name_plural': 'E-Invoice Submissions',
                'db_table': 'e_invoice_submissions',
                'ordering': ['-submitted_at'],
            },
        ),
        migrations.AddIndex(
            model_name='einvoicesubmission',
            index=models.Index(fields=['invoice', '-submitted_at'], name='e_invoice__invoice_8a3f2d_idx'),
        ),
        migrations.AddIndex(
            model_name='einvoicesubmission',
            index=models.Index(fields=['tenant', '-submitted_at'], name='e_invoice__tenant__b4c5e6_idx'),
        ),
        migrations.AddIndex(
            model_name='einvoicesubmission',
            index=models.Index(fields=['status'], name='e_invoice__status_7d8e9f_idx'),
        ),
    ]

