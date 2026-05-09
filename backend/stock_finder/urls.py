from django.contrib import admin
from django.urls import include, path

from .views import PingView

urlpatterns = [
    path("auth/", include("apps.owner_manager.urls")),
    path("shops/", include("apps.shop_manager.urls")),
    path("categories/", include("apps.inventory_manager.urls.categories")),
    path("items/", include("apps.inventory_manager.urls.items")),
    path("search/", include("apps.inventory_manager.urls.search")),
    path("leads/", include("apps.lead_manager.urls.leads")),
    path("reports/", include("apps.lead_manager.urls.reports")),
    path("ping/", PingView.as_view(), name="ping"),
    path("admin/", admin.site.urls),
]
