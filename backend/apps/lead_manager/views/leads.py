import logging

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication
from shared.throttles import LeadAnonThrottle, LeadUserThrottle

from ..models import Lead
from ..serializers import CreateLeadSerializer, LeadSerializer

logger = logging.getLogger(__name__)


def _anonymous_user_for_phone(phone: str, buyer_name: str = "") -> User:
    username = f"sf-buyer-{phone}"
    user, _ = User.objects.get_or_create(
        username=username,
        defaults={"first_name": buyer_name[:150], "is_active": False},
    )

    if buyer_name and not user.first_name:
        user.first_name = buyer_name[:150]
        user.save(update_fields=["first_name"])

    return user


class LeadCreateView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [AllowAny]
    throttle_classes = [LeadAnonThrottle, LeadUserThrottle]

    def post(self, request):
        from apps.inventory_manager.models import InventoryItem
        from apps.shop_manager.models import Shop

        serializer = CreateLeadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            shop = Shop.objects.get(pk=data["shop_id"])
        except Shop.DoesNotExist as exc:
            raise NotFound("Shop not found.") from exc

        item = None

        if data.get("item_id"):
            try:
                item = InventoryItem.objects.get(pk=data["item_id"], shop=shop)
            except InventoryItem.DoesNotExist as exc:
                raise NotFound("Item not found for this shop.") from exc

        if request.user.is_authenticated:
            buyer = request.user
        else:
            phone = data.get("phone", "")

            if not phone:
                raise ValidationError({"phone": "Phone is required for unauthenticated leads."})

            buyer = _anonymous_user_for_phone(phone, data.get("buyer_name", ""))

        lead = Lead.objects.create(
            user=buyer,
            shop=shop,
            item=item,
            message=data["message"],
        )
        return Response(LeadSerializer(lead).data, status=status.HTTP_201_CREATED)


class LeadInboxView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.shop_manager.models import Shop

        shop = Shop.objects.filter(user=request.user).first()

        if not shop:
            raise PermissionDenied("Create a shop before viewing leads.")

        leads = (
            Lead.objects.filter(shop=shop)
            .select_related("user", "item")
            .order_by("-created_at")[:100]
        )
        return Response(LeadSerializer(leads, many=True).data)


class LeadMarkContactedView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        from apps.shop_manager.models import Shop

        shop = Shop.objects.filter(user=request.user).first()

        if not shop:
            raise PermissionDenied("Create a shop before managing leads.")

        try:
            lead = Lead.objects.select_related("user", "item").get(pk=pk, shop=shop)
        except Lead.DoesNotExist as exc:
            raise NotFound("Lead not found.") from exc

        lead.contacted_at = timezone.now()
        lead.save(update_fields=["contacted_at", "updated_at"])
        return Response(LeadSerializer(lead).data)
