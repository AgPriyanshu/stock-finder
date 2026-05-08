from django.urls import path

from .views import LoginView, OTPRequestView, OTPVerifyView, RefreshTokenView

urlpatterns = [
    path("login/", LoginView.as_view(), name="sf-login"),
    path("otp/request/", OTPRequestView.as_view(), name="sf-otp-request"),
    path("otp/verify/", OTPVerifyView.as_view(), name="sf-otp-verify"),
    path("refresh/", RefreshTokenView.as_view(), name="sf-refresh"),
]
