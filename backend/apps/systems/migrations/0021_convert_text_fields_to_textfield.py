# HOT FIX: Convert all freeform text CharField to TextField to prevent crashes
# Bug: Users cannot save long text in fields like "Nhóm hệ thống" (system_group)
# Solution: Convert ALL user-input text fields from CharField to TextField (unlimited length)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0020_add_missing_architecture_fields'),
    ]

    operations = [
        # =====================================================================
        # System Model - Convert freeform text fields to TextField
        # =====================================================================

        # CRITICAL FIX: system_group - This is the field mentioned in bug report
        migrations.AlterField(
            model_name='system',
            name='system_group',
            field=models.TextField(
                default='other',
                verbose_name='System Group',
                help_text='Nhóm hệ thống (REQUIRED) - Accepts predefined or custom values'
            ),
        ),

        # Technology fields - can have long descriptions
        migrations.AlterField(
            model_name='system',
            name='programming_language',
            field=models.TextField(
                blank=True,
                verbose_name='Programming Language',
                help_text='e.g., Python, Java, JavaScript, C#'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='framework',
            field=models.TextField(
                blank=True,
                verbose_name='Framework/Library',
                help_text='e.g., Django, Spring Boot, React, Angular'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='database_name',
            field=models.TextField(
                blank=True,
                verbose_name='Database',
                help_text='e.g., PostgreSQL, MySQL, MongoDB, Oracle'
            ),
        ),

        # Data & Infrastructure fields
        migrations.AlterField(
            model_name='system',
            name='data_volume',
            field=models.TextField(
                blank=True,
                verbose_name='Data Volume',
                help_text='e.g., 100GB, 1TB, 10TB'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='data_exchange_method',
            field=models.TextField(
                blank=True,
                verbose_name='Data Exchange Method',
                help_text='e.g., REST API, SOAP, File Transfer, Database Sync'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='server_configuration',
            field=models.TextField(
                blank=True,
                verbose_name='Server Configuration',
                help_text='CPU, RAM, Storage specifications'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='storage_capacity',
            field=models.TextField(
                blank=True,
                verbose_name='Storage Capacity',
                help_text='Total storage allocated for the system'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='backup_plan',
            field=models.TextField(
                blank=True,
                verbose_name='Backup Plan',
                help_text='Backup frequency, retention, and strategy'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='disaster_recovery_plan',
            field=models.TextField(
                blank=True,
                verbose_name='Disaster Recovery Plan',
                help_text='DR strategy, RTO, RPO'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='compliance_standards_list',
            field=models.TextField(
                blank=True,
                verbose_name='Compliance Standards',
                help_text='e.g., ISO 27001, GDPR, PCI DSS, SOC 2'
            ),
        ),

        # People fields - names can be long in Vietnamese
        migrations.AlterField(
            model_name='system',
            name='business_owner',
            field=models.TextField(
                blank=True,
                verbose_name='Business Owner'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='technical_owner',
            field=models.TextField(
                blank=True,
                verbose_name='Technical Owner'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='responsible_person',
            field=models.TextField(
                blank=True
            ),
        ),

        # =====================================================================
        # SystemArchitecture Model
        # =====================================================================
        migrations.AlterField(
            model_name='systemarchitecture',
            name='backend_tech',
            field=models.TextField(
                blank=True,
                verbose_name='Backend Technology'
            ),
        ),
        migrations.AlterField(
            model_name='systemarchitecture',
            name='frontend_tech',
            field=models.TextField(
                blank=True,
                verbose_name='Frontend Technology'
            ),
        ),
        migrations.AlterField(
            model_name='systemarchitecture',
            name='database_type',
            field=models.TextField(
                blank=True,
                verbose_name='Database Type'
            ),
        ),
        migrations.AlterField(
            model_name='systemarchitecture',
            name='hosting_type',
            field=models.TextField(
                blank=True,
                help_text='cloud, on-premise, hybrid'
            ),
        ),
        migrations.AlterField(
            model_name='systemarchitecture',
            name='cloud_provider',
            field=models.TextField(
                blank=True
            ),
        ),
        migrations.AlterField(
            model_name='systemarchitecture',
            name='containerization',
            field=models.TextField(
                blank=True,
                verbose_name='Containerization',
                help_text='Comma-separated list: docker,kubernetes,openshift'
            ),
        ),
        migrations.AlterField(
            model_name='systemarchitecture',
            name='automated_testing_tools',
            field=models.TextField(
                blank=True,
                help_text='e.g., Jest, Pytest, Selenium, JUnit'
            ),
        ),

        # =====================================================================
        # SystemOperations Model
        # =====================================================================
        migrations.AlterField(
            model_name='systemoperations',
            name='developer',
            field=models.TextField(
                blank=True,
                verbose_name='Developer'
            ),
        ),
        migrations.AlterField(
            model_name='systemoperations',
            name='operator',
            field=models.TextField(
                blank=True,
                verbose_name='Operator'
            ),
        ),
        migrations.AlterField(
            model_name='systemoperations',
            name='support_level',
            field=models.TextField(
                blank=True,
                help_text='24/7, business hours, etc.'
            ),
        ),

        # =====================================================================
        # SystemIntegration Model
        # =====================================================================
        migrations.AlterField(
            model_name='systemintegration',
            name='api_standard',
            field=models.TextField(
                blank=True,
                help_text='REST, SOAP, GraphQL, etc.'
            ),
        ),
        migrations.AlterField(
            model_name='systemintegration',
            name='api_gateway_name',
            field=models.TextField(
                blank=True,
                verbose_name='API Gateway Name',
                help_text='Kong, AWS API Gateway, Azure API Management, etc.'
            ),
        ),
        migrations.AlterField(
            model_name='systemintegration',
            name='api_versioning_standard',
            field=models.TextField(
                blank=True,
                verbose_name='API Versioning Standard',
                help_text='Semantic versioning, date-based, etc.'
            ),
        ),

        # =====================================================================
        # SystemCost Model
        # =====================================================================
        migrations.AlterField(
            model_name='systemcost',
            name='funding_source',
            field=models.TextField(
                blank=True
            ),
        ),

        # =====================================================================
        # SystemVendor Model
        # =====================================================================
        migrations.AlterField(
            model_name='systemvendor',
            name='vendor_name',
            field=models.TextField(
                blank=True,
                verbose_name='Vendor Name'
            ),
        ),
        migrations.AlterField(
            model_name='systemvendor',
            name='vendor_contact_person',
            field=models.TextField(
                blank=True
            ),
        ),
    ]
