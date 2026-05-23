import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Avg
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Shop, ShopReview
from .services.cache import nearby_cache_invalidate_all

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Shop)
def invalidate_nearby_cache_on_shop_change(sender, instance, created, **kwargs):
    try:
        nearby_cache_invalidate_all()
    except Exception:
        logger.exception("Failed to invalidate nearby cache for shop %s.", instance.pk)

    if not created or not settings.NOTIFY_EMAIL:
        return

    try:
        owner = instance.user
        owner_name = f"{owner.first_name} {owner.last_name}".strip() or owner.username
        send_mail(
            subject=f"New shop sign-up: {instance.name}",
            message=(
                f"A new shop was just registered on Stock Finder.\n\n"
                f"Shop: {instance.name}\n"
                f"Owner: {owner_name}\n"
                f"Email/Username: {owner.username}\n"
                f"City: {instance.city or '(not set)'}\n"
                f"Phone: {instance.phone}\n"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.NOTIFY_EMAIL],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send sign-up notification email for shop %s.", instance.pk)


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
