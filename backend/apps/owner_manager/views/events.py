import json
import time

import redis as redis_module
from django.conf import settings
from django.http import StreamingHttpResponse
from django.views import View

from apps.owner_manager.services.jwt_tokens import decode_token, looks_like_jwt
from shared.utils.redis import get_notifications_channel


def _authenticate_token(token: str):
    """Return User or None given a raw JWT string."""
    import jwt as pyjwt

    from django.contrib.auth.models import User

    if not token or not looks_like_jwt(token):
        return None

    try:
        payload = decode_token(token)
        return User.objects.get(pk=int(payload["sub"]))
    except Exception:
        return None


def _event_stream(user_pk):
    r = redis_module.from_url(
        settings.CACHES["default"]["LOCATION"],
        decode_responses=True,
    )
    pubsub = r.pubsub()
    channel = get_notifications_channel(user_pk)
    pubsub.subscribe(channel)

    yield f"data: {json.dumps({'type': 'connected'})}\n\n"

    last_ping = time.time()

    try:
        while True:
            message = pubsub.get_message(timeout=1.0)

            if message and message["type"] == "message":
                yield f"data: {message['data']}\n\n"

            if time.time() - last_ping >= 30:
                yield ": ping\n\n"
                last_ping = time.time()
    finally:
        pubsub.unsubscribe(channel)
        pubsub.close()
        r.close()


class OwnerEventsView(View):
    def get(self, request):
        token = request.GET.get("token", "")
        user = _authenticate_token(token)

        if user is None:
            from django.http import JsonResponse
            return JsonResponse({"detail": "Unauthorized."}, status=401)

        response = StreamingHttpResponse(
            _event_stream(user.pk),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        response["Connection"] = "keep-alive"
        return response
