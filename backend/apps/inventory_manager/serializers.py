import os

from django.utils.text import slugify
from rest_framework import serializers

from .models import CatalogItem, Category, InventoryItem, ItemImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "slug", "name", "parent")


class CatalogItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.SlugField(source="category.slug", read_only=True)

    class Meta:
        model = CatalogItem
        fields = ("id", "name", "category", "category_name", "category_slug")


class CategoryCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120, trim_whitespace=True)

    def validate_name(self, value):
        slug = slugify(value)

        if not slug:
            raise serializers.ValidationError("Category name must produce a valid slug.")

        return value

    def get_or_create(self):
        name = self.validated_data["name"]
        slug = slugify(name)
        category, created = Category.objects.get_or_create(
            slug=slug,
            defaults={"name": name},
        )
        return category, created


class ItemImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    thumb_url = serializers.SerializerMethodField()
    card_url = serializers.SerializerMethodField()

    class Meta:
        model = ItemImage
        fields = (
            "id",
            "position",
            "is_primary",
            "variants_ready",
            "width",
            "height",
            "url",
            "thumb_url",
            "card_url",
            "created_at",
        )
        read_only_fields = fields

    def _public_base(self):
        return os.environ.get("S3_PUBLIC_ENDPOINT", "").rstrip("/")

    def _bucket(self):
        return os.environ.get("S3_BUCKET", "")

    def _build(self, key):
        base = self._public_base()
        bucket = self._bucket()

        if not (base and bucket and key):
            return None

        return f"{base}/{bucket}/{key}"

    def _variant_key(self, obj, size):
        prefix = obj.s3_key.rsplit("/originals/", 1)[0]
        return f"{prefix}/variants/{size}.webp"

    def get_url(self, obj):
        return self._build(obj.s3_key)

    def get_thumb_url(self, obj):
        return self._build(self._variant_key(obj, "thumb_200")) if obj.variants_ready else None

    def get_card_url(self, obj):
        return self._build(self._variant_key(obj, "card_600")) if obj.variants_ready else None


class InventoryItemSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)
    shop_name = serializers.CharField(source="shop.name", read_only=True)

    class Meta:
        model = InventoryItem
        fields = (
            "id",
            "shop",
            "shop_name",
            "category",
            "name",
            "sku",
            "description",
            "quantity",
            "price",
            "condition",
            "status",
            "stale_at",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "shop", "shop_name", "stale_at", "images", "created_at", "updated_at")


class SearchItemSerializer(InventoryItemSerializer):
    distance_m = serializers.SerializerMethodField()
    shop_lat = serializers.SerializerMethodField()
    shop_lng = serializers.SerializerMethodField()
    shop_phone = serializers.CharField(source="shop.phone", read_only=True)
    category_slug = serializers.SlugRelatedField(
        source="category", slug_field="slug", read_only=True
    )

    class Meta(InventoryItemSerializer.Meta):
        fields = InventoryItemSerializer.Meta.fields + (
            "distance_m",
            "shop_lat",
            "shop_lng",
            "shop_phone",
            "category_slug",
        )

    def get_distance_m(self, obj):
        d = getattr(obj, "distance", None)
        return round(d.m, 1) if d is not None else None

    def get_shop_lat(self, obj):
        loc = obj.shop.location if obj.shop else None
        return loc.y if loc else None

    def get_shop_lng(self, obj):
        loc = obj.shop.location if obj.shop else None
        return loc.x if loc else None


class PresignImageRequestSerializer(serializers.Serializer):
    content_type = serializers.RegexField(regex=r"^image/(jpeg|png|webp)$")


class ConfirmImageRequestSerializer(serializers.Serializer):
    key = serializers.CharField()
    width = serializers.IntegerField(min_value=1)
    height = serializers.IntegerField(min_value=1)
    is_primary = serializers.BooleanField(default=False)
