from django.urls import path

from .views import (
    ChangePasswordView,
    LoginView,
    MyReferralCodeView,
    OTPRequestView,
    OTPVerifyView,
    OwnerProfileView,
    RefreshTokenView,
    RegisterView,
    ShopSignupRequestView,
    TrackReferralClickView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="sf-login"),
    path("register/", RegisterView.as_view(), name="sf-register"),
    path("otp/request/", OTPRequestView.as_view(), name="sf-otp-request"),
    path("otp/verify/", OTPVerifyView.as_view(), name="sf-otp-verify"),
    path("refresh/", RefreshTokenView.as_view(), name="sf-refresh"),
    path("change-password/", ChangePasswordView.as_view(), name="sf-change-password"),
    path("me/", OwnerProfileView.as_view(), name="sf-owner-profile"),
    path("signup-request/", ShopSignupRequestView.as_view(), name="sf-signup-request"),
    path("referral/", MyReferralCodeView.as_view(), name="sf-referral-code"),
    path("referral/track/", TrackReferralClickView.as_view(), name="sf-referral-track"),
]
