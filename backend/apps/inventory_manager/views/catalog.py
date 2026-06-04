from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ..models import CatalogItem
from ..serializers import CatalogItemSerializer


class CatalogViewSet(ViewSet):
    authentication_classes = []
    permission_classes = []

    def list(self, request):
        q = request.query_params.get("q", "").strip()
        category_id = request.query_params.get("category", "").strip()

        qs = CatalogItem.objects.select_related("category").order_by("name")

        if category_id:
            qs = qs.filter(category_id=category_id)

        if q:
            qs = qs.filter(
                Q(name__icontains=q) | Q(name_normalized__trigram_similar=q.lower())
            )

        qs = qs[:20]

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Catalog items retrieved.",
                },
                "data": CatalogItemSerializer(qs, many=True).data,
            },
            status=status.HTTP_200_OK,
        )
