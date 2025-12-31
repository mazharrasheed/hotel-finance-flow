from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class CustomPermissions(models.Model):
    class Meta:
        permissions = [
            ('view_dashboard', 'Can view dashboard'),
            ("view_balance_sheet", "Can view balance sheet"),
            ("view_store", "Can view store"),
            ("view_reports", "Can view reports"),
            ("view_inventory", "Can view inventory"),
            ("view_measurements", "Can view measurements"),
            ("add_measurements", "Can add measurements"),
            ("change_measurements", "Can change measurements"),
            # Add more custom permissions here
        ]


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)

    filtered = SoftDeleteManager()
    objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self):
        self.is_deleted = True
        self.save()

    def hard_delete(self):
        super().delete()
import uuid
from django.db import models

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    color = models.CharField(max_length=50) # Stores hsl or hex

    def __str__(self):
        return self.name

class Transaction(models.Model):
    TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, related_name='transactions', on_delete=models.CASCADE)
    date = models.DateField() # Matches your ISO date format
    type = models.CharField(max_length=10, choices=TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']