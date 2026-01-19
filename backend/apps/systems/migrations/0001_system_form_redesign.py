# Generated migration for System Form Redesign - P0.8
# Date: 2026-01-19
# Customer Request: Major form redesign with ~30+ new fields
# Type: ALTER migration (adding fields to existing System model)

from django.db import migrations, models


def migrate_criticality_level(apps, schema_editor):
    """
    Migrate 'critical' (Cực kỳ quan trọng) → 'high' (Quan trọng)
    Per customer request: "Bỏ Cực kỳ quan trọng"
    """
    System = apps.get_model('systems', 'System')
    updated_count = System.objects.filter(criticality_level='critical').update(criticality_level='high')
    print(f"Migrated {updated_count} systems from 'critical' to 'high' criticality level")


def reverse_criticality_level(apps, schema_editor):
    """Reverse migration - no action (can't restore original values)"""
    pass


class Migration(migrations.Migration):

    initial = False  # NOT initial migration - altering existing model

    dependencies = [
        ('systems', '__first__'),  # Depends on any existing migrations
        ('organizations', '__first__'),
    ]

    operations = [
        # =====================================================================
        # SECTION 1: Modify existing criticality_level field choices
        # Remove 'critical' option per customer request
        # =====================================================================
        migrations.AlterField(
            model_name='system',
            name='criticality_level',
            field=models.CharField(
                max_length=20,
                choices=[
                    # Removed ('critical', 'Tối quan trọng') per customer request
                    ('high', 'Quan trọng'),
                    ('medium', 'Trung bình'),
                    ('low', 'Thấp'),
                ],
                default='medium',
                verbose_name='Criticality Level'
            ),
        ),

        # =====================================================================
        # SECTION 2: Business Context - ADD NEW FIELDS
        # =====================================================================
        migrations.AddField(
            model_name='system',
            name='business_objectives',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='List of business objectives (max 5 items recommended)'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='business_processes',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='List of main business processes supported by the system'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='has_design_documents',
            field=models.BooleanField(
                default=False,
                verbose_name='Has Design Documents?',
                help_text='Có đủ hồ sơ phân tích thiết kế hệ thống?'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='user_types',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='User types: internal_leadership, internal_staff, internal_reviewer, external_business, external_citizen, external_local, external_agency'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='annual_users',
            field=models.IntegerField(
                null=True,
                blank=True,
                verbose_name='Annual Users Count',
                help_text='Số lượng người dùng hàng năm'
            ),
        ),

        # =====================================================================
        # SECTION 3: Technology Architecture - ADD NEW FIELDS
        # =====================================================================
        migrations.AddField(
            model_name='system',
            name='programming_language',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Programming Language',
                help_text='e.g., Python, Java, JavaScript, C#'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='framework',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Framework/Library',
                help_text='e.g., Django, Spring Boot, React, Angular'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='database_name',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Database',
                help_text='e.g., PostgreSQL, MySQL, MongoDB, Oracle'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='hosting_platform',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('cloud', 'Cloud'),
                    ('on_premise', 'On-premise'),
                    ('hybrid', 'Hybrid'),
                ],
                blank=True,
                verbose_name='Hosting Platform'
            ),
        ),

        # =====================================================================
        # SECTION 4: Data Architecture - ADD NEW FIELDS
        # =====================================================================
        migrations.AddField(
            model_name='system',
            name='data_sources',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='List of data sources (databases, APIs, files, etc.)'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='data_classification_type',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Data Classification',
                help_text='e.g., Public, Internal, Confidential, Secret'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='data_volume',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Data Volume',
                help_text='e.g., 100GB, 1TB, 10TB'
            ),
        ),

        # =====================================================================
        # SECTION 5: System Integration - ADD NEW FIELDS
        # =====================================================================
        migrations.AddField(
            model_name='system',
            name='integrated_internal_systems',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='List of integrated internal systems'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='integrated_external_systems',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='List of integrated external systems'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='api_list',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='List of APIs/Webservices provided or consumed'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='data_exchange_method',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Data Exchange Method',
                help_text='e.g., REST API, SOAP, File Transfer, Database Sync'
            ),
        ),

        # =====================================================================
        # SECTION 6: Security - ADD NEW FIELDS
        # =====================================================================
        migrations.AddField(
            model_name='system',
            name='authentication_method',
            field=models.CharField(
                max_length=100,
                choices=[
                    ('username_password', 'Username/Password'),
                    ('sso', 'SSO'),
                    ('ldap', 'LDAP'),
                    ('oauth', 'OAuth'),
                    ('saml', 'SAML'),
                    ('biometric', 'Biometric'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='Authentication Method'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='has_encryption',
            field=models.BooleanField(
                default=False,
                verbose_name='Has Data Encryption?',
                help_text='Mã hóa dữ liệu'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='has_audit_log',
            field=models.BooleanField(
                default=False,
                verbose_name='Has Audit Log?',
                help_text='Có log audit trail?'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='compliance_standards_list',
            field=models.CharField(
                max_length=500,
                blank=True,
                verbose_name='Compliance Standards',
                help_text='e.g., ISO 27001, GDPR, PCI DSS, SOC 2'
            ),
        ),

        # =====================================================================
        # SECTION 7: Infrastructure - ADD NEW FIELDS
        # =====================================================================
        migrations.AddField(
            model_name='system',
            name='server_configuration',
            field=models.CharField(
                max_length=500,
                blank=True,
                verbose_name='Server Configuration',
                help_text='CPU, RAM, Storage specifications'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='storage_capacity',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Storage Capacity',
                help_text='Total storage allocated for the system'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='backup_plan',
            field=models.CharField(
                max_length=500,
                blank=True,
                verbose_name='Backup Plan',
                help_text='Backup frequency, retention, and strategy'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='disaster_recovery_plan',
            field=models.CharField(
                max_length=500,
                blank=True,
                verbose_name='Disaster Recovery Plan',
                help_text='DR strategy, RTO, RPO'
            ),
        ),

        # =====================================================================
        # Make system_code auto-generated (editable=False)
        # =====================================================================
        migrations.AlterField(
            model_name='system',
            name='system_code',
            field=models.CharField(
                max_length=100,
                unique=True,
                editable=False,
                verbose_name='System Code',
                help_text='Auto-generated: SYS-{ORG_CODE}-{YYYY}-{XXXX}'
            ),
        ),

        # =====================================================================
        # Data Migration: Migrate criticality level
        # =====================================================================
        migrations.RunPython(migrate_criticality_level, reverse_criticality_level),
    ]
