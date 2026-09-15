import secrets
import string

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

from shared.models.base_models import BaseModel


def _generate_referral_code():
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(8))


class ReferralCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="referral_code")
    code = models.CharField(max_length=16, unique=True, default=_generate_referral_code)
    click_count = models.PositiveIntegerField(default=0)
    signup_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Referral code"
        verbose_name_plural = "Referral codes"

    def __str__(self):
        return f"{self.code} ({self.user.username})"


class OwnerTour(BaseModel):
    """Exists once an owner has finished, skipped or closed an in-app tour."""

    class Name(models.TextChoices):
        PORTAL = "portal", "Portal"
        ADD_ITEM = "add_item", "Add item"

    name = models.CharField(max_length=32, choices=Name.choices)
    completed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "name"], name="sf_one_completion_per_owner_tour"),
        ]
