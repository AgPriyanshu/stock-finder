from django.contrib import admin

from .models import Lead, Report


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["user", "shop_id", "item_id", "contacted_at", "created_at"]
    list_filter = ["contacted_at"]
    raw_id_fields = ["user"]
    search_fields = ["user__username", "message"]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["reason_excerpt", "item_id", "shop_id", "user", "created_at"]
    raw_id_fields = ["user"]
    search_fields = ["reason"]

    @admin.display(description="Reason")
    def reason_excerpt(self, obj):
        return (obj.reason or "")[:60]
