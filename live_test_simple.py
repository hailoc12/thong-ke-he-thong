#!/usr/bin/env python3
"""
SIMPLIFIED Live Test Verification - System Data Save Bug Fix

This simplified version verifies data persistence by:
1. Creating/updating via API
2. Retrieving via API immediately after
3. Comparing request payload with response data

No direct database access required - uses API-only verification.

Usage:
    python3 live_test_simple.py
"""

import requests
import json
from datetime import datetime
from typing import Dict, Optional, List, Any


# ===================================================================
# CONFIGURATION
# ===================================================================

API_BASE_URL = "https://hientrangcds.mst.gov.vn/api"

# Test credentials - FILL THESE IN
USERNAME = ""  # Your admin or org_user username
PASSWORD = ""  # Your password
ORG_ID = 1     # Organization ID (for creating systems)

# Colors for terminal output
class C:
    H = '\033[95m'  # Header
    B = '\033[94m'  # Blue
    G = '\033[92m'  # Green
    Y = '\033[93m'  # Yellow
    R = '\033[91m'  # Red
    E = '\033[0m'   # End
    BOLD = '\033[1m'


# ===================================================================
# API CLIENT
# ===================================================================

class TestAPI:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.base = API_BASE_URL

    def login(self, username: str, password: str) -> bool:
        """Login and get JWT token"""
        try:
            print(f"{C.B}Logging in as: {username}{C.E}")
            r = self.session.post(
                f"{self.base}/auth/login/",
                json={"username": username, "password": password},
                timeout=30
            )

            if r.status_code == 200:
                self.token = r.json()['access']
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                print(f"{C.G}✓ Login successful{C.E}")
                return True
            else:
                print(f"{C.R}✗ Login failed: {r.status_code} - {r.text}{C.E}")
                return False
        except Exception as e:
            print(f"{C.R}✗ Login error: {e}{C.E}")
            return False

    def create_system(self, data: Dict) -> Optional[Dict]:
        """POST /api/systems/"""
        try:
            r = self.session.post(f"{self.base}/systems/", json=data, timeout=30)
            if r.status_code in [200, 201]:
                return r.json()
            else:
                print(f"{C.R}✗ Create failed: {r.status_code} - {r.text}{C.E}")
                return None
        except Exception as e:
            print(f"{C.R}✗ Create error: {e}{C.E}")
            return None

    def update_system(self, system_id: int, data: Dict) -> Optional[Dict]:
        """PATCH /api/systems/{id}/"""
        try:
            r = self.session.patch(f"{self.base}/systems/{system_id}/", json=data, timeout=30)
            if r.status_code == 200:
                return r.json()
            else:
                print(f"{C.R}✗ Update failed: {r.status_code} - {r.text}{C.E}")
                return None
        except Exception as e:
            print(f"{C.R}✗ Update error: {e}{C.E}")
            return None

    def get_system(self, system_id: int) -> Optional[Dict]:
        """GET /api/systems/{id}/"""
        try:
            r = self.session.get(f"{self.base}/systems/{system_id}/", timeout=30)
            if r.status_code == 200:
                return r.json()
            else:
                print(f"{C.R}✗ Get failed: {r.status_code} - {r.text}{C.E}")
                return None
        except Exception as e:
            print(f"{C.R}✗ Get error: {e}{C.E}")
            return None


# ===================================================================
# VERIFICATION HELPERS
# ===================================================================

def verify_field(field_name: str, expected: Any, actual: Any, parent: str = "") -> bool:
    """Compare expected vs actual field value"""
    full_name = f"{parent}.{field_name}" if parent else field_name

    # Handle array comparisons
    if isinstance(expected, list):
        # API might return comma-separated string for some fields
        if isinstance(actual, str):
            actual = [x.strip() for x in actual.split(',') if x.strip()]
        elif isinstance(actual, list):
            pass
        else:
            actual = []

        match = set(expected) == set(actual)
    else:
        match = expected == actual

    status = f"{C.G}✓{C.E}" if match else f"{C.R}✗{C.E}"
    print(f"  {status} {full_name}")
    if not match:
        print(f"      Expected: {expected}")
        print(f"      Actual:   {actual}")

    return match


def verify_nested_data(expected_data: Dict, response_data: Dict, parent_key: str) -> List[bool]:
    """Verify nested object data (e.g., architecture_data -> architecture)"""
    results = []

    # Response uses singular form without _data suffix
    response_key = parent_key.replace('_data', '')
    response_nested = response_data.get(response_key)

    if not response_nested:
        print(f"  {C.R}✗ No {response_key} found in response{C.E}")
        return [False]

    for field, expected_value in expected_data.items():
        actual_value = response_nested.get(field)
        match = verify_field(field, expected_value, actual_value, parent=parent_key)
        results.append(match)

    return results


# ===================================================================
# TEST SCENARIOS
# ===================================================================

def scenario_1_create(api: TestAPI) -> Optional[int]:
    """Test: Create new system with comprehensive data"""
    print(f"\n{C.H}{'='*70}{C.E}")
    print(f"{C.H}SCENARIO 1: Create New System{C.E}")
    print(f"{C.H}{'='*70}{C.E}\n")

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    test_data = {
        # Basic info
        "system_name": f"LIVE_TEST_CREATE_{timestamp}",
        "system_name_en": f"Live Test Create {timestamp}",
        "purpose": "Verify data save bug fix - comprehensive create test",
        "scope": "internal_unit",
        "system_group": "business_app",
        "status": "pilot",
        "criticality_level": "high",
        "form_level": 1,
        "org": ORG_ID,

        # Business context
        "business_objectives": ["Test data persistence", "Verify API structure"],
        "has_design_documents": True,
        "user_types": ["internal_staff"],
        "annual_users": 1000,

        # Technology
        "programming_language": ["python", "javascript"],
        "framework": ["django", "react"],
        "database_name": ["postgresql"],
        "hosting_platform": "cloud",

        # NESTED: Architecture
        "architecture_data": {
            "backend_tech": ["python", "django"],
            "frontend_tech": ["react", "typescript"],
            "architecture_type": ["microservices"],
            "mobile_support": "pwa",
            "api_style": "rest",
            "has_load_balancer": True,
            "containerization": ["docker"]
        },

        # NESTED: Data Info
        "data_info_data": {
            "storage_size_gb": 500,
            "record_count": 1000000,
            "data_update_frequency": "realtime",
            "data_retention_years": 5,
            "has_data_archiving": True
        },

        # NESTED: Operations
        "operations_data": {
            "deployment_location": "GCP asia-southeast1",
            "developer": "Internal Dev Team",
            "hosting_type": "cloud",
            "maintenance_window": "Sunday 2-6AM",
            "has_disaster_recovery": True
        },

        # NESTED: Integration
        "integration_data": {
            "api_count": 10,
            "api_standard": ["rest"],
            "integration_count": 5,
            "has_api_gateway": True
        }
    }

    print(f"{C.B}Creating system with data in 4 nested tables...{C.E}")
    print(f"  - system_name: {test_data['system_name']}")
    print(f"  - architecture_data: {len(test_data['architecture_data'])} fields")
    print(f"  - data_info_data: {len(test_data['data_info_data'])} fields")
    print(f"  - operations_data: {len(test_data['operations_data'])} fields")
    print(f"  - integration_data: {len(test_data['integration_data'])} fields")

    # Create
    response = api.create_system(test_data)
    if not response:
        print(f"{C.R}✗ SCENARIO 1 FAILED: API create returned no data{C.E}")
        return None

    system_id = response.get('id')
    print(f"{C.G}✓ System created: ID {system_id}{C.E}")

    # Retrieve immediately to verify
    print(f"\n{C.B}Retrieving system to verify data...{C.E}")
    retrieved = api.get_system(system_id)

    if not retrieved:
        print(f"{C.R}✗ SCENARIO 1 FAILED: Cannot retrieve system{C.E}")
        return None

    # Verify fields
    print(f"\n{C.B}Verifying data persistence:{C.E}")

    all_results = []

    # Verify basic fields
    all_results.append(verify_field("system_name", test_data["system_name"], retrieved.get("system_name")))
    all_results.append(verify_field("purpose", test_data["purpose"], retrieved.get("purpose")))
    all_results.append(verify_field("annual_users", test_data["annual_users"], retrieved.get("annual_users")))

    # Verify nested data
    print(f"\n{C.B}Architecture data:{C.E}")
    all_results.extend(verify_nested_data(test_data["architecture_data"], retrieved, "architecture_data"))

    print(f"\n{C.B}Data info:{C.E}")
    all_results.extend(verify_nested_data(test_data["data_info_data"], retrieved, "data_info_data"))

    print(f"\n{C.B}Operations data:{C.E}")
    all_results.extend(verify_nested_data(test_data["operations_data"], retrieved, "operations_data"))

    print(f"\n{C.B}Integration data:{C.E}")
    all_results.extend(verify_nested_data(test_data["integration_data"], retrieved, "integration_data"))

    # Summary
    passed = sum(all_results)
    total = len(all_results)
    success_rate = (passed / total * 100) if total > 0 else 0

    print(f"\n{C.BOLD}SCENARIO 1 SUMMARY:{C.E}")
    print(f"  Total fields verified: {total}")
    print(f"  Passed: {passed} ({success_rate:.1f}%)")
    print(f"  Failed: {total - passed}")

    if passed == total:
        print(f"{C.G}{C.BOLD}✓ SCENARIO 1 PASSED (100% data saved){C.E}")
    else:
        print(f"{C.R}{C.BOLD}✗ SCENARIO 1 FAILED ({total - passed} fields missing){C.E}")

    return system_id if passed == total else None


def scenario_2_update(api: TestAPI) -> bool:
    """Test: Update existing system (ID 115)"""
    print(f"\n{C.H}{'='*70}{C.E}")
    print(f"{C.H}SCENARIO 2: Update Existing System (ID 115){C.E}")
    print(f"{C.H}{'='*70}{C.E}\n")

    SYSTEM_ID = 115

    # Get baseline
    print(f"{C.B}Getting baseline (before update)...{C.E}")
    baseline = api.get_system(SYSTEM_ID)

    if not baseline:
        print(f"{C.R}✗ SCENARIO 2 FAILED: Cannot get system {SYSTEM_ID}{C.E}")
        return False

    print(f"{C.G}✓ Baseline retrieved{C.E}")

    # Show current values
    current_arch = baseline.get('architecture', {})
    current_data = baseline.get('data_info', {})
    current_ops = baseline.get('operations', {})

    print(f"\n{C.B}Current values:{C.E}")
    print(f"  backend_tech: {current_arch.get('backend_tech', 'NULL')}")
    print(f"  frontend_tech: {current_arch.get('frontend_tech', 'NULL')}")
    print(f"  storage_size_gb: {current_data.get('storage_size_gb', 'NULL')}")
    print(f"  developer: {current_ops.get('developer', 'NULL')}")

    # Prepare updates
    update_data = {
        "architecture_data": {
            "backend_tech": ["java", "spring_boot"],
            "frontend_tech": ["vue", "nuxt"],
            "containerization": ["docker", "kubernetes"]
        },
        "data_info_data": {
            "storage_size_gb": 800,
            "record_count": 3000000,
            "data_update_frequency": "hourly"
        },
        "operations_data": {
            "deployment_location": "AWS ap-southeast-1",
            "developer": "External Vendor - TechCorp",
            "hosting_type": "hybrid"
        }
    }

    print(f"\n{C.B}Updating system...{C.E}")
    updated_response = api.update_system(SYSTEM_ID, update_data)

    if not updated_response:
        print(f"{C.R}✗ SCENARIO 2 FAILED: Update API call failed{C.E}")
        return False

    print(f"{C.G}✓ Update API call successful{C.E}")

    # Retrieve to verify
    print(f"\n{C.B}Retrieving updated system...{C.E}")
    updated = api.get_system(SYSTEM_ID)

    if not updated:
        print(f"{C.R}✗ SCENARIO 2 FAILED: Cannot retrieve after update{C.E}")
        return False

    # Verify updates
    print(f"\n{C.B}Verifying updates:{C.E}")

    all_results = []

    print(f"\n{C.B}Architecture updates:{C.E}")
    all_results.extend(verify_nested_data(update_data["architecture_data"], updated, "architecture_data"))

    print(f"\n{C.B}Data info updates:{C.E}")
    all_results.extend(verify_nested_data(update_data["data_info_data"], updated, "data_info_data"))

    print(f"\n{C.B}Operations updates:{C.E}")
    all_results.extend(verify_nested_data(update_data["operations_data"], updated, "operations_data"))

    # Summary
    passed = sum(all_results)
    total = len(all_results)
    success_rate = (passed / total * 100) if total > 0 else 0

    print(f"\n{C.BOLD}SCENARIO 2 SUMMARY:{C.E}")
    print(f"  Total fields verified: {total}")
    print(f"  Passed: {passed} ({success_rate:.1f}%)")
    print(f"  Failed: {total - passed}")

    if passed == total:
        print(f"{C.G}{C.BOLD}✓ SCENARIO 2 PASSED (100% updates saved){C.E}")
        return True
    else:
        print(f"{C.R}{C.BOLD}✗ SCENARIO 2 FAILED ({total - passed} fields not updated){C.E}")
        return False


# ===================================================================
# MAIN
# ===================================================================

def main():
    print(f"\n{C.BOLD}{'='*70}")
    print(f"LIVE TEST VERIFICATION - System Data Save Bug Fix")
    print(f"Simplified Version (API-only verification)")
    print(f"{'='*70}{C.E}\n")

    print(f"{C.Y}Production Environment:{C.E}")
    print(f"  API: {API_BASE_URL}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Check credentials
    if not USERNAME or not PASSWORD:
        print(f"\n{C.R}ERROR: Please set USERNAME and PASSWORD in the script{C.E}")
        print(f"Edit this file and fill in:")
        print(f'  USERNAME = "your_username"')
        print(f'  PASSWORD = "your_password"')
        print(f'  ORG_ID = 1  # Your organization ID')
        return

    # Create API client
    api = TestAPI()

    # Login
    print(f"\n{C.B}Authenticating...{C.E}")
    if not api.login(USERNAME, PASSWORD):
        print(f"{C.R}✗ Authentication failed. Cannot proceed.{C.E}")
        return

    # Run scenarios
    results = {}

    # Scenario 1
    s1_result = scenario_1_create(api)
    results['scenario_1'] = {
        'passed': s1_result is not None,
        'system_id': s1_result
    }

    # Scenario 2
    s2_result = scenario_2_update(api)
    results['scenario_2'] = {
        'passed': s2_result,
        'system_id': 115
    }

    # Final report
    print(f"\n{C.H}{'='*70}{C.E}")
    print(f"{C.H}FINAL TEST REPORT{C.E}")
    print(f"{C.H}{'='*70}{C.E}\n")

    total = len(results)
    passed = sum(1 for r in results.values() if r['passed'])

    print(f"{C.BOLD}Overall Results:{C.E}")
    print(f"  Total Scenarios: {total}")
    print(f"  Passed: {passed}")
    print(f"  Failed: {total - passed}")
    print(f"  Success Rate: {(passed/total*100):.1f}%")

    for name, result in results.items():
        status = f"{C.G}✓ PASS{C.E}" if result['passed'] else f"{C.R}✗ FAIL{C.E}"
        scenario_name = name.replace('_', ' ').upper()
        print(f"\n  {status} {scenario_name}")
        if result.get('system_id'):
            print(f"      System ID: {result['system_id']}")

    if passed == total:
        print(f"\n{C.G}{C.BOLD}✓✓✓ ALL TESTS PASSED - BUG FIX VERIFIED ✓✓✓{C.E}")
        print(f"{C.G}100% data persistence confirmed{C.E}")
    else:
        print(f"\n{C.R}{C.BOLD}✗✗✗ TESTS FAILED - BUG NOT FULLY FIXED ✗✗✗{C.E}")
        print(f"{C.R}Review failed scenarios above{C.E}")

    print(f"\n{C.B}Test completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{C.E}\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{C.Y}Test interrupted{C.E}")
    except Exception as e:
        print(f"\n{C.R}Error: {e}{C.E}")
        import traceback
        traceback.print_exc()
