from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import Category
from ..serializers import CategoryCreateSerializer, CategorySerializer


class CategoryViewSet(ViewSet):
    authentication_classes = []
    permission_classes = []

    def get_authenticators(self):
        if self.request.method == "POST":
            return [JWTBearerAuthentication()]
        return []

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

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

    def create(self, request):
        serializer = CategoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category, created = serializer.get_or_create()
        http_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK

        return Response(
            {
                "meta": {
                    "status_code": http_status,
                    "success": True,
                    "message": "Category created." if created else "Category already exists.",
                },
                "data": CategorySerializer(category).data,
            },
            status=http_status,
        )
