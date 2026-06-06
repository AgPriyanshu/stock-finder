from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory_manager", "0002_catalogitem"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="image_key",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
