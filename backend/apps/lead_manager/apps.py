from django.apps import AppConfig


class LeadManagerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.lead_manager"
    label = "lead_manager"

    def ready(self):
        import apps.lead_manager.signals  # noqa: F401
