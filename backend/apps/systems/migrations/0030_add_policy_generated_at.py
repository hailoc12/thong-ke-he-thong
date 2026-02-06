# Generated migration for adding policy_generated_at timestamp

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0028_add_custom_policy'),
    ]

    operations = [
        migrations.AddField(
            model_name='airesponsefeedback',
            name='policy_generated_at',
            field=models.DateTimeField(
                null=True,
                blank=True,
                verbose_name='Policy Generated At',
                help_text='Timestamp when policy was auto-generated from this feedback'
            ),
        ),
        migrations.AlterField(
            model_name='airesponsefeedback',
            name='analyzed',
            field=models.BooleanField(
                default=False,
                verbose_name='Has Policy Generated',
                help_text='Whether policy has been auto-generated from this feedback',
                db_index=True,
            ),
        ),
    ]
