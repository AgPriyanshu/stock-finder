from django.db import migrations
from django.utils import timezone

TOURS = ("portal", "add_item")


def mark_existing_owners_tours_done(apps, schema_editor):
    """Existing owners already know the portal, so only owners who sign up later see the tours."""
    User = apps.get_model("auth", "User")
    OwnerTour = apps.get_model("owner_manager", "OwnerTour")
    now = timezone.now()
    OwnerTour.objects.bulk_create(
        [
            OwnerTour(user=user, name=tour, completed_at=now)
            for user in User.objects.filter(is_staff=False)
            for tour in TOURS
        ],
        ignore_conflicts=True,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("owner_manager", "0002_ownertour"),
    ]

    operations = [
        migrations.RunPython(mark_existing_owners_tours_done, migrations.RunPython.noop),
    ]
