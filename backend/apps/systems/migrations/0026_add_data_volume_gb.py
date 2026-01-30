# Generated manually for data_volume_gb field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0025_add_is_go_live_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='system',
            name='data_volume_gb',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Numeric value in GB for calculations',
                max_digits=12,
                null=True,
                verbose_name='Data Volume (GB)'
            ),
        ),
    ]
