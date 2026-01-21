"""
Django management command to recreate organizations and users from Excel file
Created: 2026-01-21

DANGER: This command will DELETE all existing organizations and org_user accounts!
Admin users are preserved.

Usage:
    python manage.py recreate_organizations --excel /path/to/file.xlsx
    python manage.py recreate_organizations --excel /path/to/file.xlsx --dry-run
    python manage.py recreate_organizations --excel /path/to/file.xlsx --no-backup
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.hashers import make_password
from django.db import transaction
from apps.accounts.models import User
from apps.organizations.models import Organization
import openpyxl
import json
from datetime import datetime


class Command(BaseCommand):
    help = 'Recreate all organizations and org_user accounts from Excel file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--excel',
            type=str,
            required=True,
            help='Path to Excel file with columns: [Tên đơn vị, Username, Password]'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes'
        )
        parser.add_argument(
            '--no-backup',
            action='store_true',
            help='Skip backup before deletion (NOT RECOMMENDED)'
        )
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Skip confirmation prompts (dangerous!)'
        )

    def handle(self, *args, **options):
        excel_path = options['excel']
        dry_run = options['dry_run']
        skip_backup = options['no_backup']
        skip_confirm = options['yes']

        self.stdout.write(self.style.WARNING('=' * 80))
        self.stdout.write(self.style.WARNING('DANGER: Organization Recreation Script'))
        self.stdout.write(self.style.WARNING('=' * 80))

        # Load and validate Excel file
        self.stdout.write('\n1. Loading Excel file...')
        org_data = self.load_excel(excel_path)
        self.stdout.write(self.style.SUCCESS(f'   ✓ Loaded {len(org_data)} organizations'))

        # Show current state
        self.stdout.write('\n2. Current database state:')
        self.show_current_state()

        # Backup current data
        backup_data = None
        if not skip_backup and not dry_run:
            self.stdout.write('\n3. Creating backup...')
            backup_data = self.create_backup()
            self.stdout.write(self.style.SUCCESS(f'   ✓ Backup created'))
        else:
            self.stdout.write('\n3. Skipping backup (--no-backup or --dry-run)')

        # Show what will be done
        self.stdout.write('\n4. Planned actions:')
        self.show_planned_actions(org_data)

        # Confirmation
        if not dry_run and not skip_confirm:
            self.stdout.write('\n' + '=' * 80)
            self.stdout.write(self.style.ERROR('⚠️  THIS WILL PERMANENTLY DELETE DATA!'))
            self.stdout.write(self.style.WARNING('Type "DELETE ALL ORGANIZATIONS" to confirm:'))
            confirmation = input('> ')
            if confirmation != 'DELETE ALL ORGANIZATIONS':
                self.stdout.write(self.style.ERROR('❌ Aborted by user'))
                return

        if dry_run:
            self.stdout.write('\n' + '=' * 80)
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes made'))
            self.stdout.write(self.style.WARNING('Remove --dry-run to execute'))
            return

        # Execute recreation
        self.stdout.write('\n5. Executing recreation...')
        try:
            with transaction.atomic():
                self.delete_existing_data()
                self.create_organizations_and_users(org_data)
                self.stdout.write(self.style.SUCCESS('\n✓ Recreation completed successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}'))
            if backup_data:
                self.stdout.write(self.style.WARNING('Backup data available in output above'))
            raise

        # Show final state
        self.stdout.write('\n6. Final database state:')
        self.show_current_state()

    def load_excel(self, excel_path):
        """Load organization data from Excel file"""
        try:
            wb = openpyxl.load_workbook(excel_path)
            ws = wb.active

            org_data = []
            # Skip header row
            for row in ws.iter_rows(min_row=2, values_only=True):
                if row[0]:  # Check if org name exists
                    org_data.append({
                        'name': row[0],
                        'username': row[1],
                        'password': row[2],
                    })

            if not org_data:
                raise CommandError('No data found in Excel file')

            # Validate uniqueness
            names = [item['name'] for item in org_data]
            usernames = [item['username'] for item in org_data]

            if len(names) != len(set(names)):
                raise CommandError('Duplicate organization names found in Excel')

            if len(usernames) != len(set(usernames)):
                raise CommandError('Duplicate usernames found in Excel')

            return org_data

        except FileNotFoundError:
            raise CommandError(f'Excel file not found: {excel_path}')
        except Exception as e:
            raise CommandError(f'Error reading Excel file: {str(e)}')

    def show_current_state(self):
        """Display current database state"""
        total_users = User.objects.count()
        admin_users = User.objects.filter(role='admin').count()
        org_users = User.objects.filter(role='org_user').count()
        total_orgs = Organization.objects.count()

        self.stdout.write(f'   Organizations: {total_orgs}')
        self.stdout.write(f'   Users (total): {total_users}')
        self.stdout.write(f'   - Admin users: {admin_users} (will be preserved)')
        self.stdout.write(f'   - Org users:   {org_users} (will be deleted)')

    def create_backup(self):
        """Create JSON backup of current data"""
        backup = {
            'timestamp': datetime.now().isoformat(),
            'organizations': [],
            'org_users': []
        }

        # Backup organizations
        for org in Organization.objects.all():
            backup['organizations'].append({
                'id': org.id,
                'name': org.name,
                'code': org.code,
                'description': org.description,
                'contact_person': org.contact_person,
                'contact_email': org.contact_email,
                'contact_phone': org.contact_phone,
            })

        # Backup org users
        for user in User.objects.filter(role='org_user'):
            backup['org_users'].append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'organization_id': user.organization_id,
                'organization_name': user.organization.name if user.organization else None,
                'phone': user.phone,
                'is_active': user.is_active,
            })

        # Save to file
        backup_file = f'/tmp/org_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(backup, f, ensure_ascii=False, indent=2)

        self.stdout.write(f'   Backup saved to: {backup_file}')
        return backup

    def show_planned_actions(self, org_data):
        """Show what will be done"""
        org_users_count = User.objects.filter(role='org_user').count()
        orgs_count = Organization.objects.count()

        self.stdout.write(self.style.WARNING(f'   DELETE: {org_users_count} organization users'))
        self.stdout.write(self.style.WARNING(f'   DELETE: {orgs_count} organizations'))
        self.stdout.write(self.style.SUCCESS(f'   CREATE: {len(org_data)} organizations'))
        self.stdout.write(self.style.SUCCESS(f'   CREATE: {len(org_data)} organization users'))

        self.stdout.write('\n   Sample of new organizations:')
        for item in org_data[:5]:
            self.stdout.write(f'      - {item["name"]:50s} → {item["username"]}')
        if len(org_data) > 5:
            self.stdout.write(f'      ... and {len(org_data) - 5} more')

    def delete_existing_data(self):
        """Delete existing organizations and org_users"""
        self.stdout.write('   Deleting organization users...')
        deleted_users = User.objects.filter(role='org_user').delete()
        self.stdout.write(f'      ✓ Deleted {deleted_users[0]} org users')

        self.stdout.write('   Deleting organizations...')
        deleted_orgs = Organization.objects.all().delete()
        self.stdout.write(f'      ✓ Deleted {deleted_orgs[0]} organizations')

        # Verify admin users are intact
        admin_count = User.objects.filter(role='admin').count()
        self.stdout.write(f'      ✓ Admin users preserved: {admin_count}')

    def create_organizations_and_users(self, org_data):
        """Create new organizations and users"""
        self.stdout.write('   Creating organizations and users...')

        created_orgs = 0
        created_users = 0

        for item in org_data:
            # Create organization
            org = Organization.objects.create(
                name=item['name'],
                code=item['username'],  # Use username as code
            )
            created_orgs += 1

            # Create user for this organization
            user = User.objects.create(
                username=item['username'],
                password=make_password(item['password']),
                role='org_user',
                organization=org,
                is_active=True,
                is_staff=False,
                is_superuser=False,
            )
            created_users += 1

            if created_orgs % 10 == 0:
                self.stdout.write(f'      Progress: {created_orgs}/{len(org_data)}')

        self.stdout.write(f'      ✓ Created {created_orgs} organizations')
        self.stdout.write(f'      ✓ Created {created_users} org users')
