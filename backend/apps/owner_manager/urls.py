from django.urls import path

from .views import OTPRequestView, OTPVerifyView, RefreshTokenView

urlpatterns = [
    path("otp/request/", OTPRequestView.as_view(), name="sf-otp-request"),
    path("otp/verify/", OTPVerifyView.as_view(), name="sf-otp-verify"),
    path("refresh/", RefreshTokenView.as_view(), name="sf-refresh"),
]
