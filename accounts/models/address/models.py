from django.db import models

class SupplierAddress(models.Model):
    supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    address1 = models.CharField(max_length=255, null=True)
    address2 = models.CharField(max_length=255, null=True)
    city = models.CharField(max_length=255, null=True)
    postcode = models.CharField(max_length=10, null=True)
    state = models.CharField(max_length=255, null=True)
    country = models.CharField(max_length=255, null=True)
    phone = models.CharField(max_length=20, null=True)
    email = models.EmailField(max_length=255, null=True)
    in_charge = models.CharField(max_length=255, null=True)
    in_charge_phone = models.CharField(max_length=20, null=True)

    def __str__(self):
        return self.description

class CustomerAddress(models.Model):
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    address1 = models.CharField(max_length=255, null=True)
    address2 = models.CharField(max_length=255, null=True)
    city = models.CharField(max_length=255, null=True)
    postcode = models.CharField(max_length=10, null=True)
    state = models.CharField(max_length=255, null=True)
    country = models.CharField(max_length=255, null=True)
    phone = models.CharField(max_length=20, null=True)
    email = models.EmailField(max_length=255, null=True)
    in_charge = models.CharField(max_length=255, null=True)
    in_charge_phone = models.CharField(max_length=20, null=True)

    def __str__(self):
        return self.description