from rest_framework.routers import DefaultRouter

from ..views.items import InventoryItemViewSet

router = DefaultRouter()
router.register(r"", InventoryItemViewSet, basename="item")
urlpatterns = router.urls
# Note: delete_image extra action uses url_path=r"images/(?P<image_id>[^/.]+)" defined in the viewset @action.
