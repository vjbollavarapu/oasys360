from django.db import models
from django.utils import timezone

# Create your models here.
class FiscalYear(models.Model):
    name = models.CharField(max_length=255, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_open = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    def is_date_in_fiscal_year(self, date):
        return self.start_date <= date <= self.end_date

class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    company_no = models.CharField(max_length=20, unique=True)
    address1 = models.CharField(max_length=255, null=True)
    address2 = models.CharField(max_length=255, null=True)
    city = models.CharField(max_length=255, null=True)
    postcode = models.CharField(max_length=10, null=True)
    country = models.CharField(max_length=255, null=True)
    email = models.EmailField(max_length=255, null=True)
    phone = models.CharField(max_length=20, null=True)
    sst_no = models.CharField(max_length=20, null=True)
    tin_no = models.CharField(max_length=20, null=True)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True)
    acct_no = models.CharField(max_length=20, null=True)
    account = models.ForeignKey('Account', on_delete=models.SET_NULL, null=True)
    credit_limit = models.DecimalField(decimal_places=2, max_digits=10)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

class Customer(models.Model):
    name = models.CharField(max_length=255, unique=True)
    acct_no = models.CharField(max_length=20, null=True)
    account = models.ForeignKey('Account', on_delete=models.SET_NULL, null=True)
    credit_limit = models.DecimalField(decimal_places=2, max_digits=10)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

class Currency(models.Model):
    code = models.CharField(max_length=10, unique=True)
    symbol = models.CharField(max_length=5, unique=True)
    description = models.CharField(max_length=255, null=True)
    exchange_rate = models.FloatField(default=1.0)

class PaymentMethod(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=5, unique=True)

class AccountType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=5, unique=True)
    is_sys = models.BooleanField(default=False)
    type = models.CharField(max_length=2)

class Account(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=5, unique=True)
    type = models.ForeignKey(AccountType, on_delete=models.CASCADE)
    is_sys = models.BooleanField(default=False)
    parent = models.ForeignKey("self", null=True, on_delete=models.SET_NULL)

class PayType(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Project(models.Model):
    name = models.CharField(max_length=100, unique=True)

class CostCentre(models.Model):
    name = models.CharField(max_length=100, unique=True)
class PartyType(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Terms(models.Model):
    name = models.CharField(max_length=100, unique=True)


class OpeningBalance(models.Model):
    date = models.DateField()
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)

class PaymentEntry(models.Model):
    date = models.DateField()
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    ref_no = models.CharField(max_length=255, null=True)
    bank_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='payment_entries', null=True)
    pay_type = models.ForeignKey(PayType, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, null=True)

    # Link to the journal entries related to this payment
    journal_entry = models.ForeignKey('JournalEntry', on_delete=models.CASCADE, related_name='payment_entries')

    

class Invoice(models.Model):
    invoice_no = models.CharField(max_length=100, unique=True)
    invoice_date = models.DateField()
    due_date = models.DateField()

    party_type = models.ForeignKey(PartyType, on_delete=models.CASCADE, null=True)

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, null=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True)

    total_amount = models.DecimalField(decimal_places=2, max_digits=10)
    currency_total_amount = models.DecimalField(decimal_places=2, max_digits=10, null=True)

    tax_rate = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    tax_amount = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    currency_tax_amount = models.DecimalField(decimal_places=2, max_digits=10, null=True)

    notes = models.CharField(max_length=255, null=True)

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    currecy_rate = models.FloatField(default=1.0)

    net_amount = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    currency_net_amount = models.DecimalField(decimal_places=2, max_digits=10, null=True)

    discount = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    shipping_charge = models.DecimalField(decimal_places=2, max_digits=10, null=True)

    payment_terms = models.ForeignKey(Terms, on_delete=models.CASCADE, null=True)
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)
    cost_centre = models.ForeignKey(CostCentre, on_delete=models.CASCADE, null=True)

    paid = models.BooleanField(default=False)

    def calculate_balance_due(self):
        balance_due = self.total_amount - self.discount - self.shipping_charge
        return balance_due
    

class InvoiceDetail(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    product = models.ForeignKey(Account, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(decimal_places=2, max_digits=10)
    currency_unit_price = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    currency_amount = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    tax_percent = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    tax = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    currency_tax = models.DecimalField(decimal_places=2, max_digits=10, null=True)
    net_amount = models.DecimalField(decimal_places=2, max_digits=10, null=True)

class VoucherType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    account_type = models.ForeignKey(AccountType, on_delete=models.CASCADE)
    short_name = models.CharField(max_length=10, unique=True)
    category = models.CharField(max_length=10, default='Payment', choices=[('Payment', 'Payment'), ('Receipt', 'Receipt'), ('Journal', 'Journal')])

class JournalType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    account_type = models.ForeignKey(AccountType, on_delete=models.CASCADE)
    is_posting_allowed = models.BooleanField(default=True)
    is_auto_account = models.BooleanField(default=False)
    allow_without_account = models.BooleanField(default=False)
    reference_type = models.ForeignKey(VoucherType, on_delete=models.CASCADE, null=True)
    defualt_debit_account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    default_credit_account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    party_type = models.ForeignKey(PartyType, on_delete=models.CASCADE, null=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    auto_accounting = models.BooleanField(default=False)
    cost_centre = models.ForeignKey(CostCentre, on_delete=models.CASCADE, null=True)

class JournalEntry(models.Model):
    je_number = models.CharField(max_length=20, unique=True)
    journal_type = models.ForeignKey(JournalType, on_delete=models.CASCADE)
    posting_date = models.DateField(default=timezone.now)
    posting_time = models.TimeField(default=timezone.now)
    total_debit = models.DecimalField(decimal_places=2, max_digits=15, default=0.0)
    total_credit = models.DecimalField(decimal_places=2, max_digits=15, default=0.0)
    description = models.CharField(max_length=255, null=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.CASCADE)
    created_by = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.CharField(max_length=255, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.fiscal_year.is_date_in_fiscal_year(self.posting_date):
            raise Exception("Posting date must be within the fiscal year. Please check the data.")
        if self.total_debit == self.total_credit:
            super().save(*args, **kwargs)
        else:
            raise Exception("Debit and credit amounts must be equal. Please check the data.")
    
    def __str__(self):
        return f"Journal Entry - {self.id} - {self.je_number} - {self.total_debit} / {self.total_credit}"
class JournalEntryItem(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    debit_amount = models.DecimalField(decimal_places=2, max_digits=15, default=0.0)
    credit_amount = models.DecimalField(decimal_places=2, max_digits=15, default=0.0)
    description = models.CharField(max_length=255, null=True)

    
    def __str__(self):
        return f"Entry for {self.account.name} - Debit {self.debit_amount} / Credit {self.credit_amount}"
    
    class Meta:
        ordering = ['id']
