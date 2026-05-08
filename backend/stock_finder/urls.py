from django.contrib import admin
from django.urls import include, path

from .views import PingView

urlpatterns = [
    path("api/auth/", include("apps.owner_manager.urls")),
    path("api/shops/", include("apps.shop_manager.urls")),
    path("api/categories/", include("apps.inventory_manager.urls.categories")),
    path("api/items/", include("apps.inventory_manager.urls.items")),
    path("api/search/", include("apps.inventory_manager.urls.search")),
    path("api/leads/", include("apps.lead_manager.urls.leads")),
    path("api/reports/", include("apps.lead_manager.urls.reports")),
    path("api/ping/", PingView.as_view(), name="ping"),
    path("admin/", admin.site.urls),
]
