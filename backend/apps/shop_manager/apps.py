from django.apps import AppConfig


class ShopManagerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.shop_manager"
    label = "shop_manager"

    def ready(self):
        import apps.shop_manager.signals  # noqa: F401
