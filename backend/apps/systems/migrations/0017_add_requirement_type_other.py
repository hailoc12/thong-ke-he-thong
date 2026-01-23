# Generated migration: Add requirement_type_other field and update choices

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0016_alter_system_data_classification_type'),
    ]

    operations = [
        # Update requirement_type choices to include 'other'
        migrations.AlterField(
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
                    ('other', 'Khác'),
                ],
                help_text='Nhu cầu: Xây mới, Nâng cấp, Tích hợp, Thay thế, Mở rộng, Khác',
                max_length=50,
                verbose_name='Requirement Type'
            ),
        ),
        # Add requirement_type_other field
        migrations.AddField(
            model_name='system',
            name='requirement_type_other',
            field=models.TextField(
                blank=True,
                help_text='Mô tả chi tiết nhu cầu khác (bắt buộc khi chọn "Khác")',
                verbose_name='Requirement Type (Other)'
            ),
        ),
    ]
