from django.contrib import admin

from .models import Category, InventoryItem, ItemImage


class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 0
    readonly_fields = ["variants_ready", "s3_key", "width", "height", "position", "created_at"]
    fields = ["position", "is_primary", "s3_key", "width", "height", "variants_ready", "created_at"]


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ["name", "shop", "status", "price", "created_at"]
    list_filter = ["status", "category"]
    search_fields = ["name"]
    readonly_fields = ["name_normalized", "search_vector", "stale_at"]
    inlines = [ItemImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name", "slug"]


@admin.register(ItemImage)
class ItemImageAdmin(admin.ModelAdmin):
    list_display = ["item", "position", "is_primary", "variants_ready", "created_at"]
    list_filter = ["is_primary", "variants_ready"]
    readonly_fields = ["variants_ready", "created_at"]
