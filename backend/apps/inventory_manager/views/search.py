import logging

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ..serializers import SearchItemSerializer
from ..services.search import build_search_qs, log_search

logger = logging.getLogger(__name__)


class SearchViewSet(ViewSet):
    authentication_classes = []
    permission_classes = []

    @action(detail=False, methods=["get"], url_path="items")
    def items(self, request):
        q = request.query_params.get("q", "")
        category_slug = request.query_params.get("category_slug", "")
        cursor = request.query_params.get("cursor", "")
        sort = request.query_params.get("sort", "distance")

        lat = None
        lng = None
        point = None

        raw_lat = request.query_params.get("lat")
        raw_lng = request.query_params.get("lng")

        if raw_lat and raw_lng:
            try:
                lat = float(raw_lat)
                lng = float(raw_lng)
                # Build the Point only when both coordinates are valid.
                from django.contrib.gis.geos import Point
                point = Point(lng, lat, srid=4326)
            except (ValueError, TypeError):
                return Response(
                    {
                        "meta": {
                            "status_code": status.HTTP_400_BAD_REQUEST,
                            "success": False,
                            "message": "lat and lng must be valid numbers.",
                        },
                        "data": None,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        radius_km = 10.0
        raw_radius = request.query_params.get("radius_km")

        if raw_radius:
            try:
                radius_km = float(raw_radius)
            except (ValueError, TypeError):
                pass

        min_price = None
        raw_min = request.query_params.get("min_price")

        if raw_min:
            try:
                min_price = float(raw_min)
            except (ValueError, TypeError):
                pass

        max_price = None
        raw_max = request.query_params.get("max_price")

        if raw_max:
            try:
                max_price = float(raw_max)
            except (ValueError, TypeError):
                pass

        limit = 20
        raw_limit = request.query_params.get("limit")

        if raw_limit:
            try:
                limit = int(raw_limit)
            except (ValueError, TypeError):
                pass

        results, next_cursor = build_search_qs(
            q=q,
            lat=lat,
            lng=lng,
            radius_km=radius_km,
            category_slug=category_slug,
            min_price=min_price,
            max_price=max_price,
            sort=sort,
            cursor=cursor,
            limit=limit,
        )

        serializer = SearchItemSerializer(
            results,
            many=True,
            context={"point": point, "request": request},
        )

        user = request.user if request.user and request.user.is_authenticated else None

        log_search(
            query=q,
            result_count=len(results),
            lat=lat,
            lng=lng,
            user=user,
        )

        return Response(
            {
                "meta": {
                    "status_code": status.HTTP_200_OK,
                    "success": True,
                    "message": "Search completed successfully.",
                },
                "data": {
                    "items": serializer.data,
                    "next_cursor": next_cursor,
                },
            },
            status=status.HTTP_200_OK,
        )
