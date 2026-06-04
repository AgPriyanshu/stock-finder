from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import Shop, ShopImage
from ..serializers import (
    ConfirmShopImageRequestSerializer,
    PresignShopImageRequestSerializer,
    ShopImageSerializer,
    ShopSerializer,
    ShopWithDistanceSerializer,
)
from ..services import images as image_service
from ..services.cache import nearby_cache_get, nearby_cache_set

MAX_SHOP_IMAGES = 3


class ShopViewSet(viewsets.ViewSet):
    authentication_classes = [JWTBearerAuthentication]

    def get_permissions(self):
        if self.action in ("retrieve", "nearby", "items", "stats"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request):
        if Shop.objects.filter(user=request.user).exists():
            raise ValidationError(
                "Shop already exists for this user.", code="already_exists"
            )

        serializer = ShopSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        shop = Shop.objects.create(user=request.user, **serializer.validated_data)
        return Response(ShopSerializer(shop).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            shop = Shop.objects.prefetch_related("images").get(pk=pk)
        except Shop.DoesNotExist as exc:
            raise NotFound("Shop not found.") from exc

        return Response(ShopSerializer(shop).data)

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        shop = Shop.objects.prefetch_related("images").filter(user=request.user).first()

        if not shop:
            raise NotFound("You don't have a shop yet.")

        if request.method == "GET":
            return Response(ShopSerializer(shop).data)

        serializer = ShopSerializer(shop, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        for k, v in serializer.validated_data.items():
            setattr(shop, k, v)

        shop.save()
        return Response(ShopSerializer(shop).data)

    @action(detail=False, methods=["post"], url_path="me/images/presign")
    def presign_image(self, request):
        shop = Shop.objects.filter(user=request.user).first()

        if not shop:
            raise NotFound("You don't have a shop yet.")

        if shop.images.count() >= MAX_SHOP_IMAGES:
            return Response(
                {"meta": {"status_code": 400, "success": False, "message": f"Maximum {MAX_SHOP_IMAGES} images allowed."}, "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PresignShopImageRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        presign_data = image_service.presign_put(
            shop_id=str(shop.pk),
            content_type=serializer.validated_data["content_type"],
        )

        return Response(
            {"meta": {"status_code": 200, "success": True, "message": "Presigned URL generated."}, "data": presign_data},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="me/images/confirm")
    def confirm_image(self, request):
        shop = Shop.objects.filter(user=request.user).first()

        if not shop:
            raise NotFound("You don't have a shop yet.")

        if shop.images.count() >= MAX_SHOP_IMAGES:
            return Response(
                {"meta": {"status_code": 400, "success": False, "message": f"Maximum {MAX_SHOP_IMAGES} images allowed."}, "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConfirmShopImageRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        existing_count = shop.images.count()
        image = ShopImage.objects.create(
            shop=shop,
            s3_key=serializer.validated_data["key"],
            width=serializer.validated_data["width"],
            height=serializer.validated_data["height"],
            is_primary=existing_count == 0 or serializer.validated_data.get("is_primary", False),
            position=existing_count,
        )

        return Response(
            {"meta": {"status_code": 201, "success": True, "message": "Image confirmed."}, "data": ShopImageSerializer(image).data},
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["delete"],
        url_path=r"me/images/(?P<image_id>[0-9a-f-]+)",
    )
    def delete_image(self, request, image_id=None):
        shop = Shop.objects.filter(user=request.user).first()

        if not shop:
            raise NotFound("You don't have a shop yet.")

        try:
            image = shop.images.get(pk=image_id)
        except ShopImage.DoesNotExist:
            return Response(
                {"meta": {"status_code": 404, "success": False, "message": "Image not found."}, "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        s3_key = image.s3_key
        image.delete()
        image_service.delete_object(s3_key)

        return Response(
            {"meta": {"status_code": 200, "success": True, "message": "Image deleted."}, "data": None},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def nearby(self, request):
        try:
            lat = float(request.query_params["lat"])
            lng = float(request.query_params["lng"])
        except (KeyError, ValueError) as exc:
            raise ValidationError("lat and lng are required floats.") from exc

        radius_km = float(request.query_params.get("radius_km", 5))
        limit = min(int(request.query_params.get("limit", 20)), 100)
        cached = nearby_cache_get(lat, lng, radius_km)

        if cached is not None:
            return Response({"shops": cached})

        point = Point(lng, lat, srid=4326)
        qs = (
            Shop.objects.annotate(distance=Distance("location", point))
            .filter(location__dwithin=(point, D(km=radius_km)))
            .order_by("distance")[:limit]
        )
        data = ShopWithDistanceSerializer(qs, many=True).data
        nearby_cache_set(lat, lng, radius_km, data)
        return Response({"shops": data})

    @action(detail=False, methods=["get"], url_path="stats", permission_classes=[AllowAny])
    def stats(self, request):
        count = Shop.objects.count()
        return Response(
            {"meta": {"status_code": 200, "success": True, "message": ""}, "data": {"shopCount": count}},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def items(self, request, pk=None):
        from apps.inventory_manager.models import InventoryItem
        from apps.inventory_manager.serializers import SearchItemSerializer

        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist as exc:
            raise NotFound("Shop not found.") from exc

        limit = min(int(request.query_params.get("limit", 30)), 100)
        qs = (
            InventoryItem.objects.filter(shop=shop, status=InventoryItem.Status.ACTIVE)
            .select_related("shop", "category")
            .prefetch_related("images")
            .order_by("-updated_at")[:limit]
        )
        return Response({"items": SearchItemSerializer(qs, many=True).data})
