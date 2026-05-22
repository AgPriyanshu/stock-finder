from django.urls import path
from rest_framework.routers import DefaultRouter

from .views.reviews import ShopReviewsView
from .views.shops import ShopViewSet

router = DefaultRouter()
router.register(r"", ShopViewSet, basename="sf-shops")

urlpatterns = router.urls + [
    path("<uuid:pk>/reviews/", ShopReviewsView.as_view(), name="sf-shop-reviews"),
]
