import os

from django import forms
from django.contrib import admin
from django.utils.html import format_html

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


class CategoryAdminForm(forms.ModelForm):
    image_upload = forms.ImageField(required=False, label="Upload new image")

    class Meta:
        model = Category
        fields = "__all__"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    form = CategoryAdminForm
    list_display = ["name", "slug", "parent", "has_image"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name", "slug"]
    readonly_fields = ["current_image"]

    def has_image(self, obj):
        return bool(obj.image_key)

    has_image.boolean = True
    has_image.short_description = "Image"

    def current_image(self, obj):
        if not obj.image_key:
            return "No image set."

        base = os.environ.get("S3_PUBLIC_ENDPOINT", "").rstrip("/")
        bucket = os.environ.get("S3_BUCKET", "")

        if not (base and bucket):
            return format_html("<code>{}</code>", obj.image_key)

        url = f"{base}/{bucket}/{obj.image_key}"
        return format_html(
            '<img src="{}" style="max-height:120px;border-radius:4px;" /><br/><small>{}</small>',
            url,
            obj.image_key,
        )

    current_image.short_description = "Current image"

    def save_model(self, request, obj, form, change):
        image_file = form.cleaned_data.get("image_upload")

        if image_file:
            from .services.category_images import upload_category_image
            from .services.images import delete_object

            old_key = obj.image_key
            content_type = image_file.content_type or "image/jpeg"
            obj.image_key = upload_category_image(obj.id, image_file, content_type)
            super().save_model(request, obj, form, change)

            if old_key:
                delete_object(old_key)
        else:
            super().save_model(request, obj, form, change)


@admin.register(ItemImage)
class ItemImageAdmin(admin.ModelAdmin):
    list_display = ["item", "position", "is_primary", "variants_ready", "created_at"]
    list_filter = ["is_primary", "variants_ready"]
    readonly_fields = ["variants_ready", "created_at"]
