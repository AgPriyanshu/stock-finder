from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..serializers import SupportRequestSerializer


class SupportRequestView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [AllowAny]
    throttle_scope = "sf_support"

    def post(self, request):
        serializer = SupportRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        sender = "Guest (not signed in)"

        if user.is_authenticated:
            name = f"{user.first_name} {user.last_name}".strip()
            sender = f"{name} <{user.username}>" if name else user.username

        # Failures are not silenced, so the dialog can point the user to WhatsApp instead.
        if settings.NOTIFY_EMAIL:
            send_mail(
                subject=f"Support request: {data['title']}",
                message=(
                    f"From: {sender}\n"
                    f"Title: {data['title']}\n\n"
                    f"{data['comments']}\n"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.NOTIFY_EMAIL],
            )

        return Response({"received": True}, status=status.HTTP_200_OK)
