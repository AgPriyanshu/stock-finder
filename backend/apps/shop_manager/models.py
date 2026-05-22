from django.contrib.gis.db import models as gis_models
from django.contrib.postgres.indexes import GistIndex
from django.db import models

from shared.models.base_models import BaseModel, BaseModelWithoutUser


class Shop(BaseModel):
    name = models.CharField(max_length=120)
    address = models.TextField(blank=True)
    location = gis_models.PointField(geography=True, srid=4326, spatial_index=False)
    city = models.CharField(max_length=80, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20)
    is_verified = models.BooleanField(default=False)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user"], name="sf_one_shop_per_user"),
        ]
        indexes = [
            GistIndex(fields=["location"], name="sf_shop_location_gist"),
        ]

    def __str__(self):
        return self.name


class ShopReview(BaseModelWithoutUser):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="reviews")
    lead = models.OneToOneField(
        "lead_manager.Lead", on_delete=models.CASCADE, related_name="review"
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]


class ShopImage(BaseModelWithoutUser):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="images")
    s3_key = models.CharField(max_length=255)
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    position = models.PositiveSmallIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["position"]
