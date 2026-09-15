from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import OwnerTour
from ..serializers import CompleteOwnerTourSerializer


def _completed_tours(user):
    return list(OwnerTour.objects.filter(user=user).order_by("completed_at").values_list("name", flat=True))


class OwnerToursView(APIView):
    """In-app tours the authenticated owner has finished, skipped or closed."""

    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"completed": _completed_tours(request.user)}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CompleteOwnerTourSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        OwnerTour.objects.get_or_create(user=request.user, name=serializer.validated_data["name"])
        return Response({"completed": _completed_tours(request.user)}, status=status.HTTP_200_OK)
