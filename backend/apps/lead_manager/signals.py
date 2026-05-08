import json
import logging

import redis
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from shared.utils.redis import get_notifications_channel

from .models import Lead

logger = logging.getLogger(__name__)

_redis_client = redis.from_url(
    settings.CACHES["default"]["LOCATION"],
    decode_responses=True,
)


@receiver(post_save, sender=Lead)
def notify_shop_owner_on_lead(sender, instance, created, **kwargs):
    if not created:
        return

    try:
        channel = get_notifications_channel(instance.shop.user_id)
        payload = {
            "type": "stock_finder.lead_created",
            "lead_id": str(instance.pk),
            "shop_id": str(instance.shop_id),
            "buyer_name": instance.user.first_name or instance.user.username,
        }
        _redis_client.publish(channel, json.dumps(payload))
    except Exception:
        logger.exception("Failed to publish lead SSE event for lead %s.", instance.pk)
