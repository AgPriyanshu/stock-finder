from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from shared.auth.admin_auth import AdminTokenAuthentication, IsAdminToken

from ..models import Shop
from ..serializers import AdminShopSerializer


class AdminShopViewSet(ViewSet):
    authentication_classes = [AdminTokenAuthentication]
    permission_classes = [IsAdminToken]

    def _get_shop(self, pk):
        try:
            return Shop.objects.select_related("user").get(pk=pk)
        except Shop.DoesNotExist as exc:
            raise NotFound("Shop not found.") from exc

    # ── GET /manage/shops/ ────────────────────────────────────────────────────

    def list(self, request):
        qs = Shop.objects.select_related("user").order_by("-created_at")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(name__icontains=q)

        verified = request.query_params.get("verified", "").lower()
        if verified == "true":
            qs = qs.filter(is_verified=True)
        elif verified == "false":
            qs = qs.filter(is_verified=False)

        return Response(AdminShopSerializer(qs, many=True).data)

    # ── POST /manage/shops/ ───────────────────────────────────────────────────

    def create(self, request):
        """
        Create a shop together with its owner account in one transaction.

        Required body fields:
          name, phone, latitude, longitude          — shop fields
          owner_username, owner_email, owner_password — new Django user

        Optional shop fields: address, city, pincode, is_verified
        """
        owner_username = request.data.get("owner_username", "").strip()
        owner_email = request.data.get("owner_email", "").strip()
        owner_password = request.data.get("owner_password", "").strip()

        if not owner_username:
            raise ValidationError({"owner_username": "This field is required."})
        if not owner_password:
            raise ValidationError({"owner_password": "This field is required."})
        if User.objects.filter(username=owner_username).exists():
            raise ValidationError({"owner_username": "A user with this username already exists."})

        # Validate the shop fields via the existing serializer.
        shop_serializer = AdminShopSerializer(data=request.data)
        shop_serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = User.objects.create_user(
                username=owner_username,
                email=owner_email,
                password=owner_password,
            )
            shop = Shop.objects.create(user=user, **shop_serializer.validated_data)

        return Response(AdminShopSerializer(shop).data, status=status.HTTP_201_CREATED)

    # ── GET /manage/shops/{id}/ ───────────────────────────────────────────────

    def retrieve(self, request, pk=None):
        shop = self._get_shop(pk)
        return Response(AdminShopSerializer(shop).data)

    # ── PATCH /manage/shops/{id}/ ─────────────────────────────────────────────

    def partial_update(self, request, pk=None):
        shop = self._get_shop(pk)
        serializer = AdminShopSerializer(shop, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        for field, value in serializer.validated_data.items():
            setattr(shop, field, value)

        shop.save()
        return Response(AdminShopSerializer(shop).data)

    # ── DELETE /manage/shops/{id}/ ────────────────────────────────────────────

    def destroy(self, request, pk=None):
        shop = self._get_shop(pk)
        shop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── PATCH /manage/shops/{id}/owner/ ──────────────────────────────────────

    @action(detail=True, methods=["patch"], url_path="owner")
    def update_owner(self, request, pk=None):
        """
        Update the shop owner's login credentials.

        Accepted fields (all optional, at least one required):
          owner_email    — new email address
          owner_password — new password (min 8 chars)
        """
        shop = self._get_shop(pk)
        owner = shop.user

        new_email = request.data.get("owner_email", "").strip()
        new_password = request.data.get("owner_password", "").strip()

        if not new_email and not new_password:
            raise ValidationError("Provide at least one of owner_email or owner_password.")

        if new_password and len(new_password) < 8:
            raise ValidationError({"owner_password": "Password must be at least 8 characters."})

        if new_email:
            owner.email = new_email
        if new_password:
            owner.set_password(new_password)

        owner.save()

        return Response({
            "id": str(shop.id),
            "owner_username": owner.username,
            "owner_email": owner.email,
        })
