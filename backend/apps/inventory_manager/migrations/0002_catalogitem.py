import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory_manager", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CatalogItem",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=200)),
                ("name_normalized", models.CharField(max_length=200)),
                (
                    "category",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="catalog_items",
                        to="inventory_manager.category",
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.AddConstraint(
            model_name="catalogitem",
            constraint=models.UniqueConstraint(
                fields=["name_normalized", "category"],
                name="sf_catalog_unique_name_category",
            ),
        ),
    ]
