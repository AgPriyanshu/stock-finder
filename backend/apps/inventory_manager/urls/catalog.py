from rest_framework.routers import DefaultRouter

from ..views.catalog import CatalogViewSet

router = DefaultRouter()
router.register(r"", CatalogViewSet, basename="catalog")
urlpatterns = router.urls
