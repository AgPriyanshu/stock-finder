from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import Report
from ..serializers import CreateReportSerializer, ReportSerializer


class ReportCreateView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [AllowAny]
    throttle_scope = "sf_report"

    def post(self, request):
        from apps.inventory_manager.models import InventoryItem
        from apps.shop_manager.models import Shop

        serializer = CreateReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        shop = None
        item = None

        if data.get("shop_id"):
            shop = Shop.objects.filter(pk=data["shop_id"]).first()

        if data.get("item_id"):
            item = InventoryItem.objects.filter(pk=data["item_id"]).first()

        if not shop and not item:
            raise ValidationError("Report must target a shop or an item.")

        reporter = request.user if request.user.is_authenticated else None

        if reporter is None:
            reporter, _ = User.objects.get_or_create(
                username="sf-anonymous-reporter",
                defaults={"is_active": False},
            )

        report = Report.objects.create(
            user=reporter,
            shop=shop,
            item=item,
            reason=data["reason"],
        )
        return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)
