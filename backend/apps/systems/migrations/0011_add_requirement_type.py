# Generated migration for Phase 0: Add requirement_type field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0010_add_tab_additional_notes'),
    ]

    operations = [
        migrations.AddField(
            model_name='system',
            name='requirement_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('new_build', 'Xây mới'),
                    ('upgrade', 'Nâng cấp'),
                    ('integration', 'Tích hợp - Liên thông'),
                    ('replacement', 'Thay thế hệ thống cũ'),
                    ('expansion', 'Mở rộng module - chức năng'),
                ],
                help_text='Nhu cầu: Xây mới, Nâng cấp, Tích hợp, Thay thế, Mở rộng',
                max_length=50,
                verbose_name='Requirement Type'
            ),
        ),
    ]
