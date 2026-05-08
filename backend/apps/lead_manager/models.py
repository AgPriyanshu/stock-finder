from django.contrib.auth.models import User
from django.db import models

from shared.models.base_models import BaseModel, BaseModelWithoutUser


class Lead(BaseModel):
    """Represents a buyer's enquiry about a specific inventory item."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"

    item = models.ForeignKey(
        "inventory_manager.InventoryItem",
        on_delete=models.CASCADE,
        related_name="leads",
    )
    shop = models.ForeignKey(
        "shop_manager.Shop",
        on_delete=models.CASCADE,
        related_name="leads",
    )
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    contacted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "lead_manager_lead"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["shop", "status"], name="sf_lead_shop_status_idx"),
            models.Index(fields=["item"], name="sf_lead_item_idx"),
        ]
        unique_together = [("user", "item")]

    def __str__(self):
        return f"Lead({self.user_id} → {self.item_id}, {self.status})"


class Report(BaseModelWithoutUser):
    """Abuse or quality report filed against an item or shop (semi-anonymous)."""

    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sf_reports",
    )
    item = models.ForeignKey(
        "inventory_manager.InventoryItem",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports",
    )
    shop = models.ForeignKey(
        "shop_manager.Shop",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports",
    )
    reason = models.CharField(max_length=200)
    details = models.TextField(blank=True)

    class Meta:
        db_table = "lead_manager_report"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Report({self.reason[:40]})"
