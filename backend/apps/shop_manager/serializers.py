import re

from django.contrib.gis.geos import Point
from rest_framework import serializers

from .models import Shop

PHONE_REGEX = re.compile(r"^\+91[6-9]\d{9}$")


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
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "is_verified", "rating_avg", "created_at", "updated_at")

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


class ShopWithDistanceSerializer(ShopSerializer):
    distance_m = serializers.SerializerMethodField()

    class Meta(ShopSerializer.Meta):
        fields = ShopSerializer.Meta.fields + ("distance_m",)

    def get_distance_m(self, obj):
        d = getattr(obj, "distance", None)
        return round(d.m, 1) if d else None
