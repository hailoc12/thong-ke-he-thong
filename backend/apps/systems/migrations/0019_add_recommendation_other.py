# Generated migration: Add recommendation_other field and update choices

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0018_add_9_commented_fields'),
    ]

    operations = [
        # Update recommendation choices to include 'other'
        migrations.AlterField(
            model_name='systemassessment',
            name='recommendation',
            field=models.CharField(
                blank=True,
                choices=[
                    ('keep', 'Giữ nguyên'),
                    ('upgrade', 'Nâng cấp'),
                    ('replace', 'Thay thế'),
                    ('merge', 'Hợp nhất'),
                    ('other', 'Khác'),
                ],
                help_text='Đề xuất của đơn vị',
                max_length=20,
                verbose_name='Recommendation'
            ),
        ),
        # Add recommendation_other field
        migrations.AddField(
            model_name='systemassessment',
            name='recommendation_other',
            field=models.TextField(
                blank=True,
                help_text='Mô tả chi tiết đề xuất khác (bắt buộc khi chọn "Khác")',
                verbose_name='Recommendation (Other)'
            ),
        ),
    ]
