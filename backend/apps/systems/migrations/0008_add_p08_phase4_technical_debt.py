# Generated migration for P0.8 Phase 4: Technical Debt Assessment Fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0007_add_p08_phase3_fields'),
    ]

    operations = [
        # SystemAssessment: Add integration_readiness
        migrations.AddField(
            model_name='systemassessment',
            name='integration_readiness',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Điểm phù hợp: ["easy_to_standardize", "good_api", "clear_data_source", "can_split_service"]',
                verbose_name='Integration Readiness'
            ),
        ),
        # SystemAssessment: Add blockers
        migrations.AddField(
            model_name='systemassessment',
            name='blockers',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Điểm vướng: ["outdated_tech", "no_documentation", "no_api", "dirty_data", "vendor_dependency"]',
                verbose_name='Blockers'
            ),
        ),
        # SystemAssessment: Add recommendation
        migrations.AddField(
            model_name='systemassessment',
            name='recommendation',
            field=models.CharField(
                blank=True,
                choices=[
                    ('keep', 'Giữ nguyên'),
                    ('upgrade', 'Nâng cấp'),
                    ('replace', 'Thay thế'),
                    ('merge', 'Hợp nhất'),
                ],
                help_text='Đề xuất của đơn vị',
                max_length=20,
                verbose_name='Recommendation'
            ),
        ),
    ]
