import jwt
from django.apps import apps
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    OwnerProfileSerializer,
    RefreshTokenSerializer,
    ShopSignupRequestSerializer,
)
from ..services.jwt_tokens import decode_token, issue_token
from ..services.otp import request_otp, verify_otp


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_scope = "sf_login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(request, username=username, password=password)

        if user is None:
            raise AuthenticationFailed("Invalid credentials.")

        Shop = apps.get_model("shop_manager", "Shop")
        has_shop = Shop.objects.filter(user=user).exists()

        token = issue_token(user)

        return Response(
            {
                "token": token["token"],
                "expires_at": token["expires_at"],
                "user": {"id": user.id, "username": user.username},
                "has_shop": has_shop,
            }
        )


class OTPRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_scope = "sf_otp_request"

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]

        if not User.objects.filter(username=phone).exists():
            raise PermissionDenied(
                "This number is not registered. Please contact the administrator."
            )

        request_otp(phone, ip=_client_ip(request))

        return Response({"sent": True})


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_scope = "sf_otp_verify"

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        otp = serializer.validated_data["otp"]

        verify_otp(phone, otp)

        try:
            user = User.objects.get(username=phone)
        except User.DoesNotExist as exc:
            raise PermissionDenied(
                "This number is not registered. Please contact the administrator."
            ) from exc

        Shop = apps.get_model("shop_manager", "Shop")
        has_shop = Shop.objects.filter(user=user).exists()

        token = issue_token(user)

        return Response(
            {
                "token": token["token"],
                "expires_at": token["expires_at"],
                "user": {"id": user.id, "phone": user.username},
                "has_shop": has_shop,
            }
        )


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_scope = "sf_token_refresh"

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payload = decode_token(serializer.validated_data["token"])
        except jwt.ExpiredSignatureError as exc:
            raise AuthenticationFailed("Token expired.") from exc
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed("Invalid token.") from exc

        try:
            user = User.objects.get(pk=int(payload["sub"]))
        except (User.DoesNotExist, KeyError, ValueError) as exc:
            raise AuthenticationFailed("User not found.") from exc

        new_token = issue_token(user)
        return Response(
            {"token": new_token["token"], "expires_at": new_token["expires_at"]},
            status=status.HTTP_200_OK,
        )


class OwnerProfileView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        )

    def patch(self, request):
        serializer = OwnerProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.first_name = serializer.validated_data["first_name"]
        user.last_name = serializer.validated_data["last_name"]
        user.save(update_fields=["first_name", "last_name"])
        return Response({"first_name": user.first_name, "last_name": user.last_name})


class ChangePasswordView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        current_password = serializer.validated_data["current_password"]
        new_password = serializer.validated_data["new_password"]

        user = authenticate(request, username=request.user.username, password=current_password)

        if user is None:
            raise ValidationError({"current_password": "Current password is incorrect."})

        user.set_password(new_password)
        user.save()

        return Response({"changed": True}, status=status.HTTP_200_OK)


class ShopSignupRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request):
        serializer = ShopSignupRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if settings.NOTIFY_EMAIL:
            send_mail(
                subject="New shop signup request",
                message=(
                    f"Name: {data['name']}\n"
                    f"Phone: {data['phone']}\n"
                    f"Email: {data['email']}\n"
                    f"Shop name: {data['shop_name']}\n"
                    f"City: {data.get('city', '')}\n"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.NOTIFY_EMAIL],
                fail_silently=True,
            )

        return Response({"received": True}, status=status.HTTP_200_OK)
