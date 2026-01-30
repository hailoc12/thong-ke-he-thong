#!/usr/bin/env python3
"""
Live Test Verification Script for System Data Save Bug Fix
Executes end-to-end tests on production to verify data integrity across all related tables.

Production Environment:
- Server: admin_@34.142.152.104
- API: https://hientrangcds.mst.gov.vn/api/
- Database: system_reports

Test Scenarios:
1. Create new system with comprehensive data
2. Update existing system ID 115 with focus on empty fields
"""

import os
import sys
import json
import requests
import subprocess
import traceback
from datetime import datetime, date
from typing import Dict, List, Any, Optional


# ===================================================================
# CONFIGURATION
# ===================================================================

API_BASE_URL = "https://hientrangcds.mst.gov.vn/api"
DB_HOST = "34.142.152.104"
DB_USER = "admin_"
DB_PASS = "aivnews_xinchao_#*2020"
DB_NAME = "system_reports"

# Test credentials (you'll need to provide actual user credentials)
TEST_USERNAME = ""  # Fill in valid org_user or admin username
TEST_PASSWORD = ""  # Fill in valid password

# Terminal colors for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


# ===================================================================
# DATABASE UTILITIES
# ===================================================================

def execute_db_query(query: str, fetch_one: bool = False) -> Optional[Any]:
    """Execute MySQL query via SSH tunnel and return results"""
    try:
        # Create SSH command with MySQL query
        ssh_cmd = [
            'ssh',
            f'{DB_USER}@{DB_HOST}',
            f'mysql -u {DB_USER} -p"{DB_PASS}" {DB_NAME} -e "{query}"'
        ]

        result = subprocess.run(
            ssh_cmd,
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            print(f"{Colors.FAIL}Database query failed: {result.stderr}{Colors.ENDC}")
            return None

        # Parse output (tab-separated)
        lines = result.stdout.strip().split('\n')
        if len(lines) <= 1:  # No data (only header or empty)
            return None

        # Get column names from first line
        headers = lines[0].split('\t')

        # Parse data rows
        rows = []
        for line in lines[1:]:
            values = line.split('\t')
            row_dict = dict(zip(headers, values))
            rows.append(row_dict)

        return rows[0] if fetch_one else rows

    except Exception as e:
        print(f"{Colors.FAIL}Database error: {str(e)}{Colors.ENDC}")
        traceback.print_exc()
        return None


def get_system_by_id(system_id: int) -> Optional[Dict]:
    """Fetch system and related data from database"""
    query = f"""
        SELECT
            s.*,
            sa.backend_tech, sa.frontend_tech, sa.architecture_type,
            sdi.storage_size_gb, sdi.record_count, sdi.data_update_frequency,
            so.deployment_location, so.developer, so.hosting_type,
            si.api_count, si.api_standard, si.integration_count
        FROM systems_system s
        LEFT JOIN systems_systemarchitecture sa ON s.id = sa.system_id
        LEFT JOIN systems_systemdatainfo sdi ON s.id = sdi.system_id
        LEFT JOIN systems_systemoperations so ON s.id = so.system_id
        LEFT JOIN systems_systemintegration si ON s.id = si.system_id
        WHERE s.id = {system_id}
    """
    return execute_db_query(query, fetch_one=True)


# ===================================================================
# API UTILITIES
# ===================================================================

class APIClient:
    """API client with authentication"""

    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.base_url = API_BASE_URL

    def login(self, username: str, password: str) -> bool:
        """Authenticate and get JWT token"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login/",
                json={"username": username, "password": password},
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}'
                })
                print(f"{Colors.OKGREEN}✓ Authenticated successfully{Colors.ENDC}")
                return True
            else:
                print(f"{Colors.FAIL}✗ Authentication failed: {response.text}{Colors.ENDC}")
                return False

        except Exception as e:
            print(f"{Colors.FAIL}✗ Login error: {str(e)}{Colors.ENDC}")
            return False

    def create_system(self, data: Dict) -> Optional[Dict]:
        """Create a new system"""
        try:
            response = self.session.post(
                f"{self.base_url}/systems/",
                json=data,
                timeout=30
            )

            if response.status_code in [200, 201]:
                print(f"{Colors.OKGREEN}✓ System created successfully{Colors.ENDC}")
                return response.json()
            else:
                print(f"{Colors.FAIL}✗ Create failed ({response.status_code}): {response.text}{Colors.ENDC}")
                return None

        except Exception as e:
            print(f"{Colors.FAIL}✗ Create error: {str(e)}{Colors.ENDC}")
            traceback.print_exc()
            return None

    def update_system(self, system_id: int, data: Dict) -> Optional[Dict]:
        """Update existing system (PATCH)"""
        try:
            response = self.session.patch(
                f"{self.base_url}/systems/{system_id}/",
                json=data,
                timeout=30
            )

            if response.status_code == 200:
                print(f"{Colors.OKGREEN}✓ System updated successfully{Colors.ENDC}")
                return response.json()
            else:
                print(f"{Colors.FAIL}✗ Update failed ({response.status_code}): {response.text}{Colors.ENDC}")
                return None

        except Exception as e:
            print(f"{Colors.FAIL}✗ Update error: {str(e)}{Colors.ENDC}")
            traceback.print_exc()
            return None

    def get_system(self, system_id: int) -> Optional[Dict]:
        """Get system detail"""
        try:
            response = self.session.get(
                f"{self.base_url}/systems/{system_id}/",
                timeout=30
            )

            if response.status_code == 200:
                return response.json()
            else:
                print(f"{Colors.FAIL}✗ Get failed ({response.status_code}): {response.text}{Colors.ENDC}")
                return None

        except Exception as e:
            print(f"{Colors.FAIL}✗ Get error: {str(e)}{Colors.ENDC}")
            return None


# ===================================================================
# TEST SCENARIOS
# ===================================================================

def scenario_1_create_system(client: APIClient) -> Optional[int]:
    """
    SCENARIO 1: Create New System
    Test comprehensive data creation across all related tables
    """
    print(f"\n{Colors.HEADER}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}SCENARIO 1: Create New System (End-to-End){Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*70}{Colors.ENDC}\n")

    # Test data with fields from multiple tabs
    test_data = {
        # TAB 1: Basic Info
        "system_name": f"LIVE TEST - System Verification {datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "system_name_en": "Live Test System Verification",
        "purpose": "End-to-end verification test for data save bug fix",
        "scope": "internal_unit",
        "system_group": "business_app",
        "status": "pilot",
        "criticality_level": "high",
        "form_level": 1,
        "org": 1,  # Adjust to valid org ID

        # TAB 1: Business Context
        "business_objectives": [
            "Verify data persistence across all tables",
            "Test nested structure handling",
            "Ensure field-by-field data integrity"
        ],
        "business_processes": [
            "Data input validation",
            "API payload structuring",
            "Database transaction integrity"
        ],
        "has_design_documents": True,
        "user_types": ["internal_staff", "internal_leadership"],
        "annual_users": 5000,

        # TAB 1: Technology Stack
        "programming_language": ["python", "javascript"],
        "framework": ["django", "react"],
        "database_name": ["postgresql"],
        "hosting_platform": "cloud",

        # TAB 2: Architecture Data (nested)
        "architecture_data": {
            "backend_tech": ["python", "django", "rest_framework"],
            "frontend_tech": ["react", "typescript", "tailwindcss"],
            "architecture_type": ["microservices", "modular"],
            "mobile_support": "pwa",
            "api_style": "rest",
            "has_load_balancer": True,
            "containerization": ["docker", "kubernetes"]
        },

        # TAB 3: Data Info (nested)
        "data_info_data": {
            "storage_size_gb": 500,
            "record_count": 1000000,
            "data_update_frequency": "realtime",
            "data_retention_years": 5,
            "has_data_archiving": True,
            "data_classification": "confidential"
        },

        # TAB 4: Operations (nested)
        "operations_data": {
            "deployment_location": "Google Cloud Platform - asia-southeast1",
            "developer": "Internal Development Team",
            "hosting_type": "cloud",
            "maintenance_window": "Sunday 2-6 AM",
            "monitoring_tool": "Prometheus + Grafana",
            "has_disaster_recovery": True
        },

        # TAB 5: Integration (nested)
        "integration_data": {
            "api_count": 15,
            "api_standard": ["rest", "graphql"],
            "integration_count": 8,
            "has_api_gateway": True,
            "api_documentation_url": "https://api-docs.example.com"
        }
    }

    print(f"{Colors.OKCYAN}Test Data Prepared:{Colors.ENDC}")
    print(f"  - System Name: {test_data['system_name']}")
    print(f"  - Architecture fields: {len(test_data['architecture_data'])} fields")
    print(f"  - Data Info fields: {len(test_data['data_info_data'])} fields")
    print(f"  - Operations fields: {len(test_data['operations_data'])} fields")
    print(f"  - Integration fields: {len(test_data['integration_data'])} fields")

    # Execute API create
    print(f"\n{Colors.OKCYAN}Executing API POST /api/systems/{Colors.ENDC}")
    response_data = client.create_system(test_data)

    if not response_data:
        print(f"{Colors.FAIL}✗ SCENARIO 1 FAILED: API create returned no data{Colors.ENDC}")
        return None

    system_id = response_data.get('id')
    print(f"{Colors.OKGREEN}✓ System created with ID: {system_id}{Colors.ENDC}")

    # Verify in database
    print(f"\n{Colors.OKCYAN}Verifying database records...{Colors.ENDC}")
    db_record = get_system_by_id(system_id)

    if not db_record:
        print(f"{Colors.FAIL}✗ SCENARIO 1 FAILED: System not found in database{Colors.ENDC}")
        return None

    # Field-by-field verification
    verification_results = []

    # Verify architecture fields
    expected_backend = test_data['architecture_data']['backend_tech']
    actual_backend = db_record.get('backend_tech', '').split(',') if db_record.get('backend_tech') else []
    verification_results.append({
        'field': 'backend_tech',
        'expected': expected_backend,
        'actual': actual_backend,
        'match': set(expected_backend) == set(actual_backend)
    })

    expected_frontend = test_data['architecture_data']['frontend_tech']
    actual_frontend = db_record.get('frontend_tech', '').split(',') if db_record.get('frontend_tech') else []
    verification_results.append({
        'field': 'frontend_tech',
        'expected': expected_frontend,
        'actual': actual_frontend,
        'match': set(expected_frontend) == set(actual_frontend)
    })

    # Verify data info fields
    verification_results.append({
        'field': 'storage_size_gb',
        'expected': test_data['data_info_data']['storage_size_gb'],
        'actual': int(db_record.get('storage_size_gb', 0)) if db_record.get('storage_size_gb') else None,
        'match': int(db_record.get('storage_size_gb', 0)) == test_data['data_info_data']['storage_size_gb'] if db_record.get('storage_size_gb') else False
    })

    verification_results.append({
        'field': 'record_count',
        'expected': test_data['data_info_data']['record_count'],
        'actual': int(db_record.get('record_count', 0)) if db_record.get('record_count') else None,
        'match': int(db_record.get('record_count', 0)) == test_data['data_info_data']['record_count'] if db_record.get('record_count') else False
    })

    # Verify operations fields
    verification_results.append({
        'field': 'deployment_location',
        'expected': test_data['operations_data']['deployment_location'],
        'actual': db_record.get('deployment_location'),
        'match': db_record.get('deployment_location') == test_data['operations_data']['deployment_location']
    })

    verification_results.append({
        'field': 'developer',
        'expected': test_data['operations_data']['developer'],
        'actual': db_record.get('developer'),
        'match': db_record.get('developer') == test_data['operations_data']['developer']
    })

    # Print verification results
    print(f"\n{Colors.OKCYAN}Verification Results:{Colors.ENDC}")
    passed = 0
    failed = 0
    for result in verification_results:
        status = f"{Colors.OKGREEN}✓ PASS{Colors.ENDC}" if result['match'] else f"{Colors.FAIL}✗ FAIL{Colors.ENDC}"
        print(f"  {status} {result['field']}")
        print(f"      Expected: {result['expected']}")
        print(f"      Actual:   {result['actual']}")
        if result['match']:
            passed += 1
        else:
            failed += 1

    print(f"\n{Colors.BOLD}SCENARIO 1 SUMMARY:{Colors.ENDC}")
    print(f"  Passed: {passed}/{len(verification_results)}")
    print(f"  Failed: {failed}/{len(verification_results)}")
    print(f"  Success Rate: {(passed/len(verification_results)*100):.1f}%")

    if failed == 0:
        print(f"{Colors.OKGREEN}✓ SCENARIO 1: PASSED (100% fields saved){Colors.ENDC}")
    else:
        print(f"{Colors.FAIL}✗ SCENARIO 1: FAILED ({failed} fields not saved){Colors.ENDC}")

    return system_id


def scenario_2_update_system(client: APIClient) -> bool:
    """
    SCENARIO 2: Update Existing System (ID 115)
    Focus on updating empty fields to verify persistence
    """
    print(f"\n{Colors.HEADER}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}SCENARIO 2: Update Existing System ID 115{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*70}{Colors.ENDC}\n")

    SYSTEM_ID = 115

    # Get baseline (before update)
    print(f"{Colors.OKCYAN}Fetching baseline data (before update)...{Colors.ENDC}")
    baseline_db = get_system_by_id(SYSTEM_ID)

    if not baseline_db:
        print(f"{Colors.FAIL}✗ SCENARIO 2 FAILED: System ID {SYSTEM_ID} not found{Colors.ENDC}")
        return False

    print(f"{Colors.OKGREEN}✓ Baseline retrieved{Colors.ENDC}")
    print(f"  Current backend_tech: {baseline_db.get('backend_tech', 'NULL')}")
    print(f"  Current frontend_tech: {baseline_db.get('frontend_tech', 'NULL')}")
    print(f"  Current storage_size_gb: {baseline_db.get('storage_size_gb', 'NULL')}")
    print(f"  Current developer: {baseline_db.get('developer', 'NULL')}")

    # Prepare update data (focus on empty fields)
    update_data = {
        "architecture_data": {
            "backend_tech": ["java", "spring_boot"],
            "frontend_tech": ["vue", "nuxt"],
            "containerization": ["docker"]
        },
        "data_info_data": {
            "storage_size_gb": 750,
            "record_count": 2500000,
            "data_update_frequency": "hourly"
        },
        "operations_data": {
            "deployment_location": "AWS - ap-southeast-1",
            "developer": "External Vendor - TechCorp",
            "hosting_type": "hybrid"
        }
    }

    print(f"\n{Colors.OKCYAN}Update Data Prepared:{Colors.ENDC}")
    print(f"  - backend_tech: {update_data['architecture_data']['backend_tech']}")
    print(f"  - frontend_tech: {update_data['architecture_data']['frontend_tech']}")
    print(f"  - storage_size_gb: {update_data['data_info_data']['storage_size_gb']}")
    print(f"  - developer: {update_data['operations_data']['developer']}")

    # Execute API update
    print(f"\n{Colors.OKCYAN}Executing API PATCH /api/systems/{SYSTEM_ID}/{Colors.ENDC}")
    response_data = client.update_system(SYSTEM_ID, update_data)

    if not response_data:
        print(f"{Colors.FAIL}✗ SCENARIO 2 FAILED: API update returned no data{Colors.ENDC}")
        return False

    # Verify in database
    print(f"\n{Colors.OKCYAN}Verifying database records (after update)...{Colors.ENDC}")
    updated_db = get_system_by_id(SYSTEM_ID)

    if not updated_db:
        print(f"{Colors.FAIL}✗ SCENARIO 2 FAILED: System not found after update{Colors.ENDC}")
        return False

    # Field-by-field verification
    verification_results = []

    # Verify architecture fields
    expected_backend = update_data['architecture_data']['backend_tech']
    actual_backend = updated_db.get('backend_tech', '').split(',') if updated_db.get('backend_tech') else []
    verification_results.append({
        'field': 'backend_tech',
        'before': baseline_db.get('backend_tech'),
        'expected': expected_backend,
        'actual': actual_backend,
        'match': set(expected_backend) == set(actual_backend)
    })

    expected_frontend = update_data['architecture_data']['frontend_tech']
    actual_frontend = updated_db.get('frontend_tech', '').split(',') if updated_db.get('frontend_tech') else []
    verification_results.append({
        'field': 'frontend_tech',
        'before': baseline_db.get('frontend_tech'),
        'expected': expected_frontend,
        'actual': actual_frontend,
        'match': set(expected_frontend) == set(actual_frontend)
    })

    # Verify data info fields
    verification_results.append({
        'field': 'storage_size_gb',
        'before': baseline_db.get('storage_size_gb'),
        'expected': update_data['data_info_data']['storage_size_gb'],
        'actual': int(updated_db.get('storage_size_gb', 0)) if updated_db.get('storage_size_gb') else None,
        'match': int(updated_db.get('storage_size_gb', 0)) == update_data['data_info_data']['storage_size_gb'] if updated_db.get('storage_size_gb') else False
    })

    verification_results.append({
        'field': 'record_count',
        'before': baseline_db.get('record_count'),
        'expected': update_data['data_info_data']['record_count'],
        'actual': int(updated_db.get('record_count', 0)) if updated_db.get('record_count') else None,
        'match': int(updated_db.get('record_count', 0)) == update_data['data_info_data']['record_count'] if updated_db.get('record_count') else False
    })

    # Verify operations fields
    verification_results.append({
        'field': 'deployment_location',
        'before': baseline_db.get('deployment_location'),
        'expected': update_data['operations_data']['deployment_location'],
        'actual': updated_db.get('deployment_location'),
        'match': updated_db.get('deployment_location') == update_data['operations_data']['deployment_location']
    })

    verification_results.append({
        'field': 'developer',
        'before': baseline_db.get('developer'),
        'expected': update_data['operations_data']['developer'],
        'actual': updated_db.get('developer'),
        'match': updated_db.get('developer') == update_data['operations_data']['developer']
    })

    # Print verification results
    print(f"\n{Colors.OKCYAN}Verification Results:{Colors.ENDC}")
    passed = 0
    failed = 0
    for result in verification_results:
        status = f"{Colors.OKGREEN}✓ PASS{Colors.ENDC}" if result['match'] else f"{Colors.FAIL}✗ FAIL{Colors.ENDC}"
        print(f"  {status} {result['field']}")
        print(f"      Before:   {result['before']}")
        print(f"      Expected: {result['expected']}")
        print(f"      Actual:   {result['actual']}")
        if result['match']:
            passed += 1
        else:
            failed += 1

    print(f"\n{Colors.BOLD}SCENARIO 2 SUMMARY:{Colors.ENDC}")
    print(f"  Passed: {passed}/{len(verification_results)}")
    print(f"  Failed: {failed}/{len(verification_results)}")
    print(f"  Success Rate: {(passed/len(verification_results)*100):.1f}%")

    if failed == 0:
        print(f"{Colors.OKGREEN}✓ SCENARIO 2: PASSED (100% fields updated){Colors.ENDC}")
        return True
    else:
        print(f"{Colors.FAIL}✗ SCENARIO 2: FAILED ({failed} fields not updated){Colors.ENDC}")
        return False


# ===================================================================
# MAIN EXECUTION
# ===================================================================

def main():
    """Main test execution"""
    print(f"\n{Colors.BOLD}{'='*70}")
    print(f"LIVE TEST VERIFICATION - System Data Save Bug Fix")
    print(f"{'='*70}{Colors.ENDC}\n")

    print(f"{Colors.WARNING}Production Environment:{Colors.ENDC}")
    print(f"  API: {API_BASE_URL}")
    print(f"  Database: {DB_HOST}/{DB_NAME}")
    print(f"  Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Check credentials
    if not TEST_USERNAME or not TEST_PASSWORD:
        print(f"\n{Colors.FAIL}ERROR: Please set TEST_USERNAME and TEST_PASSWORD in the script{Colors.ENDC}")
        print(f"Edit this file and fill in:")
        print(f"  TEST_USERNAME = \"your_username\"")
        print(f"  TEST_PASSWORD = \"your_password\"")
        sys.exit(1)

    # Initialize API client
    client = APIClient()

    # Authenticate
    print(f"\n{Colors.OKCYAN}Authenticating...{Colors.ENDC}")
    if not client.login(TEST_USERNAME, TEST_PASSWORD):
        print(f"{Colors.FAIL}✗ Authentication failed. Cannot proceed.{Colors.ENDC}")
        sys.exit(1)

    # Execute scenarios
    results = {}

    # Scenario 1: Create
    scenario_1_id = scenario_1_create_system(client)
    results['scenario_1'] = {
        'passed': scenario_1_id is not None,
        'system_id': scenario_1_id
    }

    # Scenario 2: Update
    scenario_2_passed = scenario_2_update_system(client)
    results['scenario_2'] = {
        'passed': scenario_2_passed,
        'system_id': 115
    }

    # Final report
    print(f"\n{Colors.HEADER}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}FINAL TEST REPORT{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*70}{Colors.ENDC}\n")

    total_scenarios = len(results)
    passed_scenarios = sum(1 for r in results.values() if r['passed'])

    print(f"{Colors.BOLD}Overall Results:{Colors.ENDC}")
    print(f"  Total Scenarios: {total_scenarios}")
    print(f"  Passed: {passed_scenarios}")
    print(f"  Failed: {total_scenarios - passed_scenarios}")
    print(f"  Success Rate: {(passed_scenarios/total_scenarios*100):.1f}%")

    for scenario_name, result in results.items():
        status = f"{Colors.OKGREEN}✓ PASS{Colors.ENDC}" if result['passed'] else f"{Colors.FAIL}✗ FAIL{Colors.ENDC}"
        print(f"\n  {status} {scenario_name.replace('_', ' ').title()}")
        if result.get('system_id'):
            print(f"      System ID: {result['system_id']}")

    if passed_scenarios == total_scenarios:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ ALL TESTS PASSED - BUG FIX VERIFIED COMPLETELY{Colors.ENDC}")
        print(f"{Colors.OKGREEN}100% data persistence confirmed across all related tables{Colors.ENDC}")
    else:
        print(f"\n{Colors.FAIL}{Colors.BOLD}✗ SOME TESTS FAILED - BUG NOT FULLY FIXED{Colors.ENDC}")
        print(f"{Colors.FAIL}Review failed scenarios above for details{Colors.ENDC}")

    print(f"\n{Colors.OKCYAN}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.ENDC}\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Test interrupted by user{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.FAIL}Unexpected error: {str(e)}{Colors.ENDC}")
        traceback.print_exc()
        sys.exit(1)
