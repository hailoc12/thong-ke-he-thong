#!/usr/bin/env python3
"""
Test API pagination to verify Excel export gets all data
"""
import requests
import json

BASE_URL = "https://hientrangcds.mst.gov.vn/api"

# Step 1: Login as admin
print("=== Step 1: Login ===")
login_data = {
    "username": "admin",
    "password": "admin123"
}
response = requests.post(f"{BASE_URL}/accounts/login/", json=login_data)
if response.status_code != 200:
    print(f"Login failed: {response.status_code}")
    print(response.text)
    exit(1)

token = response.json()["access"]
print(f"✓ Login successful, got token")

headers = {
    "Authorization": f"Bearer {token}"
}

# Step 2: Test systems endpoint with page_size=1000
print("\n=== Step 2: Fetch systems with page_size=1000 ===")
response = requests.get(f"{BASE_URL}/systems/?page_size=1000", headers=headers)
if response.status_code != 200:
    print(f"Failed to fetch systems: {response.status_code}")
    print(response.text)
    exit(1)

data = response.json()
print(f"Count: {data.get('count')}")
print(f"Results returned: {len(data.get('results', []))}")
print(f"Next page: {data.get('next')}")
print(f"Previous page: {data.get('previous')}")

# Step 3: Test completion_stats endpoint with page_size=1000
print("\n=== Step 3: Fetch completion_stats with page_size=1000 ===")
response = requests.get(f"{BASE_URL}/systems/completion_stats/?page_size=1000", headers=headers)
if response.status_code != 200:
    print(f"Failed to fetch completion_stats: {response.status_code}")
    print(response.text)
    exit(1)

data = response.json()
print(f"Total systems in completion_stats: {data.get('count')}")
print(f"Systems in results: {len(data.get('results', []))}")
print(f"Organizations in summary: {len(data.get('summary', {}).get('organizations', []))}")

# Step 4: Test organizations endpoint
print("\n=== Step 4: Fetch organizations with page_size=1000 ===")
response = requests.get(f"{BASE_URL}/organizations/?page_size=1000", headers=headers)
if response.status_code != 200:
    print(f"Failed to fetch organizations: {response.status_code}")
    print(response.text)
    exit(1)

data = response.json()
print(f"Total organizations: {data.get('count')}")
print(f"Organizations returned: {len(data.get('results', []))}")

print("\n=== Summary ===")
print("If all numbers match expected totals, pagination is working correctly.")
print("Expected: ~77 systems, ~70 organizations")
