from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ..models import Category
from ..serializers import CategorySerializer


class CategoryViewSet(ViewSet):
    authentication_classes = []
    permission_classes = []

    def list(self, request):
        categories = Category.objects.all().order_by("name")
        serializer = CategorySerializer(categories, many=True)

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Categories retrieved successfully.",
                },
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
