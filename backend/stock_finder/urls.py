from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.owner_manager.views.events import OwnerEventsView
from apps.shop_manager.views.admin_shops import AdminShopViewSet

from .views import PingView

_admin_router = DefaultRouter()
_admin_router.register(r"shops", AdminShopViewSet, basename="admin-shops")

urlpatterns = [
    path("auth/", include("apps.owner_manager.urls")),
    path("shops/", include("apps.shop_manager.urls")),
    path("categories/", include("apps.inventory_manager.urls.categories")),
    path("items/", include("apps.inventory_manager.urls.items")),
    path("search/", include("apps.inventory_manager.urls.search")),
    path("leads/", include("apps.lead_manager.urls.leads")),
    path("reports/", include("apps.lead_manager.urls.reports")),
    path("analytics/", include("apps.lead_manager.urls.analytics")),
    path("events/", OwnerEventsView.as_view(), name="sf-events"),
    path("manage/", include(_admin_router.urls)),
    path("ping/", PingView.as_view(), name="ping"),
    path("admin/", admin.site.urls),
]
