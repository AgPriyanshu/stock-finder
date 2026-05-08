from django.apps import AppConfig


class InventoryManagerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.inventory_manager"
    label = "inventory_manager"

    def ready(self):
        import apps.inventory_manager.signals  # noqa: F401
