# Generated migration for P0.8 Phase 3: Integration & Operations Fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0006_system_soft_delete_fields'),
    ]

    operations = [
        # SystemOperations: Add compute_type
        migrations.AddField(
            model_name='systemoperations',
            name='compute_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('vm', 'Virtual Machine'),
                    ('container', 'Container'),
                    ('serverless', 'Serverless'),
                    ('bare_metal', 'Bare Metal'),
                ],
                help_text='Type of compute infrastructure used',
                max_length=50,
                verbose_name='Compute Type'
            ),
        ),
        # SystemOperations: Add deployment_frequency
        migrations.AddField(
            model_name='systemoperations',
            name='deployment_frequency',
            field=models.CharField(
                blank=True,
                choices=[
                    ('daily', 'Daily'),
                    ('weekly', 'Weekly'),
                    ('monthly', 'Monthly'),
                    ('quarterly', 'Quarterly'),
                    ('yearly', 'Yearly'),
                    ('on_demand', 'On Demand'),
                ],
                help_text='How often code is deployed to production',
                max_length=50,
                verbose_name='Deployment Frequency'
            ),
        ),
        # SystemIntegration: Add api_documentation
        migrations.AddField(
            model_name='systemintegration',
            name='api_documentation',
            field=models.TextField(
                blank=True,
                help_text='Link to API documentation or description',
                verbose_name='API Documentation'
            ),
        ),
        # SystemIntegration: Add api_versioning_standard
        migrations.AddField(
            model_name='systemintegration',
            name='api_versioning_standard',
            field=models.CharField(
                blank=True,
                help_text='Semantic versioning, date-based, etc.',
                max_length=100,
                verbose_name='API Versioning Standard'
            ),
        ),
        # SystemIntegration: Add has_integration_monitoring
        migrations.AddField(
            model_name='systemintegration',
            name='has_integration_monitoring',
            field=models.BooleanField(
                default=False,
                help_text='Monitoring for integration endpoints and data flows',
                verbose_name='Has Integration Monitoring'
            ),
        ),
    ]
