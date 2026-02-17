# Generated migration for LHDN e-Invois fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('invoicing', '0004_invoiceline_created_by_invoiceline_updated_by'),
    ]

    operations = [
        # Add e-invoice fields to Invoice model
        migrations.AddField(
            model_name='invoice',
            name='e_invoice_status',
            field=models.CharField(
                blank=True,
                choices=[
                    ('pending', 'Pending'),
                    ('submitted', 'Submitted'),
                    ('accepted', 'Accepted'),
                    ('rejected', 'Rejected'),
                    ('cancelled', 'Cancelled'),
                ],
                default='pending',
                help_text='E-Invoice submission status to LHDN',
                max_length=20,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='lhdn_reference_number',
            field=models.CharField(
                blank=True,
                help_text='QRID from LHDN',
                max_length=255,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='submitted_to_lhdn_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='lhdn_validated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='e_invoice_xml',
            field=models.TextField(
                blank=True,
                help_text='Generated UBL 2.1 XML format',
                null=True
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='e_invoice_json',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Generated UBL 2.1 JSON format',
                null=True
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='e_invoice_errors',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Validation errors from LHDN'
            ),
        ),
        
        # Add e-invoice fields to InvoiceLine model
        migrations.AddField(
            model_name='invoiceline',
            name='msic_code',
            field=models.CharField(
                blank=True,
                help_text='Malaysia Standard Industrial Classification code',
                max_length=20,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='invoiceline',
            name='tax_category',
            field=models.CharField(
                blank=True,
                choices=[
                    ('standard', 'Standard Rate'),
                    ('zero_rated', 'Zero Rated'),
                    ('exempt', 'Exempt'),
                    ('out_of_scope', 'Out of Scope'),
                ],
                help_text='Tax category for LHDN e-Invois',
                max_length=20,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='invoiceline',
            name='tax_exemption_code',
            field=models.CharField(
                blank=True,
                help_text='Tax exemption code if applicable',
                max_length=50,
                null=True
            ),
        ),
    ]

