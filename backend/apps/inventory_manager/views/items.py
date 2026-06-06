import logging
from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import InventoryItem, ItemImage
from ..serializers import (
    ConfirmImageRequestSerializer,
    InventoryItemSerializer,
    ItemImageSerializer,
    PresignImageRequestSerializer,
)
from ..services import images as image_service
from ..tasks import generate_image_variants

logger = logging.getLogger(__name__)

REFRESH_DAYS = 30


class InventoryItemViewSet(ViewSet):
    authentication_classes = [JWTBearerAuthentication]

    def _get_owner_qs(self, request):
        return InventoryItem.objects.filter(
            shop__user=request.user
        ).select_related("shop", "category").prefetch_related("images")

    def _get_item_or_404(self, request, pk):
        try:
            return self._get_owner_qs(request).get(pk=pk)
        except InventoryItem.DoesNotExist:
            return None

    def list(self, request):
        qs = self._get_owner_qs(request)
        status_filter = request.query_params.get("status")

        if status_filter:
            qs = qs.filter(status=status_filter)

        serializer = InventoryItemSerializer(qs, many=True)

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Items retrieved successfully.",
                },
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request):
        # Lazy import to avoid cross-app module-level dependency.
        from apps.shop_manager.models import Shop

        try:
            shop = Shop.objects.get(user=request.user)
        except Shop.DoesNotExist:
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_400_BAD_REQUEST,
                        "success": False,
                        "message": "You must have a shop before creating items.",
                    },
                    "data": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = InventoryItemSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_400_BAD_REQUEST,
                        "success": False,
                        "message": "Invalid data.",
                    },
                    "data": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        item = serializer.save(
            user=request.user,
            shop=shop,
            stale_at=timezone.now() + timedelta(days=REFRESH_DAYS),
        )

        # Fire variant generation for any already-confirmed images on this item.
        for image in item.images.all():
            generate_image_variants.delay(str(image.pk))

        out = InventoryItemSerializer(item)

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_201_CREATED,
                    "success": True,
                    "message": "Item created successfully.",
                },
                "data": out.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_404_NOT_FOUND,
                        "success": False,
                        "message": "Item not found.",
                    },
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InventoryItemSerializer(item)

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Item retrieved successfully.",
                },
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def update(self, request, pk=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_404_NOT_FOUND,
                        "success": False,
                        "message": "Item not found.",
                    },
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InventoryItemSerializer(item, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_400_BAD_REQUEST,
                        "success": False,
                        "message": "Invalid data.",
                    },
                    "data": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Item updated successfully.",
                },
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request, pk=None):
        return self.update(request, pk=pk)

    def destroy(self, request, pk=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_404_NOT_FOUND,
                        "success": False,
                        "message": "Item not found.",
                    },
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Item deleted successfully.",
                },
                "data": None,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="refresh")
    def refresh(self, request, pk=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_404_NOT_FOUND,
                        "success": False,
                        "message": "Item not found.",
                    },
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        item.stale_at = timezone.now() + timedelta(days=REFRESH_DAYS)
        item.status = InventoryItem.Status.ACTIVE
        item.save(update_fields=["stale_at", "status", "updated_at"])

        serializer = InventoryItemSerializer(item)

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Item refreshed successfully.",
                },
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="images/presign")
    def presign_image(self, request, pk=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_404_NOT_FOUND,
                        "success": False,
                        "message": "Item not found.",
                    },
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PresignImageRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_400_BAD_REQUEST,
                        "success": False,
                        "message": "Invalid request data.",
                    },
                    "data": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        presign_data = image_service.presign_put(
            item_id=str(item.pk),
            content_type=serializer.validated_data["content_type"],
        )

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Presigned URL generated successfully.",
                },
                "data": presign_data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="images/confirm")
    def confirm_image(self, request, pk=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_404_NOT_FOUND,
                        "success": False,
                        "message": "Item not found.",
                    },
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ConfirmImageRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "meta": {
                        "status_code": status.HTTP_400_BAD_REQUEST,
                        "success": False,
                        "message": "Invalid request data.",
                    },
                    "data": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine next position for this item's images.
        existing_count = item.images.count()

        image = ItemImage.objects.create(
            item=item,
            s3_key=serializer.validated_data["key"],
            width=serializer.validated_data["width"],
            height=serializer.validated_data["height"],
            is_primary=serializer.validated_data.get("is_primary", False),
            position=existing_count,
        )

        generate_image_variants.delay(str(image.pk))

        out = ItemImageSerializer(image)

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_201_CREATED,
                    "success": True,
                    "message": "Image confirmed successfully.",
                },
                "data": out.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="images/reorder",
    )
    def reorder_images(self, request, pk=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {"meta": {"status_code": status.HTTP_404_NOT_FOUND, "success": False, "message": "Item not found."}, "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        image_ids = request.data.get("image_ids", [])

        for position, image_id in enumerate(image_ids):
            item.images.filter(pk=image_id).update(position=position)

        return Response(
            {"meta": {"status_code": status.HTTP_200_OK, "success": True, "message": "Images reordered."}, "data": None},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path=r"images/(?P<image_id>[0-9a-f-]+)",
    )
    def image_detail(self, request, pk=None, image_id=None):
        item = self._get_item_or_404(request, pk)

        if item is None:
            return Response(
                {"meta": {"status_code": status.HTTP_404_NOT_FOUND, "success": False, "message": "Item not found."}, "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            image = item.images.get(pk=image_id)
        except ItemImage.DoesNotExist:
            return Response(
                {"meta": {"status_code": status.HTTP_404_NOT_FOUND, "success": False, "message": "Image not found."}, "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "DELETE":
            s3_key = image.s3_key
            image.delete()
            image_service.delete_object(s3_key)
            return Response(
                {"meta": {"status_code": status.HTTP_200_OK, "success": True, "message": "Image deleted."}, "data": None},
                status=status.HTTP_200_OK,
            )

        if request.data.get("is_primary"):
            item.images.update(is_primary=False)
            image.is_primary = True
            image.save(update_fields=["is_primary"])

        if "position" in request.data:
            image.position = request.data["position"]
            image.save(update_fields=["position"])

        out = ItemImageSerializer(image)
        return Response(
            {"meta": {"status_code": status.HTTP_200_OK, "success": True, "message": "Image updated."}, "data": out.data},
            status=status.HTTP_200_OK,
        )
