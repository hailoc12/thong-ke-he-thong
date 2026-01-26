# Generated migration: Remove choices constraint from cicd_tool to allow custom text input

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0021_convert_text_fields_to_textfield'),
    ]

    operations = [
        # Remove choices constraint and increase max_length to allow custom text input
        # via SelectWithOther component (e.g., "Không có", "Bamboo", "TeamCity", etc.)
        migrations.AlterField(
            model_name='systemarchitecture',
            name='cicd_tool',
            field=models.CharField(
                blank=True,
                max_length=100,  # Increased from 50 to allow longer custom text
                verbose_name='CI/CD Tool'
            ),
        ),
    ]
