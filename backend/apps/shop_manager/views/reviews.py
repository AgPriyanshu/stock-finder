from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import Shop, ShopReview
from ..serializers import CreateShopReviewSerializer, ShopReviewSerializer


class ShopReviewsView(APIView):
    authentication_classes = [JWTBearerAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist as exc:
            raise NotFound("Shop not found.") from exc

        reviews = shop.reviews.order_by("-created_at")[:50]
        return Response({
            "meta": {"status_code": 200, "success": True, "message": ""},
            "data": {
                "reviews": ShopReviewSerializer(reviews, many=True).data,
                "rating_avg": float(shop.rating_avg),
                "count": shop.reviews.count(),
            },
        })

    def post(self, request, pk):
        from apps.lead_manager.models import Lead

        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist as exc:
            raise NotFound("Shop not found.") from exc

        serializer = CreateShopReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lead_id = serializer.validated_data["lead_id"]

        try:
            lead = Lead.objects.get(pk=lead_id, shop=shop)
        except Lead.DoesNotExist as exc:
            raise NotFound("Lead not found for this shop.") from exc

        if ShopReview.objects.filter(lead=lead).exists():
            raise ValidationError("A review has already been submitted for this lead.")

        review = ShopReview.objects.create(
            shop=shop,
            lead=lead,
            rating=serializer.validated_data["rating"],
            comment=serializer.validated_data.get("comment", ""),
        )

        return Response(
            {
                "meta": {"status_code": 201, "success": True, "message": "Review submitted."},
                "data": ShopReviewSerializer(review).data,
            },
            status=201,
        )
