"""
Django management command to debug system completion percentage calculation.
"""
from django.core.management.base import BaseCommand
from apps.systems.models import System
from apps.systems.utils import (
    calculate_system_completion_percentage,
    get_incomplete_fields,
    get_tab_completion_status,
    REQUIRED_FIELDS_MAP
)


class Command(BaseCommand):
    help = 'Debug system completion percentage calculation'

    def add_arguments(self, parser):
        parser.add_argument('system_id', type=int, help='System ID to debug')

    def handle(self, *args, **options):
        system_id = options['system_id']

        try:
            system = System.objects.select_related(
                'architecture',
                'data_info',
                'operations',
                'integration',
                'assessment',
                'cost',
                'vendor',
                'infrastructure',
                'security'
            ).get(id=system_id)
        except System.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'System {system_id} not found'))
            return

        self.stdout.write(self.style.SUCCESS(f'\n=== System {system_id}: {system.system_name} ===\n'))

        # Calculate completion percentage
        percentage = calculate_system_completion_percentage(system)
        self.stdout.write(f'Completion Percentage: {percentage}%\n')

        # Get incomplete fields
        incomplete = get_incomplete_fields(system)
        total_required = sum(len(fields) for fields in REQUIRED_FIELDS_MAP.values())

        self.stdout.write(f'Total Required Fields: {total_required}')
        self.stdout.write(f'Incomplete Fields: {len(incomplete)}\n')

        if incomplete:
            self.stdout.write(self.style.WARNING('=== INCOMPLETE FIELDS ==='))
            for field in sorted(incomplete):
                self.stdout.write(f'  - {field}')
            self.stdout.write('')

        # Get tab-by-tab status
        tab_status = get_tab_completion_status(system)
        self.stdout.write(self.style.SUCCESS('=== TAB COMPLETION STATUS ==='))

        tab_names = {
            'tab1': 'Tab 1 - Basic Info',
            'tab2': 'Tab 2 - Business',
            'tab3': 'Tab 3 - Architecture',
            'tab4': 'Tab 4 - Data',
            'tab5': 'Tab 5 - Integration',
            'tab6': 'Tab 6 - Security',
            'tab7': 'Tab 7 - Infrastructure',
            'tab8': 'Tab 8 - Operations',
            'tab9': 'Tab 9 - Assessment',
        }

        for tab_key in sorted(tab_status.keys()):
            status = tab_status[tab_key]
            tab_name = tab_names.get(tab_key, tab_key)
            complete_icon = '✓' if status['complete'] else '✗'

            self.stdout.write(
                f'{complete_icon} {tab_name}: {status["filled"]}/{status["required"]} '
                f'({status["percentage"]}%)'
            )

        # Show detailed field values for incomplete tabs
        self.stdout.write(self.style.SUCCESS('\n=== DETAILED FIELD VALUES ==='))

        for tab_key, field_names in REQUIRED_FIELDS_MAP.items():
            tab_name = tab_names.get(tab_key, tab_key)
            self.stdout.write(f'\n{tab_name}:')

            for field_name in field_names:
                try:
                    # Tab 3: Some fields are in SystemArchitecture model
                    if tab_key == 'tab3' and field_name in ['architecture_type', 'architecture_description', 'backend_tech', 'frontend_tech', 'mobile_app', 'database_type', 'database_model', 'hosting_type']:
                        if hasattr(system, 'architecture'):
                            field_value = getattr(system.architecture, field_name, None)
                        else:
                            field_value = None
                    # Tab 4: Some fields are in SystemDataInfo model
                    elif tab_key == 'tab4' and field_name in ['storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent', 'file_storage_type', 'record_count', 'secondary_databases', 'data_types']:
                        if hasattr(system, 'data_info'):
                            field_value = getattr(system.data_info, field_name, None)
                        else:
                            field_value = None
                    # Tab 8: support_level is in SystemOperations model
                    elif tab_key == 'tab8' and field_name == 'support_level':
                        if hasattr(system, 'operations'):
                            field_value = getattr(system.operations, 'support_level', None)
                        else:
                            field_value = None
                    # Tab 9: All fields are in SystemAssessment model
                    elif tab_key == 'tab9':
                        if hasattr(system, 'assessment'):
                            field_value = getattr(system.assessment, field_name, None)
                        else:
                            field_value = None
                    else:
                        field_value = getattr(system, field_name, None)

                    # Format the value for display
                    if field_value is None:
                        display_value = '(None)'
                        icon = '✗'
                    elif isinstance(field_value, str) and not field_value.strip():
                        display_value = '(empty string)'
                        icon = '✗'
                    elif isinstance(field_value, (list, dict)) and len(field_value) == 0:
                        display_value = '(empty list/dict)'
                        icon = '✗'
                    else:
                        display_value = repr(field_value)
                        icon = '✓'

                    self.stdout.write(f'  {icon} {field_name}: {display_value}')

                except AttributeError as e:
                    self.stdout.write(f'  ✗ {field_name}: (AttributeError: {e})')
