from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import ReferralCode


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "user", "click_count", "signup_count", "created_at")
    search_fields = ("code", "user__username")
    readonly_fields = ("code", "click_count", "signup_count", "created_at")


class ShopOwnerAdmin(UserAdmin):
    """Simplified User admin focused on shop owner accounts."""

    list_display = ("username", "first_name", "last_name", "is_active", "date_joined")
    list_filter = ("is_active",)
    search_fields = ("username", "first_name", "last_name")
    ordering = ("-date_joined",)

    # Fields shown when editing an existing user.
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Status", {"fields": ("is_active",)}),
    )

    # Fields shown on the "Add user" form.
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "first_name", "last_name", "password1", "password2"),
            },
        ),
    )

    def get_queryset(self, request):
        # Show only non-staff accounts (shop owners), not superusers.
        return super().get_queryset(request).filter(is_staff=False)

    def has_module_perms(self, app_label):
        return True


# Unregister Django's default User admin and replace with ours.
admin.site.unregister(User)
admin.site.register(User, ShopOwnerAdmin)
