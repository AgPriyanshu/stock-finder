from django.urls import path

from .views import (
    ChangePasswordView,
    LoginView,
    MyReferralCodeView,
    OTPRequestView,
    OTPVerifyView,
    OwnerProfileView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshTokenView,
    RegisterView,
    ShopSignupRequestView,
    SupportRequestView,
    TrackReferralClickView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="sf-login"),
    path("register/", RegisterView.as_view(), name="sf-register"),
    path("otp/request/", OTPRequestView.as_view(), name="sf-otp-request"),
    path("otp/verify/", OTPVerifyView.as_view(), name="sf-otp-verify"),
    path("refresh/", RefreshTokenView.as_view(), name="sf-refresh"),
    path("change-password/", ChangePasswordView.as_view(), name="sf-change-password"),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="sf-password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="sf-password-reset-confirm"),
    path("me/", OwnerProfileView.as_view(), name="sf-owner-profile"),
    path("signup-request/", ShopSignupRequestView.as_view(), name="sf-signup-request"),
    path("support/", SupportRequestView.as_view(), name="sf-support-request"),
    path("referral/", MyReferralCodeView.as_view(), name="sf-referral-code"),
    path("referral/track/", TrackReferralClickView.as_view(), name="sf-referral-track"),
]
