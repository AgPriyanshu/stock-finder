import re

from rest_framework import serializers

PHONE_REGEX = re.compile(r"^\+91[6-9]\d{9}$")


def validate_phone(value: str) -> str:
    value = (value or "").strip()
    if not PHONE_REGEX.match(value):
        raise serializers.ValidationError(
            "Phone must be a valid Indian mobile, e.g. +919876543210."
        )
    return value


class OTPRequestSerializer(serializers.Serializer):
    phone = serializers.CharField()

    def validate_phone(self, value):
        return validate_phone(value)


class OTPVerifySerializer(serializers.Serializer):
    phone = serializers.CharField()
    otp = serializers.RegexField(regex=r"^\d{6}$")

    def validate_phone(self, value):
        return validate_phone(value)


class RefreshTokenSerializer(serializers.Serializer):
    token = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class OwnerProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, default="")

    def validate_first_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("First name is required.")
        return value

    def validate_last_name(self, value):
        return value.strip()


class ShopSignupRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(max_length=254)
    shop_name = serializers.CharField(max_length=200)
    city = serializers.CharField(max_length=100, allow_blank=True, default="")


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, default="")
    referral_code = serializers.CharField(max_length=16, required=False, allow_blank=True, default="")

    def validate_first_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("First name is required.")
        return value

    def validate_last_name(self, value):
        return value.strip()


class ReferralCodeSerializer(serializers.Serializer):
    code = serializers.CharField()
    click_count = serializers.IntegerField()
    signup_count = serializers.IntegerField()


class TrackReferralClickSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=16)
