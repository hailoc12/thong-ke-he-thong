# Generated migration: Add missing architecture fields causing save failures
# Bug fix: These fields were required by frontend but commented out in backend
# Date: 2026-01-23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0019_add_recommendation_other'),
    ]

    operations = [
        # Add layered architecture fields
        migrations.AddField(
            model_name='systemarchitecture',
            name='has_layered_architecture',
            field=models.BooleanField(
                default=False,
                verbose_name='Has Layered Architecture (4-tier)'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='layered_architecture_details',
            field=models.TextField(
                blank=True,
                help_text='Presentation, Business Logic, Data Access, Integration'
            ),
        ),

        # Add containerization field (stored as comma-separated string for multiple values)
        migrations.AddField(
            model_name='systemarchitecture',
            name='containerization',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Containerization',
                help_text='Comma-separated list: docker,kubernetes,openshift'
            ),
        ),

        # Add CI/CD fields
        migrations.AddField(
            model_name='systemarchitecture',
            name='has_cicd',
            field=models.BooleanField(
                default=False,
                verbose_name='Has CI/CD Pipeline'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='cicd_tool',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('jenkins', 'Jenkins'),
                    ('gitlab_ci', 'GitLab CI/CD'),
                    ('github_actions', 'GitHub Actions'),
                    ('azure_pipelines', 'Azure Pipelines'),
                    ('circle_ci', 'CircleCI'),
                    ('travis_ci', 'Travis CI'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='CI/CD Tool'
            ),
        ),

        # Add automated testing fields
        migrations.AddField(
            model_name='systemarchitecture',
            name='has_automated_testing',
            field=models.BooleanField(
                default=False,
                verbose_name='Has Automated Testing'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='automated_testing_tools',
            field=models.CharField(
                max_length=255,
                blank=True,
                help_text='e.g., Jest, Pytest, Selenium, JUnit'
            ),
        ),

        # Add multi-tenant field (new field, not in original commented code)
        migrations.AddField(
            model_name='systemarchitecture',
            name='is_multi_tenant',
            field=models.BooleanField(
                default=False,
                verbose_name='Is Multi-tenant',
                help_text='Does the system support multiple tenants/organizations?'
            ),
        ),
    ]
