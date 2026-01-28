# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0024_add_other_option_to_choices'),
    ]

    operations = [
        migrations.AddField(
            model_name='system',
            name='is_go_live',
            field=models.BooleanField(blank=True, default=True, null=True, verbose_name='Is Go Live'),
        ),
    ]
