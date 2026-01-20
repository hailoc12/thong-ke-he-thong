# Generated migration for P0.7 Delete Functionality - Soft Delete for Systems

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('systems', '0005_attachment_systemarchitecture_systemassessment_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='system',
            name='is_deleted',
            field=models.BooleanField(
                default=False,
                help_text='Soft delete flag - True if system has been deleted',
                verbose_name='Is Deleted'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='deleted_at',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='Timestamp when system was deleted',
                verbose_name='Deleted At'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='deleted_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='deleted_systems',
                to=settings.AUTH_USER_MODEL,
                help_text='User who deleted this system',
                verbose_name='Deleted By'
            ),
        ),
    ]
