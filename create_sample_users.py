#!/usr/bin/env python3
"""
Create sample organization users
"""

from apps.accounts.models import User
from apps.organizations.models import Organization

# Get all organizations
orgs = Organization.objects.all()

if orgs.count() == 0:
    print("No organizations found! Please create organizations first.")
    exit(1)

print(f"Found {orgs.count()} organizations")
print("")

sample_users = []

for i, org in enumerate(orgs, 1):
    username = f"org{i}"
    email = f"org{i}@example.com"
    password = "Test1234!"

    # Check if user exists
    if User.objects.filter(username=username).exists():
        print(f"❌ User {username} already exists")
        continue

    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role='org_user',
        organization=org,
        first_name=f"User",
        last_name=f"{org.code}",
        is_active=True
    )

    sample_users.append({
        'username': username,
        'email': email,
        'password': password,
        'organization': org.name,
        'org_code': org.code
    })

    print(f"✓ Created user: {username} for {org.name} ({org.code})")

print("")
print("=" * 60)
print("SAMPLE ORGANIZATION USER ACCOUNTS")
print("=" * 60)

for user in sample_users:
    print(f"""
Organization: {user['organization']} ({user['org_code']})
  Username:   {user['username']}
  Email:      {user['email']}
  Password:   {user['password']}
  URL:        https://thongkehethong.mindmaid.ai/login
""")

print("=" * 60)
print(f"Total created: {len(sample_users)} users")
print("=" * 60)
