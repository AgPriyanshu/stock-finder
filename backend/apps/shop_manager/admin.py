from datetime import timedelta

from django import forms
from django.contrib import admin, messages
from django.contrib.gis.geos import Point
from django.utils import timezone
from django.utils.safestring import mark_safe

from .models import Shop

_MAPLIBRE_CSS = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
_MAPLIBRE_JS = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"
_MAP_STYLE = """{
  "version": 8,
  "sources": {
    "osm": {
      "type": "raster",
      "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "tileSize": 256,
      "attribution": "\\u00a9 <a href=\\"https://www.openstreetmap.org/copyright\\">OpenStreetMap</a> contributors"
    }
  },
  "layers": [{ "id": "osm", "type": "raster", "source": "osm" }]
}"""
_DEFAULT_LNG = 78.9629
_DEFAULT_LAT = 20.5937
_DEFAULT_ZOOM = 5


class LocationPickerWidget(forms.Widget):
    class Media:
        css = {"all": [_MAPLIBRE_CSS]}
        js = [_MAPLIBRE_JS]

    def render(self, name, value, attrs=None, renderer=None):
        lat, lng, zoom = _DEFAULT_LAT, _DEFAULT_LNG, _DEFAULT_ZOOM

        if value:
            if isinstance(value, str) and "," in value:
                try:
                    lat, lng = (float(p) for p in value.split(",", 1))
                    zoom = 15
                except ValueError:
                    pass
            elif hasattr(value, "y"):
                lat, lng, zoom = value.y, value.x, 15

        wid = (attrs or {}).get("id", f"id_{name}")
        html = f"""
<div id="{wid}-wrapper" style="max-width:700px;">
  <input type="hidden" name="{name}_lat" id="{wid}-lat" value="{lat if zoom == 15 else ''}">
  <input type="hidden" name="{name}_lng" id="{wid}-lng" value="{lng if zoom == 15 else ''}">
  <div style="position:relative;height:360px;border-radius:4px;overflow:hidden;border:1px solid #ccc;">
    <div id="{wid}-map" style="width:100%;height:100%;"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-100%);pointer-events:none;z-index:1;">
      <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#ef4444"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    </div>
  </div>
  <p id="{wid}-coords" style="font-size:12px;color:#666;margin:6px 0 0;">
    {f"Lat: {lat:.7f}, Lng: {lng:.7f}" if zoom == 15 else "No location selected yet."}
  </p>
</div>
<script>
(function () {{
  var WID = {wid!r};
  var ILAT = {lat};
  var ILNG = {lng};
  var ZOOM = {zoom};
  function boot() {{
    if (typeof maplibregl === "undefined") {{ setTimeout(boot, 80); return; }}
    var map = new maplibregl.Map({{ container: WID + "-map", style: {_MAP_STYLE}, center: [ILNG, ILAT], zoom: ZOOM }});
    map.on("moveend", function () {{
      var c = map.getCenter();
      document.getElementById(WID + "-lat").value = c.lat.toFixed(7);
      document.getElementById(WID + "-lng").value = c.lng.toFixed(7);
      document.getElementById(WID + "-coords").textContent = "Lat: " + c.lat.toFixed(7) + ", Lng: " + c.lng.toFixed(7);
    }});
  }}
  if (document.readyState === "loading") {{ document.addEventListener("DOMContentLoaded", boot); }} else {{ boot(); }}
}})();
</script>"""
        return mark_safe(html)

    def value_from_datadict(self, data, files, name):
        lat = data.get(f"{name}_lat", "").strip()
        lng = data.get(f"{name}_lng", "").strip()

        if lat and lng:
            return f"{lat},{lng}"

        return None


class LocationField(forms.Field):
    widget = LocationPickerWidget

    def prepare_value(self, value):
        if value and hasattr(value, "y"):
            return f"{value.y},{value.x}"
        return value

    def clean(self, value):
        if not value:
            raise forms.ValidationError("Please set a location on the map.")

        try:
            lat_str, lng_str = value.split(",", 1)
            lat, lng = float(lat_str), float(lng_str)
        except (ValueError, AttributeError):
            raise forms.ValidationError("Invalid location data.")

        return Point(lng, lat, srid=4326)


class ShopAdminForm(forms.ModelForm):
    location = LocationField(label="Location")

    class Meta:
        model = Shop
        fields = ("user", "name", "address", "location", "city", "pincode", "phone",
                  "is_verified", "rating_avg")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance and self.instance.pk and self.instance.location:
            self.initial["location"] = (
                f"{self.instance.location.y},{self.instance.location.x}"
            )


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    form = ShopAdminForm
    list_display = ("name", "owner_phone", "city", "is_verified", "created_at")
    list_filter = ("is_verified", "city")
    search_fields = ("name", "user__username", "phone")
    raw_id_fields = ("user",)
    actions = ["mark_verified", "unmark_verified", "disable_shop"]

    @admin.display(description="Owner phone")
    def owner_phone(self, obj):
        return obj.user.username if obj.user else "—"

    @admin.action(description="Mark selected shops as verified")
    def mark_verified(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f"{updated} shop(s) marked verified.", messages.SUCCESS)

    @admin.action(description="Remove verified status from selected shops")
    def unmark_verified(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f"{updated} shop(s) unverified.", messages.SUCCESS)

    @admin.action(description="Disable selected shops (hide all active items)")
    def disable_shop(self, request, queryset):
        from apps.inventory_manager.models import InventoryItem

        shop_ids = list(queryset.values_list("pk", flat=True))
        hidden = InventoryItem.objects.filter(
            shop_id__in=shop_ids, status=InventoryItem.Status.ACTIVE
        ).update(status=InventoryItem.Status.HIDDEN)
        self.message_user(
            request,
            f"Hidden {hidden} item(s) across {len(shop_ids)} shop(s).",
            messages.SUCCESS,
        )
