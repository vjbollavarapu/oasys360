from django.db import models

# Create your models here.
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)

class ProductGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)

class UOM(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Product(models.Model):
    name = models.CharField(max_length=100)
    product_group = models.ForeignKey(ProductGroup, on_delete=models.CASCADE)

class ProductBundle(models.Model):
    products = models.ManyToManyField(Product)
    product_group = models.ForeignKey(ProductGroup, on_delete=models.CASCADE)

class PurchaseOrder(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

class SalesOrder(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

class Quotation(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()