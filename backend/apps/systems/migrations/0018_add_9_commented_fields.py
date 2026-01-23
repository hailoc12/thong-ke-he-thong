# Generated migration: Add 9 previously commented fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0017_add_requirement_type_other'),
    ]

    operations = [
        # SystemArchitecture - 6 fields
        migrations.AddField(
            model_name='systemarchitecture',
            name='api_style',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('rest', 'REST API'),
                    ('graphql', 'GraphQL'),
                    ('grpc', 'gRPC'),
                    ('soap', 'SOAP'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='API Style'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='messaging_queue',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('kafka', 'Apache Kafka'),
                    ('rabbitmq', 'RabbitMQ'),
                    ('activemq', 'ActiveMQ'),
                    ('redis_pubsub', 'Redis Pub/Sub'),
                    ('none', 'Không sử dụng'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='Messaging/Queue System'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='cache_system',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('redis', 'Redis'),
                    ('memcached', 'Memcached'),
                    ('none', 'Không sử dụng'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='Cache System'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='search_engine',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('elasticsearch', 'Elasticsearch'),
                    ('solr', 'Apache Solr'),
                    ('none', 'Không sử dụng'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='Search Engine'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='reporting_bi_tool',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('powerbi', 'Microsoft Power BI'),
                    ('tableau', 'Tableau'),
                    ('metabase', 'Metabase'),
                    ('superset', 'Apache Superset'),
                    ('custom', 'Tự phát triển'),
                    ('none', 'Không có'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='Reporting/BI Tool'
            ),
        ),
        migrations.AddField(
            model_name='systemarchitecture',
            name='source_repository',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('gitlab', 'GitLab'),
                    ('github', 'GitHub'),
                    ('bitbucket', 'Bitbucket'),
                    ('azure_devops', 'Azure DevOps'),
                    ('on_premise', 'On-premise Git'),
                    ('none', 'Không quản lý'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='Source Code Repository'
            ),
        ),

        # SystemDataInfo - 3 fields
        migrations.AddField(
            model_name='systemdatainfo',
            name='secondary_databases',
            field=models.JSONField(
                default=list,
                blank=True,
                help_text='List of secondary/other databases used, e.g., ["Redis", "MongoDB"]'
            ),
        ),
        migrations.AddField(
            model_name='systemdatainfo',
            name='file_storage_type',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('file_server', 'File Server'),
                    ('object_storage', 'Object Storage (S3, MinIO)'),
                    ('nas', 'NAS'),
                    ('database_blob', 'Database BLOB'),
                    ('none', 'Không lưu file'),
                    ('other', 'Khác'),
                ],
                blank=True,
                verbose_name='File Storage Type'
            ),
        ),
        migrations.AddField(
            model_name='systemdatainfo',
            name='record_count',
            field=models.BigIntegerField(
                null=True,
                blank=True,
                verbose_name='Number of Records',
                help_text='Tổng số bản ghi trong CSDL chính'
            ),
        ),
    ]
