#!/usr/bin/env python3
"""
Live Test: "Other" Option Fix - COMPREHENSIVE
Test ALL fields that now accept "other" value
Date: 2026-01-27
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"
PASSWORD = "admin123"

# Colors
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'

def log_info(msg):
    print(f"{GREEN}✓{NC} {msg}")

def log_error(msg):
    print(f"{RED}✗{NC} {msg}")

def log_warn(msg):
    print(f"{YELLOW}!{NC} {msg}")

def log_test(msg):
    print(f"{BLUE}▶{NC} {msg}")

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_system_ids = []

    def login(self):
        """Login and get token"""
        log_test("Logging in...")
        response = self.session.post(
            f"{BASE_URL}/accounts/login/",
            json={"username": USERNAME, "password": PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data['token']
            self.session.headers.update({'Authorization': f'Token {self.token}'})
            log_info(f"Logged in as {data['user']['username']}")
            return True
        else:
            log_error(f"Login failed: {response.text}")
            return False

    def get_first_org(self):
        """Get first organization ID"""
        log_test("Getting organization...")
        response = self.session.get(f"{BASE_URL}/organizations/")
        if response.status_code == 200:
            orgs = response.json()
            if orgs:
                org_id = orgs[0]['id']
                log_info(f"Using organization: {orgs[0]['name']} (ID: {org_id})")
                return org_id
        log_error("Failed to get organization")
        return None

    def test_system_fields(self, org_id):
        """Test 1: System model fields with 'other'"""
        log_test("\n🔹 Test 1: System.hosting_platform = 'other'")

        payload = {
            "org": org_id,
            "system_name": f"Test-System-hosting-{datetime.now().strftime('%H%M%S')}",
            "scope": "internal_unit",
            "hosting_platform": "other",
            "form_level": 1
        }

        response = self.session.post(f"{BASE_URL}/systems/", json=payload)

        if response.status_code == 201:
            data = response.json()
            self.test_system_ids.append(data['id'])
            log_info(f"✅ PASS: hosting_platform='other' → ID {data['id']}")
            return True
        else:
            log_error(f"❌ FAIL: {response.status_code} - {response.text[:200]}")
            return False

    def test_architecture_fields(self, org_id):
        """Test 2-3: SystemArchitecture fields with 'other'"""
        results = []

        # Test 2: database_model
        log_test("\n🔹 Test 2: SystemArchitecture.database_model = 'other'")
        payload = {
            "org": org_id,
            "system_name": f"Test-Arch-DB-{datetime.now().strftime('%H%M%S')}",
            "scope": "internal_unit",
            "form_level": 1,
            "architecture_data": {
                "database_model": "other"
            }
        }
        response = self.session.post(f"{BASE_URL}/systems/", json=payload)
        if response.status_code == 201:
            data = response.json()
            self.test_system_ids.append(data['id'])
            log_info(f"✅ PASS: database_model='other' → ID {data['id']}")
            results.append(True)
        else:
            log_error(f"❌ FAIL: {response.status_code} - {response.text[:200]}")
            results.append(False)

        # Test 3: mobile_app
        log_test("\n🔹 Test 3: SystemArchitecture.mobile_app = 'other'")
        payload = {
            "org": org_id,
            "system_name": f"Test-Arch-Mobile-{datetime.now().strftime('%H%M%S')}",
            "scope": "internal_unit",
            "form_level": 1,
            "architecture_data": {
                "mobile_app": "other"
            }
        }
        response = self.session.post(f"{BASE_URL}/systems/", json=payload)
        if response.status_code == 201:
            data = response.json()
            self.test_system_ids.append(data['id'])
            log_info(f"✅ PASS: mobile_app='other' → ID {data['id']}")
            results.append(True)
        else:
            log_error(f"❌ FAIL: {response.status_code} - {response.text[:200]}")
            results.append(False)

        return all(results)

    def test_operations_fields(self, org_id):
        """Test 4-7: SystemOperations fields with 'other'"""
        results = []

        log_test("\n🔹 Test 4-7: SystemOperations fields with 'other'")

        payload = {
            "org": org_id,
            "system_name": f"Test-Ops-All-{datetime.now().strftime('%H%M%S')}",
            "scope": "internal_unit",
            "form_level": 1,
            "operations_data": {
                "dev_type": "other",
                "warranty_status": "other",
                "vendor_dependency": "other",
                "deployment_location": "other",
                "compute_type": "other"
            }
        }

        response = self.session.post(f"{BASE_URL}/systems/", json=payload)
        if response.status_code == 201:
            data = response.json()
            self.test_system_ids.append(data['id'])
            ops = data.get('operations', {})

            # Verify each field
            fields = ['dev_type', 'warranty_status', 'vendor_dependency', 'deployment_location', 'compute_type']
            for field in fields:
                value = ops.get(field)
                if value == 'other':
                    log_info(f"✅ PASS: operations.{field}='other'")
                    results.append(True)
                else:
                    log_error(f"❌ FAIL: operations.{field}='{value}' (expected 'other')")
                    results.append(False)
        else:
            log_error(f"❌ FAIL: {response.status_code} - {response.text[:200]}")
            return False

        return all(results)

    def test_update_all_fields(self, org_id):
        """Test 8: Update existing system with all 'other' options"""
        log_test("\n🔹 Test 8: Update system with ALL 'other' options")

        # Create a system first
        payload = {
            "org": org_id,
            "system_name": f"Test-Update-All-{datetime.now().strftime('%H%M%S')}",
            "scope": "internal_unit",
            "form_level": 1
        }
        response = self.session.post(f"{BASE_URL}/systems/", json=payload)
        if response.status_code != 201:
            log_error("Failed to create test system for update")
            return False

        system_id = response.json()['id']
        self.test_system_ids.append(system_id)

        # Update with all 'other' values
        update_payload = {
            "hosting_platform": "other",
            "architecture_data": {
                "database_model": "other",
                "mobile_app": "other"
            },
            "operations_data": {
                "dev_type": "other",
                "warranty_status": "other",
                "vendor_dependency": "other",
                "deployment_location": "other",
                "compute_type": "other"
            }
        }

        response = self.session.patch(f"{BASE_URL}/systems/{system_id}/", json=update_payload)
        if response.status_code == 200:
            log_info(f"✅ PASS: All fields updated to 'other' → System {system_id}")
            return True
        else:
            log_error(f"❌ FAIL: {response.status_code} - {response.text[:200]}")
            return False

    def cleanup(self):
        """Delete all test systems"""
        if self.test_system_ids:
            log_test(f"\n🧹 Cleaning up {len(self.test_system_ids)} test systems...")
            for system_id in self.test_system_ids:
                response = self.session.delete(f"{BASE_URL}/systems/{system_id}/")
                if response.status_code == 204:
                    log_info(f"Deleted system {system_id}")
                else:
                    log_warn(f"Could not delete system {system_id}")

def main():
    print("=" * 70)
    print("Live Test: 'Other' Option Fix - COMPREHENSIVE TEST")
    print("=" * 70)
    print("\nTesting 8 fields across 3 models:")
    print("  • System: hosting_platform")
    print("  • SystemArchitecture: database_model, mobile_app")
    print("  • SystemOperations: dev_type, warranty_status, vendor_dependency,")
    print("                      deployment_location, compute_type")
    print()

    tester = APITester()

    # Login
    if not tester.login():
        return False

    # Get organization
    org_id = tester.get_first_org()
    if not org_id:
        return False

    # Run tests
    results = []
    results.append(tester.test_system_fields(org_id))
    results.append(tester.test_architecture_fields(org_id))
    results.append(tester.test_operations_fields(org_id))
    results.append(tester.test_update_all_fields(org_id))

    # Cleanup
    tester.cleanup()

    # Summary
    print("\n" + "=" * 70)
    print("Test Summary")
    print("=" * 70)
    passed = sum(results)
    total = len(results)

    if passed == total:
        log_info(f"✅ ALL TESTS PASSED ({passed}/{total})")
        print()
        log_info("🎉 All 8 fields now accept 'other' option correctly!")
        return True
    else:
        log_error(f"❌ SOME TESTS FAILED ({passed}/{total} passed)")
        return False

if __name__ == "__main__":
    import sys
    sys.exit(0 if main() else 1)
