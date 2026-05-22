import os
import re

from django.contrib.gis.geos import Point
from rest_framework import serializers

from .models import Shop, ShopImage, ShopReview

PHONE_REGEX = re.compile(r"^\+91[6-9]\d{9}$")


class ShopImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ShopImage
        fields = ("id", "position", "is_primary", "width", "height", "url", "created_at")
        read_only_fields = fields

    def _build(self, key):
        base = os.environ.get("S3_PUBLIC_ENDPOINT", "").rstrip("/")
        bucket = os.environ.get("S3_BUCKET", "")

        if not (base and bucket and key):
            return None

        return f"{base}/{bucket}/{key}"

    def get_url(self, obj):
        return self._build(obj.s3_key)


class ShopReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopReview
        fields = ("id", "rating", "comment", "created_at")
        read_only_fields = fields


class CreateShopReviewSerializer(serializers.Serializer):
    lead_id = serializers.UUIDField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=500)


class PresignShopImageRequestSerializer(serializers.Serializer):
    content_type = serializers.ChoiceField(
        choices=["image/jpeg", "image/png", "image/webp"]
    )


class ConfirmShopImageRequestSerializer(serializers.Serializer):
    key = serializers.CharField(max_length=255)
    width = serializers.IntegerField(min_value=1)
    height = serializers.IntegerField(min_value=1)
    is_primary = serializers.BooleanField(required=False, default=False)


def _validate_phone(value: str) -> str:
    value = (value or "").strip()

    if not PHONE_REGEX.match(value):
        raise serializers.ValidationError(
            "Phone must be a valid Indian mobile, e.g. +919876543210."
        )

    return value


class ShopSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True)
    longitude = serializers.FloatField(write_only=True)
    lat = serializers.SerializerMethodField()
    lng = serializers.SerializerMethodField()
    images = ShopImageSerializer(many=True, read_only=True)

    class Meta:
        model = Shop
        fields = (
            "id",
            "name",
            "address",
            "city",
            "pincode",
            "phone",
            "is_verified",
            "rating_avg",
            "lat",
            "lng",
            "latitude",
            "longitude",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "is_verified", "rating_avg", "images", "created_at", "updated_at")

    def get_lat(self, obj):
        return obj.location.y if obj.location else None

    def get_lng(self, obj):
        return obj.location.x if obj.location else None

    def validate(self, attrs):
        if "latitude" in attrs and "longitude" in attrs:
            attrs["location"] = Point(
                attrs.pop("longitude"), attrs.pop("latitude"), srid=4326
            )
        elif "latitude" in attrs or "longitude" in attrs:
            raise serializers.ValidationError(
                "Both latitude and longitude are required."
            )

        return attrs

    def to_internal_value(self, data):
        if data.get("phone"):
            _validate_phone(data["phone"])
        return super().to_internal_value(data)


class AdminShopSerializer(ShopSerializer):
    """ShopSerializer variant for admin use — is_verified is writable."""

    owner_username = serializers.CharField(source="user.username", read_only=True)

    class Meta(ShopSerializer.Meta):
        fields = ShopSerializer.Meta.fields + ("owner_username",)
        read_only_fields = ("id", "rating_avg", "created_at", "updated_at")


class ShopWithDistanceSerializer(ShopSerializer):
    distance_m = serializers.SerializerMethodField()

    class Meta(ShopSerializer.Meta):
        fields = ShopSerializer.Meta.fields + ("distance_m",)

    def get_distance_m(self, obj):
        d = getattr(obj, "distance", None)
        return round(d.m, 1) if d else None
