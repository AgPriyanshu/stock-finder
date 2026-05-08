import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Shop
from .services.cache import nearby_cache_invalidate_all

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Shop)
def invalidate_nearby_cache_on_shop_change(sender, instance, **kwargs):
    try:
        nearby_cache_invalidate_all()
    except Exception:
        logger.exception("Failed to invalidate nearby cache for shop %s.", instance.pk)
