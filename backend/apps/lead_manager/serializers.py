import re

from rest_framework import serializers

from .models import Lead, Report

PHONE_REGEX = re.compile(r"^\+91[6-9]\d{9}$")


def _validate_phone(value: str) -> str:
    value = (value or "").strip()

    if not PHONE_REGEX.match(value):
        raise serializers.ValidationError(
            "Phone must be a valid Indian mobile, e.g. +919876543210."
        )

    return value


class CreateLeadSerializer(serializers.Serializer):
    shop_id = serializers.UUIDField()
    item_id = serializers.UUIDField(required=False, allow_null=True)
    message = serializers.CharField(min_length=5, max_length=1000)
    phone = serializers.CharField(required=False, allow_blank=True)
    buyer_name = serializers.CharField(required=False, allow_blank=True, max_length=120)

    def validate_phone(self, value):
        return _validate_phone(value) if value else value


class LeadSerializer(serializers.ModelSerializer):
    buyer_name = serializers.SerializerMethodField()
    buyer_phone = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id",
            "buyer_name",
            "buyer_phone",
            "shop_id",
            "item_id",
            "item_name",
            "message",
            "contacted_at",
            "created_at",
        ]
        read_only_fields = fields

    def get_buyer_name(self, obj):
        return obj.user.first_name or obj.user.username if obj.user_id else None

    def get_buyer_phone(self, obj):
        if not obj.user_id:
            return None

        username = obj.user.username

        if username.startswith("sf-buyer-"):
            return username[len("sf-buyer-"):]

        return None

    def get_item_name(self, obj):
        return obj.item.name if obj.item_id else None


class CreateReportSerializer(serializers.Serializer):
    shop_id = serializers.UUIDField(required=False, allow_null=True)
    item_id = serializers.UUIDField(required=False, allow_null=True)
    reason = serializers.CharField(min_length=5, max_length=1000)


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "item_id", "shop_id", "reason", "details", "created_at"]
        read_only_fields = ["id", "created_at"]
