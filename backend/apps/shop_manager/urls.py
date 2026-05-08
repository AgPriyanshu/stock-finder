from rest_framework.routers import DefaultRouter

from .views.shops import ShopViewSet

router = DefaultRouter()
router.register(r"", ShopViewSet, basename="sf-shops")

urlpatterns = router.urls
