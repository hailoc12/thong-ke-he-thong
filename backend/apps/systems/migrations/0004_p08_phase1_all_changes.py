# Generated migration for P0.8 Phase 1 - ALL changes
# Date: 2026-01-19
# Consolidates all Phase 1 changes from gap analysis:
# - Section 1: scope & system_group updates
# - Section 2: total_accounts field
# - Section 4: file_storage_size_gb field
# - Section 5: SystemIntegrationConnection model + API inventory

from django.db import migrations, models
import django.db.models.deletion
from django.utils.translation import gettext_lazy as _


def migrate_system_group_values(apps, schema_editor):
    """
    Data migration to convert old system_group values to new ones

    Mapping:
    - 'platform' → 'shared_platform' (Nền tảng dùng chung của Bộ)
    - 'business' → 'business_app' (Ứng dụng nghiệp vụ)
    - 'website' → 'portal' (treat websites as portals)
    - portal, bi, esb, other → keep as-is

    New values added (no data to migrate):
    - 'national_platform' (Nền tảng quốc gia)
    - 'specialized_db' (CSDL chuyên ngành)
    """
    System = apps.get_model('systems', 'System')

    # Mapping old → new values
    mapping = {
        'platform': 'shared_platform',
        'business': 'business_app',
        'website': 'portal',  # Convert website to portal
    }

    for old_value, new_value in mapping.items():
        updated_count = System.objects.filter(system_group=old_value).update(system_group=new_value)
        if updated_count > 0:
            print(f"  ✓ Migrated {updated_count} systems from '{old_value}' to '{new_value}'")

    # Set default for any systems with empty system_group
    empty_count = System.objects.filter(system_group='').update(system_group='other')
    if empty_count > 0:
        print(f"  ✓ Set default 'other' for {empty_count} systems with empty system_group")

    # Set default for any systems with NULL system_group
    null_count = System.objects.filter(system_group__isnull=True).update(system_group='other')
    if null_count > 0:
        print(f"  ✓ Set default 'other' for {null_count} systems with NULL system_group")


def set_default_scope(apps, schema_editor):
    """Set default 'internal_unit' for any systems with empty scope"""
    System = apps.get_model('systems', 'System')

    # Set default for empty scope
    empty_count = System.objects.filter(scope='').update(scope='internal_unit')
    if empty_count > 0:
        print(f"  ✓ Set default 'internal_unit' for {empty_count} systems with empty scope")

    # Set default for NULL scope
    null_count = System.objects.filter(scope__isnull=True).update(scope='internal_unit')
    if null_count > 0:
        print(f"  ✓ Set default 'internal_unit' for {null_count} systems with NULL scope")


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0002_add_p08_fields'),
    ]

    operations = [
        # ======================================================================
        # SECTION 1: Update system_group choices (8 options) + make required
        # ======================================================================

        # STEP 1: Update system_group choices (keep blank=True temporarily)
        migrations.AlterField(
            model_name='system',
            name='system_group',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('national_platform', 'Nền tảng quốc gia'),
                    ('shared_platform', 'Nền tảng dùng chung của Bộ'),
                    ('specialized_db', 'CSDL chuyên ngành'),
                    ('business_app', 'Ứng dụng nghiệp vụ'),
                    ('portal', 'Cổng thông tin'),
                    ('bi', 'BI/Báo cáo'),
                    ('esb', 'ESB/Tích hợp'),
                    ('other', 'Khác'),
                ],
                blank=True,  # Still allow blank temporarily for data migration
                default='other',
                verbose_name='System Group',
                help_text='Nhóm hệ thống (REQUIRED - 8 options per customer feedback)'
            ),
        ),

        # STEP 2: Run data migration for system_group
        migrations.RunPython(
            migrate_system_group_values,
            migrations.RunPython.noop
        ),

        # STEP 3: Make system_group REQUIRED (now that data is migrated)
        migrations.AlterField(
            model_name='system',
            name='system_group',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('national_platform', 'Nền tảng quốc gia'),
                    ('shared_platform', 'Nền tảng dùng chung của Bộ'),
                    ('specialized_db', 'CSDL chuyên ngành'),
                    ('business_app', 'Ứng dụng nghiệp vụ'),
                    ('portal', 'Cổng thông tin'),
                    ('bi', 'BI/Báo cáo'),
                    ('esb', 'ESB/Tích hợp'),
                    ('other', 'Khác'),
                ],
                blank=False,  # ← Now REQUIRED
                default='other',
                verbose_name='System Group',
                help_text='Nhóm hệ thống (REQUIRED - 8 options per customer feedback)'
            ),
        ),

        # STEP 4: Set default scope for existing systems
        migrations.RunPython(
            set_default_scope,
            migrations.RunPython.noop
        ),

        # STEP 5: Make scope REQUIRED
        migrations.AlterField(
            model_name='system',
            name='scope',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('internal_unit', 'Nội bộ đơn vị'),
                    ('org_wide', 'Toàn bộ'),
                    ('external', 'Bên ngoài'),
                ],
                blank=False,  # ← Now REQUIRED
                default='internal_unit',
                verbose_name='Scope',
                help_text='Phạm vi sử dụng của hệ thống (REQUIRED)'
            ),
        ),

        # ======================================================================
        # SECTION 2: Add total_accounts field
        # ======================================================================
        migrations.AddField(
            model_name='system',
            name='total_accounts',
            field=models.IntegerField(
                null=True,
                blank=True,
                verbose_name='Total Accounts',
                help_text='Tổng số tài khoản đã tạo trong hệ thống (P0.8 customer requirement)'
            ),
        ),

        # Update help text for existing user metrics fields
        migrations.AlterField(
            model_name='system',
            name='users_mau',
            field=models.IntegerField(
                null=True,
                blank=True,
                verbose_name='MAU (Monthly Active Users)'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='users_dau',
            field=models.IntegerField(
                null=True,
                blank=True,
                verbose_name='DAU (Daily Active Users)'
            ),
        ),
        migrations.AlterField(
            model_name='system',
            name='num_organizations',
            field=models.IntegerField(
                null=True,
                blank=True,
                verbose_name='Number of Organizations',
                help_text='Số đơn vị/địa phương sử dụng hệ thống'
            ),
        ),

        # ======================================================================
        # SECTION 4: Add file_storage_size_gb field to SystemDataInfo
        # ======================================================================
        migrations.AddField(
            model_name='systemdatainfo',
            name='file_storage_size_gb',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                null=True,
                blank=True,
                verbose_name='File Storage Size (GB)',
                help_text='Dung lượng file đính kèm, tài liệu lưu trữ (GB) - REQUIRED per customer'
            ),
        ),

        # Update help text for existing data volume fields
        migrations.AlterField(
            model_name='systemdatainfo',
            name='storage_size_gb',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                null=True,
                blank=True,
                verbose_name='Database Storage Size (GB)',
                help_text='Dung lượng CSDL hiện tại (GB) - REQUIRED per customer'
            ),
        ),
        migrations.AlterField(
            model_name='systemdatainfo',
            name='growth_rate_percent',
            field=models.DecimalField(
                max_digits=5,
                decimal_places=2,
                null=True,
                blank=True,
                verbose_name='Growth Rate (%)',
                help_text='Tốc độ tăng trưởng dữ liệu (%/năm hoặc GB/tháng) - REQUIRED per customer'
            ),
        ),

        # ======================================================================
        # SECTION 5: Add API Inventory fields to System
        # ======================================================================
        migrations.AddField(
            model_name='system',
            name='api_provided_count',
            field=models.IntegerField(
                null=True,
                blank=True,
                verbose_name='APIs Provided Count',
                help_text='Tổng số API mà hệ thống này cung cấp cho hệ thống khác (P0.8 customer requirement)'
            ),
        ),
        migrations.AddField(
            model_name='system',
            name='api_consumed_count',
            field=models.IntegerField(
                null=True,
                blank=True,
                verbose_name='APIs Consumed Count',
                help_text='Tổng số API mà hệ thống này gọi từ hệ thống khác (P0.8 customer requirement)'
            ),
        ),

        # ======================================================================
        # SECTION 5: Create SystemIntegrationConnection model
        # ======================================================================
        migrations.CreateModel(
            name='SystemIntegrationConnection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_system', models.CharField(
                    max_length=200,
                    verbose_name='Source System',
                    help_text='Hệ thống cung cấp dữ liệu'
                )),
                ('target_system', models.CharField(
                    max_length=200,
                    verbose_name='Target System',
                    help_text='Hệ thống nhận dữ liệu'
                )),
                ('data_objects', models.TextField(
                    verbose_name='Data Objects Exchanged',
                    help_text='Các đối tượng dữ liệu, entities được trao đổi. VD: Thông tin nhân viên, phòng ban, chức vụ'
                )),
                ('integration_method', models.CharField(
                    max_length=50,
                    choices=[
                        ('api_rest', 'API REST'),
                        ('api_soap', 'API SOAP'),
                        ('api_graphql', 'API GraphQL'),
                        ('file_transfer', 'File Transfer'),
                        ('database_link', 'Database Link'),
                        ('message_queue', 'Message Queue'),
                        ('manual', 'Thủ công'),
                        ('other', 'Khác'),
                    ],
                    verbose_name='Integration Method'
                )),
                ('frequency', models.CharField(
                    max_length=50,
                    choices=[
                        ('realtime', 'Real-time'),
                        ('near_realtime', 'Near real-time (< 1 phút)'),
                        ('batch_hourly', 'Batch - Mỗi giờ'),
                        ('batch_daily', 'Batch - Hàng ngày'),
                        ('batch_weekly', 'Batch - Hàng tuần'),
                        ('batch_monthly', 'Batch - Hàng tháng'),
                        ('on_demand', 'On-demand'),
                    ],
                    verbose_name='Frequency'
                )),
                ('error_handling', models.TextField(
                    blank=True,
                    verbose_name='Error Handling / Retry',
                    help_text='Cơ chế retry, rollback, error notification. VD: Retry 3 lần, delay 5 phút, gửi email cảnh báo'
                )),
                ('has_api_docs', models.BooleanField(
                    default=False,
                    verbose_name='Has API Documentation?'
                )),
                ('notes', models.TextField(
                    blank=True,
                    verbose_name='Notes'
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('system', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='integration_connections',
                    to='systems.system',
                    verbose_name='System'
                )),
            ],
            options={
                'db_table': 'system_integration_connections',
                'ordering': ['source_system', 'target_system'],
                'verbose_name': 'Integration Connection',
                'verbose_name_plural': 'Integration Connections',
            },
        ),
    ]
