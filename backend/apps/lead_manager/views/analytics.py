from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth.jwt_authentication import JWTBearerAuthentication

from ..models import Lead


class AnalyticsView(APIView):
    authentication_classes = [JWTBearerAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.inventory_manager.models import InventoryItem
        from apps.shop_manager.models import Shop

        shop = Shop.objects.filter(user=request.user).first()

        if not shop:
            return Response(
                {"meta": {"status_code": 404, "success": False, "message": "No shop found."}, "data": None},
                status=404,
            )

        now = timezone.now()
        since_30 = now - timedelta(days=30)

        items_qs = InventoryItem.objects.filter(shop=shop)
        status_counts = {
            row["status"]: row["count"]
            for row in items_qs.values("status").annotate(count=Count("id"))
        }

        stale_soon = items_qs.filter(
            status=InventoryItem.Status.ACTIVE,
            stale_at__lte=now + timedelta(days=7),
            stale_at__gt=now,
        ).count()

        leads_qs = Lead.objects.filter(shop=shop)
        leads_total = leads_qs.count()
        leads_30d = leads_qs.filter(created_at__gte=since_30).count()
        leads_new = leads_qs.filter(contacted_at__isnull=True).count()

        trend = list(
            leads_qs.filter(created_at__gte=since_30)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
            .values_list("date", "count")
        )

        top_items = list(
            leads_qs.values("item__id", "item__name")
            .annotate(lead_count=Count("id"))
            .order_by("-lead_count")[:5]
        )

        return Response({
            "meta": {"status_code": 200, "success": True, "message": ""},
            "data": {
                "items": {
                    "active": status_counts.get("active", 0),
                    "sold": status_counts.get("sold", 0),
                    "hidden": status_counts.get("hidden", 0),
                    "total": sum(status_counts.values()),
                    "stale_soon": stale_soon,
                },
                "leads": {
                    "total": leads_total,
                    "last_30_days": leads_30d,
                    "new": leads_new,
                },
                "leads_trend": [
                    {"date": str(date), "count": count} for date, count in trend
                ],
                "top_items": [
                    {
                        "id": str(row["item__id"]),
                        "name": row["item__name"],
                        "lead_count": row["lead_count"],
                    }
                    for row in top_items
                    if row["item__id"]
                ],
            },
        })
