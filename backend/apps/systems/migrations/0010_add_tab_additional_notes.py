# Generated migration for Phase 0: Add per-tab additional notes fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0009_merge_20260120_0653'),
    ]

    operations = [
        # Add additional_notes_tab1
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab1',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for General Information tab',
                verbose_name='Additional Notes - Tab 1'
            ),
        ),
        # Add additional_notes_tab2
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab2',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for Business Context tab',
                verbose_name='Additional Notes - Tab 2'
            ),
        ),
        # Add additional_notes_tab3
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab3',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for Technology Architecture tab',
                verbose_name='Additional Notes - Tab 3'
            ),
        ),
        # Add additional_notes_tab4
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab4',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for Data Architecture tab',
                verbose_name='Additional Notes - Tab 4'
            ),
        ),
        # Add additional_notes_tab5
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab5',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for Integration tab',
                verbose_name='Additional Notes - Tab 5'
            ),
        ),
        # Add additional_notes_tab6
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab6',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for Security tab',
                verbose_name='Additional Notes - Tab 6'
            ),
        ),
        # Add additional_notes_tab7
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab7',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for Infrastructure tab',
                verbose_name='Additional Notes - Tab 7'
            ),
        ),
        # Add additional_notes_tab8
        migrations.AddField(
            model_name='system',
            name='additional_notes_tab8',
            field=models.TextField(
                blank=True,
                help_text='Free-form notes for Operations tab',
                verbose_name='Additional Notes - Tab 8'
            ),
        ),
    ]
