import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shop_manager", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ShopImage",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("s3_key", models.CharField(max_length=255)),
                ("width", models.PositiveIntegerField()),
                ("height", models.PositiveIntegerField()),
                ("position", models.PositiveSmallIntegerField(default=0)),
                ("is_primary", models.BooleanField(default=False)),
                (
                    "shop",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="shop_manager.shop",
                    ),
                ),
            ],
            options={
                "ordering": ["position"],
            },
        ),
    ]
