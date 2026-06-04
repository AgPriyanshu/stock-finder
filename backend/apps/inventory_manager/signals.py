import logging
import unicodedata
from datetime import timedelta

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import CatalogItem, InventoryItem

logger = logging.getLogger(__name__)


def normalize_name(text: str) -> str:
    """Lowercase + strip diacritics so trigram search matches across scripts."""
    nfkd = unicodedata.normalize("NFKD", text.lower())
    return "".join(c for c in nfkd if not unicodedata.combining(c)).strip()


@receiver(pre_save, sender=InventoryItem)
def fill_normalized_and_stale(sender, instance, **kwargs):
    if instance.name:
        instance.name_normalized = normalize_name(instance.name)

    if not instance.stale_at:
        instance.stale_at = timezone.now() + timedelta(days=30)


@receiver(post_save, sender=InventoryItem)
def sync_catalog(sender, instance, **kwargs):
    """Keep the global item catalog in sync whenever an item is saved."""
    if not instance.name_normalized:
        return

    try:
        CatalogItem.objects.get_or_create(
            name_normalized=instance.name_normalized,
            category=instance.category,
            defaults={"name": instance.name},
        )
    except Exception:
        logger.exception("Failed to sync catalog for item %s.", instance.pk)
