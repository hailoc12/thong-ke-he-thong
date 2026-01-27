# Generated manually on 2026-01-27
# Fix: Add 'other' option to ALL choice fields that were missing it

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0023_alter_system_authentication_method_and_more'),
    ]

    operations = [
        # System model
        migrations.AlterField(
            model_name='system',
            name='hosting_platform',
            field=models.CharField(
                blank=True,
                choices=[
                    ('cloud', 'Cloud'),
                    ('on_premise', 'On-premise'),
                    ('hybrid', 'Hybrid'),
                    ('other', 'Khác'),
                ],
                max_length=50,
                verbose_name='Hosting Platform'
            ),
        ),

        # SystemArchitecture model
        migrations.AlterField(
            model_name='systemarchitecture',
            name='database_model',
            field=models.CharField(
                blank=True,
                choices=[
                    ('centralized', 'Tập trung'),
                    ('distributed', 'Phân tán'),
                    ('per_app', 'Riêng từng app'),
                    ('other', 'Khác'),
                ],
                max_length=50,
                verbose_name='Database Model'
            ),
        ),
        migrations.AlterField(
            model_name='systemarchitecture',
            name='mobile_app',
            field=models.CharField(
                choices=[
                    ('native', 'Native App'),
                    ('hybrid', 'Hybrid App'),
                    ('pwa', 'PWA'),
                    ('none', 'Không có'),
                    ('other', 'Khác'),
                ],
                default='none',
                max_length=50,
                verbose_name='Mobile App'
            ),
        ),

        # SystemOperations model
        migrations.AlterField(
            model_name='systemoperations',
            name='dev_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('internal', 'Nội bộ'),
                    ('outsource', 'Thuê ngoài'),
                    ('combined', 'Kết hợp'),
                    ('other', 'Khác'),
                ],
                max_length=50,
                verbose_name='Development Type'
            ),
        ),
        migrations.AlterField(
            model_name='systemoperations',
            name='warranty_status',
            field=models.CharField(
                blank=True,
                choices=[
                    ('active', 'Còn bảo hành'),
                    ('expired', 'Hết bảo hành'),
                    ('none', 'Không có'),
                    ('other', 'Khác'),
                ],
                max_length=50,
                verbose_name='Warranty Status'
            ),
        ),
        migrations.AlterField(
            model_name='systemoperations',
            name='vendor_dependency',
            field=models.CharField(
                blank=True,
                choices=[
                    ('high', 'Cao'),
                    ('medium', 'Trung bình'),
                    ('low', 'Thấp'),
                    ('none', 'Không'),
                    ('other', 'Khác'),
                ],
                max_length=20,
                verbose_name='Vendor Dependency'
            ),
        ),
        migrations.AlterField(
            model_name='systemoperations',
            name='deployment_location',
            field=models.CharField(
                blank=True,
                choices=[
                    ('datacenter', 'Data Center'),
                    ('cloud', 'Cloud'),
                    ('hybrid', 'Hybrid'),
                    ('other', 'Khác'),
                ],
                max_length=50,
                verbose_name='Deployment Location'
            ),
        ),
        migrations.AlterField(
            model_name='systemoperations',
            name='compute_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('vm', 'Virtual Machine'),
                    ('container', 'Container'),
                    ('serverless', 'Serverless'),
                    ('bare_metal', 'Bare Metal'),
                    ('other', 'Khác'),
                ],
                max_length=50,
                verbose_name='Compute Type',
                help_text='Type of compute infrastructure used'
            ),
        ),
    ]
