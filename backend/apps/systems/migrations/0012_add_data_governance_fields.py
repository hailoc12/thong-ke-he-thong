# Generated migration for Phase 3: Add Data Governance fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0011_add_requirement_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='system',
            name='has_data_catalog',
            field=models.BooleanField(
                default=False,
                help_text='Hệ thống có Data Catalog không?',
                verbose_name='Has Data Catalog'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='data_catalog_notes',
            field=models.TextField(
                blank=True,
                help_text='Ghi chú về Data Catalog (công cụ, phạm vi, ...)',
                verbose_name='Data Catalog Notes'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='has_mdm',
            field=models.BooleanField(
                default=False,
                help_text='Hệ thống có MDM (Master Data Management) không?',
                verbose_name='Has Master Data Management'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='mdm_notes',
            field=models.TextField(
                blank=True,
                help_text='Ghi chú về MDM (công cụ, phạm vi, dữ liệu master, ...)',
                verbose_name='MDM Notes'
            ),
        ),
    ]
