import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from django.db.models import Avg

from .models import Shop, ShopReview
from .services.cache import nearby_cache_invalidate_all

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Shop)
def invalidate_nearby_cache_on_shop_change(sender, instance, **kwargs):
    try:
        nearby_cache_invalidate_all()
    except Exception:
        logger.exception("Failed to invalidate nearby cache for shop %s.", instance.pk)


@receiver(post_save, sender=ShopReview)
def update_shop_rating_avg(sender, instance, **kwargs):
    try:
        avg = ShopReview.objects.filter(shop=instance.shop).aggregate(
            avg=Avg("rating")
        )["avg"]
        instance.shop.rating_avg = round(avg or 0, 2)
        instance.shop.save(update_fields=["rating_avg"])
    except Exception:
        logger.exception("Failed to update rating_avg for shop %s.", instance.shop_id)
