# Generated manually - Add CustomPolicy model
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0027_add_ai_response_feedback'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomPolicy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('accuracy', 'Accuracy'), ('clarity', 'Clarity'), ('completeness', 'Completeness'), ('performance', 'Performance'), ('custom', 'Custom')], max_length=50, verbose_name='Category')),
                ('rule', models.TextField(help_text='Description of what the AI should or should not do', verbose_name='Policy Rule')),
                ('priority', models.CharField(choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')], default='medium', max_length=20, verbose_name='Priority')),
                ('rationale', models.TextField(help_text='Explanation of why this policy is needed', verbose_name='Rationale')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, help_text='Whether this policy is currently being used', verbose_name='Active')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='custom_policies', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
            ],
            options={
                'verbose_name': 'Custom Policy',
                'verbose_name_plural': 'Custom Policies',
                'db_table': 'systems_custom_policy',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='custompolicy',
            index=models.Index(fields=['-created_at'], name='systems_cu_created_a1b2c3_idx'),
        ),
        migrations.AddIndex(
            model_name='custompolicy',
            index=models.Index(fields=['is_active'], name='systems_cu_is_acti_d4e5f6_idx'),
        ),
        migrations.AddIndex(
            model_name='custompolicy',
            index=models.Index(fields=['priority'], name='systems_cu_priorit_g7h8i9_idx'),
        ),
    ]
