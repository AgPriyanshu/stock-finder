from django.contrib.auth.models import User
from django.contrib.gis.db import models as gis_models
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models

from shared.models.base_models import BaseModel, BaseModelWithoutUser


class Category(BaseModelWithoutUser):
    slug = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=120)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="children",
    )

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class InventoryItem(BaseModel):
    class Condition(models.TextChoices):
        NEW = "new", "New"
        OPEN_BOX = "open_box", "Open box"
        USED = "used", "Used"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SOLD = "sold", "Sold"
        HIDDEN = "hidden", "Hidden"

    shop = models.ForeignKey(
        "shop_manager.Shop", on_delete=models.CASCADE, related_name="items"
    )
    category = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="items",
    )
    name = models.CharField(max_length=200)
    name_normalized = models.CharField(max_length=200)
    sku = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    condition = models.CharField(
        max_length=10, choices=Condition.choices, default=Condition.NEW
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    stale_at = models.DateTimeField()
    search_vector = SearchVectorField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            GinIndex(fields=["search_vector"], name="sf_item_search_vec_gin"),
            GinIndex(
                fields=["name_normalized"],
                opclasses=["gin_trgm_ops"],
                name="sf_item_name_trgm_gin",
            ),
            models.Index(fields=["shop", "status"], name="sf_item_shop_status_idx"),
            models.Index(
                fields=["category", "status", "stale_at"],
                name="sf_item_cat_status_stale",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.shop_id})"


class ItemImage(BaseModelWithoutUser):
    item = models.ForeignKey(
        InventoryItem, on_delete=models.CASCADE, related_name="images"
    )
    s3_key = models.CharField(max_length=255)
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    position = models.PositiveSmallIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    variants_ready = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["item", "position"], name="sf_image_unique_position"
            ),
        ]
        ordering = ["position"]


class CatalogItem(BaseModelWithoutUser):
    name = models.CharField(max_length=200)
    name_normalized = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="catalog_items",
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["name_normalized", "category"],
                name="sf_catalog_unique_name_category",
            )
        ]

    def __str__(self):
        return self.name


class SearchLog(BaseModelWithoutUser):
    query = models.CharField(max_length=200)
    location = gis_models.PointField(
        geography=True, srid=4326, null=True, blank=True
    )
    result_count = models.PositiveIntegerField(default=0)
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sf_search_logs",
    )

    class Meta:
        ordering = ["-created_at"]
