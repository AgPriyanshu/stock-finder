from django.db.models import F
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import ReferralCode
from ..serializers import ReferralCodeSerializer, TrackReferralClickSerializer


class MyReferralCodeView(APIView):
    """Return (or lazily create) the authenticated owner's referral code."""

    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ref, _ = ReferralCode.objects.get_or_create(user=request.user)
        return Response(ReferralCodeSerializer(ref).data)


class TrackReferralClickView(APIView):
    """Public endpoint called by the frontend when someone lands via a referral link."""

    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_scope = "sf_referral_track"

    def post(self, request):
        serializer = TrackReferralClickSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"].strip().upper()

        ReferralCode.objects.filter(code=code).update(click_count=F("click_count") + 1)

        return Response({"tracked": True})
